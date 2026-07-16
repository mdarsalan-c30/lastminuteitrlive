"""
test_validations.py
====================
One CI test per implemented catalog ID (docs/research/31_VALIDATION_CATALOG.md
§11 contract: "one runtime validator + one CI test per ID, same source of
truth"), plus a coverage test asserting the registry contains exactly the IDs
this slice claims to implement.

Each GAT test builds an ITR-1-eligible baseline return, asserts the gate
PASSES, then mutates the single offending fact and asserts it FAILS with a
blocking (B) severity. The invariant tests (DED/TAX) assert the property holds
on real engine output.
"""

from __future__ import annotations

from models import (
    UserInput,
    SalaryInput,
    HousePropertyInput,
    CapitalGainsInput,
    BusinessInput,
    BroughtForwardLossesInput,
    DeductionsInput,
    IncomeHeadsResult,
    DeductionsResult,
    RegimeComparisonResult,
    SlabTaxResult,
    ProfileResult,
)
from orchestrator import compute_itr
from rulesets import get_ruleset
from validations import (
    ValidationContext,
    run_validations,
    registered_check_ids,
    blocking_failures,
)


# ── Helpers ───────────────────────────────────────────────────────────────

def _baseline() -> UserInput:
    """A clean, ITR-1-eligible salaried resident — passes every GAT gate."""
    return UserInput(
        age=30,
        residential_status="resident",
        salary=SalaryInput(gross_salary=800_000, basic_salary=400_000),
        house_property=HousePropertyInput(property_type="self_occupied"),
    )


def _zero_slab(regime: str) -> SlabTaxResult:
    return SlabTaxResult(
        regime=regime, taxable_income=0.0, slab_tax=0.0, special_rate_tax=0.0,
        gross_tax=0.0, rebate_87a=0.0, tax_after_rebate=0.0, surcharge=0.0,
        surcharge_rate=0.0, marginal_relief=0.0, tax_plus_surcharge=0.0,
        cess=0.0, total_tax=0.0, tds_and_advance_tax=0.0, net_payable=0.0,
    )


def _stub_ctx(user: UserInput) -> ValidationContext:
    """
    Context with zeroed result components — used only when the orchestrator
    refuses to compute an input (e.g. RNOR is out of scope). The gate under
    test in that path reads only `user` facts, so the stubs are never consulted.
    """
    income = IncomeHeadsResult(
        gross_salary=0.0, standard_deduction=0.0, hra_exemption=0.0,
        professional_tax=0.0, lta_exemption=0.0, net_salary_income=0.0,
        gross_annual_value=0.0, municipal_tax=0.0, net_annual_value=0.0,
        repair_deduction_30pct=0.0, interest_on_loan_24b=0.0,
        net_house_property_income=0.0, excess_interest_disallowed=0.0,
        fd_interest=0.0, savings_interest_gross=0.0, dividend_income=0.0,
        stcg_other_slab=0.0, total_other_income=0.0, stcg_111a_net=0.0,
        ltcg_112a_net=0.0, ltcg_other_net=0.0, gross_total_income=0.0,
        carry_forward_loss_set_off=0.0,
    )
    deductions = DeductionsResult(
        raw_80c_pool=0.0, capped_80c=0.0, deduction_80d=0.0,
        deduction_80ccd_1b=0.0, deduction_80ccd_2=0.0, deduction_80e=0.0,
        deduction_80g=0.0, deduction_80gg=0.0, deduction_80tta_ttb=0.0,
        deduction_80u=0.0, total_chapter_via=0.0, new_regime_deductions=0.0,
    )
    comparison = RegimeComparisonResult(
        old=_zero_slab("old"), new=_zero_slab("new"),
        recommended_regime="new", tax_saving=0.0, breakeven_deductions=0.0,
        deductions_lost_in_new=0.0, old_effective_rate=0.0, new_effective_rate=0.0,
    )
    return ValidationContext(
        user=user, profile=ProfileResult(), income=income,
        deductions=deductions, comparison=comparison,
        ruleset=get_ruleset(user.assessment_year),
    )


def _ctx(user: UserInput) -> ValidationContext:
    try:
        result = compute_itr(user)
    except ValueError:
        return _stub_ctx(user)
    return ValidationContext(
        user=user,
        profile=result.profile,
        income=result.income_heads,
        deductions=result.deductions,
        comparison=result.regime_comparison,
        ruleset=get_ruleset(user.assessment_year),
    )


def _result_for(user: UserInput, check_id: str):
    results = run_validations(_ctx(user), only={check_id})
    assert len(results) == 1, f"{check_id} should produce exactly one result"
    return results[0]


def _assert_passes(user: UserInput, check_id: str) -> None:
    r = _result_for(user, check_id)
    assert r.passed, f"{check_id} should pass on baseline: {r.message}"


def _assert_fails(user: UserInput, check_id: str, severity: str = "B") -> None:
    r = _result_for(user, check_id)
    assert not r.passed, f"{check_id} should fail for the mutated fact"
    assert r.severity == severity
    assert r.message, f"{check_id} failure must carry an explanation"


def _mutate(**overrides) -> UserInput:
    u = _baseline()
    for path, value in overrides.items():
        obj = u
        parts = path.split(".")
        for p in parts[:-1]:
            obj = getattr(obj, p)
        setattr(obj, parts[-1], value)
    return u


# ── GAT — ITR-1 eligibility gates ─────────────────────────────────────────

def test_gat_001_resident():
    _assert_passes(_baseline(), "GAT-001")
    _assert_fails(_mutate(residential_status="rnor"), "GAT-001")


