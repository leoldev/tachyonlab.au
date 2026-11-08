const { chromium } = require('playwright');

(async () => {
  const [url, outDir] = process.argv.slice(2);
  const times = [0.95, 1.25, 1.9, 2.15, 2.3, 2.45];
  const browser = await chromium.launch();
  for (const t of times) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(Math.round(t * 1000));
    const info = await page.evaluate(() => {
      const o = document.querySelector('.ti-overlay');
      const st = document.querySelector('.ti-status-text');
      return {
        cls: o ? o.className : null,
        transform: o ? getComputedStyle(o).transform : null,
        label: document.querySelector('.ti-count') ? document.querySelector('.ti-count').textContent : null,
        status: st ? st.textContent : null
      };
    });
    await page.screenshot({ path: `${outDir}/i2-${String(t).replace('.', '_')}.png` });
    console.log(t, JSON.stringify(info));
    await page.close();
  }
  await browser.close();
})();
