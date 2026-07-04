# P2 Improvements — LastMinute ITR

**Date:** 2026-07-03  
**Definition:** Valuable polish and scale work. Schedule after P0 launch gate and P1 stabilization.

---

## Product depth

| ID | Improvement | Notes |
| --- | --- | --- |
| P2-1 | Real AIS JSON parser + reconcile UI | Required for "Live" claim |
| P2-2 | Real 26AS parser | TDS/refund accuracy |
| P2-3 | Broker imports (Groww, Zerodha) with schedule mapping | Capital gains path |
| P2-4 | F&O as business income guidance | High complexity; consider CA-only |
| P2-5 | Multi-property HP wizard | Or permanently exclude |
| P2-6 | NRI/RNOR support (or permanent exclusion marketing) | Legal complexity |
| P2-7 | ITR-2/3/4 full wizards | Only if ICP expands |
| P2-8 | Partner/CA wallet + bulk export polish | B2B motion |
| P2-9 | In-product WhatsApp/chat support | Conversion + retention |
| P2-10 | Referral program UX polish | Growth loop |

---

## Design system

| ID | Improvement |
| --- | --- |
| P2-D1 | Tokenized type/spacing/radius/shadow |
| P2-D2 | Shared Empty/Error/Loading primitives |
| P2-D3 | Brand logo integration (hands + document) sitewide |
| P2-D4 | Dark mode (optional; not required for tax season) |
| P2-D5 | Motion guidelines (reduce genie animation jank) |

---

## Engineering scale

| ID | Improvement |
| --- | --- |
| P2-E1 | Virus scanning for uploads |
| P2-E2 | Object storage for documents (not only parse-and-discard) with encryption |
| P2-E3 | Queue for heavy parse/compute jobs |
| P2-E4 | Multi-region considerations |
| P2-E5 | Full CSP + security headers review |
| P2-E6 | Pen test before major marketing spend |
| P2-E7 | Chaos/load test payments + compute |
| P2-E8 | Replace duplicated auth helpers with shared package |
| P2-E9 | OpenAPI for public/partner APIs |
| P2-E10 | Storybook for design system |

---

## Performance

| ID | Improvement |
| --- | --- |
| P2-P1 | Image CDN for marketing illustrations |
| P2-P2 | Font subsetting / `next/font` audit |
| P2-P3 | Streaming for learn articles |
| P2-P4 | Compute warm pool / provisioned concurrency |
| P2-P5 | RUM dashboards with budgets |

---

## Content / SEO

| ID | Improvement |
| --- | --- |
| P2-C1 | Editorial QA on learn library (accuracy) |
| P2-C2 | Canonical brand casing everywhere |
| P2-C3 | Comparison pages vs ClearTax/etc (careful legally) |
| P2-C4 | Localized Hindi support (big India unlock) |

---

## Explicit non-goals for v1

- Auto-submit to ITD
- Guaranteeing refunds
- Acting as a CA firm without licensing clarity
- Supporting every ITR form on day one

Stay honest: **prep + companion for simple-to-moderate resident cases**.
