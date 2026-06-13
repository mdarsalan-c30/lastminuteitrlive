# ENGINE_COMPANION_AUDIT.md
## Tax Engine & Companion — Code Audit Report

**Date:** 2026-06-10  
**Auditor:** Agent 3 (automated, read-only)  
**Scope:** Python L1 engine, API layer, hooks, companion guide, senior/80TTB mode, document parsing, analytics  
**Approach:** Direct code inspection + live `pytest` execution. Zero app/engine files modified.

---

## 1. Python Test Suite Results

```
Platform: darwin — Python 3.13.0, pytest-9.0.3
Root: engine/
Config: engine/pytest.ini

Collected: 450 tests
  test_combinations_itr1.py  — 150 PASSED   (salaried, ITR-1 routing)
  test_combinations_itr3.py  — 150 PASSED   (regular-books business, ITR-3 routing)
  test_combinations_itr4.py  — 150 PASSED   (presumptive business/profession, ITR-4)

Result: 450 passed in 0.39s   ✅  0 failures
```

**Test coverage observations:**
- Fixtures use deterministic seeds (SEED_ITR1=1001, SEED_ITR3=3003, SEED_ITR4=4004) for reproducibility.
- `assert_result_sanity()` verifies: GTI ≥ 0, both regime taxes ≥ 0, net payable = total_tax − TDS (within ₹1), confidence score in [0,100], all recommendation risk values in {green, yellow, red}.
- All 450 combinations across age bands (25–85), income bands (₹2L–₹80L), and deduction combinations pass.
- **No edge-case tests exist for:** NRI/RNOR regime eligibility, super-senior age (80+) combined with capital gains losses, 80TTB exhaustion boundary (exactly ₹50,000), or 80C pool overflow reconciliation.

**Smoke-test: senior + 80TTB + regime comparison (run live during audit):**
```
Senior (age=65), FD interest ₹50k, savings ₹15k, TDS ₹85k
  80TTB deduction  : ₹50,000  ✓  (cap applied correctly)
  is_senior        : True      ✓
  Old net payable  : ₹80,880
  New net payable  : −₹85,000 (refund)
  Recommended      : new       ✓  (lower tax wins)
  Tax saving       : ₹1,65,880
  Breakeven dedn   : ₹7,15,000 (binary search, 60 iters)
```

---

## 2. Claim Verification Matrix

