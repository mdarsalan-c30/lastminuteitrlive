# Design Reference — Apple.com × Quicko UX

**Owner:** Research Agent · **Program:** LastMinute ITR Apple/Quicko UX
**Status:** Research spec — no code in this doc. Each section is tagged `[IMPL: <agent/area>]` for downstream implementation.
**Grounding:** Every recommendation is anchored to our existing tokens in `app/globals.css`, layout containers in `SiteHeader.tsx` / `SiteFooter.tsx` / `FilingLayout.tsx`, and the landing structure in `app/page.tsx`. Adopt patterns; do not copy Apple or Quicko brand assets, copy, or trade dress.

---

## 0. How to read this doc

- **Adopt** = principle we should implement.
- **Avoid** = anti-pattern or brand-copy risk.
- **Token** = use the existing CSS variable / Tailwind utility named, do not invent a new value.
- **`[IMPL: ...]`** = tag telling other agents which surface owns the change.
- Where a concrete number is given (px, ms, ratio), treat it as a spec default, not a suggestion.

Our current baseline already does several things right: a sticky blurred header (`sticky top-0 ... backdrop-blur-xl`), a consistent `section-shell` rhythm, a strong footer legal/compliance cluster, and a time-delayed `landing-reveal` animation. The gaps are: **scroll-triggered** reveals (we use time delays, not the viewport), **nav shrink on scroll**, **container max-width consistency** (we mix `max-w-6xl` / `max-w-5xl` / `max-w-7xl`), and **optical alignment discipline** for icon+text and equal-height cards.

---

## 1. Apple.com patterns

### 1.1 Typography scale (SF Pro–like hierarchy) `[IMPL: design-system / globals.css]`

Apple's hierarchy is built on a few principles we should mirror with our existing `--font-display` (headings) + `--font-inter` (body):

- **Large, tight display headings.** Big size, negative letter-spacing, line-height near 1.05–1.1. We already do this on the hero (`tracking-[-0.02em] leading-[1.06]`) — promote it to a reusable scale rather than per-page magic numbers.
- **Generous body line-height.** Body copy at `1.5–1.6` line-height, never tighter. Apple uses airy paragraphs; our hero subtitle (`leading-7 / leading-8`) is the right target.
- **Few weights, high contrast in size.** Hierarchy comes from *size + weight + color*, not from many font families. Stick to: extrabold/bold for display, semibold for section headers, medium for nav, regular for body.

**Adopt — canonical type scale** (define as utilities so every page uses the same steps):

| Token name (proposed) | Size / line-height / tracking | Weight | Usage |
|---|---|---|---|
| `display-xl` | `clamp(2.5rem, 5vw, 3.2rem)` / 1.05 / -0.02em | 800 | Hero H1 only |
| `display-lg` | `clamp(2rem, 4vw, 2.5rem)` / 1.1 / -0.015em | 700 | Page H1 (glossary, terms, checkout) |
| `heading-md` | `1.5rem` / 1.2 / -0.01em | 600 | Section H2 |
| `heading-sm` | `1.125rem` / 1.3 / 0 | 600 | Card titles, H3 |
| `body-lg` | `1.125rem` / 1.6 / 0 | 400 | Hero subtitle, lead paragraphs |
| `body` | `1rem` / 1.55 / 0 | 400 | Default body |
| `caption` | `0.8125rem` / 1.4 / 0 | 500 | Microcopy, badges, legal |

- **Adopt:** color steps `text-foreground` (headlines) → `text-muted-foreground` (body) → `text-slate-500/caption` (legal). This is exactly Apple's "ink-to-grey" descent.
- **Avoid:** more than ~7 discrete sizes on a page; gradient text on anything except the single hero accent line (we already use it once on the hero — keep it scarce).
- **Senior mode note:** the existing `.senior-mode` overrides must scale these tokens too — keep the scale token-driven so `senior-mode` can bump one variable.

### 1.2 Generous whitespace `[IMPL: marketing surfaces]`

