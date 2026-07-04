# P1 Improvements — LastMinute ITR

**Date:** 2026-07-03  
**Definition:** Important before meaningful growth; not always launch-blocking if P0s fixed, but should ship in first week post-gate.

---

## Product / UX

| ID | Improvement | Why | How Stripe/TurboTax would do it |
| --- | --- | --- | --- |
| P1-U1 | Collapse filing steps (merge parsing into upload) | Faster time-to-value | Outcome-based progress |
| P1-U2 | Progressive disclosure for AIS (only if needed) | Less cognitive load | Ask only when risk detected |
| P1-U3 | Separate CA vs Individual entry | Clear ICP paths | Distinct products/surfaces |
| P1-U4 | Companion preview before paywall | Raise willingness to pay | Sample guide screens |
| P1-U5 | Real reviews or honest "example scenarios" | Trust | Verified testimonials |
| P1-U6 | Remove/disable Groww/MFCentral until live | Honesty | Feature flags |
| P1-U7 | Breadcrumbs + save status in filing | Orientation | Persistent draft chip |
| P1-U8 | Replace alerts/toasts consistently | Polish | Design system feedback |

---

## Engineering

| ID | Improvement | Why |
| --- | --- | --- |
| P1-E1 | Single plan catalog module | End ID drift forever |
| P1-E2 | Payment webhooks | Reliable entitlements |
| P1-E3 | Server-side amount/plan verification via Razorpay API | Prevent entitlement fraud |
| P1-E4 | Upstash rate limits on auth/upload/pay/compute/AI | Abuse protection |
| P1-E5 | Sanitize HTML content | XSS |
| P1-E6 | Verify admin session in middleware | Defense in depth |
| P1-E7 | Structured logging + Sentry | Operability |
| P1-E8 | Payment + parser contract tests in CI | Regression proof |
| P1-E9 | Split `review/page.tsx` and FloatingGenie | Maintainability |
| P1-E10 | Move learn content off client bundles | Performance |

---

## Tax

| ID | Improvement | Why |
| --- | --- | --- |
| P1-T1 | Hard-block on `demo_fallback` | Accuracy |
| P1-T2 | Shared eligibility module (tools + filing) | Consistency |
| P1-T3 | Explicit "TDS unknown" when no 26AS | Refund honesty |
| P1-T4 | Confidence panel always visible on review | Trust |
| P1-T5 | Ship or remove advance tax tool | Persona coverage |
| P1-T6 | Golden scenario CI (50 cases) | Accuracy gate |

---

## Conversion / growth

| ID | Improvement | Why |
| --- | --- | --- |
| P1-C1 | Differentiated plan prices/features | Choice architecture |
| P1-C2 | Instrument full funnel in PostHog | Learn leaks |
| P1-C3 | One primary price CTA sitewide | Clarity |
| P1-C4 | Legal entity + support hours in footer | Trust |
| P1-C5 | Exit-intent only after value moment | Less spammy |

---

## Accessibility

| ID | Improvement | Why |
| --- | --- | --- |
| P1-A1 | Keyboard pass on filing + checkout | Inclusion / compliance |
| P1-A2 | Focus traps for modals/genie | A11y |
| P1-A3 | Contrast audit on mint-on-white | Readability |
| P1-A4 | Associate errors with inputs | Forms |

---

## Suggested sprint (1 week after P0)

1. Catalog + webhooks + amount verify  
2. Parser honesty + confidence UI  
3. Funnel analytics  
4. A11y keyboard pass on money path  
5. Content/trust pass (reviews, badges)
