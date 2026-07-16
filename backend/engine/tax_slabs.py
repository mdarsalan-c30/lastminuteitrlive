"""
tax_slabs.py
============
Pure functions for slab tax computation.

All AY-dependent constants (slab tables, 87A limits/caps, surcharge bands,
special CG rates) live in `rulesets.py` — one frozen Ruleset per Assessment
Year. Default is the current AY (2026-27 / FY 2025-26). Pass an explicit
ruleset to compute for another AY (belated/revised returns).

AY 2026-27 key rules
--------------------
OLD REGIME (unchanged)
  General    : 0 (≤2.5L), 5% (2.5–5L), 20% (5–10L), 30% (>10L)
  Senior     : 0 (≤3L),   5% (3–5L),   20% (5–10L), 30% (>10L)
  Super-sr   : 0 (≤5L),   20% (5–10L), 30% (>10L)
  87A rebate : min(tax, ₹12,500) if total income ≤ ₹5,00,000
  Surcharge  : 10% (50L–1Cr), 15% (1–2Cr), 25% (2–5Cr), 37% (>5Cr)

NEW REGIME (Finance Act 2025)
  0%(≤4L), 5%(4–8L), 10%(8–12L), 15%(12–16L), 20%(16–20L), 25%(20–24L), 30%(>24L)
  87A rebate : min(slab tax, ₹60,000) if total income ≤ ₹12,00,000
  Marginal relief just above ₹12L: slab tax ≤ total income − ₹12,00,000
  Surcharge  : capped at 25% (37% band does NOT apply)

87A NOTES (validation ids TAX-002/003, docs/research/31_VALIDATION_CATALOG.md)
  - Rebate applies to SLAB tax only, never to 111A/112A special-rate tax.
  - Eligibility is tested on TOTAL income (slab income + special-rate CG,
    which is part of total income — 112A gains are taxed-above-threshold,
    not exempt). See docs/research/32_GOLDEN_SCENARIOS.md family B.

SPECIAL RATE TAXES (same for both regimes)
  STCG 111A  : 20% (post 23-Jul-2024)
  LTCG 112A  : 12.5% on gains > ₹1,25,000
  LTCG other : 20% with indexation
  Surcharge on 111A/112A income capped at 15%.

CESS: 4% on (income tax + surcharge), applied after rebate/relief.

Changes vs previous version (behaviour-preserving except where noted)
---------------------------------------------------------------------
- round2 (half-up, from rulesets.py) replaces round(x, 2) banker's
  rounding throughout. Differs only on exact .xx5 paise boundaries —
  these are corrections toward the statutory convention.
"""

from __future__ import annotations
from typing import Literal

from rulesets import Ruleset, DEFAULT_RULESET, round2


# ─────────────────────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────────────────────

def _pick_old_slabs(age: int, ruleset: Ruleset):
    if age >= 80:
        return ruleset.old_super_senior_slabs
    if age >= 60:
        return ruleset.old_senior_slabs
    return ruleset.old_general_slabs


def _compute_slab_tax(income: float, slabs) -> float:
    """Apply progressive slab table to a positive income amount."""
    if income <= 0:
        return 0.0
    tax = 0.0
    prev = 0.0
    for upper, rate in slabs:
        if upper is None:
            taxable = income - prev
        else:
            taxable = min(income, upper) - prev
        if taxable <= 0:
            break
        tax += taxable * rate
        if upper is None or income <= upper:
            break
        prev = upper
    return round2(tax)


def _surcharge_rate(total_income: float, bands) -> float:
    for upper, rate in bands:
        if upper is None or total_income <= upper:
            return rate
    return 0.0


def _surcharge_marginal_relief(
    gross_tax: float,
    surcharge: float,
    taxable_income: float,
    special_rate_tax: float,
    total_income: float,
    slabs,
    surcharge_bands,
) -> float:
    """
    Statutory marginal relief at surcharge threshold crossings.

    Rule (first proviso to the surcharge provisions): income-tax plus surcharge
    on income exceeding a threshold shall not exceed the tax payable AT the
    threshold plus the amount of income above the threshold.

    The reference is therefore the tax computed at exactly the threshold
    (with the excess assumed to come off slab-rate income — standard CA
    practice), including any surcharge applicable at the threshold's own band.
    Comparing against tax on the actual income (the previous implementation)
    under-computes relief and overcharges near every cliff.
    """
    thresholds = [upper for upper, _ in surcharge_bands if upper is not None]
    crossed = max((thr for thr in thresholds if total_income > thr), default=None)
    if crossed is None:
        return 0.0

    extra_income = total_income - crossed
    taxable_at_threshold = max(0.0, taxable_income - extra_income)
    tax_at_threshold = _compute_slab_tax(taxable_at_threshold, slabs) + special_rate_tax
    rate_at_threshold = _surcharge_rate(crossed, surcharge_bands)
    reference = tax_at_threshold * (1 + rate_at_threshold) + extra_income

    relief = max(0.0, (gross_tax + surcharge) - reference)
    # Relief can never exceed the surcharge itself.
    return round2(min(relief, surcharge))


