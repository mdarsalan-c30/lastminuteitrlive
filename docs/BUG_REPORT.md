# Bug Report — Full Inventory

**Product:** LastMinute ITR · https://lastminute-itr.vercel.app  
**Audit date:** 2026-07-03  
**Method:** Live HTTP probes + static code review of `lastminute-itr` (synced from `taxsahaatimvp`)

P0 items are detailed in `docs/P0_BUGS.md`. This file is the full inventory.

---

## Critical (P0)

| ID | Bug | Location | Evidence |
| --- | --- | --- | --- |
| P0-1 | Plan IDs sold on landing rejected by payment API | `plans.ts` vs `create-order/route.ts` | `normal`/`pro` → 400 Invalid plan |
| P0-2 | Razorpay keys missing; mock order + verify 503 | payments API | Live mock order; verify unavailable |
| P0-3 | Placeholder pricing copy | `lib/payments/plans.ts` | Price 1, Buy 1, Item 3, Item 5 |
| P0-4 | Price drift ₹339 vs ₹349 | homepage + `LAUNCH_OFFER` | Live page |
| P0-5 | AIS/26AS/CAMS return fabricated numbers | `documents/upload/route.ts` | `MOCK_FIELDS` |
| P0-6 | Hardcoded ZeroGPT API key | `api/ai/zerogpt/route.ts` | Fallback UUID key |
| P0-7 | SHA-256 password hashing | `lib/auth/*.ts` | `createHash("sha256")` |
| P0-8 | Dev session secret fallbacks | `b2c.ts`, `ca.ts` | `dev-*-session-secret` |
| P0-9 | Public blog upload page | `/blogs/upload` | HTTP 200 |
| P0-10 | NRI offered but engine rejects | tools quiz vs `profiler.py` | Code |

---

## High (P1)

| ID | Bug | Location | Why bad | Recommended fix |
| --- | --- | --- | --- | --- |
| P1-1 | Payment create-order issues **mock orders in production** when keys missing | `create-order/route.ts` | Confusing UX; pairs with verify failure | Fail closed in production |
| P1-2 | Plan ID fragmentation (`normal`/`pro` vs `diy`/`ai_smart`/`ca` vs B2B packs) | `plans.ts`, coupons, admin pricing | Admin, coupons, checkout disagree | One plan catalog module |
| P1-3 | Testimonials labeled "Illustrative examples" but styled as real reviews | homepage Reviews section | Misleading social proof | Use real reviews or label as "examples" prominently |
| P1-4 | Duplicate review cards in carousel (same quotes repeat) | homepage | Looks broken / fake | Unique set; no loop duplicates in DOM for SEO |
| P1-5 | "Read all reviews →" appears twice | homepage | Dead/duplicate CTA | Single link |
| P1-6 | Groww / MFCentral / Zerodha marketed; connectors not real parsers | upload route stubs | False capability claims | Mark Soon; disable upload |
| P1-7 | Form16 can fall back to `demo_fallback` parse mode | `form16` parser path | Silent wrong numbers | Hard-block filing on demo mode |
| P1-8 | In-memory rate limits only (AI) | `lib/ai/llmService.ts` | Useless on serverless multi-instance | Redis/Upstash rate limit |
| P1-9 | No rate limit on upload / auth / payments | API routes | Abuse, cost, credential stuffing | Edge rate limits |
| P1-10 | `dangerouslySetInnerHTML` for blog/learn HTML | `MarkdownArticleBody.tsx` | Stored XSS if CMS compromised | Sanitize (DOMPurify) |
| P1-11 | Admin middleware only checks cookie **presence**, not signature | `middleware.ts` | Weak edge gate (layout may verify, but inconsistent) | Verify signed session in middleware |
| P1-12 | `/file/checkout/tracker` only redirects | tracker page | Dead route in nav mental model | Remove or implement |
| P1-13 | `/pro/dashboard`, `/tools/advance-tax` 404 | live | Features from prior builds not in this deploy | Remove marketing references or ship features |
| P1-14 | Coupon redeem uses all `PLANS` keys but order API subset | coupons vs payments | Redeem may succeed for plans that cannot pay | Shared allowlist |
| P1-15 | `alert()` used in checkout plans for coupon messaging | `plans/page.tsx` | Unprofessional; blocks UI | Inline toast/banner |
| P1-16 | Typo: "Your person CA" | `plans.ts` | Unprofessional | Copy edit |
| P1-17 | "Pro - level" spacing/hyphenation | `plans.ts` | Unprofessional | Copy edit |
| P1-18 | Both Price 1 and Price 2 cost ₹339 with different strike prices | `plans.ts` | Anchoring looks fake | Differentiate value or price |
| P1-19 | Free tier / paid entitlements unclear in code (`canExportCompanion`) | payments access helpers | Users may unlock wrong features | Explicit entitlement matrix |
| P1-20 | Session events / payments persist best-effort and swallow errors | `verify/route.ts` | Silent data loss for admin/CRM | Structured logging + retry queue |