| # | Claim | Evidence | Key Files | Status | Risk | Fix |
|---|-------|----------|-----------|--------|------|-----|
| 1 | Python L1 engine exists and runs | `engine/` directory with 14 modules, 450 tests pass in 0.39s | `engine/orchestrator.py`, `engine/models.py`, `engine/tests/` | **REAL** | None | — |
| 2 | Engine API (`/api/compute`) calls Python engine | Route spawns `python3 scripts/compute_cli.py`, pipes stdin JSON → stdout JSON | `app/api/compute/route.ts:23–26`, `scripts/compute_cli.py:76` | **REAL** | Medium — python3 must be on PATH in deploy environment | Document python3 availability requirement for Vercel/deployment |
| 3 | `useTaxCompute` hook is real | Calls `fetchCompute(input)` → `/api/compute` POST → `setData(response)` with loading/error state | `lib/hooks/useTaxCompute.ts` | **REAL** | None | — |
| 4 | `useDraftTaxCompute` wraps draft store → engine | Reads `useDraftStore`, calls `draftToUserInput`, passes to `useTaxCompute`, derives `confidence` and `regimeSavings` | `lib/hooks/useDraftTaxCompute.ts` | **REAL** | None | — |
| 5 | Regime comparison is real | `regime_compare.py` runs both regime pipelines in parallel, binary-search breakeven (60 iterations), returns `RegimeComparisonResult` | `engine/regime_compare.py:64–149` | **REAL** | None | — |
| 6 | ConfidencePanel shows real engine data | Reads `ConfidenceResult` from engine output; has fallback `fallbackConfidenceFromDraft` when engine is unavailable | `components/filing/ConfidencePanel.tsx`, `lib/hooks/useDraftTaxCompute.ts:33` | **REAL** | Low — fallback always shows `has_form16=true` as present regardless of actual upload | Fix fallback to reflect actual document upload state |
| 7 | Senior mode exists in UI | `useDraftStore.seniorMode` boolean; `app/file/other/page.tsx` reads `profile.ageBand === "senior" \| "super_senior"` and displays 80TTB card | `app/file/other/page.tsx:17–19`, `lib/store/draft.ts:57` | **REAL** | None | — |
| 8 | 80TTB is handled in engine | `engine/deductions.py:107–110`: senior branch applies `min(savings_interest_deduction, 50_000)` for 80TTB; live test confirmed ₹50k cap works | `engine/deductions.py:107–110` | **REAL** | Low — auto-fill of `savings_interest_deduction` only triggers from `savings_account_interest`, not FD interest; FD 80TTB requires caller to set `savings_interest_deduction` manually | Document that `fdInterest` must be added to `savings_interest_deduction` input for senior taxpayers |
| 9 | Form 16 fast path exists | `isForm16FastPath()` checks `?source=form16`, `applySalariedFastPathDefaults()` sets ITR-1 and estimate mode; import page applies this | `lib/filing/routes.ts`, `app/file/import/documents/page.tsx:26–46` | **REAL** | Low — fast path sets `filingMode: "estimate"` and hardcodes `caseId: "ITR1-2a-x"` regardless of actual income complexity | Fast path should not lock to estimate mode when Form 16 is fully uploaded |
| 10 | AIS / Form 16 import UI exists | `ConnectorGrid.tsx` renders upload cards for Form16, AIS, Form26AS, CAMS; file picker triggers `POST /api/documents/upload` | `components/filing/connectors/ConnectorGrid.tsx:18–50` | **REAL** (UI) / **MOCK** (parser) | **HIGH** — upload route returns hardcoded `MOCK_FIELDS` dictionary; no PDF parsing; `demo: true` flag in response | Prominently gate exact-mode filing on real parser availability; current mock data silently populates draft |
| 11 | Demo parser banner is shown | `ConnectorGrid.tsx:218–223` renders an amber `role="status"` banner: "Demo parsing. Uploaded files use sample numbers for preview only…" | `components/filing/connectors/ConnectorGrid.tsx:218–223` | **REAL** | Low — banner is shown but is visually unobtrusive; a user could proceed to file using wrong mock numbers | Elevate to blocking confirmation modal before proceeding past import step |
| 12 | Risk review page uses real engine | `app/file/review/risk/page.tsx` calls `useDraftTaxCompute()` to get `confidence` and `result`; shows real `ConfidencePanel` | `app/file/review/risk/page.tsx:20–21` | **REAL** | Medium — "Download proof checklist (PDF)" button has no `href` or `onClick` handler; it is a dead button | Wire PDF export or gate behind payment unlock |
| 13 | Companion guide (PortalGuideTable) is real | Reads from `data/portal_steps.json` (163 steps across ITR-1/3/4), merges with `resolveEngineValue()` to show real computed values; payment gate locks Copy/Print | `components/filing/companion/PortalGuideTable.tsx`, `lib/engine/mergeValues.ts`, `data/portal_steps.json` | **REAL** | Low | — |
| 14 | CA Brain gate is placeholder | `app/file/cabrain/page.tsx` shows "Coming soon" Banner explicitly; no LLM/RAG call; links to CA plan upgrade | `app/file/cabrain/page.tsx:25–29` | **MISSING** (intentional placeholder) | Medium — `build_layer2_handoff()` in `orchestrator.py` builds a complete Layer 2 JSON payload but nothing consumes it yet | Document that Layer 2 CA brain is wired on engine side but not on UI/LLM side |
| 15 | Analytics exists but no external provider | `lib/analytics/index.ts` queues events and logs to console in dev; `provider.ts` uses `noopAnalyticsProvider` by default; no PostHog/GA4 wired | `lib/analytics/index.ts:17`, `lib/analytics/provider.ts:11–14` | **PARTIAL** | Medium — funnel events (form16_upload, paywall_view, payment_success) are defined and called but never sent to any backend | Wire a real analytics provider before production launch |

---

## 3. Engine Layer — Detailed Findings

### 3.1 Module Inventory (`engine/`)

