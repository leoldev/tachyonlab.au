# wordmark.svg build note

Source: `tachyon-lab-wordmark-text.svg` → output `wordmark.svg`.

## Elements removed

Deleted the icon / formal-logo lockup at the bottom right of the artwork:

| Element | Class | Note |
| --- | --- | --- |
| `<path d="M894.4,360.4c-6.2...">` | `st5` | shape |
| `<path d="M921,248.6c-8.7...">` | `st11` | shape |
| `<path d="M894.4,297.8">` | `st8` | empty path |
| `<path d="M957.2,59.2h-64.2...">` | `st9` | hexagon |
| `<line x1="882.4" y1="119.7" x2="904.7" y2="81.7">` | `st6` | line 1 of 3 |
| `<line x1="903" y1="157.8" x2="947.1" y2="157.8">` | `st6` | line 2 of 3 |
| `<line x1="945.4" y1="81.6" x2="967.5" y2="119.8">` | `st6` | line 3 of 3 |

## Style rules removed

Nothing else referenced these, so they were dropped entirely:

- `.st5` (fill #f5f3ec)
- `.st6` (stroke-width 5px, stroke-miterlimit 10, fill none, stroke #f5f3ec)
- `.st7` (stroke-miterlimit 10, stroke #000)
- `.st8` (stroke-miterlimit 10, fill none, stroke #ff3a00)
- `.st9` (stroke-miterlimit 10, stroke #f5f3ec, stroke-width 25px)
- `.st11` (fill #ff3a00)

Verified removals: `grep "st5\|st6\|st7\|st8\|st9\|st11" wordmark.svg` → no matches (exit 1).

## Background

`<rect class="st7" width="1206.9" height="400"/>` became `<rect width="1206.9" height="400" fill="none"/>` —
the `st7` class and its `stroke: #000` are gone, so the wordmark composites over any background.

## Font fallback

In the `.st2, .st4, .st3` rule:

- `font-family: TachyonArchivo-Heavy, 'Tachyon Archivo Heavy'` → `font-family: Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif`
- added `font-stretch: 115%;` and `font-variation-settings: 'wdth' 115, 'wght' 800;` alongside the untouched `font-size: 200px` and `font-weight: 800`.

## Verified numbers (from commands run after the write)

- `grep -c "path" wordmark.svg` → **0**
- `grep -c "text" wordmark.svg` → **3**
- `<text ` start tags → **3** (the `.st2` wordmark LAB; the `.st4` group containing TACHY/O/N tspans; the `.st3` orange period)
- file size: **1267 bytes** (`wc -c wordmark.svg`)
- `viewBox="0 0 1200 400"` — unchanged (line 2)

## Fill colours present in the file

- `#f4f3ee` (`.st0, .st1, .st2` — the ivory letterforms, incl. LAB)
- `#ff3b00` (`.st3` — the orange period)
- `fill="none"` on the background rect

No other hex colours remain.
