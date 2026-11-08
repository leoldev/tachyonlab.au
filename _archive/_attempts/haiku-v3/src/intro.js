(function () {
  'use strict';

  var root = document.documentElement;
  var main = document.getElementById('main');
  var canvas = document.getElementById('intro');
  var params = new URLSearchParams(window.location.search);
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var seen = false;
  try {
    seen = !!window.localStorage.getItem('tl-intro');
    window.localStorage.setItem('tl-intro', '1');
  } catch (error) { /* private mode: play the full intro every time */ }

  var S = seen ? 0.6 : 1;
  var FLIGHT_MS = 2300 * S;
  var SPHERE_GROW_MS = 900 * S;
  var HOLD_MIN_MS = 3400 * S;
  var MAX_WAIT_MS = 9000;
  var SKIP_AFTER_MS = 300;
  var REVEAL_MS = 1250;
  var CHI = 1.8;
  var MACH = Math.asin(1 / CHI);
  var TAU = Math.PI * 2;
  var ACCENT = '#FF3B00';

  function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeOutExpo(t) {
    return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function finishNow() {
    root.classList.add('go', 'done');
    if (main) main.style.clipPath = 'none';
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }

  if (!canvas || !canvas.getContext || reduced || params.get('nointro') === '1') {
    finishNow();
    return;
  }

  var ctx = canvas.getContext('2d');
  var W = 1;
  var H = 1;
  var dpr = 1;

  function size() {
    W = Math.max(1, window.innerWidth || 1);
    H = Math.max(1, window.innerHeight || 1);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener('resize', size);

  var START_FX = 0.14;
  var START_FY = seen ? 0.3 + Math.random() * 0.4 : 0.66;
  var END_FX = 0.5;
  var END_FY = 0.5;
  var BOW_SIGN = seen ? (Math.random() < 0.5 ? -1 : 1) : -1;

  function pathAt(p) {
    var sx = START_FX * W;
    var sy = START_FY * H;
    var ex = END_FX * W;
    var ey = END_FY * H;
    var e = Math.pow(p, 1.6);
    var dx = ex - sx;
    var dy = ey - sy;
    var len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    var bow = Math.min(W, H) * 0.07 * BOW_SIGN * Math.sin(Math.PI * e);
    return { x: lerp(sx, ex, e) + nx * bow, y: lerp(sy, ey, e) + ny * bow };
  }

  function headingAt(p) {
    var a = pathAt(Math.max(0, p - 0.004));
    var b = pathAt(Math.min(1, p + 0.004));
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  function drawTrail(p) {
    ctx.beginPath();
    for (var i = 0; i <= 48; i++) {
      var pt = pathAt(p * i / 48);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /* Mach-type envelope: the two edges of the wake cone behind the particle. */
  function drawWake(p, alpha) {
    var pos = pathAt(p);
    var h = headingAt(p);
    var bx = -h.x;
    var by = -h.y;
    var L = Math.hypot(W, H);
    [1, -1].forEach(function (sign) {
      var a = MACH * sign;
      var c = Math.cos(a);
      var s = Math.sin(a);
      var dx = bx * c - by * s;
      var dy = bx * s + by * c;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x + dx * L, pos.y + dy * L);
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 * alpha).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  function drawParticle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = ACCENT;
    ctx.fill();
  }

  function sphereR() {
    return Math.min(W, H) * 0.24;
  }

  /* Wireframe sphere, tilted, rotating about its vertical axis. */
  function project(theta, psi, cx, cy, r, cT, sT) {
    var ct = Math.cos(theta);
    var X = ct * Math.sin(psi);
    var Y0 = Math.sin(theta);
    var Z = ct * Math.cos(psi);
    var Yr = Y0 * cT - Z * sT;
    var Zr = Y0 * sT + Z * cT;
    return { x: cx + X * r, y: cy - Yr * r, z: Zr };
  }

  function strokeSeg(a, b, rgba) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = rgba;
    ctx.stroke();
  }

  function drawSphere(r, rot, alpha) {
    var cx = W / 2;
    var cy = H / 2;
    var cT = Math.cos(0.42);
    var sT = Math.sin(0.42);
    var i;
    var k;

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.9 * alpha).toFixed(3) + ')';
    ctx.stroke();

    for (i = 0; i < 8; i++) {
      var lam = i * Math.PI / 8 + rot;
      for (k = 0; k < 24; k++) {
        var t1 = -Math.PI / 2 + Math.PI * k / 24;
        var t2 = -Math.PI / 2 + Math.PI * (k + 1) / 24;
        var a = project(t1, lam, cx, cy, r, cT, sT);
        var b = project(t2, lam, cx, cy, r, cT, sT);
        var front = a.z + b.z > 0;
        strokeSeg(a, b, 'rgba(255,255,255,' + ((front ? 0.5 : 0.12) * alpha).toFixed(3) + ')');
      }
    }

    var lats = [-Math.PI / 3, -Math.PI / 6, 0, Math.PI / 6, Math.PI / 3];
    for (i = 0; i < lats.length; i++) {
      var theta = lats[i];
      var isEquator = theta === 0;
      for (k = 0; k < 48; k++) {
        var p1 = project(theta, k * TAU / 48, cx, cy, r, cT, sT);
        var p2 = project(theta, (k + 1) * TAU / 48, cx, cy, r, cT, sT);
        var front2 = p1.z + p2.z > 0;
        var base = isEquator ? '255,59,0' : '255,255,255';
        var a2 = (isEquator ? 0.9 : (front2 ? 0.5 : 0.12)) * alpha;
        strokeSeg(p1, p2, 'rgba(' + base + ',' + a2.toFixed(3) + ')');
      }
    }
  }

  var start = 0;
  var raf = 0;
  var revealing = false;
  var revealAt = 0;
  var maxR = 1;
  var skipRequested = false;
  var loaded = document.readyState === 'complete';

  window.addEventListener('load', function () { loaded = true; }, { once: true });

  function beginReveal(now) {
    if (revealing) return;
    revealing = true;
    revealAt = now;
    var cx = W / 2;
    var cy = H / 2;
    maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + 4;
    window.dispatchEvent(new CustomEvent('tachyon:reveal', { detail: { x: cx, y: cy, maxR: maxR } }));
    root.classList.add('go');
  }

  function finish() {
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
    window.removeEventListener('keydown', onSkip, true);
    window.removeEventListener('pointerdown', onSkip, true);
    root.classList.add('done');
    if (main) main.style.clipPath = 'none';
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }

  function onSkip() {
    if (revealing) return;
    if (performance.now() - start < SKIP_AFTER_MS) return;
    skipRequested = true;
  }

  function frame(now) {
    if (skipRequested && !revealing) {
      start = now - FLIGHT_MS;
      beginReveal(now);
    }

    var t = now - start;
    ctx.clearRect(0, 0, W, H);

    if (!revealing) {
      if (t < FLIGHT_MS) {
        var p = t / FLIGHT_MS;
        var pos = pathAt(p);
        var mat = clamp(t / 260, 0, 1);
        drawTrail(p);
        drawWake(p, 1);
        drawParticle(pos.x, pos.y, 4 * easeOutCubic(mat));
      } else {
        var tt = t - FLIGHT_MS;
        var grow = clamp(tt / SPHERE_GROW_MS, 0, 1);
        drawSphere(sphereR() * easeOutExpo(grow), t * 0.0004, 1);
        drawParticle(W / 2, H / 2, 3.5);
        if (t >= HOLD_MIN_MS && (loaded || t >= MAX_WAIT_MS)) beginReveal(now);
      }
    }

    if (revealing) {
      var rp = clamp((now - revealAt) / REVEAL_MS, 0, 1);
      var cx = W / 2;
      var cy = H / 2;
      if (main) {
        main.style.clipPath = 'circle(' + (maxR * easeInOutCubic(rp)).toFixed(1) + 'px at ' + cx + 'px ' + cy + 'px)';
      }
      var r2 = sphereR() + (maxR - sphereR()) * easeOutCubic(rp);
      var fade = 1 - clamp((rp - 0.45) / 0.55, 0, 1);
      drawSphere(r2, t * 0.0004, fade);
      if (rp >= 1) {
        finish();
        return;
      }
    }

    raf = window.requestAnimationFrame(frame);
  }

  window.addEventListener('keydown', onSkip, true);
  window.addEventListener('pointerdown', onSkip, true);

  start = performance.now();
  raf = window.requestAnimationFrame(frame);
})();
