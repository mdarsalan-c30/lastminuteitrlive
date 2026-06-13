# UI/UX Visual Audit — LastMinute ITR
**Agent 1 — UI/UX Visual Audit**
**Date:** 2026-06-10
**Method:** Live local dev server (localhost:3001) + full codebase inspection
**Viewport tested:** Mobile (default ~375px in Cursor browser) + code review for desktop patterns

---

## Inspected Routes

| Route | Status |
|---|---|
| `/` | ✅ Inspected (screenshot + code) |
| `/file/onboarding/signin` | ✅ Inspected (screenshot + code) |
| `/file/import/documents?source=form16` | ✅ Inspected (screenshot + code) |
| `/file/regime` | ✅ Inspected (screenshot + code) |
| `/file/review/risk` | ✅ Inspected (screenshot + code) |
| `/file/checkout/plans` | ✅ Inspected (screenshot + code) |
| `/file/companion` | ✅ Inspected (screenshot + code) |
| `/glossary` | ✅ Inspected (screenshot + code) |
| `/reviews` | ✅ Inspected (screenshot + code) |
| `/learn` | ✅ Inspected (code) |
| `/file/review/presubmit` | Partially inspected (code only) |

**Evidence:** Screenshots saved to `/var/folders/rk/.../cursor/screenshots/` (Cursor IDE browser captures)
**Codebase refs:** `app/`, `components/`, `app/globals.css`

---

## 1. Executive Verdict

The product has solid foundations: a coherent blue/white design system, thoughtful token architecture, well-structured component hierarchy, and a genuinely differentiated filing flow with the PlainEnglishField dual-label pattern. The `card-premium` system, MacroStepper, ConfidencePanel ring, and PaywallValueStack are all above-average for a v1 fintech product.

**However, the product is blocked from a PASS by two structural failures:**

1. **No mobile navigation at all on the marketing site.** `SiteHeader` hides nav links below `sm:` with zero fallback — no hamburger, no sheet, no bottom bar. On mobile (the dominant Indian internet device), the only navigable action is "Upload Form 16". Users cannot reach Pricing, Learn, Reviews, or the filing funnel entry point from a phone unless they know the URL.

2. **The filing app's right-panel "What this means" aside is permanently generic.** It shows `mirrorText` — one single static sentence per page — and the default fallback is "Government forms use legal terms. We explain each field in plain English so you know what you are declaring." on virtually every screen. This is an empty promise: the panel exists but delivers no real contextual help.

These two issues alone prevent a PASS. Everything else is fixable with hours, not weeks.

---

## 2. Scores Table (0–10)

| Dimension | Score | Rationale |
|---|---|---|
| **Premium feel** | 7 / 10 | Clean card system, good typography, hero-mesh gradient, shadow tokens are all correct. Drops points for: generic aside panel, zero page illustrations/iconography, no loading polish on regime cards. |
| **Consistency** | 7 / 10 | Filing pages use `components/filing/ui.tsx` (custom primitives); marketing uses shadcn `Card` from `components/ui/`. Two parallel card systems. `learn/page.tsx` and `reviews/page.tsx` use raw shadcn `Card`, while filing uses `card-premium`. Inconsistent but not jarring. |
| **Mobile UX** | 3 / 10 | **Critical failure.** SiteHeader collapses to logo + one CTA. No hamburger. No bottom nav. FilingLayout product nav is `hidden md:flex`. MacroStepper shows current + next only — functional, but no way to jump to any section. Entire app is designed for desktop tablet; mobile feels forgotten. |
| **Senior usability** | 5 / 10 | PAN labels are bi-lingual (plain + gov) — excellent. Glossary is linked inline — excellent. But "Layer 1 Engine progress", "Running Python L1 engine…", "No ERI auto-submit in this release" are all technical phrases that 45+ year-old salaried taxpayers will find alienating. |
| **Form clarity** | 6 / 10 | PlainEnglishField is a standout pattern. But: OTP field at sign-in creates unnecessary friction; consent checkbox is not highlighted enough; no visible inline validation (no red border on invalid PAN). "Gov term" toggle is `px-2 py-1` — too small a tap target. |
| **Trust feel** | 7 / 10 | SecurityStrip, DPDP badge, "We never file for you" reassurance, Razorpay-secured — all good signals. Diluted by: "Not affiliated with the Income Tax Department" footer copy (legally correct but undermines confidence). Only 6 reviews (small social proof pool). |
| **Conversion polish** | 6 / 10 | PaywallValueStack is genuinely differentiated — earning value before paywall is the right model. But: checkout page is hard-blocked with an amber banner before value is visible. Pricing section on landing has no plan hierarchy visual (no "Most Popular" column lift). CTA hierarchy on homepage needs clearer primary/secondary differentiation. |

