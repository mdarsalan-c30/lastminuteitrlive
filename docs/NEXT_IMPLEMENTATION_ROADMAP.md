# NEXT_IMPLEMENTATION_ROADMAP.md
## LastMinute ITR — CEO Consolidation & Implementation Decision

**Author:** Agent 7 — CEO Consolidation  
**Date:** 2026-06-10  
**Method:** Synthesis of all six audit docs (Agents 1–6). Evidence cited by file path and verdict.  
**Status:** Authoritative decision document for Phase 0 implementation.

---

## Part 1 — Master Scoring Table

| Category | Score /10 | Verdict | Top Reason for Score |
|---|---|---|---|
| **UI/UX** | 5.9 | ⚠️ PARTIAL PASS | Zero mobile nav on marketing site and filing app; static "What This Means" aside; technical jargon ("Running Python L1 engine") shown to users. `SiteHeader.tsx:26`, `FilingLayout.tsx:71` |
| **Funnel** | 6.0 | ⚠️ PARTIAL | 20 screens on standard path; 3 hard blockers with no escape hatch; `/file/companion` accessible pre-payment shows broken state; cabrain path dead code never reachable from any UI |
| **Tax Engine** | 8.5 | ✅ PASS (with gaps) | Python L1 engine has 450 passing tests, real regime comparison with binary-search breakeven, all income heads covered. **Gaps:** `python3` PATH unresolved on Vercel serverless; FD interest doesn't flow into 80TTB for seniors; `has_form16` always hardcoded `true` in `draftToUserInput.ts:55` inflating confidence by 35 pts |
| **Companion Mode** | 8.0 | ✅ PASS | `data/portal_steps.json` has 163 real steps across ITR-1/3/4; `mergeValues.ts` resolves real engine values into companion; payment gate logic is correct. Minor: no ERI auto-submit is accurate and well-disclosed |
| **Compliance** | 6.5 | ⚠️ PARTIAL | No prohibited claims (guaranteed refund, auto-file, 100% accurate) — this is genuinely strong. FAILS on: seeded social proof shown as real (`VERIFIED_FILER_COUNT=6`, `AGGREGATE_RATING=4.8` in `lib/constants.ts:24–26`); JSON-LD claims 128 reviews @ 4.9 while UI shows 6 @ 4.8 (`LandingJsonLd.tsx`) — Google rich-result penalty risk; CA plan sells "Expert sign-off" / "48-hour turnaround" as active on checkout but CaBrain is "coming soon" |
| **Payment** | 5.0 | 🔴 FAIL | **CRITICAL SECURITY BUG:** `app/api/payments/verify/route.ts:27` accepts `mock: true` from client POST body with no server-side `NODE_ENV` or key guard. Any user can bypass Razorpay and set themselves as "paid CA plan" via a direct curl. Access gating is entirely client-side localStorage (`lib/store/draft.ts:179`) — no server session token |
| **SEO** | 4.5 | ⚠️ PARTIAL | Technical foundation solid (sitemap, robots, SSG). FAILS: 4 articles, 38 ultra-thin glossary pages (~40–120 words each = Google thin content risk), no `og:image` anywhere, no canonical tags on article/glossary pages, production URL is 404 at the time of audit |
| **QA** | 4.0 | 🔴 FAIL | `npm run lint` broken (`nextVitals is not iterable`); no frontend unit tests (`npm test` missing); engine CI workflow points to wrong directory (`../itr-filing-wireframes/sources/engine` not `engine/`); E2E 3/4 pass; CI is permanently red |
| **Production Readiness** | 4.5 | 🔴 FAIL | Vercel preview URL returns HTTP 401 for all routes (Deployment Protection / SSO); Python `python3` on Vercel serverless PATH not confirmed; lint broken; analytics wired to `noopAnalyticsProvider` — zero funnel data collected in production |
| **Founder Confidence** | 6.5 | ⚠️ QUALIFIED | Engine is real and impressive. Companion is genuinely differentiated. UI design quality is above average for v1 fintech. But: one payment bypass exploit, fake social proof shown as real, document parser is 100% mock (users filing with hardcoded ₹12L salary / ₹85K TDS), and nobody can reach the product publicly right now. Fix these five items and founder confidence rises to 8.5+ |

**Composite: 5.95 / 10 — DO NOT SHIP AS-IS**

---

## Part 2 — What Is Broken, Fake, or Misleading

### 🔴 CRITICAL — Would harm real users or enable fraud

**1. Payment Mock Bypass — Security Exploit (HIGH)**
- **File:** `app/api/payments/verify/route.ts:27`
- **Evidence:** `if (mock || razorpay_order_id.startsWith("order_mock_") || razorpay_order_id.startsWith("order_free_"))` — `mock` flag comes from client POST body with no server-side guard
- **Harm:** Any user sends `POST /api/payments/verify` with `{ mock: true, planId: "ca" }` → receives `{ verified: true }` → sets localStorage `paymentVerifiedAt` → full CA plan access. In production this is a revenue bypass vulnerability.
- **Verdict from Agent 5:** Issue #3, Severity HIGH

