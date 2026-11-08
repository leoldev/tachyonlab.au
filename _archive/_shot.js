const { chromium } = require('playwright');

(async () => {
  const [url, out, pos, wArg, hArg, waitArg] = process.argv.slice(2);
  const width = parseInt(wArg || '1440', 10);
  const height = parseInt(hArg || '900', 10);
  const wait = parseInt(waitArg || '1400', 10);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1
  });

  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.evaluate(() => (document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true));
  await page.waitForTimeout(wait);

  if (pos && pos !== '-') {
    if (pos.startsWith('#')) {
      const id = pos.slice(1);
      await page.evaluate((target) => {
        document.documentElement.style.scrollBehavior = 'auto';
        const el = document.getElementById(target);
        if (el) window.scrollTo(0, el.offsetTop - 58);
      }, id);
    } else {
      await page.evaluate((v) => {
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * v);
      }, parseFloat(pos));
    }
    await page.waitForTimeout(900);
  }

  await page.screenshot({ path: out });

  const info = await page.evaluate(() => ({
    y: Math.round(scrollY),
    docH: document.documentElement.scrollHeight,
    active: (document.querySelector('.rail a.on') && document.querySelector('.rail a.on').dataset.sec) || null
  }));

  console.log(JSON.stringify({ out, ...info, errors }));
  await browser.close();
})();
