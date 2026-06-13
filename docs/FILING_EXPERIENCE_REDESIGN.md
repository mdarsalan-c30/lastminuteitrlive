# Filing Experience Redesign — AI-First, Plain English

**Date:** June 2026  
**Role:** Tax Logic & Filing Experience (Tax Consultant + Frontend Architect)  
**Scope:** All 26 routes under `app/file/**` — documentation only, no code changes  
**Sources:** `itr-filing-wireframes/ITR_FORM_MAP.md`, `RECOMMENDATION_RULES.md`, `FIGMA_FRAME_SPEC.md`, `PortalGuideTable`, `lastminute-itr/engine/`

---

## Design north star

> **The user should feel "AI is doing the work."**

They upload documents once, answer guided questions in plain English, and receive a filing-ready return with a government portal cheat sheet. Tax jargon is hidden by default; gov terminology appears on toggle or in the companion export.

### Experience principles

| Principle | Implementation |
|-----------|----------------|
| **Import-first** | Form 16 + AIS drive 80% of fields before any manual entry |
| **Progressive disclosure** | Show one decision at a time; expand advanced only on "My case is complex" |
| **Smart defaults** | ITR-1, exact mode, resident, AY 2026-27, old/new regime from engine |
| **Auto-detection** | Case matrix, income chips, mismatches, and form eligibility from parsed docs |
| **Guided questions** | Replace form fields with yes/no and amount confirmations |
| **Trust before pay** | Mismatch resolution + regime comparison visible before checkout |
| **Companion as payoff** | Portal cheat sheet unlocks after payment — the product moment competitors lack |

---

## Macro flow — current vs proposed

### Current (25 screens, linear)

```
Welcome → Signin → Profile → Case matrix → ITR path → Documents → Parsing → Bank
→ Mismatch → TDS → Income → House property → Other → Deductions → Regime → CA Brain
→ Risk review → Presubmit → Plans → Payment → E-verify → Tracker → Support
(+ Companion side entry)
```

### Proposed — Salaried ITR-1 happy path (11 screens)

```
Landing (name + Form 16 CTA) → Documents → Parsing confirm → Mismatch center
→ Regime compare → Deductions confirm → Filing-ready review → Plans → Payment
→ Companion (hero) → Tracker
```

**Deferred off-path (available via "Advanced"):** Signin, profile depth, house property, other income, CA Brain, TDS matcher, income workspace, e-verify standalone, support.

---

## Special sections

### 1. Companion mode as hero

**Today:** `PortalGuideTable` exists but companion is a side entry from welcome, marked "Phase 2", export not gated on payment.

**Proposed:** Companion is the **primary deliverable** after pay — the reason users choose LastMinute over ClearTax/Quicko.

| Element | Proposed behavior |
|---------|-------------------|
| **Positioning** | "Your step-by-step cheat sheet for incometax.gov.in — every field pre-filled from our engine" |
| **Hero screen** | Full-width `PortalGuideTable` with progress ring, search, copy-per-step |
| **Engine binding** | Each step maps `engineField` → L1 compute output (see `generate_portal_steps.py` / `ITR_FORM_MAP.md`) |
| **Plain English** | Every row shows `fieldLabel` (gov) + `plainEnglish` (human); gov label behind "Show ITD term" toggle |
| **Mismatch sync** | Steps with `status: mismatch` block export; red badge ties back to Mismatch Center |
| **Payment gate** | Print/PDF export disabled until `plan !== 'free'` AND `mismatchResolved` |
| **Post-pay CTA** | Payment success → auto-navigate to companion with confetti + "Open incometax.gov.in" deep link |
| **Mobile** | Sticky bottom bar: Copy value · Mark done · Next step |
| **Desktop** | Split view: companion left, optional Form Mirror drawer right (Figma spec) |

**Copy hero line:** *"We can't file for you — but we'll tell you exactly what to type on the government portal."*

---

### 2. Import-first salaried path

**Today:** 5 onboarding screens before upload; Form 16 is one connector among seven.

**Proposed:**

