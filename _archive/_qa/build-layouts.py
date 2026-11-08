#!/usr/bin/env python3
"""Builds the ten wayfinding placements into _layouts/."""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "_layouts"
OUT.mkdir(exist_ok=True)
MAIL = "mailto:apply@tachyonlab.au?subject=light-alpha%20access"

SPRITE = """<svg class="sprite" aria-hidden="true" focusable="false">
  <g id="wm">
    <text x="19.5" y="182.7" fill="currentColor" font-family="'Tachyon Archivo Heavy', Archivo, sans-serif" font-size="200" font-weight="800">TACHY</text>
    <path fill="none" stroke="currentColor" stroke-width="25" stroke-miterlimit="10" d="M951.2,53.2h-64.2c-1.8,0-3.4,1-4.3,2.5l-32.1,55.6c-.9,1.5-.9,3.5,0,5l32.1,55.6c.9,1.5,2.5,2.5,4.3,2.5h64.2c1.8,0,3.4-1,4.3-2.5l32.1-55.6c.9-1.5.9-3.5,0-5l-32.1-55.6c-.9-1.5-2.5-2.5-4.3-2.5Z"/>
    <g stroke="currentColor" stroke-width="5" stroke-miterlimit="10" fill="none">
      <line x1="876.4" y1="113.7" x2="898.7" y2="75.7"/><line x1="897" y1="151.8" x2="941.1" y2="151.8"/><line x1="939.4" y1="75.6" x2="961.5" y2="113.8"/>
    </g>
    <text x="1011.1" y="185.1" fill="currentColor" font-family="'Tachyon Archivo Heavy', Archivo, sans-serif" font-size="200" font-weight="800">N</text>
    <text x="11.2" y="353.7" fill="currentColor" font-family="'Tachyon Archivo Heavy', Archivo, sans-serif" font-size="200" font-weight="800">LAB</text>
    <text x="485.7" y="353.7" fill="#2B3CFF" font-family="'Tachyon Archivo Heavy', Archivo, sans-serif" font-size="200" font-weight="800">.</text>
    <path fill="currentColor" d="M888.4,354.4c-6.2,3.6-16.1,7.9-28.1,7.4-27.7-1.1-62.6-27.3-62.6-70s35-68.9,62.6-70c11.7-.5,21.4,3.6,27.5,7.1.2,41.8.4,83.6.6,125.4h0Z"/>
    <path fill="#2B3CFF" d="M915,242.6c-8.7,15.8-8.9,40.8-9,49.1,0,9-.3,34.7,8.5,50.6,27.1,49.1,144.8,14.7,200.3-8.9,26.3-11.1,60-25.8,59.7-44.9-.3-18.5-32.5-31.4-59.2-41.9-8.2-3.2-167.5-64.1-200.3-4.1h0Z"/>
  </g>
  <symbol id="i-identity" viewBox="0 0 24 24"><rect x="4.5" y="4.5" width="15" height="15" rx="5.4"/><circle cx="12" cy="12" r="2.7"/></symbol>
  <symbol id="i-method" viewBox="0 0 24 24"><path d="M18.6 9.4A7.2 7.2 0 1 0 19.1 15"/><path d="M18.9 4.4v5.2h-5.2"/></symbol>
  <symbol id="i-evidence" viewBox="0 0 24 24"><path d="M6 18.5v-4.2M12 18.5V6M18 18.5v-7.4"/></symbol>
  <symbol id="i-uplink" viewBox="0 0 24 24"><path d="M12 19V6.2"/><path d="M6.4 11.6 12 5.9l5.6 5.7"/></symbol>
</svg>"""

