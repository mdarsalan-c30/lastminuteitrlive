# UX Review — LastMinute ITR

**Date:** 2026-07-03 · **Live:** https://lastminute-itr.vercel.app  
**Overall UX score: 4/10**

---

## Core UX thesis (product intent)

Help ordinary Indians prepare ITR numbers and file **themselves** on incometax.gov.in with a companion guide — like a personalized CA, not an e-return portal.

That thesis is **clear in FAQ/disclaimer** and **muddied in marketing claims** ("Live" AIS, "Real-time AI", "Your person CA").

---

## Primary journey map (salaried)

```
Landing → name entry / Start return → /file
  → eligibility / profile
  → import documents
  → parsing / mismatch
  → income / deductions / HP / other
  → regime
  → review / risk
  → plans / payment
  → companion / portal guide
  → user files on ITD
```

**Friction count:** High (10+ decision screens before value).  
**TurboTax bar:** Import → confirm → review → pay → file. Fewer explicit steps.

---

## Critical UX failures

### 1. Value exchange is unclear until paywall — and paywall is broken

| Field | Detail |
| --- | --- |
| **Severity** | P0 |
| **Why bad** | User invests time uploading docs, then cannot pay or unlock guide. Rage quit. |
| **Mercury** | Never let users complete work that cannot be fulfilled. |
| **Fix** | Health-check payments before deep funnel; show "payments temporarily unavailable" at entry if broken. |

### 2. Too many concepts at once

Users must understand: Form 16, AIS, 26AS, regime, mismatch, companion, portal guide, plans, e-verify.

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Why bad** | Cognitive overload for "normal Indians" persona. |
| **Fix** | Progressive disclosure: Step 1 Upload Form 16 only. Introduce AIS only if salary mismatch risk. |

### 3. "Live" connectors that are not live

| Field | Detail |
| --- | --- |
| **Severity** | P0 |
| **Location** | Landing badges + upload API stubs |
| **Why bad** | Expectation violation is the worst UX — worse than missing feature. |
| **Fix** | Honest status chips: Live / Beta / Soon. Disable Soon uploads. |

### 4. Dual audience toggle without a complete B2B path

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | Hero "Individual Filer / B2B Model For CAs" |
| **Why bad** | Toggle implies a product; CA path is a separate login/dashboard with unclear entry. |
| **Fix** | Separate entry points: "File my ITR" vs "I'm a CA" with dedicated landing. |

### 5. Checkout uses `alert()`

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | `file/checkout/plans/page.tsx` |
| **Why bad** | Breaks flow, feels non-native, bad on mobile. |
| **Fix** | Inline validation + toast. |

### 6. Illustrative reviews presented as social proof

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Why bad** | Fine print "Illustrative examples" is easy to miss; feels deceptive. |
| **Fix** | Either real reviews with consent, or clearly labeled "Example scenarios" cards. |

---

## Screen-by-screen (filing)

| Screen | Why it exists | Keep? | UX note |
| --- | --- | --- | --- |
| `/file` | Orientation | Yes | Good |
| Eligibility | ITR form routing | Yes | Keep short |
| Profile | PAN/age/residency | Yes | Block NRI early |
| Documents | Import | Yes | Core |
| Parsing | Progress | Maybe | Auto-skip if instant |
| Mismatch | Reconciliation | Yes | Only if real data |
| Income | Manual adjust | Yes | Prefill from Form 16 |
| Deductions | 80C/80D/etc | Yes | Smart defaults |
| House property | HP schedule | Conditional | Hide if none |
| Other income | Interest etc | Conditional | Prefill from AIS when real |
| Regime | Old vs new | Yes | Hero moment |
| Review | Summary | Yes | Must show confidence |
| Risk | Notice risk | Yes | Plain language |
| Plans | Paywall | Yes | Fix copy + IDs |
| Payment | Razorpay | Yes | Fix keys |
| Companion | Portal guide | Yes | Primary paid value |
| Advisor / cabrain / comprehensive | Extra AI surfaces | **Question** | Risk of product sprawl |

**Screens that should disappear or merge:** parsing (auto), bank/tds as separate if covered by AIS, tracker (redirect-only), duplicate review subpages if redundant.

---

## Trust UX

| Signal | Status |
| --- | --- |
| Not affiliated with ITD | Present — good |
| Estimates disclaimer | Present — good |
| You file yourself | Present — good |
| Security badges | Weak (claims without detail) |
| Company identity | Thin (email only) |
| Real human support | Unclear |

**Stripe bar:** Trust is a product surface — legal entity, address, support SLA, status page.

---

## Mobile UX risks

- Long forms without section save indicators
- Floating assistant covering primary buttons
- Upload + password field keyboard overlap
- Pricing comparison hard on narrow screens

---

## Accessibility-adjacent UX

- Focus order through multi-step wizard unknown
- Error messages may not be linked to fields (`aria-describedby`)
- Color-only cheaper regime badge risk

See also `docs` accessibility notes in PRODUCT_AUDIT; full a11y pass still required.

---

## UX principles to adopt (pre-launch)

1. **One job per screen.**
2. **Never claim Live without a parser.**
3. **Fail closed on payments.**
4. **Show progress as outcomes** ("Form 16 read — 4 fields need confirm") not steps.
5. **Paid value preview** before paywall (blurred companion sample).
