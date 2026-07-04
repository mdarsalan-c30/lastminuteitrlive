# Tech Debt — LastMinute ITR

**Date:** 2026-07-03

---

## Architectural debt

| Debt | Severity | Location | Impact | Paydown |
| --- | --- | --- | --- | --- |
| Split plan catalog | P0 | `plans.ts` vs payment `VALID_PLANS` vs admin pricing | Checkout broken | Single `PlanCatalog` module imported everywhere |
| Mock parsers in production path | P0 | `documents/upload` | Wrong tax | Feature flags + real parsers |
| Auth crypto below standard | P0 | `lib/auth/*` | Account takeover | bcrypt/argon2 + secret policy |
| Client-heavy filing god pages | P1 | `review/page.tsx` 935 lines | Bugs, perf | Split by section components |
| Content as giant TS files | P1 | `lib/content/*` | Bundle/maintainability | MDX or CMS/DB |
| Dual product histories merged poorly | P1 | `normal/pro` vs `diy/ai_smart/ca` | Confusion | Product decision + migration |
| Experimental Vercel Python services | P1 | `vercel.json` | Ops fragility | Document runbooks; health checks |
| In-memory rate limits | P1 | `llmService.ts` | Ineffective on serverless | Redis |
| Best-effort payment persistence | P1 | `verify` swallows errors | Lost revenue analytics | Outbox pattern |
| No payment webhooks | P1 | payments | Entitlement drift | Razorpay webhooks |
| FloatingGenie complexity | P2 | 644 lines | UX regressions | Extract state machine |
| E2E defaults weak passwords | P2 | e2e specs | Accidental prod use | Secrets manager for tests |
| Public default Next assets | P3 | `public/` | Polish | Delete |

---

## Folder / naming

**Strengths:**
- Clear `app/(marketing)`, `app/(app)`, `app/admin`, `app/api`
- Engine isolated under `backend/engine`
- Prisma store abstraction

**Weaknesses:**
- Plan IDs not domain-driven (`Price 1` as name)
- Mix of `ts_` cookie prefixes (TaxSahaati legacy?) while brand is LastMinute ITR
- `ca` vs `pro` vs partner naming inconsistency
- `layer2` API naming opaque

---

## Duplication

| Area | Dupes |
| --- | --- |
| Plan validation arrays | Hardcoded in create-order, verify, admin pricing, coupons |
| Password hash helpers | Copied across b2c/ca/admin |
| Session HMAC helpers | Parallel implementations |
| Marketing vs filing pricing display | Multiple formatters |

---

## Testing debt

| Layer | Status |
| --- | --- |
| Frontend unit (vitest) | Present for some parsers/pricing |
| E2E playwright | Some admin/coupon specs |
| Engine pytest | Present historically; verify CI on this deploy |
| Payment contract tests | **Missing** (would have caught P0-1/P0-2) |
| Visual regression | Missing |
| Load tests | Missing |

---

## Observability debt

- Payment failures not obviously alerted
- Demo parse rate not a dashboard metric
- Compute errors may only `console.error`
- Need: structured logs, error tracking (Sentry), uptime on `/api/compute` and payments

---

## Dependency / supply chain

- Next 15.5.19 — track security advisories
- Prisma 5.x — ensure migrate deploy in CI
- PostHog, Upstash present — confirm production config
- ZeroGPT key in source — remove

---

## Debt burn-down order

1. Plan catalog + payments (unblocks revenue)
2. Secrets + password hashing (unblocks trust)
3. Parser honesty (unblocks tax safety)
4. Observability (unblocks operations)
5. Component splits (unblocks velocity)
