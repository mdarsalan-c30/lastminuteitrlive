"""
orchestrator.py
===============
Single public entry point for the ITR Layer-1 engine.

Usage
-----
    from orchestrator import compute_itr, build_layer2_handoff
    from models import UserInput, SalaryInput, ...

    user = UserInput(age=30, salary=SalaryInput(gross_salary=1_200_000, basic_salary=600_000))
    result = compute_itr(user)
    handoff = build_layer2_handoff(result, user)
"""

from __future__ import annotations

from models import (
    UserInput,
    IncomeHeadsResult,
    DeductionsResult,
    BusinessIncomeResult,
    ITRResult,
    RiskFlag,
)
from profiler import build_profile
from salary import compute_net_salary
from house_property import compute_house_property, compute_house_property_portfolio
from other_income import compute_other_income
from capital_gains import compute_capital_gains
from business_income import compute_business_income
from carry_forward import apply_brought_forward
from deductions import compute_deductions
from regime_compare import compute_regime_comparison
from rulesets import get_ruleset
from risk_checker import run_risk_checks
from confidence import compute_confidence
from recommendations import generate_recommendations


def _auto_fill_deduction_inputs(user: UserInput, is_senior: bool) -> None:
    """Populate 80TTA/80TTB from savings interest if caller left it at zero."""
    d = user.deductions
    if d.savings_interest_deduction == 0 and user.other_income.savings_account_interest > 0:
        cap = 50_000 if is_senior else 10_000
        d.savings_interest_deduction = min(user.other_income.savings_account_interest, cap)


