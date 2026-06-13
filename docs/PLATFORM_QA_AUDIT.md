# Platform QA Audit — LastMinute ITR

**Date:** 2026-06-10  
**Scope:** All user-facing routes, interactive elements, API paths, checkout/companion flows  
**Verification:** `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:e2e`

---

## Executive summary

| Severity | Found | Fixed | Remaining |
|----------|-------|-------|-----------|
| P0 | 1 | 1 | 0 |
| P1 | 4 | 4 | 0 |
| P2 | 9 | 1 | 8 |
| P3 | 6 | 0 | 6 |

**P0/P1 fixes shipped in this audit:**

1. **P0-001** — Form 16 fast-path continue CTA was permanently disabled (`importMode` stayed `null` when mode cards are hidden).
2. **P1-001** — Mismatch page ghost buttons (“I have proof”, “AIS feedback guide”) had no navigation.
3. **P1-002** — E2E regression on form16 fast path (same root cause as P0-001).
4. **P1-003** — `/file/support` “WhatsApp · Email” button was dead (no `href` / `onClick`).
5. **P1-004** — `/file/income` “+ Add another Form 16” button was dead.

**P2 fix shipped:**

- **P2-009** — `/pricing` returned 404; added redirect to `/#pricing` in `next.config.ts`.

---

## Route map

### Marketing & content

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Landing — hero, Form 16 CTA, pricing, reviews carousel | ✅ OK |
| `/learn` | Learn hub index | ✅ OK |
| `/learn/[slug]` | 25 SSG articles | ✅ OK |
| `/glossary` | Glossary index with search | ✅ OK |
| `/glossary/[term]` | 38 SSG term pages | ✅ OK |
| `/blogs` | Blog index | ✅ OK |
| `/blogs/[slug]` | 25 SSG posts | ✅ OK |
| `/blogs/upload` | Admin blog publish (token gate) | ✅ OK (needs `BLOG_ADMIN_TOKEN`) |
| `/reviews` | Testimonials + live feedback + submit form | ✅ OK |
| `/chat` | Support chat (async auto-reply) | ✅ OK |
| `/profile` | Local profile save/clear | ✅ OK |
| `/form-16-filing` | SEO landing | ✅ OK |
| `/old-vs-new-regime` | SEO landing | ✅ OK |
| `/itr-deadline-2026` | SEO landing | ✅ OK |
| `/privacy`, `/terms`, `/refund-policy`, `/disclaimer` | Legal pages | ✅ OK |
| `/pricing` | → redirects to `/#pricing` | ✅ Redirect |

### Filing funnel

| Route | Purpose | Status |
|-------|---------|--------|
| `/file` | Filing hub — start eligibility or companion | ✅ OK |
| `/file/onboarding/eligibility` | About you + additional income + ITR recommendation | ✅ OK |
| `/file/onboarding/signin` | → redirects to eligibility `?step=about-you` | ✅ Redirect |
| `/file/onboarding/case-matrix` | → redirects to eligibility (preserves query) | ✅ Redirect |
| `/file/onboarding/itr-path` | → redirects | ✅ Redirect |
| `/file/onboarding/profile` | → client redirect to eligibility | ✅ Redirect |
| `/file/import/documents` | Mode cards + Form 16 upload | ✅ OK |
| `/file/import/parsing` | Parsed figures review | ✅ OK |
| `/file/import/bank` | Bank pre-validation | ✅ OK |
| `/file/import/mismatch` | Mismatch summary | ✅ OK |
| `/file/import/mismatch/[id]` | Per-mismatch detail (e.g. `salary`) | ✅ OK |
| `/file/import/tds` | TDS cross-check | ✅ OK |
| `/file/income` | Salary & other income | ✅ OK |
| `/file/house-property` | House property + HRA modal | ✅ OK |
| `/file/other` | Other income (links `/glossary/section-80ttb`) | ✅ OK |
| `/file/deductions` | Chapter VI-A deductions | ✅ OK |
| `/file/regime` | Old vs new regime compare + choose | ✅ OK |
| `/file/cabrain` | CA Brain path | ✅ OK |
| `/file/review/risk` | Pre-submit risk review | ✅ OK |
| `/file/review/presubmit` | → redirects to risk `#final-check` | ✅ Redirect |
| `/file/checkout/plans` | Plan selection + paywall gate | ✅ OK |
| `/file/checkout/payment` | Razorpay / mock payment | ✅ OK (mock in dev) |
| `/file/checkout/everify` | Post-payment e-verify guidance | ✅ OK |
| `/file/checkout/tracker` | → redirects to companion `#filing-progress` | ✅ Redirect |
| `/file/companion` | Portal guide (payment-gated) | ✅ OK (paywall intentional) |
| `/file/support` | Support links to chat + companion | ✅ OK |

