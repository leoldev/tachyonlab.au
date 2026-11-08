# Delegation policy — DeepSeek image failures

## The bug

`deepseek-v4.1-flash` has **no image input**. Any task that asks it to look at a
screenshot, render, PNG, or any image-returning tool fails with:

    image input is not available on this engine

This has now broken several rounds of work. It is a routing mistake, not a model
limitation to work around each time.

## Rules (do not re-derive these)

1. **Anything visual → `muse-spark-1.3-contributor`** (multimodal, 1M context) or
   do it yourself. Layout judgement, brand/design decisions, "does this look
   right", "compare these two pages", image-driven QA.
2. **`deepseek-v4.1-flash` gets text-only work only**: generate or edit code from
   a written spec. Never ask it to inspect a result.
3. Every DeepSeek prompt must open with this line, verbatim:

   > CODE-ONLY. Do not call browse, screenshot, shot, or any tool that returns an
   > image — you cannot see images. Do not fetch URLs. Read local files if needed,
   > then write the complete file to disk.

4. **Never say "look at the screenshot".** Write out the context: exact file
   paths, exact observed bugs, exact hex values, exact copy, exact line numbers.
5. **Always verify DeepSeek output yourself** with a local screenshot before
   accepting it. Unverified delegation output is not done work.
6. Muse for anything where seeing the result matters. DeepSeek for volume code.

## Why this matters here

This project is a visual product. Half the value of a delegated task is the
verification step, and verification is image work. Splitting a task as
"DeepSeek writes, I verify" only works when the verification loop is closed
before the task is considered complete.
