const { chromium } = require('playwright');

(async () => {
  const [url, outDir, wArg, hArg] = process.argv.slice(2);
  const width = parseInt(wArg || '1440', 10);
  const height = parseInt(hArg || '900', 10);
  const times = [0.35, 0.9, 1.3, 1.8, 2.4, 3.1];

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  const start = Date.now();
  let last = 0;
  for (const t of times) {
    const wait = Math.round(t * 1000 - last);
    if (wait > 0) await page.waitForTimeout(wait);
    last = t * 1000;
    await page.screenshot({ path: `${outDir}/intro-${String(t).replace('.', '_')}s.png` });
    console.log('shot', t, 'at', Date.now() - start, 'ms');
  }

  const state = await page.evaluate(() => ({
    boot: !!document.getElementById('boot'),
    bootDisplay: document.getElementById('boot') ? getComputedStyle(document.getElementById('boot')).display : null,
    htmlClass: document.documentElement.className
  }));
  console.log(JSON.stringify({ state, errors }));
  await browser.close();
})();
