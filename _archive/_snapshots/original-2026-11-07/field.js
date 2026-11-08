(function () {
  'use strict';

  var TAU = Math.PI * 2;

  function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
  }

  function init(canvas, opts) {
    var options = opts || {};
    var ctx = canvas.getContext('2d');
    var reducedMotion = !!options.reducedMotion;

    var width = 1;
    var height = 1;
    var dpr = 1;

    var centerX = 0.82;
    var centerY = 0.5;
    var scroll = 0;
    var pulseT = 0;
    var pulseActive = false;
    var PULSE_MS = 900;

    var rafId = 0;
    var running = false;
    var destroyed = false;
    var startTime = (window.performance && performance.now) ? performance.now() : Date.now();

    function now() {
      return (window.performance && performance.now) ? performance.now() : Date.now();
    }

    function resize() {
      width = Math.max(1, window.innerWidth || 1);
      height = Math.max(1, window.innerHeight || 1);
      dpr = Math.min(2, window.devicePixelRatio || 1);

      var bufferW = Math.max(1, Math.round(width * dpr));
      var bufferH = Math.max(1, Math.round(height * dpr));

      if (canvas.width !== bufferW) canvas.width = bufferW;
      if (canvas.height !== bufferH) canvas.height = bufferH;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (reducedMotion) draw(0, true);
      else if (running && !document.hidden) draw(now());
    }

    function drawGrid(cx, cy, opacity) {
      var spacing = width < 700 ? 56 : 78;
      var major = 4;
      var cols = Math.ceil(width / spacing) + 1;
      var rows = Math.ceil(height / spacing) + 1;
      var i;

      ctx.lineWidth = 1;

      for (i = 0; i <= cols; i++) {
        var x = Math.round(i * spacing) + 0.5;
        var isMajor = i % major === 0;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle = 'rgba(244,243,238,' + ((isMajor ? 0.145 : 0.058) * opacity).toFixed(3) + ')';
        ctx.stroke();
      }

      for (i = 0; i <= rows; i++) {
        var y = Math.round(i * spacing) + 0.5;
        var rowMajor = i % major === 0;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.strokeStyle = 'rgba(244,243,238,' + ((rowMajor ? 0.115 : 0.048) * opacity).toFixed(3) + ')';
        ctx.stroke();
      }

      /* registration crosses at major intersections */
      ctx.strokeStyle = 'rgba(244,243,238,' + (0.24 * opacity).toFixed(3) + ')';
      for (var gx = 0; gx <= cols; gx += major) {
        for (var gy = 0; gy <= rows; gy += major) {
          var px = Math.round(gx * spacing) + 0.5;
          var py = Math.round(gy * spacing) + 0.5;
          ctx.beginPath();
          ctx.moveTo(px - 3, py);
          ctx.lineTo(px + 3, py);
          ctx.moveTo(px, py - 3);
          ctx.lineTo(px, py + 3);
          ctx.stroke();
        }
      }

      /* target axes */
      ctx.strokeStyle = 'rgba(244,243,238,' + (0.205 * opacity).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(0, Math.round(cy) + 0.5);
      ctx.lineTo(width, Math.round(cy) + 0.5);
      ctx.moveTo(Math.round(cx) + 0.5, 0);
      ctx.lineTo(Math.round(cx) + 0.5, height);
      ctx.stroke();
    }

    function contourPath(cx, cy, radius, index, phase, scale) {
      var segments = width < 700 ? 120 : 176;
      var tilt = -0.16 + Math.sin(phase * 0.35) * 0.015;
      var cosT = Math.cos(tilt);
      var sinT = Math.sin(tilt);

      ctx.beginPath();

      for (var s = 0; s <= segments; s++) {
        var angle = (s / segments) * TAU;
        var warp =
          1 +
          0.042 * Math.sin(angle * 3 + phase + index * 0.14) +
          0.021 * Math.sin(angle * 5 - phase * 1.25 + index * 0.08) +
          0.012 * Math.cos(angle * 2 - index * 0.055);

        var r = radius * warp * scale;
        var lx = Math.cos(angle) * r * 1.16;
        var ly = Math.sin(angle) * r * 0.8;
        var x = cx + lx * cosT - ly * sinT;
        var y = cy + lx * sinT + ly * cosT;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
    }

    function drawContours(cx, cy, t, opacity) {
      var count = width < 700 ? 23 : 34;
      var phase = t * 0.045;
      var maxR = Math.max(width, height) * 1.18;
      var minR = 30;
      var scale = 1 + 0.012 * Math.sin(t * 0.38);

      if (pulseActive) {
        scale += 0.016 * Math.sin((1 - pulseT / PULSE_MS) * Math.PI);
      }

      for (var i = 0; i < count; i++) {
        var p = i / (count - 1);
        var radius = minR + (maxR - minR) * Math.pow(p, 1.32);
        var isAccent = i % 7 === 3;
        var isDashed = i % 6 === 1;
        var alpha = (isAccent ? 0.29 : 0.235 - p * 0.095) * opacity;

        if (pulseActive) alpha += 0.06 * (1 - pulseT / PULSE_MS);

        contourPath(cx, cy, radius, i, phase, scale);
        ctx.lineWidth = isAccent ? 1.15 : 1;
        ctx.strokeStyle = isAccent
          ? 'rgba(255,59,0,' + alpha.toFixed(3) + ')'
          : 'rgba(244,243,238,' + alpha.toFixed(3) + ')';
        ctx.setLineDash(isDashed ? [1.5, 6] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      /* measured ticks on the stronger rings */
      for (var k = 0; k < count; k += 5) {
        var pk = k / (count - 1);
        var rk = (minR + (maxR - minR) * Math.pow(pk, 1.32)) * scale;
        var tickPhase = phase + k * 0.14;
        for (var a = 0; a < 4; a++) {
          var ang = (Math.PI / 2) * a + 0.18;
          var cosA = Math.cos(ang);
          var sinA = Math.sin(ang);
          var x1 = cx + cosA * rk * 1.16;
          var y1 = cy + sinA * rk * 0.8;
          var x2 = cx + cosA * (rk + 5) * 1.16;
          var y2 = cy + sinA * (rk + 5) * 0.8;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = 'rgba(244,243,238,' + (0.32 * opacity).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    function drawCenter(cx, cy, opacity) {
      ctx.strokeStyle = 'rgba(244,243,238,' + (0.5 * opacity).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy);
      ctx.lineTo(cx + 9, cy);
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx, cy + 9);
      ctx.stroke();
    }

    function draw(timestamp, staticFrame) {
      if (destroyed) return;

      var t = staticFrame ? 0 : (timestamp - startTime) / 1000;
      var cx = centerX * width;
      var cy = centerY * height;
      var scrolled = clamp(scroll, 0, 1);
      var opacity = 1 - 0.42 * scrolled;

      if (pulseActive) {
        pulseT += 16.6667;
        if (pulseT >= PULSE_MS) {
          pulseT = PULSE_MS;
          pulseActive = false;
        }
      }

      ctx.clearRect(0, 0, width, height);
      drawGrid(cx, cy, opacity);
      drawContours(cx, cy, t, opacity);
      drawCenter(cx, cy, opacity);
    }

    function frame(timestamp) {
      if (!running || destroyed) return;
      draw(timestamp);
      rafId = window.requestAnimationFrame(frame);
    }

    function startLoop() {
      if (running || destroyed || reducedMotion) return;
      running = true;
      rafId = window.requestAnimationFrame(frame);
    }

    function stopLoop() {
      running = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    function setCenter(x, y) {
      if (isFinite(x)) centerX = clamp(x, 0, 1);
      if (isFinite(y)) centerY = clamp(y, 0, 1);
      if (reducedMotion) draw(0, true);
    }

    function setScroll(value) {
      var next = Number(value);
      if (!isFinite(next)) next = 0;
      scroll = clamp(next, 0, 1);
    }

    function pulse(strength) {
      if (reducedMotion) return;
      var s = Number(strength);
      if (!isFinite(s)) s = 1;
      pulseT = 0;
      pulseActive = s > 0;
    }

    function onVisibility() {
      if (document.hidden) stopLoop();
      else startLoop();
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      stopLoop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      ctx.clearRect(0, 0, width, height);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    resize();

    if (!reducedMotion) startLoop();
    else draw(0, true);

    return {
      setCenter: setCenter,
      setScroll: setScroll,
      pulse: pulse,
      destroy: destroy
    };
  }

  window.TachyonField = { init: init };
})();
