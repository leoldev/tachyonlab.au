const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const base = 'http://localhost:8766/index.html?nointro=1&v=23';
  const errors = [];

  async function set(w, h) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(base, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true);
    await page.waitForTimeout(1200);
    return page;
  }

  const desktop = await set(1440, 900);
  await desktop.screenshot({ path: '_shots/final-cover.png' });
  for (const [id, name] of [['identity','identity'],['method','method'],['index','index'],['evidence','evidence'],['uplink','uplink']]) {
    await desktop.evaluate((target) => {
      document.documentElement.style.scrollBehavior = 'auto';
      const el = document.getElementById(target);
      window.scrollTo(0, el.offsetTop - 58);
    }, id);
    await desktop.waitForTimeout(800);
    await desktop.screenshot({ path: `_shots/final-${name}.png` });
  }
  await desktop.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await desktop.waitForTimeout(700);
  await desktop.screenshot({ path: '_shots/final-bottom.png' });
  await desktop.close();

  const mobile = await set(390, 844);
  await mobile.screenshot({ path: '_shots/final-m-cover.png' });
  for (const [id, name] of [['identity','identity'],['method','method'],['index','index'],['evidence','evidence'],['uplink','uplink']]) {
    await mobile.evaluate((target) => {
      document.documentElement.style.scrollBehavior = 'auto';
      const el = document.getElementById(target);
      window.scrollTo(0, el.offsetTop - 58);
    }, id);
    await mobile.waitForTimeout(800);
    await mobile.screenshot({ path: `_shots/final-m-${name}.png` });
  }
  await mobile.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await mobile.waitForTimeout(700);
  await mobile.screenshot({ path: '_shots/final-m-bottom.png' });
  await mobile.close();

  console.log(JSON.stringify({ errors }, null, 2));
  await browser.close();
})();