# ─────────────────────────────────────────────────────────────
#  SPECIAL RATE TAXES
# ─────────────────────────────────────────────────────────────

def compute_special_rate_tax(
    stcg_111a: float,
    ltcg_112a: float,
    ltcg_other: float,
    ruleset: Ruleset = DEFAULT_RULESET,
) -> float:
    """
    Tax on special-rate capital gains.
    Expects RAW (pre-exemption) LTCG 112A; applies the ₹1,25,000 exemption here.
    Call with ltcg_112a = the net gain after loss set-off (from capital_gains.py ltcg_112a_net).
    """
    tax_stcg = max(0.0, stcg_111a) * ruleset.stcg_111a_rate
    taxable_ltcg_112a = max(0.0, ltcg_112a - ruleset.ltcg_112a_exemption)
    tax_ltcg_112a = taxable_ltcg_112a * ruleset.ltcg_112a_rate
    tax_ltcg_other = max(0.0, ltcg_other) * ruleset.ltcg_other_rate
    return round2(tax_stcg + tax_ltcg_112a + tax_ltcg_other)


# ─────────────────────────────────────────────────────────────
#  87A REBATE
# ─────────────────────────────────────────────────────────────

def compute_87a_rebate(
    taxable_income: float,
    slab_tax: float,
    regime: Literal["old", "new"],
    total_income: float | None = None,
    ruleset: Ruleset = DEFAULT_RULESET,
) -> float:
    """
    Rebate u/s 87A, on slab tax only (never on 111A/112A special-rate tax).

    Old regime : min(slab_tax, cap ₹12,500) if total income ≤ ₹5,00,000
    New regime : AY 2026-27 → min(slab_tax, ₹60,000) if total income ≤ ₹12,00,000
                 AY 2025-26 → full slab-tax rebate if total income ≤ ₹7,00,000

    `total_income` is the statutory eligibility base (includes special-rate CG);
    falls back to `taxable_income` when the caller has no special-rate income.
    """
    income_for_test = total_income if total_income and total_income > 0 else taxable_income
    if regime == "old":
        if income_for_test <= ruleset.rebate_87a_old_limit:
            return min(slab_tax, ruleset.rebate_87a_old_cap)
        return 0.0
    # new regime
    if income_for_test <= ruleset.rebate_87a_new_limit:
        if ruleset.rebate_87a_new_cap is None:
            return slab_tax  # full rebate (AY 2025-26 style)
        return min(slab_tax, ruleset.rebate_87a_new_cap)
    return 0.0


def _apply_87a_marginal_relief_new_regime(
    income_for_test: float,
    tax_after_rebate: float,
    ruleset: Ruleset,
) -> tuple[float, float]:
    """
    New-regime 87A marginal relief: when total income exceeds the rebate limit
    (₹12,00,000 for AY 2026-27), slab tax payable shall not exceed the amount
    by which income exceeds that limit.
    Returns (adjusted_tax_after_rebate, relief_amount).
    """
    limit = ruleset.rebate_87a_new_limit
    if income_for_test <= limit:
        return tax_after_rebate, 0.0
    max_tax = income_for_test - limit
    if tax_after_rebate <= max_tax:
        return tax_after_rebate, 0.0
    relief = round2(tax_after_rebate - max_tax)
    return round2(max_tax), relief


# ─────────────────────────────────────────────────────────────
#  MAIN SLAB TAX FUNCTION
# ─────────────────────────────────────────────────────────────

