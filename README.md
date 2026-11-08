# Tachyon Lab

A one-page landing site for Tachyon Lab, an independent local-first AI lab in
Brisbane. It has one job: show Tachyon-V1 light-alpha and ask for access.

**Local:** <http://localhost:8766/>

## Run

```sh
cd tachyon-v1
python3 -m http.server 8766
# http://localhost:8766/
```

No build step, framework or bundler. Fonts are loaded from Google Fonts
(Archivo variable + IBM Plex Mono).

## The page

| Section | Anchor | Role |
| --- | --- | --- |
| Entry | `#top` | `TACHYON LAB.`, one sentence, circular access target, four glyph links, Scroll cue |
| Identity | `#identity` | Independent lab, Brisbane, local-first and erasable |
| Method | `#method` | Capture → curate → train → delete, drawn as one local loop |
| Evidence | `#evidence` | Pilot measurements with the caveats stated |
| Uplink | `#uplink` | Request access / design-partner contact |

There is deliberately no index, no carousel, no product table and no footer.
Nothing is being sold yet.

The opening streak ends on the live `.access__target` centre. The page is then
revealed through a circular aperture opening from that exact point. The target
is not decoration; it is the CTA.

## Files

- `index.html` — markup, copy, SVG glyph sprite, access target.
- `src/site.css` — layout, type scale, responsive rules, reduced motion.
- `src/app.js` — target-centre measurement, intro wiring, header reveal, panel
  reveals, debug deep links.
- `src/field.js` — structured grid and contour field, centred on the target and
  dimmed by scroll.
- `src/intro.js` — streak, impact, circular aperture, skip and reduced-motion
  paths.
- `brand/logo-ideas.svg` — standalone sheet with ten mark directions.
- `_shots/` — final desktop, mobile and intro captures.
- `_shot.js`, `_qa*.js` — Playwright capture and QA helpers.
- `_archive/field-recording-001/` — superseded site and old art-direction memo.
- `docs/art-direction.md` — current design memo.

## Controls and debug

- `?nointro=1` — skip the opening sequence.
- `?p=0.5` — jump to a scroll fraction and skip the opening sequence.
- Click, key, wheel or tap — skip the opening sequence.
- Reduced motion opens the page immediately: no streak, no aperture, no field
  loop.
- No-JS fallback shows the full landing and panels without motion.

## QA state

Checked at 320, 360, 390, 768, 1024, 1440, 1920 and 2560 px:

- No horizontal overflow; the headline is measured against its line box so
  `TACHYON` is not clipped at any breakpoint.
- The aperture origin matches the live target centre at 1440×900 and 390×844,
  before, during and after the reveal.
- Glyph anchors land below the fixed bar; the bar is hidden and unfocusable at
  the top.
- Skip, reduced-motion, no-JS and missing-`intro.js` fallbacks all reveal the
  page. No console errors.

## Honest state

Tachyon-V1 is **light-alpha**, with G1 targeted for **16 November 2026**.
The adapter is **not trained**. Canary **0/400 is a target, not a claim**.
Measured pilot figures: 16.2 tok/s at 512, 14.6 tok/s at 16K, 20.1 GB peak,
RAG 0.800 vs base 0.317 on 20 synthetic tasks.

## Palette and type

Strict black / paper white / signal orange. No gradients, images, cards or
rounded corners.

```
--bg    #070706
--fg    #F4F3EE
--acc   #FF3B00
--muted #9A9A92
--dim   #7C7C74
--rule  rgba(244,243,238,.14)
```

Archivo variable (`wdth`, `wght`) for display; IBM Plex Mono for labels and
instrument readouts.

## Legacy

`01-minkowski.html` … `05-chronon.html`, `_v1-hub-backup.html`, `_previews/`,
`_refs/`, `_survey/`, `DESIGN.md` and `DELEGATION.md` belong to earlier
“Instrument Paper” explorations. They are not linked from the current page.
