(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(window.location.search);
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var pad3 = function (n) { return String(Math.round(n)).padStart(3, '0'); };

  /* ---------------------------------------------------------
     boot
     --------------------------------------------------------- */
  var booted = false;
  function startSite() {
    if (booted) return;
    booted = true;
    root.classList.add('booted');
    root.classList.add('ready');
  }

  if (window.TachyonIntro) {
    window.TachyonIntro.run({
      skip: params.get('nointro') === '1' || params.has('p'),
      onReveal: startSite,
      onDone: startSite
    });
  } else {
    startSite();
  }

  /* ---------------------------------------------------------
     field
     --------------------------------------------------------- */
  var canvas = document.getElementById('field');
  var field = null;
  if (canvas && window.TachyonField) {
    field = window.TachyonField.init(canvas, {
      count: 1500,
      accentEvery: 101,
      reducedMotion: reduce
    });
  }

  var pointer = { x: 0.5, y: 0.45 };
  /* Only arm the proximity starburst for a real mouse on a wide viewport.
     Touch and small screens keep the field as a quiet backdrop. */
  var finePointer = window.matchMedia && window.matchMedia('(pointer:fine)').matches;
  if (field && finePointer && window.innerWidth > 900) {
    field.setPointer(pointer.x, pointer.y);
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    pointer.x = e.clientX / window.innerWidth;
    pointer.y = e.clientY / window.innerHeight;
    if (field) field.setPointer(pointer.x, pointer.y);
  }, { passive: true });

  /* ---------------------------------------------------------
     clock — Perth
     --------------------------------------------------------- */
  var clockEl = document.getElementById('clock');
  if (clockEl) {
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Australia/Perth',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (err) {
      fmt = null;
    }
    var tickClock = function () {
      var d = new Date();
      clockEl.textContent = fmt ? fmt.format(d) : d.toTimeString().slice(0, 8);
    };
    tickClock();
    window.setInterval(tickClock, 1000);
  }

  /* ---------------------------------------------------------
     scroll state
     --------------------------------------------------------- */
  var meterFill = document.getElementById('meterFill');
  var meterNum = document.getElementById('meterNum');
  var deckPct = document.getElementById('deckPct');
  var identity = document.getElementById('identity');
  var statementLines = Array.prototype.slice.call(document.querySelectorAll('.statement__line[data-line]'));
  var lastGlobal = 0;

  function scrollProgress() {
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return clamp(window.scrollY / max, 0, 1);
  }

  function identityProgress() {
    if (!identity) return 0;
    var r = identity.getBoundingClientRect();
    var range = Math.max(1, r.height - window.innerHeight);
    return clamp(-r.top / range, 0, 1);
  }

  function updateScroll() {
    var p = scrollProgress();
    lastGlobal = p;

    if (meterFill) meterFill.style.height = (p * 100) + '%';
    if (meterNum) meterNum.textContent = pad3(p * 100);
    if (deckPct) deckPct.textContent = pad3(p * 100);
    if (field) field.setScroll(p);

    if (identity && !reduce) {
      var ip = identityProgress();
      /* Non-negative shear only: lines drift right, never out of the left
         edge. Max 5% of the statement width keeps the longest line in frame. */
      var wide = window.innerWidth > 900;
      var x = wide ? [ip * 5, ip * 2, 0, 0] : [0, 0, 0, 0];
      var y = [-ip * 12, ip * 5, -ip * 3, ip * 14];
      statementLines.forEach(function (el, i) {
        el.style.transform = 'translate3d(' + x[i].toFixed(2) + '%,' + y[i].toFixed(2) + 'px,0)';
      });
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      updateScroll();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateScroll();

  /* ---------------------------------------------------------
     section observer — rail, shapes, visibility
     --------------------------------------------------------- */
  var shapes = {
    cover: 'plane',
    identity: 'cone',
    method: 'sphere',
    index: 'torus',
    evidence: 'plane',
    uplink: 'cone'
  };
  var railLinks = Array.prototype.slice.call(document.querySelectorAll('.rail a'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section'));
  var methodVisible = false;
  var lastShape = 'plane';

  function setActive(id) {
    railLinks.forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-sec') === id);
    });
    methodVisible = id === 'method';
    var shape = shapes[id];
    if (field && shape && shape !== lastShape) {
      lastShape = shape;
      field.setShape(shape);
    }
  }

  if ('IntersectionObserver' in window) {
    var secObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(function (s) { secObserver.observe(s); });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    Array.prototype.slice.call(document.querySelectorAll('.identity,.method,.index,.evidence,.uplink'))
      .forEach(function (s) { revealObserver.observe(s); });
  } else {
    sections.forEach(function (s) { s.classList.add('in'); });
  }

  /* ---------------------------------------------------------
     method readout
     --------------------------------------------------------- */
  var STEPS = [
    {
      title: 'Capture',
      body: 'Every correction, file and decision becomes a trace. It is written to the device, not to a request log.',
      state: 'On device',
      meta: [['Storage', 'Local SSD'], ['Egress', '0 bytes']]
    },
    {
      title: 'Curate',
      body: 'Traces are scored, deduplicated and bounded. Junk is dropped before it can be learned.',
      state: 'Before training',
      meta: [['Scoring', 'Deterministic'], ['Retention', 'Bounded']]
    },
    {
      title: 'Train',
      body: 'An overnight adapter run against a frozen base. The base weights never change.',
      state: 'Overnight',
      meta: [['Base', 'Frozen'], ['Adapter', 'Per user']]
    },
    {
      title: 'Delete',
      body: 'Destroy the trace key. The ciphertext becomes unreadable. The adapter is quarantined. This is an inventory operation, not a policy.',
      state: '< 60 seconds',
      meta: [['Operation', 'Key destruction'], ['Receipt', 'Signed']]
    }
  ];

  var stepButtons = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var stepIndexEl = document.getElementById('stepIndex');
  var stepStateEl = document.getElementById('stepState');
  var stepTitleEl = document.getElementById('stepTitle');
  var stepBodyEl = document.getElementById('stepBody');
  var stepMetaEl = document.getElementById('stepMeta');
  var loopNodes = Array.prototype.slice.call(document.querySelectorAll('.loop__node'));
  var step = 0;
  var stepTouched = false;

  function setStep(i, pulse) {
    step = ((i % STEPS.length) + STEPS.length) % STEPS.length;
    var data = STEPS[step];
    if (stepIndexEl) stepIndexEl.textContent = 'Step 0' + (step + 1) + ' / 04';
    if (stepStateEl) stepStateEl.textContent = data.state;
    if (stepTitleEl) stepTitleEl.textContent = data.title;
    if (stepBodyEl) stepBodyEl.textContent = data.body;
    if (stepMetaEl) {
      stepMetaEl.innerHTML = '';
      data.meta.forEach(function (pair) {
        var li = document.createElement('li');
        var a = document.createElement('span');
        var b = document.createElement('b');
        a.textContent = pair[0];
        b.textContent = pair[1];
        li.appendChild(a);
        li.appendChild(b);
        stepMetaEl.appendChild(li);
      });
    }
    stepButtons.forEach(function (btn, n) {
      var on = n === step;
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    loopNodes.forEach(function (node, n) {
      node.classList.toggle('on', n === step);
    });
    if (pulse && field) field.pulse(0.22);
  }

  stepButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      stepTouched = true;
      setStep(Number(btn.getAttribute('data-step')), true);
    });
    btn.addEventListener('pointerenter', function () {
      /* hover previews, but does not stop the sequence */
      if (!stepTouched) setStep(Number(btn.getAttribute('data-step')), false);
    });
  });

  setStep(0, false);
  window.setInterval(function () {
    if (methodVisible && !stepTouched && !document.hidden) setStep(step + 1, false);
  }, 5200);

  /* ---------------------------------------------------------
     memory / erasure instrument
     --------------------------------------------------------- */
  var grid = document.getElementById('memGrid');
  var memCount = document.getElementById('memCount');
  var memState = document.getElementById('memState');
  var eraseBtn = document.getElementById('eraseBtn');
  var resetBtn = document.getElementById('resetBtn');
  var receipt = document.getElementById('receipt');

  var HEX = '0123456789ABCDEF';
  var cols = 24;
  var rows = 12;
  var cells = [];
  var timers = [];
  var armed = false;
  var erased = false;

  function hex2() {
    return HEX.charAt(Math.floor(Math.random() * 16)) + HEX.charAt(Math.floor(Math.random() * 16));
  }

  function mobileGrid() {
    return window.innerWidth <= 900;
  }

  function buildGrid() {
    if (!grid) return;
    cols = mobileGrid() ? 16 : 24;
    rows = mobileGrid() ? 18 : 12;
    cells = [];
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';

    var total = cols * rows;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < total; i++) {
      var cell = document.createElement('span');
      cell.className = 'cell' + (i % 37 === 0 ? ' acc' : '');
      cell.textContent = hex2();
      cell.style.animationDelay = '0ms';
      frag.appendChild(cell);
      cells.push(cell);
    }
    grid.appendChild(frag);
    if (memCount) memCount.textContent = String(total);
    memState.textContent = 'Armed';
    memState.style.color = '';
    eraseBtn.textContent = 'Erase key';
    eraseBtn.disabled = false;
    eraseBtn.classList.remove('armed');
    armed = false;
    erased = false;
  }

  function clearTimers() {
    timers.forEach(function (t) { window.clearTimeout(t); window.clearInterval(t); });
    timers = [];
  }

  function firstErase() {
    if (erased) return;
    armed = true;
    eraseBtn.textContent = 'Confirm erase';
    eraseBtn.classList.add('armed');
    if (memState) {
      memState.textContent = 'Armed / confirm';
      memState.style.color = 'var(--fg)';
    }
  }

  function doErase() {
    if (erased || !cells.length) return;
    erased = true;
    armed = false;
    eraseBtn.disabled = true;
    eraseBtn.textContent = 'Erasing';
    eraseBtn.classList.remove('armed');
    if (memState) {
      memState.textContent = 'Erasing';
      memState.style.color = 'var(--acc)';
    }
    if (field) field.pulse(0.55);

    var remaining = cells.length;
    var total = cells.length;

    cells.forEach(function (cell, i) {
      var start = window.setTimeout(function () {
        var n = 0;
        cell.classList.add('scramble');
        var loop = window.setInterval(function () {
          cell.textContent = hex2();
          n++;
          if (n > 3) {
            window.clearInterval(loop);
            cell.classList.remove('scramble');
            cell.classList.add('gone');
            cell.textContent = '';
            remaining--;
            if (memCount) memCount.textContent = String(Math.max(0, remaining));
            if (remaining === 0) finishErase();
          }
        }, 38);
        timers.push(loop);
      }, Math.round(i * (320 / total)));
      timers.push(start);
    });

    if (memCount) memCount.textContent = String(cells.length);
  }

  function finishErase() {
    if (memState) {
      memState.textContent = 'Erased';
      memState.style.color = 'var(--acc)';
    }
    eraseBtn.textContent = 'Erased';
    if (receipt) {
      receipt.hidden = false;
      window.requestAnimationFrame(function () { receipt.classList.add('on'); });
    }
    if (field) field.pulse(0.35);
  }

  function resetErase() {
    clearTimers();
    if (receipt) {
      receipt.classList.remove('on');
      window.setTimeout(function () { if (!erased) receipt.hidden = true; }, 420);
    }
    buildGrid();
    if (field) field.pulse(0.2);
  }

  if (grid) {
    buildGrid();

    eraseBtn.addEventListener('click', function () {
      if (erased) return;
      if (!armed) firstErase();
      else doErase();
    });

    resetBtn.addEventListener('click', resetErase);

    var lastCols = cols;
    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        var next = mobileGrid() ? 16 : 24;
        if (next !== lastCols && !erased) {
          lastCols = next;
          resetErase();
        }
      }, 260);
    });
  }

  /* ---------------------------------------------------------
     custom cursor
     --------------------------------------------------------- */
  var cursor = document.getElementById('cursor');
  var cursorLabel = document.getElementById('cursorLabel');
  var fine = window.matchMedia && window.matchMedia('(pointer:fine)').matches;

  if (cursor && fine) {
    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    var tx = cx;
    var ty = cy;
    var cursorOn = false;

    var drawCursor = function () {
      cx += (tx - cx) * 0.42;
      cy += (ty - cy) * 0.42;
      cursor.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      window.requestAnimationFrame(drawCursor);
    };
    window.requestAnimationFrame(drawCursor);

    window.addEventListener('pointermove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!cursorOn) {
        cursorOn = true;
        cx = tx;
        cy = ty;
        cursor.classList.add('on');
      }
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
      cursor.classList.remove('on');
      cursorOn = false;
    });

    document.addEventListener('pointerover', function (e) {
      var target = e.target.closest ? e.target.closest('[data-cursor]') : null;
      if (target) {
        cursor.classList.add('link-on', 'label-on');
        if (cursorLabel) cursorLabel.textContent = target.getAttribute('data-cursor') || '';
      } else {
        var link = e.target.closest ? e.target.closest('a,button') : null;
        cursor.classList.toggle('link-on', !!link);
        cursor.classList.remove('label-on');
      }
    });

    document.addEventListener('pointerout', function (e) {
      var target = e.target.closest ? e.target.closest('[data-cursor]') : null;
      if (target) {
        cursor.classList.remove('link-on', 'label-on');
      }
    });
  }

  /* ---------------------------------------------------------
     debug: ?p=0.5 jumps to a scroll position
     --------------------------------------------------------- */
  if (params.has('p')) {
    var target = parseFloat(params.get('p'));
    if (isFinite(target)) {
      window.setTimeout(function () {
        document.documentElement.style.scrollBehavior = 'auto';
        var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo(0, clamp(target, 0, 1) * max);
        updateScroll();
      }, 160);
    }
  }
})();
