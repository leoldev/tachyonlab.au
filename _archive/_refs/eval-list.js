(() => {
  const box = e => { const r=e.getBoundingClientRect(); return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}; };
  const items=[...document.querySelectorAll('[class*="projectItem"]')];
  const wrap=document.querySelector('[class*="projectsListWrapper"]');
  const list=document.querySelector('[class*="projectsList__"]');
  const first=items[0], second=items[1], tenth=items[9];
  const cs=e=>getComputedStyle(e);
  return JSON.stringify({
    wrap: wrap&&{...box(wrap), mt:cs(wrap).marginTop},
    list: list&&{...box(list), gap:cs(list).gap, flexWrap:cs(list).flexWrap},
    count:items.length,
    first: first&&{...box(first), fs:cs(first).fontSize, lh:cs(first).lineHeight, mb:cs(first).marginBottom, flex:cs(first).flex, a:box(first.querySelector('a'))},
    second: second&&box(second), tenth: tenth&&box(tenth),
    aStyle: first&&{fs:cs(first.querySelector('a')).fontSize, lh:cs(first.querySelector('a')).lineHeight, ff:cs(first.querySelector('a')).fontFamily.split(',')[0], td:cs(first.querySelector('a')).textDecorationLine},
    rowPitch: items.length>1 ? +(items[1].getBoundingClientRect().y-items[0].getBoundingClientRect().y).toFixed(2) : null
  },null,2);
})()
