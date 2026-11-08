(() => {
  const h1 = document.querySelector('h1');
  const nav = [...document.querySelectorAll('a')].filter(a=>/^(Intro|Projects|About)$/.test(a.textContent.trim()));
  const list = [...document.querySelectorAll('a')].filter(a=>/^\d\d\./.test(a.textContent.trim()));
  const first = list[0];
  const styles = [...document.querySelectorAll('style')].map(s=>s.textContent).join('\n');
  const idx = styles.indexOf('.Text_title');
  const anims = [...document.querySelectorAll('*')].map(e=>getComputedStyle(e).transition).filter(t=>t&&t!=='all 0s ease 0s');
  const uniq = [...new Set(anims)].slice(0,12);
  return JSON.stringify({
    inline: h1.getAttribute('style'), styleAttrFs: h1.style.fontSize,
    h1w: h1.getBoundingClientRect().width, texts: h1.textContent.slice(0,80),
    firstItem: first ? {html: first.outerHTML.slice(0,200), box: (()=>{const r=first.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})(), fs:getComputedStyle(first).fontSize, lh:getComputedStyle(first).lineHeight, color:getComputedStyle(first).color} : null,
    listCount: list.length,
    navUnderline: nav.map(a=>({t:a.textContent.trim(), td:getComputedStyle(a).textDecorationLine, bb:getComputedStyle(a).borderBottom})),
    transitions: uniq,
    cssSnippet: idx>-1 ? styles.slice(idx-200, idx+600) : null,
    headerH: document.querySelector('header')?.getBoundingClientRect().height,
  },null,2);
})()
