# LastMinute ITR — Design System

**Version:** 1.0 · Phase 4  
**Audience:** Engineering, design, content  
**North-star references:** Stripe (precision + trust), Linear (density + motion), Mercury (financial calm), Ramp (decisive hierarchy), TurboTax (plain-English interview)

This document defines tokens, patterns, and component specs. It is the single source of truth for unifying marketing (`components/marketing/*`) and filing (`components/filing/*`) under one premium fintech aesthetic — not a generic shadcn/Tailwind starter.

---

## 1. Brand principles

| Principle | What it means | What it is not |
|-----------|---------------|----------------|
| **Premium** | Restrained palette, intentional whitespace, subtle depth (mesh, noise, layered shadows). Numbers and status feel “bank-grade.” | Gradients everywhere, emoji CTAs, rounded-everything cartoon UI |
| **Trustworthy** | Every claim is verifiable (DPDP, no auto-submit, lawful optimization). Errors explain *why* and *what to do*. Government terms are shown honestly. | Hype (“3-minute filing”), hidden fees, vague AI magic |
| **Effortless** | One primary action per screen. Import-first flows. Plain English by default; gov terms on demand. | Long forms before value, jargon-first labels, multi-column clutter on mobile |
| **AI-first** | AI assists (suggestions, confidence, proof) — it does not replace user consent. Assistant UI is calm, never chatbot-noisy. | Floating mascot, purple “AI sparkle” on every button, fake typing indicators |

**Voice (copy tone):** Direct, warm, CA-level — like a senior accountant explaining over coffee. Short sentences. Active voice. No exclamation marks in product UI.

---

## 2. Typography

### Font stack