| Module | Lines (approx) | Purpose |
|--------|---------------|---------|
| `orchestrator.py` | 270 | Single entry point: `compute_itr()` + `build_layer2_handoff()` |
| `models.py` | ~250 | Dataclass definitions: `UserInput`, `ITRResult`, all sub-types |
| `salary.py` | — | Net salary, HRA exemption, standard deduction (regime-aware) |
| `house_property.py` | — | GAV, NAV, 24b interest, 2L cap for SOP |
| `other_income.py` | — | FD interest, savings interest, dividends |
| `capital_gains.py` | — | STCG 111A, LTCG 112A (₹1.25L exemption applied), LTCG other, loss carry-forward |
| `business_income.py` | — | 44AD presumptive (6%/8%), 44ADA (50%), regular books |
| `deductions.py` | 143 | Full Chapter VI-A: 80C, 80D, 80CCD(1B), 80CCD(2), 80E, 80G, 80TTA/80TTB, 80U |
| `regime_compare.py` | 193 | Both regimes in parallel, binary-search breakeven |
| `risk_checker.py` | 202 | 14 risk flag codes with severity levels |
| `confidence.py` | 124 | Document-weighted completeness score, CA escalation triggers |
| `recommendations.py` | — | Actionable recommendations with `estimated_benefit` |
| `tax_slabs.py` | — | FY 2024-25 slab tables, surcharge, marginal relief, 87A rebate, cess |
| `profiler.py` | — | Age group, ITR form routing, expert escalation |
| `plain_english.py` | — | Human-readable summaries |

### 3.2 API Bridge (`scripts/compute_cli.py` + `app/api/compute/route.ts`)

- Route spawns `python3 scripts/compute_cli.py` as a subprocess, writes JSON to stdin, reads stdout.
- **Deployment risk:** `python3` must be on PATH in the server environment. Vercel serverless functions do **not** include Python by default. This will silently fail in production unless a custom build step or runtime is configured.
- The route only validates `age` (line 12); all other fields pass through without schema validation at the TypeScript layer (engine validates internally).
- Error path: if python3 exits non-zero AND stdout is empty → HTTP 500 with error message. If engine raises `ValueError` (out-of-scope), engine writes `{ok: false, error: ...}` to stdout → HTTP 422.

### 3.3 Type Alignment (TypeScript ↔ Python)

`lib/engine/types.ts` mirrors `engine/models.py` closely. Verified alignment:
- `ITRResult` fields: all present and typed correctly.
- `ConfidenceResult`, `RegimeComparisonResult`, `SlabTaxResult`, `RiskFlag`, `Recommendation`: all match.
- `PortalStep.ourValue` typed as `string | number | null` — matches `resolveEngineValue()` return.
- **Minor gap:** `draftToUserInput.ts` hardcodes `documents: { has_form16: true }` regardless of whether a file was actually uploaded (line 55). This inflates the confidence score by 35 points in all cases.

---

## 4. Hooks Layer

### `useTaxCompute`
- Clean `useCallback` + `useState` pattern; no memory leaks.
- Returns `{ loading, error, data, result, compute, reset }`.
- `compute` is stable (no deps change unless component remounts).

### `useDraftTaxCompute`
- Wraps `useTaxCompute`; derives `confidence` (falls back to `fallbackConfidenceFromDraft` when `result` is null).
- **Issue:** `regimeSavings` is derived as `Math.abs(rc.old.net_payable - rc.new.net_payable)` — this is difference in **net payable** not total tax. In refund scenarios one value is negative, so the displayed "savings" can overstate or understate. Consider using `regime_comparison.tax_saving` from the engine directly.

---

## 5. Document Import & Parser

### Upload route (`app/api/documents/upload/route.ts`)
- **100% mock.** The route reads the file Blob, looks up a hardcoded `MOCK_FIELDS` dictionary keyed by `connectorId`, and returns fixed numbers (e.g. `grossSalary: 1200000`, `tds: 85000`).
- The response includes `demo: true` and a warning message string — but this is only readable if the caller inspects the JSON. The UI (`ConnectorGrid.tsx`) shows the amber "Demo parsing" banner.
- Uploaded file bytes are never read or parsed. Only `file.size` is reported for unknown connector types.

