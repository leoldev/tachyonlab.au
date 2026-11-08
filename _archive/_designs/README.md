# Tachyon Lab — ten design languages

Ten separate entry screens, one per design language. Each is a single viewport:
wordmark, one line, four destinations, access. No section body copy.

Open the gallery: <http://localhost:8787/_designs/>

## The ten

| # | File | Language | Field |
| --- | --- | --- | --- |
| 01 | `01-fahrplan.html` | Departure board — sections as timetable rows | Dark |
| 02 | `02-drafting.html` | Engineering drawing sheet — dimensions, title block | Light |
| 03 | `03-ephemeris.html` | Astronomical catalogue — rulers, star field, RA coordinates | Dark |
| 04 | `04-ledger.html` | Two-page accounting spread — ruled entries, balance carried forward | Cream |
| 05 | `05-telex.html` | Teleprinter tape — sprockets, typing header, `— 30 —` | Pale |
| 06 | `06-wayfinding.html` | Signage system — pictograms, full-height blue access band | Dark |
| 07 | `07-specimen.html` | Type specimen — the wordmark itself is the subject, four sizes | Off-white |
| 08 | `08-contour.html` | Topographic survey — drawn contours, legend, scale bar | Warm paper |
| 09 | `09-contact.html` | Film contact sheet — frames, sprockets, grease-pencil circle | Dark |
| 10 | `10-form.html` | Application form — field boxes, checkboxes, rubber stamp | Paper |

## Shared system

- **Signal colour** `#2B3CFF` (Cherenkov indigo) replaces orange. It marks the
  wordmark period, the teardrop of the compact mark, and every active state.
- **Logo** is the supplied artwork, `brand/tachyon-lab-wordmark-text.svg`, rebuilt
  as `brand/wordmark-inline.svg`. It is inlined in every page with live `<text>`
  and `@font-face` loading `brand/fonts/TachyonArchivo-Heavy.ttf`, so the brand
  face renders identically on any machine. `brand/wordmark.svg` is defective and
  unused.
- **Compact mark** `brand/mark.svg` — the half-disc and the teardrop extracted
  from the bottom right of the artwork, teardrop recoloured to the signal.
- The hexagon reads as the `O` in TACHYON; its interior uses `--wm-bg`, set to the
  page background, so grids and contours do not show through it.
- Every page fits one viewport at 1280 × 900 and 390 × 844, no horizontal or
  vertical scroll.

## Motion

One eased entrance per language, all on `cubic-bezier(.22,.68,.24,1)` — no burst,
no flash, no second reveal.

| # | Entrance |
| --- | --- |
| 01 | Wordmark parts rise, rows wipe open left to right |
| 02 | Dimension lines draw, wordmark settles, sheet elements fade |
| 03 | Equator line draws, star field fades up, catalogue fades in |
| 04 | Margin rules draw down, entries wipe open |
| 05 | Header types in, then the message and nav lines wipe |
| 06 | Signs slide in from the left, access band unrolls |
| 07 | Display mark scales down from 1.03, smaller specimens fade in |
| 08 | Contour lines draw in sequence, plate and legend fade |
| 09 | Film gate lifts, frames fade, grease pencil draws last |
| 10 | Form rules wipe top to bottom, stamp lands |

`?still=1` on any page disables the entrance and renders settled.
`prefers-reduced-motion: reduce` does the same automatically.

## Links

The four section links open the matching section of the live site
(`../index.html#identity` etc.) in a new tab, so a design stays open while its
destination is inspected. Access opens `mailto:apply@tachyonlab.au`.

## Run

```sh
cd tachyon-v1
python3 -m http.server 8787
```

No build step. Screenshots of every page at both sizes are in `_shots/`.