WM = '<svg class="wm rise" style="--d:.06s" viewBox="0 0 1200 400" role="img" aria-label="Tachyon Lab"><use href="#wm"/></svg>'
MARK = '<svg class="mark" viewBox="790 208 392 167" role="img" aria-label="Tachyon Lab mark"><path fill="currentColor" d="M888.4,354.4c-6.2,3.6-16.1,7.9-28.1,7.4-27.7-1.1-62.6-27.3-62.6-70s35-68.9,62.6-70c11.7-.5,21.4,3.6,27.5,7.1.2,41.8.4,83.6.6,125.4h0Z"/><path fill="#2B3CFF" d="M915,242.6c-8.7,15.8-8.9,40.8-9,49.1,0,9-.3,34.7,8.5,50.6,27.1,49.1,144.8,14.7,200.3-8.9,26.3-11.1,60-25.8,59.7-44.9-.3-18.5-32.5-31.4-59.2-41.9-8.2-3.2-167.5-64.1-200.3-4.1h0Z"/></svg>'
MARK_REV = MARK.replace('fill="#2B3CFF"','fill="currentColor"')
ARW = '<svg class="cta__arw" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4"/><path d="M5.6 4H12v6.4"/></svg>'
ITEMS = [("identity", "Identity", "01"), ("method", "Method", "02"),
         ("evidence", "Evidence", "03"), ("uplink", "Uplink", "04")]


def product(d=".14s"):
    return f"""<div class="product rise" style="--d:{d}">
      <span class="eyebrow">Release</span>
      <h1 class="product__name">light-alpha</h1>
      <div class="chips">
        <span class="chip"><i class="dot" aria-hidden="true"></i>By application</span>
        <span class="chip">Local-first</span>
        <span class="chip">On-device</span>
      </div>
    </div>"""


def nav(kind="rows", d0=.24, cls=""):
    out = [f'<nav class="nav nav--{kind} {cls}" aria-label="Sections">']
    for i, (slug, name, no) in enumerate(ITEMS):
        d = round(d0 + i * .06, 2)
        href = f"../index.html#{slug}"
        if kind == "rows":
            out.append(
                f'<a class="row rise" style="--d:{d}s" href="{href}" target="_blank" rel="noopener">'
                f'<svg class="pict" aria-hidden="true"><use href="#i-{slug}"/></svg>'
                f'<span class="row__name">{name}</span><span class="row__no">{no}</span>'
                f'<span class="row__arw" aria-hidden="true">&#8594;</span></a>')
        else:
            out.append(
                f'<a class="tile rise" style="--d:{d}s" href="{href}" target="_blank" rel="noopener">'
                f'<span class="tile__top"><svg class="pict" aria-hidden="true"><use href="#i-{slug}"/></svg>'
                f'<span class="tile__no">{no}</span></span><span class="tile__name">{name}</span></a>')
    out.append("</nav>")
    return "\n    ".join(out)


def cta(cls="", d=".5s"):
    return (f'<a class="cta {cls} rise" style="--d:{d}" href="{MAIL}">'
            f'<span>Request access</span>{ARW}</a>')


HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>Tachyon Lab — light-alpha · {num} {name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="system.css">
<script>document.documentElement.className += ' js';</script>
<style>
:root{{--pad:clamp(22px,3.4vw,52px)}}
{css}
</style>
</head>
<body class="{slug}">
{sprite}
"""

TAIL = """
<script>
(function(){
  var r=document.documentElement,q=location.search;
  if(q.indexOf('still')>-1||matchMedia('(prefers-reduced-motion: reduce)').matches){
    r.classList.add('is-in','settled');return;
  }
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    setTimeout(function(){r.classList.add('is-in')},60);
  })});
})();
</script>
</body>
</html>
"""

L = {}

L["01"] = dict(name="Right band", slug="l01", css="""
body{display:flex}
.stage{flex:1;min-width:0;display:flex;flex-direction:column;padding:var(--pad);position:relative;z-index:1}
.top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
.wm{width:clamp(190px,20vw,280px)}
.mid{flex:1;display:flex;flex-direction:column;justify-content:center;gap:clamp(26px,4.6vh,50px);max-width:560px}
.bot{display:flex;justify-content:space-between;gap:20px;border-top:1px solid var(--line-soft);padding-top:14px}
.band{width:clamp(62px,5.4vw,80px);flex:none;align-items:center;justify-content:center;border-radius:26px 0 0 26px}
.curve{top:-150px;right:24px;width:min(46vw,540px)}
@media (max-width:820px){
  body{flex-direction:column}
  .stage{padding:20px 20px 16px}
  .band{width:100%;height:60px;border-radius:22px 22px 0 0}
  .cta--vert{writing-mode:horizontal-tb;rotate:none;font-size:14px}
  .cta--vert .cta__arw{rotate:none}
  .cta--vert:hover .cta__arw{transform:translate(2px,-2px)}
  .mid{max-width:none;gap:24px;justify-content:flex-start}
  .curve{display:none}
  .wm{width:190px}
  .top .meta{display:none}
}
""", body=f"""
<div class="stage">
  <header class="top">{WM}<span class="meta rise" style="--d:.1s">Brisbane<br>27.47&#176;S 153.03&#176;E</span></header>
  <main class="mid">
    {product()}
    {nav("rows")}
  </main>
  <footer class="bot"><span class="meta meta--faint rise" style="--d:.5s">Independent AI laboratory</span><span class="meta meta--faint rise" style="--d:.54s">04 destinations</span></footer>
