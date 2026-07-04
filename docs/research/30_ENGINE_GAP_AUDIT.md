# 30 — Engine Gap Audit: Current Code vs AY 2026-27 Baseline (Phase 3, Executed)

> Audit of `backend/engine/` against the rules baseline (doc 15). No code changes in this phase — but Finding 1 is a **P0 accuracy defect in the deployed product** and must be the first commit when implementation reopens.

> **STATUS UPDATE (04-Jul-2026): Finding 1 is FIXED.** Rulesets extracted to `backend/engine/rulesets.py` (frozen `Ruleset` per AY: `AY2026-27.r1` default, `AY2025-26.r1` retained for belated/revised returns). `tax_slabs.py`, `regime_compare.py` and `orchestrator.py` now thread the ruleset resolved from `UserInput.assessment_year` (default flipped to `"2026-27"`). Family A/B goldens + AY 2025-26 regression tests landed in `tests/test_golden_ay2026_27.py` (19 tests, run by pytest CI). Findings 2 (partially: 75k/50k std deduction verified correct), 3 (partially: goldens landed; fixture regeneration still open), 4 and 5 remain open.

## 1. 🔴 FINDING 1 (P0): Engine computes AY 2025-26 tax, not AY 2026-27 — ✅ FIXED

Verified in `backend/engine/tax_slabs.py` (July 2026):

| Rule | Code today | Correct for AY 2026-27 (doc 15) |
|---|---|---|
| New-regime slabs | `_NEW_REGIME` starts at ₹3,00,000; bands 3/7/10/12/15L | Starts at **₹4,00,000**; bands 4/8/12/16/20/24L |
| 87A rebate (new) | Full rebate if income ≤ **₹7,00,000** (`compute_87a_rebate`) | Up to **₹60,000** if income ≤ **₹12,00,000** — `min(slab_tax, 60_000)`, and only while income ≤ 12L |
| 87A marginal relief (new) | Threshold **₹7,00,000** (`_apply_87a_marginal_relief_new_regime`) | Threshold **₹12,00,000** |
| Header comment | Says "full rebate if income ≤ ₹12,00,000" | Comment already updated, **code was not** — the docstring/code mismatch is itself evidence of a partial migration |

**Impact:** every new-regime computation in the deployed product for this filing season is wrong. Example: taxable income ₹11,00,000 → code produces slab tax ≈ ₹65,000 with zero rebate; correct answer is **₹0** (slab tax ₹50,000 fully rebated under the ₹60,000/12L rule). We are *overstating* tax — the safe direction legally, but a user who files by our number overpays, and our "AI CA" credibility dies on the first Reddit post.

What is already correct: 111A @20%, 112A @12.5% with ₹1.25L exemption, rebate-applies-to-slab-tax-only, surcharge bands incl. 25% new-regime cap and 15% special-rate cap. ~~Surcharge marginal relief loop~~ — this audit line was wrong; see Finding 6.

**Root cause → architectural fix (locks Phase 2 decision):** constants live inline in one file with no AY tag. The rules-package-per-AY design (doc 22 §3: `rulesetId = "AY2026-27.rN"`) is not optional hygiene; it is the structural prevention for exactly this defect. Old-year rules must remain available (belated/revised returns for AY 2025-26 are legal until 31 Dec 2026 / 31 Mar 2027) — so this is a *refactor to dual-ruleset*, not a constant edit.

## 2. Finding 2: Standard deduction & regime wiring need re-verification

`salary.py` / `deductions.py` must be re-audited for ₹75,000 (new) vs ₹50,000 (old) once Finding 1 is fixed — same partial-migration risk. Also verify old-regime senior slabs (3L/5L exemptions) are age-gated correctly (`_pick_old_slabs(age)` exists; add explicit tests).

## 3. Finding 3: Test suite tests the code, not the law

Current inventory: `test_combinations_itr1.py` (150 parametrized cases), `test_combinations_itr3.py`, `test_combinations_itr4.py`, `test_regime_compare.py` (5), `test_regime_gti_split.py` (3). Strengths: broad combinatorial coverage, regime-split coverage. Weakness: expected values in `fixtures.py` were generated *against the engine's own (stale) rules* — the suite would pass while computing the wrong year. Golden scenarios (doc 32) fix this by pinning **externally derived** expected numbers (hand-computed from the Act, cross-checked against the ITD calculator) that fail loudly on ruleset drift.

## 4. Finding 4: No trace output — ✅ FIXED 04-Jul-2026

**Remediation:** `compute_slab_tax()` now emits `[{rule, params}]` entries (slab_tax, rebate_87a applied/denied/marginal_relief, special_rate, surcharge, cess), threaded through `SlabTaxResult.trace` to the API JSON. The frontend explanation layer (`lib/ai/explainTrace.ts`, doc 51) renders only from these entries; golden tests assert trace presence and param correctness end-to-end.

Original finding: `compute_itr()` returned results but not per-line rule attributions. Doc 22 §3's trace contract (`"rebate_87a: capped at 60000, income 1180000 <= 1200000"`) is a prerequisite for: the AI explanation fence, the CONFIRM/COMPUTE provenance UI, and the notice-defense pack. Design decision: trace entries are `(ruleId, inputs, output, note)` tuples appended by each module — cheap to add during the ruleset refactor, expensive to retrofit later.

## 5. Finding 5: Scope creep already present vs V1 lock

The engine contains `business_income.py`, `capital_gains.py`, ITR-3/ITR-4 combination tests — more than the V1 "ITR-1 strict" lock in doc 03 §2. Decision needed at gate: keep the wider engine (it exists and has tests) but **hard-gate exposure** at the GATE state (doc 21) so users can't reach paths whose validations aren't yet cataloged. Recommended: keep code, gate exposure, catalog validations in the doc 31 order (salary → HP → other income → CG).

