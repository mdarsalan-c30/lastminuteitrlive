# Production Readiness Audit — LastMinute ITR

**Agent:** 6 — QA, Build, Deployment & Production Readiness  
**Date:** 10 June 2026  
**Repository:** `/Users/nikhilanand/Downloads/Cursor/lastminute-itr`  
**Production URL audited:** https://lastminute-busb7ssn6-nikhil-anand-s-projects12.vercel.app  
**Local verification:** Production build served at `http://localhost:3001` (post-`npm run build`)  
**Constraint:** Read-only audit — no application code modified.

---

## 1. Executive Summary & Verdict

### Production readiness approval: **PARTIAL**

The tax computation **Python engine is production-grade** (450 pytest + 47 integration tests, all passing). The **Next.js app builds cleanly** with strict TypeScript (`npx tsc --noEmit` passes) and **82 routes** compile. However, **CI quality gates are incomplete**, **`npm run lint` is broken**, **frontend unit tests are absent**, **Playwright e2e is 3/4 passing**, and the **Vercel preview deployment is behind Deployment Protection (HTTP 401)** — blocking public browser QA and stakeholder review on the target URL.

| Area | Result |
|------|--------|
| Production build (`npm run build`) | ✅ PASS |
| Type safety (`tsc --noEmit`) | ✅ PASS (no script; manual run) |
| Lint (`npm run lint`) | ❌ FAIL |
| Frontend unit tests (`npm test`) | ⚠️ MISSING |
| E2E (`npm run test:e2e`) | ⚠️ PARTIAL (3/4) |
| Python engine tests | ✅ PASS (497 total) |
| CI workflows | ⚠️ PARTIAL |
| Secrets hygiene | ✅ PASS |
| Production deployment QA | ❌ BLOCKED (401) |
| Local browser QA (desktop + mobile) | ✅ PASS (9/10 routes) |

**Recommendation:** Do **not** promote to public production until Deployment Protection is lifted or bypass credentials are configured for QA, lint is fixed, CI runs e2e + engine tests from the correct path, and the failing e2e assertion is resolved.

---

## 2. Audit Scope & Methodology

### Commands executed (in repo root unless noted)

| Command | Result |
|---------|--------|
| Read `package.json` scripts | Documented below |
| `npm run lint` | **Failed** — `nextVitals is not iterable` |
| `npm run typecheck` | **Missing script** |
| `npx tsc --noEmit` | **Passed** (manual substitute) |
| `npm run build` | **Passed** (~18s) |
| `npm test` | **Missing script** |
| `npm run test:e2e` | **3 passed, 1 failed** |
| `cd engine && python3 -m pytest tests/ -q` | **450 passed** |
| `cd engine && python3 tests.py` | **47 passed** |
| `.github/workflows/*` review | 2 workflows |
| Git tracked secrets scan | No `.env` or credential files tracked |
| `engine/` folder check | Real directory (not symlink) |
| HTTP probe of Vercel URL | All routes **401** |
| Browser QA on Vercel URL | Redirected to Vercel SSO login |
| Browser QA on local prod build | Desktop 1280×800 + mobile 390×844 |

### Environment

| Tool | Version |
|------|---------|
| Node | v24.14.0 |
| npm | 11.9.0 |
| Python | 3.13.0 |
| Next.js | 15.5.19 |
| Playwright | ^1.60.0 |

---

## 3. Package Scripts & Build Pipeline

### `package.json` scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test:e2e": "playwright test",
  "generate:portal-steps": "python3 scripts/generate_portal_steps.py"
}
```

### Missing scripts (recommended for production)

| Script | Status | Notes |
|--------|--------|-------|
| `typecheck` | ❌ Missing | `npx tsc --noEmit` passes when run manually |
| `test` | ❌ Missing | No Jest/Vitest unit test suite |
| `lint:fix` | ❌ Missing | — |

### `npm run build` — **PASS**

```
✓ Compiled successfully in 4.4s
  Skipping linting                    ← eslint ignored during build
  Checking validity of types ...      ← TypeScript OK
✓ Generating static pages (82/82)
```

**Build output highlights:**

- 32 app pages + API routes + static glossary/learn SSG paths
- First Load JS on `/` ≈ 141 kB
- `next.config.ts` sets `eslint.ignoreDuringBuilds: true` — lint failures do not block deploys

---

## 4. Lint, Typecheck & Static Analysis

### `npm run lint` — **FAIL**

```
> next lint
`next lint` is deprecated and will be removed in Next.js 16.
nextVitals is not iterable
```

**Root cause (code review, not modified):** `eslint.config.mjs` spreads `...nextVitals` from `eslint-config-next/core-web-vitals.js`, but that export is not iterable in the current ESLint flat-config + Next 15.5.19 combination.

**Impact:** Local lint and CI lint job both fail. Builds succeed anyway because `next.config.ts` disables ESLint during builds.

### Typecheck — **PASS (manual)**

| Method | Result |
|--------|--------|
| `npm run typecheck` | Missing script |
| `npx tsc --noEmit` | ✅ Exit 0 |
| `next build` type phase | ✅ Passed |

`tsconfig.json` has `"strict": true`.

---

## 5. Test Suite Results

### Frontend unit tests — **MISSING**

`npm test` returns `Missing script: "test"`. No Jest/Vitest config found.

### Playwright E2E — **PARTIAL (3/4 pass)**

Config: `playwright.config.ts` — runs against `http://localhost:3000` via `npm run start` webServer.