**Overall composite: 5.9 / 10 — PARTIAL PASS**

---

## 3. Top 10 Visual Issues

### ISSUE 1 — No Mobile Navigation (CRITICAL)
**File:** `components/marketing/SiteHeader.tsx:26`
```tsx
<nav className="hidden items-center gap-1 text-sm sm:flex" aria-label="Main">
```
Nav links are hidden below `sm` (640px) with no mobile replacement. On phones: logo + "Upload Form 16" only. Users cannot reach Pricing, Reviews, Learn, or the manual filing entry. **This is the single biggest UX failure in the product.**

### ISSUE 2 — Filing App No Mobile Nav (CRITICAL)
**File:** `components/filing/FilingLayout.tsx:71`
```tsx
<nav className="hidden items-center gap-1 md:flex" aria-label="Product sections">
```
The File → Import → Review → Pay nav bar is hidden on < 768px. Mobile users in the filing funnel have no way to jump between major sections without knowing the URL. The MacroStepper is read-only (shows step names, not links).

### ISSUE 3 — Static "What This Means" Aside
**File:** `components/filing/FilingLayout.tsx` (aside section, lines ~100–108)
The right-column aside on every filing page shows:
> "Government forms use legal terms. We explain each field in plain English so you know what you are declaring."
This text is **identical on every page** unless `mirrorText` prop is explicitly passed. Only `FilingLayout` callers that bother to pass a custom `mirrorText` get real help. The sign-in, regime, review/risk, checkout, and companion pages all show this generic boilerplate.

### ISSUE 4 — OTP Field on Sign-in Page (CONFUSING)
**File:** `app/file/onboarding/signin/page.tsx:38–44`
A third input for OTP appears at the sign-in step with placeholder "Optional for now". Users are not asked for OTP at sign-in on any ITR portal in India — presenting this field here creates confusion about whether authentication is required now. The field is completely disconnected from any auth flow at this point.

### ISSUE 5 — Technical Language in User-Facing UI
Multiple pages expose developer/internal terminology:
- **Regime page subtitle:** "Running Python L1 engine…" (`app/file/regime/page.tsx:41`)
- **EngineProgressBar heading:** "Layer 1 · Engine progress" (`components/filing/EngineProgressBar.tsx`)
- **Companion subtitle:** "No ERI auto-submit in this release" (`app/file/companion/page.tsx:~80`)
- **Risk review subtitle:** "from Layer 1 engine output" (`app/file/review/risk/page.tsx:21`)

### ISSUE 6 — Checkout Page Hard-Blocked State is Jarring
**File:** `app/file/checkout/plans/page.tsx:46–55`
When `filingReady === false` (the normal state for incomplete users), the page leads with a large amber warning banner: "Checkout is locked until filing confidence is ready and mismatches are resolved." This feels punitive. The PaywallValueStack below it (which shows value already earned) is visually buried under the warning and plan cards are greyed out. Users who land here prematurely see a wall, not a guide.

