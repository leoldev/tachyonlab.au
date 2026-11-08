/* Tachyon demo — an agent working, on a loop.

   No buttons, because an agent does not wait to be clicked. Four beats:
   the matter appears, the agent reads it, one correction is proposed, and
   exactly one trace is written to the local store. Then it repeats.

   Canvas only. No network, no model, no timers other than the frame loop.
*/
(function () {
  'use strict';

  var canvas = document.getElementById('demo-canvas');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var LOOP = 10400;
  var W = 1, H = 1, dpr = 1;
  var start = 0;
  var raf = 0;
  var running = false;
  var visible = true;

  var LINES = [0.92, 0.74, 0.96, 0.58, 0.86, 0.69, 0.91, 0.47, 0.8];
  var TRACES = [0.86, 0.72, 0.9, 0.62];

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ease(t) { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }

  function size() {
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function mono(text, x, y, color, size) {
    ctx.font = (size || 12) + 'px "IBM Plex Mono", ui-monospace, monospace';
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, x, y);
  }

  function layout() {
    var pad = W < 640 ? 18 : 30;
    var split = W < 640 ? 0.52 : 0.58;
    return {
      pad: pad,
      leftX: pad,
      leftW: W * split - pad * 1.4,
      rightX: W * split + pad * 0.5,
      rightW: W - W * split - pad * 1.5,
      top: pad + 34,
      lineGap: Math.max(18, Math.min(26, (H - pad * 2 - 60) / 9)),
      splitX: W * split
    };
  }

  function draw(t) {
    var L = layout();
    var i;

    ctx.clearRect(0, 0, W, H);

    /* labels */
    mono('MATTER', L.leftX, L.pad + 12, 'rgba(156,156,148,.9)', 11);
    mono('LOCAL TRACES', L.rightX, L.pad + 12, 'rgba(156,156,148,.9)', 11);
    mono('0 out', L.rightX + L.rightW, L.pad + 12, 'rgba(255,59,0,.9)', 11);

    /* divider */
    ctx.beginPath();
    ctx.moveTo(L.splitX, L.pad);
    ctx.lineTo(L.splitX, H - L.pad);
    ctx.strokeStyle = 'rgba(244,243,238,.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    /* --- the matter --- */
    var docIn = clamp(t / 900, 0, 1);
    for (i = 0; i < LINES.length; i++) {
      var appear = clamp((docIn * 900 - i * 55) / 380, 0, 1);
      if (appear <= 0) continue;
      var y = L.top + i * L.lineGap;
      var w = L.leftW * LINES[i] * easeOut(appear);
      ctx.beginPath();
      ctx.moveTo(L.leftX, y);
      ctx.lineTo(L.leftX + w, y);
      ctx.strokeStyle = 'rgba(244,243,238,' + (0.30 * appear).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* --- reading: a highlight moves down the page --- */
    var readT = clamp((t - 900) / 2300, 0, 1);
    if (readT > 0 && readT < 1.001) {
      var from = 1;
      var to = 6;
      var pos = from + (to - from) * ease(readT);
      var hy = L.top + pos * L.lineGap;
      var band = L.lineGap * 1.15;
      ctx.fillStyle = 'rgba(244,243,238,.055)';
      ctx.fillRect(L.leftX - 8, hy - band / 2, L.leftW + 16, band);
      ctx.fillStyle = 'rgba(255,59,0,.9)';
      ctx.fillRect(L.leftX - 14, hy - 3, 4, 6);
    }

    /* --- the correction lands on one line --- */
    var markT = clamp((t - 3200) / 700, 0, 1);
    if (markT > 0) {
      var my = L.top + 4 * L.lineGap;
      var mw = L.leftW * LINES[4] * easeOut(markT);
      ctx.beginPath();
      ctx.moveTo(L.leftX, my + 5);
      ctx.lineTo(L.leftX + mw, my + 5);
      ctx.strokeStyle = 'rgba(255,59,0,.95)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    /* --- one trace travels to the store --- */
    var travelT = clamp((t - 3900) / 900, 0, 1);
    if (travelT > 0 && travelT < 1) {
      var sx = L.leftX + L.leftW * LINES[4] * 0.5;
      var sy = L.top + 4 * L.lineGap + 5;
      var ex = L.rightX;
      var ey = L.top + 3 * Math.max(16, L.lineGap * 0.8);
      var e = ease(travelT);
      var x = sx + (ex - sx) * e;
      var y = sy + (ey - sy) * e - Math.sin(Math.PI * e) * 26;
      ctx.fillStyle = '#FF3B00';
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }

    /* --- the trace store --- */
    var storeGap = Math.max(16, L.lineGap * 0.8);
    for (i = 0; i < TRACES.length; i++) {
      if (i === 3 && t < 4700) continue;
      var grow = i === 3 ? easeOut(clamp((t - 4700) / 600, 0, 1)) : 1;
      if (grow <= 0) continue;
      var ty = L.top + i * storeGap;
      var tw = L.rightW * TRACES[i] * grow;
      ctx.beginPath();
      ctx.moveTo(L.rightX, ty);
      ctx.lineTo(L.rightX + tw, ty);
      ctx.strokeStyle = i === 3 ? 'rgba(244,243,238,.62)' : 'rgba(244,243,238,.26)';
      ctx.lineWidth = 1;
      ctx.stroke();
      if (i === 3) {
        ctx.fillStyle = '#FF3B00';
        ctx.fillRect(L.rightX - 9, ty - 2.5, 5, 5);
      }
    }

    /* --- the loop exhales --- */
    var outT = clamp((t - 9000) / 700, 0, 1);
    if (outT > 0) {
      ctx.fillStyle = 'rgba(7,7,6,' + (outT * 0.92).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  function frame(ts) {
    if (!running) return;
    if (!start) start = ts;
    var t = (ts - start) % LOOP;
    draw(t);
    raf = window.requestAnimationFrame(frame);
  }

  function begin() {
    if (running || reduced) return;
    running = true;
    start = 0;
    raf = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  }

  function onVisibility() {
    if (document.hidden || !visible) stop();
    else begin();
  }

  size();
  if (reduced) {
    draw(5200);
  } else {
    begin();
  }

  window.addEventListener('resize', function () { size(); if (reduced) draw(5200); });
  document.addEventListener('visibilitychange', onVisibility);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) begin(); else stop();
    }, { threshold: 0.15 }).observe(canvas);
  }
})();