## 6. 🔴 FINDING 6 (found 04-Jul-2026 during deep verification): Surcharge marginal relief under-computed — ✅ FIXED

The original audit (Finding 1 table, "already correct" list) wrongly cleared the surcharge marginal-relief loop. Deep verification against the statutory rule found it compared tax-with-surcharge against **tax on the actual income** instead of **tax at the threshold**:

- Statutory rule: tax + surcharge above a threshold may not exceed *tax computed at exactly the threshold* + the excess income.
- Old code: `relief = surcharge − excess_income` — systematically too small because it ignores the slab tax accrued on the excess itself.
- Worked example (old regime, ₹51,00,000): correct relief **₹64,250** (textbook value); code produced ₹34,250 — **overcharging ₹30,000 + cess = ₹31,200** near every surcharge cliff (50L / 1Cr / 2Cr / 5Cr).

**Remediation (landed):** `_surcharge_marginal_relief()` recomputes slab tax at the crossed threshold (excess assumed to come off slab-rate income, standard CA practice) and caps total at `tax_at_threshold × (1 + rate_at_threshold) + excess`. Anchored by hand-derived goldens (new-regime ₹50.75L, old-regime ₹51L textbook case) plus property-based monotonicity sweeps across the 50L/1Cr/2Cr cliffs in both regimes: total tax never decreases with income and the marginal rate never exceeds 100%. All in `tests/test_golden_ay2026_27.py`.

**Open sub-question for CA sign-off:** interaction of marginal relief with mixed slab + special-rate income at a cliff (whose income is "the excess"?) — the implementation assumes slab income; a CA should confirm before ITR-2 exposure.

## 7. Finding 7 (noted, not fixed): CLI/API silently drops unknown input fields

`scripts/compute_cli.py::_build` filters input dicts to known dataclass fields — a misspelled field (e.g. `interest_on_loan` vs `home_loan_interest`) silently computes as zero instead of erroring. The typed frontend mapper is safe, but any other API consumer can get a silently wrong result. Doc 22's engine contract requires input validation; queue a strict-mode rejection (or at least a `warnings[]` echo of dropped keys) for Phase 7.

## 8. 🔴 FINDING 8 (found 04-Jul-2026, multi-form verification): slab-rate STCG double-counted — ✅ FIXED

`regime_compare.py` re-added `stcg_other_slab` to taxable income even though the orchestrator had already included it in GTI. Anyone with slab-rate STCG (debt funds, gold, property held short-term) was taxed on the gain **twice** — e.g. ₹1L of debt-fund STCG at 30% marginal rate meant a ₹31,200 overcharge. Same bug existed in `_compute_breakeven`, skewing the regime breakeven figure. Fixed by removing the re-add in both places; regression pinned by `tests/test_golden_multiform.py::test_f03_stcg_other_not_double_counted`.

## 9. FINDING 9 (04-Jul-2026): 80CCD(2) new-regime cap was 10%, should be 14% — ✅ FIXED

`deductions.py` capped employer NPS at 10% of basic in both regimes. Finance (No.2) Act 2024 raised the new-regime cap to 14% of basic for all employers — under-deducting new-regime filers with generous employer NPS (up to ₹40k of missed deduction on a ₹10L basic). Fixed with regime-specific rates; pinned by `test_d01_80ccd2_new_regime_14pct_cap`.

## 10. FINDING 10 (04-Jul-2026): 44AD/44ADA eligibility wrong on two axes — ✅ FIXED

`business_income.py` (a) lacked the enhanced limits (₹3Cr turnover / ₹75L receipts when cash receipts ≤ 5%, Finance Act 2023, retained in the 2025 Act) and (b) treated cash receipts > 5% as **complete disqualification** — legally it only reverts eligibility to the base ₹2Cr/₹50L limits. A ₹2.5Cr digital-first business was wrongly denied presumptive; a ₹1.5Cr cash-heavy kirana was wrongly denied too. Fixed; pinned by golden tests G-02 through G-05.

## 11. FINDING 11 (04-Jul-2026): loss set-off ordering was taxpayer-adverse — ✅ FIXED

`capital_gains.py` absorbed residual STCL and LTCL against LTCG-112A (12.5%, with ₹1.25L exemption) **before** LTCG-other (20%). Sections 70–74 do not mandate an order, and the beneficial order (20% bucket first, preserve the 112A exemption) is settled practice. On a 1.5L-STCL / mixed-gains case the old order cost the user ₹3,750. Fixed; pinned by tests F-02/F-02b.

## 12. FINDING 12 (04-Jul-2026): phantom standard deduction for business-only filers — ✅ FIXED

`salary.py` granted the ₹75k/₹50k standard deduction even at zero salary, so pure-business filers (ITR-3/4) got a fake new-vs-old ₹25k "delta" distorting regime comparison. Standard deduction is now capped at actual salary income; pinned by `test_g06_business_only_no_phantom_standard_deduction`.

## 13. Remediation order (first week of Phase 7 implementation)

1. Extract `rules_ay2026_27.py` + `rules_ay2025_26.py` packages; `compute_itr(user, ruleset)` signature change. Fix slabs/87A/marginal relief in the 2026-27 ruleset.
2. Land golden scenarios (doc 32) as CI — they must FAIL against today's code (proof they test the law) and pass after the fix.
3. Add trace emission.
4. Re-verify standard deduction/senior slabs (Finding 2).
5. Regenerate `fixtures.py` expected values from the fixed engine, reviewed against goldens.
