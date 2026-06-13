# Funnel Audit & Simplification — LastMinute ITR

**Date:** Jun 10, 2026  
**Preview:** https://lastminute-busb7ssn6-nikhil-anand-s-projects12.vercel.app  
**Evidence source:** `app/file/**`, `lib/filing/routes.ts`, `lib/store/draft.ts`, `lib/filing/constants.ts`, `lib/payments/access.ts`, navigation components  
**Audit verdict:** ⚠️ PARTIAL — core happy path works, but 4 dead paths, 3 hard blockers, and step-count bloat need fixing before launch.

---

## 1. Current Funnel Map

### Macro Step Labels (from `lib/filing/constants.ts`)
```
Step 1: Understand
Step 2: Import
Step 3: Reconcile
Step 4: Optimize
Step 5: Review
Step 6: File & Track
```

### Path A — Standard ("Start my return")

```
/ (landing)
  └── HeroNameForm → /file/onboarding/signin?name=X
        ↓ [macroStep=1]
  /file/onboarding/signin   (PAN + consent checkbox — BLOCKING)
        ↓ Continue (disabled until consentGiven=true)
  /file/onboarding/profile  (AY, residential status, age band)
        ↓ Continue (always enabled)
  /file/onboarding/eligibility  (income chips + income/age matrix → ITR form recommendation)
        ↓ handleContinue → router.push("/file/import/documents")
        ↓ [macroStep=2]
  /file/import/documents    (upload options: Form 16 / ITD / Manual)
        ↓ "Continue with Form 16"
  /file/import/parsing      (parsed fields review)
        ↓ "Confirm & merge"
  /file/import/bank         (bank account, IFSC, address) [macroStep=2]
        ↓ "Save & reconcile"
        ↓ [macroStep=3]
  /file/import/mismatch     (critical vs warning vs OK rows — BLOCKING if critical open)
        ↓ Fix now → /file/import/mismatch/[id] (salary, etc.)
        ↓ "Continue when critical rows are green" → /file/import/tds
  /file/import/tds          (26AS TDS match + advance tax entry)
        ↓ Continue
        ↓ [macroStep=4]
  /file/income              (salary workspace, nav rail appears)
        ↓ "Save & continue"
  /file/house-property      (property type, municipal tax, co-owner %)
        ↓ "Save & continue"
  /file/other               (FD interest, senior 80TTB panel)
        ↓ "Save & continue"
  /file/deductions          (80C, 80D, 80GG, NPS, blocked items)
        ↓ "Save & continue"
  /file/regime              (old vs new tax engine, regime selection)
        ↓ "I choose X regime" → [macroStep=5]
  /file/review/risk         (confidence panel, income/deduction summary)
        ↓ "Continue to final check"
  /file/review/presubmit    (checklist: form ✓, mismatch ✓, bank ✓, e-verify ○ — BLOCKING)
        ↓ "Choose plan & unlock guide" (disabled until all green + filingReady)
        ↓ [macroStep=6]
  /file/checkout/plans      (plan cards, locked if !filingReady — BLOCKING)
        ↓ "Continue to payment"
  /file/checkout/payment    (Razorpay, plan summary)
        ↓ onSuccess → setPaymentVerified → router.push("/file/companion?unlocked=1")
  /file/companion           (step-by-step portal guide, export gated behind payment)
        ↓ "Filing tracker"
  /file/checkout/tracker    (4-step tracker: payment ✓ / file on portal / e-verify / refund)
        ↓ "View support & audit trail"
  /file/support             (audit log, chat, WhatsApp)
```

**Standard path screen count: 20 screens** (not counting mismatch detail; 22 if mismatch hit)

---

### Path B — Form 16 Fast Path (`?source=form16`)

```
/ (landing)
  └── "Upload Form 16" button → /file/import/documents?source=form16[&name=X]
        ↓ useEffect: applySalariedFastPathDefaults() called
          sets: filingMode="estimate", filingPath="simple", recommendedForm="ITR-1"/caseId="ITR1-2a-x"
        ↓ [macroStep=2]
  /file/import/documents    (title changes to "Upload your Form 16", ConnectorGrid highlighted)
        ↓ "Continue with Form 16"
  /file/import/parsing → bank → mismatch (if any) → tds → income → ...
  [same tail as standard path — 13 more screens]
```

**Fast path screen count: 16 screens** (skips signin, profile, eligibility — saves 3 screens)

Also reachable: `/file?source=form16` → redirects to `/file/import/documents?source=form16`

---

### Path C — Direct TDS shortcut (orphaned link on documents page)

