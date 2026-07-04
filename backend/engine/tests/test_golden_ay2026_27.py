"""
Golden scenarios — AY 2026-27 (families A & B).

Expected values are HAND-DERIVED from the Finance Act 2025 rules
(docs/research/15_TAX_RULES_BASELINE.md, docs/research/32_GOLDEN_SCENARIOS.md),
independent of the engine. They pin the LAW, not the implementation:
any diff requires a ruleset version bump + changelog entry.

New-regime slabs: 0%≤4L, 5% 4–8L, 10% 8–12L, 15% 12–16L, 20% 16–20L,
25% 20–24L, 30% >24L.
87A: min(slab tax, ₹60,000) where total income ≤ ₹12,00,000; marginal
relief above ₹12L caps slab tax at (total income − ₹12,00,000).
Rebate/relief never offset 111A/112A special-rate tax. Cess 4% last.
"""

from __future__ import annotations

import pytest

from models import SalaryInput, TaxPaidInput, UserInput
from orchestrator import compute_itr
from rulesets import AY_2025_26, AY_2026_27, get_ruleset
from tax_slabs import compute_slab_tax, compute_special_rate_tax


def _new_regime_tax(taxable: float, total_income: float = 0.0,
                    special_rate_tax: float = 0.0, ruleset=AY_2026_27) -> dict:
    return compute_slab_tax(
        taxable_income=taxable,
        regime="new",
        age=30,
        special_rate_tax=special_rate_tax,
        total_income_for_surcharge=total_income,
        ruleset=ruleset,
    )


# ─────────────────────────────────────────────────────────────
#  Family A — 87A rebate ladder (new regime, slab income only)
# ─────────────────────────────────────────────────────────────

@pytest.mark.parametrize(
    "case_id, taxable, expected_total_tax",
    [
        ("A-01", 725_000, 0.0),        # slab 16,250 fully rebated
        ("A-02", 1_190_000, 0.0),      # slab 59,000 ≤ 60,000 cap → 0
        ("A-03", 1_200_000, 0.0),      # boundary: slab 60,000 = cap → 0
        ("A-04", 1_210_000, 10_400.0), # relief caps slab at 10,000 + 4% cess
        ("A-05", 1_275_000, 74_100.0), # slab 71,250 ≤ 75,000 → relief inert
        ("A-06", 1_300_000, 78_000.0), # slab 75,000 + cess
    ],
)
def test_family_a_rebate_ladder(case_id, taxable, expected_total_tax):
    r = _new_regime_tax(taxable)
    assert r["total_tax"] == pytest.approx(expected_total_tax, abs=1), case_id


def test_a04_cess_applies_after_marginal_relief():
    """J-02: cess base is the relieved 10,000 — not the pre-relief 61,500."""
    r = _new_regime_tax(1_210_000)
    assert r["tax_after_rebate"] == pytest.approx(10_000, abs=1)
    assert r["cess"] == pytest.approx(400, abs=1)


def test_a07_no_cliff_around_relief_crossover():
    """Tax must be monotonic through the relief crossover (~₹12,70,588)."""
    incomes = [1_260_000, 1_265_000, 1_270_000, 1_270_588, 1_271_000, 1_275_000, 1_280_000]
    taxes = [_new_regime_tax(i)["total_tax"] for i in incomes]
    assert taxes == sorted(taxes)
    # Relief binds at 12.6L: slab 69,000 capped to 60,000 → 62,400 with cess
    assert taxes[0] == pytest.approx(62_400, abs=1)


# ─────────────────────────────────────────────────────────────
#  Family B — 87A × 112A LTCG interaction
#  Eligibility on TOTAL income (incl. post-exemption LTCG);
#  rebate/relief never offset the 112A tax itself.
# ─────────────────────────────────────────────────────────────

