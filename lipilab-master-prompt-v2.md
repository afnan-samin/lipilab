# LipiLab v2.0 — Master Prompt for Claude Code (Production Edition)

> Supersedes the previous `lipilab-expansion-master-prompt.md` where they conflict. Read alongside `LIPILAB_ARCHITECTURE_PHASE_00.md` (the approved v1.0 architecture baseline) — this document explicitly **amends** several of that document's "Decision:" sections for v2.0, as noted in §0.

---

## 0. Ground Rules & Explicit Amendments to Phase 00

- **Phase 00's "No Backend / No Database / No External API" decisions (Section 5) are superseded for v2.0** — but only partially. v2.0 introduces a backend for: (a) authentication/premium accounts, (b) file/DOCX bulk conversion with quota enforcement, (c) the new AI features (spell check, MCQ serial) from the prior expansion prompt. **The live-typing/textarea conversion mode remains 100% client-side, unchanged, per Phase 00's original NFR-05 privacy guarantee.** Do not route textarea live-mode conversion through the backend — this is a deliberate, hybrid split, not a full migration.
- **Do not treat "hide the engine" as achievable via backend-only.** State this plainly to the user if they push for stronger hiding: since the Bijoy↔Unicode mapping is a deterministic finite character map, a determined party can reconstruct it via systematic API probing regardless of where it runs. Moving it server-side raises the effort bar (no more view-source copy-paste) but is not airtight secrecy — don't oversell this as solved.
- **Reuse the existing modular architecture from Phase 00 (Section 6/7)** — engine/ui/mappings separation, JSDoc typing, no framework, Web Worker for heavy client-side work. New backend code is a new top-level module, not a rewrite of the existing client engine.
- Development repo keeps full comments (matches Phase 00 NFR-06: "inline comments explain *why*, not *what*"). Production build is minified/bundled — this strips comments from what ships publicly, satisfying any "don't look AI-generated" concern without sacrificing maintainability of the source.
- **Do not start implementation immediately.** First produce: (1) confirmation of the hybrid split boundary (which conversions stay client-side vs move server-side), (2) the mapping-table JSON extraction plan (Future_Add item #7 — do this before splitting the engine across client/server, so both sides load the same source of truth instead of maintaining two copies), (3) DB schema for users/premium/quota, (4) folder structure update, (5) open questions. Wait for approval.

---

## 1. Monetization Model — Free Usage + Points/Credits (supersedes flat "Premium tier" concept)

### What stays free, no account needed
- Textarea live conversion — **unchanged, unlimited, 100% client-side** (this is the existing, working product — do not gate or limit it)
- File/DOCX upload conversion — **first 5,000 words free**, enforced **server-side** (client-side-only enforcement is trivially bypassed and must not be relied on). **Open question (see §10):** is this cap per-file, or a cumulative per-account/lifetime allowance? Must be confirmed before building the enforcement logic — the two interpretations require different tracking (stateless per-request check vs. cumulative usage counter).
- Basic output font selection: a small default set (e.g. SutonnyMJ + one alternative for Bangla, Times New Roman + one alternative for English)
- Ads shown (see §4)
- Future_Add items marked **Free** in the triage table (§6): expanded Bijoy font detection, PDF export, unmappable-character detail modal, full state persistence, undo/redo buttons
- Spell Check **Normal** (client-side dictionary check — never costs points, since it never touches the backend)

### What requires an account + costs points
- File/DOCX conversion **beyond** the free word threshold — per-word rate (admin-configurable, §1.3)
- Spell Check **Advanced** (LLM-backed) — per-word rate
- MCQ Serial — per-question rate, with a configured minimum charge per job (so a 3-question upload still costs something reasonable, not effectively free)
- Full output font library, batch multi-file processing, split/diff view — these remain **feature-gates on having an account**, not per-use point costs (doesn't make sense to meter a UI feature like font selection per word)

### 1.1 Wallet & Ledger (correctness-critical — do not skip this design)
- **Never store only a mutable balance number.** Use an **append-only transaction ledger**: every purchase, deduction, refund, or admin adjustment is its own row (`id, user_id, type, amount, balance_after, reference_job_id, created_at`). The user's current balance is either computed from the ledger or cached and reconciled against it — the ledger is the source of truth, so support/disputes ("where did my points go") can always be answered by querying it.
- **Never deduct points for a failed job.** Sequence: (1) estimate cost before starting (word count × rate, or question count × rate), (2) check balance ≥ estimated cost — block with a clear "insufficient points" message if not, before any processing starts, (3) only write the deduction transaction **after** the job completes successfully. If a job fails mid-way (API timeout, crash), no deduction occurs and the user can retry freely.
- **Concurrency safety:** balance check + deduction must happen inside a single DB transaction with row-level locking (or an equivalent atomic operation) to prevent two simultaneous requests from both passing a balance check against a stale balance and over-drawing the account.

### 1.2 Buying Points
- Recommend a **payment aggregator** (SSLCommerz or ShurjoPay) rather than integrating bKash/Nagad/cards separately — one integration covers all major Bangladeshi payment methods, far less engineering effort than direct gateway-by-gateway integration.
- Points sold in packages (e.g. fixed BDT amounts, possibly with bonus points on larger packages) — exact pricing/bundle structure is a business decision, left configurable rather than hardcoded (§1.3).

### 1.3 Admin Panel — Pricing & Wallet Controls
- Admin can configure, without a code deploy: per-word conversion rate (above free threshold), per-word Advanced-spell-check rate, per-MCQ rate + minimum charge per job. Changes apply to new transactions only, never retroactively.
- Admin can view any user's balance + full transaction history (for support).
- Admin can manually credit or adjust a user's balance (support/goodwill cases) — this itself creates a ledger entry (`type: admin_adjustment`), never a silent balance edit.

### Auth
- Simple email/password (or email+OTP) registration/login, per the prior expansion prompt's §6 — carry that section forward unchanged. Account is now required specifically to hold a points balance and purchase history, in addition to its earlier role gating Advanced features.

---

## 2. Hybrid Engine Architecture

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT (browser, unchanged from Phase 00 for this path)  │
│  Textarea input → Web Worker → mapping engine → output    │
│  100% offline-capable, zero network calls, zero account   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  CLIENT → BACKEND (new, for file-based conversion only)    │
│  DOCX upload → extract text (client, existing run-split    │
│  logic) → POST text/word-count to backend                  │
│  → backend: (a) enforce word cap if not logged in,          │
│              (b) run the SAME mapping engine (shared JSON   │
│                  mapping tables, see §3) server-side,       │
│              (c) return converted text                      │
│  → client: rebuild DOCX (existing run-split/rebuild logic,  │
│    unchanged) with converted text + selected output font    │
└─────────────────────────────────────────────────────────┘
```

- The backend's conversion logic and the client's conversion logic must consume **the same mapping data** (§3) so behavior never diverges between the two paths — a bug fixed in one must be fixed in both automatically, not by hand-syncing two copies.
- Word-count/quota check happens **before** the conversion call, server-side, keyed by session/user — never trust a client-reported word count for enforcement.

---

## 3. Mapping Table Extraction (Future_Add #7 — do this first)

- Move `uni2bijoy`, `bijoy2unicode`, conjunct maps, special-case maps out of inline JS into standalone `.json` files (matches Phase 00 Section 6's existing `mappings/` folder concept).
- Both the client engine (loads JSON at startup, as now) and the new backend engine (loads the same JSON files at server startup) import from this single source.
- This directly reduces `index.html` size (stated goal in Future_Add #7) and eliminates the risk of the client and server mapping tables drifting apart over time.

---

## 4. Ads

- **Prioritize Google AdSense** (pending verification) over Adsterra/Monetag — brand fit with Phase 00's own stated target users (government, academic, publishing professionals) matters more than marginal CPM differences.
- If Adsterra/Monetag are used (e.g., while waiting for AdSense approval), **restrict to standard banner placements only** — no popunders, no redirect-based ad formats, no interstitials. These formats actively damage trust with the professional user segment this tool targets.
- Ads must not appear for logged-in Premium users (§1).
- Ad placements must not overlap or interfere with the textarea/output panels or the live-mode experience — preserve the existing UI's usability, ads are peripheral, not intrusive.

---

## 5. Output Font Selection

- New dropdown pair: **Bangla output font** and **English output font**, applied when generating the output DOCX.
- Defaults: **SutonnyMJ** for Bangla, **Times New Roman** for English — matches current behavior exactly, so this is additive, not a breaking change.
- Free tier: default pair + 1–2 alternatives (e.g., add SutonnyOMJ or Akash as a free second choice).
- Premium tier: full bundled font list (ties into Future_Add #8's suggested set — SutonnyMJ, SutonnyOMJ, Akash, Bijoy, Kalpurush, Sutonny — confirm exact licensing for each bundled font file before shipping; some legacy Bijoy-family fonts have unclear redistribution terms and this must be checked, not assumed).
- Implementation: this only affects the `rFonts` XML attribute written during DOCX rebuild (existing run-manipulation code path) — no change to the character-mapping logic itself.

---

## 6. Future_Add_v2.md — Triage (full reasoning)

| Item | Tier | Notes |
|---|---|---|
| 1. Expand `BIJOY_FONT_NAMES` (Akash, Borno, Bijoy, Kalpurush, Sutonny, SutonnyOMJ) | Free | Direct accuracy improvement, low effort, do early |
| 2. Image/table preservation | N/A | Already working as a side-effect of the run-scoped patch function — this is a documentation/marketing item ("Preserve Complex Formatting" badge), not a code change |
| 3. PDF export (jspdf/html2pdf) | Free | Client-side, offline-capable, broad demand |
| 4. Batch DOCX processing → zip | Premium | High value for the Publisher/Journalist segment specifically named in Phase 00's target users — good gating candidate |
| 5. Unmappable character detail modal | Free | Low effort, improves trust/transparency (shows exactly what wasn't converted and why) |
| 6. Full state persistence (localStorage: output, direction, live mode, font size, theme) | Free | Polish, low effort |
| 7. Extract mapping tables to JSON | Infrastructure | Do before the hybrid split (§3), not tier-gated — it's a prerequisite, not a user feature |
| 8. Custom Bijoy/English output font selection | Free (basic) / Premium (full library) | Merged with §5 above — same feature, tiered by font count |
| 9. Undo/Redo buttons | Free | Low priority polish, low effort |
| 10. Split/Diff comparison view | Premium | Best premium differentiator on this list — clear "professional tool" value, justifies gating |

---

## 7. Landing Page — "What This Site Does" Info Box

- New visitors (first load, or always-visible — user's call, default to always-visible in a collapsible panel) see a short info box explaining: what LipiLab does, and a list of available tools/features (Converter, Spell Check, MCQ Serial, and whatever else is live at the time).
- Keep this content in the i18n dictionary (§8 of prior expansion prompt) — it must translate fully between English/Bangla like everything else.
- This is separate from the Pomelli-referenced marketing/landing page design (§ below) — this info box lives inside the app itself, not just the marketing site.

---

## 8. Design Reference (Pomelli Demo)

- Treat `demo_llipilab.zip` (Google Pomelli export) as **visual/brand direction only** — dark theme, olive-green accent (`#c1cd7d` primary, `#13140e` background per the extracted `theme.css` tokens), not as literal reusable component code (it's a bundled, tool-generated webapp export, not a component library).
- Apply this direction to the **main marketing/landing site** styling. Confirm with the user whether the actual converter tool UI (the working app) should also shift to this palette, or keep its current design — these may reasonably differ (marketing site vs. product UI).

---

## 10. Open Questions for the User

1. Confirm the hybrid split (§2) is acceptable — textarea stays client-side/free/unlimited, only file-upload conversion is gated and moved server-side.
2. Bundled font licensing — need confirmation these legacy Bijoy-family font files are legally redistributable before shipping them for download.
3. AdSense application status — has this been submitted/approved yet, or should Adsterra/Monetag be the launch default with AdSense as a later swap-in?
4. Does the info box (§7) show once (dismissible, remembered via localStorage) or persist always? Does the marketing-site palette (§8) apply to the tool UI too, or stay separate?
5. Carry forward all open questions from the prior `lipilab-expansion-master-prompt.md` §11 (LLM provider choice, MCQ sort-command scope — quota numbers are now superseded by the points-pricing decision in §1.3).
6. **Is the 5,000-word free threshold per-file or cumulative per-account?** (§1, flagged as blocking the enforcement design)
7. Points-to-BDT exchange rate and package sizes (§1.2) — needed before payment integration is wired up.
8. Exact per-word / per-question rates for conversion, Advanced spell-check, and MCQ serial (§1.3) — needed before the pricing config is seeded with real values.

---

## 11. Decision Log

*Small updates going forward are appended here with a date, instead of rewriting the whole document. A full section rewrite only happens for major pivots (the way §1 was rewritten from a flat Premium-tier model to the points system below).*

- **v2 → v2.1**: Replaced flat Free/Premium tier gating with a points/credits (pay-as-you-go) model for file conversion, Advanced spell-check, and MCQ serial. Feature-gates (font library, batch processing, split/diff view) remain account-based, not point-metered. Added wallet/ledger design, payment aggregator recommendation, and admin pricing controls (§1, §1.1–§1.3).
