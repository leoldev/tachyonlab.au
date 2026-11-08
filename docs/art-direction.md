# Tachyon Lab — Art Direction

**One screen, one action.** The visitor should understand the product and ask
for access without reading a manifesto.

## Composition

- Full-bleed black field with a measured grid and contour rings. No cards,
  gradients, images or rounded corners.
- Edge padding: `clamp(20px, 4.2vw, 64px)`; the page has no fixed side rail.
- Entry: full-width `TACHYON LAB.`; below it, the single sentence sits left and
  the circular access target sits right. Four glyph links anchor the bottom
  left; the Scroll cue anchors the bottom right.
- The fixed bar appears only after 62% of the entry and contains the brand and
  one access link. Nothing else.
- Panels are compact: sticky glyph + label on the left, heading and one short
  body on the right.

## Type

| Role | Face | Size / treatment |
| --- | --- | --- |
| Display | Archivo variable | `clamp(40px, 15.2vw, 280px)`, weight 800, width 115%, tracking −.055em, uppercase |
| Sentence | Archivo | `clamp(18px, 1.62vw, 24px)`, line-height 1.35 |
| Panel headings | Archivo | `clamp(31px, 4.2vw, 64px)`, weight 700 |
| Labels / meta | IBM Plex Mono | 8–11px, tracking .14–.18em, uppercase |

`TACHYON` fills its line box at every breakpoint. Do not increase the display
size without re-measuring the text width against the container.

## Palette

```
--bg    #070706
--fg    #F4F3EE
--acc   #FF3B00
--muted #9A9A92
--dim   #7C7C74
```

One accent only. Orange means action, active state or a measurement mark; it
never fills a surface.

## Field

- Grid spacing 78px desktop / 56px mobile; every fourth line is major.
- Registration crosses at major intersections; axes pass through the target.
- 34 contours desktop / 23 mobile, centred on the access target. Elliptical
  (1.16 × 0.8), tilted −0.16 rad, warped by three low harmonics.
- Every seventh contour is orange; every sixth is dashed. Tick marks every
  fifth ring.
- Slow drift (`t * 0.045`); dims to 58% over the first viewport of scroll.
- Static single frame under `prefers-reduced-motion`.

## Opening sequence

| Time | Event |
| --- | --- |
| 0–360ms | Black. No labels, no telemetry. |
| 360–1180ms | Streak launches from x 5.5% and accelerates to the live target centre. Six ghost ribbons, one orange head. |
| 1180ms | Impact: hairline flash, 1px shake, three expanding rings, orange core. Target re-measures here. |
| 1510ms | Circular aperture opens from the target centre over 880ms; the landing is revealed underneath. |
| 2390ms | Boot removed. Site is fully interactive. |

Any click, key (except Tab/modifiers), wheel or tap skips. Reduced motion opens
instantly. The aperture uses the measured target centre, not a hard-coded point.

## Breakpoints

- ≤860px: entry stacks; sentence above, target below and right-aligned; glyphs
  in one row; Scroll cue becomes horizontal.
- ≤420px: target 128px; meta stays visible at 8px so “Tachyon-V1 /
  light-alpha” is never lost.
- ≤640px height: compact type and spacing so the whole entry stays above the
  fold.
- Panels collapse to one column; metrics go 4-up → 2-up; the method track scales
  with its container.

## Non-negotiables

- No location coordinates, clocks, “field recording” numbers or other
  instrument cosplay.
- No index, product table, carousel, marquee or footer.
- No headline aphorism in place of the product. The sentence stays literal.
- No claims beyond the measured pilot and the stated light-alpha status.