### API routes

| Route | Purpose | Status |
|-------|---------|--------|
| `POST /api/compute` | Tax engine | ✅ OK |
| `GET/POST /api/chat` | Support chat persistence | ✅ OK |
| `GET/POST /api/feedback` | User ratings | ✅ OK |
| `GET /api/feedback/summary` | Aggregated ratings | ✅ OK |
| `POST /api/blogs` | Admin blog create | ✅ OK (token required) |
| `POST /api/documents/upload` | Form 16 PDF parse | ✅ OK |
| `POST /api/payments/create-order` | Razorpay order / mock | ✅ OK |
| `POST /api/payments/verify` | Payment verification | ✅ OK |
| `GET /api/payments/session` | Companion access session | ✅ OK |
| `GET/POST /api/portal-guide/[form]` | Companion steps (POST requires payment) | ✅ OK |

---

## Interactive element audit

### Landing (`/`)

| Element | Expected behavior | Status |
|---------|-------------------|--------|
| Upload Form 16 link | → `/file/import/documents?source=form16` | ✅ |
| Start my return form | → eligibility `?step=about-you` | ✅ |
| QuickStart connector cards | → import with source param | ✅ |
| Pricing plan CTAs | → checkout or free eligibility | ✅ |
| RegimeCompareCard reset | Resets salary slider + compute | ✅ |
| Header/footer nav links | All resolve | ✅ |

### Import documents (`/file/import/documents`)

| Element | Expected behavior | Status |
|---------|-------------------|--------|
| Mode cards (estimate / ITD / Form 16) | Switch panels | ✅ |
| Clear selection | Resets mode | ✅ |
| Form 16 upload zone | Parses PDF via API | ✅ |
| Continue CTA (fast path) | → additional-income eligibility | ✅ |
| Continue CTA (manual) | → regime compare | ✅ |
| ITD mode continue | Disabled — coming soon | ⚠️ P2 intentional |

### Eligibility (`/file/onboarding/eligibility`)

| Element | Expected behavior | Status |
|---------|-------------------|--------|
| Income chips (salary, rent, business, etc.) | Updates ITR recommendation | ✅ |
| Reset / Start over | Clears step state | ✅ |
| Continue / Save | Navigates funnel forward | ✅ |

### Mismatch (`/file/import/mismatch`)

| Element | Expected behavior | Status |
|---------|-------------------|--------|
| Fix now | → `/file/import/mismatch/salary` | ✅ |
| I have proof | → salary detail | ✅ |
| AIS feedback guide | → salary detail | ✅ |
| Proceed with explanation | → TDS with flag set | ✅ |
| Continue when green | Disabled until resolved | ✅ |

### Income & parsing

| Element | Expected behavior | Status |
|---------|-------------------|--------|
| + Add another Form 16 | → documents import | ✅ **Fixed** |
| Edit inline (parsing) | → income workspace | ✅ **Fixed** |
| Confirm & merge | → bank validation | ✅ |

### Checkout & payment

| Element | Expected behavior | Status |
|---------|-------------------|--------|
| Plan cards | Select plan in draft | ✅ |
| Paywall guard (unresolved mismatch) | Blocks checkout CTA | ✅ |
| CA plan | Disabled / coming soon at checkout | ✅ |
| Razorpay button | Mock pay in dev → verify → companion | ✅ |
| Terms/refund links | Legal pages | ✅ |

### Support (`/file/support`)

| Element | Expected behavior | Status |
|---------|-------------------|--------|
| Chat with support | → `/chat` | ✅ |
| Open companion guide | → `/file/companion` | ✅ |
| Email support | → `mailto:support@lastminute-itr.com` | ✅ **Fixed** |

### Companion (`/file/companion`)

| Element | Expected behavior | Status |
|---------|-------------------|--------|
| Payment gate | Redirect to plans if unpaid | ✅ |
| ITR form selector | Reloads portal guide | ✅ |
| Guided / checklist toggle | Switches wizard vs table | ✅ |
| Copy value buttons | Clipboard write | ✅ |
| Retry on API error | Re-fetches guide | ✅ |

### Chat (`/chat`)

| Element | Expected behavior | Status |
|---------|-------------------|--------|
| Send message | POST → auto support reply | ✅ |
| Session persistence | localStorage session id | ✅ |

---

## Issues log