- **Adopt:** Apple's whitespace is *vertical breathing room between sections* + *wide gutters*. Our `section-shell` (48 → 60 → 72px top/bottom) is a good base; for marketing **hero-adjacent** sections, allow a larger rhythm step (see §3.2). Keep the same horizontal gutter everywhere (`px-4 sm:px-6`).
- **Adopt:** let content "float" — max line length for paragraphs `~65ch` (`max-w-xl` / `max-w-3xl` for prose). Glossary already uses `max-w-3xl` on its intro paragraph; standardize that.
- **Avoid:** filling whitespace with decorative chrome. Apple uses emptiness as confidence. One mesh gradient (we have `.hero-mesh`) is enough per page.

### 1.3 Grid alignment (12-column mental model) `[IMPL: design-system / layout]`

Apple aligns everything to an invisible 12-col grid with a fixed max content width and symmetric margins. We currently mix widths. **Standardize containers:**

- **Adopt — three container tokens:**
  - `container-marketing` = `max-w-6xl` (1152px) — landing, header, footer, pricing, regime.
  - `container-reading` = `max-w-3xl` (768px) — glossary intro, terms, legal, article prose.
  - `container-app` = `max-w-7xl` (1280px) — filing shell only (`FilingLayout`).
- **Rule:** a single page should not switch between marketing and reading widths mid-scroll unless the section is intentionally a "reading block." Glossary currently uses `max-w-5xl` on the shell + `max-w-3xl` on the paragraph — pick `container-marketing` for the shell, `container-reading` for prose, and document it.
- **12-col mental model:** hero already uses `lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]` (≈ 6/6 with optical weighting toward text). Keep content blocks on 12-col fractions: full (12), half (6/6), thirds (4/4/4), 8/4 for content+sidebar.

### 1.4 Sticky minimal nav `[IMPL: marketing / SiteHeader]`

We already have the right bones: `sticky top-0 z-50 ... bg-background/90 backdrop-blur-xl`, 56px tall (`h-14`), logo left, minimal links, single primary CTA ("Upload Form 16"). Apple-isms to add:

- **Adopt — shrink/condense on scroll** (see §4.2): reduce height `h-14 → h-12`, slightly increase background opacity (`/90 → /95`), and add a hairline shadow once `scrollY > 8px`. Animate over `--motion-base` (200ms).
- **Adopt:** keep the link set short and stable. Apple never reflows its nav. Our "More" overflow menu is the right instinct for the mid-breakpoint — good, keep it.
- **Avoid:** mega-menus, dropdown-heavy nav, or moving the CTA on scroll. The CTA stays put.

### 1.5 Scroll-reveal (fade / slide) `[IMPL: marketing / shared hook]`

**This is our biggest gap.** Today `landing-reveal` fires on **load with fixed delays** (`landing-reveal-delay-1..4`), so below-the-fold sections animate before the user reaches them. Apple reveals **as content enters the viewport**.