</div>
<aside class="band slide-r">{cta("cta--vert", ".34s")}</aside>
<svg class="curve" viewBox="0 0 540 540" aria-hidden="true"><path pathLength="1" d="M540 0A540 540 0 0 0 0 540"/></svg>
""")

L["02"] = dict(name="Bottom band", slug="l02", css="""
body{display:flex;flex-direction:column}
.stage{flex:1;min-height:0;display:flex;flex-direction:column;padding:var(--pad);position:relative;z-index:1}
.top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
.wm{width:clamp(190px,20vw,280px)}
.mid{flex:1;display:flex;flex-direction:column;justify-content:center;gap:clamp(28px,5vh,56px)}
.product{max-width:640px}
.band{height:clamp(74px,9vh,92px);flex:none;align-items:center;justify-content:space-between;gap:24px;padding:0 var(--pad);border-radius:26px 26px 0 0}
.band__l{display:flex;align-items:center;gap:18px;min-width:0}
.band .mark{width:52px}
.curve{left:0;bottom:12%;width:100%}
@media (max-width:820px){
  .stage{padding:20px 20px 18px}
  .wm{width:190px}
  .top .meta{display:none}
  .mid{gap:24px;justify-content:flex-start}
  .nav--tiles{grid-template-columns:1fr 1fr}
  .band{height:66px;padding:0 20px;border-radius:20px 20px 0 0}
  .band .mark{width:38px}
  .band__label{display:none}
  .curve{display:none}
}
""", body=f"""
<div class="stage">
  <header class="top">{WM}<span class="meta rise" style="--d:.1s">Independent AI laboratory<br>Brisbane</span></header>
  <main class="mid">
    {product()}
    {nav("tiles", .3)}
  </main>
</div>
<footer class="band slide-b">
  <span class="band__l">{MARK_REV}<span class="band__label">Access by application</span></span>
  {cta("cta--outline", ".4s")}
</footer>
<svg class="curve" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M0 258C320 44 880 44 1200 258"/></svg>
""")

L["03"] = dict(name="Left band", slug="l03", css="""
body{display:flex}
.band{width:clamp(62px,5.4vw,80px);flex:none;align-items:center;justify-content:center;border-radius:0 26px 26px 0}
.band .cta--vert{rotate:none}
.band .cta--vert .cta__arw{rotate:-90deg}
.band .cta--vert:hover .cta__arw{rotate:-90deg;translate:2px -2px}
.stage{flex:1;min-width:0;display:flex;flex-direction:column;padding:var(--pad);position:relative;z-index:1}
.top{display:flex;flex-direction:row-reverse;align-items:flex-start;justify-content:space-between;gap:24px}
.wm{width:clamp(190px,20vw,280px)}
.mid{flex:1;display:flex;flex-direction:column;justify-content:center;gap:clamp(26px,4.6vh,50px)}
.product{text-align:right}
.product .chips{justify-content:flex-end}
.nav--grid{grid-template-columns:1fr 1fr}
.bot{display:flex;justify-content:space-between;gap:20px;border-top:1px solid var(--line-soft);padding-top:14px}
.curve{top:118px;left:96px;width:min(30vw,340px)}
@media (max-width:820px){
  body{flex-direction:column}
  .band{width:100%;height:60px;border-radius:0 0 22px 22px;order:2}
  .band .cta--vert{writing-mode:horizontal-tb;rotate:none;font-size:14px}
  .band .cta--vert .cta__arw{rotate:none}
  .stage{padding:20px 20px 16px;order:1}
  .top{flex-direction:row}
  .top .meta{display:none}
  .wm{width:190px}
  .product{text-align:left}
  .product .chips{justify-content:flex-start}
  .mid{gap:24px;justify-content:flex-start}
  .curve{display:none}
}
""", body=f"""
<aside class="band slide-l">{cta("cta--vert", ".34s")}</aside>
<div class="stage">
  <header class="top">{WM}<span class="meta rise" style="--d:.1s">Brisbane<br>27.47&#176;S 153.03&#176;E</span></header>
  <main class="mid">
    {product()}
    {nav("tiles", .3, "nav--grid")}
  </main>
  <footer class="bot"><span class="meta meta--faint rise" style="--d:.52s">Independent AI laboratory</span><span class="meta meta--faint rise" style="--d:.56s">04 destinations</span></footer>
