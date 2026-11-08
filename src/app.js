(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var params = new URLSearchParams(window.location.search);
  var still = params.has('still');

  var entry = document.getElementById('top');
  var bar = document.getElementById('bar');
  var access = document.getElementById('access');
  var accessTarget = access ? access.querySelector('.access__target') : null;
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));

  var started = false;
  var hitTimer = 0;

  function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
  }

  /* ---------------------------------------------------------
     field
     --------------------------------------------------------- */
  var canvas = document.getElementById('field');
  var field = null;
  if (canvas && window.TachyonField) {
    field = window.TachyonField.init(canvas, { reducedMotion: reduce });
  }

  function targetRect() {
    return accessTarget ? accessTarget.getBoundingClientRect() : null;
  }

  function targetPoint() {
    var rect = targetRect();
    if (!rect || !rect.width || !rect.height) {
      return { x: 0.82, y: 0.5 };
    }
    return {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight
    };
  }

  function syncFieldCenter() {
    if (!field) return;
    var point = targetPoint();
    field.setCenter(point.x, point.y);
  }

  syncFieldCenter();

  var resizeRaf = 0;
  function onResize() {
    if (resizeRaf) return;
    resizeRaf = window.requestAnimationFrame(function () {
      resizeRaf = 0;
      syncFieldCenter();
    });
  }
  window.addEventListener('resize', onResize, { passive: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncFieldCenter).catch(function () {});
  }

  /* ---------------------------------------------------------
     site entry
     --------------------------------------------------------- */
  function startSite() {
    if (started) return;
    started = true;
    if (still) root.classList.add('still');
    root.classList.add('ready');

    if (field) field.pulse(1);

    if (access) {
      access.classList.add('hit');
      if (hitTimer) window.clearTimeout(hitTimer);
      hitTimer = window.setTimeout(function () {
        hitTimer = 0;
        access.classList.remove('hit');
      }, 900);
    }
  }

  var boot = document.getElementById('boot');

  function revealFallback() {
    if (boot) {
      boot.style.display = 'none';
      boot.innerHTML = '';
    }
    startSite();
  }

  if (window.TachyonIntro) {
    try {
      window.TachyonIntro.run({
        skip: params.get('nointro') === '1' || params.has('p'),
        reducedMotion: reduce,
        getTarget: targetPoint,
        onReveal: startSite,
        onDone: startSite
      });
    } catch (error) {
      revealFallback();
    }
    /* never leave the page behind a stuck boot screen */
    window.setTimeout(function () {
      if ((boot && boot.style.display !== 'none') || !started) revealFallback();
    }, 5000);
  } else {
    revealFallback();
  }

  /* ---------------------------------------------------------
     header after the entry
     --------------------------------------------------------- */
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;

      if (bar && entry) {
        var show = y > entry.offsetHeight * 0.62;
        bar.classList.toggle('on', show);
      }

      if (field) {
        field.setScroll(clamp(y / Math.max(1, window.innerHeight), 0, 1));
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     panel reveals
     --------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    panels.forEach(function (panel) { io.observe(panel); });
  } else {
    panels.forEach(function (panel) { panel.classList.add('in'); });
  }

  /* ---------------------------------------------------------
     debug deep-link
     --------------------------------------------------------- */
  if (params.has('p')) {
    var p = parseFloat(params.get('p'));
    if (isFinite(p)) {
      window.setTimeout(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, clamp(p, 0, 1) * max);
      }, 80);
    }
  }
})();