**2. Fake Social Proof Displayed as Real Metrics (COMPLIANCE)**
- **Files:** `lib/constants.ts:24–26`, `components/marketing/TrustBar.tsx:42–53`
- **Evidence:** `VERIFIED_FILER_COUNT = 6` with code comment: "Verified filers from seeded testimonials — update when real analytics exist." Displayed as "6 verified filers this season." `AGGREGATE_RATING = 4.8` is hardcoded, not from analytics.
- **JSON-LD mismatch:** `LandingJsonLd.tsx` claims `aggregateRating.ratingValue: "4.9"` and `reviewCount: "128"` while UI shows 6 @ 4.8. This is a Google rich-result penalty risk.
- **Testimonials:** `lib/content/testimonials.ts` — illustrative personas with no disclosure ("Priya Sharma, Product manager, Bengaluru").
- **Verdict from Agent 5:** Issue #5, §9 FAIL

**3. Python Engine Won't Run on Vercel Serverless (DEPLOYMENT BLOCKER)**
- **File:** `app/api/compute/route.ts:23–26`
- **Evidence:** Route spawns `python3 scripts/compute_cli.py` as subprocess. Vercel serverless functions do not include Python by default.
- **Harm:** `/api/compute` silently returns HTTP 500 in production. The entire tax calculation flow — regime comparison, confidence score, risk flags — fails for all production users. The app falls back to `fallbackConfidenceFromDraft` which hardcodes `has_form16: true` (inflating confidence by 35 points for all users).
- **Verdict from Agent 3:** Deployment risk documented. Must resolve before production.

**4. Document Parser is 100% Fake — Silent Data Corruption Risk (HIGH)**
- **File:** `app/api/documents/upload/route.ts` (entire file)
- **Evidence from Agent 3:** "The route reads the file Blob, looks up a hardcoded `MOCK_FIELDS` dictionary keyed by `connectorId`, and returns fixed numbers (e.g. `grossSalary: 1200000`, `tds: 85000`). Uploaded file bytes are never read or parsed."
- **Parsing page:** `app/file/import/parsing/page.tsx:20–21` displays "We imported 18 fields with high confidence. Please review 3 fields marked for confirmation." — static text with no reference to demo data.
- **User harm:** User uploads real Form 16 → engine runs on ₹12L salary / ₹85K TDS defaults → regime comparison and companion guide show wrong figures → user files on portal using incorrect computed values.
- **Mitigation present:** Amber banner in `ConnectorGrid.tsx:218–223` says "Demo parsing… verify every figure against your documents." But parsing page does NOT repeat this — user arriving downstream sees "high confidence" import.

**5. Companion Page Accessible Pre-Payment — Shows Broken State**
- **File:** `app/file/companion/page.tsx`
- **Evidence from Agent 2:** "No redirect away from unpaid users — it shows the guide table but `exportUnlocked=false`. Users may think the product is broken rather than paywalled."
- **Fix:** `if (!exportUnlocked) router.replace("/file/checkout/plans?reason=companion")`

### 🟠 HIGH — Will cause drop-off with real users

**6. No Mobile Navigation — Zero Fallback (CRITICAL UX)**
- **Files:** `components/marketing/SiteHeader.tsx:26`, `components/filing/FilingLayout.tsx:71`
- **Evidence from Agent 1:** `<nav className="hidden items-center gap-1 text-sm sm:flex">` — hidden below 640px with no hamburger, no sheet, no bottom bar. On mobile: logo + one CTA only. Users cannot reach Pricing, Reviews, Learn, or the filing funnel entry on a phone.
- **Filing app:** `<nav className="hidden items-center gap-1 md:flex">` — entire section nav hidden on mobile.

**7. Technical Jargon in User-Facing Copy**
- **Files:** `app/file/regime/page.tsx:41`, `components/filing/EngineProgressBar.tsx`, `app/file/companion/page.tsx:~80`, `app/file/review/risk/page.tsx:21`
- **Copy shown to users:** "Running Python L1 engine…", "Layer 1 · Engine progress", "No ERI auto-submit in this release", "from Layer 1 engine output"
- **Verdict from Agent 1:** Technical phrases that 45+ year-old salaried taxpayers will find alienating.