### ISSUE 7 — Reviews Page Uses Slider for Star Rating
**File:** `app/reviews/page.tsx:6` (Slider component)
```tsx
<Slider name="5" ref={e6} value="5" />
```
A horizontal slider is the wrong UX pattern for a 1–5 star rating. Users expect clickable star icons. The Slider component (`components/ui/slider.tsx`) is a range input — this is a known accessibility anti-pattern for discrete ratings.

### ISSUE 8 — Regime Cards Show Zeros During Load (No Skeleton)
**File:** `app/file/regime/page.tsx`
While the engine loads, both regime cards show "Net payable ₹0" and are disabled. There's no loading skeleton or shimmer — just static zeros. For a first-time user, seeing ₹0 for both options before the engine responds looks broken.

### ISSUE 9 — "Not Affiliated" Footer Disclaimer Damages Trust
**File:** `components/marketing/SiteFooter.tsx` (last line)
```
© 2026 LastMinute ITR. Not affiliated with the Income Tax Department.
```
While legally necessary, this is placed as the **last visible text** on every marketing page. For seniors or first-time filers, this reads as a caveat that the tool isn't official. The framing should be more trust-positive ("Privately operated · Verified calculations · You file on the official portal") rather than a flat disclaimer.

### ISSUE 10 — Learn and Reviews Pages are Visual Dead Ends
**Files:** `app/learn/page.tsx`, `app/reviews/page.tsx`
Both pages are minimal list/card layouts that lack visual hierarchy, category filters, or a compelling above-the-fold section. The Learn page has no hero, no featured article, no estimated read time visible without scanning. The Reviews page shows only 6 testimonials, and the feedback form uses a Slider rating widget. These pages are SEO and trust pages — they need more editorial polish.

---

## 4. Top 10 Quick Wins

### QW1 — Add hamburger/sheet mobile menu to SiteHeader (2–3h)
**File:** `components/marketing/SiteHeader.tsx`
Add a Sheet (shadcn) triggered by a Menu icon on < sm. Show the same 4 nav items vertically. This alone fixes 60% of the mobile UX score. Can use shadcn `Sheet` already in dependencies.

### QW2 — Replace "Running Python L1 engine…" with user language (30min)
**File:** `app/file/regime/page.tsx:41`, `app/file/review/risk/page.tsx`, `components/filing/EngineProgressBar.tsx`
Change to: "Calculating your best regime…" / "Running tax checks…" / "Building your summary…". Strip all "Layer 1", "Python", "L1" references from user-facing text.

### QW3 — Add loading skeleton to regime cards (1h)
**File:** `app/file/regime/page.tsx`
While `loading === true`, render two skeleton cards instead of disabled ₹0 cards. Use `animate-pulse` + placeholder bars. Prevents the "broken" visual.

### QW4 — Remove OTP field from sign-in page (30min)
**File:** `app/file/onboarding/signin/page.tsx`
Delete the OTP PlainEnglishField. It serves no function at this step and creates friction and confusion. The explanatory paragraph below it covers the concern.

### QW5 — Pass contextual `mirrorText` to FilingLayout on each page (2–3h)
**Files:** All callers of `FilingLayout`
Each page should pass a specific `mirrorText` explaining what the user is doing on that screen. e.g., sign-in: "Your PAN and mobile number will be verified only when you pay or export — you can explore your estimate freely." This makes the aside panel actually useful.

### QW6 — Replace Slider with star buttons on Reviews page (1h)
**File:** `app/reviews/page.tsx`
Replace the `Slider` component with 5 clickable star icons using the same `Star` from lucide-react already imported in `ReviewsCarousel`. State: controlled by `useState(5)`. Accessible, expected, and visually clear.

### QW7 — Reframe checkout locked state (1h)
**File:** `app/file/checkout/plans/page.tsx:46–55`
Change the amber warning to an info blue banner. Move it below the `PaywallValueStack`. Text: "Complete your import and review steps to unlock payment — you're X% there." Add a direct link/button to the next incomplete step rather than just "Return to pre-submit checklist."

