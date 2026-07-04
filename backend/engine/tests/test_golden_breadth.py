"""
Golden scenarios for full ITR-2/3 breadth — AY 2026-27.

Families:
  H — brought-forward losses (Schedule BFLA / Sec 70–74, 80)
  I — multi-property portfolio (Sec 23(4), 24(b), 71(3A))
  J — WDV depreciation schedules for books cases (Sec 32)

Every expected value is hand-derived from the statute, not from the engine.
"""

from __future__ import annotations

import pytest

from carry_forward import apply_brought_forward
from capital_gains import compute_capital_gains
from depreciation import compute_depreciation
from house_property import compute_house_property_portfolio
from models import (
    BroughtForwardLossesInput,
    BusinessInput,
    CapitalGainsInput,
    DepreciationBlockInput,
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
# Family H — brought-forward losses
# ─────────────────────────────────────────────────────────────

def test_h01_bf_stcl_offsets_ltcg_other_before_112a():
    """
    Current: LTCG-other ₹1L (20%), LTCG-112A ₹2L (12.5%).
    b/f STCL ₹1L — must burn the 20% bucket first (beneficial order).
    Result: other=0, 112A=2L → taxable 112A = 75k → special tax 9,375.
    """
    cg = compute_capital_gains(
        CapitalGainsInput(ltcg_112a=200_000, ltcg_other=100_000)
    )
    out = apply_brought_forward(
        BroughtForwardLossesInput(stcl=100_000),
        hp_income=0.0,
        cg=cg,
        business_income=0.0,
    )
    assert out["cg"]["ltcg_other_net"] == 0.0
    assert out["cg"]["ltcg_112a_net"] == 200_000.0
    assert out["bf_set_off_total"] == 100_000.0
    assert out["carried_out"]["stcl"] == 0.0


def test_h02_bf_ltcl_only_against_ltcg():
    """b/f LTCL cannot touch STCG — only LTCG."""
    cg = compute_capital_gains(
        CapitalGainsInput(stcg_111a=100_000, ltcg_other=50_000)
    )
    out = apply_brought_forward(
        BroughtForwardLossesInput(ltcl=80_000),
        hp_income=0.0,
        cg=cg,
        business_income=0.0,
    )
    assert out["cg"]["stcg_111a_net"] == 100_000.0
    assert out["cg"]["ltcg_other_net"] == 0.0
    assert out["carried_out"]["ltcl"] == 30_000.0


def test_h03_bf_hp_loss_intra_head_only():
    """b/f HP loss only reduces positive current-year HP income."""
    out = apply_brought_forward(
        BroughtForwardLossesInput(hp_loss=150_000),
        hp_income=100_000.0,
        cg=compute_capital_gains(CapitalGainsInput()),
        business_income=500_000.0,
    )
    assert out["hp_income"] == 0.0
    assert out["business_income"] == 500_000.0
    assert out["carried_out"]["hp"] == 50_000.0
    assert out["bf_set_off_total"] == 100_000.0


def test_h04_sec80_denies_late_filed_capital_and_business():
    """Late-filed loss year: STCL/LTCL/business lapse; HP + unabsorbed dep survive."""
    cg = compute_capital_gains(CapitalGainsInput(ltcg_other=200_000))
    out = apply_brought_forward(
        BroughtForwardLossesInput(
            stcl=50_000,
            business_loss=80_000,
            hp_loss=40_000,
            unabsorbed_depreciation=30_000,
            prior_return_filed_on_time=False,
        ),
        hp_income=40_000.0,
        cg=cg,
        business_income=100_000.0,
        dep_against_business_allowed=True,
    )
    assert out["lapsed_sec80"] == 130_000.0
    assert out["cg"]["ltcg_other_net"] == 200_000.0  # STCL denied
    assert out["business_income"] == 70_000.0  # only unabsorbed dep applied
    assert out["hp_income"] == 0.0  # HP loss still applied
    assert "bf_losses_denied_sec80" in out["notes"]


def test_h05_unabsorbed_dep_not_against_presumptive():
    """Unabsorbed depreciation cannot reduce 44AD/44ADA income."""
    out = apply_brought_forward(
        BroughtForwardLossesInput(unabsorbed_depreciation=50_000),
        hp_income=0.0,
        cg=compute_capital_gains(CapitalGainsInput()),
        business_income=200_000.0,
        dep_against_business_allowed=False,
    )
    assert out["business_income"] == 200_000.0
    assert out["carried_out"]["unabsorbed_depreciation"] == 50_000.0


def test_h06_end_to_end_bf_stcl_reduces_tax():
    """Salary 12L + LTCG-other 2L, b/f STCL 2L → special tax wiped."""
    u = _user(
        salary=SalaryInput(gross_salary=1_200_000, basic_salary=600_000),
        capital_gains=CapitalGainsInput(ltcg_other=200_000),
        carry_forward=BroughtForwardLossesInput(stcl=200_000),
    )
    r = compute_itr(u)
    assert r.profile.itr_form == "ITR-2"
    assert r.income_heads.ltcg_other_net == 0.0
    assert r.income_heads.bf_loss_set_off_total == 200_000.0
    assert r.regime_comparison.new.special_rate_tax == pytest.approx(0, abs=1)


# ─────────────────────────────────────────────────────────────
# Family I — multi-property portfolio
# ─────────────────────────────────────────────────────────────

def test_i01_two_sops_combined_interest_cap():
    """
    Two SOPs, interest 1.5L + 1L = 2.5L. Old regime: combined cap ₹2L.
    Head income = −2L; excess 50k disallowed.
    """
    props = [
        HousePropertyInput(
            property_type="self_occupied", home_loan_interest=150_000
        ),
        HousePropertyInput(
            property_type="self_occupied", home_loan_interest=100_000
        ),
    ]
    old = compute_house_property_portfolio(props, regime="old")
    assert old["net_house_property_income"] == -200_000.0
    assert old["excess_interest_disallowed"] == 50_000.0
    assert old["deemed_letout_pending"] == 0

    new = compute_house_property_portfolio(props, regime="new")
    assert new["net_house_property_income"] == 0.0
    assert new["excess_interest_disallowed"] == 250_000.0


def test_i02_sop_plus_let_out_head_loss_cap():
    """
    SOP interest 1L + let-out loss 2.5L = head loss 3.5L.
    Old: set-off capped at ₹2L; CF = 1.5L.
    """
    props = [
        HousePropertyInput(
            property_type="self_occupied", home_loan_interest=100_000
        ),
        HousePropertyInput(
            property_type="let_out",
            annual_rent_received=100_000,
            municipal_tax=0,
            home_loan_interest=320_000,  # NAV 70k − interest 320k = −250k
        ),
    ]
    # Let-out: GAV 1L, repair 30k, NAV after repair 70k, interest 320k → −250k
    # SOP: −100k → head −350k → cap −200k, CF 150k
    old = compute_house_property_portfolio(props, regime="old")
    assert old["net_house_property_income"] == -200_000.0
    assert old["hp_loss_carried_forward"] == 150_000.0


def test_i03_third_sop_flags_deemed_letout():
    """Third self-occupied is not auto-valued — CA review flag."""
    props = [
        HousePropertyInput(property_type="self_occupied", home_loan_interest=50_000),
        HousePropertyInput(property_type="self_occupied", home_loan_interest=50_000),
        HousePropertyInput(property_type="self_occupied", home_loan_interest=50_000),
    ]
    out = compute_house_property_portfolio(props, regime="old")
    assert out["deemed_letout_pending"] == 1
    # Only first two SOPs in the NIL-value block: interest 1L, within cap
    assert out["net_house_property_income"] == -100_000.0


def test_i04_end_to_end_multi_property_routes_itr2():
    u = _user(
        salary=SalaryInput(gross_salary=800_000, basic_salary=400_000),
        house_properties=[
            HousePropertyInput(
                property_type="self_occupied", home_loan_interest=150_000
            ),
            HousePropertyInput(
                property_type="let_out",
                annual_rent_received=240_000,
                municipal_tax=20_000,
                home_loan_interest=100_000,
            ),
        ],
    )
    r = compute_itr(u)
    assert r.profile.itr_form == "ITR-2"
    # Let-out: GAV 240k − muni 20k = 220k NAV; repair 66k; after repair 154k
    # − interest 100k = +54k. SOP −150k. Head = −96k (within ₹2L cap).
    assert r.income_heads.net_house_property_income == pytest.approx(-96_000, abs=1)


# ─────────────────────────────────────────────────────────────
# Family J — depreciation schedules (books / ITR-3)
# ─────────────────────────────────────────────────────────────

def test_j01_full_year_block_depreciation():
    """Plant & machinery 15% on opening WDV 10L → dep 1.5L, closing 8.5L."""
    out = compute_depreciation([
        DepreciationBlockInput(
            block="plant_machinery_15",
            rate=0.15,
            opening_wdv=1_000_000,
        )
    ])
    assert out["total_depreciation"] == 150_000.0
    assert out["closing_wdv_total"] == 850_000.0
    assert out["st_gain_50"] == 0.0


def test_j02_half_rate_for_under_180_days():
    """
    Opening 0, addition <180d ₹4L at 40% computers → half rate 20% → dep 80k.
    """
    out = compute_depreciation([
        DepreciationBlockInput(
            block="computers_40",
            rate=0.40,
            additions_under_180d=400_000,
        )
    ])
    assert out["total_depreciation"] == 80_000.0
    assert out["closing_wdv_total"] == 320_000.0


def test_j03_sale_above_block_is_st_gain_50():
    """Opening 1L, sale 1.5L → excess 50k is deemed STCG u/s 50."""
    out = compute_depreciation([
        DepreciationBlockInput(
            block="plant_machinery_15",
            rate=0.15,
            opening_wdv=100_000,
            sale_proceeds=150_000,
        )
    ])
    assert out["total_depreciation"] == 0.0
    assert out["st_gain_50"] == 50_000.0


def test_j04_books_profit_net_of_depreciation():
    """Receipts 10L − expenses 3L − dep 1.5L = books profit 5.5L."""
    u = _user(
        business=BusinessInput(
            business_type="regular_books",
            actual_gross_receipts=1_000_000,
            actual_expenses=300_000,
            depreciation_blocks=[
                DepreciationBlockInput(
                    block="plant_machinery_15",
                    rate=0.15,
                    opening_wdv=1_000_000,
                )
            ],
        ),
    )
    r = compute_itr(u)
    assert r.profile.itr_form == "ITR-3"
    assert r.business_income.net_business_income == 550_000.0
    assert r.income_heads.depreciation_allowed == 150_000.0


def test_j05_books_loss_floors_income_and_carries_forward():
    """Receipts 1L − expenses 2L − dep 50k = loss 1.5L → income 0, CF 1.5L."""
    u = _user(
        salary=SalaryInput(gross_salary=500_000, basic_salary=250_000),
        business=BusinessInput(
            business_type="regular_books",
            actual_gross_receipts=100_000,
            actual_expenses=200_000,
            depreciation_blocks=[
                DepreciationBlockInput(
                    block="furniture_10",
                    rate=0.10,
                    opening_wdv=500_000,
                )
            ],
        ),
    )
    r = compute_itr(u)
    assert r.business_income.net_business_income == 0.0
    assert r.income_heads.losses_carried_forward["business"] == 150_000.0
    # Salary still taxed — business loss not set off against salary (Sec 71(2A))
    assert r.income_heads.net_salary_income > 0