| Trigger | Behavior |
|---------|----------|
| Landing `?source=form16` or "Upload Form 16" CTA | Skip welcome, signin, profile, case-matrix, itr-path → land on `/file/import/documents` with Form 16 tile focused |
| Form 16 parse complete | Auto-set: `filingMode: exact`, `recommendedForm: ITR-1`, income band from gross salary, employer/TDS/80C |
| AIS upload (optional) | Pre-fill FD interest, dividend rows; trigger mismatch if delta > threshold |
| No Form 16 | Fallback: 3-question eligibility chip ("Salary only?" / "Any rent?" / "Sold shares?") → then manual or expert path |
| OAuth connectors | Collapsed behind "Connect accounts" — Form 16 upload remains primary CTA |

**Smart defaults for salaried ITR-1:**

- `matrix.business: x`, `incomeChips: [salary]`
- `profile.residentialStatus: resident`, `profile.ageBand` from PAN DOB when available
- `houseProperty.property_type: none` until user says they have home loan or rent income
- `income.fdInterest` from AIS when present; otherwise ask one question: "Any bank FD interest?" (yes → amount from AIS or estimate)

---

### 3. Regime compare moment

**Today:** Regime screen is deep in flow (screen 16); marketing hero has static ₹12L demo.

**Proposed:** Regime comparison is a **celebration moment** — the first time users see AI "doing math."

| Moment | UX |
|--------|-----|
| **Early teaser** | Landing hero: salary slider → instant old vs new estimate (no login) |
| **Authoritative compare** | After import + mismatch resolve: full L1 engine output with real numbers |
| **Presentation** | Side-by-side cards: "You'd pay ₹X" / "You'd get ₹Y refund" — recommended badge on cheaper regime |
| **Plain English** | "Old regime lets you use investments and HRA to reduce tax. New regime has lower rates but fewer deductions." |
| **One-tap choice** | Single CTA: "Use recommended (New regime)" — expand "See why" for breakeven deduction math |
| **Engine fields** | `regime_compare.py`: `old_tax`, `new_tax`, `recommended_regime`, `breakeven_80c` |
| **L2 hook** | Only if old regime wins by <₹5K: "Want to explore more deductions?" → optional CA Brain |

**Gov terminology map:**

| Gov term | Plain English label |
|----------|---------------------|
| Section 115BAC | New tax regime |
| Opt out of new regime | Use old regime (with deductions) |
| Chapter VI-A | Tax-saving investments & expenses |
| Rebate u/s 87A | Tax discount for lower incomes |

---

### 4. Mismatch center as trust moat

**Today:** Mismatch page exists but is one step in a long chain; partially hardcoded demo data.

**Proposed:** Mismatch Center is the **trust moat** — shown prominently post-import, blocks pay until critical issues resolved.

| Capability | Proposed |
|------------|----------|
| **Hero layout** | Full-screen: "We compared your documents" — summary bar: X critical · Y warnings · Z matched |
| **Sources** | Form 16, AIS, 26AS, draft — matrix per `FIGMA_FRAME_SPEC` screen 09 |
| **Severity** | Critical (blocks filing) · Warning (needs confirmation) · OK (green) |
| **Actions** | Fix now · I have proof · Mark for AIS feedback on portal |
| **AI inference** | Auto-classify: salary delta → employer revision vs AIS error; FD in AIS only → suggest add to other income |
| **Detail drill-down** | `/file/import/mismatch/[id]` with plain-English explanation + portal fix steps |
| **Paywall tie-in** | "We won't let you pay until critical mismatches are resolved" — competitor wedge |
| **Companion tie-in** | Unresolved mismatches block companion export |

**Copy:** *"ClearTax won't stop you when AIS doesn't match Form 16. We will."*

---

### 5. Payment unlocks companion export

**Today:** Payment and companion are disconnected; export blocked only on mismatch flag.

**Proposed monetization ladder:

| Tier | Unlocks |
|------|---------|
| **Free** | Estimate, eligibility check, regime teaser |
| **DIY (₹499)** | Full L1 compute + companion PDF/print + copy-per-step |
| **AI Smart (₹899)** | Mismatch engine + regime optimizer + L2 RAG questions |
| **CA Review (₹2,499)** | Human sign-off + audit trail |

**Payment → Companion flow:**

