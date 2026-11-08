(() => {
  const cs = el => getComputedStyle(el);
  const box = el => { const r = el.getBoundingClientRect(); return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}; };
  const h1 = document.querySelector('h1');
  const cls = h1 ? h1.className : '';
  const rules = [];
  for (const sh of document.styleSheets) {
    let list; try { list = sh.cssRules; } catch { continue; }
    for (const r of list) {
      const t = r.cssText || '';
      if (r.selectorText && h1 && (()=>{try{return h1.matches(r.selectorText)}catch{return false}})()) rules.push(t.slice(0,300));
    }
  }
  const linkRules = [];
  for (const sh of document.styleSheets) {
    let list; try { list = sh.cssRules; } catch { continue; }
    for (const r of list) {
      const t = r.cssText || '';
      if (/transition|animation/.test(t) && /(project|list|nav|hover|link|title|head)/i.test(t)) linkRules.push(t.slice(0,240));
    }
  }
  const items = [...document.querySelectorAll('a')].filter(a=>/^\d\d\./.test(a.textContent.trim())).slice(0,3).map(a=>({t:a.textContent.trim().slice(0,20), box:box(a), fs:cs(a).fontSize, lh:cs(a).lineHeight, ff:cs(a).fontFamily.split(',')[0]}));
  const imgs = [...document.querySelectorAll('img,video')].slice(0,4).map(i=>({tag:i.tagName, box:box(i), fit:cs(i).objectFit, ...(i.tagName==='IMG'?{src:i.currentSrc.split('/').pop().slice(0,60)}:{})}));
  const marq = [...document.querySelectorAll('*')].filter(e=>e.children.length>2 && /Select projects/.test(e.textContent) && e.getBoundingClientRect().width<800).slice(0,2).map(e=>({tag:e.tagName, cls:e.className.toString().slice(0,40), box:box(e), anim:cs(e).animation, transform:cs(e).transform}));
  return JSON.stringify({h1Class:cls, h1Rules:rules, linkRules:linkRules.slice(0,25), items, imgs, marq, colsVar:getComputedStyle(document.documentElement).getPropertyValue('--cols'), indentVar:getComputedStyle(document.documentElement).getPropertyValue('--indent')},null,2);
})()
