# 07 — CEO Implementation Plan

**Role:** CEO Program Manager — LastMinute ITR
**Date:** 10 June 2026
**Classification:** Plan only. **No application code is modified by this document.**
**Synthesizes:** `01_CLIENT_BRIEF.md`, `02_ENGAGEMENT_CHARTER.md`, `03_CURRENT_STATE_GAP.md`, `04_COMPANION_DELIVERY.md`, `05_AI_CA_ARCHITECTURE.md`, `06_ANALYTICS_EVENTS.md`, `docs/FILING_EXPERIENCE_REDESIGN.md`, `docs/PRODUCTION_READINESS_AUDIT.md`, `itr-filing-wireframes/ITR_FORM_MAP.md`.

---

## 1. Executive Summary (CEO View)

### The problem
We can already compute the right number. We cannot yet get an ordinary person to **type that number into the right box on `incometax.gov.in` without freezing**. The government portal has too many fields; people put values in the wrong place, don't know what to skip, lose confidence, and either overpay or run to an agent. Compounding this, two structural risks block scale:

1. **The engine is invisible in production** — `/api/compute` returns `503 ENGINE_UNAVAILABLE` on Vercel (no `python3` on the serverless PATH), so real users silently get estimates. This is the only **Critical** gap (charter §4).
2. **The "we guide, you file" truth arrives too late** — it lives on the post-pay companion screen, not the landing/plans pages, so users pay expecting auto-file and hit "expectation collapse" (gap doc §4).

### The solution
A **companion-first** product: maximize the user's *lawful* refund, then walk them screen-by-screen through the portal with every field labelled, every value copy-ready, and **every skip/deselect spelled out** — never auto-submitting. We sequence the work exactly as the charter thesis demands:

> Make the engine real in production → make "we guide, you file" unmistakable → compress the funnel to the 11-screen import-first path → instrument everything to prove it works.

### What ships in each phase
| Phase | Theme | Headline shipment |
|-------|-------|-------------------|
| **A — Make the engine real** | WS1 critical fix | `/api/compute` returns real numbers in a deployed env; no silent estimate fallback; CI/deploy unblocked |
| **B — Positioning the truth forward** | WS2 + WS4 | "We guide, you file" on landing + plans; "Pay & unlock your portal guide"; companion reframed as the hero payoff with post-pay celebration + portal deep link |
| **C — Companion depth + funnel compression** | WS2 + WS3 | Complete skip/deselect footprint for ITR-1 (then ITR-4/3); expandable "Learn more" depth; 20→11 screen import-first path |
| **D — Instrument, validate, deploy** | WS5 + WS4 | PostHog events firing (doc 06); field-error-rate dashboard; lint/CI/e2e green; Vercel preview public 200s; go/no-go |

**Guardrails (non-negotiable, from brief §4):** no fake metrics, no ERI/auto-file until legal clearance, no guaranteed-refund claims, no aggressive fabrication, no replacing the portal.

---

## 2. Phased Roadmap (A → D)

Phases map to the charter's gates: **A clears the only Critical blocker (WS1), B+C are the G2 Build deliverables, D is G3 Validate → G4 Deploy.** Each phase opens only when the prior phase's acceptance criteria are signed.

---

### Phase A — Make the Engine Real in Production
**Owner lane:** WS1 — Engine-in-Production (Client Tax Engine / Deploy, Agent 3)
**Gate:** G1 decision → start of G2
**Why first:** Everything downstream assumes real numbers. A perfect companion bound to a fallback estimate fails the core promise.

**Goals**
- Choose and prove a runtime so `/api/compute` returns real engine output in a deployed environment.
- Remove the silent estimate fallback — when real compute is unavailable, the UI must say so, not pretend.

**Files / features to touch (engineering lanes; not in this agent)**
- `app/api/compute/route.ts` — runtime wiring; `503 ENGINE_UNAVAILABLE` path.
- Runtime decision among: (a) Vercel Python runtime, (b) hosted compute microservice, (c) port L1 to TypeScript (charter §5 P0).
- `engine/orchestrator.py` (`compute_itr`, `build_layer2_handoff`) — the contract being served.
- `lib/engine/` value-binding path that feeds the companion.
- `.github/workflows/engine-tests.yml` — fix `working-directory` from `../itr-filing-wireframes/sources/engine` to in-repo `engine/` (audit §6).