| Role | Font | CSS variable | Usage |
|------|------|--------------|-------|
| **Body / UI** | [Inter](https://rsms.me/inter/) | `--font-inter` / `--font-sans` | Paragraphs, labels, buttons, nav |
| **Display / headings** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | `--font-display` / `--font-heading` | h1–h3, hero, section titles, card titles |
| **Financial / tabular** | Inter + `tabular-nums` | inherit + `font-variant-numeric: tabular-nums` | ₹ amounts, percentages, regime compare, tables |
| **Gov label** | Inter, `font-medium`, `tracking-normal` | — | Official ITD field names when toggled |
| **Mono (codes, PAN, ACK)** | Geist Mono (add) or `ui-monospace` | `--font-mono` | Portal copy fields, reference numbers |

**Recommendation:** Keep Inter + Plus Jakarta Sans (already in `app/layout.tsx`). Add Geist Mono via `next/font/local` or `@fontsource/geist-mono` for gov copy blocks.

### Type scale

| Token | Size / line | Weight | Tracking | Use |
|-------|-------------|--------|----------|-----|
| `--text-display-xl` | 3.25rem / 1.08 | 800 | -0.03em | Landing hero only |
| `--text-display-lg` | 2.5rem / 1.1 | 700 | -0.025em | Marketing section heads |
| `--text-display-md` | 2rem / 1.15 | 700 | -0.02em | Filing screen title (`ScreenTitle`) |
| `--text-heading-lg` | 1.25rem / 1.3 | 600 | -0.015em | Card titles, modal titles |
| `--text-heading-sm` | 1rem / 1.35 | 600 | — | Subsection heads |
| `--text-body` | 0.875rem / 1.55 | 400 | — | Default UI copy |
| `--text-body-lg` | 1rem / 1.6 | 400 | — | Mirror drawer, long helpers |
| `--text-caption` | 0.75rem / 1.45 | 500 | — | Hints, timestamps |
| `--text-overline` | 0.6875rem / 1.3 | 600 | 0.08em | “Layer 1 · Engine”, nav rail labels |
| `--text-financial-lg` | 1.5rem / 1.2 | 700 | -0.02em + `tabular-nums` | Regime payable/refund |
| `--text-financial-md` | 1.125rem / 1.25 | 700 | `tabular-nums` | Line items, totals |
| `--text-gov-label` | 0.8125rem / 1.4 | 500 | — | ITD field names in PlainEnglish toggle |

**Rules:**
- Headings use `font-heading` (Plus Jakarta Sans). Body never uses display font except marketing hero.
- Financial figures always use `tabular-nums` and `formatINR()` from `lib/format.ts`.
- Overlines are uppercase sparingly — max one per screen (stepper label OR section label, not both).
- Avoid centered body text in filing flows (TurboTax interview is left-aligned).

---

## 3. Color system

### Brand

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--brand-blue` | `#1d4ed8` | `#3b82f6` | Primary actions, links, active step |
| `--brand-blue-dark` | `#1e3a8a` | `#1e40af` | Hover depth, hero mesh |
| `--brand-mesh-1/2/3` | see `globals.css` | toned-down 40% opacity | Hero mesh only |

### Surfaces (layer model)

Inspired by Linear/Mercury — explicit elevation, not random `bg-slate-*`.

| Layer | Token | Light | Dark | Use |
|-------|-------|-------|------|-----|
| **L0 Canvas** | `--background` | `#fafbfc` | `#0c1222` | Page background |
| **L1 Surface** | `--card` | `#ffffff` | `#151b2e` | Cards, panels |
| **L2 Raised** | `--muted` | `#f4f6f9` | `#1e293b` | Inset wells, table stripes |
| **L3 Overlay** | `--popover` | `#ffffff` | `#151b2e` | Tooltips, dropdowns |
| **Product dark** | `--surface-dark` | — | `#0a0a0a` | QuickStart band, dashboard mock |
| **Product dark +1** | `--surface-dark-elevated` | — | `#141414` | Nested cards on dark |

**Rule:** Filing shell should use `--background`, not hardcoded `#f8f9fb` (`FilingLayout.tsx`).

### Semantic

| Token | Light fg/bg | Meaning | Example copy |
|-------|-------------|---------|--------------|
| `--success` | `#059669` / `#ecfdf5` | Verified, done, recommended regime | “AIS reconciled” |
| `--warning` | `#d97706` / `#fffbeb` | Needs attention, incomplete | “Review before filing” |
| `--error` | `#dc2626` / `#fef2f2` | Blocking issue, mismatch | “TDS doesn’t match Form 16” |
| `--info` | `#2563eb` / `#eff6ff` | Neutral guidance | “What this means” drawer |

Map to existing shadcn tokens: `--destructive` = error; add `--success` and `--warning` to `:root` (currently inline Tailwind in `Banner`, `RiskBadge`).

### Text

| Token | Light | Use |
|-------|-------|-----|
| `--foreground` | `#0c1222` | Primary text |
| `--muted-foreground` | `#5b6478` | Secondary, helpers |
| `--accent-foreground` | `#1e40af` | Links on tinted bg |

**Rule:** Do not use raw `text-slate-*` in filing — use semantic tokens so dark mode works.

### Borders & focus

| Token | Value | Use |
|-------|-------|-----|
| `--border` | `#e4e8ef` | Card edges, dividers |
| `--ring` | `#2563eb` | Focus ring (3px at 50% — already in shadcn inputs) |
| `--input` | `#e4e8ef` | Field borders |

### Shadows

| Token | Use |
|-------|-----|
| `--shadow-soft` | List rows, companion steps |
| `--shadow-card` | Default cards (`.card-premium`) |
| `--shadow-premium` | Hero form, pricing featured plan |

---

## 4. Spacing & layout grid

### Base unit

**4px grid.** Tailwind spacing maps 1 = 4px. Prefer 4, 6, 8, 12, 16, 20, 24 for vertical rhythm.

| Token | Value | Use |
|-------|-------|-----|
| `--space-page-x` | 16px mobile → 24px md | Horizontal page padding |
| `--space-section-y` | 80px mobile → 112px md | Marketing sections |
| `--space-stack-sm` | 12px | Field groups |
| `--space-stack-md` | 24px | Between form sections |
| `--space-stack-lg` | 32px | Screen title → content |

### Breakpoints (mobile-first)

| Name | Min width | Layout behavior |
|------|-----------|-----------------|
| `sm` | 640px | Nav links visible; 2-col connector grid |
| `md` | 768px | Full macro stepper; filing max-width relaxes |
| `lg` | 1024px | Income nav rail visible |
| `xl` | 1280px | Form mirror aside visible |
| `2xl` | 1536px | Marketing max-w-6xl centered |

### Content widths

| Context | Max width | File |
|---------|-----------|------|
| Marketing | `max-w-6xl` (1152px) | `SiteHeader`, landing sections |
| Filing main column | `max-w-2xl` (672px) | `FilingLayout` — TurboTax interview width |
| Filing with rail | `max-w-7xl` shell | Nav + main + mirror |
| Prose / learn | `max-w-3xl` | Articles |

### Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | ~7px | Chips, badges |
| `--radius-md` | ~10px | Inputs (shadcn default) |
| `--radius-lg` | 12px (`0.75rem`) | Buttons (shadcn) |
| `--radius-xl` | 16px | Cards (filing `rounded-2xl` → standardize to xl) |
| `--radius-full` | 9999px | Pills, stepper steps |

**Rule:** Filing uses `rounded-xl` (16px) for inputs/buttons; marketing hero CTA may use same — unify to `--radius-xl` for product, `--radius-lg` for dense UI.

---

## 5. Button hierarchy

Use **`components/ui/button.tsx`** everywhere. Deprecate duplicate `components/filing/ui.tsx` `Button`.

| Variant | Visual | When to use | When not |
|---------|--------|-------------|----------|
| **Primary** (`default`) | Filled `--primary`, white text, subtle shadow | One per screen: “Continue”, “Start my return”, “Pay & unlock” | Secondary actions, destructive |
| **Secondary** (`secondary` or `outline`) | White/bg + border | Alternate path: “Upload later”, “Skip for now” | Primary CTA |
| **Ghost** | Text only, hover tint | Tertiary: “Gov term” toggle, table row actions | Main form submit |
| **Destructive** | Red tint bg, red text | Irreversible: “Discard import”, “Remove employer” | Warnings (use Banner warning) |
| **Link** | Underlined primary | Inline text actions in prose | Standalone CTAs |

### Sizes

| Size | Height | Use |
|------|--------|-----|
| `sm` | 28px | Header “File ITR”, compact tables |
| `default` | 32px | Standard forms |
| `lg` | 36px | Hero CTA, checkout |
| `icon` | 32×32 | Help, copy, dismiss |

### Rules

1. **One primary button** per viewport — secondary actions go ghost or outline.
2. Primary labels are **verb-first**: “Import Form 16”, not “Submit”.
3. Disabled = 50% opacity + `cursor-not-allowed` (already in shadcn).
4. Loading state: replace label with spinner + “Computing…” — never disable without explanation.
5. Do not mix `bg-blue-600` one-offs (`checkout/payment/page.tsx`) — use `bg-primary`.

---

## 6. Cards

### Variants

| Variant | Class / component | Use |
|---------|-------------------|-----|
| **Standard** | `components/ui/card.tsx` + ring | Settings, reviews, learn |
| **Premium** | `.card-premium` in `globals.css` | Filing sections, hero form, mirror drawer |
| **Premium dark** | `.card-premium-dark` | QuickStart mock, connector cards |
| **Selectable** | `ModeCard` pattern → extract `SelectableCard` | Regime choice, plan picker, ITR path |
| **Recommended** | Ring `ring-2 ring-primary/15 border-primary/30` | Winning regime, featured plan |
| **Glow** | `.card-glow` / `.regime-winner` | Regime winner pulse (use once per view) |

### Anatomy

```
┌─ CardHeader ─────────────────────┐
│ Overline (optional)              │
│ Title (heading-lg)               │
│ Description (muted body)         │
├─ CardContent ────────────────────┤
│ Primary content                  │
├─ CardFooter (optional) ──────────┤
│ Actions right-aligned            │
└──────────────────────────────────┘
```

**Padding:** 20px (`p-5`) filing premium; 16px (`--card-spacing`) shadcn default.

**Rule:** No `mb-4` on every card instance — parent `space-y-6` instead.

---

## 7. Tables

### Portal guide table (`PortalGuideTable`)

| Element | Spec |
|---------|------|
| Header row | `text-overline`, sticky on scroll |
| Row height | min 56px touch target |
| Status pill | Maps to semantic success/warning/error |
| Gov value cell | `font-mono text-sm tabular-nums` |
| Copy action | Ghost icon button + “Copied” toast |
| zebra | Optional `bg-muted/30` on even rows |

### Data tables (deductions, income)

- Right-align numeric columns.
- Use `formatINR()` consistently.
- Row actions: ghost buttons, never primary in every row.

---

## 8. Forms

### Field anatomy (PlainEnglish pattern)

```
Label (simple OR gov)     [Gov term toggle] [?]
─────────────────────────────────────────────
[ Input / Select / Custom children ]
Helper text (caption, muted)
[ field-tooltip if glossary open ]
```

**Components:**
- Label: `FieldLabel` → migrate to shadcn `Label` with `--text-body` + `font-semibold`
- Input: **`components/ui/input.tsx`** — filing `TextInput` duplicates styles; remove
- Select: add shadcn `Select` — filing `SelectInput` is unstyled native
- Error: `aria-invalid` on input + caption below in `--error` color

### Validation tone

| State | Copy pattern |
|-------|--------------|
| Empty required | “Enter your {simple label} to continue.” |
| Format | “PAN must be 10 characters (e.g. ABCDE1234F).” |
| Mismatch | “Form 16 shows {X}; AIS shows {Y}. We suggest {action}.” |

Never: “Invalid input”, “Error”, “Something went wrong” alone.

---

## 9. Empty, error & success states

### Empty

| Context | Layout | Copy tone |
|---------|--------|-----------|
| No imports | Illustration optional (document outline icon) | “Start with Form 16 or AIS — we’ll fill most fields for you.” + primary CTA |
| No deductions | Inline in section | “No deductions added yet. Most salaried filers claim 80C via EPF.” |
| Search / glossary | Centered, max-w-sm | “No matches. Try ‘TDS’ or ‘regime’.” |

Visual: `text-muted-foreground`, no giant empty box borders.

### Error

| Severity | Component | Example |
|----------|-----------|---------|
| Inline field | Input `aria-invalid` + red caption | PAN format |
| Section | `Banner variant="critical"` | Engine compute failed |
| Page | Card with retry | `RegimeCompareCard` error state |

Copy: **What happened → Why it matters → What to do** (3 lines max).

### Success

| Context | Component | Motion |
|---------|-----------|--------|
| Step complete | `companion-step[data-done]` green border | None |
| Import done | `Banner variant="success"` | Optional check icon fade-in 200ms |
| Filing ready | Filing-ready ring (see §11) | Count-up on refund amount |

Avoid confetti, full-screen green flashes.

---

## 10. Progress indicators

### Macro stepper (`MacroStepper.tsx`)

| State | Style |
|-------|-------|
| Done | `bg-success/10 text-success` pill |
| Active | `bg-primary text-white shadow-sm` |
| Pending | `bg-muted text-muted-foreground` |
| Connector | 12px line, success if prior done |

Mobile: current + next only (keep). Desktop: full pill row.

### Engine progress bar (`EngineProgressBar.tsx`)

- Container: `rounded-xl border bg-muted/50 p-4`
- Overline: “Layer 1 · Engine progress”
- Steps: same pill language as macro stepper
- Active step: primary fill; done: success tint

Wire on income engine screens (12–16, 19) — currently optional.

### Filing-ready ring (new spec)

Circular or arc progress 0–100% for `confidence.completeness_score`.

| Range | Color | Label |
|-------|-------|-------|
| 0–49 | warning | “Needs more data” |
| 50–79 | info | “Almost ready” |
| 80–100 | success | “Ready to review” |

Reference mock in `QuickStart.tsx` DashboardMock (87% bar) — extract to `FilingConfidenceMeter`.

Animation: width/arc transition `duration-500 ease-out` on data change only.

---

## 11. AI assistant components

Calm, proof-oriented — Stripe Radar meets TurboTax explainability.

### Suggestion chip

| Prop | Spec |
|------|------|
| Base | Rounded-full border, `text-caption`, px-3 py-1.5 |
| Default | `border-border bg-card hover:border-primary/30` |
| Applied | `border-primary/40 bg-primary/5 text-primary` |
| Label | “Suggested: claim 80CCD(1B)” — lead with action |

Existing: `Chip` in `filing/ui.tsx` → rename `SuggestionChip`, align tokens.

### Proof badge

Shows *why* AI suggested something.

| Variant | Color | Icon | Copy |
|---------|-------|------|------|
| `verified` | success | CheckCircle2 | “Matches Form 16” |
| `inferred` | info | Sparkles | “Estimated from AIS” |
| `review` | warning | AlertCircle | “Confirm with employer” |

Existing: `RiskBadge` (green/yellow/red) → map to proof semantics.

### Confidence meter

Horizontal bar + percentage (see §10). Tooltip: “Based on {n} imported documents and {m} confirmed fields.”

Data: `result.confidence.completeness_score` from tax engine.

### PlainEnglish tooltip

Existing `.field-tooltip` in `globals.css` + `PlainEnglishField.tsx`.

| Element | Spec |
|---------|------|
| Trigger | HelpCircle ghost icon, 28×28 |
| Panel | `rounded-xl border border-info/20 bg-info/5 px-3 py-2 text-caption` |
| Content | **Term bold** — one sentence plain English + optional “See glossary →” |

Gov/simple toggle: `Languages` icon + “Gov term” / “Simple” — keep.

---

## 12. Motion guidelines

Inspired by Linear — motion communicates state, not decoration.

### Timing

| Token | Duration | Easing | Use |
|-------|----------|--------|-----|
| `--motion-fast` | 120ms | `ease-out` | Hover, toggle |
| `--motion-base` | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Panels, tooltips |
| `--motion-slow` | 400ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Step transitions |
| `--motion-count` | 1400ms | ease-out cubic | INR count-up (`useCountUp`) |

### When to animate

| Do | Don’t |
|----|-------|
| Regime number count-up on slider change | Bounce on every button |
| Progress bar width on confidence change | Parallax scroll on filing |
| `.regime-winner` pulse on recommended card | Infinite shimmer on static text |
| Fade-in tooltip | Page transition slides |
| `active:translate-y-px` on buttons (shadcn) | Large hero text animations |

### Reduced motion

Respect `prefers-reduced-motion`: disable count-up, pulse, shimmer; instant state changes.

Existing: `regime-glow`, `count-shimmer`, `useCountUp` in marketing RegimeCompareCard.

---

## 13. Anti-patterns

What makes us look like a “college project” — **avoid**:

1. **Dual design systems** — shadcn on marketing, bespoke slate/blue in `filing/ui.tsx`
2. **Raw Tailwind palette** — `text-slate-900`, `bg-blue-600`, `border-slate-200` instead of CSS variables
3. **Centered filing layouts** — interview flows should be left-aligned like TurboTax
4. **Generic shadcn defaults unchanged** — `rounded-lg` + default ring card with no shadow hierarchy
5. **Stock hero** — centered headline + mesh gradient + single CTA with no product UI preview
6. **Inconsistent button radii** — mix of `rounded-lg`, `rounded-xl`, `rounded-2xl` on same screen
7. **Tiny default buttons** — shadcn `h-8` on primary CTAs (hero needs `lg`)
8. **Emoji / sparkle overload** — Sparkles on every CTA reads “AI wrapper”, not CA
9. **Unstyled native `<select>`** — breaks premium feel in deductions/regime flows
10. **Hardcoded light-only backgrounds** — `#f8f9fb`, `#ffffff` without dark tokens
11. **Wall of equal cards** — pricing/learn grids with identical weight and no featured state
12. **Missing financial typography** — non-tabular ₹ figures that jump when values update
13. **Silent loading** — “Computing…” with no skeleton or progress context
14. **Trust as tiny gray text** — compliance claims buried in `text-xs muted` only
15. **Duplicate components** — two `RegimeCompareCard`, two `Button`, two `Card` implementations

---

## 14. Component inventory — token → file mapping

| Design token / component | Canonical implementation | Files to update / consolidate |
|--------------------------|-------------------------|------------------------------|
| CSS variables (color, radius, shadow) | `:root` + `.dark` | `app/globals.css` — add `--success`, `--warning`, `--info`, motion tokens |
| Font loading | Inter + Plus Jakarta Sans | `app/layout.tsx` — add Geist Mono |
| `@theme inline` Tailwind bridge | Maps CSS → utilities | `app/globals.css` |
| `.hero-mesh`, `.section-dark` | Marketing backgrounds | `app/globals.css`, `app/page.tsx` |
| `.card-premium`, `.card-premium-dark` | Product cards | `globals.css`; use via `cn()` not duplicate in filing Card |
| `.filing-nav-link` | Product nav active state | `globals.css`, `FilingLayout.tsx` |
| `.companion-step` | Checklist rows | `globals.css`, `companion/*` |
| `.field-tooltip` | PlainEnglish panel | `globals.css`, `PlainEnglishField.tsx` |
| `.regime-winner`, `.count-shimmer` | Regime emphasis | `globals.css`, marketing + filing RegimeCompareCard |
| `Button` | shadcn/base-ui | **`components/ui/button.tsx`** — migrate all; delete filing `Button` |
| `Input` | shadcn | **`components/ui/input.tsx`** — replace `TextInput` |
| `Select` | *missing* | **Add** `components/ui/select.tsx`; replace `SelectInput` |
| `Label` | *missing* | **Add** `components/ui/label.tsx`; replace `FieldLabel` |
| `Card` | shadcn + premium variant | **`components/ui/card.tsx`** — add `variant="premium"` prop |
| `Badge` | shadcn | **`components/ui/badge.tsx`** — extend with success/warning variants |
| `Banner` | filing ui | Extract to **`components/ui/banner.tsx`** with semantic variants |
| `Tabs`, `Slider` | shadcn | `components/ui/tabs.tsx`, `slider.tsx` — already used in marketing |
| `ScreenTitle` | filing ui | **`components/filing/ScreenTitle.tsx`** — use semantic colors |
| `Chip` / SuggestionChip | filing ui | **`components/filing/SuggestionChip.tsx`** |
| `RiskBadge` / ProofBadge | filing ui | **`components/filing/ProofBadge.tsx`** |
| `ModeCard` / SelectableCard | filing ui | **`components/filing/SelectableCard.tsx`** |
| `Banner` variants | filing ui | Merge into ui/banner |
| `PlainEnglishField` | filing | `components/filing/PlainEnglishField.tsx` — wire shadcn Input |
| `MacroStepper` | filing | `components/filing/MacroStepper.tsx` — semantic tokens |
| `EngineProgressBar` | filing | `components/filing/EngineProgressBar.tsx` |
| `FilingConfidenceMeter` | *new* | Extract from `QuickStart.tsx` DashboardMock |
| `FilingLayout` | filing shell | `components/filing/FilingLayout.tsx` — `--background`, ui Button |
| `SiteHeader` / `SiteFooter` | marketing | `components/marketing/SiteHeader.tsx`, `SiteFooter.tsx` |
| `HeroNameForm` | marketing | `components/marketing/HeroNameForm.tsx` |
| `RegimeCompareCard` (marketing) | canonical interactive | `components/marketing/RegimeCompareCard.tsx` |
| `RegimeCompareCard` (filing) | *duplicate* | **Delete** `components/filing/RegimeCompareCard.tsx` — import marketing or shared |
| `PortalGuideTable` | companion | `components/filing/companion/PortalGuideTable.tsx` |
| `formatINR` / tabular | financial type | `lib/format.ts` — add `className="tabular-nums"` helper |
| `TrackerSteps` | filing ui | **`components/filing/TrackerSteps.tsx`** or merge into stepper |

### Deprecation list

Remove or merge after migration:

- `components/filing/ui.tsx` — split into ui/* + small filing-specific exports
- Inline `bg-blue-600` in checkout pages
- Duplicate regime cards

---

## 15. Implementation priority

| Phase | Work |
|-------|------|
| **P0** | Unify Button/Input/Card; semantic colors in globals; kill `filing/ui.tsx` duplicates |
| **P1** | Banner, ProofBadge, SelectableCard as shared; FilingLayout token migration |
| **P2** | FilingConfidenceMeter, Select/Label shadcn; dark mode pass on `/file` |
| **P3** | Motion tokens; reduced-motion; Geist Mono for gov fields |

---

## Appendix A — Token summary (quick reference)

```css
/* Brand */
--brand-blue: #1d4ed8;
--primary / --primary-foreground

/* Surfaces */
--background: #fafbfc;
--card: #ffffff;
--muted: #f4f6f9;
--surface-dark: #0a0a0a;

/* Semantic (to add) */
--success: #059669;
--warning: #d97706;
--error: #dc2626;  /* = --destructive */
--info: #2563eb;

/* Typography */
--font-sans: Inter;
--font-heading: Plus Jakarta Sans;
--font-mono: Geist Mono;
/* Utilities: tabular-nums on all INR */

/* Radius */
--radius-lg: 0.75rem;   /* buttons, inputs */
--radius-xl: ~1rem;      /* cards, filing */

/* Shadow */
--shadow-soft | --shadow-card | --shadow-premium

/* Motion */
--motion-fast: 120ms;
--motion-base: 200ms;
--motion-slow: 400ms;
--motion-count: 1400ms;

/* Layout */
max-w-6xl marketing | max-w-2xl filing main | max-w-7xl filing shell
```

---

## Appendix B — Top 10 anti-patterns to fix first

Priority order for maximum “premium fintech” impact:

1. **Consolidate dual Button/Input/Card systems** — route all UI through `components/ui/*`; delete duplicates in `filing/ui.tsx`.
2. **Replace raw `slate-*` / `blue-*` with CSS variables** — especially `FilingLayout`, engine bar, checkout payment button.
3. **Merge duplicate `RegimeCompareCard`** — one shared component with slider + count-up on marketing and filing.
4. **Fix filing shell background** — swap `#f8f9fb` for `bg-background` and semantic borders.
5. **Upgrade primary CTA sizing** — hero/checkout use `Button size="lg"` + `--shadow-premium`, not default `h-8`.
6. **Add tabular-nums to all INR displays** — regime compare, deductions table, portal copy values.
7. **Extract trust/compliance from footnote size** — `TrustRow` needs badge-style treatment, not lone muted sentence.
8. **Replace native `<select>`** — add shadcn Select for deductions/regime/onboarding picks.
9. **Standardize card radius and shadow** — pick `card-premium` OR shadcn Card with variant, not both per screen.
10. **Wire progress UI consistently** — `MacroStepper` visible on mobile summary; `EngineProgressBar` + confidence meter on engine screens.

---

*Related: [UX_IMPROVEMENT_PLAN.md](./UX_IMPROVEMENT_PLAN.md)*
