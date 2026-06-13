# Phase 0 — Engine Audit

**Date:** 13 June 2026  
**Scope:** Architecture audit only — no runtime behavior changes in this phase  
**Repository:** `/Users/nikhilanand/Downloads/Cursor/lastminute-itr`  
**Architecture reference:** `docs/MCKINSEY_ENGAGEMENT/05_AI_CA_ARCHITECTURE.md`, `docs/ENGINE_COMPANION_AUDIT.md`  
**Plan note:** `.cursor/plans/ai_ca_platform_architecture_b84c158d.plan.md` was not present in the workspace at audit time; this document follows the parent agent specification.

---

## 1. Current architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  React filing UI (app/file/*, components/filing/*)              │
│  Zustand draft store (lib/store/draft.ts)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              useDraftTaxCompute / useTaxCompute
                            │
              draftToUserInput(draft) → UserInput
                            │
              lib/engine/computeService.ts (Phase 1)
                            │
              lib/engine/client.ts → fetchCompute()
                            │
              POST /api/compute (app/api/compute/route.ts)
                            │
         spawn python3 scripts/compute_cli.py  OR  proxy /api/py-compute
                            │
              engine/orchestrator.py → compute_itr()
                            │
              ITRResult + build_layer2_handoff() JSON
```

**Portal companion path (separate):**

```
fetchPortalGuide / portalGuideEngine → POST /api/portal-guide/[form]
  → mergePortalSteps(data/portal_steps.json, computeResult)
  → payment-gated companion UI (unchanged in Phase 0–1)