### ConnectorGrid (`components/filing/connectors/ConnectorGrid.tsx`)
- Upload flow: `file input → FormData POST to /api/documents/upload → setConnected → setLastParsed → onUploadComplete?.()`.
- Returned mock fields are displayed in a results card but **are not written back to the draft store**. Parsed fields do not update `useDraftStore` income/deductions.
- The connector grid does not call `trackEvent("form16_upload")` on failure — only on success.
- **High risk:** User uploads a real Form 16, sees sample numbers, proceeds to file. The filing engine uses the unchanged draft store defaults (`grossSalary: 1_200_000`) rather than real employer data.

### Parsing page (`app/file/import/parsing/page.tsx`)
- Displays hardcoded "18 fields with high confidence. Please review 3 fields marked for confirmation."
- These strings are static text — not derived from actual parse results.
- The page reads `income.grossSalary` from draft store (default ₹12L) and `income.tds` (default ₹85k) — no connection to what was "uploaded".

---

## 6. Regime Comparison

- **REAL** and fully functional. Binary search breakeven is elegant and correct.
- Both regime slab tables are loaded from `tax_slabs.py` using FY 2024-25 rules.
- Old regime senior/super-senior thresholds are applied correctly.
- New regime standard deduction (₹75,000 for FY 2024-25) is included via `std_ded_delta` in `orchestrator.py:134`.
- The companion page `app/file/companion/page.tsx` correctly fetches the engine result before loading the portal guide, so steps are populated with real computed values.

---

## 7. ConfidencePanel

- Renders a circular score ring (SVG), progress bar, missing document list with upload CTAs, and CA escalation banner.
- `variant="marketing-demo"` hardcodes 87% score — used on the landing/marketing page only.
- `variant="full"` / `"compact"` use real `ConfidenceResult` from engine.
- Weight breakdown (`WeightBreakdown`) mirrors `DOC_WEIGHTS` from `lib/filing/confidence.ts` which in turn mirrors `engine/confidence.py` — these are in sync (both use has_form16=35, has_ais=20, etc.).
- Upload CTA correctly routes to `/file/import/documents?highlight={key}` using `uploadKeyForMissingDoc()`.

---

## 8. Senior Mode & 80TTB

### UI Layer
- `profile.ageBand` in draft store: `"under_60" | "senior" | "super_senior"`.
- `seniorMode` boolean (separate from ageBand) — controls font-size scaling in the 80TTB card (`app/file/other/page.tsx:59,68`).
- 80TTB card is conditionally rendered when `isSenior = true` — gated on `ageBand`, not `seniorMode`.
- Display calculation: `deduction80TTB = Math.min(income.fdInterest, 50_000)` — this is a **UI display only** calculation. The engine receives `fdInterest` but the `savings_interest_deduction` input must also be set for 80TTB to apply in the engine.

### Engine Layer
- `orchestrator.py:39–43`: `_auto_fill_deduction_inputs()` auto-fills `savings_interest_deduction` from `savings_account_interest` only (not from `fd_interest`).
- `draftToUserInput.ts:43`: maps `draft.income.fdInterest → other_income.fd_interest` ✓, but `deductions.savings_interest_deduction` is never populated.
- **Bug:** For senior taxpayers, FD interest is included in other income, and 80TTB should cover both savings and FD interest, but `savings_interest_deduction` is never set from `fdInterest` in the TS→Python mapping. The UI displays a correct deduction amount, but the engine computes 0 for 80TTB for FD interest unless manually overridden.

---

## 9. Form 16 Fast Path

- URL: `/file/import/documents?source=form16&name=<name>`
- `isForm16FastPath()` checks `searchParams.get("source") === "form16"`.
- `applySalariedFastPathDefaults()` sets: `filingMode="estimate"`, `filingPath="simple"`, `recommendedForm="ITR-1"`, `caseId="ITR1-2a-x"`.
- **Functional** as a routing shortcut — but it permanently sets `estimate` mode at entry, requiring the user to manually switch to `exact` mode later. The intent is presumably to get users started quickly, but the path to filing-ready is non-obvious.

---

## 10. Companion Guide

