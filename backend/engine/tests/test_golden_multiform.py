"""
Golden scenarios for ITR-2 / ITR-3 / ITR-4 heads — AY 2026-27.

Families (doc 32 numbering):
  E — house property (let-out, loss caps, regime differences)
  F — capital gains (special rates, beneficial set-off, slab STCG)
  G — business / presumptive (44AD, 44ADA, enhanced limits)
  D — deductions (80CCD(2) regime-specific caps)

Every expected value is hand-derived from the statute, not from the engine.
These tests also pin three regressions fixed in this change:
  1. stcg_other (slab-rate CG) was double-counted in taxable income.
  2. Loss set-off burned losses against LTCG-112A (12.5% + 1.25L exemption)
     before LTCG-other (20%) — taxpayer-adverse ordering.
  3. Business-only filers received a phantom standard-deduction delta.
"""

from __future__ import annotations

import pytest

from business_income import compute_business_income
from capital_gains import compute_capital_gains
from deductions import compute_deductions
from house_property import compute_house_property
from models import (
    BusinessInput,
    CapitalGainsInput,
    DeductionsInput,
    HousePropertyInput,
    SalaryInput,
    UserInput,
)
from orchestrator import compute_itr


def _user(**kwargs) -> UserInput:
    defaults = dict(
        age=30,
        salary=SalaryInput(gross_salary=0.0, basic_salary=0.0),
        assessment_year="2026-27",
    )
    defaults.update(kwargs)
    return UserInput(**defaults)


# ─────────────────────────────────────────────────────────────
# Family F — capital gains (ITR-2)
# ─────────────────────────────────────────────────────────────

def test_f01_ltcg_112a_exemption_and_rate():
    """Salary 10L + LTCG 112A ₹2L. Special tax = (2L − 1.25L) × 12.5% = 9,375."""
    u = _user(
        salary=SalaryInput(gross_salary=1_000_000, basic_salary=500_000),
        capital_gains=CapitalGainsInput(ltcg_112a=200_000),
    )
    n = compute_itr(u).regime_comparison.new
    assert n.special_rate_tax == pytest.approx(9_375, abs=1)
    # Slab income: 10L − 75k std = 9.25L → 20k + 40k*0.10... derive:
    # 4L@0 + 4L@5% + 1.25L@10% = 20,000 + 12,500 = 32,500
    assert n.slab_tax == pytest.approx(32_500, abs=1)
    # Slab income ≤ 12L → 87A wipes slab tax; special CG tax survives (112A
    # is outside 87A in new regime). Total = 9,375 × 1.04 = 9,750.
    assert n.rebate_87a == pytest.approx(32_500, abs=1)
    assert n.total_tax == pytest.approx(9_750, abs=1)


def test_f02_stcl_setoff_beneficial_ordering():
    """
    STCG 111A ₹1L, LTCG-other ₹1L, LTCG 112A ₹2L, STCL ₹1.5L.
    STCL absorbs 111A (1L), residual 50k must hit LTCG-other (20%) before
    LTCG-112A (12.5% with 1.25L exemption).
    Result: 111A=0, other=50k, 112A=2L → taxable 112A = 75k.
    Special tax = 50k×20% + 75k×12.5% = 10,000 + 9,375 = 19,375.
    (Adverse ordering would give 23,125 — ₹3,750 worse for the user.)
    """
    cg = compute_capital_gains(
        CapitalGainsInput(
            stcg_111a=100_000, ltcg_112a=200_000, ltcg_other=100_000,
            stcl_equity=150_000,
        )
    )
    assert cg["stcg_111a_net"] == pytest.approx(0, abs=1)
    assert cg["ltcg_other_net"] == pytest.approx(50_000, abs=1)
    assert cg["ltcg_112a_net"] == pytest.approx(200_000, abs=1)
    assert cg["ltcg_112a_taxable"] == pytest.approx(75_000, abs=1)

    u = _user(
        salary=SalaryInput(gross_salary=1_000_000, basic_salary=500_000),
        capital_gains=CapitalGainsInput(
            stcg_111a=100_000, ltcg_112a=200_000, ltcg_other=100_000,
            stcl_equity=150_000,
        ),
    )
    n = compute_itr(u).regime_comparison.new
    assert n.special_rate_tax == pytest.approx(19_375, abs=1)


