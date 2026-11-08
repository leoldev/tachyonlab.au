(function () {
  'use strict';

  var STYLE_ID = 'ti-styles';
  var STATUS_TEXT = 'SIGNAL ACQUIRED';
  var TRAIL_COUNT = 80;
  var WIPE_MS = 700;
  var TAU = Math.PI * 2;

  var CSS = [
    '.ti-host{position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background:#050505}',
    '.ti-overlay{position:absolute;top:0;right:0;bottom:0;left:0;overflow:hidden;background:#050505;color:#F2F2F0;font-family:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;transform:translate3d(0,0,0);transition:transform 700ms cubic-bezier(.76,0,.24,1);will-change:transform}',
    '.ti-overlay,.ti-overlay *{box-sizing:border-box}',
    '.ti-stage{position:absolute;top:0;right:0;bottom:0;left:0;transform:translate3d(0,0,0);transition:transform 700ms cubic-bezier(.76,0,.24,1);will-change:transform}',
    '.ti-canvas{position:absolute;top:0;right:0;bottom:0;left:0;display:block;width:100%;height:100%;pointer-events:none}',
    '.ti-label{font-family:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:8px;line-height:1.55;font-weight:400;letter-spacing:.18em;text-transform:uppercase;color:#6E6E6A;white-space:nowrap;margin:0;padding:0}',
    '.ti-fade{opacity:0;animation:ti-fade-in 260ms linear forwards}',
    '.ti-tl{position:absolute;top:18px;left:18px;z-index:2}',
    '.ti-tr{position:absolute;top:18px;right:18px;z-index:2;display:flex;flex-direction:column;align-items:flex-end;gap:5px;text-align:right}',
    '.ti-coords{animation-delay:30ms}',
    '.ti-count{color:#6E6E6A;animation-delay:70ms}',
    '.ti-count-done{color:#FF3B00}',
    '.ti-accent{color:#FF3B00}',
    '.ti-status{position:absolute;left:18px;bottom:18px;z-index:2;display:flex;align-items:center;gap:7px;color:#6E6E6A;opacity:0}',
    '.ti-status-text{display:inline-block;min-width:1px;white-space:pre}',
    '.ti-caret{display:inline-block;width:1px;height:8px;background:#FF3B00;opacity:0;flex:none}',
    '.ti-typing .ti-caret{animation:ti-blink 680ms steps(1,end) infinite}',
    '.ti-flash{position:absolute;top:0;right:0;bottom:0;left:0;z-index:3;background:#F2F2F0;opacity:0;pointer-events:none}',
    '.ti-shake .ti-stage{animation:ti-shake 90ms linear both}',
    /* Parent -100% plus child +60% leaves the content moving up at 0.4x. */
    '.ti-overlay.ti-wipe{transform:translate3d(0,-100%,0)}',
    '.ti-overlay.ti-wipe .ti-stage{transform:translate3d(0,60%,0)}',
    '.ti-overlay.ti-wipe::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:#F2F2F0;opacity:.55}',
    '.ti-jumped .ti-fade{animation:none !important;opacity:1 !important}',
    '.ti-jumped .ti-status{opacity:1 !important}',
    '@media (max-width:520px){.ti-tl{max-width:46%;white-space:normal}}',
    '@keyframes ti-fade-in{from{opacity:0}to{opacity:1}}',
    '@keyframes ti-blink{0%,49%{opacity:1}50%,100%{opacity:0}}',
    '@keyframes ti-shake{0%{transform:translate3d(0,0,0)}12%{transform:translate3d(-2px,1px,0)}26%{transform:translate3d(2px,-2px,0)}40%{transform:translate3d(-2px,-1px,0)}54%{transform:translate3d(2px,2px,0)}68%{transform:translate3d(-1px,1px,0)}82%{transform:translate3d(1px,-1px,0)}100%{transform:translate3d(0,0,0)}}',
    '@media (prefers-reduced-motion: reduce){.ti-overlay .ti-fade{animation:none !important;opacity:1 !important}.ti-overlay .ti-caret{animation:none !important;opacity:1}}'
  ].join('');

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
    head.appendChild(style);
  }

  function nowMs() {
    if (window.performance && typeof window.performance.now === 'function') {
      return window.performance.now();
    }
    return Date.now();
  }

  var hasRaf = typeof window.requestAnimationFrame === 'function';

  function requestFrame(fn) {
    if (hasRaf) return window.requestAnimationFrame(fn);
    return window.setTimeout(function () { fn(nowMs()); }, 16);
  }

  function cancelFrame(id) {
    if (!id) return;
    if (hasRaf) {
      window.cancelAnimationFrame(id);
    } else {
      window.clearTimeout(id);
    }
  }

  function clamp01(value) {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  }

  function easeOutCubic(value) {
    var t = clamp01(value);
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInExpo(value) {
    var t = clamp01(value);
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return Math.pow(2, 10 * t - 10);
  }

  function makeDiv(className) {
    var el = document.createElement('div');
    el.className = className;
    return el;
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function run(opts) {
    injectCSS();

    var options = opts || {};
    var onDone = typeof options.onDone === 'function' ? options.onDone : function () {};
    var onReveal = typeof options.onReveal === 'function' ? options.onReveal : function () {};
    var revealed = false;
    var start = nowMs();
    var noIntro = false;
    if (window.location && typeof window.location.search === 'string') {
      noIntro = window.location.search.indexOf('nointro=1') !== -1;
    }

    var boot = document.getElementById('boot');
    if (!boot) {
      boot = document.createElement('div');
      boot.id = 'boot';
      boot.className = 'ti-host';
      (document.body || document.documentElement).appendChild(boot);
    }

    if (options.skip === true || noIntro) {
      while (boot.firstChild) boot.removeChild(boot.firstChild);
      boot.style.display = 'none';
      var instantDone = false;
      var instantSafety = window.setTimeout(function () {
        if (instantDone) return;
        instantDone = true;
        try {
          onDone();
        } catch (error) {
          /* The intro must never prevent the page from continuing. */
        }
      }, 6000);
      requestFrame(function () {
        if (instantSafety) {
          window.clearTimeout(instantSafety);
          instantSafety = 0;
        }
        if (instantDone) return;
        instantDone = true;
        try {
          onDone();
        } catch (error) {
          /* The intro must never prevent the page from continuing. */
        }
      });
      return { skip: function () {} };
    }

    while (boot.firstChild) boot.removeChild(boot.firstChild);
    boot.style.display = 'block';
    boot.style.background = 'transparent';

    var root = makeDiv('ti-overlay');
    root.setAttribute('aria-hidden', 'true');

    var stage = makeDiv('ti-stage');
    var canvas = document.createElement('canvas');
    canvas.className = 'ti-canvas';

    var topLeft = makeDiv('ti-label ti-tl ti-fade');
    topLeft.appendChild(document.createTextNode('TACHYON LAB / FIELD RECORDING '));
    var topLeftCode = document.createElement('span');
    topLeftCode.className = 'ti-accent';
    topLeftCode.textContent = '001';
    topLeft.appendChild(topLeftCode);

    var topRight = makeDiv('ti-tr');
    var coords = makeDiv('ti-label ti-coords ti-fade');
    coords.textContent = 'PERTH 31.95S 115.86E';
    var countdown = makeDiv('ti-label ti-count ti-fade');
    countdown.textContent = 'T-03';
    topRight.appendChild(coords);
    topRight.appendChild(countdown);

    var status = makeDiv('ti-label ti-status');
    var statusText = document.createElement('span');
    statusText.className = 'ti-status-text';
    var caret = document.createElement('span');
    caret.className = 'ti-caret';
    caret.setAttribute('aria-hidden', 'true');
    status.appendChild(statusText);
    status.appendChild(caret);

    var flash = makeDiv('ti-flash');

    stage.appendChild(canvas);
    stage.appendChild(topLeft);
    stage.appendChild(topRight);
    stage.appendChild(status);
    root.appendChild(stage);
    root.appendChild(flash);
    boot.appendChild(root);

    var ctx = null;
    if (typeof canvas.getContext === 'function') {
      try {
        ctx = canvas.getContext('2d');
      } catch (error) {
        ctx = null;
      }
    }

    var width = 1;
    var height = 1;
    var dpr = 1;
    var trail = [];
    var alive = true;
    var done = false;
    var wiping = false;
    var jumped = false;
    var impacted = false;
    var labelPhase = 0;
    var typedCount = -1;
    var animationId = 0;
    var autoTimer = 0;
    var finishTimer = 0;
    var shakeTimer = 0;
    var flashTimer = 0;
    var safetyTimer = 0;

    function sizeCanvas() {
      width = Math.max(1, root.clientWidth || window.innerWidth || 1);
      height = Math.max(1, root.clientHeight || window.innerHeight || 1);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      var pixelWidth = Math.max(1, Math.round(width * dpr));
      var pixelHeight = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
    }

    function buildTrail(t) {
      if (t <= 700) {
        trail = [];
        return;
      }
      var end = Math.min(t, 1250);
      var positions = [];
      for (var i = 0; i < TRAIL_COUNT; i++) {
        var sample = 700 + (end - 700) * (i / (TRAIL_COUNT - 1));
        var amount = clamp01((sample - 700) / 550);
        positions.push([
          0.18 + 0.64 * easeInExpo(amount),
          0.5 + 0.035 * Math.sin(amount * Math.PI)
        ]);
      }
      trail = positions;
    }

    function drawTrail(t) {
      if (trail.length < 2) return;
      var fade = t > 1400 ? clamp01(1 - (t - 1400) / 300) : 1;
      if (fade <= 0) return;
      var i;
      var r;
      var ribbons = [-10, -6, -3, 3, 6, 10];

      /* Parallel 1px strokes read as motion blur without a gradient. */
      for (r = 0; r < ribbons.length; r++) {
        var offset = ribbons[r];
        var ribbonAlpha = 0.1 * fade * (1 - Math.abs(offset) / 20);
        ctx.beginPath();
        for (i = 0; i < trail.length; i++) {
          var px = trail[i][0] * width;
          var py = trail[i][1] * height + offset;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = 'rgba(242,242,240,' + ribbonAlpha.toFixed(3) + ')';
        ctx.stroke();
      }

      for (i = 1; i < trail.length; i++) {
        var alpha = (0.08 + (i / (trail.length - 1)) * 0.84) * fade;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1][0] * width, trail[i - 1][1] * height);
        ctx.lineTo(trail[i][0] * width, trail[i][1] * height);
        ctx.strokeStyle = 'rgba(242,242,240,' + alpha.toFixed(3) + ')';
        ctx.stroke();
      }

      /* The accent is a hot leading edge, not a second full-length rule. */
      var start = Math.floor(trail.length * 0.72);
      ctx.beginPath();
      ctx.moveTo(trail[start][0] * width, trail[start][1] * height + 6);
      for (i = start + 1; i < trail.length; i++) {
        ctx.lineTo(trail[i][0] * width, trail[i][1] * height + 6);
      }
      ctx.strokeStyle = 'rgba(255,59,0,' + (0.9 * fade).toFixed(3) + ')';
      ctx.stroke();
    }

    function drawRing(t) {
      var progress = clamp01((t - 250) / 650);
      if (t < 250 || progress >= 1) return;
      var centerX = Math.round(width * 0.18);
      var centerY = Math.round(height * 0.5);
      var radius = 2 + 24 * easeOutCubic(progress);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, TAU);
      ctx.strokeStyle = 'rgba(242,242,240,' + (1 - progress).toFixed(3) + ')';
      ctx.stroke();
    }

    function drawImpact(t) {
      if (t >= 1250) {
        var impactX = Math.round(width * 0.82);
        var impactY = Math.round(height * 0.5);
        var burst = clamp01((t - 1250) / 240);

        if (burst < 1) {
          for (var i = 0; i < 14; i++) {
            var angle = (TAU * i) / 14 - Math.PI / 2;
            var length = (40 + (i % 5) * 12.5) * easeOutCubic(burst);
            ctx.beginPath();
            ctx.moveTo(impactX, impactY);
            ctx.lineTo(impactX + Math.cos(angle) * length, impactY + Math.sin(angle) * length);
            ctx.strokeStyle = 'rgba(242,242,240,' + (1 - burst).toFixed(3) + ')';
            ctx.stroke();
          }
        }

        if (t < 1700) {
          for (var k = 0; k < 3; k++) {
            var wave = clamp01((t - 1250 - k * 55) / 430);
            if (wave <= 0 || wave >= 1) continue;
            var size = 10 + 190 * easeOutCubic(wave);
            ctx.strokeStyle = 'rgba(242,242,240,' + (0.24 * (1 - wave)).toFixed(3) + ')';
            ctx.strokeRect(impactX - size / 2, impactY - size / 2, size, size);
          }
        }

        var vertical = 14 * easeOutCubic((t - 1250) / 140);
        ctx.beginPath();
        ctx.moveTo(impactX, impactY - vertical);
        ctx.lineTo(impactX, impactY + vertical);
        ctx.strokeStyle = '#FF3B00';
        ctx.stroke();
      }
    }

    function drawLine(t) {
      if (t < 1400) return;

      var lineY = Math.round(height * 0.5);
      var startX;
      var endX;

      if (t < 1700) {
        var grow = easeOutCubic((t - 1400) / 300);
        startX = Math.round(width * 0.18);
        endX = Math.round(width * (0.18 + 0.64 * grow));
      } else {
        var extend = easeOutCubic((t - 1700) / 300);
        startX = Math.round(width * 0.18 * (1 - extend));
        endX = Math.round(width * (0.82 + 0.18 * extend));
      }

      ctx.beginPath();
      ctx.moveTo(startX, lineY);
      ctx.lineTo(endX, lineY);
      ctx.strokeStyle = 'rgba(242,242,240,0.95)';
      ctx.stroke();

      if (t >= 1700) {
        for (var i = 0; i < 9; i++) {
          var tickProgress = clamp01((t - (1700 + i * 15)) / 180);
          if (tickProgress > 0) {
            var tickX = Math.round(width * (0.18 + (0.64 * i) / 8));
            var tickLength = 6 * easeOutCubic(tickProgress);
            ctx.beginPath();
            ctx.moveTo(tickX, lineY);
            ctx.lineTo(tickX, lineY + tickLength);
            ctx.strokeStyle = '#F2F2F0';
            ctx.stroke();
          }
        }
      }
    }

    function drawDot(t) {
      if (t < 250 || t >= 1400) return;
      var amount = clamp01((t - 700) / 550);
      var headX = t < 700 ? 0.18 : 0.18 + 0.64 * easeInExpo(amount);
      var dotX = Math.round(width * headX);
      var dotY = Math.round(height * 0.5);
      if (trail.length) {
        dotY = Math.round(trail[trail.length - 1][1] * height);
      }
      if (t < 1250) {
        ctx.beginPath();
        ctx.moveTo(dotX + 0.5, dotY - 11);
        ctx.lineTo(dotX + 0.5, dotY + 11);
        ctx.strokeStyle = '#FF3B00';
        ctx.stroke();
      }
      ctx.fillStyle = '#F2F2F0';
      /* The .5 translation makes this odd 3px square land on crisp pixels. */
      ctx.fillRect(dotX - 1.5, dotY - 1.5, 3, 3);
    }

    function drawScene(t) {
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(0.5, 0.5);
      ctx.lineWidth = 1;
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';

      buildTrail(t);
      drawRing(t);
      drawTrail(t);
      drawImpact(t);
      drawLine(t);
      drawDot(t);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    function updateLabels(t) {
      if (t >= 250 && labelPhase < 1) {
        labelPhase = 1;
        countdown.textContent = 'T-02';
      }
      if (t >= 700 && labelPhase < 2) {
        labelPhase = 2;
        countdown.textContent = 'T-01';
      }
      if (t >= 1400 && labelPhase < 3) {
        labelPhase = 3;
        countdown.textContent = 'T-00';
        countdown.classList.add('ti-count-done');
        status.style.opacity = '1';
        status.className = 'ti-label ti-status ti-typing';
      }
      if (t >= 1400) {
        var count = Math.min(STATUS_TEXT.length, Math.floor((t - 1400) / 40));
        if (count !== typedCount) {
          typedCount = count;
          statusText.textContent = STATUS_TEXT.slice(0, count);
        }
        if (count >= STATUS_TEXT.length && status.className.indexOf('ti-typing') === -1) {
          status.className = 'ti-label ti-status ti-typing';
        }
      }
    }

    function triggerImpact() {
      impacted = true;
      root.classList.add('ti-shake');
      flash.style.opacity = '0.085';
      shakeTimer = window.setTimeout(function () {
        shakeTimer = 0;
        root.classList.remove('ti-shake');
      }, 90);
      flashTimer = window.setTimeout(function () {
        flashTimer = 0;
        flash.style.opacity = '0';
      }, 80);
    }

    function removeInputListeners() {
      window.removeEventListener('click', onInput, true);
      window.removeEventListener('keydown', onInput, true);
      window.removeEventListener('wheel', onInput, true);
      window.removeEventListener('touchstart', onInput, true);
      window.removeEventListener('resize', onResize, false);
    }

    function finish() {
      if (!alive) return;
      alive = false;

      if (animationId) {
        cancelFrame(animationId);
        animationId = 0;
      }
      if (autoTimer) {
        window.clearTimeout(autoTimer);
        autoTimer = 0;
      }
      if (finishTimer) {
        window.clearTimeout(finishTimer);
        finishTimer = 0;
      }
      if (shakeTimer) {
        window.clearTimeout(shakeTimer);
        shakeTimer = 0;
      }
      if (flashTimer) {
        window.clearTimeout(flashTimer);
        flashTimer = 0;
      }
      if (safetyTimer) {
        window.clearTimeout(safetyTimer);
        safetyTimer = 0;
      }

      removeInputListeners();
      flash.style.opacity = '0';

      if (root.parentNode) root.parentNode.removeChild(root);
      if (boot) {
        while (boot.firstChild) boot.removeChild(boot.firstChild);
        boot.style.display = 'none';
      }

      if (done) return;
      done = true;
      try {
        onDone();
      } catch (error) {
        /* Keep a callback failure from affecting the page. */
      }
    }

    function reveal() {
      if (revealed) return;
      revealed = true;
      try {
        onReveal();
      } catch (error) {
        /* A reveal callback must never block the wipe. */
      }
    }

    function beginWipe() {
      if (!alive || wiping) return;
      wiping = true;
      jumped = true;

      if (autoTimer) {
        window.clearTimeout(autoTimer);
        autoTimer = 0;
      }
      if (shakeTimer) {
        window.clearTimeout(shakeTimer);
        shakeTimer = 0;
      }
      if (flashTimer) {
        window.clearTimeout(flashTimer);
        flashTimer = 0;
      }
      flash.style.opacity = '0';
      root.classList.remove('ti-shake');
      root.classList.add('ti-jumped');
      updateLabels(2250);
      drawScene(2250);
      removeInputListeners();
      reveal();

      root.classList.add('ti-wipe');
      finishTimer = window.setTimeout(finish, WIPE_MS);
    }

    function onInput() {
      if (!alive || wiping) return;
      if (nowMs() - start < 150) return;
      beginWipe();
    }

    function onResize() {
      sizeCanvas();
      drawScene(jumped ? 2250 : nowMs() - start);
    }

    function tick(timestamp) {
      if (!alive) return;
      var elapsed = nowMs() - start;
      var visualTime = jumped ? 2250 : elapsed;

      updateLabels(visualTime);
      drawScene(visualTime);

      if (!jumped && !impacted && elapsed >= 1250) {
        triggerImpact();
      }

      animationId = requestFrame(tick);
    }

    sizeCanvas();
    updateLabels(0);
    drawScene(0);

    if (prefersReducedMotion()) {
      jumped = true;
      root.classList.add('ti-jumped');
      updateLabels(2250);
      drawScene(2250);
      reveal();

      root.style.transition = 'opacity 120ms linear';
      root.style.opacity = '1';
      void root.offsetWidth;
      root.style.opacity = '0';
      finishTimer = window.setTimeout(finish, 120);
      safetyTimer = window.setTimeout(finish, 6000);

      return { skip: finish };
    }

    window.addEventListener('click', onInput, true);
    window.addEventListener('keydown', onInput, true);
    window.addEventListener('wheel', onInput, { capture: true, passive: true });
    window.addEventListener('touchstart', onInput, { capture: true, passive: true });
    window.addEventListener('resize', onResize, false);

    autoTimer = window.setTimeout(beginWipe, Math.max(0, 2250 - (nowMs() - start)));
    safetyTimer = window.setTimeout(finish, Math.max(0, 6000 - (nowMs() - start)));
    animationId = requestFrame(tick);

    return { skip: beginWipe };
  }

  window.TachyonIntro = { run: run };
})();