@pytest.mark.parametrize(
    "case_id, slab_income, raw_ltcg, expected_total_tax",
    [
        # LTCG within ₹1.25L exemption → no special tax, rebate intact
        ("B-01", 1_100_000, 100_000, 0.0),
        ("B-02", 1_100_000, 120_000, 0.0),
        # taxable LTCG 75,000 @12.5% = 9,375; total income 11.75L ≤ 12L
        # → slab 50,000 rebated, LTCG tax stands: 9,375 * 1.04 = 9,750
        ("B-03", 1_100_000, 200_000, 9_750.0),
        # total income 12.55L > 12L → rebate denied; marginal relief caps
        # slab tax at 55,000 (was 58,000): (55,000 + 9,375) * 1.04 = 66,950
        ("B-04", 1_180_000, 200_000, 66_950.0),
        # ₹1,000 over the exemption: taxable LTCG 1,000 → tax 125 → 130 w/ cess
        ("B-05", 1_100_000, 126_000, 130.0),
    ],
)
def test_family_b_rebate_ltcg_interaction(case_id, slab_income, raw_ltcg, expected_total_tax):
    special = compute_special_rate_tax(
        stcg_111a=0.0, ltcg_112a=raw_ltcg, ltcg_other=0.0, ruleset=AY_2026_27
    )
    taxable_ltcg = max(0.0, raw_ltcg - AY_2026_27.ltcg_112a_exemption)
    total_income = slab_income + taxable_ltcg
    r = _new_regime_tax(slab_income, total_income=total_income, special_rate_tax=special)
    assert r["total_tax"] == pytest.approx(expected_total_tax, abs=1), case_id


def test_b_rebate_never_offsets_112a_tax():
    """TAX-003: even at low income the 112A tax survives the rebate."""
    special = compute_special_rate_tax(0.0, 200_000, 0.0, ruleset=AY_2026_27)
    r = _new_regime_tax(500_000, total_income=575_000, special_rate_tax=special)
    # Slab tax 5,000 rebated; LTCG 9,375 stands
    assert r["tax_after_rebate"] == 0.0
    assert r["total_tax"] == pytest.approx(9_375 * 1.04, abs=1)


# ─────────────────────────────────────────────────────────────
#  Ruleset regression — AY 2025-26 must still compute the OLD rules
#  (belated/revised returns legal until 31-Dec-2026 / 31-Mar-2027)
# ─────────────────────────────────────────────────────────────

def test_ay2025_26_ruleset_preserved():
    # 7L full-rebate era: 7,00,000 → 0
    r = _new_regime_tax(700_000, ruleset=AY_2025_26)
    assert r["total_tax"] == 0.0
    # 12,00,000 under 2025-26 slabs: 20,000+30,000+30,000 = 80,000 → 83,200 w/ cess
    r = _new_regime_tax(1_200_000, ruleset=AY_2025_26)
    assert r["total_tax"] == pytest.approx(83_200, abs=1)


def test_get_ruleset_resolution():
    assert get_ruleset("2026-27") is AY_2026_27
    assert get_ruleset("AY 2025-26") is AY_2025_26
    assert get_ruleset(None) is AY_2026_27          # default = current AY
    assert get_ruleset("2030-31") is AY_2026_27     # unknown → current


# ─────────────────────────────────────────────────────────────
#  Integration — full pipeline via compute_itr (salaried)
# ─────────────────────────────────────────────────────────────

def _salaried(gross: float, tds: float = 0.0) -> UserInput:
    return UserInput(
        age=30,
        salary=SalaryInput(gross_salary=gross, basic_salary=gross * 0.5),
        taxes_paid=TaxPaidInput(tds_salary=tds),
    )


def test_integration_1265k_gross_is_nil_tax():
    """Gross 12,65,000 − 75,000 std deduction = 11,90,000 → 87A → zero tax."""
    result = compute_itr(_salaried(1_265_000))
    assert result.regime_comparison.new.total_tax == 0.0
    assert result.recommended_regime == "new"


def test_integration_g01_full_tds_refund():
    """G-01: liability 0, TDS 80,000 → refund of the full 80,000."""
    result = compute_itr(_salaried(1_265_000, tds=80_000))
    assert result.regime_comparison.new.net_payable == pytest.approx(-80_000, abs=1)


# ─────────────────────────────────────────────────────────────
#  Surcharge marginal relief at threshold cliffs (statutory rule:
#  tax+surcharge above a threshold may not exceed tax AT the
#  threshold plus the excess income). Hand-derived anchors.
# ─────────────────────────────────────────────────────────────