**8. 3 Hard Funnel Blockers with No Escape Hatch**
- **Evidence from Agent 2:**
  - Consent checkbox at `/file/onboarding/signin`: `disabled={!consentGiven}` — no "why we need this" link, no skip option
  - Mismatch gate at `/file/import/mismatch`: `disabled={!mismatchResolved}` — user with real salary mismatch is permanently stuck, process takes days; no "proceed at risk" CTA
  - Plans locked at `/file/checkout/plans`: `filingReady = confidence.filing_ready && mismatchResolved` — engine failure completely blocks checkout with no manual override
- **Risk:** Any of these can permanently strand a real first-time user.

**9. CA Plan Sells Features That Don't Exist Yet**
- **Files:** `lib/payments/plans.ts:57–67`, `components/pricing/PlanCard.tsx`, `app/file/checkout/plans/page.tsx`
- **Evidence from Agent 5:** CA plan shows "Expert sign-off", "48-hour turnaround" as active features on checkout. Disclosure only appears after checkout (`app/file/cabrain/page.tsx:24–29`).
- **Risk:** User pays ₹2,499 expecting human CA review; feature is a "coming soon" placeholder.

**10. CI Is Permanently Broken**
- **Files:** `.github/workflows/ci.yml`, `.github/workflows/engine-tests.yml`, `eslint.config.mjs`
- **Evidence from Agent 6:** `npm run lint` fails with `nextVitals is not iterable`. CI runs lint → CI is always red. Engine workflow points to `../itr-filing-wireframes/sources/engine` (external path), so engine tests never run in CI.

### 🟡 MEDIUM — Real but not blocking for first 100 users

**11. FD Interest Not Mapped to 80TTB in Engine**
- **Files:** `lib/engine/draftToUserInput.ts:43`, `engine/orchestrator.py:39–43`
- **Evidence from Agent 3:** `fdInterest → other_income.fd_interest` is mapped, but `deductions.savings_interest_deduction` is never set from `fdInterest`. Senior taxpayers see correct deduction on UI; engine calculates 0 for 80TTB on FD interest.

**12. Hardcoded ₹17,000 Refund on Payment/Tracker Pages**
- **Files:** `app/file/checkout/payment/page.tsx:31`, `app/file/checkout/tracker/page.tsx:34`
- **Evidence from Agent 5:** Issue #7 — hardcoded value regardless of user's actual computed refund. Properly qualified ("if ITD accepts") so low compliance risk, but jarring for users with ₹0 refund.

**13. `has_form16` Always True — Confidence Inflation**
- **File:** `lib/engine/draftToUserInput.ts:55`
- **Evidence from Agent 3:** Hardcodes `documents: { has_form16: true }` regardless of actual upload state. Inflates confidence by 35 points for all users.

**14. OTP Field at Sign-in Step — Confusing**
- **File:** `app/file/onboarding/signin/page.tsx:38–44`
- **Evidence from Agent 1:** "Optional for now" OTP field serves no function at this step. Creates confusion about whether auth is required. 30-minute fix.

**15. No Analytics Connected**
- **File:** `lib/analytics/provider.ts:11–14`
- **Evidence from Agent 3:** `noopAnalyticsProvider` by default — funnel events defined and called but never sent externally. `setAnalyticsProvider()` never called in codebase. Zero funnel data collected in production.

---

## Part 3 — Priority Roadmap

### PHASE 0 — Must Fix Before Any Real Users

*Nothing in Phase 0 involves the document parser or new features — these are safety/security/trust fixes. Estimated: 2–3 days of focused engineering.*