| Test | Result |
|------|--------|
| Landing loads with hero and primary CTA | ✅ |
| Form 16 fast path opens documents import | ✅ |
| Regime compare page loads | ✅ |
| Checkout plans shows paywall guard or value stack | ❌ |

**Failure detail:** Playwright strict-mode violation — both "Checkout is locked" banner **and** "Your earned value before checkout" region are visible simultaneously. The test uses `.or()` expecting exactly one match; both elements render (likely intentional UI). This is a **test assertion bug**, not necessarily an app regression.

### Python engine — **PASS**

| Suite | Count | Time |
|-------|-------|------|
| `pytest tests/ -q` | 450 passed | 0.31s |
| `python3 tests.py` | 47 passed | instant |

`engine/` is a **real directory** (not a symlink):

```
engine: directory
├── orchestrator.py, tax_slabs.py, models.py, …
├── tests/          (pytest suite)
└── tests.py        (integration runner)
```

---

## 6. CI/CD Pipeline Review

### `.github/workflows/ci.yml`

**Triggers:** push to `main`/`master`, all PRs  
**Steps:** `npm ci` → `npm run lint` → `npm run build`

| Gap | Severity |
|-----|----------|
| Lint currently **fails** — CI would be red | 🔴 High |
| No `typecheck` step | 🟡 Medium |
| No Playwright e2e | 🟡 Medium |
| No engine pytest | 🟡 Medium |

### `.github/workflows/engine-tests.yml`

**Triggers:** path filters on `engine/**`, `scripts/**`, and `../itr-filing-wireframes/sources/engine/**`

**Critical misconfiguration:** Job `working-directory` is set to `../itr-filing-wireframes/sources/engine` — **not** the in-repo `engine/` folder. Engine tests in this repository are **not exercised by CI** unless that external path exists on the runner.

```yaml
defaults:
  run:
    working-directory: ../itr-filing-wireframes/sources/engine  # ← wrong for this repo
```

### Deployment config (`vercel.json`)

- Adds `X-Robots-Tag: noindex, nofollow` on `/file/*` routes (appropriate for filing flow)
- No build/lint overrides

---

## 7. Secrets, Environment & Security

### Committed secrets scan — **PASS**

```
git ls-files | rg '\.env|secret|credential|\.pem|api[_-]?key'
→ No secret-like files tracked
```

### `.gitignore`

```
.env*.local
node_modules
.next
.vercel
```

Only `.env.example` exists locally (Razorpay placeholders — not secrets):

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Security observations (informational)

- Payment page shows mock Razorpay copy; live keys required for real charges (documented in `.env.example`)
- Sign-in collects PAN/mobile but defers OTP to checkout (no real auth backend observed)
- Vercel Deployment Protection active on preview URL (see §8)

---

## 8. Deployment & Browser QA

### Vercel production URL — **BLOCKED by Deployment Protection**

**URL:** https://lastminute-busb7ssn6-nikhil-anand-s-projects12.vercel.app

| Signal | Value |
|--------|-------|
| HTTP status (all probed routes) | **401 Unauthorized** |
| Response header | `set-cookie: _vercel_sso_nonce=…` |
| Browser navigation | Redirected to `vercel.com/login?next=/sso-api?url=…` |

This is **Vercel Deployment Protection** (SSO/password gate), not an application 404. Unauthenticated curl/browser requests cannot reach the Next.js app.

### Route table — Vercel deployment (unauthenticated)

| Route | Purpose | HTTP | Status |
|-------|---------|------|--------|
| `/` | Landing | 401 | 🔒 Blocked (Deployment Protection) |
| `/file/onboarding/signin` | Sign-in | 401 | 🔒 Blocked |
| `/file` | Filing entry | 401 | 🔒 Blocked |
| `/file/regime` | Regime compare (wizard) | 401 | 🔒 Blocked |
| `/file/checkout/plans` | Pricing / plan selection | 401 | 🔒 Blocked |
| `/reviews` | Reviews | 401 | 🔒 Blocked |
| `/learn` | Learn index | 401 | 🔒 Blocked |
| `/glossary` | Glossary index | 401 | 🔒 Blocked |
| `/file/checkout/payment` | Checkout (no real payment tested) | 401 | 🔒 Blocked |
| `/pricing` | Direct pricing URL | 401 | 🔒 Blocked (route also 404 locally — see below) |

> **Note:** Console errors, desktop/mobile layout, and interactive flows **could not be validated on the Vercel URL** due to 401. Findings below are from **local production build** (`npm run build && npm run start -p 3001`).

### Route table — Local production build