- Portal steps data: `data/portal_steps.json` — **ITR-1: 50 steps, ITR-3: 57 steps, ITR-4: 56 steps**.
- `mergePortalSteps()` in `lib/engine/mergeValues.ts` resolves engine values via `resolveEngineValue()` using dot-path traversal into the `ITRResult`.
- Payment gate: `exportUnlocked = hasCompanionExportAccess(...)` — copy and print are blurred/locked until payment.
- Mismatch block: if `!draft.mismatchResolved`, export is blocked even after payment.
- The page calls `compute(userInput)` then `fetchPortalGuide(form, result, ...)` — correct sequencing.
- **No ERI auto-submission**: explicitly stated in the subtitle "No ERI auto-submit in this release." This is accurate.

---

## 11. CA Brain Gate

- `app/file/cabrain/page.tsx`: renders "Coming soon — CA Review plan" Banner.
- No LLM/RAG/OpenAI calls anywhere in the codebase.
- `build_layer2_handoff()` in `orchestrator.py` builds a complete `layer1_complete: true` JSON payload (profle, income summary, deductions, regime comparison, recommendations, risk flags, confidence) — the engine side is wired. The consumer (Layer 2 CA brain) does not exist yet.
- `filingPath: "cabrain"` in draft store causes `reviewHref` to point to `/file/review/risk` — functionally equivalent to the simple path.

---

## 12. Analytics

- **Schema:** 9 funnel events defined: `landing_cta_click`, `import_started`, `form16_upload`, `regime_compare_completion`, `presubmit_checklist_green`, `paywall_view`, `plan_select`, `payment_success`, `value_stack_impression`.
- **Called at:** `import_started` on documents page, `form16_upload` on successful Form 16 upload.
- **Not called at:** regime page view, presubmit checklist green, paywall_view, plan_select, payment_success — these are defined but unimplemented.
- **Backend:** `noopAnalyticsProvider` by default — all events are queued in memory and logged to console in dev, but never sent externally. `setAnalyticsProvider()` is never called in the codebase.
- **Risk:** No funnel data is being collected in production.

---

## Summary — ENGINE APPROVAL

| Subsystem | Approval |
|-----------|----------|
| Python L1 engine (core tax computation) | **PASS** |
| Engine API bridge (`/api/compute`) | **PARTIAL** — python3 PATH dependency unresolved for production |
| `useTaxCompute` / `useDraftTaxCompute` | **PASS** |
| Regime comparison | **PASS** |
| ConfidencePanel | **PASS** (minor: fallback always marks Form16 as present) |
| Senior mode UI | **PASS** |
| 80TTB engine computation | **PARTIAL** — FD interest 80TTB not mapped through draftToUserInput |
| Form 16 fast path | **PASS** (routing works; estimate-mode lock is UX concern) |
| AIS / Form 16 import UI | **PARTIAL** — upload UI is real; parser is 100% mock |
| Document parser | **MOCK** — hardcoded numbers returned regardless of file content |
| Demo parser banner | **REAL** — amber banner is shown; insufficient as sole user warning |
| Risk review | **PARTIAL** — real engine data shown; PDF export button is dead |
| Companion guide | **PASS** |
| CA Brain gate | **MISSING** (intentional; engine payload ready) |
| Analytics | **PARTIAL** — schema and calls exist; no external provider wired |

### Overall Engine Approval: **PARTIAL**

The Python L1 tax computation engine is **production-grade**: 450 tests pass, all income heads, deductions, regime comparison, risk flags, and confidence scoring work correctly. The API bridge, hooks, and UI layer correctly thread data from the engine to the screen.

**Blockers before production filing:**
1. **Document parser is a stub** — uploaded files return mock numbers; users could file with wrong figures.
2. **`python3` on deploy PATH** — must be confirmed for Vercel/serverless environment.
3. **`draftToUserInput` sets `has_form16: true` unconditionally** — confidence score is inflated by 35 points for all users.
4. **FD interest does not flow into 80TTB** — senior taxpayers see correct UI display but engine applies 0 deduction for FD-sourced interest.
5. **Analytics provider not wired** — no funnel visibility.

**Not blockers (future work, clearly marked):**
- CA Brain / Layer 2 (intentional "coming soon")
- ERI auto-submit (intentional "companion mode")
- Broker API connects: Groww, Zerodha, MFCentral (marked "coming soon")