1. User completes presubmit checklist (filing-ready % ≥ 90%)
2. Selects plan on `/file/checkout/plans`
3. Pays on `/file/checkout/payment` (Razorpay)
4. Success → unlock `PortalGuideTable` export + redirect to `/file/companion?unlocked=1`
5. Banner: "Your portal guide is ready — 47 steps, every value copied from your return"

**Export blocked when:** `!paid` OR `mismatchResolved === false` OR `guide.hasMismatches`

---

## Per-screen redesign spec

> **Legend:**  
> **Eliminate** = remove from default salaried path (may remain for complex cases)  
> **Merge** = combine with another screen  
> **Keep** = stays in happy path  
> **Defer** = collect later (checkout / export gate)

---

### `app/file/layout.tsx` (shell)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Minimal filing shell — header + content wrapper |
| **Current inputs** | None |
| **Proposed inputs** | None — enhance with persistent macro stepper + filing-ready % chip |
| **AI actions** | Show global "AI status": Parsing · Reconciling · Computing · Ready |
| **Validation** | None |
| **Simplification** | Merge marketing header with filing chrome; single design system |
| **Gov → Plain** | N/A |

---

### 1. `/file` — Welcome

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Filing entry — trust + lane selection |
| **Current inputs** | CTAs only; `?name=` auto-redirect to signin |
| **Proposed inputs** | **Eliminate for import path** — merge into landing page |
| **AI actions** | Detect `?source=form16` → skip to documents; set `filingMode: exact` |
| **Validation** | None |
| **Simplification** | **Eliminate** as standalone; landing IS welcome for salaried |
| **Gov → Plain** | "Start filing" → "Upload Form 16 — we'll do the rest" |

---

### 2. `/file/onboarding/signin` — Sign in

| Attribute | Detail |
|-----------|--------|
| **Purpose** | PAN + OTP + DPDP consent |
| **Current inputs** | PAN, mobile, OTP (UI-only, not stored), consent checkbox |
| **Proposed inputs** | **Defer** until pay or companion export — single "Verify identity" modal |
| **AI actions** | PAN format validation; pre-fill name from Form 16 if parsed |
| **Validation** | Consent required; PAN `^[A-Z]{5}[0-9]{4}[A-Z]$` |
| **Simplification** | **Defer** — don't block import on signin |
| **Gov → Plain** | "PAN number" → "Your tax ID (10 characters on PAN card)" |

---

### 3. `/file/onboarding/profile` — Profile basics

| Attribute | Detail |
|-----------|--------|
| **Purpose** | AY, residential status, age band for slabs/exemptions |
| **Current inputs** | Assessment year (fixed), residential status, age band |
| **Proposed inputs** | **Auto-detect** age from PAN/Form 16; default resident + AY 2026-27 |
| **AI actions** | Infer `profile.ageBand` from DOB; infer `residentialStatus: resident` unless user says NRI |
| **Validation** | Senior banner triggers 80TTB recommendation |
| **Simplification** | **Eliminate** for salaried — one confirm chip: "I'm a resident Indian" |
| **Gov → Plain** | "Residential status" → "Do you live in India?" · "RNOR" → "Returned NRI (special status)" |

---

### 4. `/file/onboarding/case-matrix` — Case matrix

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Income band × age × business type + income chips → ITR form |
| **Current inputs** | Income band (1–5), age band (a–e), business type (x–v), 11 income chips |
| **Proposed inputs** | **3 guided questions** replacing 3 dropdowns + 11 chips |
| **AI actions** | `resolveRecommendedForm()` from parsed Form 16/AIS; auto-select chips from doc content |
| **Validation** | BLOCK for minors; ITR-2/3/4 flags from chips |
| **Simplification** | **Merge** with itr-path → single "Quick eligibility check" (30 sec) |
| **Gov → Plain** | "Case matrix" → "What kind of income do you have?" |

**Proposed 3 questions:**

1. "Is your income mostly salary?" (yes → ITR-1 lane)
2. "Did you sell shares, property, or crypto?" (yes → ITR-2)
3. "Do you run a business or freelance?" (yes → ITR-4 path)

---