### QW8 — Add "Cheaper" badge only on recommended when it actually saves money (30min)
**File:** `app/file/regime/page.tsx` (RegimeOption component)
The current logic: `recommended` always gets a "Cheaper" label (with TrendingDown icon) even when `recommended === false`. The badge condition should check `recommended && savings > 0`. Already functional logic issue layered on a minor visual one.

### QW9 — Add mobile nav tabs to FilingLayout (2h)
**File:** `components/filing/FilingLayout.tsx`
Add a sticky bottom bar visible only on mobile (`flex md:hidden fixed bottom-0`) with the 4 product nav items (File, Import, Review, Pay) as icon+label tabs. This is the fastest path to a functional mobile filing experience.

### QW10 — Rewrite footer disclaimer copy (15min)
**File:** `components/marketing/SiteFooter.tsx`
Change:
> "Not affiliated with the Income Tax Department."

To:
> "Independently operated. You file directly on the official incometax.gov.in portal."

This is trust-positive, accurate, and still clarifies the relationship.

---

## 5. Components / Files Needing Improvement

| Priority | File | Issue |
|---|---|---|
| 🔴 Critical | `components/marketing/SiteHeader.tsx` | No mobile nav — add hamburger + Sheet |
| 🔴 Critical | `components/filing/FilingLayout.tsx` | No mobile filing nav — add bottom tab bar |
| 🟠 High | `app/file/onboarding/signin/page.tsx` | Remove premature OTP field |
| 🟠 High | `app/file/regime/page.tsx` | Technical language; zero-state cards during load |
| 🟠 High | All `FilingLayout` page callers | Need per-page `mirrorText` passed |
| 🟠 High | `app/file/checkout/plans/page.tsx` | Reframe locked state |
| 🟡 Medium | `app/reviews/page.tsx` | Replace Slider rating with star icons; add more reviews |
| 🟡 Medium | `components/filing/EngineProgressBar.tsx` | Strip "Layer 1" jargon |
| 🟡 Medium | `app/file/companion/page.tsx` | Remove "No ERI auto-submit in this release" from subtitle |
| 🟡 Medium | `app/file/review/risk/page.tsx` | "CA-style summary" and "Layer 1 engine output" in subtitle |
| 🟡 Medium | `components/marketing/SiteFooter.tsx` | Reframe disclaimer copy |
| 🟡 Medium | `app/learn/page.tsx` | Add above-the-fold section, featured article, categories |
| 🟢 Low | `components/marketing/PricingSection.tsx` | Add visual "most popular" column lift / elevation for AI Smart card |
| 🟢 Low | `components/filing/ui.tsx` → "Gov term" button | Increase tap target from `px-2 py-1` to `px-3 py-2` |
| 🟢 Low | `app/glossary/page.tsx` | Add alphabet jump nav or category filters for 38 terms |

---

## 6. What Can Wait

These are real issues but not blocking UX or conversion in v1:

- **Dark mode toggle** — Dark mode CSS variables are defined (`.dark` class in `globals.css`) but there is no toggle in the UI. Low priority until core mobile UX is fixed.
- **Page-level illustrations / iconography** — The filing flow is text-heavy. Adding small illustrations to ScreenTitle areas (import step, regime decision, etc.) would help but is a nice-to-have.
- **Animated counter for regime savings** — The `--motion-count: 1400ms` token is defined but unused visually; regime card amounts could animate up from zero. Nice polish, not urgent.
- **Glossary alphabet jump navigation** — 38 terms is manageable as a flat list. Worth adding when count grows past ~80.
- **Print-friendly proof checklist** — "Download proof checklist (PDF)" button on review/risk page appears to do nothing yet. Can wait until actual PDF generation is wired.
- **Learn page categories** — Currently flat list. Categorize when article count grows.
- **Breakeven deductions display** — The `xs/slate-500` text on regime page showing breakeven deductions is useful but visually buried. Promote to a callout when the value is significant.
- **Plan card visual hierarchy in marketing section** — AI Smart card doesn't visually elevate above peers in pricing section. The `card-glow` class is available and should be applied. Low-priority compared to mobile nav.
- **Sentiment filter on reviews page** — Currently shows all 6 testimonials without filter. Useful at 20+ reviews.
- **`card-premium` vs shadcn `Card` unification** — Two parallel card systems (`components/filing/ui.tsx` vs `components/ui/card.tsx`) will need reconciliation eventually. Not user-facing today.