def test_f02b_ltcl_setoff_prefers_20pct_bucket():
    """LTCL ₹80k with LTCG-other ₹1L and 112A ₹1L: absorb other first."""
    cg = compute_capital_gains(
        CapitalGainsInput(ltcg_112a=100_000, ltcg_other=100_000, ltcl=80_000)
    )
    assert cg["ltcg_other_net"] == pytest.approx(20_000, abs=1)
    assert cg["ltcg_112a_net"] == pytest.approx(100_000, abs=1)
    # 112A 1L is fully inside the 1.25L exemption → zero taxable
    assert cg["ltcg_112a_taxable"] == pytest.approx(0, abs=1)


def test_f03_stcg_other_not_double_counted():
    """
    REGRESSION: salary 12L + slab-rate STCG ₹1L (new regime).
    Slab taxable must be 12L − 75k + 1L = 12.25L (was 13.25L before fix).
    Slab tax on 12.25L: 4L@0 + 4L@5% + 4L@10% + 25k@15% = 63,750.
    Total income 12.25L exceeds 12L rebate limit by 25k → 87A marginal
    relief caps tax at 25,000; + 4% cess = 26,000.
    """
    u = _user(
        salary=SalaryInput(gross_salary=1_200_000, basic_salary=600_000),
        capital_gains=CapitalGainsInput(stcg_other=100_000),
    )
    n = compute_itr(u).regime_comparison.new
    assert n.taxable_income == pytest.approx(1_225_000, abs=1)
    assert n.slab_tax == pytest.approx(63_750, abs=1)
    assert n.total_tax == pytest.approx(26_000, abs=1)


# ─────────────────────────────────────────────────────────────
# Family G — presumptive business / profession (ITR-4)
# ─────────────────────────────────────────────────────────────

def test_g01_44ada_enhanced_limit_and_tax():
    """
    44ADA receipts ₹60L, cash ≤5% → eligible under enhanced ₹75L limit.
    Presumptive income = 50% = ₹30L. No salary → no standard deduction.
    New-regime slab tax on 30L:
      4L@0 + 4L@5% + 4L@10% + 4L@15% + 4L@20% + 4L@25% + 6L@30%
      = 20k+40k+60k+80k+100k+180k = 4,80,000; ×1.04 = 4,99,200.
    """
    biz = compute_business_income(
        BusinessInput(
            business_type="presumptive_profession",
            gross_professional_receipts=6_000_000,
            cash_receipts_pct=0.0,
        )
    )
    assert biz["presumptive_eligible"] is True
    assert biz["section_used"] == "44ADA"
    assert biz["net_business_income"] == pytest.approx(3_000_000, abs=1)

    u = _user(
        age=35,
        business=BusinessInput(
            business_type="presumptive_profession",
            gross_professional_receipts=6_000_000,
        ),
    )
    n = compute_itr(u).regime_comparison.new
    assert n.taxable_income == pytest.approx(3_000_000, abs=1)
    assert n.slab_tax == pytest.approx(480_000, abs=1)
    assert n.total_tax == pytest.approx(499_200, abs=1)


def test_g02_44ad_enhanced_3cr_limit_digital():
    """44AD turnover ₹2.5Cr fully digital, cash 0% → eligible (≤3Cr). 6% = 15L."""
    biz = compute_business_income(
        BusinessInput(
            business_type="presumptive_business",
            turnover=25_000_000,
            digital_turnover_pct=1.0,
            cash_receipts_pct=0.0,
        )
    )
    assert biz["presumptive_eligible"] is True
    assert biz["net_business_income"] == pytest.approx(1_500_000, abs=1)


def test_g03_44ad_high_cash_uses_base_limit():
    """44AD turnover ₹2.5Cr with 10% cash → base ₹2Cr limit → NOT eligible."""
    biz = compute_business_income(
        BusinessInput(
            business_type="presumptive_business",
            turnover=25_000_000,
            digital_turnover_pct=0.5,
            cash_receipts_pct=0.10,
        )
    )
    assert biz["presumptive_eligible"] is False
    assert biz["net_business_income"] == pytest.approx(0, abs=1)


def test_g04_44ad_high_cash_within_base_limit_still_eligible():
    """Cash >5% does NOT disqualify if turnover ≤ ₹2Cr (base limit)."""
    biz = compute_business_income(
        BusinessInput(
            business_type="presumptive_business",
            turnover=15_000_000,
            digital_turnover_pct=0.0,
            cash_receipts_pct=0.30,
        )
    )
    assert biz["presumptive_eligible"] is True
    assert biz["net_business_income"] == pytest.approx(1_200_000, abs=1)  # 8%