**Acceptance criteria**
- `/api/compute` returns a real `ITRResult` (income heads, regime comparison, deductions, confidence) in a deployed env — verified by HTTP 200 + parity check.
- **No silent fallback:** estimate mode is explicitly labelled (`is_estimate_mode`) and never presented as a filed/real number.
- Engine parity: UI-displayed refund vs engine output within tolerance (feeds M2/M4).
- Engine pytest (450) + integration (47) run in CI from the correct path and pass.

**Escalation trigger:** if the runtime spike cannot prove real compute in a deployed env by end of Sprint 0, runtime becomes the only open Build item and paid-acquisition planning freezes (charter §5).

---

### Phase B — Move the Truth Forward (Positioning the Hero)
**Owner lane:** WS2 — Companion & Positioning (Client UI/UX, Agent 1); **gated by** WS4 — Trust/Compliance (Agent 5) for any public claim.
**Gate:** part of G2 Build.
**Why second:** Trust and positioning are the wedge. Fixing the message is cheap in copy/flow and prevents wasting every future paid click on a confused user (gap doc §6).

**Goals**
- Correct the user's mental model *before* payment: "AI preps it → you file in minutes → we guide every field."
- Reframe the companion from a surprising limitation into the promised payoff.

**Files / features to touch**
- Landing hero — add "We guide, you file" qualifier + one-line "How LastMinute works" model (gap doc §8 moves 1 & 4).
- `/file/checkout/plans`, `/file/checkout/payment` — rename buy moment to "**Pay & unlock your portal guide**" (redesign §21); plan tier copy from redesign §5 ladder.
- `app/file/companion/page.tsx` — keep the existing honest framing; add post-pay celebration (confetti) + "Open incometax.gov.in" deep link, triggered from payment success (redesign §1, gap doc move 3).
- `/file/import/mismatch` — position mismatch center as the pre-pay **trust moat** ("We won't let you pay until critical mismatches are resolved").

**Acceptance criteria**
- "We guide, you file" appears on landing **and** plans (pre-pay), not only post-pay.
- Buy-moment copy reads "Pay & unlock your portal guide" — zero "we file for you" / "pay to file" implications.
- Payment success auto-navigates to companion with celebration + portal deep link.
- WS4 sign-off: no unverified public claim, no guaranteed-refund language (brief §4).

---

### Phase C — Companion Depth + Funnel Compression
**Owner lanes:** WS2 — Companion content (Agent 1) + WS3 — Funnel Compression (Agent 2). MECE boundary: WS3 owns *flow*, WS2 owns *content/positioning*, WS1 owns *field value quality* (charter §2).
**Gate:** part of G2 Build.
**Why third:** This is the differentiator (brief P0). It only pays off once the engine is real (A) and the user expects it (B).

**Goals**
- Make **skip / deselect / select_no** a first-class output for every confusing portal screen (brief §3.3) — the CEO's #1 pain point.
- Compress the default salaried journey from **20 → 11 screens** (charter M5; redesign appendix screen order).
- Add optional depth ("Learn more") for users who want it, without cluttering the happy path (see §4).

**Files / features to touch**
- `data/portal_footprint.json` — complete, ordered footprint per form; ensure every confusing optional field has explicit `skip`/`deselect`/`select_no` guidance (delivery doc; brief §3.1–3.3). Priority order: **ITR-1 → ITR-4 → ITR-3** (brief §5 P0).
- `data/portal_steps.json` — extend rows so negative guidance is present, not just `enter` rows.
- `components/filing/companion/PortalFootprintWizard.tsx` + `PortalGuideTable` — render action badges, "your number" panels, plain-English "why", per-screen warnings.
- `lib/engine/mergeValues.ts` (`mergePortalFootprint`) — bind live values to every field key (no hardcoded demo data, brief §3.4).
- Funnel routing — import-first `?source=form16` (`lib/filing/routes.ts`); merges: income→parsing, tds→mismatch, risk→presubmit, everify→tracker; escape hatches (redesign "screens that can be eliminated").

