# Product Audit — LastMinute ITR

**URL:** https://lastminute-itr.vercel.app  
**Audit date:** 2026-07-03  
**Roles applied:** CTO, Principal Staff Engineer, Product Architect, Senior UX, Tax Domain, Performance, QA, Security  
**Scope:** Live production + codebase at `lastminute-itr` (deployed from `taxsahaatimvp`)  
**Constraint honored:** No code changes; audit only.

---

## Executive verdict

**Not launch-ready for 1M users.**

The product has a credible *idea* (prep + portal companion, not auto-file) and a non-trivial filing surface, but production is currently in a **broken commerce + placeholder marketing** state:

1. Homepage sells plans the payment API rejects.
2. Razorpay is not configured; verification returns 503.
3. Pricing UI still says "Price 1 / Item 3".
4. AIS/26AS uploads invent demo numbers while marketing says "Live".
5. Auth cryptography is below fintech baseline.

**Ship decision:** Block launch. Fix all P0s in `docs/P0_BUGS.md`, then re-audit payments and document import with real user journeys.

---

## Scorecard (weighted for launch risk)

| Dimension | Score | Notes |
| --- | --- | --- |
| UI | **5/10** | Clean teal system, but placeholder pricing and uneven filing density |
| UX | **4/10** | Too many steps; unclear paid value; journey forks |
| Performance | **5/10** | Build succeeds; large client components; no measured LCP/CLS |
| Accessibility | **4/10** | Not systematically audited; risk on modals/genie/forms |
| Trust | **3/10** | Illustrative reviews, demo parsers, placeholder SKUs |
| Conversion | **2/10** | Checkout broken; price inconsistency; fake urgency |
| Engineering quality | **4/10** | Plan ID split-brain; secrets; weak password hashing |
| Tax accuracy (engine core) | **6/10** | Engine has real rules; UI/import path undermines them |
| Security | **2/10** | Hardcoded key, SHA-256 passwords, secret fallbacks |
| **Overall launch readiness** | **3/10** | |

---

## What the product is (as shipped)

- **Positioning:** AI-assisted ITR *prep* + portal companion; user submits on incometax.gov.in.
- **Surfaces:** Marketing site, filing wizard (`/file/*`), tools, learn/blogs/glossary, admin, CA dashboard, B2C auth.
- **Backend:** Next.js API routes + Python tax engine (`backend/`, Vercel experimental services).
- **Data:** Prisma-backed store (good direction vs file JSON).

---

## Route inventory (pages)

### Marketing
`/`, `/learn`, `/learn/[slug]`, `/glossary`, `/glossary/[term]`, `/blogs`, `/blogs/[slug]`, `/blogs/upload`, `/reviews`, `/help`, `/help/[slug]`, `/tools` (also under app), `/old-vs-new-regime`, `/itr-deadline-2026`, `/privacy`, `/terms`, `/refund-policy`, `/disclaimer`, `/form-16-filing`

### Filing
`/file`, onboarding (`eligibility`, `profile`, `signin`, `itr-path`, `case-matrix`), import (`documents`, `parsing`, `mismatch`, `bank`, `tds`), income/deductions/house-property/other/regime/profile, review (`/`, `risk`, `presubmit`), companion, advisor, cabrain, comprehensive, support, checkout (`plans`, `payment`, `everify`, `tracker`)

### Auth / CA / Admin
`/auth/login`, `/auth/register`, `/auth/ca-login`, `/ca/dashboard`, `/ca/dashboard/client/[id]`, `/ca/dashboard/billing`, `/admin/*`

### Missing vs prior internal builds
`/pro/dashboard` → **404**, `/tools/advance-tax` → **404**

---

## Journey audit (persona × outcome)

| Persona | Journey result | Blocker |
| --- | --- | --- |
| Salaried, Form 16 only | Can start upload path | Paywall unlock broken |
| Salaried + AIS | Upload returns **demo numbers** | P0-5 |
| Capital gains / Groww | Marketed, not real | P1-6 |
| Business / freelancer | Partial income screens | Engine support uneven |
| Senior citizen | Engine has 80TTB/senior slabs | UI must pass age correctly |
| NRI | Quiz offers; engine rejects | P0-10 |
| Refund / tax due | Regime compare exists | Depends on compute accuracy |
| AIS mismatch | UI exists; data may be fake | P0-5 |
| Pay → companion | **Broken** | P0-1, P0-2 |

At every step, TurboTax/Stripe/Mercury bar:

| Question | Answer today |
| --- | --- |
| Why does this screen exist? | Often unclear; many intermediate steps |
| Can AI do this? | Over-claimed; parsers incomplete |
| Can this screen disappear? | Yes — collapse import+income |
| Can user finish faster? | Not until paywall and parsers work |
| Would Stripe ship this? | **No** — payments broken |
| Would Mercury approve? | **No** — trust/copy/security |
| Would TurboTax keep this? | **No** — demo tax numbers |

---

## Page scores (representative)

| Page | UI | UX | Perf | A11y | Trust | Conv | Eng |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` Landing | 6 | 4 | 5 | 4 | 3 | 2 | 3 |
| `/file` | 6 | 5 | 6 | 4 | 5 | 4 | 5 |
| `/file/import/documents` | 6 | 5 | 5 | 4 | 2 | 3 | 3 |
| `/file/checkout/plans` | 4 | 3 | 5 | 4 | 2 | 1 | 2 |
| `/file/checkout/payment` | 5 | 3 | 5 | 4 | 2 | 1 | 2 |
| `/file/companion` | 6 | 5 | 4 | 3 | 5 | 4 | 4 |
| `/tools` | 6 | 6 | 6 | 5 | 5 | 5 | 5 |
| `/reviews` | 5 | 4 | 6 | 4 | 2 | 3 | 4 |
| `/admin/*` | 5 | 5 | 5 | 3 | 4 | n/a | 4 |
| `/ca/dashboard` | 5 | 5 | 5 | 3 | 4 | 4 | 4 |

---

## Cross-report index

| Report | Path |
| --- | --- |
| P0 blockers | `docs/P0_BUGS.md` |
| Full bugs | `docs/BUG_REPORT.md` |
| UI | `docs/UI_REVIEW.md` |
| UX | `docs/UX_REVIEW.md` |
| Performance | `docs/PERFORMANCE.md` |
| Security | `docs/SECURITY.md` |
| Tax | `docs/TAX_REVIEW.md` |
| Conversion | `docs/CONVERSION.md` |
| Tech debt | `docs/TECH_DEBT.md` |
| Quick wins | `docs/QUICK_WINS.md` |
| P1 backlog | `docs/P1_IMPROVEMENTS.md` |
| P2 backlog | `docs/P2_IMPROVEMENTS.md` |

---

## Recommended 72-hour war room order

1. Fix payments (keys + plan IDs) — **cannot monetize otherwise**
2. Kill placeholder pricing copy
3. Disable or fix AIS/26AS demo data
4. Rotate secrets; fix password hashing
5. Block NRI honestly
6. Run 10 real Form 16 filings end-to-end with golden expected tax
7. Lighthouse + accessibility pass on top 5 routes
8. Only then consider public launch traffic
