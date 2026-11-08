(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------------------------------------------------------
     radial reveal: every block starts at the centre of the
     screen and travels to its place in the layout
     --------------------------------------------------------- */
  function placeRadial(cx, cy) {
    var items = document.querySelectorAll('.rad');
    for (var i = 0; i < items.length; i++) {
      var r = items[i].getBoundingClientRect();
      var dx = (cx - (r.left + r.width / 2)) * 0.35;
      var dy = (cy - (r.top + r.height / 2)) * 0.35;
      items[i].style.setProperty('--dx', dx.toFixed(1) + 'px');
      items[i].style.setProperty('--dy', dy.toFixed(1) + 'px');
      if (reduce) items[i].style.transition = 'none';
    }
  }

  window.addEventListener('tachyon:reveal', function (e) {
    placeRadial(e.detail.x, e.detail.y);
  });

  if (reduce || document.documentElement.classList.contains('done')) {
    root.classList.add('go', 'done');
  }

  /* ---------------------------------------------------------
     demo — fixed steps, no model, nothing leaves the page
     --------------------------------------------------------- */
  var demo = document.getElementById('demo-app');
  if (demo) {
    var out = demo.querySelector('[data-out]');
    var traces = demo.querySelector('[data-traces]');
    var status = demo.querySelector('[data-status]');
    var btnCorrect = demo.querySelector('[data-act="correct"]');
    var btnTrain = demo.querySelector('[data-act="train"]');
    var btnDelete = demo.querySelector('[data-act="delete"]');

    var DRAFT = 'Dear Maya, I hope this message finds you well. The deadline is Friday at noon.';
    var SHORT = 'Maya, the deadline is Friday at noon.';

    var state = { count: 0, trained: false, corrected: false };

    function render() {
      traces.textContent = String(state.count);
      btnTrain.disabled = state.count === 0 || state.trained;
      btnCorrect.disabled = state.corrected;
      out.textContent = state.trained ? SHORT : DRAFT;
    }

    btnCorrect.addEventListener('click', function () {
      state.count += 1;
      state.corrected = true;
      status.textContent = 'Simulated: one correction saved as a local trace.';
      render();
    });

    btnTrain.addEventListener('click', function () {
      state.trained = true;
      status.textContent = 'Simulated: adapter trained on your local traces.';
      render();
    });

    btnDelete.addEventListener('click', function () {
      state.count = 0;
      state.trained = false;
      state.corrected = false;
      status.textContent = 'Simulated: adapter, traces and key deleted.';
      render();
    });

    render();
  }
})();