**Acceptance criteria**
- **Skip/deselect done-ness:** a screen with confusing optional fields is not "done" until its negative guidance exists (brief §3.3). ITR-1 fully meets brief §3 acceptance; ITR-4, ITR-3 follow.
- Self-file test: a non-expert salaried user completes ITR-1 on the portal using only our guide, without opening a second tab (brief §3.5).
- Default salaried path = **11 screens** (M5), import-first, with advanced drawer for deferred screens.
- All copied values are bound to live engine output for the user's return (brief §3.4).

---

### Phase D — Instrument, Validate, Deploy
**Owner lanes:** WS5 — Growth/Instrumentation (Agent 4 SEO + Agent 6 QA/CI); **gated by** WS4 for go/no-go.
**Gate:** G3 Validate → G4 Deploy.
**Why last:** We cannot prove conversion or set targets without baselines, and we must not promote to public traffic until trust/payment vectors are closed.

**Goals**
- Wire and verify the doc-06 PostHog events end-to-end; capture baselines.
- Close the production-readiness blockers and ship a public Vercel preview.

**Files / features to touch**
- `components/filing/companion/PortalFootprintWizard.tsx` — emit all five footprint events (doc 06).
- `app/file/companion/page.tsx` — pass `form`/`screens`; reset wizard `key` on form change.
- `components/AnalyticsProvider.tsx`, `lib/analytics/posthog.ts` — provider wiring; `sanitizeProps()` PII strip.
- `eslint.config.mjs` — fix `nextVitals is not iterable` (audit P0-2); add `typecheck` script; set `eslint.ignoreDuringBuilds: false` once green.
- `e2e/smoke.spec.ts` — fix strict-mode assertion (audit P1-7).
- Vercel Deployment Protection + env vars (see §5).

**Acceptance criteria**
- All four E2E paths green; engine parity within tolerance; payment bypass closed with keys set.
- doc-06 events fire in staging and are verified end-to-end; field-error-rate dashboard live.
- `npm run lint` passes; CI runs lint + typecheck + build + e2e + engine pytest green.
- Vercel preview returns public **200** on mobile + desktop for all §8 routes.
- Go/no-go decision recorded with rollback plan (charter G4).

---

## 3. Agent Roster

McKinsey owns **diagnosis, sequencing, and decision quality**; client lanes own **build and ship** (charter §2). No two lanes share a surface area (MECE).

| Workstream | McKinsey lane (decision) | Client PO lane (build) | Owns (MECE boundary) | Phase |
|-----------|--------------------------|------------------------|----------------------|-------|
| **WS1 — Engine-in-Production** | Runtime decision framework; acceptance criteria; risk sign-off | Tax Engine / Deploy (Agent 3) | `/api/compute` runtime; no-silent-fallback; parser/field-value quality | **A** |
| **WS2 — Companion & Positioning** | Positioning thesis; copy north-star; trust-moat framing | UI/UX + Companion (Agent 1) | "We guide, you file" message; companion content; portal deep-link; footprint copy | **B, C** |
| **WS3 — Funnel Compression** | Screen-elimination MECE map; gate logic; happy-path spec | Funnel (Agent 2) | 20→11 reduction; import-first routing; merges; escape hatches (flow, not field quality) | **C** |
| **WS4 — Trust, Compliance & Payments** | Compliance gate; payment-security acceptance; launch go/no-go | Security/Payments + Compliance (Agent 5) | Social-proof honesty; Razorpay/secrets; server-side access; disclaimers; companion *gating* | **B, D** |
| **WS5 — Growth & Instrumentation** | Metric definitions; baseline + target setting; instrumentation acceptance | SEO (Agent 4) + QA/CI (Agent 6) | PostHog wiring; funnel events; SEO depth; CI/test coverage | **D** |

**Boundary reminders:** parser accuracy = WS1 (not WS3); companion *gating* = WS4, companion *content* = WS2; anything touching real money or a public claim routes through WS4 as a gate.

---

## 4. Content Expansion Spec — Optional "Learn More" / Expandable Depth

**Principle (redesign experience principles):** *Progressive disclosure.* Tax jargon and depth are hidden by default; users who want more can expand. This serves the depth-seeker without breaking the happy path or violating "no fake metrics."