```
/file/import/documents
  └── "TDS & advance tax →" link → /file/import/tds   [macroStep=3]
        ↓ Continue → /file/income (skips parsing, bank, mismatch entirely)
```

This path bypasses Form 16 parsing, bank validation, and mismatch resolution. Mismatch gate is then never hit. The subsequent checkout/plans checks `mismatchResolved` (initialState=`true`) so checkout is not blocked. This is a **valid shortcut for the manual/estimate path** but is unlabelled.

---

### Path D — Cabrain (dead — never activated)

```
Regime page: router.push(filingPath === "cabrain" ? "/file/cabrain" : "/file/review/risk")
Eligibility expert case: href={filingPath === "cabrain" ? "/file/cabrain" : "/file/checkout/plans"}
cabrain page: reviewHref = filingPath === "cabrain" ? "/file/review/risk" : "/file/review/presubmit"
```

**Problem:** `setFilingPath("cabrain")` is **never called from any UI in the codebase.** The initial store state is `"simple"`, and `applySalariedFastPathDefaults` sets it to `"simple"`. No page, button, or toggle in `app/file/**` calls `setFilingPath("cabrain")`. The `/file/cabrain` route is reachable only by direct URL navigation — it is **functionally dead**.

---

### Path E — Senior Mode (dead — never activated)

```
lib/store/draft.ts:  seniorMode: false  (initialState, no setter UI anywhere)
app/file/other/page.tsx: renders bigger text if seniorMode=true
```

**Problem:** `setSeniorMode(true)` is **never called from any UI.** The flag exists in store, has a setter, and affects text sizing in `/file/other` — but there is no screen, toggle, or preference that sets it. Dead feature.

---

### Redirect / Legacy Routes

| Route | Behavior |
|-------|----------|
| `/file/onboarding/itr-path` | 301 redirects to `/file/onboarding/eligibility` (passthrough searchParams) |
| `/file/onboarding/case-matrix` | 301 redirects to `/file/onboarding/eligibility` (passthrough searchParams) |
| `/file` | Welcome screen OR redirect dispatcher (form16 → documents; name → signin) |

Both `itr-path` and `case-matrix` are dead/legacy redirect stubs — not linked from anywhere.

---

## 2. Screens That Add Value

| Route | Value | Why |
|-------|-------|-----|
| `/file/onboarding/eligibility` | High | ITR form recommendation prevents wrong-form notices; income chip triage is core value |
| `/file/import/parsing` | High | Trust moment — user sees we parsed their Form 16 correctly |
| `/file/import/mismatch` | High | AIS mismatch resolution is the #1 CA-level value prop |
| `/file/import/mismatch/[id]` | High | Actionable detail for each conflict |
| `/file/import/tds` | Medium | 26AS cross-check catches underpaid advance tax |
| `/file/regime` | High | Regime comparison with live tax engine output — strongest unique feature |
| `/file/review/risk` | High | Confidence panel + risk badge reassures before payment |
| `/file/checkout/plans` | High | Value stack justifies price; plan selection is necessary |
| `/file/checkout/payment` | High | Required — Razorpay integration |
| `/file/companion` | High | The deliverable — portal walkthrough guide |
| `/file/other` | Medium | FD interest is a common miss; 80TTB for seniors is real value |
| `/file/deductions` | Medium | Legitimacy layer — blocks invented deductions |

---

## 3. Screens That Are Unnecessary or Redundant

| Route | Issue | Severity |
|-------|-------|----------|
| `/file` (welcome screen) | Redundant intermediate landing. Only shown if user navigates directly. Real entry is landing → signin (or fast path). | Low |
| `/file/onboarding/profile` | Redundant with eligibility. Profile collects AY (single option), residential status, and age band. Eligibility **also collects age band** (duplicate) and triggers the same `setProfile` updates via `handleAgeChange`. **Net unique field: residential status only.** | High |
| `/file/onboarding/itr-path` | Legacy redirect stub with no inbound links | Low |
| `/file/onboarding/case-matrix` | Legacy redirect stub with no inbound links | Low |
| `/file/checkout/everify` | Orphaned page — not linked in any forward navigation. `checkout/tracker` and `presubmit` don't navigate here. The e-verify selection is already in `/file/review/presubmit`. Duplicate and orphaned. | Medium |
| `/file/checkout/tracker` | Very thin — 4 tracker steps + refund estimate already shown in companion. Could be merged into companion footer. | Low |
| `/file/support` | Only reachable from tracker "View support & audit trail". Audit log is hardcoded mock. Adds nothing functional for MVP. | Low |
| `/file/cabrain` | Never activated. Coming-soon placeholder. Adds 0 value to current user journey. | High |