### 5. `/file/onboarding/itr-path` — ITR form gate

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Confirm recommended ITR form before import |
| **Current inputs** | ITR confirmation checkbox; expert branch CTAs |
| **Proposed inputs** | **Auto-confirm** ITR-1 for salaried; show read-only recommendation card |
| **AI actions** | `getItrPathReasons()`, `getWhyNotItr3()` — render as plain-English bullets |
| **Validation** | Hard block STCG/foreign/director/>₹50L on ITR-1 |
| **Simplification** | **Merge** into case-matrix eligibility screen |
| **Gov → Plain** | "ITR-1 SAHAJ" → "Simple return for salaried employees" |

---

### 6. `/file/import/documents` — Document hub

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Import center — upload Form 16, AIS, 26AS |
| **Current inputs** | Mode cards (display only), ConnectorGrid uploads |
| **Proposed inputs** | **Form 16 required**; AIS recommended (one-tap later); collapse OAuth "coming soon" |
| **AI actions** | Document type detection; checklist "Missing for your return: AIS" |
| **Validation** | Warn if salaried path without Form 16 |
| **Simplification** | **Keep** — hero screen #1 for salaried path |
| **Gov → Plain** | "Form 16" → "Salary certificate from employer" · "AIS" → "Annual tax summary from IT portal" · "26AS" → "TDS statement from IT portal" |

---

### 7. `/file/import/parsing` — Parsing review

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Confirm extracted Form 16 data |
| **Current inputs** | Read-only: employer, gross salary, TDS, 80C |
| **Proposed inputs** | **Confirm cards** — tap to edit only wrong fields |
| **AI actions** | OCR/parse Form 16 Part A+B; confidence flags on low-quality fields; merge into draft store |
| **Validation** | Block continue if gross salary or TDS missing |
| **Simplification** | **Keep** — merge income workspace review into this screen |
| **Gov → Plain** | "Gross salary u/s 17(1)" → "Total salary before tax" · "TDS" → "Tax already deducted by employer" |

---

### 8. `/file/import/bank` — Bank & contact

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Refund bank account + address |
| **Current inputs** | Account number, IFSC, address (hardcoded, not in store) |
| **Proposed inputs** | **Defer** to presubmit/checkout — or pre-fill from AIS/part 139 |
| **AI actions** | IFSC lookup → bank name; validate account format; pre-fill address from PAN profile |
| **Validation** | IFSC `^[A-Z]{4}0[A-Z0-9]{6}$`; block presubmit if invalid |
| **Simplification** | **Defer** — inline on presubmit, not standalone screen |
| **Gov → Plain** | "Refund bank account" → "Where should we send your refund?" |

---

### 9. `/file/import/mismatch` — Mismatch center

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Reconcile Form 16 / AIS / 26AS / draft |
| **Current inputs** | Display rows; Fix / Add income actions |
| **Proposed inputs** | **Zero inputs** — action buttons only |
| **AI actions** | Auto-build mismatch matrix from parsed docs; severity classification; suggest resolution |
| **Validation** | Block continue + block pay if critical unresolved |
| **Simplification** | **Keep** — promote to hero post-import gate |
| **Gov → Plain** | "Mismatch" → "Your documents don't fully agree — let's fix it" · "AIS feedback" → "Report error on government portal" |

---

### 10. `/file/import/mismatch/[id]` — Mismatch detail

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Single-issue drill-down with resolution steps |
| **Current inputs** | Mark resolved button |
| **Proposed inputs** | Optional proof upload; "Use Form 16 value" one-tap |
| **AI actions** | Plain-English explanation from rule catalog (`MISMATCH_SALARY_001` etc.); portal fix steps |
| **Validation** | Critical issues need explicit resolution choice |
| **Simplification** | **Keep** as modal/sheet, not full page (mobile) |
| **Gov → Plain** | "Update draft" → "Use this number in your return" |

---

### 11. `/file/import/tds` — TDS credit matcher

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Match Form 16 TDS to 26AS; capture advance/SAT |
| **Current inputs** | Advance tax, self-assessment tax (number) |
| **Proposed inputs** | **Advance/SAT only if** user indicates extra payments |
| **AI actions** | Auto-match TDS from Form 16 vs 26AS; flag employer revision needed |
| **Validation** | Cannot claim TDS > 26AS (`Schedule_TDS` rule) |
| **Simplification** | **Merge** into mismatch center — eliminate standalone screen |
| **Gov → Plain** | "TDS credit" → "Tax your employer/bank already paid for you" · "Advance tax" → "Tax you paid early in the year" |

