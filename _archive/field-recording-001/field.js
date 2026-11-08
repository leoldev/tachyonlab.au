(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var FOV = 780;
  var CAMERA_DISTANCE = 900;
  var SHAPE_MS = 1400;
  var PULSE_MS = 900;

  function clamp(value, min, max) {
    return value < min ? min : (value > max ? max : value);
  }

  function mulberry32(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) | 0;
      var t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildShapes(N) {
    var random = mulberry32(0x7ac7104);
    var plane = new Array(N);
    var cone = new Array(N);
    var sphere = new Array(N);
    var torus = new Array(N);
    var cols = 44;
    var rows = 34;
    var gridCount = cols * rows;
    var i;
    var x;
    var y;
    var z;
    var t;
    var angle;

    for (i = 0; i < N; i++) {
      var gridIndex = N <= gridCount
        ? Math.floor((i * gridCount) / N)
        : i % gridCount;
      var col = gridIndex % cols;
      var row = Math.floor(gridIndex / cols);
      x = (col - (cols - 1) * 0.5) * 26;
      y = (row - (rows - 1) * 0.5) * 26;
      z = Math.sin(x * 0.012 + y * 0.009) * 36;
      plane[i] = { x: x, y: y, z: z };
    }

    for (i = 0; i < N; i++) {
      t = Math.sqrt(random());
      angle = random() * TAU;
      x = Math.cos(angle) * 260 * t + (random() * 2 - 1) * 6;
      y = -300 + 580 * t;
      z = Math.sin(angle) * 260 * t + (random() * 2 - 1) * 6;
      cone[i] = { x: x, y: y, z: z };
    }

    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (i = 0; i < N; i++) {
      var normalizedY = N > 1 ? 1 - (i / (N - 1)) * 2 : 0;
      var ringRadius = Math.sqrt(Math.max(0, 1 - normalizedY * normalizedY));
      var theta = i * goldenAngle;
      sphere[i] = {
        x: Math.cos(theta) * ringRadius * 300,
        y: normalizedY * 300,
        z: Math.sin(theta) * ringRadius * 300
      };
    }

    for (i = 0; i < N; i++) {
      var u = random() * TAU;
      var v = random() * TAU;
      var ring = 250 + 96 * Math.cos(v);
      torus[i] = {
        x: ring * Math.cos(u),
        y: 96 * Math.sin(v),
        z: ring * Math.sin(u)
      };
    }

    return { plane: plane, cone: cone, sphere: sphere, torus: torus };
  }

  function init(canvas, options) {
    if (!canvas || typeof canvas.getContext !== 'function') {
      return null;
    }

    var ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    options = options || {};

    var N = Number(options.count || 1500);
    N = Math.floor(N);
    if (!isFinite(N) || N < 1) {
      N = 1500;
    }
    if (window.innerWidth < 760) {
      N = 700;
    }

    var accentEvery = Number(options.accentEvery || 113);
    accentEvery = Math.floor(accentEvery);
    if (!isFinite(accentEvery) || accentEvery < 1) {
      accentEvery = 113;
    }

    var reducedMotion = !!options.reducedMotion;
    var shapes = buildShapes(N);
    var current = new Array(N);
    var projected = new Array(N);
    var order = new Array(N);
    var i;

    for (i = 0; i < N; i++) {
      var source = shapes.plane[i];
      current[i] = { x: source.x, y: source.y, z: source.z };
      projected[i] = { x: 0, y: 0, z: 0, s: 1 };
      order[i] = i;
    }

    var shapeName = 'plane';
    var targetShape = shapes.plane;
    var fromShape = null;
    var transitionStart = 0;
    var morphing = false;

    var dpr = 1;
    var widthCss = 1;
    var heightCss = 1;
    var centerX = 0;
    var centerY = 0;

    var pointerX = 0.5;
    var pointerY = 0.5;
    var pointerScreenX = 0;
    var pointerScreenY = 0;
    var pointerInside = false;

    var scroll = 0;
    var scrollVelocity = 0;

    var pulseT = 0;
    var pulseStrength = 0;
    var pulseActive = false;

    var rafId = 0;
    var running = false;
    var destroyed = false;
    var lastFrameTime = 0;
    var startTime = (window.performance && typeof window.performance.now === 'function')
      ? window.performance.now()
      : Date.now();

    var neutralStyles = {};

    function nowMs() {
      if (window.performance && typeof window.performance.now === 'function') {
        return window.performance.now();
      }
      return Date.now();
    }

    function neutralStyle(alpha) {
      var rounded = Math.round(alpha * 1000) / 1000;
      var key = String(rounded);
      var style = neutralStyles[key];
      if (!style) {
        style = 'rgba(242,242,240,' + rounded + ')';
        neutralStyles[key] = style;
      }
      return style;
    }

    function copyShapeToCurrent(shape) {
      for (var j = 0; j < N; j++) {
        current[j].x = shape[j].x;
        current[j].y = shape[j].y;
        current[j].z = shape[j].z;
      }
    }

    function projectPoints(angleY, angleX, zJitter, pulseOffset) {
      var cosY = Math.cos(angleY);
      var sinY = Math.sin(angleY);
      var cosX = Math.cos(angleX);
      var sinX = Math.sin(angleX);

      for (var j = 0; j < N; j++) {
        var point = current[j];
        var px = point.x;
        var py = point.y;
        var pz = point.z;

        var rotatedX = px * cosY + pz * sinY;
        var rotatedZ = -px * sinY + pz * cosY;
        var rotatedY = py * cosX - rotatedZ * sinX;
        var depth = py * sinX + rotatedZ * cosX + zJitter;

        var s = clamp(FOV / (FOV + depth + CAMERA_DISTANCE), 0.2, 2.2);
        var screenX = centerX + rotatedX * s;
        var screenY = centerY + rotatedY * s;

        if (pulseOffset > 0) {
          var dx = screenX - centerX;
          var dy = screenY - centerY;
          var distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0.0001) {
            screenX += (dx / distance) * pulseOffset;
            screenY += (dy / distance) * pulseOffset;
          } else {
            var fallbackAngle = j * 2.399963229728653;
            screenX += Math.cos(fallbackAngle) * pulseOffset;
            screenY += Math.sin(fallbackAngle) * pulseOffset;
          }
        }

        projected[j].x = screenX;
        projected[j].y = screenY;
        projected[j].z = depth;
        projected[j].s = s;
      }
    }

    function paintPoint(index) {
      var point = projected[index];
      var s = point.s;
      var size = clamp(1.1 * s, 0.7, 2.4);
      var alpha = clamp(0.10 + s * 0.42, 0.06, 0.85);

      if (index % accentEvery === 0) {
        ctx.globalAlpha = Math.max(alpha, 0.9);
        ctx.fillStyle = '#FF3B00';
        size += 0.4;
      } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = neutralStyle(alpha);
      }

      ctx.fillRect(
        point.x * dpr - size * 0.5,
        point.y * dpr - size * 0.5,
        size,
        size
      );
    }

    function paintPoints() {
      if (N <= 1600) {
        order.sort(function (a, b) {
          return projected[a].z - projected[b].z;
        });
        for (var j = 0; j < N; j++) {
          paintPoint(order[j]);
        }
      } else {
        for (var k = 0; k < N; k++) {
          paintPoint(k);
        }
      }
      ctx.globalAlpha = 1;
    }

    function drawScene(angleY, angleX, zJitter, pulseOffset, drawPointer) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      projectPoints(angleY, angleX, zJitter, pulseOffset);
      paintPoints();

      if (!drawPointer || !pointerInside || reducedMotion) {
        return;
      }

      var pointerPx = pointerScreenX * dpr;
      var pointerPy = pointerScreenY * dpr;
      var nearby = [];
      var limit = 150 * 150;
      var j;

      for (j = 0; j < N; j++) {
        var dx = projected[j].x - pointerScreenX;
        var dy = projected[j].y - pointerScreenY;
        var distanceSq = dx * dx + dy * dy;
        if (distanceSq <= limit) {
          nearby.push({ distance: distanceSq, index: j });
        }
      }

      nearby.sort(function (a, b) {
        return a.distance - b.distance;
      });

      var count = Math.min(48, nearby.length);
      if (count > 0) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,59,0,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (j = 0; j < count; j++) {
          var hit = projected[nearby[j].index];
          ctx.moveTo(pointerPx, pointerPy);
          ctx.lineTo(hit.x * dpr, hit.y * dpr);
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(242,242,240,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo((pointerScreenX - 18) * dpr, pointerPy);
      ctx.lineTo((pointerScreenX + 18) * dpr, pointerPy);
      ctx.moveTo(pointerPx, (pointerScreenY - 18) * dpr);
      ctx.lineTo(pointerPx, (pointerScreenY + 18) * dpr);
      ctx.stroke();
    }

    function drawStatic() {
      var angleY = pointerX * 0.5 + scroll * 0.9;
      var angleX = pointerY * 0.28;
      drawScene(angleY, angleX, 0, 0, false);
    }

    function updateMorph(timestamp) {
      if (!morphing) {
        return;
      }

      var progress = (timestamp - transitionStart) / SHAPE_MS;
      if (progress < 0) {
        progress = 0;
      }

      if (progress >= 1) {
        copyShapeToCurrent(targetShape);
        morphing = false;
        fromShape = null;
        return;
      }

      var eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      for (var j = 0; j < N; j++) {
        var from = fromShape[j];
        var to = targetShape[j];
        var point = current[j];
        point.x = from.x + (to.x - from.x) * eased;
        point.y = from.y + (to.y - from.y) * eased;
        point.z = from.z + (to.z - from.z) * eased;
      }
    }

    function drawFrame(timestamp) {
      if (destroyed) {
        return;
      }

      updateMorph(timestamp);

      var dt = lastFrameTime ? timestamp - lastFrameTime : 16.6667;
      if (dt < 0) {
        dt = 0;
      } else if (dt > 50) {
        dt = 50;
      }
      lastFrameTime = timestamp;

      scrollVelocity *= Math.pow(0.86, dt / 16.6667);
      if (Math.abs(scrollVelocity) < 0.000001) {
        scrollVelocity = 0;
      }

      var pulseOffset = 0;
      if (pulseActive) {
        pulseT += dt;
        if (pulseT >= PULSE_MS) {
          pulseT = PULSE_MS;
          pulseActive = false;
        }
        pulseOffset = 40 * pulseStrength * Math.sin(Math.PI * clamp(pulseT / PULSE_MS, 0, 1));
      }

      var time = (timestamp - startTime) / 1000;
      var angleY = time * 0.055 + pointerX * 0.5 + scroll * 0.9;
      var angleX = pointerY * 0.28 + Math.sin(time * 0.11) * 0.04;
      var zJitter = scrollVelocity * 120;

      drawScene(angleY, angleX, zJitter, pulseOffset, true);
    }

    function loop(timestamp) {
      rafId = 0;
      if (!running || destroyed || document.hidden) {
        return;
      }
      drawFrame(timestamp);
      if (running && !destroyed && !document.hidden) {
        rafId = window.requestAnimationFrame(loop);
      }
    }

    function startLoop() {
      if (running || destroyed || reducedMotion || document.hidden) {
        return;
      }
      running = true;
      lastFrameTime = nowMs();
      rafId = window.requestAnimationFrame(loop);
    }

    function stopLoop() {
      running = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    function setShape(name) {
      if (!Object.prototype.hasOwnProperty.call(shapes, name)) {
        return;
      }
      if (name === shapeName) {
        return;
      }

      shapeName = name;
      targetShape = shapes[name];

      if (reducedMotion) {
        copyShapeToCurrent(targetShape);
        morphing = false;
        fromShape = null;
        drawStatic();
        return;
      }

      fromShape = new Array(N);
      for (var j = 0; j < N; j++) {
        fromShape[j] = {
          x: current[j].x,
          y: current[j].y,
          z: current[j].z
        };
      }
      transitionStart = nowMs();
      morphing = true;
    }

    function setScroll(progress01) {
      var next = Number(progress01);
      if (!isFinite(next)) {
        next = 0;
      }
      next = clamp(next, 0, 1);
      var delta = next - scroll;
      scroll = next;
      scrollVelocity = scrollVelocity * 0.55 + delta * 0.85;
    }

    function setPointer(x01, y01) {
      var nextX = Number(x01);
      var nextY = Number(y01);
      if (!isFinite(nextX)) {
        nextX = 0;
      }
      if (!isFinite(nextY)) {
        nextY = 0;
      }

      pointerX = clamp(nextX, 0, 1);
      pointerY = clamp(nextY, 0, 1);
      pointerScreenX = pointerX * widthCss;
      pointerScreenY = pointerY * heightCss;
      pointerInside = true;
    }

    function pulse(strength01) {
      if (reducedMotion) {
        return;
      }
      var strength = Number(strength01);
      if (!isFinite(strength)) {
        strength = 0;
      }
      pulseStrength = clamp(strength, 0, 1);
      pulseT = 0;
      pulseActive = pulseStrength > 0;
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var cssWidth = rect.width || window.innerWidth || 1;
      var cssHeight = rect.height || window.innerHeight || 1;

      widthCss = Math.max(1, cssWidth);
      heightCss = Math.max(1, cssHeight);

      dpr = Number(window.devicePixelRatio || 1);
      if (!isFinite(dpr) || dpr <= 0) {
        dpr = 1;
      }
      dpr = Math.min(dpr, 2);

      var bufferWidth = Math.max(1, Math.round(widthCss * dpr));
      var bufferHeight = Math.max(1, Math.round(heightCss * dpr));

      if (canvas.width !== bufferWidth) {
        canvas.width = bufferWidth;
      }
      if (canvas.height !== bufferHeight) {
        canvas.height = bufferHeight;
      }

      centerX = widthCss * 0.5;
      centerY = heightCss * 0.5;

      if (reducedMotion) {
        drawStatic();
      } else if (running && !document.hidden) {
        drawFrame(nowMs());
      }
    }

    function onPointerMove(event) {
      if (event.pointerType && event.pointerType !== 'mouse') {
        return;
      }
      var rect = canvas.getBoundingClientRect();
      var rectWidth = rect.width || widthCss;
      var rectHeight = rect.height || heightCss;
      var localX = event.clientX - rect.left;
      var localY = event.clientY - rect.top;

      if (localX >= 0 && localY >= 0 && localX <= rectWidth && localY <= rectHeight) {
        pointerInside = true;
        pointerX = clamp(localX / rectWidth, 0, 1);
        pointerY = clamp(localY / rectHeight, 0, 1);
        pointerScreenX = localX;
        pointerScreenY = localY;
      } else {
        pointerInside = false;
      }
    }

    function onPointerLeave() {
      pointerInside = false;
    }

    function onVisibilityChange() {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    }

    function destroy() {
      if (destroyed) {
        return;
      }
      destroyed = true;
      stopLoop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', onPointerLeave);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);

    if (!reducedMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('blur', onPointerLeave);
      document.addEventListener('pointerleave', onPointerLeave);
    }

    resize();

    if (!reducedMotion) {
      startLoop();
    }

    return {
      setShape: setShape,
      setScroll: setScroll,
      setPointer: setPointer,
      pulse: pulse,
      destroy: destroy
    };
  }

  window.TachyonField = { init: init };
})();
