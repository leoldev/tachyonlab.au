const { chromium } = require('playwright');

const base = 'http://localhost:8766/index.html?nointro=1&qa=' + Date.now();

(async () => {
  const browser = await chromium.launch();
  const results = [];

  for (const w of [320, 360, 390, 768, 1024, 1440]) {
    const h = w <= 420 ? 844 : 900;
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(base, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await page.waitForTimeout(350);

    const panels = {};
    for (const id of ['identity', 'method', 'evidence', 'uplink']) {
      await page.evaluate((target) => {
        document.documentElement.style.scrollBehavior = 'auto';
        const el = document.getElementById(target);
        window.scrollTo(0, el.offsetTop - 60);
      }, id);
      await page.waitForTimeout(650);
      panels[id] = await page.evaluate((target) => {
        const el = document.getElementById(target);
        const content = el.querySelector('.panel__content');
        const b = el.getBoundingClientRect();
        const cb = content.getBoundingClientRect();
        const metrics = [...el.querySelectorAll('.metric')].map((m) => {
          const mb = m.getBoundingClientRect();
          const val = m.querySelector('b');
          return {
            x: Math.round(mb.x), y: Math.round(mb.y), w: Math.round(mb.width), h: Math.round(mb.height),
            value: val.textContent, valueW: Math.round(val.getBoundingClientRect().width),
            overflow: val.scrollWidth > val.clientWidth + 1
          };
        });
        const labels = [...el.querySelectorAll('.track__labels span')].map((s) => {
          const sb = s.getBoundingClientRect();
          return { text: s.textContent, x: Math.round(sb.x), right: Math.round(sb.right) };
        });
        const mail = el.querySelector('.mail');
        return {
          top: Math.round(b.top), height: Math.round(b.height),
          contentOpacity: getComputedStyle(content).opacity,
          contentW: Math.round(cb.width),
          inClass: el.classList.contains('in'),
          overflow: el.scrollWidth > el.clientWidth + 1,
          metrics, labels,
          mail: mail ? { w: Math.round(mail.getBoundingClientRect().width), fontSize: getComputedStyle(mail).fontSize } : null
        };
      }, id);
      await page.screenshot({ path: `_shots/qa-p-${w}-${id}.png` });
    }

    // bottom of document
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, document.documentElement.scrollHeight); });
    await page.waitForTimeout(450);
    const bottom = await page.evaluate(() => {
      const last = document.getElementById('uplink');
      const b = last.getBoundingClientRect();
      return {
        scrollY: Math.round(scrollY),
        maxScroll: document.documentElement.scrollHeight - innerHeight,
        lastBottom: Math.round(b.bottom),
        lastPaddingBottom: getComputedStyle(last).paddingBottom,
        footer: !!document.querySelector('footer'),
        overflowX: document.documentElement.scrollWidth
      };
    });

    // tab order at top
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
    await page.waitForTimeout(350);
    const focus = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      focus.push(await page.evaluate(() => {
        const a = document.activeElement;
        return {
          tag: a.tagName,
          text: (a.textContent || '').trim().slice(0, 24),
          cls: String(a.className || '').slice(0, 24),
          visible: !!(a.offsetWidth || a.offsetHeight || a.getClientRects().length),
          inBar: !!a.closest('.bar')
        };
      }));
    }

    results.push({ w, h, panels, bottom, focus, errors });
    await page.close();
  }

  // JS disabled
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    await page.goto(base, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    await page.screenshot({ path: '_shots/qa-nojs.png' });
    results.push({ nojs: 'screenshot-only' });
    await page.close();
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