---

## 4. Questions to Remove / Merge / Delay

### Remove
- **Age band from Profile page** — already collected in Eligibility. Keep only in Eligibility.
- **Assessment Year selector** — AY 2026-27 is the only option. Remove the selector; show it as a static badge. Saves a step.
- **E-verify method** — asked in both `/file/review/presubmit` AND `/file/checkout/everify`. Remove the everify page entirely; presubmit is sufficient.

### Merge
- **Profile + Eligibility → single "About you & income" screen.** Residential status + age band + income chips + income band can all live on one screen (currently split across 2 screens with 2 route hops). Saves 1 screen, 1 redirect, 1 back-button press.
- **Signin + Profile → single onboarding screen.** PAN, consent, residential status — all belong in the same "who are you?" moment. Saves 1 full macroStep-1 screen.
- **Tracker → merge into Companion footer.** The 4 tracker steps could be a collapsible section at the bottom of the companion page.

### Delay (to post-payment or post-filing)
- **Bank account details** (`/file/import/bank`) — bank validation is needed before filing on the portal, not before mismatch review. Move to post-payment "pre-file checklist" inside the companion guide. Saves 1 screen in the main funnel.
- **Profession / CA brain features** — the cabrain concept should be delayed to post-launch when CA plan is actually live. The placeholder adds friction for users who see "Coming soon."

---

## 5. Missing "What Happens Next" Copy

| Location | What's missing |
|----------|----------------|
| `/file/onboarding/signin` | No indication there are 2–3 more onboarding screens. User hits "Continue" with no progress cue beyond the macro-stepper. |
| `/file/onboarding/profile` | No copy explaining why AY/residential status matters to the recommendation. |
| `/file/onboarding/eligibility` | After recommending ITR form, the "Continue to documents" CTA doesn't say what uploading will accomplish. |
| `/file/import/documents` | "Most users finish faster by importing first" — true, but no expected time shown on fast path. The fast path title changes but the body copy is still generic. |
| `/file/import/bank` | "Save & reconcile" CTA is jargon. Says nothing about what reconcile means or what's next. |
| `/file/import/mismatch` | "Continue when critical rows are green" is clear mechanically but no explanation of what TDS screen does next. |
| `/file/review/presubmit` | "Choose plan & unlock guide" is clear, but no preview of what plans cost or what the guide looks like — user has no reason to proceed if they don't trust the paywall. |
| `/file/checkout/plans` | When locked (`!filingReady`), the banner says "Return to pre-submit checklist" but doesn't explain which specific item is failing. |
| `/file/checkout/payment` | The "No government submission" disclaimer is good, but there's no estimated time for receiving the companion guide after payment. |
| After payment (`/file/companion?unlocked=1`) | "Just unlocked" banner mentions step count but doesn't give a time estimate for completing the portal filing. |

---

## 6. Drop-off Risks

### 🔴 Hard Blockers (users cannot proceed)

1. **Consent checkbox on signin** (`/file/onboarding/signin`)  
   Button is `disabled={!consentGiven}`. If user doesn't notice the checkbox or doesn't want to consent, they are stuck with no exit path or explanation of consequences. No "skip" or "why we need this" link.

2. **Mismatch gate** (`/file/import/mismatch`)  
   `disabled={!mismatchResolved}` — "Continue" is completely disabled until all critical rows are green. If user's salary mismatch is real (not a parsing error), they have no forward path unless they resolve with employer or submit AIS feedback — a process that can take days. There is no "proceed at risk" option.

3. **Plans locked until filingReady** (`/file/checkout/plans`)  
   Plans page shows a warning banner but the continue button is disabled. `filingReady = confidence.filing_ready && mismatchResolved`. If the engine fails or returns low confidence, the user is completely blocked from checkout with no manual override. The banner's "Return to pre-submit checklist" is circular — presubmit also checks `filingReady`.

### 🟡 Soft Blockers (friction, likely drop-off)

4. **E-verify method on presubmit**  
   One of 4 presubmit checklist items is "E-verify method" — if not selected, the "Choose plan" button is disabled (via `canProceed = checklistGreen && filingReady`). This is a late-funnel blocker on a detail users may not know about yet.

5. **20-screen path (standard)**  
   20+ screens before payment. Each screen is a potential exit. Users who start the standard path (not Form 16 fast path) face signin → profile → eligibility → documents → parsing → bank → mismatch → TDS → income → house → other → deductions → regime → risk → presubmit → plans → payment = 16 decisions before money.

