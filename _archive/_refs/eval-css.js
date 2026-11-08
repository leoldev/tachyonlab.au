(() => JSON.stringify({
  sheets: [...document.styleSheets].map(s=>s.href).filter(Boolean),
  styleTags: [...document.querySelectorAll('style')].map(s=>s.textContent.length),
  head: [...document.head.querySelectorAll('link')].map(l=>({rel:l.rel,href:l.href})).filter(x=>/css/.test(x.href))
},null,2))
