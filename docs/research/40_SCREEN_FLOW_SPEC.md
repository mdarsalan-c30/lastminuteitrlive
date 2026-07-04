# 40 — Screen & Flow Spec (Phase 4, Executed)

> One screen per state of the doc 21 machine. This doc decides what each screen's single job is, what the user sees/touches, and what dies from the current app. Grounding: live audit scores (UI 5/10, UX 4/10 — `docs/UI_REVIEW.md`, `docs/UX_REVIEW.md`), current route inventory under `frontend/app/(app)/file/*`, segments from doc 12.

## 0. The one structural verdict

The current funnel is **10+ decision screens before value** (UX review). The target is **5 felt steps**: *Answer → Upload → Fix → See your number → File it*. The 11 machine states still exist underneath — but EXTRACT auto-advances, CONFIRM only surfaces low-confidence fields, and RISK is a card stack, not a form. The user should never feel the machine.

**Felt-steps budget (hard):** a clean S2 (repeat simple salaried) case touches **≤ 14 interactive decisions** from GATE to COMPUTE. Every new field or question added to the flow must name which decision it replaces.

## 1. Screen-by-state spec

Mobile-first: every layout is specified for 360×780 first; desktop is the adaptation.

### GATE — `/file/start`
- **One job:** decide `supported / unsupported` in under 60 seconds.
- **Layout:** one question per viewport, big tap targets (full-width option cards ≥56px tall), auto-advance on select, progress dots (not a bar — 5–8 questions must *feel* short).
- **Questions (max 8, from the 14 ITR-1 gates, doc 15):** salary? · sold shares/MF/crypto? · own business? · house properties count? · NRI days abroad? · agricultural income? · director/unlisted? · total income > 50L? Compound where possible.
- **Per-question "why we ask"** collapsed link — one sentence (AI CA's only surface here).
- **Success metric:** completion < 60s; drop-off per question instrumented individually.
- **Anti-pattern killed:** the current `onboarding/case-matrix` + `eligibility` + `itr-path` + `profile` **four-screen chain merges into GATE + a 3-field identity step** (PAN, DOB, name) placed *after* the verdict — never ask identity before value is promised.

### BLOCKED — `/file/not-yet`
- **One job:** honest exit that preserves trust and captures the lead.
- **Content:** "We can't file your case correctly yet — and we won't pretend." + what form they actually need (ITR-2/3) + two routes: ITD portal deep link, "talk to a CA" email capture. Tone per doc 42 §5.
- **Never:** a paywall, a chatbot, or a retry-loop. S8 blocked users are next year's S3 users.

### COLLECT — `/case/:id/upload`
- **One job:** get Form 16 in. Everything else is a nudge, not a wall.
- **Layout:** single primary dropzone ("Upload Form 16 — PDF, even password-protected"), then a personalized checklist from GATE answers (AIS and 26AS as "recommended — catches employer mistakes", bank-interest cert conditional).
- **Honest status chips** on every source: `Live` (Form 16, AIS PDF, 26AS PDF, ITR JSON) vs `Soon` (broker imports) — chips come from `LIVE_CONNECTORS` config, never hardcoded copy. This is the P0 "fake Live badges" kill made structural.
- **AIS skip is an explicit attestation** (doc 21 rule 3): a checkbox with consequence copy, recorded, resurfaced at RISK.
- **iOS keyboard trap** (UI review risk): password field for protected PDFs opens in a bottom sheet, not inline under the dropzone.

### EXTRACT — same screen, progressive
- **One job:** show real progress as outcomes, then get out of the way.
- **No parsing theater**: no fake progress bars. Each doc card flips `Reading… → "Form 16 read — salary ₹12,65,000, TDS ₹80,000. 2 fields need your confirmation."`
- **Auto-advance** when all docs settle in < 3s (the current `/import/parsing` screen dies as a standalone route).
- **PARSE_FAILED** renders inline on the doc card: "We couldn't read this PDF — enter 4 numbers manually" → opens manual-entry sheet (creates `manual_entry` evidence, doc 20). Never a dead end, never a fabricated value.

### RECONCILE — `/case/:id/reconcile`
- **One job:** one decision per conflict card. This screen is the product's moat (mismatch-first, doc 13 gap #2).
- **Card anatomy:** plain-language headline ("AIS shows ₹42,000 dividend your Form 16 doesn't") · both sources with amounts + provenance chips · one-tap resolutions: `Add it` / `Keep mine` / `I dispute this` (dispute → recorded + risk-flagged, wording per doc 33 taxonomy).
- **Order:** blocking issues first, then warnings; count in header ("2 must-fix, 3 to review").
- **Empty state is a celebration:** "Everything matches across Form 16, AIS and 26AS ✓" — for S2 this IS the wow moment; don't skip past it silently.
- Replaces `import/mismatch`; the separate `import/bank` and `import/tds` screens **die** (their data arrives via AIS/26AS cards).

### CONFIRM — `/case/:id/review`
- **One job:** confirm only what the machine isn't sure about.
- **Layout:** summary of all facts grouped by income head, high-confidence (≥0.85) fields shown read-only with provenance chip ("From Form 16 Part B"); low-confidence fields highlighted amber and require a tap-to-confirm or edit.
- **"Why is this number here?"** on every fact → provenance popover (evidence doc + page + field). This is the evidence-graph UI (doc 20 invariant: no orphan numbers).
- **Consolidation kill list:** current `income`, `deductions`, `house-property`, `other` become **sections of this one screen** (accordion on mobile), not four routes. Editing any confirmed fact stale-marks downstream compute (doc 21 rule 1).

### COMPUTE — `/case/:id/result`
- **One job:** the aha moment. One number, one verdict, fully sourced.
- **Hero:** refund/payable amount, then the regime verdict card — "New regime saves you ₹18,400" with a two-column ladder (the most shareable output per doc 12 truth #2; add a share/download-image affordance, PII-free).
- **Show math, not mystery:** expandable computation trace — slab lines, 87A rebate line ("Rebate u/s 87A: −₹59,000 because your income is under ₹12L"), cess. Fed by the engine trace contract (doc 22 §3; Finding 4 — this screen is why trace output must land).
- **"Estimate" chip** always visible next to the number + AY badge ("AY 2026-27").
- Kept free (doc 21 rule 4): value before paywall.

### RISK — `/case/:id/check`
- **One job:** convert fear into acknowledged, explained items.
- **Card stack** (not a report): each named validation (doc 31 IDs) as a plain-language card with severity color, "what happens if ignored", and an `I understand` acknowledgement. Blocking items block; warnings need one tap.
- **Belated variant** (post-31-Jul): 234F fee card + loss-carry-forward warning injected mandatorily (doc 21 rule 5).
- Gets its own state and screen — today risk output is a sidebar afterthought.

### ENTITLE — `/case/:id/unlock`
- **One job:** one honest paywall, trigger-transparent.
- **Plan ladder** from `lib/payments/plans.ts` (Basic ₹0 / Starter ₹349 / AI Smart ₹599) — **one price component, one source of truth** (kills the ₹339-vs-₹349 P0). Trigger transparency: "Your equity LTCG activates AI Smart — here's why" as an expander on the recommended card.
- **Paid-value preview:** a real, blurred screenshot of the companion with the user's own refund number visible — preview before paying (UX principle 5).
- **Fail closed:** payments health-check on entry; if degraded, show "payments temporarily unavailable" banner *here and at `/file/start`*, never after work is invested.
- **No AI on this screen** (trust rule, doc 21).

### COMPANION — `/case/:id/companion`
- **One job:** get the user through incometax.gov.in without fear.
- **Split view (desktop) / step cards (mobile):** left = screenshot/description of the current ITD portal screen; right = "your values" panel with copy buttons per field. Progress = portal sections, mirroring `portalSop.ts`.
- **Mismatch capture:** every step has "portal shows something different" → records the delta, offers guidance (feeds doc 33 reconcile).
- **ITR-1 JSON download** lives here (entitled users), with the honest framing: "Upload this file on the portal — offline utility path".
- Exit: "I submitted" + acknowledgement-number field (manual V1, doc 21 acceptance).

### FILED / VERIFIED / LAPSED — `/case/:id/done` (net-new)
- **One job:** close the loop; this is the retention surface that doesn't exist today (doc 21 §4: "the journey ends at export" — biggest structural gap).
- FILED: 30-day e-verify countdown, Aadhaar-OTP/EVC explainers, one reminder opt-in (WhatsApp/email).
- VERIFIED: celebration, refund-timeline expectations ("most refunds land in 2–5 weeks"), next-year reminder, referral moment (S1 delight → S1's friends are next year's cohort).
- LAPSED: urgent but calm re-engagement ("your return will be treated as never filed — verify now, 2 minutes").

## 2. Route kill / merge list (against current app)

| Current | Verdict |
|---|---|
| `onboarding/case-matrix`, `eligibility`, `itr-path`, `profile` | **Merge** → GATE + post-verdict identity step |
| `import/parsing` | **Kill** as route; inline auto-advancing sub-state |
| `import/bank`, `import/tds` | **Kill**; covered by RECONCILE cards |
| `income`, `deductions`, `house-property`, `other` | **Merge** → CONFIRM sections |
| `advisor`, `cabrain`, `comprehensive` | **Kill from V1 nav** (product sprawl, UX review); AI CA lives inside states per doc 05, not as destinations |
| `regime`, `review` | **Merge** → COMPUTE (regime verdict is the result screen, not a prior step) |
| `support` | Keep, reachable from every state footer |
| FloatingGenie overlay | **Kill** as floating widget; becomes the per-state "Ask why" affordance (anti-pattern list, blueprint §4) |

## 3. Segment walkthrough check (doc 21 acceptance, on paper)

- **S1 first-timer:** GATE explains every question; CONFIRM defaults everything from Form 16; COMPUTE explains regime like they're new (they are). No dead ends. ✓
- **S2 repeat:** target < 15 min GATE→COMPUTE; reconcile empty-state celebration is their moment. ✓
- **S3 equity:** GATE catches STCG → honest BLOCKED (V1) with "ITR-2 coming" capture — the boundary victim is told the truth, not mis-filed. ✓
- **S5 two-property:** GATE allows 2 self-occupied (new rule); HP section appears in CONFIRM conditionally. ✓
- **S6 senior/family:** operator mode banner ("Filing for Papa") on every screen; larger type toggle; notifications to operator (doc 21 rule 6). ✓
- **S7 panic/belated:** resumable deep links (`/case/:id/reconcile`) + belated RISK variant. ✓
- S4 (44ADA) and S8: BLOCKED with segment-specific routing copy. ✓

## 4. Acceptance checklist (Phase 4 gate, this doc)

- [ ] Felt-steps count on the S2 happy path ≤ 14 decisions (paper walkthrough)
- [ ] Every screen names exactly one job and one success metric
- [ ] Kill/merge list signed off (it deletes ~9 routes)
- [ ] FILED/VERIFIED screens scoped into V1 (manual ack entry only)
- [ ] Figma flows built for GATE→COMPANION happy path + BLOCKED + PARSE_FAILED before any code
