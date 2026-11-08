const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const results = {};

  for (const [width, height, tag] of [[1440, 900, 'desk'], [390, 844, 'mob']]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('http://localhost:8766/index.html?introf=' + tag, { waitUntil: 'load' });

    const impact = await page.waitForFunction(() => {
      const f = document.querySelector('.ti-flash');
      return f && parseFloat(getComputedStyle(f).opacity) > 0.1;
    }, null, { timeout: 5000, polling: 10 }).then(() => page.evaluate(() => ({
      flash: getComputedStyle(document.querySelector('.ti-flash')).opacity,
      boot: getComputedStyle(document.getElementById('boot')).display,
      canvas: document.querySelector('.ti-canvas').width,
      target: (() => { const b = document.querySelector('.access__target').getBoundingClientRect(); return [+(b.left + b.width / 2).toFixed(1), +(b.top + b.height / 2).toFixed(1)]; })(),
      ready: document.documentElement.classList.contains('ready')
    })));

    const open = await page.waitForFunction(() => {
      const r = document.querySelector('.ti-aperture i');
      return r && parseFloat(r.style.width) > 200;
    }, null, { timeout: 5000, polling: 10 }).then(() => page.evaluate(() => {
      const ring = document.querySelector('.ti-aperture i');
      const boot = document.getElementById('boot');
      const target = document.querySelector('.access__target').getBoundingClientRect();
      return {
        ring: { left: ring.style.left, top: ring.style.top, width: ring.style.width },
        target: [+(target.left + target.width / 2).toFixed(1), +(target.top + target.height / 2).toFixed(1)],
        mask: getComputedStyle(boot).maskImage,
        ready: document.documentElement.classList.contains('ready'),
        title: getComputedStyle(document.querySelector('.entry__title .line>span')).transform
      };
    }));

    await page.waitForFunction(() => getComputedStyle(document.getElementById('boot')).display === 'none', null, { timeout: 5000, polling: 10 });
    const done = await page.evaluate(() => ({
      boot: getComputedStyle(document.getElementById('boot')).display,
      aperture: !!document.querySelector('.ti-aperture'),
      ready: document.documentElement.classList.contains('ready'),
      title: getComputedStyle(document.querySelector('.entry__title .line>span')).transform,
      lineOpacity: getComputedStyle(document.querySelector('.entry__line')).opacity,
      accessOpacity: getComputedStyle(document.getElementById('access')).opacity,
      scrollY,
      active: document.activeElement.tagName
    }));

    results[tag] = { impact, open, done, errors };
    await page.close();
  }

  // skip
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('http://localhost:8766/index.html?skipf=1', { waitUntil: 'load' });
    await page.waitForTimeout(350);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    results.skip = await page.evaluate(() => ({
      boot: getComputedStyle(document.getElementById('boot')).display,
      aperture: !!document.querySelector('.ti-aperture'),
      ready: document.documentElement.classList.contains('ready'),
      scrollY,
      title: getComputedStyle(document.querySelector('.entry__title .line>span')).transform
    }));
    results.skip.errors = errors;
    await page.close();
  }

  // reduced motion
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('http://localhost:8766/index.html?rmf=1', { waitUntil: 'load' });
    await page.waitForTimeout(300);
    results.reduced = await page.evaluate(() => ({
      boot: getComputedStyle(document.getElementById('boot')).display,
      ready: document.documentElement.classList.contains('ready'),
      title: getComputedStyle(document.querySelector('.entry__title .line>span')).transform,
      lineOpacity: getComputedStyle(document.querySelector('.entry__line')).opacity
    }));
    results.reduced.errors = errors;
    await page.close();
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