---

### 12. `/file/income` — Salary income

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Salary head workspace (Schedule Salary) |
| **Current inputs** | Read-only employer, gross, TDS |
| **Proposed inputs** | **None** — display only inside parsing review |
| **AI actions** | Engine `salary.py`: gross, std deduction, HRA, PT, net salary |
| **Validation** | Multi-employer: prompt second Form 16 upload |
| **Simplification** | **Eliminate** — merged into parsing confirm |
| **Gov → Plain** | "Income from salary" → "Money from your job" · "Schedule Salary" → "Salary details" |

---

### 13. `/file/house-property` — House property

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Schedule HP — self-occupied / let-out |
| **Current inputs** | Property type (local only), municipal tax, co-owner % |
| **Proposed inputs** | **One question:** "Do you own a home with a loan or rent it out?" → expand if yes |
| **AI actions** | Detect home loan from AIS/Form 16 HRA conflict; `house_property.py` interest cap ₹2L |
| **Validation** | HRA + home loan interest → yellow warning (`HP_24B_CLAIM`) |
| **Simplification** | **Skip by default** — show only if chip/rent/home loan detected |
| **Gov → Plain** | "Income from house property" → "Home you own" · "Interest u/s 24(b)" → "Home loan interest" |

---

### 14. `/file/other` — Other sources

| Attribute | Detail |
|-----------|--------|
| **Purpose** | FD interest, dividends, savings interest |
| **Current inputs** | FD interest amount |
| **Proposed inputs** | **Confirm AIS pre-fill** — "Bank paid you ₹X interest — correct?" |
| **AI actions** | Pre-fill from AIS; 80TTA/80TTB recommendation for seniors |
| **Validation** | Must match AIS for FD if AIS uploaded (or mark AIS feedback) |
| **Simplification** | **Conditional** — inline on mismatch or single confirm card, not full screen |
| **Gov → Plain** | "Income from other sources" → "Bank interest & dividends" · "Schedule OS" → "Other income details" |

---

### 15. `/file/deductions` — Deduction assistant

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Chapter VI-A deductions (80C, 80D, 80GG, NPS) |
| **Current inputs** | 80C/80D read-only; 80GG editable; NPS L2 badge |
| **Proposed inputs** | **Confirm cards** from Form 16 — edit only if wrong |
| **AI actions** | L1 `recommendations.py`: 80C headroom, NPS 80CCD(1B), 80D, blocked fake claims; L2 RAG for profession packs |
| **Validation** | Red/blocked rules cannot auto-apply; proof required for yellow |
| **Simplification** | **Keep** — collapse to 3–5 confirmation rows, not editable form |
| **Gov → Plain** | "Chapter VI-A deductions" → "Tax-saving investments" · "80C" → "PF, PPF, ELSS, LIC (up to ₹1.5L)" · "80CCD(1B)" → "Extra NPS (up to ₹50K)" |

---

### 16. `/file/regime` — Regime compare

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Old vs new regime — L1 tax engine output |
| **Current inputs** | Regime radio selection (old/new) |
| **Proposed inputs** | **One tap:** "Use recommended regime" |
| **AI actions** | `regime_compare.py` full compute; breakeven; refund/payable per regime |
| **Validation** | Warn if mismatches open; disable until L1 inputs sane |
| **Simplification** | **Keep** — hero moment #2 |
| **Gov → Plain** | "Section 115BAC" → "New tax regime" · "Tax payable" → "What you owe" · "Refund" → "What you'll get back" |

---

### 17. `/file/cabrain` — CA Brain (L2 RAG)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Profession picker + RAG follow-up questions |
| **Current inputs** | Profession select; NPS yes/no/skip (not stored) |
| **Proposed inputs** | **Opt-in only** — "Want to find more legal savings?" |
| **AI actions** | L2 RAG question packs per RECOMMENDATION_RULES L2 scope; feed deduction candidates |
| **Validation** | All L2 suggestions require proof + confirmation |
| **Simplification** | **Defer** off salaried happy path — link from deductions if old regime |
| **Gov → Plain** | "CA Brain" → "Extra tax-saving check" · "RAG" → hidden from user |

