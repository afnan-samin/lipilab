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
- File/DOCX upload conversion — **5,000 words free per conversion action** (confirmed: per-action, not cumulative — see §1.0a for how amounts beyond this are handled)
- Basic output font selection: a small default set (e.g. SutonnyMJ + one alternative for Bangla, Times New Roman + one alternative for English)
- Ads shown (see §4)
- Future_Add items marked **Free** in the triage table (§6): expanded Bijoy font detection, PDF export, unmappable-character detail modal, full state persistence, undo/redo buttons
- Spell Check **Normal** (client-side dictionary check — never costs points, since it never touches the backend)

### 1.0a Handling Conversions Above 5,000 Words — Three Paths
Confirmed model: a single conversion action covers up to 5,000 words free. For documents larger than that, the user is offered three explicit paths (do not force only one):

1. **Free, auto-chunked, cooldown + optional rewarded-ad-to-skip.** The client automatically splits the document into 5,000-word chunks **at sentence/paragraph boundaries** (do not require the user to manually cut the file — this must be system-automated, reusing the existing run/paragraph-aware text extraction, not a raw character-count cut that could split mid-word or mid-sentence). Chunks process sequentially with a progress indicator ("Batch 3/20"). **Important correction from earlier draft:** conversion itself is near-instant, so gating every batch behind a mandatory rewarded ad produces back-to-back ads with virtually no work happening between them (worse than the original timer idea, and looks like abnormal ad-request patterns to ad networks). Instead: after each batch, impose a **cooldown** (e.g. 3–5 minutes) before the next batch auto-starts, free, no ad required. During the cooldown, offer an explicit **"Watch an ad to skip the wait"** button — an opt-in rewarded ad that immediately unlocks the next batch. This preserves user choice (wait for free vs. trade an ad-view for time) instead of forcing an ad per batch regardless of elapsed time, and reads as normal rewarded-ad usage to ad network policy, not ad-farming.
2. **Small one-time fee / points**, deducted per word beyond the free 5,000 (§1.3 for rate) — processes as a single, instant, non-chunked, ad-free job.
3. **Premium account** — unlimited-word conversion, always instant, always ad-free, plus all other premium feature-gates (§ below). This is the intended "path of least friction" — funnel free users toward this over time by making paths 1 and 2 slightly more effortful/costly by comparison, without making them punishing.

### What requires an account + costs points, or a monthly quota
- File/DOCX conversion beyond the free per-action threshold via path 2 above — per-word rate (§1.3)
- Spell Check **Advanced** (LLM-backed) — **monthly free quota for registered (non-premium) accounts** (see §1.0b), then points beyond quota
- MCQ Serial — same pattern: monthly free quota, then points (per-question rate + minimum charge per job) beyond it
- Full output font library, batch multi-file processing, split/diff view — these remain **feature-gates on having a Premium account**, not per-use point costs (doesn't make sense to meter a UI feature like font selection per word)

### 1.0b Why Spell-Check/MCQ Use a Quota Model, Not the Same Ad-Gated Free Path as Conversion
This is a deliberate, cost-driven distinction, not an inconsistency: plain conversion has near-zero marginal server cost (deterministic algorithm, no external API), so an unlimited-but-slower ad-supported free path is financially safe. Spell Check Advanced and MCQ Serial call a paid external LLM API per use — an unlimited "watch ads to use forever" path here has **unbounded cost exposure** if ad revenue per view doesn't reliably cover the LLM cost per call. A **fixed monthly quota** bounds the worst case precisely (quota × per-unit cost = maximum possible monthly cost per free account), which is why quota, not ad-gating, is the right mechanism for these two features specifically. Start the quota conservatively (small default, admin-configurable) and tune upward once real LLM pricing and usage data exist (this depends on the still-open LLM provider decision).

### 1.1 Wallet & Ledger (correctness-critical — do not skip this design)
- **Never store only a mutable balance number.** Use an **append-only transaction ledger**: every purchase, deduction, refund, or admin adjustment is its own row (`id, user_id, type, amount, balance_after, reference_job_id, created_at`). The user's current balance is either computed from the ledger or cached and reconciled against it — the ledger is the source of truth, so support/disputes ("where did my points go") can always be answered by querying it.
- **Never deduct points for a failed job.** Sequence: (1) estimate cost before starting (word count × rate, or question count × rate), (2) check balance ≥ estimated cost — block with a clear "insufficient points" message if not, before any processing starts, (3) only write the deduction transaction **after** the job completes successfully. If a job fails mid-way (API timeout, crash), no deduction occurs and the user can retry freely.
- **Concurrency safety:** balance check + deduction must happen inside a single DB transaction with row-level locking (or an equivalent atomic operation) to prevent two simultaneous requests from both passing a balance check against a stale balance and over-drawing the account.

### 1.2 Buying Points
- Payment aggregator confirmed direction: SSLCommerz or ShurjoPay (exact choice still open, §10) rather than integrating bKash/Nagad/cards separately.
- **Proposed starting exchange rate: 1 BDT = 2,000 points**, with conversion priced at 1 point/word (confirmed by the user). This targets a "small, impulse-buy" fee — converting a full 100,000-word document (95,000 words beyond the free threshold) would cost roughly 47–48 BDT under this rate. Treat this as a starting point to validate against real usage and competitor pricing, not a final number — it's admin-configurable, not hardcoded.
- **Proposed package structure** (bonus points for larger purchases, standard practice to encourage bigger top-ups):

  | Package | Points (incl. bonus) | Effective bonus |
  |---|---|---|
  | 20 BDT | 40,000 | base rate, no bonus |
  | 50 BDT | 110,000 | ~10% |
  | 100 BDT | 240,000 | ~20% |

  These exact figures need a second look once real hosting/payment-gateway fees and competitor pricing are known — flag them as provisional in the admin config, not fixed constants in code.
- **Spell Check Advanced / MCQ Serial must use a separate, higher point-rate than conversion**, because their real per-unit cost (external LLM API billing) is far higher than conversion's near-zero marginal cost. Do not reuse the 1-point/word conversion rate for these features. Correct formula once an LLM provider is chosen: `point-rate (in BDT-equivalent) ≥ LLM API cost per unit + desired margin`. Exact numbers are blocked on the still-open LLM provider/pricing decision (§10).

### 1.3 Admin Panel — Pricing & Wallet Controls
- Admin can configure, without a code deploy: per-word conversion rate (above free threshold), point package sizes/bonuses, per-word Advanced-spell-check rate, per-MCQ rate + minimum charge per job, and the monthly free quota size for Spell Check Advanced / MCQ Serial (§1.0b). Changes apply to new transactions only, never retroactively.
- Admin can view any user's balance + full transaction history (for support).
- Admin can manually credit or adjust a user's balance (support/goodwill cases) — this itself creates a ledger entry (`type: admin_adjustment`), never a silent balance edit.

### 1.4 User Panel — Usage History
- New user-facing history view (separate from the admin-facing transaction view in §1.3, though backed by the same ledger + job records): a table of the user's own past jobs — date, file name, operation type (Convert / Spell Check / MCQ Serial), word or question count processed, points deducted, and status (success/failed — failed jobs show `0 points deducted` per §1.1's no-charge-on-failure rule). This is effectively a per-user filtered view over the ledger (§1.1) joined to job records — no new data model needed beyond what §1.1 already requires, just a scoped query and a UI table.

