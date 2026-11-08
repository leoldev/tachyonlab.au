const { chromium } = require('playwright');

const widths = [320, 360, 390, 768, 1024, 1440];
const base = 'http://localhost:8766/index.html?nointro=1&qa=' + Date.now();

(async () => {
  const browser = await chromium.launch();
  const report = [];

  for (const w of widths) {
    const height = w <= 420 ? 844 : w <= 1100 ? 900 : 900;
    const page = await browser.newPage({ viewport: { width: w, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(base, { waitUntil: 'load', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await page.waitForTimeout(500);

    const data = await page.evaluate(() => {
      const r = (el) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), bottom: +b.bottom.toFixed(1) };
      };
      const lines = [...document.querySelectorAll('.entry__title .line')].map((line) => {
        const span = line.firstElementChild;
        const range = document.createRange();
        range.selectNodeContents(span);
        const tr = range.getBoundingClientRect();
        const lr = line.getBoundingClientRect();
        return {
          text: span.textContent.trim(),
          line: r(line),
          span: r(span),
          textRect: { x: +tr.x.toFixed(1), y: +tr.y.toFixed(1), w: +tr.width.toFixed(1), h: +tr.height.toFixed(1), top: +tr.top.toFixed(1), bottom: +tr.bottom.toFixed(1) },
          clippedTop: +(lr.top - tr.top).toFixed(1),
          clippedBottom: +(tr.bottom - lr.bottom).toFixed(1),
          clippedRight: +(tr.right - lr.right).toFixed(1),
          scrollW: line.scrollWidth,
          clientW: line.clientWidth
        };
      });
      const target = document.querySelector('.access__target');
      const tb = target.getBoundingClientRect();
      const glyphs = [...document.querySelectorAll('.glyphs a')].map((a) => ({ label: a.textContent.trim(), ...r(a) }));
      const canvas = document.getElementById('field');
      const docW = document.documentElement.clientWidth;
      const over = [...document.querySelectorAll('body *')].filter((el) => {
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) return false;
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' && el.id === 'boot') return false;
        return b.right > docW + 1 || b.left < -1;
      }).map((el) => ({ tag: el.tagName, cls: el.className && String(el.className).slice(0, 50), ...r(el) })).slice(0, 12);
      return {
        vw: innerWidth, vh: innerHeight,
        scrollW: document.documentElement.scrollWidth,
        bodyScrollW: document.body.scrollWidth,
        docH: document.documentElement.scrollHeight,
        entryH: document.querySelector('.entry').offsetHeight,
        titleFont: getComputedStyle(document.querySelector('.entry__title')).fontSize,
        titleFamily: getComputedStyle(document.querySelector('.entry__title')).fontFamily,
        fontsReady: document.fonts.check('800 100px Archivo'),
        lines,
        subtitle: r(document.querySelector('.entry__line')),
        access: r(document.querySelector('.access')),
        target: { ...r(target), cx: +(tb.left + tb.width / 2).toFixed(1), cy: +(tb.top + tb.height / 2).toFixed(1) },
        accessCta: r(document.querySelector('.access__cta')),
        glyphs,
        scrollCue: r(document.querySelector('.scrolldown')),
        bar: { ...r(document.getElementById('bar')), on: document.getElementById('bar').classList.contains('on') },
        canvas: { present: !!canvas, w: canvas && canvas.width, h: canvas && canvas.height },
        overflow: over,
        panels: [...document.querySelectorAll('.panel')].map((p) => ({ id: p.id, h: p.offsetHeight, contentOpacity: getComputedStyle(p.querySelector('.panel__content')).opacity }))
      };
    });

    // anchor test: click Identity glyph
    await page.click('.glyphs a[href="#identity"]');
    await page.waitForTimeout(700);
    const anchor = await page.evaluate(() => ({
      y: Math.round(scrollY),
      identityTop: Math.round(document.getElementById('identity').getBoundingClientRect().top),
      barOn: document.getElementById('bar').classList.contains('on'),
      barH: Math.round(document.getElementById('bar').getBoundingClientRect().height),
      panelIn: document.getElementById('identity').classList.contains('in')
    }));

    await page.screenshot({ path: `_shots/qa-l-${w}-cover.png` });
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
    await page.waitForTimeout(350);
    await page.screenshot({ path: `_shots/qa-l-${w}-top.png` });

    report.push({ w, h: height, data, anchor, errors });
    await page.close();
  }

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})();
