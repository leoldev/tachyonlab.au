/* Tachyon intro — a worldline, then a light cone.

   TIMELINE (ms)

   0 ... 140      Black. Nothing.
   140 ... 340    The point materialises at the lower left of the field.
   340 ... 1700   It travels to the present — the centre of the light cone —
                  along a smooth cubic curve, easing in and out, drawing the
                  worldline behind it.
   1700 ... 2050  The two light rays draw outward from the present at 60° from
                  the x axis, 45° either side.
   2050 ... 2350  Two tachyon worldlines draw outside the cone, where faster-
                  than-light paths live.
   2350           The page is released and the canvas fades into the same
                  figure the page draws in SVG.
   2950           Canvas removed.

   Skip: any key or pointer after 200 ms.
   Reduced motion: no animation; the page is simply visible.
*/
(function () {
  'use strict';

  var canvas = document.getElementById('intro');
  var root = document.documentElement;
  var params = new URLSearchParams(window.location.search);
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var T_POINT = 140;
  var T_FLY = 340;
  var T_LAND = 1700;
  var T_RAYS = 2050;
  var T_TACH = 2350;

  var ctx = null;
  var W = 1;
  var H = 1;
  var dpr = 1;
  var start = 0;
  var raf = 0;
  var skip = false;
  var geo = null;
  var released = false;
  var freezeT = null;

  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function easeInOutCubic(t) {
    t = clamp(t, 0, 1);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function easeOutCubic(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }

  function finish() {
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    root.classList.add('ready');
    if (window.TachyonBoot) window.TachyonBoot.release();
  }

  function release() {
    if (released) return;
    released = true;
    root.classList.add('ready');
    if (window.TachyonBoot) window.TachyonBoot.release();
  }

  /* Read the cone figure's real position so the canvas lands exactly on the
     SVG the page shows. */
  function measure() {
    var el = document.querySelector('.cone');
    var r = el ? el.getBoundingClientRect() : null;
    if (!r || r.width < 20) {
      r = { left: W * 0.62, top: H * 0.30, width: W * 0.3, height: W * 0.3 };
    }
    function px(vx, vy) {
      return { x: r.left + (vx / 420) * r.width, y: r.top + (vy / 420) * r.height };
    }
    geo = {
      now: px(140, 320),
      rayA: px(401, 250),
      rayB: px(62, 30),
      tachA: px(379, 303),
      tachB: px(10, 311),
      p0: { x: W * 0.02, y: H * 0.90 },
      p1: { x: W * 0.34, y: H * 0.96 },
      p2: { x: W * 0.66, y: H * 0.30 }
    };
  }

  function bez(s) {
    var u = 1 - s;
    var a = u * u * u, b = 3 * u * u * s, c = 3 * u * s * s, d = s * s * s;
    return {
      x: a * geo.p0.x + b * geo.p1.x + c * geo.p2.x + d * geo.now.x,
      y: a * geo.p0.y + b * geo.p1.y + c * geo.p2.y + d * geo.now.y
    };
  }

  function size() {
    W = Math.max(1, window.innerWidth || 1);
    H = Math.max(1, window.innerHeight || 1);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    measure();
  }

  function line(from, to, t, style, width, dash) {
    if (t <= 0) return;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.setLineDash(dash || []);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#070706';
    ctx.fillRect(0, 0, W, H);

    if (t < T_POINT) return;

    /* the present: a small square, always the destination */
    var appear = easeOutCubic((t - T_POINT) / 220);
    var half = 4 * appear;
    ctx.fillStyle = '#FF3B00';
    ctx.fillRect(geo.now.x - half, geo.now.y - half, half * 2, half * 2);

    /* the worldline */
    var s = skip ? 1 : easeInOutCubic((t - T_FLY) / (T_LAND - T_FLY));
    if (s > 0) {
      var steps = 72;
      var prev = bez(0);
      for (var i = 1; i <= steps; i++) {
        var p = bez((i / steps) * s);
        var near = i / steps;
        var alpha = 0.06 + 0.86 * Math.pow(near, 2.4);
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = 'rgba(244,243,238,' + alpha.toFixed(3) + ')';
        ctx.lineWidth = 1.1;
        ctx.stroke();
        prev = p;
      }
      /* the travelling point */
      var head = bez(s);
      var hs = 4 * easeOutCubic((t - T_POINT) / 220);
      ctx.fillStyle = '#FF3B00';
      ctx.fillRect(head.x - hs, head.y - hs, hs * 2, hs * 2);
    }

    /* the light cone */
    var rt = skip ? 1 : clamp((t - T_LAND) / (T_RAYS - T_LAND), 0, 1);
    if (rt > 0) {
      var rp = easeOutCubic(rt);
      line(geo.now, geo.rayA, rp, 'rgba(244,243,238,.62)', 1.1);
      line(geo.now, geo.rayB, rp, 'rgba(244,243,238,.62)', 1.1);
    }

    /* tachyons live outside the cone */
    var tt = skip ? 1 : clamp((t - T_RAYS) / (T_TACH - T_RAYS), 0, 1);
    if (tt > 0) {
      var tp = easeOutCubic(tt);
      line(geo.now, geo.tachA, tp, 'rgba(255,59,0,.85)', 1.1, [3, 5]);
      line(geo.now, geo.tachB, tp, 'rgba(255,59,0,.85)', 1.1, [3, 5]);
    }

    if (t >= T_TACH) release();
  }

  function frame(ts) {
    var t = freezeT != null ? freezeT : ts - start;
    draw(t);
    if (freezeT != null) return;
    if (t >= T_TACH + 600) { finish(); return; }
    raf = window.requestAnimationFrame(frame);
  }

  function onSkip() {
    if (now() - start < 200) return;
    skip = true;
  }

  function boot() {
    if (!canvas) { finish(); return; }
    ctx = canvas.getContext('2d');
    if (!ctx) { finish(); return; }

    size();

    if (reduced || params.get('nointro') === '1') {
      finish();
      return;
    }

    var qa = params.get('t');
    if (qa !== null && isFinite(parseFloat(qa))) {
      freezeT = parseFloat(qa);
      window.__introFreeze = freezeT;
      release();
    }

    window.addEventListener('resize', function () { size(); });
    window.addEventListener('keydown', onSkip, true);
    window.addEventListener('pointerdown', onSkip, true);

    start = now();
    raf = window.requestAnimationFrame(frame);
  }

  boot();
})();
