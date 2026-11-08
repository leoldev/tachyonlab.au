const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const out = {};

  async function track(width, height, label) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('http://localhost:8766/index.html?intro=qa', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready.then(() => true));

    const snap = async (name) => {
      const state = await page.evaluate(() => {
        const boot = document.getElementById('boot');
        const ring = document.querySelector('.ti-aperture i');
        const target = document.querySelector('.access__target');
        const tb = target.getBoundingClientRect();
        const titleSpan = document.querySelector('.entry__title .line>span');
        return {
          t: Math.round(performance.now()),
          bootDisplay: getComputedStyle(boot).display,
          bootClasses: boot.className,
          ix: getComputedStyle(boot).getPropertyValue('--ix').trim(),
          iy: getComputedStyle(boot).getPropertyValue('--iy').trim(),
          ring: ring ? { left: ring.style.left, top: ring.style.top, w: getComputedStyle(ring).width } : null,
          clip: getComputedStyle(boot).clipPath,
          targetCx: +(tb.left + tb.width / 2).toFixed(1),
          targetCy: +(tb.top + tb.height / 2).toFixed(1),
          ready: document.documentElement.classList.contains('ready'),
          accessHit: document.getElementById('access').classList.contains('hit'),
          titleTransform: getComputedStyle(titleSpan).transform,
          titleOpacity: getComputedStyle(document.querySelector('.entry__line')).opacity
        };
      });
      await page.screenshot({ path: `_shots/intro-${label}-${name}.png` });
      return state;
    };

    const states = {};
    await page.waitForTimeout(700);
    states.flight = await snap('0-flight');
    await page.waitForTimeout(560);
    states.impact = await snap('1-impact');
    await page.waitForTimeout(300);
    states.open = await snap('2-open');
    await page.waitForTimeout(300);
    states.opening = await snap('3-opening');
    await page.waitForTimeout(800);
    states.done = await snap('4-done');

    out[label] = { states, errors };
    await page.close();
  }

  await track(1440, 900, 'desk');
  await track(390, 844, 'mob');

  // skip path
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('http://localhost:8766/index.html?skip=qa', { waitUntil: 'load' });
    await page.waitForTimeout(450);
    await page.keyboard.press('Space');
    await page.waitForTimeout(400);
    out.skip = await page.evaluate(() => ({
      bootDisplay: getComputedStyle(document.getElementById('boot')).display,
      ready: document.documentElement.classList.contains('ready'),
      aperture: !!document.querySelector('.ti-aperture'),
      title: getComputedStyle(document.querySelector('.entry__title .line>span')).transform,
      lineOpacity: getComputedStyle(document.querySelector('.entry__line')).opacity,
      scrollY
    }));
    out.skip.errors = errors;
    await page.close();
  }

  // reduced motion
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('http://localhost:8766/index.html?rm=qa', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    out.reduced = await page.evaluate(() => ({
      bootDisplay: getComputedStyle(document.getElementById('boot')).display,
      ready: document.documentElement.classList.contains('ready'),
      titleTransform: getComputedStyle(document.querySelector('.entry__title .line>span')).transform,
      lineOpacity: getComputedStyle(document.querySelector('.entry__line')).opacity,
      aperture: !!document.querySelector('.ti-aperture')
    }));
    out.reduced.errors = errors;
    await page.screenshot({ path: '_shots/intro-reduced.png' });
    await page.close();
  }

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
