# Tachyon Lab — Art Direction Memo
**To:** build · **From:** art direction · **Re:** one-page field recording, v1

The page is an instrument reading, not a pitch. Black field, one orange particle, mono annotations, display type that moves only when the user does.

## 1. Teardown

### KAI Design — live, 1440×900
- **Grid:** one full-bleed WebGL canvas; no DOM columns. Fixed 60px frame. Three anchors: KAI lockup 147×50 at x60/y779 in scene mode (centred x648/y731 during the intro); tagline 21px, right-aligned, ending x1379/y804; squiggle 145×57 at x1234/y38.
- **Type:** 36px Japanese Mincho/brush statement, 14 glyphs, 519px wide, centred x733/y398. 14px sub-label. 21px bottom tagline. Tracking ≈ +0.02em; one weight only.
- **Palette:** #E2ECF4 field, #004EA2 ink. One accent, no second hue.
- **Rhythm:** intro statement occupies 36% of width, with 250px of empty space above it; type never exceeds 45% width, photography runs full-bleed.
- **Motion:** intro starts ~1.1s after load, resolves ~2.8s; scene change ~1.2s, settling 1.6s after a wheel event; long-tailed expo-like deceleration, no bounce; photography drifts 1.06→1.00 scale over 1.6s.
- **Premium comes from:** a fixed frame with moving content, one accent, slow 1.2s dissolves, type treated as image, zero containers or chrome.

### Stefan Vitasović — live, 1440×900
- **Grid:** 12 columns ≥900px; 20px outer margin and 20px gutters; column 98.33px; content 1400px. Below 900: 4 columns, 10px margin.
- **Type:** Helvetica Now Display Medium. Title max(42px, 5.787vw) = 83.33px at 1440, 48px at 390; line-height 1.3; tracking 0 desktop, −0.02em mobile. Nav 16px/17.9. Index 15px/17.4.
- **Rhythm:** index wrapper 453.3px, two 216.7px columns, 20px gap, 27.4px row pitch, 145.8px below the title. 19 rows, numbers via counters.
- **Motion:** preload flicker 1s infinite, 50ms stagger, quad-out; link hover opacity 0.2s (default ease) plus strikethrough; nothing animates after load.
- **Premium comes from:** one typeface at 83px against 15px labels (5.5:1), left-aligned asymmetry, a 634×356 media mass starting x668, no decoration.

## 2. Intro storyboard — 2.80s, 1440×900
| t | Event |
|---|---|
| 0.00 | Black #050505. No UI. |
| 0.10 | Streak head launches from (−160, 648). 1px #FF3B00 trail grows 280→420px, 4×4px head. 520ms, cubic-bezier(0.16,1,0.3,1), constant −7.0° angle. |
| 0.62 | Head exits at (1600, 432); trail holds 120ms. |
| 0.66 | Last 320px of trail snaps to horizontal y96, x48→1392: 260ms, cubic-bezier(0.77,0,0.175,1); colour → #3A3A38 over 180ms. |
| 0.80 | Rules y96/420/744 draw scaleX 0→1 from x48, 380ms expo-out, 30ms stagger; vertical rule x912 draws 460ms. |
| 1.06 | 11px mono meta line at y64 — TACHYON LAB / FIELD RECORDING 001 left, PERTH 31.95°S right — rises 8px, 220ms quad-out. |
| 1.24 | CONTENTS 104px Archivo at x48/y152; clipped from the bottom, 300ms expo-out. |
| 1.40 | Five rows at 72px pitch from y360: index mono x48, title 36px x180, ref x1392; 10px rise + fade, 200ms quad-out, 28ms stagger. |
| 1.86 | Orange 8×8 register mark at (1392,96), scale 0→1, 100ms expo-out. |
| 2.00 | 1px orange underline under row 01 draws to 48px, 600ms sine-in-out. |
| 2.60 | Scroll enabled. |
| 2.80 | Fully still. Intro ends. |

Mobile: entry (−80, 560) → exit (470, 420); rules y88; rows 52px pitch; title 56px.

## 3. Type and spacing

### 1440×900
| Role | Size / line | Tracking |
|---|---|---|
| Statement | 168/145 Archivo Expanded | −0.035em |
| Section | 104/96 | −0.03em |
| Method | 64/64 | −0.02em |
| Row title | 36/40 | −0.01em |
| Body | 18/28 Archivo | 0 |
| Label | 11/16 Plex Mono | +0.16em |
| Data | 13/20 Plex Mono | +0.06em |

### 390×844
Statement 56/50 (−0.02em); section 44/44; method 32/34; row 22/26; body 15/24; label 10/14 (+0.14em); data 11/16.

### Space
8px baseline; scale 4/8/12/16/24/32/48/64/96/144/216. Desktop: 48px margins, 16px gutters, 12 columns (97.33px), 144px section padding, 56px contents rows, 1px #1C1C1B rules. Mobile: 20px margins, 12px gutters, 6 columns (48.33px), 72px section padding, 52px rows. Max measure 62 characters. Every block lands on 8.

Section beats: contents 100vh, statement 100vh, method 120vh, index auto, evidence 100vh, contact 80vh.

## 4. Eight motion behaviours
| # | Trigger | Property | Duration | Easing |
|---|---|---|---|---|
| 1 | Load | Streak translate3d + scaleX, head 4px | 520ms | 0.16,1,0.3,1 |
| 2 | Intro 0.80s | Contents rules scaleX/Y, rows 10px rise + fade | 380ms rules, 200ms rows, 28ms stagger | 0.19,1,0.22,1 / 0.25,0.46,0.45,0.94 |
| 3 | Scroll through statement | Line A −8% X, line B +8% X; no fade | Scrubbed, lerp 0.08 | Linear map, no bounce |
| 4 | Statement enters 60% | Per-line clip-path inset + 24px rise | 700ms, 80ms stagger | 0.19,1,0.22,1 |
| 5 | Loop enters 70% | stroke-dashoffset draw, then dot on offset-path | 900ms per quarter, 120ms stagger; 8s loop | 0.65,0,0.35,1 |
| 6 | Index row hover | Bg wipe scaleX, text colour, 1px orange underline | 180 / 120 / 220ms | expo-out |
| 7 | Evidence enters 70% | 16px rise + fade, per figure | 420ms, 60ms stagger | 0.25,0.46,0.45,0.94 |
| 8 | Contact copy | 1px sweep, label swap COPY→COPIED | 160ms / 120ms | quad-out |

## 5. Avoid
1. **No eyebrow pills** (“AI-native”, “Introducing”) and no centred promise with two CTAs. The first screen is a contents page, not a pitch.
2. **No cards, radii, shadows, glass or floating panels.** Separate with 1px rules and void; radius stays 0.
3. **No gradients or glows** — especially blurred orange “energy”. The streak is one solid 1px line with a 4px head.
4. **No stock imagery, 3D blobs, dashboard mockups, avatar rows or logo clouds.** Evidence is typographic, dated, sourced.
5. **No uniform fade-up-on-scroll, count-up stats, springy scale hovers or scroll hijack.** Motion is scrubbed or fires once.