| Route | Purpose | HTTP | Desktop | Mobile (390×844) | Console errors |
|-------|---------|------|---------|------------------|----------------|
| `/` | Landing | 200 | ✅ Hero, CTAs, pricing section | ✅ Renders | None observed |
| `/file/onboarding/signin` | Sign-in | 200 | ✅ PAN/mobile form, consent | ✅ Renders | None observed |
| `/file` | Filing hub | 200 | ✅ Loads | ✅ Renders | None observed |
| `/file/regime` | Regime compare | 200 | ✅ Old vs new cards | ✅ Renders | None observed |
| `/file/import/documents` | Filing wizard (import) | 200 | ✅ Form 16 upload UI | ✅ Renders | None observed |
| `/file/checkout/plans` | Plan selection | 200 | ✅ "Choose plan" heading | ✅ Renders | None observed |
| `/file/checkout/payment` | Payment summary | 200 | ✅ Mock pay button (no PAN/payment submitted) | ✅ Renders | None observed |
| `/reviews` | Reviews page | 200 | ✅ Grid + feedback form | ✅ Renders | None observed |
| `/learn` | Learn index | 200 | ✅ Article list | ✅ Renders | None observed |
| `/glossary` | Glossary index | 200 | ✅ Term list | ✅ Renders | None observed |
| `/pricing` | Standalone pricing page | **404** | ❌ Not found | ❌ Not found | N/A |

**Pricing routing note:** There is **no `/pricing` page**. Pricing lives at:

- Landing anchor `/#pricing` (used by `SiteHeader` and `SiteFooter`)
- Checkout flow `/file/checkout/plans`

Footer/header "Pricing" links correctly use `/#pricing`; any direct `/pricing` link would 404.

### Browser QA summary

| Viewport | Result |
|----------|--------|
| Desktop (1280×800) | All audited routes render with expected headings and navigation |
| Mobile (390×844) | Filing shell, regime page, and marketing pages adapt; no horizontal overflow observed in snapshots |
| Console | No JavaScript errors captured on spot-checked pages (landing, signin, regime, payment, reviews) |
| Real payment / PAN | **Not submitted** per audit instructions |

---

## 9. Blockers, Risks & Recommendations

### P0 — Must fix before public production

| # | Issue | Action |
|---|-------|--------|
| 1 | **Vercel Deployment Protection (401)** on preview URL | Disable protection for production domain, or provide QA bypass token; re-run browser QA on live URL |
| 2 | **`npm run lint` broken** | Migrate off deprecated `next lint`; fix `eslint.config.mjs` spread of `eslint-config-next/core-web-vitals` |
| 3 | **CI lint job fails** | Same as #2 — currently blocks green CI |
| 4 | **Engine CI points to wrong directory** | Change `engine-tests.yml` `working-directory` to `engine` (in-repo) |

### P1 — Should fix before launch

| # | Issue | Action |
|---|-------|--------|
| 5 | No `typecheck` npm script | Add `"typecheck": "tsc --noEmit"` and run in CI |
| 6 | No frontend unit tests | Add Vitest/Jest for store, API handlers, critical UI logic |
| 7 | E2E 1/4 failing | Fix Playwright strict-mode assertion in `e2e/smoke.spec.ts` (use `.first()` or assert both elements intentionally) |
| 8 | E2E not in CI | Add Playwright job after build |
| 9 | ESLint ignored during builds | Set `eslint.ignoreDuringBuilds: false` once lint passes |
| 10 | `/pricing` 404 | Add redirect `/pricing` → `/#pricing` or `/file/checkout/plans` |

### P2 — Nice to have

| # | Issue | Action |
|---|-------|--------|
| 11 | `next lint` deprecation warning | Run `@next/codemod next-lint-to-eslint-cli` |
| 12 | Git repo has no commits on `main` (local clone state) | Ensure remote history is intact for traceability |
| 13 | Razorpay env vars unset in preview | Document required Vercel env vars for payment smoke tests |

### Pre-launch checklist

- [ ] Lift or configure Deployment Protection; confirm HTTP 200 on production routes
- [ ] Green CI: lint + typecheck + build + e2e + engine pytest
- [ ] Fix engine-tests workflow path
- [ ] Resolve e2e checkout assertion
- [ ] Set production env vars (`RAZORPAY_*`, `NEXT_PUBLIC_APP_URL`)
- [ ] Re-run browser QA on **public** URL (desktop + mobile, all routes in §8)
- [ ] Confirm `/pricing` redirect or remove dead links

---

## Appendix A — Full build route manifest

82 pages generated including:

- Marketing: `/`, `/learn`, `/learn/[slug]`, `/glossary`, `/glossary/[term]`, `/reviews`
- Filing: `/file/*` (onboarding, import, income workspace, regime, review, checkout)
- API: `/api/compute`, `/api/documents/upload`, `/api/payments/*`, `/api/feedback`, `/api/portal-guide/[form]`
- SEO: `/robots.txt`, `/sitemap.xml`

## Appendix B — E2E failure stack trace (abbreviated)

```
e2e/smoke.spec.ts:53 — expect(payGuard.or(valueStack)).toBeVisible()
strict mode violation: resolved to 2 elements
  1) "Checkout is locked until…"
  2) region "Your earned value before checkout"
```

---

*End of audit. No application source files were modified during this review.*