</div>
<svg class="curve" viewBox="0 0 340 340" aria-hidden="true"><path pathLength="1" d="M0 0A340 340 0 0 1 340 340"/></svg>
""")

L["04"] = dict(name="Corner block", slug="l04", css="""
.stage{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;padding:var(--pad)}
.top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
.wm{width:clamp(190px,20vw,280px)}
.mid{flex:1;display:flex;flex-direction:column;justify-content:center;gap:clamp(24px,4.2vh,46px);max-width:min(54%,560px)}
.bot{max-width:min(54%,560px);border-top:1px solid var(--line-soft);padding-top:14px}
.corner{position:absolute;right:var(--pad);bottom:var(--pad);width:clamp(238px,25vw,340px);height:clamp(158px,21vh,216px);
  background:var(--signal);border-radius:30px;padding:22px 24px;display:flex;flex-direction:column;justify-content:space-between;z-index:2}
.corner .cta{color:#fff;font-size:17px}
.corner .cta:focus-visible{box-shadow:0 0 0 3px rgba(255,255,255,.4);border-radius:10px}
.corner__k{font-family:var(--mono);font-size:8px;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.7)}
.curve{inset:0;width:100%;height:100%}
@media (max-width:820px){
  body{overflow:auto}
  .stage{padding:20px 20px 18px;height:auto;min-height:100%}
  .wm{width:190px}
  .top .meta{display:none}
  .mid{max-width:none;gap:22px;flex:1;padding:22px 0}
  .bot{max-width:none}
  .corner{position:static;width:100%;height:auto;min-height:132px;margin-top:18px;border-radius:24px}
  .curve{display:none}
}
""", body=f"""
<div class="stage">
  <header class="top">{WM}<span class="meta rise" style="--d:.1s">Independent AI laboratory<br>Brisbane</span></header>
  <main class="mid">
    {product()}
    {nav("rows")}
  </main>
  <footer class="bot"><span class="meta meta--faint rise" style="--d:.5s">27.47&#176;S 153.03&#176;E</span></footer>
  <div class="corner pop" style="--d:.4s">
    <span class="corner__k">Access</span>
    {cta("", ".5s")}
  </div>
</div>
<svg class="curve" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" style="--d:.3s" d="M500 296C670 296 690 500 742 566"/></svg>
""")

L["05"] = dict(name="Capsule and connector", slug="l05", css="""
.stage{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;padding:var(--pad)}
.top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
.wm{width:clamp(190px,20vw,280px)}
.mid{flex:1;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:clamp(24px,4vw,64px);position:relative}
.left{display:flex;flex-direction:column;gap:clamp(22px,3.8vh,40px);max-width:520px;min-width:0}
.mid .cta--solid{padding:22px 36px;font-size:15px}
.bot{display:flex;justify-content:space-between;gap:20px;border-top:1px solid var(--line-soft);padding-top:14px}
.curve{left:0;top:50%;transform:translateY(-50%);width:100%;height:220px}
@media (max-width:900px){
  .mid{display:flex;flex-direction:column;justify-content:flex-start;align-items:stretch;gap:22px}
  .left{flex:1;max-width:none}
  .mid .cta--solid{align-self:flex-start}
  .curve{display:none}
}
@media (max-width:820px){
  .stage{padding:20px 20px 16px}
  .wm{width:190px}
  .top .meta{display:none}
  .left{gap:22px;max-width:none}
}
""", body=f"""
<div class="stage">
  <header class="top">{WM}<span class="meta rise" style="--d:.1s">Brisbane<br>27.47&#176;S 153.03&#176;E</span></header>
  <main class="mid">
    <div class="left">
      {product()}
      {nav("rows", .28)}
    </div>
    {cta("cta--solid", ".46s")}
  </main>
  <footer class="bot"><span class="meta meta--faint rise" style="--d:.54s">Independent AI laboratory</span><span class="meta meta--faint rise" style="--d:.58s">04 destinations</span></footer>
