/* Tachyon page logic: the bar, the panel reveals, and the safety net that
   opens the page if the intro never finishes. */
(function () {
  'use strict';

  var root = document.documentElement;
  var params = new URLSearchParams(window.location.search);
  var bar = document.getElementById('bar');
  var entry = document.getElementById('top');
  var released = false;

  function release() {
    if (released) return;
    released = true;
    root.classList.add('ready');
  }

  window.TachyonBoot = { release: release };

  /* The intro calls this. If it never does, the page still opens. */
  window.setTimeout(function () {
    if (!root.classList.contains('ready')) release();
  }, 3400);

  /* --- bar on scroll --- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY || 0;
      var vh = Math.max(1, window.innerHeight);
      if (bar && entry) bar.classList.toggle('on', y > vh * 0.6);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- panels in --- */
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    panels.forEach(function (p) { io.observe(p); });
  } else {
    panels.forEach(function (p) { p.classList.add('in'); });
  }

  /* --- debug deep link --- */
  if (params.has('p')) {
    var p = parseFloat(params.get('p'));
    if (isFinite(p)) {
      window.setTimeout(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, Math.max(0, Math.min(1, p)) * max);
      }, 120);
    }
  }
})();