def compute_itr(user: UserInput) -> ITRResult:
    """
    Main computation function.

    Execution order
    ---------------
    1.  Profile validation + ITR form routing
    2.  Income heads (salary, HP, other, CG, business)
    3.  Gross Total Income aggregation
    4.  Deductions (old and new regime variants)
    5.  Regime tax computation (old + new in parallel)
    6.  Regime comparison + recommendation
    7.  Lawful optimization recommendations (Layer 2 hook)
    8.  Risk flags
    9.  Confidence scoring
    10. Package into ITRResult
    """

    profile = build_profile(user)
    if profile.out_of_scope_reasons:
        raise ValueError(
            "Input is out of scope for this engine:\n"
            + "\n".join(f"  • {r}" for r in profile.out_of_scope_reasons)
        )

    _auto_fill_deduction_inputs(user, profile.is_senior)

    salary_old = compute_net_salary(user.salary, regime="old")
    salary_new = compute_net_salary(user.salary, regime="new")

    # Multi-property portfolio (ITR-2/3) replaces the single-property input
    # when supplied; otherwise the original single-property path is used.
    if user.house_properties:
        hp_old = compute_house_property_portfolio(user.house_properties, regime="old")
        hp_new = compute_house_property_portfolio(user.house_properties, regime="new")
    else:
        hp_old = compute_house_property(user.house_property, regime="old")
        hp_new = compute_house_property(user.house_property, regime="new")

    other = compute_other_income(user.other_income)
    cg_raw = compute_capital_gains(user.capital_gains)
    biz_dict = compute_business_income(user.business)

    # ── Brought-forward losses (Schedule BFLA) — after intra-head set-off ──
    # Unabsorbed depreciation cannot be set off against presumptive income
    # (44AD/44ADA deem depreciation already allowed) — books cases only.
    dep_ok = biz_dict["section_used"] == "books"
    bf_old = apply_brought_forward(
        user.carry_forward,
        hp_income=hp_old["net_house_property_income"],
        cg=cg_raw,
        business_income=biz_dict["net_business_income"],
        dep_against_business_allowed=dep_ok,
    )
    bf_new = apply_brought_forward(
        user.carry_forward,
        hp_income=hp_new["net_house_property_income"],
        cg=cg_raw,
        business_income=biz_dict["net_business_income"],
        dep_against_business_allowed=dep_ok,
    )
    # CG and business adjustments are regime-independent — use the old-run
    # values as canonical; only the HP head differs between regimes.
    cg = bf_old["cg"]
    biz_income = bf_old["business_income"]
    hp_income_old = bf_old["hp_income"]
    hp_income_new = bf_new["hp_income"]

    gti_old = max(
        0.0,
        round(
            salary_old["net_salary_income"]
            + hp_income_old
            + other["total_other_income_gross"]
            + biz_income
            + cg["stcg_other_slab"]
            + cg["stcg_111a_net"]
            + cg["ltcg_112a_net"]
            + cg["ltcg_other_net"],
            2,
        ),
    )

    gti_new = max(
        0.0,
        round(
            salary_new["net_salary_income"]
            + hp_income_new
            + other["total_other_income_gross"]
            + biz_income
            + cg["stcg_other_slab"]
            + cg["stcg_111a_net"]
            + cg["ltcg_112a_net"]
            + cg["ltcg_other_net"],
            2,
        ),
    )

    if user.house_properties:
        home_loan_principal_total = sum(
            p.home_loan_principal for p in user.house_properties
        )
    else:
        home_loan_principal_total = user.house_property.home_loan_principal

    ruleset = get_ruleset(user.assessment_year)

    ded_old_dict = compute_deductions(
        d=user.deductions,
        salary=user.salary,
        is_senior=profile.is_senior,
        regime="old",
        home_loan_principal=home_loan_principal_total,
        adjusted_total_income=gti_old,
        ruleset=ruleset,
    )
    ded_new_dict = compute_deductions(
        d=user.deductions,
        salary=user.salary,
        is_senior=profile.is_senior,
        regime="new",
        home_loan_principal=0.0,
        ruleset=ruleset,
    )

    deductions_result = DeductionsResult(
        raw_80c_pool=ded_old_dict["raw_80c_pool"],
        capped_80c=ded_old_dict["capped_80c"],
        deduction_80d=ded_old_dict["deduction_80d"],
        deduction_80ccd_1b=ded_old_dict["deduction_80ccd_1b"],
        deduction_80ccd_2=ded_old_dict["deduction_80ccd_2"],
        deduction_80e=ded_old_dict["deduction_80e"],
        deduction_80g=ded_old_dict["deduction_80g"],
        deduction_80gg=ded_old_dict["deduction_80gg"],
        deduction_80tta_ttb=ded_old_dict["deduction_80tta_ttb"],
        deduction_80u=ded_old_dict["deduction_80u"],
        total_chapter_via=ded_old_dict["total_chapter_via"],
        new_regime_deductions=ded_new_dict["new_regime_deductions"],
    )

    total_tax_paid = (
        user.taxes_paid.tds_salary
        + user.taxes_paid.tds_other
        + user.taxes_paid.advance_tax_paid
        + user.taxes_paid.self_assessment_tax_paid
    )

    std_ded_delta = salary_new["standard_deduction"] - salary_old["standard_deduction"]
    comparison = compute_regime_comparison(
        gti_old=gti_old,
        gti_new=gti_new,
        chapter_via_deductions=ded_old_dict["total_chapter_via"],
        new_regime_deductions=ded_new_dict["new_regime_deductions"],
        special_rate_components=cg,
        stcg_other_slab=cg["stcg_other_slab"],
        age=user.age,
        tds_and_advance=total_tax_paid,
        standard_deduction_delta=std_ded_delta,
        late_filing=user.late_filing,
        ruleset=ruleset,
    )

    income_heads = IncomeHeadsResult(
        gross_salary=salary_old["gross_salary"],
        standard_deduction=salary_old["standard_deduction"],
        hra_exemption=salary_old["hra_exemption"],
        professional_tax=salary_old["professional_tax"],
        lta_exemption=salary_old["lta_exemption"],
        net_salary_income=salary_old["net_salary_income"],
        gross_annual_value=hp_old["gross_annual_value"],
        municipal_tax=hp_old["municipal_tax"],
        net_annual_value=hp_old["net_annual_value"],
        repair_deduction_30pct=hp_old["repair_deduction_30pct"],
        interest_on_loan_24b=hp_old["interest_on_loan_24b"],
        net_house_property_income=hp_income_old,
        excess_interest_disallowed=hp_old["excess_interest_disallowed"],
        fd_interest=other["fd_interest"],
        savings_interest_gross=other["savings_interest_gross"],
        dividend_income=other["dividend_income"],
        stcg_other_slab=cg["stcg_other_slab"],
        total_other_income=other["total_other_income_gross"],
        stcg_111a_net=cg["stcg_111a_net"],
        ltcg_112a_net=cg["ltcg_112a_net"],
        ltcg_other_net=cg["ltcg_other_net"],
        gross_total_income=gti_old,
        carry_forward_loss_set_off=cg["carry_forward_stcl"] + cg["carry_forward_ltcl"],
        bf_loss_set_off_total=bf_old["bf_set_off_total"],
        losses_carried_forward={
            # b/f losses not consumed this year + fresh current-year losses
            "hp": round(
                bf_old["carried_out"]["hp"]
                + hp_old.get("hp_loss_carried_forward", 0.0),
                2,
            ),
            "stcl": round(
                bf_old["carried_out"]["stcl"] + cg["carry_forward_stcl"], 2
            ),
            "ltcl": round(
                bf_old["carried_out"]["ltcl"] + cg["carry_forward_ltcl"], 2
            ),
            "business": round(
                bf_old["carried_out"]["business"]
                + biz_dict.get("current_year_business_loss_cf", 0.0),
                2,
            ),
            "unabsorbed_depreciation": bf_old["carried_out"][
                "unabsorbed_depreciation"
            ],
        },
        depreciation_allowed=biz_dict.get("depreciation_allowed", 0.0),
    )

    business_result = BusinessIncomeResult(
        presumptive_44ad=biz_dict["presumptive_44ad"],
        presumptive_44ada=biz_dict["presumptive_44ada"],
        books_profit=biz_dict["books_profit"],
        net_business_income=biz_dict["net_business_income"],
        section_used=biz_dict["section_used"],
        presumptive_eligible=biz_dict["presumptive_eligible"],
    )

    risk_flags = run_risk_checks(user, profile, income_heads, deductions_result, comparison)

    # ── Flags from carry-forward / portfolio / depreciation paths ──
    if bf_old["lapsed_sec80"] > 0:
        risk_flags.append(RiskFlag(
            code="BF_LOSS_DENIED_SEC80",
            severity="warning",
            message=(
                f"₹{bf_old['lapsed_sec80']:,.0f} of brought-forward capital/"
                "business losses were NOT set off because the loss-year return "
                "was filed after the due date (Sec 80). House-property loss and "
                "unabsorbed depreciation are unaffected."
            ),
        ))
    if bf_old["bf_set_off_total"] > 0:
        risk_flags.append(RiskFlag(
            code="BF_LOSS_CLAIMED",
            severity="info",
            message=(
                f"₹{bf_old['bf_set_off_total']:,.0f} of prior-year losses set "
                "off this year. Keep last year's ITR acknowledgment and "
                "Schedule CFL handy — the ITD matches these figures."
            ),
        ))
    if hp_old.get("deemed_letout_pending", 0) > 0:
        risk_flags.append(RiskFlag(
            code="DEEMED_LETOUT_PENDING",
            severity="warning",
            message=(
                "More than two self-occupied properties: the extra ones are "
                "taxed as 'deemed let-out' on notional rent. A CA should set "
                "the expected rent before filing."
            ),
        ))
    if biz_dict.get("depreciation_st_gain_50", 0.0) > 0:
        risk_flags.append(RiskFlag(
            code="DEP_BLOCK_ST_GAIN_50",
            severity="warning",
            message=(
                f"Asset sales exceeded a depreciation block by "
                f"₹{biz_dict['depreciation_st_gain_50']:,.0f} — this is a "
                "deemed short-term capital gain u/s 50. CA review recommended."
            ),
        ))
    if bf_old["carried_out"]["unabsorbed_depreciation"] > 0:
        risk_flags.append(RiskFlag(
            code="UNABSORBED_DEP_REMAINDER",
            severity="info",
            message=(
                "Unabsorbed depreciation remaining after business income — it "
                "carries forward without time limit; set-off against other "
                "heads is left for CA review in this version."
            ),
        ))
    recommendations = generate_recommendations(
        user, profile, income_heads, deductions_result, comparison, business_result
    )
    confidence = compute_confidence(user, profile, gti_old)

    return ITRResult(
        assessment_year=user.assessment_year,
        age=user.age,
        mode=user.mode,
        profile=profile,
        income_heads=income_heads,
        business_income=business_result,
        deductions=deductions_result,
        regime_comparison=comparison,
        risk_flags=risk_flags,
        recommendations=recommendations,
        confidence=confidence,
    )


