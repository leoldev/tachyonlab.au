const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  const base = 'http://localhost:8766/index.html?nointro=1&v=24';
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(700);

  const results = {};

  // method interaction
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, document.getElementById('method').offsetTop - 50);
  });
  await page.waitForTimeout(400);
  await page.click('.step[data-step="2"]');
  await page.waitForTimeout(250);
  results.method = await page.evaluate(() => ({
    title: document.getElementById('stepTitle').textContent,
    index: document.getElementById('stepIndex').textContent,
    state: document.getElementById('stepState').textContent,
    pressed: [...document.querySelectorAll('.step')].map(b => b.getAttribute('aria-pressed')),
    nodeOn: [...document.querySelectorAll('.loop__node')].findIndex(n => n.classList.contains('on')),
    meta: document.getElementById('stepMeta').textContent
  }));
  await page.screenshot({ path: '_shots/qa-method-train.png' });

  // erasure
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, document.getElementById('evidence').offsetTop - 50);
  });
  await page.waitForTimeout(400);
  const erase = page.locator('#eraseBtn');
  await erase.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await erase.click();
  await page.waitForTimeout(200);
  results.armed = await page.evaluate(() => ({
    btn: document.getElementById('eraseBtn').textContent,
    state: document.getElementById('memState').textContent,
    count: document.getElementById('memCount').textContent,
    receiptHidden: document.getElementById('receipt').hidden
  }));
  await page.screenshot({ path: '_shots/qa-erase-armed.png' });

  await erase.click();
  await page.waitForTimeout(1600);
  results.erased = await page.evaluate(() => ({
    btn: document.getElementById('eraseBtn').textContent,
    disabled: document.getElementById('eraseBtn').disabled,
    state: document.getElementById('memState').textContent,
    count: document.getElementById('memCount').textContent,
    receiptHidden: document.getElementById('receipt').hidden,
    receiptOn: document.getElementById('receipt').classList.contains('on'),
    cellsLeft: [...document.querySelectorAll('#memGrid .cell')].filter(c => !c.classList.contains('gone')).length
  }));
  await page.evaluate(() => document.getElementById('receipt').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '_shots/qa-erase-receipt.png' });

  await page.click('#resetBtn');
  await page.waitForTimeout(500);
  results.reset = await page.evaluate(() => ({
    btn: document.getElementById('eraseBtn').textContent,
    state: document.getElementById('memState').textContent,
    count: document.getElementById('memCount').textContent,
    cells: document.querySelectorAll('#memGrid .cell').length,
    receiptHidden: document.getElementById('receipt').hidden
  }));

  // cursor over a contents row
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const row = await page.locator('.contents__row a').first().boundingBox();
  await page.mouse.move(row.x + 300, row.y + row.height / 2);
  await page.waitForTimeout(350);
  results.cursor = await page.evaluate(() => ({
    cls: document.getElementById('cursor').className,
    label: document.getElementById('cursorLabel').textContent,
    visible: getComputedStyle(document.getElementById('cursor')).opacity
  }));
  await page.screenshot({ path: '_shots/qa-cursor.png' });

  // rail states
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, document.getElementById('index').offsetTop - 50);
  });
  await page.waitForTimeout(500);
  results.rail = await page.evaluate(() => ({
    active: document.querySelector('.rail a.on')?.dataset.sec || null,
    shape: document.querySelector('canvas') ? 'canvas-ok' : 'no-canvas'
  }));

  console.log(JSON.stringify({ results, errors }, null, 2));
  await browser.close();
})();
