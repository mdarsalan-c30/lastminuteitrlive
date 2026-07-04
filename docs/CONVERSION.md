# Conversion Review — LastMinute ITR

**Date:** 2026-07-03 · **Live:** https://lastminute-itr.vercel.app  
**Overall conversion score: 2/10**

---

## Brutal truth

You cannot convert if **checkout does not work**.

Runtime proof:

- Homepage plans `normal` / `pro` → payment API **400**
- Even `ai_smart` → **mock order** (no Razorpay keys)
- Verify → **503 Payment verification unavailable**

**Current paid conversion rate should be treated as ~0%.**

---

## Funnel (intended)

```
Land → Trust → Start → Import → Compute value → Paywall → Pay → Companion → File on ITD
```

| Stage | Score | Leak reasons |
| --- | --- | --- |
| Land | 5/10 | Deadline anxiety works; hero is long |
| Trust | 3/10 | Illustrative reviews, placeholder pricing |
| Start | 6/10 | Name field is friendly |
| Import | 3/10 | Demo data risk; effortful |
| Value moment | 5/10 | Regime compare is good when data real |
| Paywall | 1/10 | Price 1/Item 3; price mismatch |
| Pay | 0/10 | Broken |
| Companion | n/a | Unreachable for paid users |
| Complete | n/a | — |

---

## Landing page issues

### Hero

| Issue | Severity | Why users leave | Fix |
| --- | --- | --- | --- |
| Headline focuses on deadline stress | P2 | Anxiety without calm | Pair urgency with "we'll guide you" |
| Jargon (AIS, 26AS, regime) early | P1 | Non-experts bounce | Plain language first |
| Name field is good | — | Personalization | Keep |
| Multiple CTAs | P2 | Choice paralysis | One primary CTA |

### Pricing section (conversion killer)

| Issue | Severity | Evidence |
| --- | --- | --- |
| "Price 1" / "Price 2" | P0 | Live |
| "Buy 1" / "Buy 2" | P0 | Live |
| "Item 3" / "Item 5" | P0 | Live |
| Both plans ₹339 | P0 | No differentiation |
| Strike ₹999 vs ₹1999 arbitrary | P1 | Fake discount smell |
| Bottom CTA ₹349 ≠ cards ₹339 | P0 | Confusion |
| Countdown timer | P2 | Fake urgency if perpetual |
| Offer copy mentions AI Smart while cards don't | P1 | Split-brain catalog |

### Social proof

| Issue | Severity | Fix |
| --- | --- | --- |
| "Illustrative examples" | P1 | Real reviews or relabel |
| Duplicate cards | P1 | Unique set |
| Specific ₹ savings claims | P1 | Soften or substantiate |

### Trust

| Issue | Severity | Fix |
| --- | --- | --- |
| No company address / CIN | P2 | Add legal entity block |
| Support only email | P2 | Chat SLA or WhatsApp hours |
| "DPDP compliant" claim | P2 | Link to policy evidence |

---

## Checkout UX

| Issue | Severity | Fix |
| --- | --- | --- |
| Plan IDs invalid | P0 | Align catalog |
| Razorpay missing | P0 | Configure keys |
| `alert()` for coupons | P1 | Inline UI |
| Unclear what payment unlocks | P1 | Show companion preview |
| Free vs paid matrix unclear | P1 | Entitlement table |

---

## Messaging that would convert better (direction only — not implementing)

**Hero:** "Your personal tax guide for filing on the government portal — upload Form 16, we do the math."

**Plans:** "Starter" / "Smart Guide" with 4 clear bullets each, one recommended.

**CTA:** Single price, single primary button: "Unlock portal guide — ₹X".

**Trust:** "We never file for you. You submit on incometax.gov.in."

---

## Metrics to instrument before spend

| Event | Why |
| --- | --- |
| `landing_cta_click` | Top of funnel |
| `form16_upload_success` / `demo_fallback` | Quality |
| `regime_view` | Value moment |
| `checkout_view` | Intent |
| `payment_create_fail` | **Critical now** |
| `payment_success` | Revenue |
| `companion_open` | Activation |

PostHog is in dependencies — verify it is configured in production.

---

## Conversion priority order

1. Make payment work (P0)
2. Fix plan names/prices (P0)
3. Honest connector status (P0)
4. Real or clearly labeled social proof (P1)
5. Reduce steps to first "aha" (regime compare) (P1)
6. Then optimize copy/A-B tests