---

### 18. `/file/review/risk` — Risk & confidence

| Attribute | Detail |
|-----------|--------|
| **Purpose** | CA-style one-pager — confidence %, proof checklist |
| **Current inputs** | None (read-only) |
| **Proposed inputs** | **None** — filing-ready meter |
| **AI actions** | `confidence.py`: completeness %, risk score, missing docs |
| **Validation** | Estimate mode → yellow "not filing-ready" |
| **Simplification** | **Merge** into presubmit review |
| **Gov → Plain** | "Risk score" → "How confident we are your return is correct" |

---

### 19. `/file/review/presubmit` — Pre-submit gate

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Final checklist before checkout |
| **Current inputs** | E-verify method select |
| **Proposed inputs** | E-verify preference; bank (if deferred) |
| **AI actions** | Auto-check: ITR form, mismatches, bank, regime selected |
| **Validation** | All P0 green to enable "Choose plan" |
| **Simplification** | **Keep** — absorb risk review content |
| **Gov → Plain** | "E-verify method" → "How you'll confirm your return after filing" · "ITR-V" → "Sign and mail a paper form" |

---

### 20. `/file/checkout/plans` — Plan selection

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Tier selection — monetization |
| **Current inputs** | Plan card selection (free/diy/ai_smart/ca) |
| **Proposed inputs** | **One recommended plan** highlighted based on case complexity |
| **AI actions** | Suggest tier: salaried+no mismatch → DIY; mismatch history → AI Smart |
| **Validation** | None |
| **Simplification** | **Keep** — show only after filing-ready |
| **Gov → Plain** | "DIY" → "File yourself with portal guide" · "AI Smart" → "Full mismatch + regime AI" |

---

### 21. `/file/checkout/payment` — Payment

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Pay + unlock companion export |
| **Current inputs** | Razorpay trigger |
| **Proposed inputs** | **None** — payment method via Razorpay |
| **AI actions** | Show tax summary + refund from L1 engine |
| **Validation** | Razorpay success → set `paid: true`, unlock companion |
| **Simplification** | **Keep** — explicit unlock moment |
| **Gov → Plain** | "Pay & submit" → "Pay & unlock your portal guide" (no auto-submit promise) |

---

### 22. `/file/checkout/everify` — E-verify

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Post-submit verification method |
| **Current inputs** | Aadhaar OTP / netbanking / ITR-V select (local only) |
| **Proposed inputs** | **Merge** into tracker — collected at filing-ready, confirmed here |
| **AI actions** | Remind 30-day deadline |
| **Validation** | None |
| **Simplification** | **Merge** into tracker |
| **Gov → Plain** | "E-verification" → "Confirm your return is real (required within 30 days)" |

---

### 23. `/file/checkout/tracker` — Return tracker

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Post-filing lifecycle — submitted → verified → refund |
| **Current inputs** | None (static demo) |
| **Proposed inputs** | Notification preferences (email/WhatsApp) |
| **AI actions** | Poll ITD status (Phase 2); refund estimate from engine |
| **Validation** | E-verify pending warning |
| **Simplification** | **Keep** — include e-verify CTA inline |
| **Gov → Plain** | "Acknowledgement number" → "Filing receipt number" · "Refund processing" → "Government is sending your refund" |

---

### 24. `/file/support` — Support & audit

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Chat, audit trail, companion link |
| **Current inputs** | None |
| **Proposed inputs** | **None** — help drawer, not flow screen |
| **AI actions** | Show audit log of AI decisions (regime, mismatches, recommendations) |
| **Validation** | None |
| **Simplification** | **Eliminate** from main flow — footer/help menu |
| **Gov → Plain** | "Audit trail" → "What we calculated and when" |

---

