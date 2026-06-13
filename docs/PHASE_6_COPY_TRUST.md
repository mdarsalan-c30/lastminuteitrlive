# Phase 6 — Marketing & filing copy cleanup (trust)

## Copy principles

1. **Honest positioning** — LastMinute ITR is AI-assisted ITR *prep*. The user files and submits on [incometax.gov.in](https://www.incometax.gov.in). We never auto-submit or claim government integration.
2. **No outcome guarantees** — Refund and tax figures are estimates. ITD determines final amounts. No "guaranteed refund" or "100% accurate" claims.
3. **CA scope limits** — We are not a chartered accountancy firm by default. CA Review is an optional, coming-soon plan — not a replacement for professional advice on complex cases (business books, foreign assets, litigation).
4. **Why we ask** — Data-entry screens include short rationale (`whyWeAsk`) so users know why PAN, income type, deductions, and regime matter.
5. **Complex case escalation** — Unsupported or high-complexity cases surface clear copy and CTAs to explore CA Review (soon) or continue self-file with scope limits stated.

## Shared copy module

`lib/copy/trust.ts` — positioning lines, escalation banners, `WHY_WE_ASK` hints, CTA labels.

`components/filing/WhyWeAskHint.tsx` — one-line microcopy using `text-tier-feature` (Phase 3 typography).

Existing patterns reused:

- `WhyWeNeedThis` (expandable) in onboarding, income, regime
- `PlainEnglishHelp` on deductions
- `COMPANION_*` strings in `lib/copy/companion.ts` for paywall/companion flows (unchanged structurally)

## Areas changed

### Marketing

| File | Change |
|------|--------|
| `app/page.tsx` | Hero: "AI-assisted prep. You file." (was "Your AI personal CA") |
| `app/layout.tsx` | Metadata / OG / Twitter — removed CA-level and personal CA framing |
| `lib/constants.ts` | `SITE_TAGLINE`, `SITE_DESCRIPTION` |
| `components/marketing/QuickStart.tsx` | "automated mismatch and regime checks" (was CA-level) |
| `components/marketing/SiteFooter.tsx` | AI-assisted prep + no auto-file |
| `components/marketing/HeroCharacterIllustration.tsx` | "Filing guide" label (was "Your AI CA") |
| `components/filing/OptimizationTips.tsx` | "Tax summary" (was "Your AI CA summary") |
| `components/filing/PaywallValueStack.tsx` | Removed "Less than one hour with a CA" comparison |

### Filing funnel

| File | Change |
|------|--------|
| `app/file/page.tsx` | Welcome copy — automated checks, user files on portal |
| `app/file/onboarding/eligibility/page.tsx` | Why-we-ask block, escalation banner, honest CTAs |
| `app/file/income/page.tsx` | `WhyWeAskHint` + expandable salary/TDS rationale |
| `app/file/deductions/page.tsx` | Deductions why-we-ask; NPS row no longer "CA suggested" |
| `app/file/regime/page.tsx` | Expandable regime choice rationale |
| `app/file/import/documents/page.tsx` | Import why-we-ask hint |
| `app/file/checkout/plans/page.tsx` | CA Review coming-soon from shared copy |
| `app/file/cabrain/page.tsx` | Softer CA scope; not a substitute disclaimer |
| `components/filing/ConfidencePanel.tsx` | Professional review escalation with scope limits |
| `lib/payments/plans.ts` | CA plan renamed "CA Review"; description notes launching soon |

### Unchanged (by design)

- `FilingActions` / `ProductProcessFlow` structure
- Razorpay checkout and companion unlock flows
- Engine, AI layer, portal guide engine logic

## Verification

Run from project root:

```bash
npm run lint
npm run test
npm run build
```

**Results (2026-06-13):**

| Command | Result |
|---------|--------|
| `npm run lint` | ✔ No ESLint warnings or errors |
| `npm run test` | ✔ 21 files, 103 passed, 1 skipped |
| `npm run build` | ✔ Compiled successfully (Next.js 15.5.19) |