| Surface | Default (collapsed) | Expandable "Learn more" content | Source binding |
|---------|---------------------|----------------------------------|----------------|
| **Companion footprint wizard** (`PortalFootprintWizard.tsx`) | Action badge + "your number" + one-line plain-English why | "Why this field / why skip" long-form; the **gov term** behind a "Show ITD term" toggle; per-screen `warnings[]`; "What happens if I get this wrong" note | `plainEnglishWhy`, `govSection`, `warnings[]` from `portal_footprint.json` |
| **Companion table** (`PortalGuideTable`) | `plainEnglish` row text + copy value | Collapsible `govSection` reference + `proofRequired` checklist per row | `portal_steps.json` fields |
| **Landing** | "We guide, you file" hero + salary-slider regime teaser | Expandable "How LastMinute works" (Prep with AI → You file in minutes → We guide every field); "Why we don't auto-file" (legal clarity, your control, no ERI risk — reframes the constraint as an advantage, gap doc §5.3) | Static copy; teaser uses `regime_compare` estimate, labelled estimate |
| **Plans / checkout** (`/file/checkout/plans`) | One recommended plan highlighted + "Pay & unlock your portal guide" | Per-tier "what's included" expander (DIY / AI Smart / CA Review ladder, redesign §5); "What you'll get after paying" companion preview | Plan ladder copy; **no** guaranteed-refund language (WS4 gate) |
| **Regime compare** (`/file/regime`) | "Use recommended regime" one-tap | "See why" → breakeven deduction math; old vs new plain-English explainer | `regime_compare.py`: `old_tax`, `new_tax`, `recommended_regime`, `breakeven_*` |
| **Deductions** (`/file/deductions`) | 3–5 confirm cards | "Find more lawful savings" → opt-in CA Brain (L2), shown only when old regime wins (AI-CA arch §2) | `recommendations.py` green/non-blocked tips only |
| **Mismatch center** (`/file/import/mismatch`) | Critical / warning / matched summary bar | Per-issue drill-down with plain-English cause + portal fix steps | Mismatch rule catalog |

**Rules for all expandable content:**
- Collapsed by default; expansion is always optional and never required to complete the happy path.
- Gov terminology appears only on toggle or in companion export (redesign north star).
- Every "Learn more" claim is bound to engine output or statutory fact — **no invented stats, no guaranteed amounts** (brief §4).
- Expansion interactions on the companion should emit `companion_field_confusion` with `reason: help` where relevant (doc 06) so depth-seeking is measurable, not assumed.

---

## 5. Deploy Checklist — Vercel Preview

Derived from `PRODUCTION_READINESS_AUDIT.md` §9 and charter G4. **Do not promote to public traffic until all P0 items are green.**

**P0 — blockers**
- [ ] Lift/condition Vercel **Deployment Protection** (preview currently 401) or set a QA bypass token; confirm HTTP **200** on all routes.
- [ ] Fix `npm run lint` (`nextVitals is not iterable` in `eslint.config.mjs`); CI lint job green.
- [ ] Fix `engine-tests.yml` `working-directory` → in-repo `engine/`.
- [ ] `/api/compute` returns real compute in the deployed env (Phase A exit) — no silent estimate.

**Environment variables (Vercel project settings)**
- [ ] `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — live/test keys set (payment bypass closed).
- [ ] `NEXT_PUBLIC_APP_URL` — set to the preview/prod URL.
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` (+ optional `NEXT_PUBLIC_POSTHOG_HOST`) — set so events leave no-op mode (doc 06).
- [ ] Session secret for server-validated companion access (close localStorage-based bypass, charter M6).

**P1 — should fix before launch**
- [ ] Add `"typecheck": "tsc --noEmit"` script; run in CI.
- [ ] Fix `e2e/smoke.spec.ts` strict-mode assertion; add Playwright + engine pytest to CI.
- [ ] Set `eslint.ignoreDuringBuilds: false` once lint passes.
- [ ] Add `/pricing` → `/#pricing` (or `/file/checkout/plans`) redirect; remove dead links.

**Verification gate (post-deploy)**
- [ ] Browser QA on the **public** URL — desktop (1280×800) + mobile (390×844), all audited routes, zero console errors.
- [ ] `/api/compute` 200 + parity check on the live URL.
- [ ] doc-06 PostHog events observed firing from the live preview.
- [ ] Rollback plan documented; go/no-go decision recorded.

---