### 25. `/file/companion` — Portal companion

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Government portal cheat sheet with copy-per-step values |
| **Current inputs** | ITR form select (ITR-1/3/4) |
| **Proposed inputs** | **None** — read-only guide; step checkboxes for progress |
| **AI actions** | `fetchPortalGuide()` + L1 values per `portal_steps.json`; search/filter steps |
| **Validation** | Export blocked: unpaid OR mismatches OR `guide.hasMismatches` |
| **Simplification** | **Keep** — hero deliverable post-payment |
| **Gov → Plain** | "Portal checklist" → "Your incometax.gov.in walkthrough" · "Our value" → "Copy this into the portal" |

---

## Gov terminology → plain English master map

| Gov / ITD term | Plain English UI label | Where used |
|----------------|------------------------|------------|
| ITR-1 SAHAJ | Simple return (salaried) | Eligibility |
| ITR-2 | Return with investments/property sales | Eligibility |
| ITR-3 | Business return (full accounts) | Expert path |
| ITR-4 SUGAM | Small business simplified return | Freelancer path |
| Assessment Year (AY) | Tax year you're filing for | Profile (hidden default) |
| Form 16 | Salary certificate from employer | Import |
| AIS | Annual tax summary (IT portal) | Import |
| Form 26AS | TDS credit statement | Import |
| Schedule Salary | Salary details | Companion |
| Schedule HP | Home ownership details | House property |
| Schedule OS | Bank interest & dividends | Other income |
| Chapter VI-A | Tax-saving investments | Deductions |
| Section 80C | PF, PPF, ELSS, LIC (₹1.5L max) | Deductions |
| Section 80D | Health insurance premium | Deductions |
| Section 80CCD(1B) | Extra NPS (₹50K max) | Deductions / L2 |
| Section 80GG | Rent deduction (no HRA) | Deductions |
| Section 80TTA / 80TTB | Bank interest deduction | Other income |
| Section 115BAC | New tax regime | Regime |
| Opt out of new regime | Use old regime | Regime / companion |
| Gross Total Income (GTI) | Total income before deductions | Engine progress |
| Rebate u/s 87A | Tax discount (lower incomes) | Regime cards |
| TDS | Tax already paid for you | Mismatch / TDS |
| Advance tax | Tax paid early in the year | TDS (conditional) |
| Self-assessment tax | Extra tax paid before filing | TDS (conditional) |
| E-verification | Confirm your filed return | Presubmit / tracker |
| ITR-V | Paper verification by mail | E-verify option |

---

## Engine & L2 automation matrix

| Screen | L1 engine module | L2 / AI capability |
|--------|------------------|-------------------|
| Documents | `profiler.py` (doc flags) | Document type classification |
| Parsing | `salary.py`, `deductions.py` | OCR Form 16 Part A+B |
| Mismatch | `orchestrator.py` | Cross-doc delta detection + severity |
| TDS | `orchestrator.py` (tax paid) | 26AS authority matching |
| Income | `salary.py` | Multi-employer merge |
| House property | `house_property.py` | HRA vs HP conflict check |
| Other | `other_income.py` | AIS pre-fill |
| Deductions | `deductions.py`, `recommendations.py` | L2 RAG profession packs |
| Regime | `regime_compare.py`, `tax_slabs.py` | Breakeven narrative |
| Companion | `plain_english.py` + portal steps | Step-value binding from compute |
| Review | `confidence.py` | Filing-ready % |
| Risk | `recommendations.py` | Risk scoring from proof gaps |

---

## Screens that can be eliminated

### Count summary

| Category | Screens | Routes |
|----------|---------|--------|
| **Eliminated from salaried happy path** | 10 | `/file`, `/file/onboarding/signin`, `/file/onboarding/profile`, `/file/onboarding/case-matrix`, `/file/onboarding/itr-path`, `/file/import/bank`, `/file/import/tds`, `/file/income`, `/file/review/risk`, `/file/support` |
| **Merged (net −4 screens)** | 4 merges → 4 fewer routes | case-matrix+itr-path, tds→mismatch, income→parsing, risk→presubmit, everify→tracker |
| **Conditional skip (not eliminated)** | 2 | `/file/house-property`, `/file/other` |
| **Deferred off-path (not eliminated)** | 2 | `/file/onboarding/signin`, `/file/cabrain` |

### Net route reduction

| Metric | Current | Proposed (salaried) |
|--------|---------|---------------------|
| Screens in happy path | 22 | **11** |
| **Eliminated or merged away** | — | **11 screens** |
| Standalone routes removed (if merged) | 25 pages | **~21 pages** (4 merges collapse routes) |