---

## 7. Evidence Summary

### Screenshots captured (Cursor browser, ~375px viewport):
- Homepage hero: `page-2026-06-10T03-51-21-312Z.png` — Shows nav header with Upload Form 16 only; hero H1 visible
- Homepage desktop attempt: `page-2026-06-10T03-51-57-546Z.png` — Content right-aligned, nav fully visible
- Sign-in page: `page-2026-06-10T03-52-22-872Z.png` — PAN + Mobile fields visible; form card layout clean
- Regime page: `page-2026-06-10T03-52-31-249Z.png` — Left nav rail showing Income sections; Regime highlighted
- Review/risk page: `page-2026-06-10T03-52-38-446Z.png` — EngineProgressBar, 41% confidence ring visible
- Checkout/plans: `page-2026-06-10T03-52-51-291Z.png` — "Checkout locked" warning + PaywallValueStack value items
- Companion page: `page-2026-06-10T03-52-58-694Z.png` — ITR form dropdown; "No ERI auto-submit" text visible
- Glossary: `page-2026-06-10T03-53-07-085Z.png` — 38-term flat list layout
- Reviews page: `page-2026-06-10T03-53-19-973Z.png` — Review list + Slider rating widget
- Import/documents: `page-2026-06-10T03-53-44-781Z.png` — "Demo parsing" banner + ConnectorGrid

### Key component files reviewed:
- `app/globals.css` — Full design token system, dark mode, utility classes
- `components/filing/FilingLayout.tsx` — Core 3-column layout
- `components/filing/MacroStepper.tsx` — Mobile-aware step indicator
- `components/filing/PlainEnglishField.tsx` — Dual-label field pattern
- `components/filing/ui.tsx` — Filing primitive set (Button, Card, Banner, RiskBadge, etc.)
- `components/filing/ConfidencePanel.tsx` — SVG ring + expandable checklist
- `components/filing/PaywallValueStack.tsx` — Pre-checkout value statement
- `components/marketing/SiteHeader.tsx` — Responsive header (gap confirmed)
- `components/marketing/HeroNameForm.tsx` — CTA form
- `components/pricing/PlanCard.tsx` — Dual-variant plan card
- `components/marketing/SiteFooter.tsx` — Footer + disclaimer

---

## 8. Final UI Approval

```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   VERDICT: ⚠️  PARTIAL                                ║
║                                                       ║
║   Passes:  Design tokens, typography, card system,    ║
║            PlainEnglishField, MacroStepper,           ║
║            ConfidencePanel, PaywallValueStack, CTA    ║
║            hierarchy on desktop, trust signals        ║
║                                                       ║
║   Fails:   Mobile navigation (zero fallback on         ║
║            marketing header + filing layout),         ║
║            static contextual panel (aside),           ║
║            technical jargon in user-facing UI,        ║
║            OTP field confusion at sign-in             ║
║                                                       ║
║   To reach PASS, fix QW1 + QW2 + QW4 + QW9          ║
║   (all achievable in < 1 day of engineering)          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

**Must-fix before wide release (< 1 day of work):**
1. `QW1` — Hamburger menu in SiteHeader for mobile
2. `QW2` — Strip all "Layer 1 / Python / L1 engine" language
3. `QW4` — Remove OTP field from sign-in
4. `QW9` — Mobile bottom tab bar in FilingLayout

**Should-fix within first sprint:**
5. `QW3` — Regime card loading skeletons
6. `QW5` — Per-page `mirrorText` in aside panel
7. `QW7` — Reframe checkout locked state

The bones are strong. The product deserves a PASS and it's 4 fixes away from earning it.
