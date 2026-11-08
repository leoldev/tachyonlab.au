const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const out = {};

  // 1. click-to-skip
  {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.goto('http://localhost:8766/index.html?v=13', { waitUntil: 'load' });
    await p.waitForTimeout(350);
    const before = await p.evaluate(() => ({ overlay: !!document.querySelector('.ti-overlay'), cls: document.documentElement.className }));
    await p.mouse.click(720, 450);
    await p.waitForTimeout(900);
    const after = await p.evaluate(() => ({
      overlay: !!document.querySelector('.ti-overlay'),
      boot: document.getElementById('boot') ? getComputedStyle(document.getElementById('boot')).display : null,
      cls: document.documentElement.className,
      titleTransform: getComputedStyle(document.querySelector('.cover__title .line > span')).transform
    }));
    out.skip = { before, after, errors };
    await p.close();
  }

  // 2. reduced motion
  {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.goto('http://localhost:8766/index.html?v=14', { waitUntil: 'load' });
    await p.waitForTimeout(500);
    const state = await p.evaluate(() => ({
      overlay: !!document.querySelector('.ti-overlay'),
      boot: document.getElementById('boot') ? getComputedStyle(document.getElementById('boot')).display : null,
      cls: document.documentElement.className,
      statement: getComputedStyle(document.querySelector('.statement__word')).transform
    }));
    out.reduced = { state, errors };
    await p.screenshot({ path: '_shots/qa-reduced.png' });
    await p.close();
  }

  // 3. ?p= debug
  {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto('http://localhost:8766/index.html?p=0.5&v=15', { waitUntil: 'load' });
    await p.waitForTimeout(900);
    out.debugP = await p.evaluate(() => ({
      y: Math.round(scrollY),
      max: document.documentElement.scrollHeight - innerHeight,
      boot: getComputedStyle(document.getElementById('boot')).display,
      active: document.querySelector('.rail a.on')?.dataset.sec || null
    }));
    await p.close();
  }

  // 4. keyboard skip + focus
  {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await p.goto('http://localhost:8766/index.html?v=16', { waitUntil: 'load' });
    await p.waitForTimeout(400);
    await p.keyboard.press('Tab');
    const focus1 = await p.evaluate(() => ({ tag: document.activeElement.tagName, text: document.activeElement.textContent.trim().slice(0, 30), cls: document.activeElement.className }));
    await p.keyboard.press('Enter');
    await p.waitForTimeout(900);
    const after = await p.evaluate(() => ({ overlay: !!document.querySelector('.ti-overlay'), boot: getComputedStyle(document.getElementById('boot')).display }));
    out.keyboard = { focus1, after };
    await p.close();
  }

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
