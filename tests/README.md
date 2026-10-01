# QA tests

Browser-based checks for the LipiLab converter. They are **not** part of the
published site — `index.html` only loads `app.js` and `partner.js`. They live
here so the root stays limited to the five files GitHub Pages actually serves.

## Running

```bash
npm i puppeteer-core          # once
cd tests
node qa_brand.js              # any single file
```

Each script opens `../index.html` in headless Chrome, asserts things, prints
`PASS`/`FAIL` lines and ends with a `RESULT pass=N fail=M` line. A non-zero exit
code means something failed.

Paths are resolved from `__dirname`, so the folder can live anywhere.

## What each file covers

| File | Covers |
|---|---|
| `qa_brand.js` | logo, wordmark, tagline, favicon colours |
| `qa_stack.js` | toolbar layout across 13 widths, dialog stacking |
| `qa_fontsel.js` | output font picker: encoding swap, defaults, persistence, mobile rows |
| `qa_fontdocx.js` | font catalog and per-token DOCX font split (no browser needed) |
| `qa_notif.js` | custom notifications, download dialog open/close |
| `qa_notif_m.js` | notification placement at 10 mobile widths |
| `qa_panelhdr.js` | panel header titles and action rows |
| `qa_sample.js` | "Try a sample" button visibility and click behaviour |
| `qa_strip.js` | DOCX filename strip geometry at 4 widths |
| `qa_scroll.js` | shortcuts panel rows and column alignment |
| `qa_round3.js` | miscellaneous round-3 regression checks |
| `qa_check.js` | spot checks |

Diagnostics kept for reference (not part of the suite): `hoverdiag.js`,
`color_coverage.js`, `slop_audit.js`, `btn_gate_harness.js`.

`qa_fluid.js`, `qa_header.js` and `qa_layout.js` predate the current design and
encode some superseded requirements — treat their failures as informational.