def build_layer2_handoff(result: ITRResult, user: UserInput) -> dict:
    """JSON payload for RAG Layer 2 CA brain (screens 17–18)."""
    rc = result.regime_comparison
    rec = rc.recommended_regime
    net_old = rc.old.net_payable
    net_new = rc.new.net_payable

    return {
        "assessment_year": result.assessment_year,
        "mode": result.mode,
        "profile": {
            "age": result.age,
            "age_group": result.profile.age_group,
            "is_senior": result.profile.is_senior,
            "itr_form": result.profile.itr_form,
            "routing_reasons": result.profile.routing_reasons,
            "expert_required": result.profile.expert_required,
            "residential_status": user.residential_status,
            "income_band": user.profile_flags.income_band,
            "business_type_code": user.profile_flags.business_type_code,
        },
        "income_summary": {
            "gross_total_income": result.income_heads.gross_total_income,
            "net_salary_income": result.income_heads.net_salary_income,
            "net_house_property_income": result.income_heads.net_house_property_income,
            "net_business_income": result.business_income.net_business_income,
            "total_other_income": result.income_heads.total_other_income,
            "stcg_111a_net": result.income_heads.stcg_111a_net,
            "ltcg_112a_net": result.income_heads.ltcg_112a_net,
        },
        "deductions_summary": {
            "total_chapter_via": result.deductions.total_chapter_via,
            "capped_80c": result.deductions.capped_80c,
            "deduction_80d": result.deductions.deduction_80d,
            "deductions_lost_in_new": rc.deductions_lost_in_new,
        },
        "regime_comparison": {
            "recommended_regime": rec,
            "old_net_payable": net_old,
            "new_net_payable": net_new,
            "tax_saving": rc.tax_saving,
            "breakeven_deductions": rc.breakeven_deductions,
        },
        "recommendations": [
            {
                "id": r.id,
                "plain_english": r.plain_english,
                "gov_section": r.gov_section,
                "risk": r.risk,
                "proof_required": r.proof_required,
                "requires_user_confirmation": r.requires_user_confirmation,
                "estimated_benefit": r.estimated_benefit,
                "blocked": r.blocked,
            }
            for r in result.recommendations
            if not r.blocked
        ],
        "risk_flags": [
            {"code": f.code, "severity": f.severity, "message": f.message}
            for f in result.risk_flags
        ],
        "confidence": {
            "completeness_score": result.confidence.completeness_score,
            "filing_ready": result.confidence.filing_ready,
            "missing_documents": result.confidence.missing_documents,
            "ca_escalation_recommended": result.confidence.ca_escalation_recommended,
        },
        "profession_hint": user.business.profession_name or None,
        "layer1_complete": True,
    }