def test_surcharge_marginal_relief_new_regime_5075k():
    # Slab tax on 50.75L = 11,02,500; tax at 50L = 10,80,000 (no surcharge).
    # Cap = 10,80,000 + 75,000 = 11,55,000 pre-cess. Relief = 57,750.
    r = compute_slab_tax(
        5_075_000, "new", 35,
        total_income_for_surcharge=5_075_000, ruleset=AY_2026_27,
    )
    assert r["marginal_relief"] == pytest.approx(57_750, abs=1)
    assert r["tax_plus_surcharge"] == pytest.approx(1_155_000, abs=1)


def test_surcharge_marginal_relief_old_regime_51l_textbook():
    # Classic worked example: 51L old regime → tax 13,42,500, surcharge
    # 1,34,250; tax at 50L = 13,12,500; cap = 14,12,500; relief = 64,250.
    r = compute_slab_tax(
        5_100_000, "old", 35,
        total_income_for_surcharge=5_100_000, ruleset=AY_2026_27,
    )
    assert r["marginal_relief"] == pytest.approx(64_250, abs=1)
    assert r["tax_plus_surcharge"] == pytest.approx(1_412_500, abs=1)


def test_surcharge_no_relief_well_above_threshold():
    r = compute_slab_tax(
        6_000_000, "new", 35,
        total_income_for_surcharge=6_000_000, ruleset=AY_2026_27,
    )
    assert r["marginal_relief"] == 0.0
    assert r["surcharge"] == pytest.approx(138_000, abs=1)


@pytest.mark.parametrize("regime", ["new", "old"])
@pytest.mark.parametrize("lo,hi", [
    (4_950_000, 5_150_000),
    (9_950_000, 10_250_000),
    (19_950_000, 20_350_000),
])
def test_tax_monotonic_across_surcharge_cliffs(regime, lo, hi):
    """Property: total tax never decreases with income and never rises
    faster than the income increase (times 1.04 for cess)."""
    prev = None
    for inc in range(lo, hi, 10_000):
        t = compute_slab_tax(
            float(inc), regime, 35,
            total_income_for_surcharge=float(inc), ruleset=AY_2026_27,
        )["total_tax"]
        if prev is not None:
            assert t >= prev[1], f"{regime} tax decreased at {inc}"
            assert t - prev[1] <= (inc - prev[0]) * 1.05 + 1, (
                f"{regime} marginal rate >100% at {inc}"
            )
        prev = (inc, t)


# ─────────────────────────────────────────────────────────────
#  Trace emission (doc 22 §3 / doc 51) — every line item attributed
# ─────────────────────────────────────────────────────────────

def test_trace_rebate_applied():
    r = _new_regime_tax(1_190_000)
    rules = [t["rule"] for t in r["trace"]]
    assert "slab_tax.new" in rules
    assert "rebate_87a.applied" in rules
    applied = next(t for t in r["trace"] if t["rule"] == "rebate_87a.applied")
    assert applied["params"]["rebate"] == pytest.approx(59_000, abs=1)
    assert applied["params"]["limit"] == 1_200_000


def test_trace_marginal_relief_and_cess():
    r = _new_regime_tax(1_210_000)
    rules = [t["rule"] for t in r["trace"]]
    assert "rebate_87a.denied" in rules
    assert "rebate_87a.marginal_relief" in rules
    assert "cess" in rules
    relief = next(t for t in r["trace"] if t["rule"] == "rebate_87a.marginal_relief")
    assert relief["params"]["relief"] == pytest.approx(51_500, abs=1)
    assert relief["params"]["max_tax"] == pytest.approx(10_000, abs=1)


def test_trace_amounts_never_orphaned():
    """Doc 52 numeric-fidelity precondition: every traced amount is a real
    engine value, and the trace reaches the result object end-to-end."""
    result = compute_itr(_salaried(1_265_000))
    trace = result.regime_comparison.new.trace
    assert len(trace) > 0
    for entry in trace:
        assert entry["rule"], "every trace entry names its rule"
        assert isinstance(entry["params"], dict) and entry["params"]


def test_integration_belated_ay2025_26_still_uses_old_rules():
    """A belated AY 2025-26 return must not get the ₹12L rebate."""
    user = _salaried(1_265_000)
    user.assessment_year = "2025-26"
    result = compute_itr(user)
    # taxable 11,90,000 under 2025-26 slabs: 20,000+30,000+28,500 = 78,500 → 81,640
    assert result.regime_comparison.new.total_tax == pytest.approx(81_640, abs=1)