</div>
<svg class="curve" viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
  <path pathLength="1" style="--d:.3s" d="M455 155C600 155 680 137 815 137"/>
</svg>
""")

L["06"] = dict(name="Central axis", slug="l06", css="""
.stage{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:clamp(20px,3.4vh,38px);padding:var(--pad);text-align:center}
.wm{width:clamp(200px,23vw,310px)}
.product{text-align:center}
.product .chips{justify-content:center}
.nav--tiles{width:min(100%,780px)}
.stage .cta--solid{padding:18px 42px;font-size:14.5px}
.bot{position:absolute;left:var(--pad);right:var(--pad);bottom:calc(var(--pad) - 12px);display:flex;justify-content:space-between;gap:20px}
.curve{inset:0;width:100%;height:100%}
@media (max-width:820px){
  .stage{padding:24px 20px 58px;gap:20px;justify-content:flex-start}
  .wm{width:210px}
  .nav--tiles{grid-template-columns:1fr 1fr;width:100%}
  .bot{left:20px;right:20px;bottom:16px}
  .bot span:last-child{display:none}
  .curve{display:none}
}
""", body=f"""
<div class="stage">
  {WM}
  {product(".2s")}
  {nav("tiles", .32)}
  {cta("cta--solid", ".56s")}
  <div class="bot"><span class="meta meta--faint rise" style="--d:.62s">Brisbane &#183; 27.47&#176;S 153.03&#176;E</span><span class="meta meta--faint rise" style="--d:.66s">Independent AI laboratory</span></div>
</div>
<svg class="curve" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
  <path pathLength="1" d="M150 40C52 260 52 540 150 760"/>
  <path pathLength="1" style="--d:.18s" d="M1050 40C1148 260 1148 540 1050 760"/>
</svg>
""")

L["07"] = dict(name="Sweeping arc", slug="l07", css="""
.stage{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;padding:var(--pad)}
.top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
.wm{width:clamp(190px,20vw,280px)}
.topcta{position:absolute;top:var(--pad);right:var(--pad);z-index:3}
.topcta .cta--solid{padding:16px 28px}
.mid{flex:1;display:flex;flex-direction:column;justify-content:flex-start;padding-top:clamp(28px,7vh,84px);max-width:min(50%,540px)}
.mid .meta{margin-top:20px}
.bot{border-top:1px solid var(--line)}
.nav--ruled{display:grid;grid-template-columns:repeat(4,1fr)}
.nav--ruled .tile{border:0;border-radius:0;border-left:1px solid var(--line-soft);padding:18px 20px}
.nav--ruled .tile:first-child{border-left:0;padding-left:0}
.nav--ruled .tile:hover{translate:none;background:var(--signal-soft)}
.curve{inset:0;width:100%;height:100%}
@media (max-width:900px){
  .topcta{position:static;margin-top:22px;align-self:flex-start}
  .mid{max-width:none;padding:0;flex:none}
  .bot{flex:1;display:flex;flex-direction:column;margin-top:22px;min-height:0}
  .nav--ruled{grid-template-columns:1fr}
  .nav--ruled .tile{border:1px solid var(--line);border-radius:14px;padding:14px 16px}
  .curve{display:none}
}
@media (max-width:820px){
  .stage{padding:20px 20px 16px}
  .wm{width:190px}
  .top .meta{display:none}
}
""", body=f"""
<div class="stage">
  <header class="top">{WM}</header>
  <div class="topcta">{cta("cta--solid", ".42s")}</div>
  <main class="mid">{product()}<span class="meta rise" style="--d:.24s">Independent AI laboratory<br>Brisbane &#183; 27.47&#176;S 153.03&#176;E</span></main>
  <footer class="bot">{nav("tiles", .3, "nav--ruled")}</footer>
