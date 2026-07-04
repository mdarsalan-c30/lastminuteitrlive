# UI Review — LastMinute ITR

**Date:** 2026-07-03 · **Live:** https://lastminute-itr.vercel.app

---

## Overall UI score: **5/10**

Visual system is closer to a modern fintech than a student project (teal/mint, cards, rounded CTAs), but production still shows **staging-quality content** and inconsistent density between marketing and filing.

---

## What works

| Area | Notes |
| --- | --- |
| Color system | Dark teal + mint aligns with companion logo direction |
| Marketing layout | Clear sections: hero, how-it-works, tools, import, why, reviews, pricing, FAQ |
| Compliance strip | "Independently operated — not affiliated with ITD" is present |
| Tools page | Clean cards; ITR type quiz is usable |
| Filing entry (`/file`) | Calm, focused start screen |

---

## Critical UI issues

### 1. Placeholder pricing components (P0)

| Field | Detail |
| --- | --- |
| **Severity** | P0 |
| **Location** | Homepage Pricing; `lib/payments/plans.ts` |
| **Evidence** | "Price 1", "Price 2", "Buy 1", "Buy 2", "Item 3", "Item 5" |
| **Why bad** | Looks unfinished. Users assume the whole product is unfinished. |
| **Stripe/Mercury** | Product names and feature lists are design-system content, reviewed like code. |
| **Fix** | Real plan names, icons, feature lists, primary/secondary button hierarchy. |

### 2. Dual price anchors on one page

| Field | Detail |
| --- | --- |
| **Severity** | P0 |
| **Location** | Pricing cards ₹339 vs bottom CTA ₹349 |
| **Why bad** | Visual contradiction; erodes trust more than a high price. |
| **Fix** | One amount component fed by pricing config. |

### 3. Review carousel duplication

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | Homepage Reviews |
| **Evidence** | Same Priya/Rahul/Ananya cards appear multiple times in page content |
| **Why bad** | Feels like a broken marquee, not social proof. |
| **Fix** | Unique cards; if infinite scroll, clone only in animation layer not SEO DOM. |

### 4. Marketing vs filing visual language drift

| Field | Detail |
| --- | --- |
| **Severity** | P2 |
| **Location** | Marketing pages vs `/file/*` |
| **Why bad** | Filing screens feel denser and more "admin tool"; marketing feels consumer. |
| **Linear/Mercury** | One design system, shared type scale, spacing tokens. |
| **Fix** | Shared tokens for type (display/title/body/caption), 4/8 spacing, radius, shadow elevation. |

### 5. Placeholder / default assets

| Field | Detail |
| --- | --- |
| **Severity** | P2 |
| **Location** | `frontend/public/` (`next.svg`, `vercel.svg`, `globe.svg`) |
| **Why bad** | Unbranded assets signal incomplete polish. |
| **Fix** | Ship only brand assets; use final logo (hands + document). |

### 6. Floating companion / genie risk

| Field | Detail |
| --- | --- |
| **Severity** | P2 |
| **Location** | `FloatingGenie.tsx` (~644 lines) |
| **Why bad** | Overlays often collide with CTAs, cookie banners, mobile keyboards. |
| **Fix** | Constrain to filing routes; respect safe areas; pause on modals. |

---

## Typography & spacing

| Issue | Severity | Recommendation |
| --- | --- | --- |
| Mixed brand casing in header/footer | P3 | Pick `LastMinute ITR` or `LastminuteITR` and enforce |
| Feature bullets with awkward hyphens ("Pro - level") | P1 | Editorial pass |
| Long FAQ/legal blocks | P2 | Better hierarchy, sticky TOC on legal pages |
| Regime card on homepage is strong | — | Keep; ensure accessible slider |

---

## Responsive / mobile (risk register)

Not fully device-lab tested in this pass. **Assume risk** on:

- Pricing cards side-by-side on small screens
- FloatingGenie covering primary CTAs
- Form 16 upload zone + password field on iOS Safari
- Admin tables horizontal overflow

**Mercury bar:** Every primary flow must be thumb-reachable with 44×44 targets.

---

## States checklist (incomplete in product)

| State | Status |
| --- | --- |
| Loading | Partial — missing skeletons on several filing steps |
| Empty | Partial — import grid OK; some lists unclear |
| Error | Partial — API errors exist; not always humanized |
| Success | Partial — payment success path broken |
| Hover | Marketing buttons OK; filing density varies |
| Focus | **Unknown** — needs keyboard pass |
| Disabled | Checkout gates exist; messaging weak |

---

## UI score by surface

| Surface | Score | One-line |
| --- | --- | --- |
| Marketing | 6/10 | Good bones, bad pricing content |
| Filing | 5/10 | Functional but heavy |
| Checkout | 3/10 | Placeholder + broken |
| Tools | 7/10 | Cleanest consumer UI |
| Admin/CA | 5/10 | Internal-tool aesthetic |

---

## How a design-led fintech would ship UI

1. Freeze a **token file** (color, type, space, radius, elevation).
2. Build **PlanCard**, **TrustBadge**, **EmptyState**, **ErrorState** primitives.
3. Content freeze 48h before launch (no "Item 3").
4. Visual QA checklist on iPhone SE, Pixel, iPad, 1440px desktop.