6. **Plans page pay gate with no floor plan**  
   There is a `free` plan in `PLAN_LIST` but it's filtered out of the checkout grid: `PLAN_LIST.filter((p) => p.id !== "free")`. Users see only paid options (₹499, ₹899, ₹2,499). No free tier visible = higher abandonment at this gate.

7. **Companion accessible without payment (confusing)**  
   `/file/companion` does not redirect away unpaid users — it shows the guide table but `exportUnlocked=false`. The table renders but actions are disabled. Users may think the product is broken rather than paywalled.

8. **"Government portal companion" button on /file welcome**  
   Links to `/file/companion` directly from the welcome screen — before any filing is done. If clicked, companion loads with empty/default data and no export access. Confusing false entry point.

---

## 7. Recommended Simplified Funnel

### Guiding principles
- Form 16 users (majority) should reach regime comparison in ≤8 screens
- Standard users should reach regime comparison in ≤10 screens  
- Every screen must have one clear CTA and a "what happens next" sentence
- No screen should dead-end

### Simplified Path (Form 16 fast path — target: 11 screens)

```
/ (landing)
  └── [Merge] "Upload Form 16" → /file/start?source=form16
        ↓ [NEW: single combined screen]
  /file/start               ── PAN, consent, name, age band, residential status
        ↓ "Let's go"
  /file/import/documents    ── Form 16 highlighted; "~5 min" time estimate
        ↓
  /file/import/parsing      ── Review imported fields
        ↓
  /file/import/mismatch     ── Conditional; show "0 mismatches → skip" fast path
        ↓
  /file/income              ── Income workspace (merge TDS tab into this page)
        ↓
  /file/deductions          ── Deduction assistant (merge house-property + other + deductions)
        ↓
  /file/regime              ── Regime comparison (strong value moment)
        ↓
  /file/review/presubmit    ── Merged risk+presubmit; show confidence + checklist
        ↓
  /file/checkout/plans      ── Plans with value stack
        ↓
  /file/checkout/payment    ── Pay
        ↓
  /file/companion           ── Portal guide (the deliverable)
```

**Result: 11 screens for Form 16 path (down from 16)**

### Simplified Path (Standard / manual — target: 13 screens)

```
/ (landing)
  └── "Start my return" → /file/start?name=X
        ↓
  /file/start               ── Combined: name, PAN, consent, residential status
        ↓
  /file/eligibility         ── Merged profile+eligibility: age, income type chips, income band → ITR form
        ↓
  /file/import/documents
  ... [same as fast path tail, + mismatch if needed]
```

**Result: 13 screens for standard path (down from 20)**

---

## 8. Phase 0 — Must-Fix Funnel Items (before launch)

These are defects that will cause real user drop-off or confusion in the current preview.

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| P0-1 | **Consent checkbox blocks progress with no explanation** | `/file/onboarding/signin` | Add "Why we need this →" link; or move consent to a less blocking position (e.g., inline with first data field) |
| P0-2 | **Plans page hard-locked with no manual override** | `/file/checkout/plans` | Add a "Override — I'll proceed at my own risk" escape hatch when `filingReady=false` due to engine failure. Engine failure should not hard-block payment. |
| P0-3 | **Mismatch blocker has no "proceed at risk" path** | `/file/import/mismatch` | Add "My documents are correct — file with explanation" secondary CTA that sets `mismatchResolved=true` with a warning banner persisted through to checkout. |
| P0-4 | **Cabrain path is dead but referenced in routing logic** | `lib/store/draft.ts`, `app/file/regime/page.tsx`, `app/file/onboarding/eligibility/page.tsx` | Remove all `filingPath === "cabrain"` branches or add a UI trigger. Currently just dead code and confusing. |
| P0-5 | **`/file/companion` accessible without payment** | `app/file/companion/page.tsx` | Add explicit redirect: `if (!exportUnlocked) router.replace("/file/checkout/plans?reason=companion")`. Currently shows a broken-looking page with disabled export. |
| P0-6 | **Age band collected twice** | Profile → then again in Eligibility | Remove age band from `/file/onboarding/profile`; Eligibility already sets it via `handleAgeChange` which calls `setProfile`. |
| P0-7 | **E-verify method blocks checkout at presubmit** | `/file/review/presubmit` | Remove e-verify method from the presubmit blocking checklist (`canProceed` gate). Move to post-payment onboarding inside the companion. It's a future action (30 days after filing), not a pre-filing blocker. |
| P0-8 | **"Government portal companion" link on /file welcome** | `app/file/page.tsx` | Remove this link. Companion is not accessible or useful before completing at least the import section. |

