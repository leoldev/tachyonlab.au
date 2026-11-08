# Tachyon demo — local trace store (`src/demo.js`)

Self-contained IIFE. No model, no network, no dependencies, no CSS file.

## Public API

```js
window.TachyonDemo.mount(optionalRootElement)  // -> the #demo-root element
```

- `optionalRootElement` is optional; if omitted, `document.getElementById('demo-root')` is used.
- If no root exists, one is created (`<div id="demo-root">`) and appended to `body`.
- Idempotent: the root is marked with `data-tachyon-demo="1"`; a second call returns the same root and builds nothing new. Verified in a stub-DOM harness: 3 calls → 1 root, 1 `<style>`, 1 UI tree.
- Injects exactly one `<style id="tachyon-demo-style">`; every rule is scoped under `#demo-root`.
- Nothing else is exported on `window`.

## Storage

- Key: `tachyon-demo-traces-v1` (exact).
- Value: JSON array of `{text: string, at: string}` where `at` is `Date.now().toISOString()` at save time.
- Every read/write is in `try/catch`. On mount a probe write/remove tests availability; if it throws (private mode, disabled storage) the demo falls back to an in-memory store held in a closure variable and says so:
  `Storage is unavailable in this browser; traces live in memory only for this session.`
- A `setItem` that throws mid-session also downgrades to memory-only. Nothing throws out of `mount()` or any handler.

## Byte-count method

UTF-8 byte length of the exact serialized string that was (or would be) written to the key:

```js
new TextEncoder().encode(raw).length
```

Fallback when `TextEncoder` is absent — a manual walk over `charCodeAt` that counts 1 byte for `< 0x80`, 2 for `< 0x800`, 3 otherwise, and 4 for a well-formed surrogate pair (`0xD800–0xDBFF` + `0xDC00–0xDFFF`), counting a lone surrogate as 3. Both paths were checked against each other in the harness (123 bytes for the default trace; 110 bytes for a seeded 2-trace value containing `—` and `é`). The readout always shows `0 bytes` when nothing is stored.

## Behaviour

- `Keep as trace` appends the current textarea text, persists, re-renders; refuses an all-whitespace draft with `Nothing to save: the draft is empty.`
- `Delete all traces` removes the key, clears state and the `<pre>`.
- `Inspect` / `Hide` toggles a `<pre>` containing the raw stored string character-for-character (`nothing stored` when empty), `max-height:200px`, `overflow:auto`, `white-space:pre-wrap`.
- Readout cells: `TRACES` (count), `STORED` (UTF-8 bytes), `ADAPTER` (`none` or `trained (simulated)`).
- Status `<p aria-live="polite">`: states an action message, then resets after 6s to a calm summary via a single `setTimeout` (cleared and rescheduled, never more than one pending). No `requestAnimationFrame`, no `setInterval`.
- On mount, the most recent trace is shown as a mono `LAST TRACE /` line under the draft (hidden when there are none).
- Counts are plain `textContent`; nothing animates.

## Type / palette

`#070706` background, `#F4F3EE` text, `#9A9A92` secondary, `#FF3B00` accent, hairlines `rgba(244,243,238,.14)`. Archivo stack 18px/1.6 (17px ≤640px); IBM Plex Mono labels 13px uppercase `letter-spacing:.1em`. No radii, shadows, gradients, or non-accent colour. Buttons are real `<button type="button">` with 1px hairline borders, transparent fill, delete border in accent, `:focus-visible` outline `1px solid #FF3B00` offset 3px.

## Lines of code

`wc -l src/demo.js` → **258** lines (232 non-blank).

## Checks run

- `node --check src/demo.js` → pass, no output.
- Stub-DOM + stub-localStorage harness (plain `node`, no browser): mount, double mount, save ×2, inspect/hide, wipe, empty-draft refusal, seeded pre-existing traces, byte counts, raw `<pre>` equality, and the storage-unavailable path (getter throwing) with `TextEncoder` absent. All behaved as specified.

## Not verified

- **No real browser run.** I did not open a page, so layout, font loading (Archivo / IBM Plex Mono are referenced, not bundled — a host page must load them), focus-ring rendering, wrapping inside the 200px `<pre>`, and the mobile breakpoint are unverified; the harness only proves DOM wiring and logic.
- Contrast and keyboard tab-order are reasoned from the CSS, not measured with an assistive technology.