| # | Issue | Owner Agent | Files Involved | Why It Matters | Acceptance Criteria | Risk If Ignored |
|---|-------|-------------|----------------|----------------|---------------------|-----------------|
| P0-1 | **Remove payment mock bypass** | New security agent or Agent 5 | `app/api/payments/verify/route.ts:27` | Revenue bypass exploit — any user can get CA plan free via a curl command | `mock` flag from client body is ignored in production; guard with `if (!hasRazorpayKeys() && process.env.NODE_ENV !== 'production')` or remove entirely; server confirms order via Razorpay API only | Fraud. Revenue loss. |
| P0-2 | **Remove/relabel fake social proof** | Agent 1 or Agent 5 | `lib/constants.ts:24–26`, `components/marketing/TrustBar.tsx`, `LandingJsonLd.tsx` | Seeded metrics displayed as real; JSON-LD mismatch is a Google penalty risk | Remove `VERIFIED_FILER_COUNT` and `AGGREGATE_RATING` from public display OR label as "beta testers"; fix JSON-LD to match actual count (6) or remove AggregateRating schema | Google rich-result penalty; regulatory risk if challenged |
| P0-3 | **Add demo disclaimer to parsing page** | Agent 1 | `app/file/import/parsing/page.tsx:20–21` | Users arrive at parsing page seeing "18 fields imported with high confidence" — no indication it's demo data | Add amber banner identical to ConnectorGrid's (`role="status"`, "Demo data — verify all figures against your actual documents before filing") at the top of parsing page | Users file with ₹12L mock salary; compliance/trust disaster |
| P0-4 | **Confirm Python on Vercel / add fallback** | New deployment agent | `app/api/compute/route.ts`, `vercel.json` | Engine calls `python3` subprocess; Vercel serverless has no Python by default — all tax calculations fail silently | Either: (a) confirm python3 available via Vercel build step + test `/api/compute` on production, OR (b) add explicit error response + UI message when engine unavailable; no silent failure | Entire value prop fails invisibly in production |
| P0-5 | **Gate companion page behind payment** | Agent 2 | `app/file/companion/page.tsx` | Pre-payment users see disabled/broken companion; they assume app is broken not paywalled | Add `if (!exportUnlocked) router.replace("/file/checkout/plans?reason=companion")` at top of companion page | Users exit thinking product is broken |
| P0-6 | **Fix lint / CI** | Agent 6 | `eslint.config.mjs`, `.github/workflows/ci.yml`, `.github/workflows/engine-tests.yml` | CI is permanently red; lint is broken; engine tests never run in CI | `npm run lint` exits 0; CI goes green on push; engine-tests.yml uses `working-directory: engine` | Broken CI = no safety net for all future changes |
| P0-7 | **Lift Vercel Deployment Protection** | Founder action + Agent 6 | Vercel dashboard (not code) | Production URL returns 401 for all routes; no one can access the product, QA it, or share a link | HTTP 200 on all marketing + filing routes from unauthenticated browser; confirm on mobile viewport | Product is inaccessible. Cannot get real user feedback. |
| P0-8 | **CA plan: disable or label "coming soon"** | Agent 5 | `lib/payments/plans.ts:57–67`, `components/pricing/PlanCard.tsx`, `app/file/checkout/plans/page.tsx` | CA plan sells "Expert sign-off" and "48-hour turnaround" as active; feature is a placeholder | Add `(Launching soon)` badge to CA plan features OR disable CA plan from checkout until CaBrain is live | Consumer protection risk; reputation damage if user pays and gets nothing |
| P0-9 | **Add mobile nav** | Agent 1 | `components/marketing/SiteHeader.tsx`, `components/filing/FilingLayout.tsx` | Zero fallback navigation on mobile — the dominant device in India; users cannot reach Pricing, Reviews, or filing entry on a phone | Hamburger + Sheet in SiteHeader for <640px; sticky bottom tab bar in FilingLayout for <768px | Every mobile user bounces at step 1 |
| P0-10 | **Strip technical jargon from all user-facing copy** | Agent 1 | `app/file/regime/page.tsx:41`, `components/filing/EngineProgressBar.tsx`, `app/file/companion/page.tsx:~80`, `app/file/review/risk/page.tsx:21` | "Running Python L1 engine", "Layer 1 engine progress", "No ERI auto-submit in this release" are visible to taxpayers | Zero instances of "Python", "L1", "Layer 1", "engine" in user-facing UI text; replace with: "Calculating your best regime…", "Tax checks running…", "Manual filing guide" | 45+ year-old salaried users exit confused; product looks broken/unfinished |

---

### PHASE 1 — Must Fix Before Paid Traffic

*These are conversion and trust items that compound with any marketing spend. Estimated: 1–2 sprints.*