---

## 9. Phase 1 — Funnel Improvements (post-launch)

These improve conversion and UX but are not launch blockers.

| # | Improvement | Impact |
|----|-------------|--------|
| P1-1 | **Merge Profile + Eligibility into a single screen** | Removes 1 screen + redirect; eliminates age band duplication |
| P1-2 | **Merge Signin + Profile** | "Who are you?" — PAN, consent, residential status on one screen; removes 1 screen |
| P1-3 | **Add "what happens next" copy to every CTA** | Reduces uncertainty at each transition; pattern: "Next: [short description]" below the primary CTA |
| P1-4 | **Show a free/preview tier option at checkout** | Add a "Continue with free estimate (no guide)" option at plans page; converts fence-sitters and reduces abandonment |
| P1-5 | **Mismatch zero-state fast path** | When `mismatchResolved=true` on initial load (happy path), auto-skip the mismatch page with a success banner merged into parsing page |
| P1-6 | **Merge Risk Review into Presubmit** | `/file/review/risk` and `/file/review/presubmit` are sequential and low-interaction. Single screen with confidence panel + checklist saves a step |
| P1-7 | **Merge Tracker into Companion footer** | Remove `/file/checkout/tracker` as a separate route; add a collapsible "Your filing checklist" section at the bottom of companion |
| P1-8 | **Senior mode toggle** | Add age-based auto-detection: if `profile.ageBand === "senior"` set `seniorMode=true` automatically. The infrastructure exists, just needs one line. |
| P1-9 | **Add estimated time to documents screen** | "~5 min with Form 16" / "~15 min manually" — reduces uncertainty at the heaviest input step |
| P1-10 | **Remove orphaned routes** | Delete `itr-path`, `case-matrix`, `support` (or link support from companion), `everify` pages from the app. |
| P1-11 | **Progress on bank + mismatch pages** | Bank page shows macroStep=2 but it's functionally step 3 (Reconcile). Mismatch page at macroStep=3. Bank should move to macroStep=3 for visual consistency. |
| P1-12 | **Plans page: surface what's blocked** | When `!filingReady`, show exactly which document or check is missing rather than sending users back to presubmit in a loop |

---

## 10. Funnel Approval

**Verdict: ⚠️ PARTIAL**

### What passes
- ✅ Form 16 fast path correctly bypasses onboarding and sets salaried defaults (`applySalariedFastPathDefaults`)
- ✅ Eligibility → ITR form recommendation is sound and covers edge cases (BLOCK for minors, ITR-2 for capital gains)
- ✅ Regime comparison is live and connected to the tax engine — the product's strongest differentiator
- ✅ Mismatch resolution flow (documents → parsing → bank → mismatch → mismatch/[id] → tds) is logically correct
- ✅ Payment gate is properly implemented: `paymentVerifiedAt` checked before companion export
- ✅ MacroStepper correctly maps steps 1–6 across all pages
- ✅ No circular redirects detected in the primary paths

### What fails
- ❌ **Cabrain path is dead code** — `setFilingPath("cabrain")` never called from any UI; all cabrain-conditional routing branches are unreachable
- ❌ **Senior mode is dead code** — `setSeniorMode(true)` never called; the feature renders but is never triggered
- ❌ **3 hard blockers** (consent, mismatch, filingReady) with no escape hatch — any of these can permanently strand a real user
- ❌ **Age band collected twice** — Profile and Eligibility both collect it; Eligibility overwrites Profile's value
- ❌ **Companion accessible pre-payment** — shows disabled/broken state instead of directing to checkout
- ❌ **20 screens on standard path** — excessive for a deadline-driven filing product; comparable tools (ClearTax, Quicko) achieve equivalent in 10–12 screens
- ❌ **Orphaned routes** (`everify`, `itr-path`, `case-matrix`) add maintenance burden and confusion in nav
- ❌ **Missing "what happens next"** copy on 9 of the 20 screens

### Score: 6 / 10
The skeleton is correct and the routing logic is mostly sound. The funnel will work for a determined tech-savvy user on the Form 16 path. It will strand a meaningful percentage of real users at the consent, mismatch, or filingReady gates. Phase 0 fixes are required before public traffic. Phase 1 reduces a 20-screen journey to the target 11–13.

---

*Evidence base: 27 route files read directly. No roadmap documents used as evidence. All routing assertions verified from `router.push()`, `href=`, and `redirect()` calls in source.*