def test_gat_002_income_cap():
    _assert_passes(_baseline(), "GAT-002")
    big = _baseline()
    big.salary.gross_salary = 6_000_000
    _assert_fails(big, "GAT-002")


def test_gat_003_no_business():
    _assert_passes(_baseline(), "GAT-003")
    biz = _baseline()
    biz.business = BusinessInput(business_type="presumptive_business", turnover=1_000_000)
    _assert_fails(biz, "GAT-003")


def test_gat_004_hp_count():
    _assert_passes(_baseline(), "GAT-004")
    many = _baseline()
    many.house_properties = [
        HousePropertyInput(property_type="self_occupied"),
        HousePropertyInput(property_type="self_occupied"),
        HousePropertyInput(property_type="let_out", annual_rent_received=240_000),
    ]
    _assert_fails(many, "GAT-004")


def test_gat_005_no_stcg():
    _assert_passes(_baseline(), "GAT-005")
    u = _baseline()
    u.capital_gains = CapitalGainsInput(stcg_111a=50_000)
    _assert_fails(u, "GAT-005")


def test_gat_006_ltcg_112a_cap():
    ok = _baseline()
    ok.capital_gains = CapitalGainsInput(ltcg_112a=100_000)
    _assert_passes(ok, "GAT-006")
    bad = _baseline()
    bad.capital_gains = CapitalGainsInput(ltcg_112a=200_000)
    _assert_fails(bad, "GAT-006")


def test_gat_007_no_other_cg():
    _assert_passes(_baseline(), "GAT-007")
    u = _baseline()
    u.capital_gains = CapitalGainsInput(ltcg_other=100_000)
    _assert_fails(u, "GAT-007")


def test_gat_008_no_capital_losses():
    _assert_passes(_baseline(), "GAT-008")
    u = _baseline()
    u.capital_gains = CapitalGainsInput(stcl_equity=50_000)
    _assert_fails(u, "GAT-008")
    u2 = _baseline()
    u2.carry_forward = BroughtForwardLossesInput(ltcl=30_000)
    _assert_fails(u2, "GAT-008")


def test_gat_009_not_director():
    _assert_passes(_baseline(), "GAT-009")
    _assert_fails(_mutate(**{"profile_flags.is_director": True}), "GAT-009")


def test_gat_010_no_unlisted_equity():
    _assert_passes(_baseline(), "GAT-010")
    _assert_fails(_mutate(**{"profile_flags.has_unlisted_equity": True}), "GAT-010")


def test_gat_011_no_foreign_assets():
    _assert_passes(_baseline(), "GAT-011")
    _assert_fails(_mutate(**{"profile_flags.has_foreign_assets": True}), "GAT-011")


def test_gat_012_no_foreign_income():
    _assert_passes(_baseline(), "GAT-012")
    _assert_fails(_mutate(**{"profile_flags.has_foreign_income": True}), "GAT-012")


def test_gat_014_no_194n():
    _assert_passes(_baseline(), "GAT-014")
    _assert_fails(_mutate(**{"profile_flags.tds_deducted_194n": True}), "GAT-014")


def test_gat_015_no_deferred_esop():
    _assert_passes(_baseline(), "GAT-015")
    _assert_fails(_mutate(**{"profile_flags.esop_tax_deferred": True}), "GAT-015")


def test_gat_016_agri_cap():
    ok = _mutate(**{"profile_flags.agricultural_income": 5_000})
    _assert_passes(ok, "GAT-016")
    _assert_fails(_mutate(**{"profile_flags.agricultural_income": 10_000}), "GAT-016")


# ── Universal invariants (should always hold on engine output) ────────────

def test_ded_001_80c_cap_invariant():
    # Over-declared 80C — engine caps at 1.5L; validator must confirm the cap held.
    u = _baseline()
    u.deductions = DeductionsInput(epf=200_000, ppf=100_000)  # raw 3L, capped to 1.5L
    _assert_passes(u, "DED-001")


def test_ded_004_80ccd1b_cap_invariant():
    u = _baseline()
    u.deductions = DeductionsInput(nps_self=120_000)  # over the 50k cap
    _assert_passes(u, "DED-004")


def test_ded_009_deductions_le_gti_invariant():
    u = _baseline()
    u.deductions = DeductionsInput(epf=150_000, health_insurance_self=25_000, nps_self=50_000)
    _assert_passes(u, "DED-009")


def test_tax_003_rebate_not_on_special_invariant():
    # Low slab income + LTCG present: 87A rebate must not wipe the 112A tax.
    u = _baseline()
    u.salary = SalaryInput(gross_salary=400_000, basic_salary=200_000)
    u.capital_gains = CapitalGainsInput(ltcg_112a=300_000)
    _assert_passes(u, "TAX-003")


# ── Registry coverage (the "same source of truth" guard) ──────────────────

EXPECTED_IDS = {
    "GAT-001", "GAT-002", "GAT-003", "GAT-004", "GAT-005", "GAT-006",
    "GAT-007", "GAT-008", "GAT-009", "GAT-010", "GAT-011", "GAT-012",
    "GAT-014", "GAT-015", "GAT-016",
    "DED-001", "DED-004", "DED-009", "TAX-003",
}


def test_registry_matches_claimed_ids():
    ids = registered_check_ids()
    assert set(ids) == EXPECTED_IDS
    assert len(ids) == len(set(ids)), "duplicate check IDs registered"


def test_baseline_has_no_blocking_failures():
    results = run_validations(_ctx(_baseline()))
    blocks = blocking_failures(results)
    assert blocks == [], f"baseline should pass all gates, got: {[b.id for b in blocks]}"


def test_run_validations_returns_all_when_unfiltered():
    results = run_validations(_ctx(_baseline()))
    assert len(results) == len(EXPECTED_IDS)
