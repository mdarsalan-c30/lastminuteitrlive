# 41 — Design System Spec (Phase 4, Executed)

> Tokens, components and state coverage that make "homely fintech" reproducible. Grounding: the shipped palette in `frontend/app/globals.css` (kept — it's the strongest asset per UI review), the UI-review defect list, and the doc 40 screen inventory. The gap today is not color choice; it is **density drift between marketing and filing** and missing component primitives.

## 1. Token file (freeze before any Phase 7 UI code)

### Color (semantic, built on the existing values)

| Token | Value | Use |
|---|---|---|
| `primary` | `#0e5f63` (shipped) | CTAs, links, focus ring |
| `primary-fg` | `#ffffff` | text on primary |
| `mint` / `secondary` | `#bfe9e0` (shipped) | selected states, celebration surfaces — **never body text on it without checking §4** |
| `bg` | `#fafbfc` · `fg` `#0c1222` | page |
| `success` | `#059669` | refund amounts, verified, match ✓ |
| `warning` | `#d97706` | low-confidence fields, warn-severity risk |
| `danger` | `#dc2626` | blocking issues, payable amounts NEVER (payable is neutral `fg` — owing tax is not an error) |
| `info` | `#0e5f63` at 8% tint | provenance chips, "why" expanders |

**Rules:** severity colors are reserved for severity — no decorative amber/red. Regime-verdict "cheaper" badge must never be color-only (a11y: pair with ✓ label).

### Type (single scale, both surfaces)

| Token | Size/line (mobile) | Use |
|---|---|---|
| `display` | 32/38, font-display | the refund number, GATE questions |
| `title` | 22/28 | screen headers |
| `subtitle` | 17/24 | card headlines |
| `body` | 15/22 | default |
| `caption` | 13/18 | provenance chips, disclaimers — **13px is the floor**, disclaimers are content not mice-type |
| `numeric` | tabular-nums always | every rupee amount, so columns align |

Rupee formatting: Indian grouping (₹12,65,000) everywhere including charts — one `formatINR` util, no exceptions.

### Space, radius, elevation, motion

- Space: 4/8 scale, tokens `s1(4) s2(8) s3(12) s4(16) s6(24) s8(32) s12(48)`. Screen gutter mobile 16, desktop 24.
- Radius: keep shipped `--radius: 0.75rem` ramp (sm→3xl already derived in globals.css).
- Elevation: 3 levels only — `flat` (borders, default), `raised` (cards on scroll surfaces), `overlay` (sheets/popovers). No decorative shadows.
- Motion: 150–250ms ease-out; state transitions slide-forward/back matching flow direction; **`prefers-reduced-motion` disables all non-essential motion, including the EXTRACT card flips and VERIFIED celebration**.

## 2. Component primitives (build once, before screens)

The UI review's root cause: screens are hand-built, so density drifts. These 12 primitives cover ~90% of doc 40's surfaces:

| Component | Spec anchor | Notes |
|---|---|---|
| `AmountDisplay` | COMPUTE hero, plan cards | tabular, INR grouping, size variants, optional `Estimate` chip slot — **the single price/amount component that kills dual-anchor bugs** |
| `ProvenanceChip` | CONFIRM, RECONCILE, COMPUTE trace | source icon + label ("Form 16 · Part B"), tap → evidence popover |
| `ConfidenceField` | CONFIRM | read-only (high-conf) vs amber confirm-required (low-conf) variants; confirmed ✓ state |
| `ConflictCard` | RECONCILE | two-source comparison + 3 resolution buttons; severity border; resolved/collapsed state |
| `RiskCard` | RISK | validation id (caption), plain headline, consequence line, `I understand` toggle |
| `PlanCard` | ENTITLE | fed only by `plans.ts`; recommended variant with trigger expander |
| `StatusChip` | COLLECT connectors | `Live / Beta / Soon` — fed by connector config, `Soon` renders disabled dropzone |
| `DocCard` | COLLECT/EXTRACT | idle → uploading → reading → outcome-summary → failed(+manual entry CTA) |
| `StepDots` | GATE | progress dots, current/answered/pending |
| `WhyExpander` | everywhere | the collapsed "Why?" one-liner; the AI CA's uniform surface (replaces FloatingGenie) |
| `EmptyState` / `ErrorState` | all lists, all fetches | illustration slot, one action; error copy per doc 42 §6 — **no raw API errors, no `alert()`** |
| `TrustFooter` | every filing screen | "Not affiliated with ITD · You file it yourself · Estimates" — one component so the disclaimer can't drift |

## 3. State coverage matrix (definition of done per screen)

Every doc 40 screen ships with all seven states designed — this is the checklist that was "Partial/Unknown" across the board in the UI review:

| State | Standard |
|---|---|
| Loading | skeletons mirroring final layout (no spinners on full screens) |
| Empty | designed, with next action (RECONCILE empty = celebration, per doc 40) |
| Error | humanized, recoverable, field-linked where applicable |
| Success | explicit (saved ✓, paid ✓, verified 🎉) |
| Disabled | with reason ("Complete 2 must-fix items to continue") — never silently inert |
| Focus | visible 2px `primary` ring, never removed |
| Offline/slow | uploads resumable; compute shows "still working" after 3s |

## 4. Accessibility (WCAG 2.2 AA — commitments, not aspirations)

1. **Contrast:** `primary` on white = 6.0:1 ✓. **Mint surfaces:** `#0e5f63` on `#bfe9e0` ≈ 4.9:1 — passes for large text, borderline for body: rule = only `title+` weight/size or `fg` text on mint. Audit every mint chip in the current app against this.
2. **Targets:** 44×44 minimum, 56px height for GATE option cards; thumb zone = primary actions in the bottom half on mobile.
3. **Focus order = reading order** through the CONFIRM accordion and RECONCILE card stack; sheet/popover traps focus and restores it.
4. **Errors:** `aria-describedby` linking message→field; error summary at top of section with anchor links (2.2 AA).
5. **Screen reader:** amounts read as "twelve lakh sixty-five thousand rupees" (aria-label with words, not digit soup); provenance chips have full-source labels.
6. **Language:** `lang` attribute swaps correctly when the Hindi toggle (V2) lands; number formatting stays Indian in both.
7. **No keyboard traps** in the upload/password sheet (the iOS overlap fix in doc 40 doubles as the a11y fix).

## 5. Asset hygiene (from UI review P2/P3)

- Delete `next.svg`, `vercel.svg`, `globe.svg` from `frontend/public/`; only brand assets ship (final hands+document logo set).
- Brand casing frozen: **LastMinute ITR** in prose, `LastMinuteITR` as the wordmark — enforced by a lint-able copy constant, not convention.
- Reviews: real+consented or explicitly framed "Example scenarios" cards with distinct visual treatment (not testimonial styling) — the current illustrative-as-real pattern dies.

## 6. Acceptance checklist (Phase 4 gate, this doc)

- [ ] Token file reviewed and frozen (any later change = design-system PR, not screen-local override)
- [ ] 12 primitives built in Figma with all variants before screen design
- [ ] Mint-contrast rule applied to every existing mint usage (audit pass)
- [ ] State matrix signed as definition-of-done for Phase 7 UI tickets
- [ ] One keyboard-only walkthrough of the Figma prototype flags focus-order issues pre-code
