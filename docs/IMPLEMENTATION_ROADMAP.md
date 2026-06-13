# Implementation Roadmap — LastMinute ITR

**Agent:** 6 — CEO Product Audit (consolidated)  
**Date:** June 2026  
**Status:** **Consolidated — awaiting CEO sign-off**  
**Rule:** ⛔ **No code changes until this roadmap is reviewed and explicitly approved.**

**Doc index:** [`docs/README.md`](./README.md)

---

## Executive Summary

### Unified north star

> **The user should feel "AI is doing the work."**  
> Upload documents once, answer guided questions in plain English, and receive a filing-ready return with a government portal cheat sheet. Tax jargon is hidden by default; gov terminology appears on toggle or in the companion export.

*Source: [`FILING_EXPERIENCE_REDESIGN.md` § Design north star](./FILING_EXPERIENCE_REDESIGN.md#design-north-star)*

### Five CEO conclusions

1. **Conversion is the weakest funnel dimension (4.9 avg)** — Acquire conversion (4.2) and Activate UX (4.5) are the primary leaks; everything downstream is wasted if users never upload Form 16. *[`UI_AUDIT.md` § Funnel score summary](./UI_AUDIT.md#funnel-score-summary)*

2. **Product wedge is differentiated; experience gap is not** — Mismatch-first reconciliation, lawful optimization, and portal companion beat India incumbents on concept, but ClearTax/Quicko win on visual authority and activation velocity. *[`COMPETITOR_ANALYSIS.md` § Executive summary](./COMPETITOR_ANALYSIS.md#executive-summary)*

3. **Halve cognitive load before adding features** — Salaried ITR-1 path must go from 22→13 decisions and 20→11 screens via import-first entry, onboarding merges, and AI auto-complete. *[`UX_IMPROVEMENT_PLAN.md` § Phase 3 Executive summary](./UX_IMPROVEMENT_PLAN.md#executive-summary)*

4. **Unify dual design systems (P0)** — Marketing shadcn and filing slate/teal read as two products; token unification is prerequisite for premium fintech perception. *[`DESIGN_SYSTEM.md` § 15 Implementation priority](./DESIGN_SYSTEM.md#15-implementation-priority)* · *[`UI_AUDIT.md` § Executive summary](./UI_AUDIT.md#executive-summary)*

5. **Earned value before price** — `PaywallValueStack` + `ConfidencePanel` + pay-after-review; block checkout until mismatches are resolved and filing confidence is visible. Never fake OTP, auto-submit, or "maximum refund" hype. *[`TRUST_CONVERSION.md` § 9 Paywall psychology](./TRUST_CONVERSION.md#9-paywall-psychology--value-before--499--899)* · *[`TRUST_CONVERSION.md` § 14 Paywall placement](./TRUST_CONVERSION.md#14-paywall-placement-recommendation)*

---

## Process: Research → Audit → Plan → Implement

All six research agents are complete. This roadmap is the consolidated implementation plan:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Research   │ →  │   Audit     │ →  │    Plan     │ →  │ Implement   │
│  (Agents    │    │  (UI_AUDIT, │    │  (this doc, │    │  (Waves 1–4 │
│   1–6) ✅   │    │   scores) ✅│    │   waves) ✅ │    │  post-OK)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## Phase 0: Current state summary

### Product

LastMinute ITR is a **Next.js 15** salaried-ITR preparation product with:

- **Marketing site:** `/`, `/learn`, `/glossary`, `/reviews`
- **Filing app:** 26 routes under `/file/*` (onboarding → import → workspace → review → pay → companion)
- **Engine:** Python L1 tax compute + portal guide API
- **Payments:** Razorpay (create-order / verify)
- **State:** Zustand draft store (`lib/store/draft.ts`)

### Maturity snapshot

| Area | State | CEO verdict |
|------|-------|-------------|
| Landing & regime hero | Slider + live compute in hero; QuickStart dark mock | **Improved** — still weak trust density |
| Onboarding | 5 screens before import | **P0 drop-off risk** |
| Import / mismatch | Functional UI; mock parser | **Core wedge** — needs hero polish + real data |
| Regime / engine | Strong UX on `/file/regime` | **Keep** — best-in-app screen |
| Companion | PortalGuideTable works; Phase 2 badge | **Differentiator** — under-sold and under-gated |
| Checkout | Razorpay wired; fake submit copy | **Trust risk** — honest MVP copy required |
| Design system | `DESIGN_SYSTEM.md` complete; not fully applied | **Two systems** still visible in production |

### Funnel scores (from `UI_AUDIT.md`)

| Stage | UX | UI | Trust | Conversion |
|-------|----|----|-------|------------|
| Acquire | 6.1 | 6.2 | 5.8 | 4.2 |
| Activate | 4.5 | 5.2 | 5.5 | 4.5 |
| File | 5.8 | 5.3 | 5.9 | 5.4 |
| Pay | 5.0 | 5.0 | 5.2 | 5.0 |
| Companion | 6.0 | 5.5 | 5.0 | 5.0 |
| **Average** | **5.7** | **5.6** | **5.6** | **4.9** |

**CEO priority:** Lift **Activate** and **Acquire conversion** first — everything downstream is wasted if users never upload Form 16.

---

## Phase 1: Competitor & market context

**Document:** [`COMPETITOR_ANALYSIS.md`](./COMPETITOR_ANALYSIS.md) ✅  
**Owner:** Agent 1  
**Status:** Complete

### Key inputs (folded into waves)

- Quicko / ClearTax / TurboTax / H&R Block pattern matrix — [`§ Comparison matrix`](./COMPETITOR_ANALYSIS.md#comparison-matrix)
- Wedge positioning: mismatch center + companion + lawful optimization — [`§ Executive summary`](./COMPETITOR_ANALYSIS.md#executive-summary)
- Pricing anchoring benchmarks (DIY ₹499–899 band) — [`§ 2. Quicko`](./COMPETITOR_ANALYSIS.md#2-quicko--india)
- Import-first vs interview-first entry comparison — [`§ Top 15 patterns to steal`](./COMPETITOR_ANALYSIS.md#top-15-patterns-to-steal-ranked-by-impact-for-lastminute-itr)

### Consolidation checklist

- [x] Merge competitor "steal list" with Wave 1–2 tasks (no duplicate work)
- [x] Resolve conflicts with [`UX_IMPROVEMENT_PLAN.md` §2](./UX_IMPROVEMENT_PLAN.md#2-competitive-patterns-to-steal)
- [x] Confirm salaried ITR-1 happy path matches competitor baselines

---

## Phase 2: UX strategy

**Document:** [`UX_IMPROVEMENT_PLAN.md`](./UX_IMPROVEMENT_PLAN.md) ✅  
**Owner:** Agent 2  
**Status:** Complete — tactical backlog source

### Key decisions documented

1. Asymmetric hero + regime slider (**partially shipped**) — [`§ 5 P0`](./UX_IMPROVEMENT_PLAN.md#p0--landing--entry-flow)
2. Salaried fast path: Form 16 → parsing → mismatch → regime → review → pay → companion — [`§ 3 Salaried ITR-1 happy path`](./UX_IMPROVEMENT_PLAN.md#salaried-itr-1-happy-path-target-15-min-to-companion-ready)
3. Merge `case-matrix` + `itr-path` → single Eligibility screen — [`§ Screen merge table`](./UX_IMPROVEMENT_PLAN.md#screen-merge--remove-table-before--after)
4. Pay after value (review before plans) — [`§ Proposed flow`](./UX_IMPROVEMENT_PLAN.md#proposed-simplified-flow-salaried-itr-1-13-decisions)
5. Mismatch + filing-ready % on landing and post-import — [`§ Phase 3 summary`](./UX_IMPROVEMENT_PLAN.md#return-summary-phase-3)

**Phase 3 flow reduction:** 22→13 decisions · 20→11 screens — [`§ Phase 3 Executive summary`](./UX_IMPROVEMENT_PLAN.md#executive-summary)

### Consolidation checklist

- [x] Map P0 items 1–10 to Wave 1 with file paths (see §Wave 1)
- [x] Mark shipped vs gap per [`§ 1 Gap Analysis`](./UX_IMPROVEMENT_PLAN.md#1-gap-analysis--plan-vs-shipped)
- [x] Pick headline A/B candidate from [`§ 6`](./UX_IMPROVEMENT_PLAN.md#6-copy--microcopy--headline-alternatives) for Wave 1 copy test

---

## Phase 3: Design system unification

**Document:** [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) ✅  
**Owner:** Agent 3  
**Status:** Complete — tokens defined, P0 enforcement pending in code

### Implementation gates

- [ ] Replace hardcoded `#f8f9fb` in `FilingLayout.tsx` with `--background` — [`§ 3 Surfaces`](./DESIGN_SYSTEM.md#3-color-system)
- [ ] Unify `components/filing/ui.tsx` Button/Card with shadcn or `components/brand/*` — [`§ 15 P0`](./DESIGN_SYSTEM.md#15-implementation-priority)
- [ ] Enforce Plus Jakarta on marketing + filing titles — [`§ 2 Typography`](./DESIGN_SYSTEM.md#2-typography)
- [ ] Ban teal connector CTAs → `--brand-blue` — [`§ 13 Anti-patterns`](./DESIGN_SYSTEM.md#13-anti-patterns)
- [ ] Add `--success` / `--warning` CSS tokens (Banner, RiskBadge) — [`§ 3 Semantic`](./DESIGN_SYSTEM.md#semantic)

### Consolidation checklist

- [x] Parent confirms font loading in `app/layout.tsx` matches spec — [`§ 2 Font stack`](./DESIGN_SYSTEM.md#font-stack)
- [ ] Storybook or visual regression — optional Wave 4

---

## Phase 4: Filing experience redesign

**Document:** [`FILING_EXPERIENCE_REDESIGN.md`](./FILING_EXPERIENCE_REDESIGN.md) ✅  
**Owner:** Agent 4  
**Status:** Complete — AI-first, 26-route spec

### Key inputs

- Screen-by-screen wireflow for salaried happy path (<15 min to companion-ready) — [`§ Macro flow`](./FILING_EXPERIENCE_REDESIGN.md#macro-flow--current-vs-proposed)
- Onboarding merge spec (signin + profile deferral rules) — [`§ Screens eliminated`](./FILING_EXPERIENCE_REDESIGN.md#screens-that-can-be-eliminated)
- Mismatch center layout (hero, filing-ready ring) — [`§ 4 Mismatch center`](./FILING_EXPERIENCE_REDESIGN.md#4-mismatch-center-as-trust-moat)
- Income nav rail driven by draft reconciliation state — [`§ layout shell`](./FILING_EXPERIENCE_REDESIGN.md#appfilelayouttsx-shell)
- CA Brain insertion point (post-regime vs optional branch) — [`§ 17 CA Brain`](./FILING_EXPERIENCE_REDESIGN.md#17-appfilecabrain--ca-brain-l2-rag)

**Proposed happy path:** 11 screens (import-first, AI-first) — [`§ Proposed salaried ITR-1`](./FILING_EXPERIENCE_REDESIGN.md#proposed--salaried-itr-1-happy-path-11-screens)

### Consolidation checklist

- [x] Align route changes with `lib/filing/routes.ts` guards
- [x] Confirm macro stepper step numbers after merges — [`§ 10 Progress indicators`](./DESIGN_SYSTEM.md#10-progress-indicators)
- [x] Mobile interview pattern (one question per screen) for Activate only — [`UX_IMPROVEMENT_PLAN § Mobile-first`](./UX_IMPROVEMENT_PLAN.md#mobile-first-flow-notes)

---

## Phase 5: Trust & conversion

**Document:** [`TRUST_CONVERSION.md`](./TRUST_CONVERSION.md) ✅  
**Owner:** Agent 5  
**Status:** Complete

### Key inputs

- Trust stack: filer count, security badges, DPDP copy, no-auto-submit — [`§ 3 Security badges`](./TRUST_CONVERSION.md#3-security-badges-securitystrip) · [`§ 8 Social proof`](./TRUST_CONVERSION.md#8-social-proof-placements-across-funnel)
- Paywall rules: what unlocks at each plan tier — [`§ 9 Paywall psychology`](./TRUST_CONVERSION.md#9-paywall-psychology--value-before--499--899)
- Honest MVP messaging (no fake submit / OTP) — [`§ 1 Current state`](./TRUST_CONVERSION.md#1-current-state-baseline)
- Social proof upgrade (reviews grid, logos, aggregate rating) — [`§ 2 Reviews redesign`](./TRUST_CONVERSION.md#2-reviews-section-redesign-spec)
- Conversion events & analytics spec — [`§ 12 Conversion funnel metrics`](./TRUST_CONVERSION.md#12-conversion-funnel-metrics-to-track)

**Core components:** `PaywallValueStack`, `ConfidencePanel`, pay-after-review — [`§ 11 Component specs`](./TRUST_CONVERSION.md#11-component-specifications)

### Consolidation checklist

- [x] Replace fake auth/submit/ACK copy per trust doc
- [x] Wire companion export unlock to `paymentVerified` flag — [`§ 5 Payment unlocks companion`](./FILING_EXPERIENCE_REDESIGN.md#5-payment-unlocks-companion-export)
- [x] Landing + checkout trust parity (same claims, same badges)

---

## Phase 6: UI audit

**Document:** [`UI_AUDIT.md`](./UI_AUDIT.md) ✅  
**Owner:** Agent 6  
**Status:** Complete

### Artifacts

- Per-page audit (31 routes + 5 APIs) — [`§ Acquire through Companion`](./UI_AUDIT.md#acquire--marketing--education)
- Funnel scores (Acquire → Companion) — [`§ Funnel score summary`](./UI_AUDIT.md#funnel-score-summary)
- Cross-cutting P0/P1/P2 issues — [`§ Cross-cutting issues`](./UI_AUDIT.md#cross-cutting-issues-all-pages)
- CEO priority heatmap — [`§ Priority heatmap`](./UI_AUDIT.md#priority-heatmap-ceo-view)

### Consolidation checklist

- [x] Parent reconciles scores with Agents 4–5 qualitative findings
- [x] Final P0 list capped at 10 for Wave 1 (below)
- [ ] Sign-off meeting: CEO + eng lead

---

## Phase 7: Implementation waves

> **⛔ No implementation until:**  
> 1) All six agent docs present ✅  
> 2) Parent consolidation complete ✅  
> 3) Written approval on this roadmap

---

### Wave 1 (1 week) — P0 trust + landing + entry

**Goal:** Fix trust breaks and cut activate drop-off. Lift Acquire conversion 4.2 → 5.5+.

| # | Task | Files to touch | Doc reference |
|---|------|----------------|---------------|
| 1 | **Social proof + trust strip** — filer count, security badges, DPDP line | `components/marketing/TrustRow.tsx`, new `components/marketing/SocialProofBar.tsx`, `app/page.tsx` | [`TRUST_CONVERSION § 8`](./TRUST_CONVERSION.md#8-social-proof-placements-across-funnel) · [`§ 11.1 TrustBar`](./TRUST_CONVERSION.md#111-trustbar) · [`COMPETITOR § Top 5 steals`](./COMPETITOR_ANALYSIS.md#top-5-steals-executive-pick) |
| 2 | **Dual landing CTA** — primary "Upload Form 16", secondary name field | `components/marketing/HeroNameForm.tsx`, `app/page.tsx` | [`UX_IMPROVEMENT_PLAN § P0 #1–2`](./UX_IMPROVEMENT_PLAN.md#p0--landing--entry-flow) · [`FILING_EXPERIENCE § 2 Import-first`](./FILING_EXPERIENCE_REDESIGN.md#2-import-first-salaried-path) |
| 3 | **Salaried fast path** — `?source=form16` skips welcome + onboarding → documents | `app/file/page.tsx`, `HeroNameForm.tsx`, `lib/store/draft.ts`, `lib/filing/routes.ts` | [`UX_IMPROVEMENT_PLAN § Proposed flow`](./UX_IMPROVEMENT_PLAN.md#proposed-simplified-flow-salaried-itr-1-13-decisions) · [`UI_AUDIT § Activate`](./UI_AUDIT.md#activate--entry--onboarding) |
| 4 | **Remove double header** — filing layout defers chrome to FilingLayout | `app/file/layout.tsx`, `components/filing/FilingLayout.tsx` | [`UI_AUDIT § Cross-cutting`](./UI_AUDIT.md#cross-cutting-issues-all-pages) · [`DESIGN_SYSTEM § 14 Inventory`](./DESIGN_SYSTEM.md#14-component-inventory--token--file-mapping) |
| 5 | **Honest auth copy** — defer PAN/OTP; remove fake "Aadhaar linked" until real | `app/file/onboarding/signin/page.tsx` | [`TRUST_CONVERSION § 1`](./TRUST_CONVERSION.md#1-current-state-baseline) · [`UI_AUDIT § signin`](./UI_AUDIT.md#fileonboardingsignin) |
| 6 | **Connector restyle** — brand blue CTAs, optional logos, collapse Phase 2 connectors | `components/filing/connectors/ConnectorGrid.tsx`, `app/file/import/documents/page.tsx` | [`DESIGN_SYSTEM § 5 Buttons`](./DESIGN_SYSTEM.md#5-button-hierarchy) · [`§ 13 Anti-patterns`](./DESIGN_SYSTEM.md#13-anti-patterns) |
| 7 | **Design tokens pass (minimal)** — background, buttons, ban teal | `app/globals.css`, `components/filing/ui.tsx` | [`DESIGN_SYSTEM § 15 P0`](./DESIGN_SYSTEM.md#15-implementation-priority) · [`§ 3 Color`](./DESIGN_SYSTEM.md#3-color-system) |
| 8 | **Marketing header** — product nav hints (File / Import / Pricing) | `components/marketing/SiteHeader.tsx` | [`UX_IMPROVEMENT_PLAN § P0`](./UX_IMPROVEMENT_PLAN.md#p0--landing--entry-flow) · [`UI_AUDIT § Landing`](./UI_AUDIT.md#--landing) |
| 9 | **Reviews grid on landing** — replace or supplement carousel | `components/marketing/ReviewsCarousel.tsx`, `app/page.tsx` | [`TRUST_CONVERSION § 2.1`](./TRUST_CONVERSION.md#21-landing-reviewscarousel--reviewssection) · [`§ 13 Top 8 trust components`](./TRUST_CONVERSION.md#13-top-8-trust-components-to-build-priority-order) |
| 10 | **Glossary search** — enable client-side filter | `app/glossary/page.tsx` | [`UI_AUDIT § Glossary`](./UI_AUDIT.md#glossary--term-index) · [`UX_IMPROVEMENT_PLAN § P2`](./UX_IMPROVEMENT_PLAN.md#p2--inner-screens) |

**Wave 1 exit criteria**

- [ ] Landing → Form 16 upload in ≤2 clicks for salaried user
- [ ] No fake verification badges on signin
- [ ] Single header in all `/file/*` routes
- [ ] Trust strip visible above fold on `/`

---

### Wave 2 (1 week) — Filing shell + flow merges

**Goal:** Activate UX 4.5 → 6.0. File UI 5.3 → 6.0.

| # | Task | Files to touch | Doc reference |
|---|------|----------------|---------------|
| 1 | **Merge case-matrix + itr-path** → Eligibility screen | `app/file/onboarding/case-matrix/page.tsx`, `app/file/onboarding/itr-path/page.tsx`, new `app/file/onboarding/eligibility/page.tsx` | [`UX_IMPROVEMENT_PLAN § Screen merge table`](./UX_IMPROVEMENT_PLAN.md#screen-merge--remove-table-before--after) · [`FILING_EXPERIENCE § 4–5`](./FILING_EXPERIENCE_REDESIGN.md#4-appfileonboardingcase-matrix--case-matrix) |
| 2 | **Mismatch hero layout** — filing-ready %, summary header | `app/file/import/mismatch/page.tsx`, new `components/filing/MismatchCenter.tsx` | [`FILING_EXPERIENCE § 4 Mismatch center`](./FILING_EXPERIENCE_REDESIGN.md#4-mismatch-center-as-trust-moat) · [`DESIGN_SYSTEM § Filing-ready ring`](./DESIGN_SYSTEM.md#filing-ready-ring-new-spec) |
| 3 | **Nav rail from draft state** — reconciliation dots | `components/filing/FilingLayout.tsx`, `lib/store/draft.ts` | [`FILING_EXPERIENCE § layout shell`](./FILING_EXPERIENCE_REDESIGN.md#appfilelayouttsx-shell) · [`UX_IMPROVEMENT_PLAN § P1`](./UX_IMPROVEMENT_PLAN.md#p1--filing-shell) |
| 4 | **Parsing review table** — field confidence, inline edit | `app/file/import/parsing/page.tsx` | [`FILING_EXPERIENCE § 7 Parsing`](./FILING_EXPERIENCE_REDESIGN.md#7-appfileimportparsing--parsing-review) · [`DESIGN_SYSTEM § 11 Proof badge`](./DESIGN_SYSTEM.md#proof-badge) |
| 5 | **Skip house-property** for ITR-1 default path | `lib/filing/routes.ts`, `app/file/income/page.tsx` | [`FILING_EXPERIENCE § Screens eliminated`](./FILING_EXPERIENCE_REDESIGN.md#screens-that-can-be-eliminated) · [`UX_IMPROVEMENT_PLAN § Smart defaults`](./UX_IMPROVEMENT_PLAN.md#smart-defaults-by-persona-path) |
| 6 | **Regime → review routing** — remove forced cabrain detour | `app/file/regime/page.tsx` | [`FILING_EXPERIENCE § 3 Regime compare`](./FILING_EXPERIENCE_REDESIGN.md#3-regime-compare-moment) · [`UX_IMPROVEMENT_PLAN § Key merges`](./UX_IMPROVEMENT_PLAN.md#key-merges-welcome--sign-in-deferred--case-matrix--itr-path--profile--eligibility-parsing--bank--confirm-import-income--other--income-snapshot-deductions--regime--tax-outcome-plans--default--pay--unlock-presubmit-e-verify--everify--tracker) |
| 7 | **Macro stepper mobile** — verify compact dots + aria | `components/filing/MacroStepper.tsx` | [`DESIGN_SYSTEM § 10 Macro stepper`](./DESIGN_SYSTEM.md#macro-stepper-macrosteppertsx) |
| 8 | **PlainEnglish → glossary links** | `components/filing/PlainEnglishField.tsx` | [`DESIGN_SYSTEM § 11 PlainEnglish tooltip`](./DESIGN_SYSTEM.md#plainenglish-tooltip) · [`FILING_EXPERIENCE § Gov terminology map`](./FILING_EXPERIENCE_REDESIGN.md#gov-terminology--plain-english-master-map) |
| 9 | **Demo parser honesty banner** | `components/filing/connectors/ConnectorGrid.tsx`, `app/api/documents/upload/route.ts` | [`TRUST_CONVERSION § 1`](./TRUST_CONVERSION.md#1-current-state-baseline) · [`UI_AUDIT § documents/upload`](./UI_AUDIT.md#post-apidocumentsupload) |
| 10 | **Remove debug leaks** — Case ID, rule_id in UI | `app/file/onboarding/itr-path/page.tsx`, `app/file/import/mismatch/[id]/page.tsx` | [`UI_AUDIT § Cross-cutting`](./UI_AUDIT.md#cross-cutting-issues-all-pages) · [`UI_AUDIT § itr-path`](./UI_AUDIT.md#fileonboardingitr-path) |

**Wave 2 exit criteria**

- [ ] Salaried happy path ≤8 screens to regime
- [ ] Mismatch page shows filing-ready %
- [ ] No internal IDs visible to users

---

### Wave 3 (1 week) — Companion + paywall + confidence

**Goal:** Companion trust 5.0 → 7.0. Pay conversion 5.0 → 6.5.

| # | Task | Files to touch | Doc reference |
|---|------|----------------|---------------|
| 1 | **Remove "Phase 2" badge** from companion | `app/file/companion/page.tsx` | [`UI_AUDIT § companion`](./UI_AUDIT.md#filecompanion) · [`FILING_EXPERIENCE § 1 Companion hero`](./FILING_EXPERIENCE_REDESIGN.md#1-companion-mode-as-hero) |
| 2 | **Pay-gate companion export** — unlock after Razorpay verify | `app/file/companion/page.tsx`, `lib/store/draft.ts`, `components/filing/companion/PortalGuideTable.tsx` | [`FILING_EXPERIENCE § 5 Payment unlocks`](./FILING_EXPERIENCE_REDESIGN.md#5-payment-unlocks-companion-export) · [`TRUST_CONVERSION § 14`](./TRUST_CONVERSION.md#14-paywall-placement-recommendation) |
| 3 | **Confidence panel on presubmit** | `app/file/review/presubmit/page.tsx`, new `components/filing/ConfidencePanel.tsx` | [`TRUST_CONVERSION § 6`](./TRUST_CONVERSION.md#6-filing-confidence-score-ui-confidencepanel) · [`§ 11.2 ConfidencePanel`](./TRUST_CONVERSION.md#112-confidencepanel) |
| 4 | **Honest checkout copy** — no "return submitted" in MVP | `app/file/checkout/everify/page.tsx`, `app/file/checkout/tracker/page.tsx`, `app/file/support/page.tsx` | [`TRUST_CONVERSION § 1`](./TRUST_CONVERSION.md#1-current-state-baseline) · [`UI_AUDIT § Pay`](./UI_AUDIT.md#pay--checkout--post-submit) |
| 5 | **Pay-after-value guard** — block `/file/checkout/plans` until presubmit green | `lib/filing/routes.ts`, middleware or layout guard | [`TRUST_CONVERSION § 14 Recommended flow`](./TRUST_CONVERSION.md#recommended-flow-enforce-in-nav-guards) · [`UX_IMPROVEMENT_PLAN § Pay after value`](./UX_IMPROVEMENT_PLAN.md#proposed-simplified-flow-salaried-itr-1-13-decisions) |
| 6 | **Plan recommendation from engine** | `app/file/checkout/plans/page.tsx`, `lib/filing/constants.ts` | [`TRUST_CONVERSION § 9 Tier mapping`](./TRUST_CONVERSION.md#tier-value-mapping-libpaymentsaccessts) · [`COMPETITOR § Pricing`](./COMPETITOR_ANALYSIS.md#2-quicko--india) |
| 7 | **Companion step alignment** — macro step "File & Track" | `app/file/companion/page.tsx`, `lib/filing/constants.ts` | [`FILING_EXPERIENCE § 1 Companion hero`](./FILING_EXPERIENCE_REDESIGN.md#1-companion-mode-as-hero) · [`DESIGN_SYSTEM § 10`](./DESIGN_SYSTEM.md#10-progress-indicators) |
| 8 | **Portal guide error retry UI** | `app/file/companion/page.tsx`, `lib/engine/client.ts` | [`FILING_EXPERIENCE § 25 Companion`](./FILING_EXPERIENCE_REDESIGN.md#25-appfilecompanion--portal-companion) · [`UI_AUDIT § companion`](./UI_AUDIT.md#filecompanion) |
| 9 | **Risk review live scores** — bind to compute API | `app/file/review/risk/page.tsx` | [`TRUST_CONVERSION § 6–7`](./TRUST_CONVERSION.md#6-filing-confidence-score-ui-confidencepanel) · [`FILING_EXPERIENCE § Engine matrix`](./FILING_EXPERIENCE_REDESIGN.md#engine--l2-automation-matrix) |
| 10 | **Pricing parity** — landing + checkout use same card component | `components/marketing/PricingSection.tsx`, `app/file/checkout/plans/page.tsx` | [`TRUST_CONVERSION § 11.5 PaywallValueStack`](./TRUST_CONVERSION.md#115-paywallvaluestack) · [`§ 9 Anchoring`](./TRUST_CONVERSION.md#anchoring) |

**Wave 3 exit criteria**

- [ ] Paid user can export companion PDF
- [ ] Checkout never claims gov submission in MVP
- [ ] Plans unreachable before presubmit checklist

---

### Wave 4 — Polish, senior mode, production promote

**Goal:** UI 5.6 → 7.0+. Production-ready promote.

| Area | Tasks | Files (indicative) | Doc reference |
|------|-------|-------------------|---------------|
| **Visual polish** | Hero mesh reduction, display font enforcement, motion stagger | `app/globals.css`, `app/page.tsx` | [`DESIGN_SYSTEM § 12 Motion`](./DESIGN_SYSTEM.md#12-motion-guidelines) · [`UX_IMPROVEMENT_PLAN § 4 Visual`](./UX_IMPROVEMENT_PLAN.md#4-visual-design-system-anticollege-site) |
| **Senior mode** | 80TTB prompts, larger type toggle, simplified nav | `components/filing/FilingLayout.tsx`, `app/file/other/page.tsx` | [`UX_IMPROVEMENT_PLAN § Senior-citizen`](./UX_IMPROVEMENT_PLAN.md#senior-citizen-friendly-simplifications) · [`TRUST_CONVERSION § 10`](./TRUST_CONVERSION.md#10-senior-citizen-trust) |
| **CA Brain** | Real RAG integration or hide behind expert tier | `app/file/cabrain/page.tsx` | [`FILING_EXPERIENCE § 17`](./FILING_EXPERIENCE_REDESIGN.md#17-appfilecabrain--ca-brain-l2-rag) · [`§ Top 5 AI wins`](./FILING_EXPERIENCE_REDESIGN.md#top-5-ai-automation-wins) |
| **Engine** | Real Form 16 parser; remove mock upload fields | `app/api/documents/upload/route.ts`, `engine/` | [`FILING_EXPERIENCE § Engine matrix`](./FILING_EXPERIENCE_REDESIGN.md#engine--l2-automation-matrix) · [`§ 1 Form 16 auto-fill`](./FILING_EXPERIENCE_REDESIGN.md#1-form-16--ais-auto-fill-import-intelligence) |
| **ERI / OAuth** | ITD connect when ready — replace "Phase 2" stubs | `ConnectorGrid.tsx`, new `app/api/eri/` | [`COMPETITOR § Import-first`](./COMPETITOR_ANALYSIS.md#top-15-patterns-to-steal-ranked-by-impact-for-lastminute-itr) · [`FILING_EXPERIENCE § Deferred`](./FILING_EXPERIENCE_REDESIGN.md#deferred-off-path-available-via-advanced-signin-profile-depth-house-property-other-income-ca-brain-tds-matcher-income-workspace-e-verify-standalone-support) |
| **Analytics** | Funnel events per success metrics below | new `lib/analytics/` | [`TRUST_CONVERSION § 12`](./TRUST_CONVERSION.md#12-conversion-funnel-metrics-to-track) |
| **Production** | `next build` + Vercel promote | CI, env vars, Razorpay live keys | Risk register R6 below |
| **QA** | Playwright smoke: landing → import → regime → pay → companion | `e2e/` (new) | [`UI_AUDIT § Funnel scores`](./UI_AUDIT.md#funnel-score-summary) |

**Wave 4 exit criteria**

- [ ] Lighthouse performance ≥85 mobile on `/`
- [ ] E2E happy path green in CI
- [ ] No P0 items open from [`UI_AUDIT.md`](./UI_AUDIT.md)

---

## Success metrics

| Metric | Baseline (audit) | Wave 1 target | Wave 3 target | Measurement |
|--------|------------------|---------------|---------------|-------------|
| **Landing → import start** | ~15% est. | 25% | 35% | Event: `import_started` / `landing_view` |
| **Activate completion** (import screen reached) | ~40% est. | 55% | 70% | `documents_view` / `signin_start` |
| **Pay conversion** (presubmit → payment success) | ~20% est. | 25% | 35% | Razorpay verify / `presubmit_view` |
| **Time-to-companion** (first visit → companion with guide loaded) | ~25 min est. | 18 min | 12 min | Session timestamps |
| **Filing-ready % at presubmit** | N/A (hardcoded) | Live compute | ≥80% median | Engine `completeness_score` |
| **NPS proxy** (reviews feedback rating avg) | N/A | ≥4.2 | ≥4.5 | `/api/feedback` rolling 30d |
| **Trust score (qualitative)** | 5.6 | 6.2 | 7.0 | Repeat UI audit |

*Event spec: [`TRUST_CONVERSION § 12`](./TRUST_CONVERSION.md#12-conversion-funnel-metrics-to-track)*

---

## Risk register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | **Parallel agent docs conflict** on onboarding merge | Medium | High | Consolidated in Phases 1–6 ✅ |
| R2 | **Fake auth/submit copy** causes social media trust hit | High | Critical | Wave 1 + 3 honest copy; [`TRUST_CONVERSION § 1`](./TRUST_CONVERSION.md#1-current-state-baseline) |
| R3 | **Mock parser** uploaded real Form 16 → wrong numbers | High | Critical | Wave 2 demo banner; Wave 4 real parser |
| R4 | **Design system scope creep** delays Wave 1 | Medium | Medium | Wave 1 = minimal tokens only; full DS Wave 4 |
| R5 | **Companion API failure** at pay moment | Medium | High | Wave 3 retry UI + offline PDF cache |
| R6 | **Razorpay test keys** in production | Low | Critical | Env checklist in Wave 4 promote |
| R7 | **Route merge breaks deep links** | Medium | Medium | Redirect map in `next.config` for old onboarding URLs |
| R8 | **Engine latency** blocks regime screen | Medium | Medium | Skeleton + demo fallback labeled |
| R9 | **Implementing before approval** | Medium | High | **This document's explicit gate** |
| R10 | **Six-agent doc drift** — stale Wave priorities | Low | Medium | This doc is canonical; index at [`README.md`](./README.md) |

---

## Parent agent: consolidation checklist

All six agents complete. Remaining gates:

1. [x] All docs present:
   - [`COMPETITOR_ANALYSIS.md`](./COMPETITOR_ANALYSIS.md) ✅
   - [`UX_IMPROVEMENT_PLAN.md`](./UX_IMPROVEMENT_PLAN.md) ✅
   - [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) ✅
   - [`FILING_EXPERIENCE_REDESIGN.md`](./FILING_EXPERIENCE_REDESIGN.md) ✅
   - [`TRUST_CONVERSION.md`](./TRUST_CONVERSION.md) ✅
   - [`UI_AUDIT.md`](./UI_AUDIT.md) ✅
2. [x] Resolve duplicate recommendations (dedupe Wave tasks)
3. [x] Finalize **Wave 1 scope** — max 10 items, 1 week cap
4. [ ] Assign owners per wave task
5. [ ] Schedule CEO sign-off (explicit approval comment / issue)
6. [ ] Create tracking issue or project board with wave labels
7. [x] Archive superseded plans; link this doc as canonical implementation path
8. [ ] Only then create implementation branch

---

## Wave 1 priority list (max 10) — CEO summary

For immediate approval discussion:

1. **Social proof + trust strip** on landing (counts, badges, DPDP)
2. **Dual CTA: Upload Form 16** + name hook
3. **Salaried fast path** — skip 5-screen onboarding to import
4. **Remove double header** in filing shell
5. **Honest signin** — defer fake OTP / Aadhaar badge
6. **Connector restyle** — blue CTAs, collapse coming-soon grid
7. **Minimal design token pass** — unify background + buttons
8. **Product-forward marketing nav**
9. **Landing reviews grid** (supplement carousel)
10. **Enable glossary search**

---

## Appendix: Route inventory (audit coverage)

| Route | Funnel stage |
|-------|----------------|
| `/` | Acquire |
| `/learn`, `/learn/[slug]` | Acquire |
| `/glossary`, `/glossary/[term]` | Acquire |
| `/reviews` | Acquire |
| `/file` | Activate |
| `/file/onboarding/signin` | Activate |
| `/file/onboarding/profile` | Activate |
| `/file/onboarding/case-matrix` | Activate |
| `/file/onboarding/itr-path` | Activate |
| `/file/import/documents` | Activate |
| `/file/import/parsing` | File |
| `/file/import/bank` | File |
| `/file/import/mismatch` | File |
| `/file/import/mismatch/[id]` | File |
| `/file/import/tds` | File |
| `/file/income` | File |
| `/file/house-property` | File |
| `/file/other` | File |
| `/file/deductions` | File |
| `/file/regime` | File |
| `/file/cabrain` | File |
| `/file/review/risk` | File |
| `/file/review/presubmit` | Pay |
| `/file/checkout/plans` | Pay |
| `/file/checkout/payment` | Pay |
| `/file/checkout/everify` | Pay |
| `/file/checkout/tracker` | Pay |
| `/file/companion` | Companion |
| `/file/support` | Companion |

**API surfaces:** `/api/compute`, `/api/documents/upload`, `/api/portal-guide/[form]`, `/api/payments/create-order`, `/api/payments/verify`, `/api/feedback`

---

*End of roadmap — implementation blocked until approved.*
