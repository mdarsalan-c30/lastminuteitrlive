# Simulation Matrix — LastMinute ITR

Combinatorial filing simulation for marketing CTAs, draft inputs, compute engine, and journey routing.

**Last run:** 2026-06-13  
**Harness:** `lib/simulation/` + `npm run simulation`  
**E2E smoke:** `e2e/cta-paths.spec.ts`

---

## Summary (latest run)

| Metric | Value |
|--------|------:|
| Compute scenarios | 9,999 |
| ITR-3 matrix scenarios | 60 |
| **Total scenarios** | **10,059** |
| Passed | 10,059 |
| Failed | 0 |
| Duration | ~137s (Node, concurrency 12) |
| Vitest unit tests | 161 pass (153 existing + 8 simulation) |
| Lint / build / predeploy | Pass |
| Production deploy | https://lastminute-itr.vercel.app |

### Bugs found & fixed

1. **Negative GTI when HP loss exceeds other income** (`engine/orchestrator.py`)  
   House-property loss could drive `gross_total_income` below zero. Fixed by flooring GTI at `0` after head aggregation.

2. **ITR form mismatch when salary > ₹50L but matrix band low** (`lib/filing/case-matrix.ts`, `lib/engine/draftToUserInput.ts`)  
   Frontend case-matrix used only `matrix.income` while the Python profiler also checks actual gross salary. Added `incomeBandFromGross()` and optional `grossSalary` to `resolveRecommendedForm()`; `draftToUserInput` now sends the higher of matrix band vs salary-derived band.

3. **Regime cards stuck disabled during debounce window** (`lib/hooks/useDraftTaxCompute.ts`)  
   After the 300ms recompute debounce, regime compare showed disabled cards before compute started (`loading=false`, no `regime_comparison`). Added `awaitingCompute` so `loading` stays true until the debounced run finishes.

### E2E CTA smoke (`e2e/cta-paths.spec.ts`)

- 9 tests covering marketing + filing entry paths
- Playwright `reducedMotion: 'reduce'` for stable ScrollReveal sections
- `NEXT_PUBLIC_BYPASS_PAYMENT=true` in `playwright.config.ts`
- Dev-server first-compile latency can make navigation tests slow; use `expect(page).toHaveURL()` (not `waitForURL` + `load`) for Next.js client transitions

---

## CTA → Route → Expected behavior

| Source | CTA / action | href | Journey step | Expected behavior |
|--------|--------------|------|:------------:|-------------------|
| Landing hero | Start filing (priced) | `/file/checkout/plans?plan=ai_smart` | E | Plans/paywall; value stack |
| Landing hero | Upload Form 16 | `/file/import/documents?source=form16` | A | Form 16 import mode |
| Landing hero | See how it works | `#how-it-works` | — | In-page anchor |
| HeroNameForm | Start my return | `/file/onboarding/eligibility?step=about-you` | A | Eligibility onboarding |
| FinalCta | Primary (priced) | `/file/checkout/plans?plan=ai_smart` | E | Checkout plans |
| FinalCta | Start free estimate | `/file/onboarding/eligibility?step=about-you` | A | Eligibility |
| Form16QuickCard | Yes — upload | `/file/import/documents?source=form16` | A | Fast path import |
| Form16QuickCard | No — manual | `/file/income` | A | Manual income entry |
| QuickStart | Form 16 / AIS / Groww / MFCentral | `/file/import/documents?source=*` | A | Connector import |
| ItrTypeQuiz | itr1 result | `/file` | A | Welcome → eligibility |
| ItrTypeQuiz | itr2 result | `/file` | A | Welcome → eligibility |
| ItrTypeQuiz | talkToCa result | `/file/onboarding/eligibility` | A | Expert path eligibility |
| `/file` welcome | Start my return | `/file/onboarding/eligibility?step=about-you` | A | Onboarding |
| `/file` welcome | Companion | `/file/companion` | F | Portal guide (paywall or bypass) |
| Filing routes | Form16 fast path | `buildDocumentsFastPathUrl()` | A | Auto-redirect with salary chip |
| Filing routes | Parsing | `/file/import/parsing?source=form16` | B | Parse + first compute |
| Presubmit (legacy URL) | Bookmark | `/file/review/presubmit` | E | **Redirects** → `/file/review/risk#final-check` |
| Companion | Portal walkthrough | `/file/companion` | F | Guide after payment / bypass |

