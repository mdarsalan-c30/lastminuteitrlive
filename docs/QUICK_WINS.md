# Quick Wins — LastMinute ITR

**Date:** 2026-07-03  
**Rule:** High impact, low effort. Do these **after** P0 payment/security blockers if they conflict; otherwise interleave.

---

## Under 30 minutes

| Win | Why | Where |
| --- | --- | --- |
| Rename Price 1/2, Buy 1/2, remove Item 3/5 | Instant trust | `lib/payments/plans.ts` |
| Fix "Your person CA" typo | Professionalism | `plans.ts` |
| Align bottom CTA price with cards | Stop confusion | Marketing CTA component |
| Remove duplicate "Read all reviews" link | Cleanup | Landing |
| Mark AIS/26AS badges as "Beta" or "Soon" | Honesty | Landing import section |
| Delete unused `public/next.svg` etc. | Polish | `public/` |
| Block `/blogs/upload` via redirect to admin | Security | middleware or page |

---

## Under 2 hours

| Win | Why | Where |
| --- | --- | --- |
| Add `normal`/`pro` to payment `VALID_PLANS` **or** switch `PLAN_LIST` to working IDs | Unblock checkout | payments routes + plans |
| Set Razorpay env vars on Vercel + redeploy | Unblock money | Vercel dashboard |
| Fail create-order in production when keys missing | No more mock trap | `create-order/route.ts` |
| Remove `MOCK_FIELDS` return path for ais/26as | Stop fake tax data | `documents/upload` |
| Remove ZeroGPT hardcoded key | Security | `zerogpt/route.ts` |
| Require `PAYMENT_SESSION_SECRET` in production | Security | auth modules |
| Disable NRI option in tools quiz | Tax honesty | tools page |
| Replace `alert()` with inline banner | UX | checkout plans |

---

## Under 1 day

| Win | Why |
| --- | --- |
| bcrypt password hashing migration | Security baseline |
| Razorpay order notes include planId; verify fetches order | Payment integrity |
| Entitlement matrix UI on plans page | Conversion clarity |
| Companion preview screenshot behind paywall | Conversion |
| Lighthouse pass on `/` and fix top CLS/LCP | Performance |
| Add payment contract tests in CI | Prevent regression |

---

## Do **not** treat as quick wins

- Full AIS/26AS parsers
- Capital gains / F&O
- NRI support
- Design system rewrite
- Admin RBAC overhaul

Those are real projects — schedule after launch gate.