| # | Issue | Owner Agent | Files Involved | Why It Matters | Acceptance Criteria |
|---|-------|-------------|----------------|----------------|---------------------|
| P1-1 | **Wire actual computed refund to payment/tracker** | Agent 3 | `app/file/checkout/payment/page.tsx:31`, `app/file/checkout/tracker/page.tsx:34` | Hardcoded ₹17,000 regardless of user's actual refund; jarring for users with zero/negative payable | Use `useDraftTaxCompute()` result; display actual `net_payable` from engine with qualification copy |
| P1-2 | **Fix `has_form16` always-true in draftToUserInput** | Agent 3 | `lib/engine/draftToUserInput.ts:55` | Confidence inflated by 35 pts for all users regardless of upload | Set `has_form16` only when Form 16 connector is actually connected in draft store |
| P1-3 | **Fix FD interest → 80TTB engine mapping** | Agent 3 | `lib/engine/draftToUserInput.ts`, `engine/orchestrator.py:39–43` | Senior taxpayers see correct deduction in UI but engine applies 0 for FD-sourced 80TTB | Map `draft.income.fdInterest` to `deductions.savings_interest_deduction` for senior age bands |
| P1-4 | **Add escape hatches to all 3 hard blockers** | Agent 2 | `/file/onboarding/signin`, `/file/import/mismatch`, `/file/checkout/plans` | Real users get permanently stranded at consent, mismatch, or filingReady gates | (a) Add "Why we need this →" link at consent; (b) "Proceed with explanation" secondary CTA at mismatch; (c) Manual override when engine failure (not low-confidence) causes filingReady=false |
| P1-5 | **Per-page `mirrorText` in FilingLayout aside** | Agent 1 | All callers of `FilingLayout`, `components/filing/FilingLayout.tsx` | Aside panel shows identical boilerplate on every page; empty promise of contextual help | Every major filing page passes a specific `mirrorText` relevant to what user is doing on that screen |
| P1-6 | **Remove OTP field from sign-in** | Agent 1 | `app/file/onboarding/signin/page.tsx:38–44` | Serves no function; creates confusion about auth requirements | Delete PlainEnglishField OTP input; remove from page entirely |
| P1-7 | **Regime card loading skeleton** | Agent 1 | `app/file/regime/page.tsx` | Both cards show "Net payable ₹0" during load — looks broken | Animated skeleton cards while `loading === true` instead of disabled zero-state cards |
| P1-8 | **Wire analytics provider** | Agent 3 | `lib/analytics/provider.ts`, `lib/analytics/index.ts` | Zero funnel data collected in production; cannot measure conversion or debug drop-off | Connect PostHog or Mixpanel via `setAnalyticsProvider()`; confirm events fire on: `form16_upload`, `paywall_view`, `plan_select`, `payment_success` |
| P1-9 | **Merge Profile + Eligibility screens** | Agent 2 | `app/file/onboarding/profile/page.tsx`, `app/file/onboarding/eligibility/page.tsx` | Age band collected twice; Profile adds only residential status as unique data; 2 extra screens on 20-screen path | Combine into single "About you" screen; remove age band from Profile since Eligibility already sets it |
| P1-10 | **Reframe checkout locked state** | Agent 1 | `app/file/checkout/plans/page.tsx:46–55` | Amber warning leads the page, buries PaywallValueStack; feels punitive | Change to info-blue; move below value stack; add "You're X% there" progress; link directly to blocking step |
| P1-11 | **Senior mode auto-detect** | Agent 2/3 | `lib/store/draft.ts`, `app/file/other/page.tsx` | `setSeniorMode(true)` never called from any UI; feature is dead despite infrastructure existing | If `profile.ageBand === "senior"` or `"super_senior"`, automatically set `seniorMode=true` in store |
| P1-12 | **Fix Playwright e2e assertion** | Agent 6 | `e2e/smoke.spec.ts:53` | 1/4 e2e failing due to strict-mode violation (both elements visible simultaneously) — test bug | Change `.or()` assertion to use `.first()` or assert both elements intentionally; all 4 e2e pass |
| P1-13 | **Add `typecheck` and `test` scripts to package.json** | Agent 6 | `package.json` | No `npm run typecheck` or `npm test` scripts; CI coverage gap | Add `"typecheck": "tsc --noEmit"` and a Vitest suite for store/API handler/critical logic |
| P1-14 | **Add canonical + og:image to all public pages** | Agent 4 | `app/learn/[slug]/page.tsx`, `app/glossary/[term]/page.tsx`, root layout | No `og:image` anywhere (all social shares render blank); no canonical tags on 40+ indexed pages | 1200×630 og:image in root layout; `alternates.canonical` on every article and glossary page |

---

### PHASE 2 — Growth and Scale

*These ship after product has real users and stable CI.*