### Auth
- Simple email/password (or email+OTP) registration/login, per the prior expansion prompt's §6 — carry that section forward unchanged. Account is now required specifically to hold a points balance and purchase/usage history, in addition to its earlier role gating Advanced features.

### 1.5 LLM Provider — Current Testing Setup, Production Caveat
- Development/testing is currently using OpenRouter with `deepseek/deepseek-v4-flash:free` — confirmed to exist on OpenRouter (1M context, tool/reasoning support). Fine for development.
- **Do not architect production pricing or capacity planning around this specific free model.** OpenRouter's `:free` model variants are provider-controlled and are commonly rotated, rate-limited, or discontinued without notice — at least one tracking source indicates this exact model's free availability has already been inconsistent. The backend's model selection must be a **config value, not a hardcoded string**, so swapping to a paid tier (e.g. the standard `deepseek/deepseek-v4-flash`, priced roughly $0.08/M input tokens per current OpenRouter listings, or another provider entirely) requires an admin-config change, not a code change.
- Once a production model/pricing is locked in, revisit §1.2's point-rate formula for Spell Check Advanced/MCQ Serial (currently blocked on this).

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
5. Carry forward remaining open questions from the prior `lipilab-expansion-master-prompt.md` §11: **LLM provider choice** (blocks the Advanced spell-check/MCQ point-rate and monthly-quota-size decisions, §1.0b/§1.2) and **MCQ sort-command scope**.
6. ~~Is the 5,000-word free threshold per-file or cumulative?~~ **Resolved: per conversion action** (§1.0a).
7. Final payment aggregator choice — SSLCommerz vs ShurjoPay (direction confirmed, specific choice still open).
8. Validate the proposed exchange rate and package bonuses (§1.2) against real hosting/payment-gateway fees once known — currently a reasoned starting estimate, not final.
9. Monthly free-quota size for Spell Check Advanced / MCQ Serial (§1.0b) — blocked on LLM provider/cost decision, same as #5.

---

## 11. Decision Log

*Small updates going forward are appended here with a date, instead of rewriting the whole document. A full section rewrite only happens for major pivots.*

- **v2 → v2.1**: Replaced flat Free/Premium tier gating with a points/credits (pay-as-you-go) model for file conversion, Advanced spell-check, and MCQ serial. Feature-gates (font library, batch processing, split/diff view) remain account-based, not point-metered. Added wallet/ledger design, payment aggregator recommendation, and admin pricing controls (§1, §1.1–§1.3).
- **v2.1 → v2.2**: Confirmed 5,000-word free cap is per-conversion-action, not cumulative. Defined three explicit paths for overage (free auto-chunked+rewarded-ads / paid points / premium) instead of forcing manual multi-upload (§1.0a). Established that Spell Check Advanced/MCQ Serial use a monthly free quota rather than the ad-gated path, with cost-based reasoning (§1.0b) — because their marginal cost (external LLM billing) is unbounded-risk under an ads-only free model, unlike conversion. Proposed a concrete starting exchange rate (1 BDT = 2,000 points) and package/bonus structure (§1.2), flagged as provisional. Added user-facing usage history view (§1.4), reusing the ledger from §1.1 — no new data model.
- **v2.2 → v2.3**: Corrected the free-path ad mechanic (§1.0a) — since conversion is near-instant, a mandatory ad per batch produced back-to-back ads with no real work between them. Changed to a cooldown-between-batches model with an optional "watch ad to skip the wait" button, preserving user choice and avoiding ad-network abuse patterns. Recorded current LLM testing setup (OpenRouter, `deepseek/deepseek-v4-flash:free`) and flagged that production must not depend on this specific free model staying free/available (§1.5).
