const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('http://localhost:8766/index.html?nointro=1&v=24', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const before = await page.evaluate(() => ({ cells: document.querySelectorAll('#memGrid .cell').length, count: document.getElementById('memCount').textContent }));
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.getElementById('evidence');
    window.scrollTo(0, el.offsetTop + 600);
  });
  await page.waitForTimeout(500);
  await page.locator('#eraseBtn').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.locator('#eraseBtn').tap();
  await page.waitForTimeout(300);
  const armed = await page.evaluate(() => ({ btn: document.getElementById('eraseBtn').textContent, state: document.getElementById('memState').textContent }));
  await page.locator('#eraseBtn').tap();
  await page.waitForTimeout(1700);
  const gone = await page.evaluate(() => ({
    btn: document.getElementById('eraseBtn').textContent,
    count: document.getElementById('memCount').textContent,
    cellsLeft: [...document.querySelectorAll('#memGrid .cell')].filter(c => !c.classList.contains('gone')).length,
    receipt: !document.getElementById('receipt').hidden
  }));
  await page.locator('#receipt').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: '_shots/qa-mobile-receipt.png' });
  await page.locator('#resetBtn').tap();
  await page.waitForTimeout(600);
  const reset = await page.evaluate(() => ({ count: document.getElementById('memCount').textContent, cells: document.querySelectorAll('#memGrid .cell').length }));
  console.log(JSON.stringify({ before, armed, gone, reset, errors }, null, 2));
  await browser.close();
})();
