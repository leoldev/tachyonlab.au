# Tachyon Lab — design system v2 ("Instrument Paper")

This is the source of truth for every page. It replaces the v1 "dark terminal"
system, which failed on three counts: unreadable for a non-specialist, no
hierarchy, and a palette (black + gold + chartreuse) shared with every other
AI-startup terminal site.

## What was surveyed (Mistral AI, mistral.ai)

Observed directly, not guessed:

- **Light, warm, quiet.** Background `#FBFBF8`, text near-black `#07070B`.
  Roughly 70% of the page is empty paper.
- **Hairlines, not boxes.** Sections are separated by 1px rules. No card
  shadows, no rounded panels, no borders around text.
- **One accent family, used in big flat blocks.** Flame ramp
  `#FFAF01 → #FF8204 → #FF5229 → #E51300 → #C4001D`. Colour appears as full
  fields (an orange card, a yellow card), never as decoration on text.
- **Type is calm and large.** Display 56px/44px, weight 500, letter-spacing
  −0.01em, **sentence case, never all-caps headlines.** Body 16px Inter.
  A monospace (Space Mono) is used *only* for tiny labels like `PRODUCTS`.
- **Copy is short and human.** "We make the models. You keep them." One idea
  per sentence. No jargon without a plain sentence next to it.
- **Motion is restrained.** The playfulness comes from flat colour, spot
  illustration, and a mascot — not from six simultaneous animations.
- **Structure repeats:** tiny mono eyebrow → big sentence → hairline →
  content grid → one dark full-bleed band → footer.

## The diagnosis of v1

1. Six live canvases fighting at equal volume. Nothing to look at first.
2. Jargon as headline. A stranger cannot read the first sentence.
3. Dark neon = the single most common AI-startup look. Nothing says *lab*.
4. No whitespace, no rhythm, no figure/caption logic.

## The system

### Colour — paper does the work, chroma lives in the windows

```
--paper      #F2EFE9   page
--paper-hi   #FBFAF7   raised rows, hover
--ink        #111114   headings, primary text
--ink-2      #55524B   secondary text
--ink-3      #8C887F   captions, meta
--rule       #DED9CE   hairlines
--graticule  #E8E3D8   faint 24px lab grid on paper
--void       #08080A   instrument viewport
--void-2     #0E0E11   viewport chrome
--beam       #E5310E   THE accent — lines, dots, active state only
--phase      #D4FF00   "phase-locked" state, inside viewports only
--amber      #FF9F1C   calibration marks, inside viewports only
```

Rules:
- **On paper: ink, hairlines, and one red. Nothing else.** No coloured text
  except `--beam` on active/live markers.
- **All spectrum (gold, chartreuse, crimson, amber) exists only inside black
  viewports.** The motion graphics get to be loud because nothing competes.
- Red is never a large fill. It is a 1px line, a 6px dot, or an underline.
- No blue / cyan / teal / purple. No CSS gradients anywhere.

### The signature device — one beam line

A single 1px `--beam` vertical line runs the full height of every page at the
left margin (x = 64px desktop, x = 16px mobile), with small tick marks where
each section begins and the section's figure number set beside it in mono.
Everything hangs off that line. It is the tachyon track, and it makes the page
unmistakable at a glance.

### Type

- **Archivo** (400/500/600/700) — display and body. Headlines are tight
  (−0.035em), large, **sentence case**.
- **Instrument Serif** italic — the axiom and plain-English lines only. The
  machine speaks in grotesk; the human sentence speaks in serif.
- **IBM Plex Mono** (400/500) — labels, figure numbers, readouts, nav indices.
  11px, uppercase, letter-spacing 0.14em.

Scale: 11 / 13 / 15 / 17 / 24 / 34 / 48 / clamp(44px, 7vw, 92px).

### Layout

- Max width 1200px, gutter 24px (18px mobile).
- Section padding 112px desktop / 64px mobile, separated by hairlines.
- Faint 24px graticule on the paper (`--graticule`), fading out inside viewports.
- 12-column feel via hairline dividers, not via visible column lines.

### Motion

- Scroll reveals: opacity + 12px rise, 500ms, staggered 60ms, IntersectionObserver.
- One beam-line draw under the hero headline (scaleX, 900ms).
- Viewport corner ticks + a slow scan line inside dark windows.
- Mini previews pause when off-screen.
- All of it behind `prefers-reduced-motion`.

## Page structure — `index.html` (the only entry point)

1. **Nav** — paper, hairline bottom, 60px. `TACHYON` wordmark + mono
   `LAB · LIGHT-ALPHA`. Links: `FIELD` (active) · `01 CONE` · `02 DISSIPATE` ·
   `03 FRINGE` · `04 MANIFOLD` · `05 TRACE`.
2. **Statement** (~78vh) — mono eyebrow with live red dot; H1
   **"Cloud doesn't remember you."**; Instrument Serif italic sub
   *"It computes, it answers, it forgets. There is no after."*; a plain
   paragraph; and a mono spec block on the right.
3. **FIG. 01 — CHRONON FIELD** — full-bleed black viewport, ≥70vh, the hero
   canvas. Corner labels `FIG. 01 — CHRONON FIELD` / `● LIVE` / caption /
   readouts `β ds² λ FPS`. Plain-English caption underneath.
4. **§ WHAT THIS IS** — three hairline-divided columns, mono index + 24px
   headline + 15px body. No icons.
5. **FIG. 02 — INSTRUMENT INDEX** — H2 "Five instruments. One axiom." then
   five hairline rows: mono index · name · one plain sentence · a small dark
   preview viewport (240×110, live, simplified) · `OPEN →`.
6. **FIG. 03 — STATELESS VS PHASE-PERSISTENT** — two black windows side by
   side: left dissolves a word, right locks it. Caption in plain words.
7. **Footer** — dark `--void` band. Instrument Serif axiom, three mono link
   columns including **Honest limits**, bottom line in mono.

## Copy rules

- Sentence case. Never all-caps headlines.
- One idea per sentence. Any technical term gets a plain sentence beside it.
- No marketing verbs: no *unlock, supercharge, seamless, powerful, next-gen*.
- No pricing, no signup, no demo request, no testimonials, no metrics claims.
- Every readout is labelled **simulated**. Never "measured".
- Navigation labels and `OPEN →` are permitted — they are wayfinding, not CTAs.

## Hard constraints (unchanged from v1)

- 100% vanilla, single file per page. Google Fonts only. No frameworks.
- No box / hardware / model-spec / lab-rig mentions anywhere.
- `_previews/` holds verification captures.