def test_g05_44ada_high_cash_uses_base_limit():
    """44ADA receipts ₹60L with 10% cash → base ₹50L limit → NOT eligible."""
    biz = compute_business_income(
        BusinessInput(
            business_type="presumptive_profession",
            gross_professional_receipts=6_000_000,
            cash_receipts_pct=0.10,
        )
    )
    assert biz["presumptive_eligible"] is False


def test_g06_business_only_no_phantom_standard_deduction():
    """REGRESSION: zero salary → standard deduction must be 0, not 75k/50k."""
    u = _user(
        age=35,
        business=BusinessInput(
            business_type="presumptive_profession",
            gross_professional_receipts=2_000_000,
        ),
    )
    r = compute_itr(u)
    # 50% of 20L = 10L presumptive income; both regimes taxable == 10L
    assert r.regime_comparison.new.taxable_income == pytest.approx(1_000_000, abs=1)
    assert r.regime_comparison.old.taxable_income == pytest.approx(1_000_000, abs=1)


# ─────────────────────────────────────────────────────────────
# Family E — house property (let-out)
# ─────────────────────────────────────────────────────────────

def test_e01_let_out_positive_income():
    """
    Rent 3.6L, municipal tax 20k, interest 1.5L (old regime).
    NAV = 3.4L; 30% repair = 1.02L; 3.4L − 1.02L − 1.5L = 88,000.
    """
    hp = compute_house_property(
        HousePropertyInput(
            property_type="let_out",
            annual_rent_received=360_000,
            municipal_tax=20_000,
            home_loan_interest=150_000,
        ),
        "old",
    )
    assert hp["net_house_property_income"] == pytest.approx(88_000, abs=1)


def test_e02_let_out_loss_caps_by_regime():
    """
    Rent 2.4L, interest 4L → raw loss 2.32L.
    Old regime: set-off capped at 2L (32k carried forward).
    New regime: HP loss cannot be set off at all → 0.
    """
    hp_old = compute_house_property(
        HousePropertyInput(
            property_type="let_out",
            annual_rent_received=240_000,
            home_loan_interest=400_000,
        ),
        "old",
    )
    assert hp_old["net_house_property_income"] == pytest.approx(-200_000, abs=1)
    assert hp_old["excess_interest_disallowed"] == pytest.approx(32_000, abs=1)

    hp_new = compute_house_property(
        HousePropertyInput(
            property_type="let_out",
            annual_rent_received=240_000,
            home_loan_interest=400_000,
        ),
        "new",
    )
    assert hp_new["net_house_property_income"] == pytest.approx(0, abs=1)
    assert hp_new["excess_interest_disallowed"] == pytest.approx(232_000, abs=1)


# ─────────────────────────────────────────────────────────────
# Family D — 80CCD(2) regime-specific caps
# ─────────────────────────────────────────────────────────────

def test_d01_80ccd2_new_regime_14pct_cap():
    """
    Basic ₹10L, employer NPS ₹1.6L.
    Old regime cap: 10% of basic = ₹1,00,000.
    New regime cap: 14% of basic = ₹1,40,000 (Finance (No.2) Act 2024).
    """
    sal = SalaryInput(
        gross_salary=3_000_000, basic_salary=1_000_000,
        employer_nps_contribution=160_000,
    )
    d_old = compute_deductions(DeductionsInput(), sal, False, "old")
    d_new = compute_deductions(DeductionsInput(), sal, False, "new")
    assert d_old["deduction_80ccd_2"] == pytest.approx(100_000, abs=1)
    assert d_new["deduction_80ccd_2"] == pytest.approx(140_000, abs=1)


def test_d02_80ccd2_below_cap_passthrough():
    """Employer NPS below both caps passes through unchanged."""
    sal = SalaryInput(
        gross_salary=1_500_000, basic_salary=600_000,
        employer_nps_contribution=50_000,
    )
    d_old = compute_deductions(DeductionsInput(), sal, False, "old")
    d_new = compute_deductions(DeductionsInput(), sal, False, "new")
    assert d_old["deduction_80ccd_2"] == pytest.approx(50_000, abs=1)
    assert d_new["deduction_80ccd_2"] == pytest.approx(50_000, abs=1)