- **Adopt:** a shared `useRevealOnScroll` hook backed by `IntersectionObserver` (thresholds in §4.1) that toggles a `data-revealed="true"` attribute; CSS transitions opacity `0 → 1` and `translateY(16px → 0)` over `--motion-slow` (400ms) with `--motion-ease`.
- **Adopt:** stagger children with a small per-index delay (60–80ms) **only after the parent intersects** — reuse the `landing-reveal-delay-*` step values but gate them behind the observer.
- **Keep:** the existing `prefers-reduced-motion` block in `globals.css` — extend it to neutralize the new reveal states (opacity 1, no transform).
- **Avoid:** animating the hero on scroll (it's above the fold — animate it on load as we do now). Reserve scroll-reveal for sections below the fold.

### 1.6 Section rhythm `[IMPL: marketing surfaces]`

Apple alternates: **statement section → product/feature section → supporting detail → social proof → CTA**, each with consistent vertical padding and a clear focal point. Our landing order is solid (`Hero → QuickStart → PopularGuides → ReviewsCarousel → PricingSection`).

- **Adopt:** alternate background tone every other section for rhythm — `--background` (#fafbfc) ↔ `--card`/white ↔ occasional `--surface-dark` block (we have `.section-dark` ready). One dark "product" band (Apple's classic black product hero) would elevate the filing/companion explainer.
- **Adopt:** one focal element per section. Don't stack two competing CTAs in one band.
- **Token:** every section wraps in `section-shell` + `container-marketing`. No bespoke paddings.

### 1.7 CTA placement `[IMPL: marketing surfaces]`

- **Adopt — Apple's CTA cadence:** primary CTA in hero, repeated at the end of each major section as a quiet text-link or pill ("Start filing →"), and a final full-width CTA band before the footer. The CTA label stays consistent (verb-first: "File ITR", "Upload Form 16", "Start filing").
- **Adopt:** pair every CTA with one line of risk-reducing microcopy beneath it (Apple does this with pricing/financing lines). We already do this well on checkout ("What happens next: …") — replicate on the landing hero and pricing.
- **Avoid:** more than one *primary* (filled) button visible at once. Secondary actions are ghost/text style (`buttonVariants` ghost).

### 1.8 Legal microcopy placement (footer T&C cluster) `[IMPL: marketing / SiteFooter — mostly done]`

Our footer is already strong and Apple-aligned: a 4-column link grid (Learn / Product / Legal) + a separated **compliance notice band** with smaller, muted, leading-relaxed type and the official `incometax.gov.in` link. Keep, with refinements:

- **Adopt:** Apple clusters legal at the very bottom in `caption` size, muted color, generous line-height — exactly our `text-xs leading-relaxed text-muted-foreground`. Keep the compliance band visually separated by the `border-t` + tonal shift (`bg-muted/30`).
- **Adopt:** inline legal disclaimers (e.g., "estimates are illustrative") should appear **at the point of claim** too (next to refund/savings numbers), not only in the footer — Apple footnotes pricing inline with a superscript and repeats it in the footer.
- **Avoid:** burying the "we never auto-submit / you file on the portal" line — that is our core compliance promise and should appear in the footer (it does) and near every paywall CTA (it does on checkout). Keep that consistent.

---

## 2. Quicko patterns (Indian tax filing)

*Sources: quicko.com, help.quicko.com (Form 16 / salary flow), Quicko ITR filing FAQs (AY 2025-26), Zerodha×Quicko integration notes. We adopt UX behaviors, never their brand, copy, or layout verbatim.*

### 2.1 Taxpayer-friendly copy `[IMPL: copy / all surfaces]`

- **Adopt:** Quicko's positioning is "file without digging through tax jargon." Plain-English first, legal term second. We already do this (`PlainEnglishHelp`, glossary, FilingLayout `mirrorText`). Reinforce: every government field label gets a one-line plain-English gloss inline.
- **Adopt:** outcome-oriented section names ("Save, Pay, File & Track") instead of form names. Mirror with verb-first nav we already use ("File", "Import", "Review", "Pay").
- **Avoid:** copying Quicko's exact strings. Write our own voice (LastMinute = urgency + reassurance).

### 2.2 Trust badges `[IMPL: marketing / TrustBar, SocialProofBar]`

Quicko leans hard on trust signals: **ERI (e-Return Intermediary) authorization, ISO certifications, regular audits, data-security protocols**, plus named testimonials with role/company.

- **Adopt:** a compact trust strip near the hero and near the paywall with: security/encryption cue, "data handled per Privacy Policy," and our honest status. **Critical compliance difference:** we are *not* an ERI and *not* a CA firm by default (per our footer). So our trust badges must say what we *are*: "CA-level checks before you file," "you submit on the official portal," "bank-grade data handling." Do **not** imply ERI/government authorization.
- **Adopt:** named, role-tagged testimonials (we have `ReviewsCarousel`) — keep the "Product manager at a tech firm" style specificity; it reads credible.
- **Token:** badges use `caption` type, `--muted-foreground`, pill shape (`rounded-full border`), with a single accent icon — matches our existing hero pills.

### 2.3 Filing funnel clarity `[IMPL: filing / FilingLayout, MacroStepper]`

Quicko's funnel: **gather income (multi-source) → apply deductions/credits → review for accuracy → e-submit.** It auto-determines the ITR form from the data ("you focus on entering details, we choose the form").

- **Adopt:** keep the macro-stepper always visible (we have `MacroStepper` in the filing header) so users always know where they are and what's left — Apple/Quicko both anchor progress.
- **Adopt — auto form selection as a visible reassurance:** Quicko hides form choice ("report STCG → ITR-2; add business → ITR-3"). We already compute `recommendedForm`. Surface it as a calm, explained chip ("Based on your income, we'll use ITR-2") rather than asking the user to pick. This removes the single most intimidating decision.
- **Adopt:** per-section completeness dots (we have these in `FilingLayout` nav rail: emerald = complete, slate = pending). Keep, and mirror into the mobile bottom tabs.

### 2.4 Regime compare `[IMPL: marketing / RegimeCompareCard + filing /file/regime]`

Quicko defaults to the **new regime** (per Finance Act 2024) and offers a **Regime Analyzer** showing tax liability under both regimes side by side before submission.

- **Adopt:** two balanced, equal-height cards (old vs new) with the rupee liability for each and a single "recommended" marker. We already have `RegimeCompareCard` + the `.regime-winner` pulse animation — good. Ensure the **default selection matches the law (new regime default)** while making the comparison one glance away.
- **Adopt:** show the *delta* prominently ("New regime saves you ₹X") — outcome framing, not a table dump. Our `regimeSavings` value already flows through checkout (`PaywallValueStack`); surface it on the landing regime card too.
- **Avoid:** a dense multi-row comparison table on the landing page. Save the full breakdown for `/old-vs-new-regime` and `/file/regime`.

### 2.5 Form 16 prominence `[IMPL: marketing hero + filing import]`

Quicko offers three salary-entry paths in priority order: **Prefill/Autofill (recommended) → Upload Form 16 → Manual entry**, with Form 16 upload as drag-and-drop (PDF, both Part A & B from TRACES), and multiple Form 16s for job switchers.

- **Adopt:** Form 16 upload is the hero action — we already do this (header CTA "Upload Form 16", `?source=form16`). Keep it the most prominent path into the funnel.
- **Adopt:** support **multiple Form 16 uploads** (job-switch case) as an explicit, friendly affordance ("Changed jobs? Add another Form 16"). Surface near the upload card.
- **Adopt:** drag-and-drop card with PDF icon, progress, success check, and clear constraints (format/size) — matches `DESIGN_IMAGE_PROMPTS.md` prompt #4. State the constraints *before* upload to prevent errors (Quicko states "PDF, ≤6MB, both parts from TRACES").
- **Adopt the three-path mental model**, but order it for *our* trust posture: since we are companion-mode (not ERI autofill), our priority is **Upload Form 16 → Manual → (guided portal autofill instructions)**. Don't claim ITD autofill we don't have.

---

## 3. Auto-alignment principles `[IMPL: design-system / all surfaces]`

### 3.1 Consistent max-width containers
Use the three container tokens from §1.3 (`container-marketing` 1152 / `container-reading` 768 / `container-app` 1280). Audit every page for stray widths (`max-w-5xl` on glossary is the known offender). One page = one primary container width.

### 3.2 Vertical rhythm (8px grid)
- **Adopt:** all spacing is a multiple of 4px, preferring 8px steps (Tailwind `2/4/6/8/12/16/20/24` = 8/16/24/32/48/64/80/96px). Our tokens already align; enforce it.
- **Section padding scale:** `section-shell` (48/60/72) for standard bands; a larger `section-shell-lg` (72/96/120) for hero-adjacent statement sections to get Apple's air.
- **Intra-section rhythm:** label → headline `mt-3`, headline → lead `mt-4`, lead → CTA `mt-6/mt-7`, block → block `gap-8/gap-10`. This matches the hero's existing `mt-5/mt-6/mt-7` cadence — promote to a documented rule.

### 3.3 Optical alignment for icons + text
- **Adopt:** icon and text baselines should align *optically*, not by bounding box. For inline icon+label, use `inline-flex items-center gap-2` and size the icon to ≈ 0.85× the cap height of the text (our `size-3.5`/`size-4` next to `text-sm` is correct). Nudge purely decorative icons up by ~0.5px when they read low.
- **Adopt:** leading icons in pills/badges get `gap-2`; trailing chevrons get `gap-0.5` to `gap-1` and `opacity-60` (we already do this in `NavMoreMenu`). Keep consistent.
- **Avoid:** centering an icon by line-height alone in multi-line contexts — anchor it to the first line (`items-start` + matching line-height).

### 3.4 Equal card heights
- **Adopt:** cards in a row are always equal height regardless of content (Apple's product grids, Quicko's regime cards). Use `grid` with `items-stretch` (default) and make card internals `flex flex-col` with the CTA pinned via `mt-auto`. Applies to: pricing (`PlanCard`), regime old/new, PopularGuides, glossary result cards.
- **Token:** card chrome = `card-premium` (existing utility: 1rem radius, `--shadow-card`, hairline border). Don't invent new card styles.

### 3.5 Baseline alignment for headlines
- **Adopt:** when a section has a left headline + right content (like our hero), align the headline's **first baseline** with the top of the adjacent block (`items-start` on the grid, which the hero already uses). For multi-column feature rows, align all headlines to the same baseline by giving them equal min-height or by placing them in their own aligned grid row.
- **Adopt:** in 2-up/3-up feature grids, separate the icon row, the title row, and the body row into aligned bands so titles line up even when one is two lines.

---

## 4. Scroll / navigation logic `[IMPL: marketing / shared hook + SiteHeader]`

### 4.1 When elements animate in (IntersectionObserver thresholds)
- **Trigger:** element reveals when **≥ 15% visible** OR its top crosses 88% of viewport height. Use `rootMargin: "0px 0px -12% 0px"` + `threshold: 0.15` so reveal fires slightly before full entry (feels responsive, not laggy).
- **Once:** unobserve after first reveal (`data-revealed="true"` is sticky) — Apple never re-hides on scroll-up.
- **Stagger:** direct children stagger by `index * 70ms`, capped at ~4 steps (reuse `landing-reveal-delay-*` values).
- **Motion:** opacity `0→1`, `translateY(16px→0)`, `--motion-slow` (400ms), `--motion-ease`. Optional `translateY(24px)` for larger hero-band media.
- **Reduced motion:** honor `prefers-reduced-motion` (extend existing block) → instant, no transform.

### 4.2 Nav shrink on scroll
- **State A (top, scrollY ≤ 8):** `h-14`, `bg-background/90`, no shadow.
- **State B (scrolled, scrollY > 8):** `h-12`, `bg-background/95`, hairline `--shadow-soft`, logo mark unchanged (Apple keeps the logo stable; only chrome condenses).
- **Implementation:** a `useScrollState` hook (rAF-throttled scroll listener or a sentinel `IntersectionObserver` at the top of `<body>`), toggling a `data-condensed` attribute on `<header>`. Transition height/opacity over `--motion-base` (200ms).
- **Filing header (`FilingLayout`)** also condenses, but the `MacroStepper` must remain legible — shrink padding only, not the stepper.

### 4.3 Smooth anchor scroll
- **Adopt:** we already set `html { scroll-smooth }` — good. Add `scroll-margin-top` equal to the condensed header height (`scroll-mt-16` ≈ 64px, or `scroll-mt-14`) on all anchor targets (`#pricing`, etc.) so sticky-nav doesn't cover the heading on jump.
- **Adopt:** in-page anchor links (footer "Pricing" → `/#pricing`, hero → sections) animate smoothly; cross-page anchors land with correct offset via `scroll-margin`.

---

## 5. Image strategy `[IMPL: design / public/illustrations + page slots]`

Builds on existing `docs/DESIGN_IMAGE_PROMPTS.md` (keep that as the prompt source of truth). This section specifies **placeholder slots + aspect ratios** per surface and the warmth/emptiness intent.

### 5.1 Hero human warmth
- **Slot:** landing hero right column (currently `/illustrations/hero-companion.svg`, `640×420`, ≈ `3:2`). Keep `3:2`, `priority`, `object-cover`, hairline border + `--shadow-soft`.
- **Intent:** Apple's hero warmth = a real, calm human moment. Our flat-illustration Indian professional is on-brand; ensure it reads *confident and relieved*, not stocky. Reserve one warm human visual per major surface.
- **Aspect-ratio reservation:** always wrap in a fixed-ratio container (`aspect-[3/2]`) so layout never shifts during load (CLS = 0).

### 5.2 Empty states
- **Slots & ratios:**
  - Glossary no-results: `1:1` (prompt #7), `aspect-square`, max ~280px, centered, muted.
  - Filing section with no data yet (e.g., no house property): `4:3` friendly nudge illustration + one-line prompt + primary action.
  - Companion wizard not started: `16:10` (prompt #5).
- **Intent:** empty states are *invitations*, not dead ends — illustration + one sentence + one action. Keep light and airy (Apple) and jargon-free (Quicko).

### 5.3 Companion
- **Slot:** companion explainer / `/file/companion` — `16:10` wizard walkthrough (prompt #5) showing step cards (profile → income → deductions → review → submit) with directional flow.
- **Intent:** reinforce "you stay in control, file on the portal." Visual should depict *guidance*, not automation.

### 5.4 Placeholder + aspect-ratio rules (all images)
- Every `<Image>` gets explicit `width`/`height` (or `fill` + ratio wrapper) — we already pass dims on the hero. Enforce repo-wide to protect CLS.
- Below-the-fold images: `loading="lazy"` (default) + a subtle skeleton/`bg-muted` placeholder at the reserved ratio. Hero only: `priority`.
- Standard ratios palette: `3:2` (heroes/feature), `4:3` (upload/onboarding), `16:9`/`16:10` (banners/walkthroughs), `5:4` (regime support), `1:1` (badges/empty). Don't introduce new ratios ad hoc.

---

## 6. Map to our pages

Legend: **A** = Apple pattern, **Q** = Quicko pattern. Each row is an actionable change with an owner tag.

### 6.1 Landing (`app/page.tsx`) `[IMPL: marketing]`
- Convert below-the-fold sections (`QuickStart`, `PopularGuides`, `ReviewsCarousel`, `PricingSection`) from **time-delayed** `landing-reveal` to **scroll-triggered** reveal (§1.5, §4.1). Hero stays load-animated. **[A]**
- Standardize all bands to `container-marketing` + `section-shell`; add one `.section-dark` "product/companion" band for rhythm. **[A]**
- Add nav shrink-on-scroll (§4.2). **[A]**
- Add a trust strip below hero (security + "you file on the portal" + bank-grade data) — honest, non-ERI wording (§2.2). **[Q]**
- Promote regime savings delta onto the hero `RegimeCompareCard` ("New regime saves ₹X"), default-select new regime (§2.4). **[Q]**
- Add a final full-width CTA band before footer with consistent verb-first label + one microcopy line (§1.7). **[A]**

### 6.2 Glossary (`app/glossary/page.tsx`, `GlossarySearch`) `[IMPL: marketing]`
- Fix container: shell → `container-marketing`, prose intro → `container-reading` (§1.3). **[A]**
- Equal-height result cards via `flex flex-col` + `card-premium` (§3.4). **[A]**
- `1:1` empty-state illustration + one-line prompt for no-results (§5.2). **[A/Q]**
- Plain-English-first definitions (already the model) — keep term name secondary to the simple gloss (§2.1). **[Q]**
- Scroll-reveal the term grid in staggered batches (§4.1). **[A]**

### 6.3 Terms / legal (`app/terms/page.tsx`, privacy, refund, disclaimer) `[IMPL: marketing/legal]`
- Use `container-reading` (768px), `caption`→`body` type scale, generous line-height (§1.1). **[A]**
- Sticky in-page section nav / table of contents on the left at `lg+`, with `scroll-mt` offsets (§4.3). **[A]**
- Keep footer compliance band consistent across all legal pages (it's global via `SiteFooter`). **[A]**

### 6.4 Checkout (`/file/checkout/plans`, `/payment`) `[IMPL: filing]`
- Equal-height `PlanCard`s with CTA pinned `mt-auto`; "recommended" marker = single accent, like regime winner (§3.4, §2.4). **[A/Q]**
- Keep the existing "What happens next" microcopy under the CTA — this is the Apple legal-inline pattern done right; replicate near any savings/refund number (§1.7, §1.8). **[A]**
- Surface the auto-selected ITR form as a calm explained chip ("We'll use ITR-1 — salaried, no capital gains") instead of a manual choice (§2.3). **[Q]**
- Trust strip near paywall: bank-grade data + "you submit on incometax.gov.in" (non-ERI wording) (§2.2). **[Q]**

### 6.5 Filing flow (`FilingLayout` + step pages) `[IMPL: filing]`
- Keep three-column `container-app` shell; condense the filing header on scroll (keep `MacroStepper` legible) (§4.2). **[A]**
- Mirror completeness dots from the desktop nav rail into the mobile bottom tabs (§2.3). **[Q]**
- Form 16 import: drag-and-drop with stated constraints up front (PDF, size, both parts), success state, and **multiple Form 16** affordance for job-switchers (§2.5). **[Q]**
- 8px vertical rhythm + `body-lg` for field help; ensure `senior-mode` scales the new type tokens (§1.1, §3.2). **[A]**
- Per-field plain-English gloss inline (extends `PlainEnglishHelp`) (§2.1). **[Q]**

### 6.6 Companion (`/file/companion`, `PortalFootprintWizard`) `[IMPL: filing/companion]`
- `16:10` wizard walkthrough illustration + step cards; emphasize "you stay in control" (§5.3). **[A/Q]**
- Reveal step cards on scroll with stagger (§4.1). **[A]**
- Reassurance microcopy beside each step (mismatch/done states already exist via `.companion-step[data-*]`) — keep the color-coded states, add plain-English explanations (§2.1). **[Q]**

---

## 7. Implementation backlog (tag index for other agents)

Quick index of net-new shared primitives downstream agents should build first (everything else consumes these):

1. `[IMPL: design-system]` Type-scale utilities (§1.1) + three container tokens (§1.3) in `globals.css` / Tailwind config.
2. `[IMPL: marketing/shared]` `useRevealOnScroll` (IntersectionObserver, §4.1) + CSS reveal states (extend `prefers-reduced-motion` block).
3. `[IMPL: marketing/shared]` `useScrollState` for nav condense (§4.2); wire into `SiteHeader` and `FilingLayout` header.
4. `[IMPL: design-system]` Equal-height card pattern + `scroll-mt` anchor offsets (§3.4, §4.3).
5. `[IMPL: copy]` Trust-badge copy that is honest about non-ERI / companion posture (§2.2).
6. `[IMPL: design]` Aspect-ratio reservation + placeholder convention for all `<Image>` (§5.4).

### Compliance guardrails (do not violate)
- Never imply we are an ERI, a CA firm (unless a CA plan is purchased), or that we submit to ITD. All trust copy must reflect **companion mode**: the user files/e-verifies on `incometax.gov.in`.
- Estimates are illustrative — repeat that disclaimer inline next to any rupee/refund/savings figure, plus the footer band.
- Adopt Apple/Quicko *patterns and behaviors only* — no copied strings, logos, layouts, or brand assets.