| # | Issue | Notes |
|---|-------|-------|
| P2-1 | **Ship first 25 SEO articles** | Agent 4 priority list: `itr-deadline-2026`, `form-16-guide`, `ais-vs-26as`, `new-regime-slabs-2026`, `87a-rebate-new-regime`. 1,200–1,800 words each, Article schema, canonical, CTA to filing funnel |
| P2-2 | **Expand top 10 glossary terms to 400+ words** | Currently 40–120 words = thin content risk. Expand before July filing season. Noindex until `extendedBody >= 300` words |
| P2-3 | **Homepage "Popular guides" section** | Link top 4 existing articles from homepage body; add contextual CTAs on articles pointing to `/file/import/documents?source=form16` |
| P2-4 | **Add 3 dedicated landing pages** | `/itr-deadline-2026`, `/old-vs-new-regime`, `/form-16-filing` — aligned with highest commercial intent queries |
| P2-5 | **Funnel screen reduction** | Merge Signin+Profile → one screen; merge Risk+Presubmit → one screen; merge Tracker → Companion footer; target 11 screens for Form 16 path (from 16) |
| P2-6 | **Server-side payment session** | Current access gate is entirely localStorage; introduce server-validated JWT or session cookie after payment verify; removes client-side-only vulnerability (Agent 5 Issue #4) |
| P2-7 | **Star rating widget on reviews page** | Replace Slider with 5 clickable star icons (`app/reviews/page.tsx`); add Article schema + BreadcrumbList on learn pages |
| P2-8 | **Frontend unit test suite (Vitest)** | Cover: `lib/store/draft.ts` reducers, `lib/filing/routes.ts`, `lib/payments/access.ts`, `draftToUserInput`, confidence hooks |
| P2-9 | **Header Glossary + Resources nav** | Add Glossary to site header; optional Resources dropdown (Learn, Glossary, Reviews); every article → 3 glossary links + 1 product CTA |
| P2-10 | **Reframe footer disclaimer** | `components/marketing/SiteFooter.tsx`: "Not affiliated with the Income Tax Department" → "Independently operated. You file directly on the official incometax.gov.in portal." |

---

### PHASE 3 — Advanced Tax Intelligence

*These are product depth items, not launch blockers.*

| # | Feature | Prerequisite | Notes |
|---|---------|-------------|-------|
| P3-1 | **Real document parser (Form 16 PDF)** | Phase 0 complete | The highest-impact engineering investment. Until live, maintain clear demo mode. Consider integrating a PDF parser library or an OCR service. Do not undermine trust by implying current parsing is real. |
| P3-2 | **CA Brain (Layer 2)** | Real parser + stable engine | `engine/orchestrator.py:build_layer2_handoff()` is wired on engine side. UI/LLM consumer doesn't exist. Build after parser is real and CA plan is active. |
| P3-3 | **ERI / ITD portal integration** | Legal + regulatory review | Currently correctly labelled "coming soon." Do not accelerate without compliance review of ERI integration requirements. |
| P3-4 | **Broker connects (Groww, Zerodha, MFCentral)** | Phase 2 SEO + parser | Labelled "coming soon" — correct. Capital gains use case is Phase 3. Build once ITR-1 salaried flow is validated. |
| P3-5 | **AIS auto-import** | Real parser + ERI | Highest trust value-add after Form 16. Requires secure token handling for ITD API. |
| P3-6 | **80TTB auto-calculation in draftToUserInput** | Phase 1 fix P1-3 | After FD interest mapping is fixed, validate that senior + high FD interest edge cases match engine output correctly. |

---

## Part 4 — Final CEO Decision

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   DECISION: APPROVE PHASE 0 IMPLEMENTATION                       ║
║                                                                  ║
║   — with mandatory security fix P0-1 (payment bypass) as        ║
║     the single absolute blocker above all else.                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

### Rationale

**The engine is real.** 450 passing tests, correct regime comparison, 14 risk flags, 163 companion steps, proper capital gains/deduction/surcharge/87A handling — this is not a demo. The core intellectual property is solid and the architecture is correct.

**The product has genuine differentiation.** AIS mismatch resolution, regime comparison with binary-search breakeven, and the companion portal guide are all features no competitor currently offers in this form. The PaywallValueStack design and PlainEnglishField pattern are above-average for v1 fintech.

**But five things cannot ship to real users:**

1. **The payment bypass exploit** (`app/api/payments/verify/route.ts:27`) is a revenue fraud vector. Fix this before one user creates an account.
2. **Fake social proof shown as real** (`lib/constants.ts:24–26`, `LandingJsonLd.tsx`) — 6 seeded testimonials displayed as "6 verified filers" and JSON-LD claiming 128 reviews at 4.9. This is compliance exposure.
3. **Python on Vercel** — the entire tax engine silently fails in production unless `python3` is on PATH. Confirm or add a build step.
4. **The parsing page shows "high confidence" import with no demo caveat** — users could proceed to file with ₹12L hardcoded salary. The upstream ConnectorGrid banner is not enough.
5. **The product is behind Deployment Protection (HTTP 401)** — nobody can access it.

**Phase 0 is not a feature sprint.** It is 10 targeted fixes across security, trust, deployment, and mobile UX. It can be completed in 2–3 focused days by 2 agents working in parallel. After Phase 0, the product is safe to give to real users for feedback, and Phase 1 begins.

**Do not approve Phase 1 or spend on paid traffic until Phase 0 is green.**

---

## Part 5 — Exact Next Cursor Implementation Prompt

Copy-paste this prompt to start Phase 0 implementation. **No app code is in this document — the prompt text is the artifact.**

---

```
PHASE 0 IMPLEMENTATION — LastMinute ITR
Read /Users/nikhilanand/Downloads/Cursor/lastminute-itr/docs/NEXT_IMPLEMENTATION_ROADMAP.md
before writing any code. Do NOT modify any audit docs. Only modify app source files.

You are implementing ALL of the following Phase 0 items. Complete them in order.
Run `npm run build` after each item to confirm nothing is broken.

---

ITEM P0-1 — Fix payment mock bypass (SECURITY — do this first)
File: app/api/payments/verify/route.ts
Issue: Line 27 accepts `mock: true` from client POST body with no server-side guard.
Fix: Remove the `mock` field from the accepted request body schema. 
The `order_mock_` prefix check should only pass when RAZORPAY_KEY_ID is not set 
(dev environment). In production (when RAZORPAY_KEY_ID is set), all payments must 
go through real Razorpay signature verification. Never trust `mock: true` from client.
Implementation:
  const hasRazorpayKeys = !!process.env.RAZORPAY_KEY_ID;
  const isMockAllowed = !hasRazorpayKeys; // dev only
  if (isMockAllowed && razorpay_order_id.startsWith("order_mock_")) { /* dev path */ }
  // Remove: `|| mock` from the condition entirely

---

ITEM P0-2 — Remove fake social proof displayed as real
Files: lib/constants.ts, components/marketing/TrustBar.tsx, components/marketing/LandingJsonLd.tsx
Issue: VERIFIED_FILER_COUNT=6 and AGGREGATE_RATING=4.8 are seeded, not real.
JSON-LD claims 128 reviews @ 4.9; UI shows 6 @ 4.8.
Fix:
  a) In TrustBar.tsx: Remove the "X verified filers this season" badge entirely, 
     OR change copy to "Beta filers" with no numeric claim until real analytics exist.
  b) Remove AGGREGATE_RATING from any public-facing display or add "(beta)" qualifier.
  c) In LandingJsonLd.tsx: Remove the AggregateRating block entirely from JSON-LD, 
     OR set ratingValue/reviewCount to match the 6 seeded testimonials exactly.
  d) In lib/content/testimonials.ts: Add a comment and UI micro-disclosure: 
     "Illustrative examples based on typical use cases."

---

ITEM P0-3 — Add demo disclaimer to parsing page
File: app/file/import/parsing/page.tsx
Issue: Page says "We imported 18 fields with high confidence" with no demo caveat.
Fix: Add an amber Banner component at the very top of the page content (before the 
field list), identical in intent to ConnectorGrid's demo disclaimer:
  "Demo parsing — all figures shown are sample data. 
   Verify every amount against your actual Form 16 before filing."
Use the existing Banner component from components/filing/ui.tsx with variant="warning".

---

ITEM P0-4 — Confirm Python availability on Vercel / add graceful failure
File: app/api/compute/route.ts
Issue: Route spawns `python3` subprocess; Vercel serverless has no Python by default.
Fix:
  a) Add a health-check test: confirm python3 is available on deploy environment.
     Add to vercel.json or build script: a pre-deploy step that verifies `python3 --version`.
  b) If python3 is not confirmed available, add explicit error handling in route.ts:
     If the subprocess fails to spawn (ENOENT), return HTTP 503 with body:
     { ok: false, error: "Tax engine unavailable", code: "ENGINE_UNAVAILABLE" }
  c) In useTaxCompute.ts: handle ENGINE_UNAVAILABLE code specifically, show a 
     user-friendly banner: "Tax calculation temporarily unavailable. Your progress 
     is saved. Please try again in a moment." — not a silent fallback.
  d) DO NOT silently fallback to fallbackConfidenceFromDraft when the engine fails —
     users must know the calculation is estimated, not computed.

---

ITEM P0-5 — Gate companion page behind payment
File: app/file/companion/page.tsx
Issue: Pre-payment users see disabled companion instead of being redirected.
Fix: Near the top of the component (after store reads), add:
  if (!exportUnlocked) {
    router.replace("/file/checkout/plans?reason=companion");
    return null;
  }
This prevents the broken-looking disabled companion from rendering at all.

---

ITEM P0-6 — Fix lint and CI
Files: eslint.config.mjs, .github/workflows/ci.yml, .github/workflows/engine-tests.yml
Issue: npm run lint fails with "nextVitals is not iterable"; engine CI uses wrong path.

a) Fix eslint.config.mjs: Remove the spread of `eslint-config-next/core-web-vitals` 
   as a flat config array. Use the correct flat config pattern for Next.js 15+:
   import { dirname } from "path";
   import { fileURLToPath } from "url";
   import { FlatCompat } from "@eslint/eslintrc";
   const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });
   export default [...compat.extends("next/core-web-vitals")];

b) Fix .github/workflows/engine-tests.yml: Change:
   working-directory: ../itr-filing-wireframes/sources/engine
   To:
   working-directory: engine
   This makes engine pytest run against the actual in-repo engine/ directory.

c) Add to package.json scripts:
   "typecheck": "tsc --noEmit",
   "test": "vitest run" (or "echo 'No unit tests yet' && exit 0" as a placeholder)

d) Update ci.yml to add after lint: `npm run typecheck`

Verify: `npm run lint` exits 0. `npm run build` still passes.

---

ITEM P0-7 — Lift Vercel Deployment Protection
This is a Vercel dashboard action (not a code change).
Instructions for founder:
  1. Go to vercel.com/dashboard → Project → Settings → Deployment Protection
  2. Disable "Vercel Authentication" protection on the production deployment
  3. Re-run: curl -I https://lastminute-busb7ssn6-nikhil-anand-s-projects12.vercel.app
     Expected: HTTP 200, not 401
  4. Confirm all marketing routes (/learn, /glossary, /reviews) return 200
  Note in code: Set NEXT_PUBLIC_APP_URL in Vercel env vars to the actual production domain.

---

ITEM P0-8 — Disable or clearly label CA plan as "coming soon"
Files: lib/payments/plans.ts, components/pricing/PlanCard.tsx, app/file/checkout/plans/page.tsx
Issue: CA plan ("Expert sign-off", "48-hour turnaround") sold as active feature.
Fix (choose one approach):
  Option A (recommended): Add a `comingSoon: true` flag to the CA plan in plans.ts.
    In PlanCard.tsx: if comingSoon, render features with a "(Launching soon)" suffix 
    on "Expert sign-off" and "48-hour turnaround". Disable the checkout CTA for CA plan
    with copy "Join waitlist →" linking to a waitlist form or email capture.
  Option B (simpler): Remove CA plan from PLAN_LIST filter in checkout grid entirely
    until CaBrain is live. Keep it in PricingSection with "(Coming soon)" badge.
Do NOT allow users to complete payment for the CA plan until the feature exists.

---

ITEM P0-9 — Add mobile navigation
Files: components/marketing/SiteHeader.tsx, components/filing/FilingLayout.tsx

a) SiteHeader.tsx: 
   - Import Sheet, SheetContent, SheetTrigger from "@/components/ui/sheet"
   - Import Menu from "lucide-react"
   - Add a Menu icon button visible only below sm: `<Button variant="ghost" size="icon" className="sm:hidden">`
   - Inside SheetContent: render the same 4 nav items vertically (Learn, Pricing, Reviews, File ITR)
   - Sheet opens/closes with useState

b) FilingLayout.tsx:
   - Add a sticky bottom navigation bar visible only on mobile: `className="fixed bottom-0 left-0 right-0 flex md:hidden border-t bg-background z-50"`
   - Show the 4 macro section icons+labels: File, Import, Review, Pay
   - Each tab links to the appropriate route in the current filing path
   - Active state: highlight based on current pathname

---

ITEM P0-10 — Strip all technical jargon from user-facing copy
Files: app/file/regime/page.tsx, components/filing/EngineProgressBar.tsx, 
       app/file/companion/page.tsx, app/file/review/risk/page.tsx

Search the entire app/ and components/ directory for these strings and replace:
  "Running Python L1 engine…" → "Calculating your best tax regime…"
  "Layer 1 · Engine progress" → "Tax analysis progress"  
  "Layer 1 engine" → "tax engine" (or remove entirely)
  "L1 engine" → remove
  "No ERI auto-submit in this release" → "Manual filing guide — you file on the portal"
  "from Layer 1 engine output" → "from your tax analysis"
  "CA-style summary" (in risk page subtitle) → "Your filing summary"

Zero instances of "Python", "L1", "Layer 1", or "ERI auto-submit" should appear in 
any user-facing UI text after this change. These are internal implementation details.

---

VERIFICATION CHECKLIST (run after all P0 items):

[ ] npm run lint exits 0
[ ] npm run build exits 0 (82 pages, no TypeScript errors)  
[ ] npm run test:e2e — all 4 tests pass
[ ] curl -X POST /api/payments/verify -d '{"mock":true,"planId":"ca"}' → NOT verified: true
[ ] No "Python", "L1", "Layer 1" found via grep in app/ or components/
[ ] /file/companion redirects to /file/checkout/plans when not paid
[ ] TrustBar shows no hard-coded filer count / aggregate rating as a real metric
[ ] Parsing page shows demo disclaimer banner
[ ] SiteHeader shows hamburger menu on mobile viewport (<640px)
[ ] FilingLayout shows bottom tab bar on mobile viewport (<768px)
[ ] CA plan checkout CTA is disabled or shows "Join waitlist"
[ ] JSON-LD AggregateRating removed or matches actual review count
```

---

*Document produced by Agent 7 — CEO Consolidation. Evidence sourced from: NEXT_UI_UX_AUDIT.md (Agent 1), FUNNEL_AUDIT_AND_SIMPLIFICATION.md (Agent 2), ENGINE_COMPANION_AUDIT.md (Agent 3), SEO_GROWTH_PLAN.md (Agent 4), COMPLIANCE_PAYMENT_COPY_AUDIT.md (Agent 5), PRODUCTION_READINESS_AUDIT.md (Agent 6). No app code was modified in producing this document.*
