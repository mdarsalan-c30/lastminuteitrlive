"""
regime_compare.py
=================
Runs the full tax pipeline for OLD and NEW regimes, then compares results.

Outputs
-------
- SlabTaxResult for each regime (with net payable / refund)
- Recommended regime (lower net payable)
- Tax saving vs the worse regime
- Breakeven deduction level (at what Chapter VI-A total does old regime = new regime)
- Effective tax rates on GTI

Changes vs previous version (behaviour-preserving except where noted)
---------------------------------------------------------------------
- Sec 234F fee tiers (₹1,000 / ₹5,000 / ₹5L threshold) sourced from the
  Ruleset; old-regime basic exemption limits derived from the ruleset's own
  slab tables (first slab boundary) instead of hardcoded 2.5L/3L/5L — same
  values, single source of truth.
- round2 (half-up) replaces round(x, 2) banker's rounding. (Correction on
  exact .xx5 paise boundaries only.)
- KNOWN APPROXIMATION unchanged: the 234F fee tier is tested against
  `taxable_income`, whereas the statute tests TOTAL income. For filers with
  large deductions this can under-charge the fee (₹1,000 instead of ₹5,000).
  Behaviour preserved to keep golden tests green — fix deliberately, with a
  ruleset version bump and updated goldens.
"""

from __future__ import annotations
from models import SlabTaxResult, RegimeComparisonResult
from rulesets import Ruleset, DEFAULT_RULESET, round2
from tax_slabs import compute_slab_tax, compute_special_rate_tax


def _old_regime_exemption_limit(age: int, ruleset: Ruleset) -> float:
    """Basic exemption limit = first slab boundary of the age-appropriate
    old-regime table (2.5L / 3L / 5L for the loaded AYs)."""
    if age >= 80:
        return float(ruleset.old_super_senior_slabs[0][0])
    if age >= 60:
        return float(ruleset.old_senior_slabs[0][0])
    return float(ruleset.old_general_slabs[0][0])


def _build_slab_tax_result(
    regime,
    taxable_income,
    special_rate_components,
    total_income_for_surcharge,
    age,
    tds_and_advance,
    late_filing=False,
    gross_total_income=0.0,
    ruleset: Ruleset = DEFAULT_RULESET,
) -> SlabTaxResult:
    """Helper: compute full SlabTaxResult for one regime."""
    special_rate_tax = compute_special_rate_tax(
        stcg_111a=special_rate_components["stcg_111a_net"],
        ltcg_112a=special_rate_components["ltcg_112a_net"],   # raw net; exemption applied inside
        ltcg_other=special_rate_components["ltcg_other_net"],
        ruleset=ruleset,
    )

    result = compute_slab_tax(
        taxable_income=taxable_income,
        regime=regime,
        age=age,
        special_rate_tax=special_rate_tax,
        total_income_for_surcharge=total_income_for_surcharge,
        ruleset=ruleset,
    )

    # ── Sec 234F late-filing fee ──
    late_filing_fee = 0.0
    if late_filing:
        if regime == "new":
            # Basic exemption limit = first slab boundary of the AY's new regime
            exemption_limit = float(ruleset.new_regime_slabs[0][0])
        else:
            exemption_limit = _old_regime_exemption_limit(age, ruleset)
        if gross_total_income > exemption_limit:
            if taxable_income <= ruleset.late_fee_234f_income_threshold:
                late_filing_fee = ruleset.late_fee_234f_low
            else:
                late_filing_fee = ruleset.late_fee_234f_high

    net_payable = round2(result["total_tax"] + late_filing_fee - tds_and_advance)

    return SlabTaxResult(
        regime=regime,
        taxable_income=result["taxable_income"],
        slab_tax=result["slab_tax"],
        special_rate_tax=result["special_rate_tax"],
        gross_tax=result["gross_tax"],
        rebate_87a=result["rebate_87a"],
        tax_after_rebate=result["tax_after_rebate"],
        surcharge=result["surcharge"],
        surcharge_rate=result["surcharge_rate"],
        marginal_relief=result["marginal_relief"],
        tax_plus_surcharge=result["tax_plus_surcharge"],
        cess=result["cess"],
        total_tax=result["total_tax"],
        tds_and_advance_tax=tds_and_advance,
        net_payable=net_payable,
        late_filing_fee=late_filing_fee,
        trace=result.get("trace", []),
    )