## 6. Success Metrics (tied to PostHog events from doc 06)

Charter §6 metrics, instrumented via the doc-06 event catalog. **Baselines captured in Sprint 0 (no spend before baselines).**

| # | Metric | Target (by gate) | Doc-06 events / formula | Owner |
|---|--------|------------------|--------------------------|-------|
| **M1** | Time-to-file | ≤ 15 min, salaried ITR-1 (G4) | Median time `form16_upload` → `payment_success` (funnel) | WS3/WS5 |
| **M2** | Field-error rate | < 5% on Form-16-only (G3) | `count(distinct users with ≥1 companion_field_confusion) ÷ count(distinct users with ≥1 companion_footprint_step_viewed)` | WS1 |
| **M3** | Companion step completion | ≥ 60% of paid users reach ≥90% steps (G4) | `companion_wizard_completed ÷ unlocked companion users` | WS2 |
| **M4** | Refund delta vs baseline | Demonstrable positive median delta, shown pre-pay (G2) | Engine-computed delta surfaced pre-pay; corroborated by high `companion_field_copy` on `enter` fields | WS1/WS2 |
| **M5** | Funnel screen count | **11** (G2) | Default salaried path screen count (Phase C exit) | WS3 |
| **M6** | Trust integrity | **Zero** open bypass vectors + zero unsubstantiated claims (G4) | Payment-bypass audit + claim review (WS4 gate) | WS4 |

**Supporting breakdowns (doc 06 §"Field-error rate"):**
- Confusion by action type — `companion_field_confusion` joined to preceding `companion_field_action.action` (segment `skip`/`deselect`/`select_no` confusion — validates the brief §3.3 priority).
- Wrong-field vs help — filter `companion_field_confusion` by `reason`.
- Copy without confusion — users with `companion_field_copy` and no `companion_field_confusion` (engaged correct-path).
- Screen drop-off — funnel on `companion_footprint_step_viewed` by `screenIndex`.

**Leading indicators to watch in Sprint 0 (charter §6):** `/api/compute` 200 rate (predicts M2/M4), import-first entry rate (predicts M1/M5), mismatch-gate drop-off (predicts M3).

**Privacy guardrail (doc 06):** events carry only labels, action types, and screen ids — never PAN/email/phone or field **values**; `sanitizeProps()` strips PII before capture.

---

## 7. Deploy Status (Phase C — 2026-06-10)

Phase C deploy agent shipped a Vercel preview. Full verification details in [08_DEPLOY_LOG.md](./08_DEPLOY_LOG.md).

| Environment | URL | Date | Status |
|-------------|-----|------|--------|
| **Preview** | https://lastminute-26i0e7wbk-nikhil-anand-s-projects12.vercel.app | 2026-06-10 | ✅ Live — smoke tested (`/`, `/file/companion`, `/learn` → 200) |
| Production | — | — | Pending `npx vercel deploy --prod` |

### Pre-deploy verification

| Check | Result |
|-------|--------|
| Lint (`npm run lint`) | ✅ Pass |
| Typecheck (`npm run typecheck`) | ✅ Pass |
| Build (`npm run build`) | ✅ Pass (143 static pages) |
| Unit tests (`npm run test`) | ✅ 39 passed, 1 skipped |
| E2E tests (`npm run test:e2e`) | ✅ 6 passed |

### Deployment record

| Field | Value |
|-------|-------|
| Command | `npx vercel --yes` |
| Deployment ID | `dpl_CCKzFGJ3CFDBQZSniP6dCQjKbK2c` |
| Inspector | https://vercel.com/nikhil-anand-s-projects12/lastminute-itr/CCKzFGJ3CFDBQZSniP6dCQjKbK2c |
| Status | READY |
| Production | Not promoted — pending founder approval |

### Founder commands

```bash
# Preview (repeat)
cd lastminute-itr && npx vercel --yes

# Production promotion
cd lastminute-itr && npx vercel deploy --prod
```

**Remaining checklist items (§5):** `/api/compute` real-engine parity on live URL, PostHog event verification, full route QA on public URL, and go/no-go sign-off are still open for Phase D.

---

*Plan artifact authored by the CEO Program Manager. No application source modified. Implementation is owned by the client engineering lanes per §3; all public claims and money-touching changes gate through WS4.*