```

---

## 2. Real vs stubbed

| Capability | Status | Evidence |
|------------|--------|----------|
| **Python L1 tax engine** | REAL | `engine/` — 450 pytest cases; salary, HP, CG, business, deductions, regime compare, risk, confidence, recommendations |
| **Form 16 parser** | REAL | `lib/parsers/form16.ts` — pdf-parse, multi-part merge, password handling; wired in `app/api/documents/upload/route.ts` for `connectorId=form16` |
| **AIS import** | MOCK | `MOCK_FIELDS.ais` in upload route — fixed sample numbers, `demo: true` |
| **Form 26AS import** | MOCK | `MOCK_FIELDS.form26as` — same pattern |
| **CAMS / CG statement** | MOCK | `MOCK_FIELDS.cams` |
| **`build_layer2_handoff`** | REAL (engine) / UNUSED (client) | Returned in `scripts/compute_cli.py` and `ComputeResponse.handoff`; no UI/LLM consumer before Phase 1 service layer |
| **`questionEngine`** | MISSING → Phase 1 | No follow-up question generator existed; Phase 1 adds rule-based `lib/engine/questionEngine.ts` |
| **Regime comparison** | REAL | `engine/regime_compare.py` |
| **Confidence panel data** | REAL when engine up | Falls back to `fallbackConfidenceFromDraft` when compute fails |
| **Portal guide / companion** | REAL | `data/portal_steps.json` (~79 KB), `mergeValues.ts`, payment gate on POST |
| **CA Brain** | STUB | `app/file/cabrain/page.tsx` — "Coming soon" |
| **LLM / lib/ai** | STUB | `lib/ai/generateItrSummary.ts` — not wired to filing funnel (Phase 2+) |

---

## 3. P0 risks (unchanged by Phase 0 doc; addressed or deferred in Phase 1)

### 3.1 Demo draft defaults

`lib/store/draft.ts` seeds production-persisted defaults:

- `grossSalary: 1_200_000`, `tds: 85_000`, `fdInterest: 18_400`
- `section80C: 150_000`, `section80D: 25_000`, `npsExtra: 50_000`
- `incomeChips: ["salary", "fd_interest"]`

**Risk:** First-time users see ₹12L salaried demo numbers until they edit or upload Form 16.  
**Phase 1 action:** Documented as follow-up — gating defaults behind an explicit demo flag was deferred to avoid persist-key / onboarding regressions.

### 3.2 Confidence fallback

`lib/filing/confidence.ts` → `fallbackConfidenceFromDraft()`:

- Always treats `has_form16` as present (`present = new Set(["has_form16"])`) regardless of `connectedConnectors`
- Inflates completeness when `/api/compute` is unavailable

**Risk:** Users may see optimistic readiness when engine is down or Form 16 not uploaded.  
**Phase 1 action:** Unchanged — consumers still use engine confidence when `result !== null`.

### 3.3 79 KB `portal_steps.json` client import

`lib/filing/confidence.ts` imports `@/data/portal_steps.json` (~78,712 bytes) for `companionStepCountForForm()`.

**Risk:** Bundles full portal step catalog into any client chunk importing confidence helpers.  
**Phase 1 action:** Unchanged — companion UI not modified per scope. Follow-up: move step counts to a lightweight manifest or server-only module.

### 3.4 Additional deployment risks (from prior audits)

| Risk | Detail |
|------|--------|
| Python on Vercel | `spawn python3` ENOENT → 503 `ENGINE_UNAVAILABLE`; proxy to `/api/py-compute` if configured |
| Payment session | Client localStorage gate — server validates companion POST only |
| Exact mode without real AIS/26AS | Mock upload populates misleading figures |

---

## 4. Phase 1 files inventory

### 4.1 New engine service layer (`lib/engine/`)

| File | Purpose |
|------|---------|
| `inputSchema.ts` | Zod validators for `UserInput` slices; `validateUserInput`, `validateDraftForCompute`, `diffUserInputFields` |
| `computeService.ts` | Wraps `fetchCompute`; `computeUserInput()` → `{ result, handoff, error, engineUnavailable }` |
| `questionEngine.ts` | Rule-based `FollowUpQuestion[]` from confidence gaps, draft profile, income chips |
| `recomputeService.ts` | 300 ms debounce helper; `computeWithSnapshot(before, after, trigger)` |
| `recommendationEngine.ts` | `RecommendationBundle` — regime, tips, escalation, handoff |
| `portalGuideEngine.ts` | Typed wrapper over `fetchPortalGuide` / `getPortalGuide` |

### 4.2 Filing types

| File | Purpose |
|------|---------|
| `lib/filing/portalSop.ts` | `PortalSopScreen` / `PortalSopGuide` types only (no runtime) |

### 4.3 Store extensions

| File | Changes |
|------|---------|
| `lib/store/draft.ts` | `questionAnswers`, `computeHistory`, `enginePhase`; actions `setQuestionAnswer`, `appendComputeHistory`, `setEnginePhase` |

### 4.4 Hook migration

| File | Changes |
|------|---------|
| `lib/hooks/useTaxCompute.ts` | Uses `computeService`; exposes `handoff` |
| `lib/hooks/useDraftTaxCompute.ts` | 300 ms debounced auto-compute; exposes `handoff`, `questions`, `recommendations` |

### 4.5 Tests

| File | Covers |
|------|--------|
| `lib/engine/__tests__/questionEngine.test.ts` | Missing docs, HRA, pension chip, multi-Form16, answer filtering |
| `lib/engine/__tests__/recomputeService.test.ts` | Debounce, flush, snapshot diff |
| `lib/engine/__tests__/recommendationEngine.test.ts` | Tips, escalation, handoff passthrough |

### 4.6 Existing files reused (not modified unless listed)

| File | Role |
|------|------|
| `lib/engine/client.ts` | HTTP transport |
| `lib/engine/types.ts` | TS ↔ Python contracts |
| `lib/engine/draftToUserInput.ts` | Draft → `UserInput` adapter |
| `lib/engine/mergeValues.ts` | Portal value binding |
| `lib/filing/optimizationTips.ts` | Tip selection for recommendation engine |
| `lib/filing/confidence.ts` | Fallback confidence |
| `app/api/compute/route.ts` | Python subprocess bridge |
| `engine/orchestrator.py` | L1 compute + handoff |

---

## 5. Out of scope (Phases 2–7)

- `lib/ai/*` providers and LLM explanation layer  
- UI / process flow / MacroStepper / companion wizard edits  
- Performance bundle work (portal_steps client import split)  
- Marketing copy sweep  
- Python engine logic changes  

---

## 6. Approval

| Gate | Phase 0 | Phase 1 target |
|------|---------|----------------|
| Architecture documented | ✅ This file | — |
| Business logic out of React hooks | — | ✅ Service layer |
| Handoff consumed in TS | — | ✅ `computeService` + `recommendationEngine` |
| Question engine (no LLM) | — | ✅ `questionEngine.ts` |
| Backward-compatible draft persist | — | ✅ New fields defaulted |

**Verdict:** Phase 0 audit complete. Phase 1 implementation proceeds per inventory above.