def compute_slab_tax(
    taxable_income: float,
    regime: Literal["old", "new"],
    age: int,
    special_rate_tax: float = 0.0,
    total_income_for_surcharge: float = 0.0,
    ruleset: Ruleset = DEFAULT_RULESET,
) -> dict:
    """
    Compute complete tax liability for one regime.

    Parameters
    ----------
    taxable_income          : income taxed at slab rates (after deductions)
    regime                  : "old" or "new"
    age                     : taxpayer age (affects old-regime slabs)
    special_rate_tax        : pre-computed tax on STCG/LTCG at flat rates
    total_income_for_surcharge : total income used for the surcharge band AND
                              the 87A eligibility test (includes special-rate
                              CG income); falls back to taxable_income when 0
    ruleset                 : AY rule constants (default: current AY)

    Returns
    -------
    dict with all intermediate values (matches SlabTaxResult fields)
    """
    taxable_income = max(0.0, taxable_income)
    income_for_87a = (
        total_income_for_surcharge if total_income_for_surcharge > 0 else taxable_income
    )

    # Trace: every line item carries the rule id that produced it (doc 22 §3).
    # Params are named for the explanation catalog (doc 51) — the AI layer may
    # only explain from these entries; it never generates numbers itself.
    trace: list[dict] = []

    # 1. Slab tax
    slabs = (
        ruleset.new_regime_slabs if regime == "new" else _pick_old_slabs(age, ruleset)
    )
    slab_tax = _compute_slab_tax(taxable_income, slabs)
    trace.append({
        "rule": f"slab_tax.{regime}",
        "params": {"taxable": taxable_income, "slab_tax": slab_tax},
    })

    # 2. 87A rebate (on slab tax only; eligibility on total income)
    rebate = compute_87a_rebate(
        taxable_income, slab_tax, regime, total_income=income_for_87a, ruleset=ruleset
    )
    tax_after_rebate = max(0.0, slab_tax - rebate)

    rebate_limit = (
        ruleset.rebate_87a_new_limit if regime == "new" else ruleset.rebate_87a_old_limit
    )
    if rebate > 0:
        trace.append({
            "rule": "rebate_87a.applied",
            "params": {
                "total_income": income_for_87a,
                "limit": rebate_limit,
                "rebate": rebate,
            },
        })
    elif slab_tax > 0 and income_for_87a > rebate_limit:
        trace.append({
            "rule": "rebate_87a.denied",
            "params": {"total_income": income_for_87a, "limit": rebate_limit},
        })

    # 2b. New-regime 87A marginal relief just above the rebate limit
    rebate_marginal_87a = 0.0
    if regime == "new":
        tax_before_relief = tax_after_rebate
        tax_after_rebate, rebate_marginal_87a = _apply_87a_marginal_relief_new_regime(
            income_for_87a, tax_after_rebate, ruleset
        )
        if rebate_marginal_87a > 0:
            trace.append({
                "rule": "rebate_87a.marginal_relief",
                "params": {
                    "limit": rebate_limit,
                    "max_tax": tax_after_rebate,
                    "tax_before": tax_before_relief,
                    "relief": rebate_marginal_87a,
                },
            })
    rebate = rebate + rebate_marginal_87a

    # 3. Gross tax (slab + special rate)
    gross_tax = tax_after_rebate + special_rate_tax
    if special_rate_tax > 0:
        trace.append({
            "rule": "special_rate.total",
            "params": {"tax": special_rate_tax},
        })

    # 4. Surcharge
    surcharge_bands = ruleset.surcharge_new if regime == "new" else ruleset.surcharge_old
    s_rate = _surcharge_rate(total_income_for_surcharge, surcharge_bands)
    surcharge = round2(gross_tax * s_rate)

    # 4a. Marginal relief at surcharge threshold crossings
    marginal_relief = _surcharge_marginal_relief(
        gross_tax,
        surcharge,
        taxable_income,
        special_rate_tax,
        total_income_for_surcharge,
        slabs,
        surcharge_bands,
    )
    surcharge = max(0.0, surcharge - marginal_relief)
    tax_plus_surcharge = gross_tax + surcharge
    if surcharge > 0:
        trace.append({
            "rule": "surcharge.applied",
            "params": {
                "rate": s_rate * 100,
                "surcharge": surcharge,
                "total_income": total_income_for_surcharge,
            },
        })

    # 5. Cess (after rebate, relief and surcharge)
    cess = round2(tax_plus_surcharge * ruleset.cess_rate)
    total_tax = round2(tax_plus_surcharge + cess)
    if cess > 0:
        trace.append({"rule": "cess", "params": {"cess": cess}})

    return {
        "regime": regime,
        "taxable_income": taxable_income,
        "slab_tax": slab_tax,
        "special_rate_tax": special_rate_tax,
        "gross_tax": gross_tax,
        "rebate_87a": rebate,
        "tax_after_rebate": tax_after_rebate,
        "surcharge": surcharge,
        "surcharge_rate": s_rate,
        "marginal_relief": marginal_relief,
        "tax_plus_surcharge": tax_plus_surcharge,
        "cess": cess,
        "total_tax": total_tax,
        "trace": trace,
    }
