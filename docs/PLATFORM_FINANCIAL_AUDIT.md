# Platform Financial Audit — LastMinute ITR

**Date:** June 2026  
**Scope:** Engine math, draft→compute pipeline, checkout gating, regime UX  
**Tests:** 458 engine pytest · 59 unit · 11 e2e

## Fixed in this pass

| Issue | Fix |
|-------|-----|
| New regime used old-regime GTI (HRA/HP bias) | Separate `gti_old` / `gti_new` in orchestrator + regime_compare |
| HRA + 80GG double claim | Mutually exclusive in `deductions.py` |
| LTCL phantom carry-forward | Fixed absorption math in `capital_gains.py` |
| Breakeven LTCG double exemption | Use `ltcg_112a_net` in breakeven path |
| Risk page wrong regime payable | Uses `draft.regime ?? recommended` |
| Checkout when engine down | Blocked; redirect to `/file/regime` |
| Mock payment in production | Disabled when `NODE_ENV=production` and no Razorpay keys |
| Regime page recompute loop | Selective Zustand selectors (prior pass) |

## Remaining P0/P1 (next sprint)

- Collect TDS other in UI → `draftToUserInput` (HRA/rent now wired)
- Merge AIS/26AS upload into draft compute inputs
- Section 87A marginal relief above ₹12L (new regime) — **fixed** in `tax_slabs.py`
- Reset demo defaults (`mismatchResolved`, `bankValidated`) — **fixed** in draft store
- Lock companion form to engine `itr_form`
- Wire income/deduction pages for edit (not display-only)
- Yellow/red recommendation cards on risk review

## Key files

- `engine/orchestrator.py` — GTI split
- `engine/regime_compare.py` — regime comparison
- `lib/hooks/useDraftTaxCompute.ts` — compute orchestration
- `lib/filing/checkoutGate.ts` — payment gate
- `app/file/review/risk/page.tsx` — pre-checkout summary
