(() => {
  const h1 = document.querySelector('h1');
  const out = [];
  const walk = (rules, media) => {
    for (const r of rules) {
      if (r.cssRules) walk(r.cssRules, (media?media+' && ':'') + (r.conditionText||r.media?.mediaText||''));
      else if (r.selectorText) { try { if (h1.matches(r.selectorText)) out.push({media, sel:r.selectorText, css:r.style.cssText}); } catch {} }
    }
  };
  for (const sh of document.styleSheets) { try { walk(sh.cssRules, ''); } catch {} }
  const chain = []; let e = h1; while (e && e !== document.documentElement) { const s = getComputedStyle(e); chain.push({tag:e.tagName, cls:e.className.toString().slice(0,30), fs:s.fontSize, transform:s.transform, zoom:s.zoom, w:+e.getBoundingClientRect().width.toFixed(1)}); e = e.parentElement; }
  return JSON.stringify({fontSize:getComputedStyle(h1).fontSize, dpr:devicePixelRatio, innerW:innerWidth, out:out.slice(-12), chain}, null, 2);
})()