</div>
<svg class="curve" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
  <path pathLength="1" d="M40 664C320 664 440 210 780 210C1000 210 1080 130 1120 70"/>
</svg>
""")

L["08"] = dict(name="Rail and tab", slug="l08", css="""
body{display:flex}
.rail{width:clamp(52px,4.6vw,64px);flex:none;border-right:1px solid var(--line-soft);display:flex;flex-direction:column;
  align-items:center;justify-content:space-between;padding:22px 0;position:relative;z-index:1}
.rail .mark{width:30px}
.stage{flex:1;min-width:0;height:100%;display:flex;flex-direction:column;padding:var(--pad);position:relative;z-index:1}
.top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
.wm{width:clamp(190px,20vw,280px)}
.mid{flex:1;display:flex;flex-direction:column;justify-content:center;gap:clamp(24px,4.2vh,46px);max-width:min(640px,calc(100% - 250px))}
.bot{display:flex;justify-content:space-between;gap:20px;border-top:1px solid var(--line-soft);padding-top:14px}
.tab{position:absolute;right:0;top:50%;translate:0 -50%;background:var(--signal);border-radius:22px 0 0 22px;padding:20px 28px;z-index:3}
.tab .cta{color:#fff;font-size:14px}
.tab .cta:focus-visible{box-shadow:0 0 0 3px rgba(255,255,255,.4);border-radius:8px}
.curve{right:0;top:50%;transform:translateY(-50%);width:min(34vw,400px)}
@media (max-width:1000px){
  .mid{max-width:none}
  .tab{position:static;translate:none;border-radius:20px;align-self:flex-start;margin-top:24px}
  .curve{display:none}
}
@media (max-width:820px){
  body{flex-direction:column}
  .rail{width:100%;flex-direction:row;border-right:0;border-bottom:1px solid var(--line-soft);padding:14px 20px}
  .rail .vlabel{writing-mode:horizontal-tb;letter-spacing:.22em}
  .stage{padding:18px 20px 16px}
  .wm{width:190px}
  .top .meta{display:none}
  .mid{gap:22px;justify-content:flex-start}
}
""", body=f"""
<div class="rail fade" style="--d:.05s">
  {MARK}
  <span class="vlabel">Tachyon Lab &#183; Brisbane</span>
</div>
<div class="stage">
  <header class="top">{WM}<span class="meta rise" style="--d:.1s">27.47&#176;S 153.03&#176;E</span></header>
  <main class="mid">
    {product()}
    {nav("tiles", .3, "nav--grid")}
    <div class="tab pop" style="--d:.46s">{cta("", ".52s")}</div>
  </main>
  <footer class="bot"><span class="meta meta--faint rise" style="--d:.56s">Independent AI laboratory</span><span class="meta meta--faint rise" style="--d:.6s">04 destinations</span></footer>
</div>
<svg class="curve" viewBox="0 0 420 420" aria-hidden="true"><path pathLength="1" style="--d:.24s" d="M420 0A420 420 0 0 0 0 420"/></svg>
""")

L["09"] = dict(name="Top band", slug="l09", css="""
body{display:flex;flex-direction:column}
.band{height:clamp(66px,8vh,80px);flex:none;align-items:center;justify-content:space-between;gap:24px;padding:0 var(--pad);border-radius:0 0 26px 26px}
.band__l{display:flex;align-items:center;gap:18px;min-width:0}
.band .mark{width:50px}
.stage{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,440px);
  gap:clamp(24px,3.4vw,56px);padding:var(--pad);position:relative;z-index:1;align-content:center}
.left{display:flex;flex-direction:column;gap:clamp(20px,3.6vh,40px);min-width:0;border-bottom:1px solid var(--line-soft);padding-bottom:18px}
.wm{width:clamp(200px,22vw,300px)}
.right{align-self:center}
.curve{left:22px;bottom:22px;width:min(32vw,380px)}
@media (max-width:900px){
  .stage{display:flex;flex-direction:column;justify-content:flex-start;gap:22px}
  .right{flex:1;align-self:stretch;display:flex;flex-direction:column;min-height:0}
  .curve{display:none}
}
@media (max-width:820px){
  .band{height:62px;padding:0 20px;border-radius:0 0 20px 20px}
  .band .mark{width:36px}
  .band__label{display:none}
  .stage{padding:22px 20px 18px;gap:22px}
  .wm{width:200px}
  .left{gap:22px}
}
""", body=f"""
<header class="band slide-t">
  <span class="band__l">{MARK_REV}<span class="band__label">Access by application</span></span>
  {cta("cta--outline", ".3s")}