---

## Quiz outcomes (144 paths)

`suggestItrType()` — 4×3×3×2×2 combinations:

| Condition | Outcome |
|-----------|---------|
| business / foreign / NRI / income > ₹50L / multiple property | `talkToCa` |
| capital_gains income OR 3+ employers | `itr2` |
| Default salaried resident | `itr1` |

All 144 paths validated in `lib/simulation/__tests__/combinatorial.test.ts`.

---

## Combinatorial compute dimensions

Pruned cartesian product (cap **9,999**):

| Dimension | Values | Pruning |
|-----------|--------|---------|
| Income chips | 11 chips, valid subsets | ≥1 income source; no `home_loan` without `rent_received`; no `freelance` + `business_presumptive` |
| Salary tier | ₹0, 3L, 8L, 12L, 25L, 55L | Synced to `matrix.income` via `incomeBandFromGross` |
| Age band | under_60, senior, super_senior | Maps to engine age |
| Deductions | none / light / standard / 80GG | |
| House property | none / self-occupied / let-out | |
| Filing mode | estimate / exact | |
| Connectors | none / form16 | |

**Additional:** 60 ITR-3 matrix scenarios (`business: v`, regular books).

### Per-scenario validation

- `draftToUserInput` → Python `compute_cli.py`
- `ok: true`, finite numbers, `gross_total_income ≥ 0`
- Regime compare sane (recommended regime, tax_saving, net_payable consistency)
- Optional `itrForm` matches `resolveRecommendedForm(matrix, chips, grossSalary)`

---

## Draft store fields exercised

From `lib/store/draft.ts`:

- `filingMode`, `profile`, `matrix`, `incomeChips`
- `income` (salary, TDS, FD, HRA, advance/self-assessment tax)
- `houseProperty`, `deductions`, `connectedConnectors`
- Engine path: `draftToUserInput` → `/api/compute` → `computeService.ts`

---

## Journey routes (A–F)

See `lib/filing/journey.ts` — all `JOURNEY_ROUTE_MAP` routes aligned with `getJourneyStep()` (existing test + CTA path tests).

---

## Commands

```bash
npm run simulation      # 10,059 compute scenarios (requires python3)
npm run test            # All Vitest unit tests
npm run test:e2e        # Playwright smoke + CTA paths
npm run lint && npm run build && npm run predeploy
```

**CI note:** Simulation suite skips when `python3` unavailable (`describe.skipIf`).

---

## Files added/changed

| Path | Purpose |
|------|---------|
| `lib/simulation/scenarios.ts` | Combinatorial scenario generator |
| `lib/simulation/runner.ts` | Python compute runner + validation |
| `lib/simulation/ctaPaths.ts` | Marketing CTA registry + quiz enumeration |
| `lib/simulation/types.ts` | Shared types |
| `lib/simulation/__tests__/combinatorial.test.ts` | Simulation tests |
| `scripts/run-simulation.ts` | CLI runner (optional) |
| `e2e/cta-paths.spec.ts` | Playwright CTA smoke |
| `engine/orchestrator.py` | GTI floor fix |
| `lib/filing/case-matrix.ts` | Salary-aware ITR routing |
| `lib/engine/draftToUserInput.ts` | Salary-aware income_band |
| `playwright.config.ts` | `NEXT_PUBLIC_BYPASS_PAYMENT=true` for e2e |
