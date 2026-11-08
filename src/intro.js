(function () {
  'use strict';

  var STYLE_ID = 'ti-styles';
  var FLIGHT_START = 120;
  var FLIGHT_END = 980;
  var REVEAL_AT = 1420;
  var TAU = Math.PI * 2;

  var CSS = [
    '.ti-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:2}',
    '.ti-skip{opacity:0!important;transition:opacity .18s linear!important}',
    '@keyframes ti-fade{to{opacity:1}}',
  ].join('');

  function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
  }

  /* Starts at 55% of average speed, accelerates through the middle, eases
     into the target. The old expo curve began at almost zero and read as a
     stall. */
  function flyEase(t) {
    var s = t * t * (3 - 2 * t);
    return 0.55 * t + 0.45 * s;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
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
    var params = new URLSearchParams(window.location.search);
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
    var trail = [];
    var width = 1;
    var height = 1;
    var dpr = 1;
    var targetX = 0.82;
    var targetY = 0.5;
    var startTime = 0;

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

      /* The light lines have done the work. Fade the black cover; no
         expanding circle, no aperture rim. */
      if (canvas) {
        canvas.style.transition = 'opacity .34s linear';
        canvas.style.opacity = '0';
      }
      if (boot) {
        boot.style.transition = 'opacity .42s cubic-bezier(.2,.72,.2,1)';
        boot.style.opacity = '0';
      }
      timers.push(window.setTimeout(done, 430));
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
    }

    function buildTrail(t) {
      if (t <= FLIGHT_START) {
        trail = [];
        return;
      }
      var end = clamp((t - FLIGHT_START) / (FLIGHT_END - FLIGHT_START), 0, 1);
      var startX = 0.055;
      var count = 96;
      var points = [];

      for (var i = 0; i < count; i++) {
        var p = (i / (count - 1)) * end;
        var e = flyEase(p);
        var x = startX + (targetX - startX) * e;
        var bow = Math.sin(e * Math.PI) * 0.075 * (1 - e * 0.45);
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
      ctx.moveTo(trail[start][0] * width, trail[start][1] * height);
      for (i = start + 1; i < trail.length; i++) {
        ctx.lineTo(trail[i][0] * width, trail[i][1] * height);
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

      ctx.fillStyle = '#FF3B00';
      ctx.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
      ctx.fillStyle = '#F4F3EE';
      ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
    }

    /* After impact: white lines open radially from the present, with two
       longer edges at the Mach angle either side. Then they vanish and the
       page comes through. No rings, no sphere, no flash. */
    function drawImpact(t) {
      if (t < FLIGHT_END) return;
      var age = t - FLIGHT_END;
      var life = 560;
      var p = clamp(age / life, 0, 1);
      if (p >= 1) return;

      var ix = targetX * width;
      var iy = targetY * height;
      var grow = easeOutCubic(clamp(p * 1.25, 0, 1));
      var fade = Math.pow(1 - p, 1.35);

      /* a fan of white lines opening back into the page, with two long
         edges: this is the cone, not a sphere */
      var fan = 13;
      var half = 34 * Math.PI / 180;
      for (var i = 0; i < fan; i++) {
        var k = i / (fan - 1);
        var angle = Math.PI - half + 2 * half * k;
        var edge = (i === 0 || i === fan - 1) ? 1 : 0;
        var taper = 1 - Math.abs(k - 0.5) * 0.55;
        var inner = 8 + 16 * grow;
        var len = (edge ? 360 : (150 + 170 * ((i * 5) % 7) / 6) * taper) * grow;
        var alpha = (edge ? 0.8 : 0.46) * fade;

        ctx.beginPath();
        ctx.moveTo(ix + Math.cos(angle) * inner, iy + Math.sin(angle) * inner);
        ctx.lineTo(ix + Math.cos(angle) * (inner + len), iy + Math.sin(angle) * (inner + len));
        ctx.strokeStyle = 'rgba(244,243,238,' + alpha.toFixed(3) + ')';
        ctx.lineWidth = edge ? 1.4 : 1;
        ctx.stroke();
      }

      /* the point itself, shrinking */
      var core = 4.5 * (1 - p);
      ctx.fillStyle = '#FF3B00';
      ctx.fillRect(ix - core, iy - core, core * 2, core * 2);
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

    resizeCanvas();
    startTime = (window.performance && performance.now) ? performance.now() : Date.now();

    /* QA: ?t=NNNN freezes the intro at one moment so it can be inspected. */
    var qa = params.get('t');
    if (qa !== null && isFinite(parseFloat(qa))) {
      var freeze = parseFloat(qa);
      var paint = function () { resizeCanvas(); drawScene(freeze); };
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(paint).catch(paint);
      } else {
        paint();
      }
      return;
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('click', onSkip, true);
    window.addEventListener('keydown', onSkip, true);
    window.addEventListener('wheel', onSkip, true);
    window.addEventListener('touchstart', onSkip, true);

    rafId = window.requestAnimationFrame(frame);
  }

  window.TachyonIntro = { run: run };
})();