</header>
<div class="stage">
  <div class="left">
    {WM}
    {product(".2s")}
    <span class="meta rise" style="--d:.28s">Brisbane &#183; 27.47&#176;S 153.03&#176;E</span>
  </div>
  <div class="right">{nav("rows", .3)}</div>
</div>
<svg class="curve" viewBox="0 0 380 380" aria-hidden="true"><path pathLength="1" style="--d:.2s" d="M30 350A320 320 0 0 1 350 30"/></svg>
""")

L["10"] = dict(name="Inset frame", slug="l10", css="""
:root{--inset:clamp(28px,3vw,40px)}
.frame{position:absolute;left:var(--inset);top:var(--inset);width:calc(100% - var(--inset)*2);height:calc(100% - var(--inset)*2);z-index:0;overflow:visible}
.stage{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;
  padding:calc(var(--inset) + 26px) calc(var(--inset) + 30px) calc(var(--inset) + 56px)}
.top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
.wm{width:clamp(190px,20vw,280px)}
.mid{flex:1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,400px);align-items:center;gap:clamp(24px,4vw,64px)}
.nav--grid{grid-template-columns:1fr 1fr}
.bot{display:flex;justify-content:space-between;gap:20px}
.notch{position:absolute;left:50%;bottom:calc(var(--inset) - 20px);translate:-50% 0;z-index:3;
  border-radius:999px;box-shadow:0 0 0 12px var(--paper)}
.notch .cta--solid{padding:15px 32px}
.arc10{top:calc(var(--inset) + 24px);left:38%;width:min(24vw,280px)}
@media (max-width:900px){
  .mid{display:flex;flex-direction:column;justify-content:flex-start;align-items:stretch;gap:22px;flex:1}
}
@media (max-width:820px){
  :root{--inset:22px}
  .stage{padding:calc(var(--inset) + 16px) calc(var(--inset) + 14px) calc(var(--inset) + 52px)}
  .wm{width:186px}
  .top .meta{display:none}
  .bot span:last-child{display:none}
  .notch{box-shadow:0 0 0 9px var(--paper)}
  .notch .cta--solid{padding:14px 26px;font-size:13px}
  .arc10{display:none}
}
""", body=f"""
<svg class="curve frame" aria-hidden="true"><rect x="0" y="0" width="100%" height="100%" rx="30" pathLength="1"/></svg>
<svg class="curve arc10" viewBox="0 0 280 280" aria-hidden="true"><path pathLength="1" style="--d:.3s" d="M280 0A280 280 0 0 0 0 280"/></svg>
<div class="stage">
  <header class="top">{WM}<span class="meta rise" style="--d:.14s">Brisbane<br>27.47&#176;S 153.03&#176;E</span></header>
  <main class="mid">
    {product(".24s")}
    {nav("tiles", .34, "nav--grid")}
  </main>
  <footer class="bot"><span class="meta meta--faint rise" style="--d:.56s">Independent AI laboratory</span><span class="meta meta--faint rise" style="--d:.6s">04 destinations</span></footer>
</div>
<div class="notch pop" style="--d:.62s">{cta("cta--solid", ".68s")}</div>
""")

NAMES = {"01": "01-right-band", "02": "02-bottom-band", "03": "03-left-band",
         "04": "04-corner-block", "05": "05-capsule", "06": "06-central-axis",
         "07": "07-sweeping-arc", "08": "08-rail-tab", "09": "09-top-band",
         "10": "10-inset-frame"}

for num, spec in L.items():
    html = HEAD.format(num=num, name=spec["name"], css=spec["css"].strip(),
                       slug=spec["slug"], sprite=SPRITE) + spec["body"] + TAIL
    path = OUT / (NAMES[num] + ".html")
    path.write_text(html, encoding="utf-8")
    print("wrote", path.name, len(html))
