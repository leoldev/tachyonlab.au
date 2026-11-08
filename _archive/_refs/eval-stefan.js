(() => {
  const cs = el => el ? getComputedStyle(el) : null;
  const pick = (el, props) => { const s = cs(el); return s ? Object.fromEntries(props.map(p => [p, s[p]])) : null; };
  const box = el => { if(!el) return null; const r = el.getBoundingClientRect(); return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}; };
  const all = [...document.querySelectorAll('*')];
  const bg = cs(document.body).backgroundColor;
  const h1 = document.querySelector('h1') || all.find(e => (e.textContent||'').trim() === 'Select projects');
  // biggest visible text
  const sized = all.filter(e => e.children.length === 0 && (e.textContent||'').trim()).map(e => ({e, fs: parseFloat(cs(e).fontSize), txt:(e.textContent||'').trim().slice(0,40)})).sort((a,b)=>b.fs-a.fs).slice(0,10);
  const grid = all.filter(e => cs(e).display.includes('grid')).slice(0,6).map(e => ({cls:e.className.toString().slice(0,60), cols:cs(e).gridTemplateColumns, gap:cs(e).gridGap, ...box(e)}));
  const nav = [...document.querySelectorAll('a')].filter(a=>/^(Intro|Projects|About)$/.test(a.textContent.trim())).map(a=>({t:a.textContent.trim(), ...pick(a,['fontFamily','fontSize','fontWeight','lineHeight','color','letterSpacing']), ...box(a)}));
  const items = [...document.querySelectorAll('a')].filter(a=>/^\d\d\./.test(a.textContent.trim())).slice(0,4).map(a=>({t:a.textContent.trim(), ...pick(a,['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textDecoration']), ...box(a)}));
  const anims = document.getAnimations().slice(0,20).map(a=>({name:a.animationName||a.transitionProperty, dur:a.effect?.getTiming?.().duration, ease:a.effect?.getTiming?.().easing, target:a.effect?.target?.className?.toString?.().slice(0,40)}));
  const cssVars = {};
  for (const sheet of document.styleSheets) { try { for (const rule of sheet.cssRules) { if (rule.style) for (const p of rule.style) if (p.startsWith('--')) cssVars[p]=rule.style.getPropertyValue(p); } } catch {} }
  const fonts = [...new Set(all.map(e=>cs(e).fontFamily))].slice(0,15);
  const body = pick(document.body, ['fontFamily','fontSize','lineHeight','letterSpacing','backgroundColor','color','margin','padding']);
  return JSON.stringify({bg, body, h1: h1&&{...pick(h1,['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','margin','padding']), ...box(h1), text:h1.textContent.trim().slice(0,40)}, biggest: sized.map(s=>({fs:s.fs,txt:s.txt,fam:cs(s.e).fontFamily,ls:cs(s.e).letterSpacing,lh:cs(s.e).lineHeight})), grid, nav, items, anims, cssVars, fonts, viewport:[innerWidth,innerHeight], scrollH: document.documentElement.scrollHeight}, null, 2);
})()