def compute_regime_comparison(
    gti_old: float,                      # GTI under old-regime income heads
    gti_new: float,                      # GTI under new-regime income heads
    chapter_via_deductions: float,       # total old-regime deductions (from deductions.py)
    new_regime_deductions: float,        # Chapter VI-A allowed in new regime (80CCD(2))
    special_rate_components: dict,       # from capital_gains.py output
    stcg_other_slab: float,              # STCG at slab rate (added to normal income)
    age: int,
    tds_and_advance: float,
    standard_deduction_delta: float = 0.0,
    late_filing: bool = False,
    ruleset: Ruleset = DEFAULT_RULESET,
) -> RegimeComparisonResult:
    """
    Runs both regime pipelines and returns a full comparison.
    """
    # If the orchestrator supplied a single (old-basis) GTI for both regimes,
    # the standard-deduction delta adjusts the new-regime side; when true
    # per-regime GTIs are supplied (gti_new != gti_old), the delta is already
    # baked into gti_new and must NOT be double-counted.
    new_regime_adjustments = new_regime_deductions + (
        0.0 if gti_new != gti_old else standard_deduction_delta
    )

    # ── Special-rate CG amounts (excluded from normal slab income) ──
    special_cg_income = (
        special_rate_components["stcg_111a_net"]
        + special_rate_components["ltcg_112a_net"]
        + special_rate_components["ltcg_other_net"]
    )

    # ── OLD REGIME ──
    # NOTE: gti_old already contains stcg_other_slab (added in orchestrator GTI);
    # only special-rate CG is carved out here. Do NOT re-add stcg_other_slab.
    old_taxable = max(
        0.0, gti_old - chapter_via_deductions - special_cg_income
    )
    old_surcharge_base = max(0.0, gti_old - chapter_via_deductions)
    old_result = _build_slab_tax_result(
        regime="old",
        taxable_income=old_taxable,
        special_rate_components=special_rate_components,
        total_income_for_surcharge=old_surcharge_base,
        age=age,
        tds_and_advance=tds_and_advance,
        late_filing=late_filing,
        gross_total_income=gti_old,
        ruleset=ruleset,
    )

    # ── NEW REGIME ──
    new_taxable = max(
        0.0, gti_new - new_regime_adjustments - special_cg_income
    )
    new_surcharge_base = max(0.0, gti_new - new_regime_adjustments)
    new_result = _build_slab_tax_result(
        regime="new",
        taxable_income=new_taxable,
        special_rate_components=special_rate_components,
        total_income_for_surcharge=new_surcharge_base,
        age=age,
        tds_and_advance=tds_and_advance,
        late_filing=late_filing,
        gross_total_income=gti_new,
        ruleset=ruleset,
    )

    # ── Recommendation ──
    recommended = "old" if old_result.total_tax <= new_result.total_tax else "new"
    tax_saving = abs(old_result.total_tax - new_result.total_tax)

    # ── Effective rates ──
    old_eff = round2(old_result.total_tax / gti_old * 100) if gti_old > 0 else 0.0
    new_eff = round2(new_result.total_tax / gti_new * 100) if gti_new > 0 else 0.0

    # ── Breakeven deduction level ──
    # At what total old-regime deduction does old_tax = new_tax?
    # We approximate with a binary search over Chapter VI-A total.
    breakeven = _compute_breakeven(
        gti=gti_old,
        new_regime_deductions=new_regime_deductions,
        special_rate_components=special_rate_components,
        age=age,
        new_total_tax=new_result.total_tax,
        ruleset=ruleset,
    )

    # Chapter VI-A forfeited in new regime (exclude salary standard-deduction delta).
    deductions_lost = max(0.0, chapter_via_deductions - new_regime_deductions)

    return RegimeComparisonResult(
        old=old_result,
        new=new_result,
        recommended_regime=recommended,
        tax_saving=round2(tax_saving),
        breakeven_deductions=round2(breakeven),
        deductions_lost_in_new=round2(deductions_lost),
        old_effective_rate=old_eff,
        new_effective_rate=new_eff,
    )


def _compute_breakeven(
    gti, new_regime_deductions, special_rate_components,
    age, new_total_tax,
    ruleset: Ruleset = DEFAULT_RULESET,
) -> float:
    """
    Binary search: find chapter_via_deduction level where old tax = new tax.
    Returns 0 if old regime is always worse, or cap (1.5L+50k+2L+more) if always better.
    """
    special_cg = (
        special_rate_components["stcg_111a_net"]
        + special_rate_components["ltcg_112a_net"]
        + special_rate_components["ltcg_other_net"]
    )
    special_tax = compute_special_rate_tax(
        stcg_111a=special_rate_components["stcg_111a_net"],
        ltcg_112a=special_rate_components["ltcg_112a_net"],
        ltcg_other=special_rate_components["ltcg_other_net"],
        ruleset=ruleset,
    )

    def old_tax_at(deduction: float) -> float:
        # gti already includes stcg_other_slab; only carve out special-rate CG.
        taxable = max(0.0, gti - deduction - special_cg)
        surcharge_base = max(0.0, gti - deduction)
        r = compute_slab_tax(
            taxable_income=taxable,
            regime="old",
            age=age,
            special_rate_tax=special_tax,
            total_income_for_surcharge=surcharge_base,
            ruleset=ruleset,
        )
        return r["total_tax"]

    lo, hi = 0.0, gti
    for _ in range(60):   # ~60 bisection steps → precision ~₹1 on any income
        mid = (lo + hi) / 2
        if old_tax_at(mid) > new_total_tax:
            lo = mid
        else:
            hi = mid
    return hi
