# light-alpha — ten placements

One wayfinding language, arranged ten ways. Entry screen only: brand lockup,
the product, four destinations, one action. No marketing sentence.

Gallery: <http://localhost:8787/_layouts/>

## The language

Japanese modernist restraint on Mistral-like warm paper. Generous negative
space, hairlines instead of boxes, asymmetric balance, vertical micro-labels,
rounded line pictograms, and curved hairline outlines as the recurring motif.

| Token | Value | Role |
| --- | --- | --- |
| Paper | `#FBFAF7` | Field |
| Surface | `#F3F1EA` | Recessed blocks |
| Sand | `#E6DFCC` | Warm corner wash |
| Ink | `#13130F` | Type and marks |
| Dim | `#6E6A60` | Secondary type |
| Faint | `#9C988D` | Micro-labels |
| Signal | `#2B3CFF` | The only accent — action, active state, teardrop |
| Signal deep | `#1D2AD8` | Pressed / hover |

Type: Inter Tight for names, IBM Plex Mono for micro-labels. Sentence case
throughout; the product is lowercase `light-alpha`.

## The ten

| # | File | Placement of the action |
| --- | --- | --- |
| 01 | `01-right-band.html` | Full-height indigo band on the right edge, vertical text |
| 02 | `02-bottom-band.html` | Full-width indigo band along the bottom, rounded top corners |
| 03 | `03-left-band.html` | Full-height band on the left, product right-aligned |
| 04 | `04-corner-block.html` | Rounded indigo field in the bottom-right corner |
| 05 | `05-capsule.html` | Capsule mid-right, curved connector from the list |
| 06 | `06-central-axis.html` | Capsule on the central axis, two curves flanking |
| 07 | `07-sweeping-arc.html` | Capsule top-right, long S-curve across the page |
| 08 | `08-rail-tab.html` | Paper rail left, indigo tab protruding from the right edge |
| 09 | `09-top-band.html` | Indigo band across the top, two columns below |
| 10 | `10-inset-frame.html` | Capsule straddling the bottom edge of an inset hairline frame |

## Content

- Brand lockup: the supplied artwork, inlined as a sprite and referenced with
  `<use>`, live `<text>` plus `@font-face` on `brand/fonts/TachyonArchivo-Heavy.ttf`.
- Product: `light-alpha`, with three status chips — By application, Local-first,
  On-device.
- Destinations: Identity, Method, Evidence, Uplink. Each opens the matching
  section of the live site in a new tab.
- Action: `Request access` → `mailto:apply@tachyonlab.au?subject=light-alpha access`.

## Motion

One eased entrance per placement on `cubic-bezier(.22,.68,.24,1)`: bands slide
from their edge, the corner block and tab pop, curves draw via `stroke-dashoffset`,
content rises in a short stagger. No burst, no second reveal.

`?still=1` renders settled. `prefers-reduced-motion: reduce` does the same.

## Gallery controls

The index carries a sticky control bar: **View** (Grid / Compare), **Viewport**
(1280×900, 834×1112, 390×844) and **Motion** (Still / Play). Compare renders all
ten as live scaled iframes; Play reloads them with their entrances running.
State persists and is addressable: `?view=compare&vp=390x844&motion=play`.

## Files

- `system.css` — tokens, marks, product block, pictogram nav, action, motion.
- `01-…` … `10-…` — placement only; each links the shared kit.
- `_shots/` — every page at 1280×900 and 390×844, plus the gallery.
- Generator: `../_qa/build-layouts.py` (re-run after editing the kit).

## Run

```sh
cd tachyon-v1
python3 -m http.server 8787
```

Every page fits one viewport at 1280×900 and 390×844 with no scroll.