**Headline number: 11 screens eliminated** from the default salaried ITR-1 journey (user never sees them). With route merges, **4 routes can be retired** from the codebase long-term (tds, income, risk, everify as standalone pages).

---

## Top 5 AI automation wins

### 1. Form 16 + AIS auto-fill (import intelligence)

**What:** Upload Form 16 → engine populates salary, TDS, 80C, employer, exemptions; AIS adds FD interest, dividends, additional TDS.

**User feels:** "I uploaded one PDF and my return is 80% done."

**Engine:** `salary.py`, `deductions.py`, `other_income.py`, `draftToUserInput.ts`

**Eliminates:** profile, case-matrix, income screen, most of deductions manual entry.

---

### 2. Mismatch auto-detection & resolution (trust moat)

**What:** AI compares Form 16 ↔ AIS ↔ 26AS ↔ draft; classifies critical/warning; suggests one-tap fixes ("Use Form 16 value").

**User feels:** "It caught that AIS shows more salary than my Form 16 — before I paid."

**Engine:** `orchestrator.py` + rule IDs; blocks pay and companion export.

**Eliminates:** manual cross-checking; standalone TDS screen.

---

### 3. Regime recommendation with real numbers (L1 compute)

**What:** After import, engine runs full old vs new comparison with actual salary/deductions — not demo ₹12L.

**User feels:** "AI calculated I'd save ₹4,000 with the new regime — one tap to choose."

**Engine:** `regime_compare.py`, `tax_slabs.py`

**Eliminates:** user needing to understand 115BAC or Chapter VI-A before deciding.

---

### 4. Eligibility & ITR form auto-selection (case matrix)

**What:** Parse docs + 3 plain-English questions → `resolveRecommendedForm()` — no dropdowns.

**User feels:** "It already knows I need ITR-1."

**Engine:** `profiler.py`, `case-matrix.ts`, `ITR_FORM_MAP` exclusion flags.

**Eliminates:** case-matrix, itr-path (2 screens).

---

### 5. Companion portal guide with copy-ready values (payoff)

**What:** L1 compute binds every `portal_steps.json` row to `ourValue`; user copies into incometax.gov.in step by step.

**User feels:** "I'm not guessing what to type on the government site — AI filled my cheat sheet."

**Engine:** `generate_portal_steps.py`, `plain_english.py`, `PortalGuideTable`, `fetchPortalGuide()`

**Unlocks:** Payment value prop; differentiation vs ClearTax/Quicko.

---

## Implementation priority (docs → future code)

| Priority | Item | Screens affected |
|----------|------|------------------|
| P0 | Import-first routing (`?source=form16`) | welcome, signin, profile, case-matrix, itr-path |
| P0 | Mismatch hero + paywall gate | mismatch, presubmit, payment |
| P0 | Payment → companion unlock | payment, companion |
| P1 | Merge parsing + income | parsing, income |
| P1 | Regime hero presentation | regime, landing |
| P1 | Deductions as confirm cards | deductions |
| P2 | Defer bank to presubmit | bank, presubmit |
| P2 | CA Brain opt-in | cabrain |
| P2 | Retire standalone tds, risk, everify routes | tds, risk, everify |

---

## Appendix: Proposed salaried screen order

```
1.  /file/import/documents      — "Upload your Form 16"
2.  /file/import/parsing        — "Here's what we found — looks right?"
3.  /file/import/mismatch       — "We compared your documents"
4.  /file/regime                — "Which tax option saves you more?"
5.  /file/deductions            — "Confirm your tax-saving investments"
6.  /file/review/presubmit      — "You're filing-ready (92%)"
7.  /file/checkout/plans        — "Pick your plan"
8.  /file/checkout/payment      — "Unlock your portal guide"
9.  /file/companion             — "Your incometax.gov.in cheat sheet" ★
10. /file/checkout/tracker      — "Track refund & e-verify"
```

**Advanced drawer:** house-property, other, cabrain, signin, bank, support.

---

*This document is Phase 5 deliverable for the LastMinute ITR filing experience redesign. No code changes were made.*