### Fixed (P0/P1)

#### P0-001 — Form 16 fast path continue CTA disabled
- **Route:** `/file/import/documents?source=form16`
- **Fix:** `effectiveImportMode = form16FastPath ? "form16" : importMode` in `app/file/import/documents/page.tsx`
- **Test:** `e2e/smoke.spec.ts` — “form16 fast path routes to additional-income eligibility”

#### P1-001 — Mismatch ghost buttons
- **Route:** `/file/import/mismatch`
- **Fix:** Wired “I have proof” and “AIS feedback guide” to `/file/import/mismatch/salary`
- **Test:** `e2e/smoke.spec.ts` — “mismatch salary actions navigate to detail”

#### P1-002 — E2E regression on form16 fast path
- **Fix:** Same as P0-001

#### P1-003 — Support page dead contact button
- **Route:** `/file/support`
- **Symptom:** “WhatsApp · Email” `<Button>` had no `href` or `onClick`
- **Fix:** Replaced with working `Email support` mailto link
- **Note:** WhatsApp not configured in MVP; chat covers async support

#### P1-004 — Income workspace dead CTA
- **Route:** `/file/income`
- **Symptom:** “+ Add another Form 16” did nothing
- **Fix:** Linked to `/file/import/documents?source=form16`

### Fixed (P2)

#### P2-009 — `/pricing` 404
- **Fix:** Redirect `/pricing` → `/#pricing` in `next.config.ts`

### Remaining — P2 (product/infra scope)

| ID | Area | Issue |
|----|------|-------|
| P2-001 | Import | ITD / ERI connect mode — continue disabled, “coming soon” only |
| P2-002 | Connectors | AIS, 26AS, CAMS, Groww, MFCentral — demo/sample data except Form 16 PDF parse |
| P2-003 | Connectors | “Connect accounts (coming soon)” accordion — no OAuth |
| P2-004 | Payment | Live Razorpay requires `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` in production |
| P2-005 | Companion | Full personalized guide requires verified payment session (402 on API without pay) |
| P2-006 | Checkout | Unresolved critical mismatch blocks checkout |
| P2-007 | Blogs | `/blogs/upload` needs `BLOG_ADMIN_TOKEN` env var |
| P2-008 | Chat | Auto-reply only — no human agent inbox in MVP |
| P2-010 | Deductions | “Upload proof” buttons on deduction rows — no upload flow yet |
| P2-011 | Risk review | “Download proof checklist (PDF)” — PDF export not implemented |

### Remaining — P3 (polish / non-blocking)

| ID | Area | Issue |
|----|------|-------|
| P3-001 | UI | `PortalFootprintWizard` uses raw `<img>` — lint warning |
| P3-002 | Onboarding | `/file/onboarding/profile` is redirect-only stub |
| P3-003 | Content | Illustrative testimonials disclosed but not live-verified |
| P3-004 | Build | Intermittent `.next` trace ENOENT on parallel clean builds (environmental) |
| P3-005 | SEO | Some glossary terms marked `noindex` by design |
| P3-006 | Analytics | PostHog events fire client-side; no server-side audit trail |

---

## Test coverage

| Test | File |
|------|------|
| Landing hero + Form 16 CTA | `e2e/smoke.spec.ts` |
| Import mode cards + clear selection | `e2e/smoke.spec.ts` |
| Estimate path → regime compare | `e2e/smoke.spec.ts` |
| Form16 fast path CTA enabled + navigation | `e2e/smoke.spec.ts` |
| Mismatch salary action links | `e2e/smoke.spec.ts` |
| Chat send + auto-reply | `e2e/smoke.spec.ts` |
| Eligibility reset | `e2e/smoke.spec.ts` |
| Regime compare page load | `e2e/smoke.spec.ts` |
| Checkout plans paywall guard | `e2e/smoke.spec.ts` |

---

## Verification commands (final run)

```bash
npm run lint      # pass (2 img warnings)
npm run typecheck # pass
npm run test      # 52 passed, 1 skipped
npm run build     # pass — 143 static pages
npm run test:e2e  # 11 passed
```

---

## Recommendations (next sprint)

1. **P2-001:** Ship ERI/AIS import or remove ITD mode card until ready.
2. **P2-004:** Document Razorpay production env setup in deploy checklist.
3. **P2-010 / P2-011:** Wire proof upload and PDF checklist, or hide buttons until implemented.
4. Add e2e for mock payment → companion unlock flow with seeded payment session cookie.
5. Add e2e for `/pricing` redirect and glossary/learn slug 404 guards.
