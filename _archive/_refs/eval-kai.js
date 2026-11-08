(() => {
  const cs = el => el ? getComputedStyle(el) : null;
  const pick = (el, props) => { const s = cs(el); return s ? Object.fromEntries(props.map(p => [p, s[p]])) : null; };
  const box = el => { if(!el) return null; const r = el.getBoundingClientRect(); return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}; };
  const all = [...document.querySelectorAll('*')];
  const canvases = [...document.querySelectorAll('canvas')].map(c=>({...box(c), id:c.id, cls:c.className.toString().slice(0,60)}));
  const texty = all.filter(e => e.children.length===0 && (e.textContent||'').trim().length>1 && e.getBoundingClientRect().width>0)
    .map(e=>({txt:(e.textContent||'').trim().slice(0,28), tag:e.tagName, cls:e.className.toString().slice(0,50), ...pick(e,['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','opacity']), ...box(e)}))
    .sort((a,b)=>b.w-a.w).slice(0,14);
  const anims = document.getAnimations().slice(0,25).map(a=>({name:a.animationName||a.transitionProperty, dur:a.effect?.getTiming?.().duration, delay:a.effect?.getTiming?.().delay, ease:a.effect?.getTiming?.().easing, iter:a.effect?.getTiming?.().iterations}));
  const cssVars={}; for(const sh of document.styleSheets){try{for(const r of sh.cssRules){if(r.style)for(const p of r.style)if(p.startsWith('--'))cssVars[p]=r.style.getPropertyValue(p);}}catch{}}
  const scrollEl = [...all].filter(e=>{const s=cs(e);return /(auto|scroll)/.test(s.overflowY)&&e.scrollHeight>e.clientHeight+50;}).slice(0,3).map(e=>({cls:e.className.toString().slice(0,40), sh:e.scrollHeight, ch:e.clientHeight}));
  return JSON.stringify({title:document.title, viewport:[innerWidth,innerHeight], docH:document.documentElement.scrollHeight, body:pick(document.body,['backgroundColor','color','fontFamily','overflow']), htmlBg:cs(document.documentElement).backgroundColor, canvases, texty, anims, cssVars, scrollEl},null,2);
})()
