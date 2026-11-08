const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const [w,h] of [[1440,900],[390,844]]) {
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    await p.goto('http://localhost:8766/index.html?nointro=1&v=18', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    for (const prog of [0, 0.5, 1]) {
      await p.evaluate((v) => {
        document.documentElement.style.scrollBehavior = 'auto';
        const el = document.getElementById('identity');
        window.scrollTo(0, el.offsetTop + (el.offsetHeight - innerHeight) * v);
      }, prog);
      await p.waitForTimeout(500);
      await p.screenshot({ path: `_shots/ident-${w}-${String(prog).replace('.', '')}.png` });
    }
    await p.close();
  }
  await browser.close();
})();
