(function () {
  'use strict';

  var STYLE_ID = 'ti-styles';
  var FLIGHT_START = 360;
  var FLIGHT_END = 1180;
  var REVEAL_AT = 1510;
  var OPEN_MS = 880;
  var TAU = Math.PI * 2;

  var CSS = [
    '.ti-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:2}',
    '.ti-flash{position:absolute;inset:0;z-index:4;background:#F4F3EE;opacity:0;pointer-events:none}',
    '.ti-aperture{position:fixed;inset:0;z-index:10000;overflow:hidden;pointer-events:none}',
    '.ti-aperture i{position:absolute;display:block;width:0;height:0;border:1.5px solid rgba(244,243,238,.85);border-radius:50%;transform:translate(-50%,-50%)}',
    '.ti-skip{opacity:0!important;transition:opacity .18s linear!important}',
    '.ti-shake{animation:ti-shake .1s linear}',
    '@keyframes ti-fade{to{opacity:1}}',
    '@keyframes ti-shake{0%,100%{transform:translate(0,0)}25%{transform:translate(-1px,1px)}75%{transform:translate(1px,-1px)}}'
  ].join('');

  function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
  }

  function easeInExpo(t) {
    return t <= 0 ? 0 : Math.pow(2, 10 * (t - 1));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function stamp() {
    return (window.performance && performance.now) ? performance.now() : Date.now();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function run(opts) {
    var options = opts || {};
    var onDone = typeof options.onDone === 'function' ? options.onDone : function () {};
    var onReveal = typeof options.onReveal === 'function' ? options.onReveal : function () {};
    var getTarget = typeof options.getTarget === 'function' ? options.getTarget : null;
    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var boot = document.getElementById('boot');

    var revealed = false;
    var finished = false;
    var wiping = false;
    var impacted = false;
    var rafId = 0;
    var timers = [];
    var canvas = null;
    var ctx = null;
    var flashEl = null;
    var aperture = null;
    var trail = [];
    var width = 1;
    var height = 1;
    var dpr = 1;
    var targetX = 0.82;
    var targetY = 0.5;
    var startTime = 0;
    var apertureX = 0;
    var apertureY = 0;
    var apertureMax = 1;
    var apertureStart = 0;
    var apertureRing = null;

    function reveal() {
      if (revealed) return;
      revealed = true;
      try {
        onReveal();
      } catch (error) {
        /* the site must still open if a callback fails */
      }
    }

    function cleanup() {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      timers.forEach(function (id) { window.clearTimeout(id); });
      timers = [];
      window.removeEventListener('resize', onResize);
      window.removeEventListener('click', onSkip, true);
      window.removeEventListener('keydown', onSkip, true);
      window.removeEventListener('wheel', onSkip, true);
      window.removeEventListener('touchstart', onSkip, true);
      if (aperture && aperture.parentNode) aperture.parentNode.removeChild(aperture);
      aperture = null;
      apertureRing = null;
      if (boot) {
        boot.style.display = 'none';
        boot.innerHTML = '';
      }
    }

    function done() {
      if (finished) return;
      finished = true;
      onDone();
      cleanup();
    }

    function finish(mode) {
      if (finished || wiping) return;
      wiping = true;

      if (mode === 'skip' || reduced) {
        reveal();
        if (boot) {
          boot.style.transition = 'opacity .18s linear';
          boot.style.opacity = '0';
        }
        timers.push(window.setTimeout(done, 190));
        return;
      }

      reveal();
      if (flashEl) flashEl.style.opacity = '0';

      /* Re-measure the access target: webfonts may have shifted the layout. */
      var point = getTargetPoint();
      targetX = point.x;
      targetY = point.y;

      /* Open a real aperture: the black cover is masked away from the
         access target outwards, while a rim marks the edge of the hole. */
      apertureX = targetX * width;
      apertureY = targetY * height;
      apertureMax = Math.max(1, Math.sqrt(
        Math.pow(Math.max(apertureX, width - apertureX), 2) +
        Math.pow(Math.max(apertureY, height - apertureY), 2)
      ) + 2);

      if (boot) {
        var mask0 = apertureMask(0);
        boot.style.webkitMaskImage = mask0;
        boot.style.maskImage = mask0;
      }
      if (canvas) {
        canvas.style.transition = 'opacity .22s linear';
        canvas.style.opacity = '0';
      }

      aperture = document.createElement('div');
      aperture.className = 'ti-aperture';
      apertureRing = document.createElement('i');
      apertureRing.style.left = apertureX.toFixed(1) + 'px';
      apertureRing.style.top = apertureY.toFixed(1) + 'px';
      aperture.appendChild(apertureRing);
      document.body.appendChild(aperture);

      apertureStart = stamp();
      rafId = window.requestAnimationFrame(openAperture);
    }

    function apertureMask(radius) {
      var r = radius.toFixed(1);
      return 'radial-gradient(circle at ' + apertureX.toFixed(1) + 'px ' +
        apertureY.toFixed(1) + 'px, transparent 0px, transparent ' + r +
        'px, #000 ' + (radius + 1).toFixed(1) + 'px)';
    }

    function openAperture(timestamp) {
      if (finished) return;
      var p = clamp((timestamp - apertureStart) / OPEN_MS, 0, 1);
      var eased = easeInOutCubic(p);
      var radius = apertureMax * eased;

      if (boot) {
        var mask = apertureMask(radius);
        boot.style.webkitMaskImage = mask;
        boot.style.maskImage = mask;
      }
      if (apertureRing) {
        var size = (radius * 2 + 1).toFixed(1) + 'px';
        apertureRing.style.width = size;
        apertureRing.style.height = size;
      }

      if (p < 1) {
        rafId = window.requestAnimationFrame(openAperture);
      } else {
        rafId = 0;
        done();
      }
    }

    function onSkip(event) {
      if (!startTime) return;
      if (event && event.type === 'keydown') {
        if (event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt' || event.key === 'Meta' || event.key === 'Tab') {
          return;
        }
        /* keep the skip key from also scrolling the page behind the intro */
        if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter' ||
            event.key === 'Escape' || event.key === 'PageDown' || event.key === 'PageUp' ||
            event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'End' || event.key === 'Home') {
          event.preventDefault();
        }
      }
      if (event && event.type === 'click') event.preventDefault();
      finish('skip');
    }

    function getTargetPoint() {
      if (!getTarget) return { x: 0.82, y: 0.5 };
      try {
        var point = getTarget();
        if (point && isFinite(point.x) && isFinite(point.y)) {
          return { x: clamp(point.x, 0.05, 0.95), y: clamp(point.y, 0.08, 0.92) };
        }
      } catch (error) {
        /* fall through */
      }
      return { x: 0.82, y: 0.5 };
    }

    function resizeCanvas() {
      if (!canvas) return;
      width = Math.max(1, window.innerWidth || 1);
      height = Math.max(1, window.innerHeight || 1);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      var bw = Math.max(1, Math.round(width * dpr));
      var bh = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== bw) canvas.width = bw;
      if (canvas.height !== bh) canvas.height = bh;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var pt = getTargetPoint();
      targetX = pt.x;
      targetY = pt.y;
      if (boot) {
        boot.style.setProperty('--ix', (targetX * width).toFixed(1) + 'px');
        boot.style.setProperty('--iy', (targetY * height).toFixed(1) + 'px');
      }
      buildTrail(FLIGHT_END);
    }

    function onResize() {
      resizeCanvas();
      if (wiping && !finished) {
        /* the page is already being revealed; keep the aperture aligned */
        apertureX = targetX * width;
        apertureY = targetY * height;
        apertureMax = Math.max(1, Math.sqrt(
          Math.pow(Math.max(apertureX, width - apertureX), 2) +
          Math.pow(Math.max(apertureY, height - apertureY), 2)
        ) + 2);
        if (apertureRing) {
          apertureRing.style.left = apertureX.toFixed(1) + 'px';
          apertureRing.style.top = apertureY.toFixed(1) + 'px';
        }
      }
    }

    function buildTrail(t) {
      if (t <= FLIGHT_START) {
        trail = [];
        return;
      }
      var end = clamp((t - FLIGHT_START) / (FLIGHT_END - FLIGHT_START), 0, 1);
      var easedEnd = easeInExpo(end);
      var startX = 0.055;
      var count = 96;
      var points = [];

      for (var i = 0; i < count; i++) {
        var p = (i / (count - 1)) * end;
        var e = easeInExpo(p);
        var x = startX + (targetX - startX) * e;
        var bow = Math.sin(e * Math.PI) * 0.028 * (1 - e * 0.45);
        var y = targetY + bow;
        points.push([x, y]);
      }

      /* Keep the head exactly on the target at the moment of impact. */
      if (end >= 1) {
        points[points.length - 1][0] = targetX;
        points[points.length - 1][1] = targetY;
      }
      trail = points;
    }

    function drawTrail(t) {
      if (trail.length < 2) return;
      var fade = t > FLIGHT_END ? clamp(1 - (t - FLIGHT_END) / 240, 0, 1) : 1;
      if (fade <= 0) return;

      var i;
      var ribbons = [-9, -5, -2, 2, 5, 9];
      for (var r = 0; r < ribbons.length; r++) {
        var off = ribbons[r];
        var alpha = 0.12 * fade * (1 - Math.abs(off) / 18);
        ctx.beginPath();
        for (i = 0; i < trail.length; i++) {
          var px = trail[i][0] * width;
          var py = trail[i][1] * height + off;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = 'rgba(244,243,238,' + alpha.toFixed(3) + ')';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      for (i = 1; i < trail.length; i++) {
        var segmentAlpha = (0.12 + (i / (trail.length - 1)) * 0.88) * fade;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1][0] * width, trail[i - 1][1] * height);
        ctx.lineTo(trail[i][0] * width, trail[i][1] * height);
        ctx.strokeStyle = 'rgba(244,243,238,' + segmentAlpha.toFixed(3) + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      var start = Math.floor(trail.length * 0.76);
      ctx.beginPath();
      ctx.moveTo(trail[start][0] * width, trail[start][1] * height + 3);
      for (i = start + 1; i < trail.length; i++) {
        ctx.lineTo(trail[i][0] * width, trail[i][1] * height + 3);
      }
      ctx.strokeStyle = 'rgba(255,59,0,' + (0.98 * fade).toFixed(3) + ')';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    function drawHead(t) {
      if (t < FLIGHT_START || t >= FLIGHT_END) return;
      if (!trail.length) return;
      var point = trail[trail.length - 1];
      var x = point[0] * width;
      var y = point[1] * height;

      ctx.strokeStyle = '#FF3B00';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, y - 10);
      ctx.lineTo(x + 0.5, y + 10);
      ctx.stroke();

      ctx.fillStyle = '#F4F3EE';
      ctx.fillRect(Math.round(x) - 1.5, Math.round(y) - 1.5, 3, 3);
    }

    function drawImpact(t) {
      if (t < FLIGHT_END) return;
      var age = t - FLIGHT_END;
      var ix = targetX * width;
      var iy = targetY * height;
      var fade = clamp(1 - age / 620, 0, 1);

      if (fade > 0) {
        for (var k = 0; k < 3; k++) {
          var local = clamp((age - k * 55) / 460, 0, 1);
          if (local <= 0 || local >= 1) continue;
          var radius = 9 + 170 * easeOutCubic(local);
          ctx.beginPath();
          ctx.arc(ix, iy, radius, 0, TAU);
          ctx.strokeStyle = k === 0
            ? 'rgba(255,59,0,' + (0.72 * (1 - local)).toFixed(3) + ')'
            : 'rgba(244,243,238,' + (0.62 * (1 - local)).toFixed(3) + ')';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(244,243,238,' + (0.85 * fade).toFixed(3) + ')';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(ix - 34, iy);
        ctx.lineTo(ix + 34, iy);
        ctx.moveTo(ix, iy - 34);
        ctx.lineTo(ix, iy + 34);
        ctx.stroke();

        for (var a = 0; a < 12; a++) {
          var angle = (a / 12) * TAU;
          var inner = 26 + 20 * easeOutCubic(1 - fade);
          var outer = inner + 14;
          ctx.beginPath();
          ctx.moveTo(ix + Math.cos(angle) * inner, iy + Math.sin(angle) * inner);
          ctx.lineTo(ix + Math.cos(angle) * outer, iy + Math.sin(angle) * outer);
          ctx.strokeStyle = 'rgba(244,243,238,' + (0.46 * fade).toFixed(3) + ')';
          ctx.stroke();
        }
      }

      ctx.fillStyle = '#FF3B00';
      ctx.fillRect(ix - 5, iy - 5, 10, 10);
      ctx.fillStyle = '#F4F3EE';
      ctx.fillRect(ix - 1.5, iy - 1.5, 3, 3);
    }

    function drawScene(t) {
      ctx.clearRect(0, 0, width, height);
      buildTrail(t);
      drawTrail(t);
      drawHead(t);
      drawImpact(t);
    }

    function frame(timestamp) {
      if (finished || !ctx) return;
      var t = timestamp - startTime;

      if (t >= FLIGHT_END && !impacted) {
        impacted = true;
        var point = getTargetPoint();
        targetX = point.x;
        targetY = point.y;
        buildTrail(FLIGHT_END);
        if (flashEl) {
          flashEl.style.opacity = '.16';
          timers.push(window.setTimeout(function () { flashEl.style.opacity = '0'; }, 120));
        }
        if (boot) {
          boot.classList.add('ti-shake');
          timers.push(window.setTimeout(function () { boot.classList.remove('ti-shake'); }, 130));
        }
      }

      if (t >= REVEAL_AT && !wiping) finish('auto');

      if (!wiping) {
        drawScene(t);
        rafId = window.requestAnimationFrame(frame);
      }
    }

    if (options.skip || reduced) {
      if (boot) boot.style.display = 'none';
      reveal();
      onDone();
      finished = true;
      return;
    }

    installStyles();

    if (!boot) {
      reveal();
      onDone();
      finished = true;
      return;
    }

    boot.style.display = 'block';
    boot.style.opacity = '1';
    boot.style.transition = 'none';
    boot.innerHTML = '';

    canvas = document.createElement('canvas');
    canvas.className = 'ti-canvas';
    boot.appendChild(canvas);
    ctx = canvas.getContext('2d');

    flashEl = document.createElement('div');
    flashEl.className = 'ti-flash';
    boot.appendChild(flashEl);

    resizeCanvas();
    startTime = (window.performance && performance.now) ? performance.now() : Date.now();

    window.addEventListener('resize', onResize);
    window.addEventListener('click', onSkip, true);
    window.addEventListener('keydown', onSkip, true);
    window.addEventListener('wheel', onSkip, true);
    window.addEventListener('touchstart', onSkip, true);

    rafId = window.requestAnimationFrame(frame);
  }

  window.TachyonIntro = { run: run };
})();