---

## Medium (P2)

| ID | Bug | Location | Notes |
| --- | --- | --- | --- |
| P2-1 | Large client pages (`review/page.tsx` 935 lines) | filing review | Hard to maintain; likely over-render |
| P2-2 | FloatingGenie 644 lines | companion UX | Risk of layout shift / z-index wars |
| P2-3 | Learn content as giant TS modules (1.4k+ lines) | `lib/content/*` | Bundle bloat if imported client-side |
| P2-4 | Default Next/Vercel SVG assets in `public/` | public | Unbranded 404/assets |
| P2-5 | No visible loading skeletons on several filing steps | filing flow | Perceived performance |
| P2-6 | Regime slider demo uses fixed ₹12L on marketing | homepage | Fine for demo; ensure not confused with user data |
| P2-7 | Offer countdown always visible | homepage | Fake urgency if not tied to real inventory |
| P2-8 | B2B plans defined but not on consumer pricing | `plans.ts` | Dead product surface |
| P2-9 | E2E uses password `admin1234` | e2e specs | Ensure not production default |
| P2-10 | Partner apply accepts optional password | `partners/apply` | Weak onboarding |
| P2-11 | Compute API returns validation errors as JSON ok:false | `/api/compute` | OK, but client must handle all fields |
| P2-12 | Missing breadcrumbs in deep filing steps | filing | Orientation loss |
| P2-13 | Multiple entry CTAs: Upload Form 16 / Start my return / Proceed to file | marketing + file | Journey fragmentation |
| P2-14 | Individual Filer / B2B toggle on hero — B2B path unclear | homepage | Dead or incomplete toggle |
| P2-15 | Support email only in footer | trust | No in-product support SLA |

---

## Low (P3)

| ID | Bug | Notes |
| --- | --- | --- |
| P3-1 | Mixed brand casing: LastminuteITR / LastMinute ITR / LastMinuteITR | Consistency |
| P3-2 | Footer compliance is good but easy to miss | Typography hierarchy |
| P3-3 | Tools page "exact" HRA language vs estimate disclaimer | Copy conflict |
| P3-4 | Glossary/learn volume high; quality uneven | Content QA |
| P3-5 | `file.svg`, `globe.svg`, `next.svg`, `vercel.svg` still in public | Cleanup |

---

## Broken / missing routes (live)

| Path | Status | Notes |
| --- | --- | --- |
| `/` | 200 | Live |
| `/file` | 200 | Live |
| `/file/import/documents` | 200 | Live |
| `/file/checkout/plans` | 200 | Live |
| `/file/checkout/payment` | 200 | Live |
| `/tools` | 200 | Live |
| `/pro/dashboard` | **404** | Not in this build |
| `/tools/advance-tax` | **404** | Not in this build |
| `/blogs/upload` | **200** | Should not be public |

---

## Console / hydration / performance

Not fully instrumented in a browser session in this audit pass. **Required before launch:**

1. Chrome Lighthouse mobile + desktop on `/`, `/file`, `/file/import/documents`, `/file/checkout/plans`
2. React DevTools for double-mount / FloatingGenie leaks
3. Network waterfalls for `/api/compute` and upload

Treat absence of browser console capture as **unknown risk**, not clean bill of health.

---

## Reproduction commands (payments)

```bash
# Sold plans fail
curl -s -X POST https://lastminute-itr.vercel.app/api/payments/create-order \
  -H 'Content-Type: application/json' -d '{"planId":"normal"}'

# Legacy plan creates mock order (keys missing)
curl -s -X POST https://lastminute-itr.vercel.app/api/payments/create-order \
  -H 'Content-Type: application/json' -d '{"planId":"ai_smart"}'

# Verify blocked in production without keys
curl -s -X POST https://lastminute-itr.vercel.app/api/payments/verify \
  -H 'Content-Type: application/json' \
  -d '{"razorpay_order_id":"order_mock_1","razorpay_payment_id":"pay_1","razorpay_signature":"x","planId":"ai_smart"}'
```
