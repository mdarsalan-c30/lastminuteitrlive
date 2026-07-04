"""
recommendations.py
==================
Rule-based lawful optimization recommendations (Layer 2 hook — no LLM).

Product constitution: only lawful deductions with proof. Red/risky suggestions
are blocked or require explicit user confirmation with proof upload.
"""

from __future__ import annotations

from models import (
    UserInput,
    Recommendation,
    IncomeHeadsResult,
    DeductionsResult,
    RegimeComparisonResult,
    BusinessIncomeResult,
    ProfileResult,
)

CAP_80C = 150_000
CAP_80CCD_1B = 50_000


def _rec(
    id: str,
    plain_english: str,
    gov_section: str,
    risk: str,
    proof: list[str],
    confirm: bool,
    benefit: float = 0.0,
    blocked: bool = False,
) -> Recommendation:
    return Recommendation(
        id=id,
        plain_english=plain_english,
        gov_section=gov_section,
        risk=risk,  # type: ignore[arg-type]
        proof_required=proof,
        requires_user_confirmation=confirm,
        estimated_benefit=round(benefit, 2),
        blocked=blocked,
    )


def generate_recommendations(
    user: UserInput,
    profile: ProfileResult,
    income: IncomeHeadsResult,
    deductions: DeductionsResult,
    comparison: RegimeComparisonResult,
    business: BusinessIncomeResult,
) -> list[Recommendation]:
    recs: list[Recommendation] = []
    is_old_better = comparison.recommended_regime == "old"
    marginal_rate = 0.30 if income.gross_total_income > 1_000_000 else 0.20

    # ── 80C headroom ──
    headroom_80c = CAP_80C - deductions.capped_80c
    if headroom_80c > 0 and is_old_better:
        recs.append(_rec(
            "80C_HEADROOM",
            f"You have ₹{headroom_80c:,.0f} unused under Section 80C (₹1.5L cap). "
            "Consider PPF, ELSS, or additional EPF if you have proof of investment.",
            "Section 80C",
            "green",
            ["Investment receipt / statement"],
            False,
            benefit=headroom_80c * marginal_rate * 1.04,
        ))

    # ── 80CCD(1B) NPS ──
    nps_headroom = CAP_80CCD_1B - deductions.deduction_80ccd_1b
    if nps_headroom > 0 and is_old_better and user.deductions.nps_self < CAP_80CCD_1B:
        recs.append(_rec(
            "NPS_80CCD1B",
            f"Additional NPS contribution up to ₹{nps_headroom:,.0f} qualifies under "
            "Section 80CCD(1B) — over and above the ₹1.5L 80C limit.",
            "Section 80CCD(1B)",
            "green",
            ["NPS transaction statement / PRAN account statement"],
            False,
            benefit=nps_headroom * marginal_rate * 1.04,
        ))

    # ── 80D health insurance ──
    self_limit = 50_000 if profile.is_senior else 25_000
    parent_limit = 50_000 if user.deductions.parents_senior else 25_000
    d80d_gap = (self_limit - min(user.deductions.health_insurance_self, self_limit))
    d80d_gap += (parent_limit - min(user.deductions.health_insurance_parents, parent_limit))
    if d80d_gap > 0 and is_old_better:
        recs.append(_rec(
            "80D_HEALTH",
            f"You may claim up to ₹{d80d_gap:,.0f} more under Section 80D for health "
            "insurance premiums — only if policies are in your or parents' names.",
            "Section 80D",
            "green",
            ["Health insurance premium receipt / policy copy"],
            True,
            benefit=d80d_gap * marginal_rate * 1.04,
        ))

    # ── 80TTA for non-seniors — most-missed deduction ──
    if not profile.is_senior and is_old_better:
        savings_int = user.other_income.savings_account_interest
        tta_gap = min(10_000, savings_int) - deductions.deduction_80tta_ttb
        if tta_gap > 0:
            recs.append(_rec(
                "80TTA_SAVINGS",
                f"Savings account interest up to ₹10,000 is deductible under Section "
                f"80TTA. You can claim ₹{tta_gap:,.0f} more — this is one of the most "
                "commonly missed deductions.",
                "Section 80TTA",
                "green",
                ["Bank interest certificate / passbook"],
                False,
                benefit=tta_gap * marginal_rate * 1.04,
            ))

    # ── 80TTB for seniors ──
    if profile.is_senior and is_old_better:
        interest = user.other_income.savings_account_interest + user.other_income.fd_interest
        ttb_gap = min(50_000, interest) - deductions.deduction_80tta_ttb
        if ttb_gap > 0:
            recs.append(_rec(
                "80TTB_SENIOR",
                f"As a senior citizen, Section 80TTB allows up to ₹50,000 deduction on "
                f"interest income. You may claim ₹{ttb_gap:,.0f} more with bank certificates.",
                "Section 80TTB",
                "green",
                ["Bank interest certificate / FD statement"],
                False,
                benefit=ttb_gap * marginal_rate * 1.04,
            ))

    # ── HRA vs 80GG ──
    s = user.salary
    if s.hra_received == 0 and s.actual_rent_paid > 0 and is_old_better:
        recs.append(_rec(
            "HRA_VS_80GG",
            "You pay rent but receive no HRA. Section 80GG may apply if you don't own "
            "a house in the city — requires Form 10BA and rent receipts.",
            "Section 80GG",
            "yellow",
            ["Rent receipts", "Form 10BA", "Landlord PAN if rent > ₹1L/year"],
            True,
        ))
    if s.hra_received > 0 and s.actual_rent_paid == 0:
        recs.append(_rec(
            "HRA_NO_RENT_BLOCKED",
            "HRA exemption requires actual rent paid with valid rent agreement and receipts. "
            "Do not claim HRA without proof — this is a common AIS mismatch trigger.",
            "Section 10(13A)",
            "red",
            ["Rent agreement", "Rent receipts", "Landlord PAN"],
            True,
            blocked=True,
        ))

    # ── Home loan 24(b) ──
    if user.house_property.home_loan_interest > 0 and is_old_better:
        if income.excess_interest_disallowed > 0:
            recs.append(_rec(
                "HP_INTEREST_CAP",
                f"Self-occupied home loan interest is capped at ₹2 lakh u/s 24(b). "
                f"₹{income.excess_interest_disallowed:,.0f} is disallowed. If property is "
                "let-out, declare it correctly to claim full interest.",
                "Section 24(b)",
                "yellow",
                ["Home loan interest certificate from bank"],
                True,
            ))
        elif user.house_property.home_loan_interest < 200_000:
            recs.append(_rec(
                "HP_24B_CLAIM",
                "Ensure your home loan interest certificate is uploaded — interest up to "
                "₹2 lakh reduces taxable income under old regime.",
                "Section 24(b)",
                "green",
                ["Home loan interest certificate"],
                False,
            ))

    # ── Regime switch ──
    if comparison.recommended_regime == "new" and comparison.deductions_lost_in_new > 50_000:
        recs.append(_rec(
            "REGIME_NEW_BETTER",
            f"New tax regime saves ₹{comparison.tax_saving:,.0f} for your profile. "
            f"Chapter VI-A deductions worth ₹{comparison.deductions_lost_in_new:,.0f} "
            "would be forfeited — verify before opting out u/s 115BAC(6).",
            "Section 115BAC",
            "green",
            [],
            False,
        ))
    elif comparison.recommended_regime == "old" and comparison.breakeven_deductions > 0:
        recs.append(_rec(
            "REGIME_OLD_BETTER",
            f"Old regime is better by ₹{comparison.tax_saving:,.0f}. Your deductions "
            f"(₹{deductions.total_chapter_via:,.0f}) exceed the breakeven of "
            f"₹{comparison.breakeven_deductions:,.0f}.",
            "Section 115BAC",
            "green",
            [],
            False,
        ))

    # ── 44AD / 44ADA presumptive ──
    biz = user.business
    if biz.business_type in ("presumptive_business", "presumptive_profession"):
        if not business.presumptive_eligible:
            recs.append(_rec(
                "PRESUMPTIVE_INELIGIBLE",
                "Presumptive taxation (44AD/44ADA) may not apply — base limits are "
                "₹2Cr turnover / ₹50L receipts, enhanced to ₹3Cr / ₹75L when cash "
                "receipts are 5% or less. Above the limit you must maintain books (ITR-3).",
                "Section 44AD/44ADA",
                "yellow",
                ["Bank statements", "GST returns if applicable"],
                True,
            ))
        elif business.section_used == "44AD":
            recs.append(_rec(
                "44AD_ELIGIBLE",
                f"Section 44AD presumptive income of ₹{business.presumptive_44ad:,.0f} "
                "(8%/6% of turnover) applies. Maintain turnover records and bank statements.",
                "Section 44AD",
                "green",
                ["Bank statements", "Turnover summary"],
                False,
            ))
        elif business.section_used == "44ADA":
            recs.append(_rec(
                "44ADA_ELIGIBLE",
                f"Section 44ADA presumptive income of ₹{business.presumptive_44ada:,.0f} "
                "(50% of gross receipts) applies for specified professions.",
                "Section 44ADA",
                "green",
                ["Professional receipts summary", "Bank statements"],
                False,
            ))

    # ── Brought-forward losses applied this year ──
    if income.bf_loss_set_off_total > 0:
        recs.append(_rec(
            "BF_LOSS_APPLIED",
            f"₹{income.bf_loss_set_off_total:,.0f} of prior-year losses were set off "
            "this year (Schedule BFLA). Keep last year's ITR acknowledgment and "
            "Schedule CFL — the ITD matches these figures.",
            "Sections 70–74 / Schedule CFL",
            "green",
            ["Prior-year ITR acknowledgment", "Schedule CFL"],
            False,
            benefit=income.bf_loss_set_off_total * 0.2,
        ))
    else:
        cf = user.carry_forward
        has_cg = any([
            user.capital_gains.stcg_111a, user.capital_gains.ltcg_112a,
            user.capital_gains.stcg_other, user.capital_gains.ltcg_other,
        ])
        has_hp = (
            user.house_property.property_type != "none"
            or len(user.house_properties) > 0
        )
        has_biz = biz.business_type != "none"
        no_bf = not any([
            cf.hp_loss, cf.stcl, cf.ltcl, cf.business_loss,
            cf.unabsorbed_depreciation,
        ])
        if no_bf and (has_cg or has_hp or has_biz):
            recs.append(_rec(
                "CHECK_PRIOR_LOSSES",
                "Check last year's ITR Schedule CFL for unused capital, house-property, "
                "or business losses. Carried-forward losses often cut this year's tax "
                "more than any new deduction.",
                "Schedule CFL / BFLA",
                "yellow",
                ["Prior-year ITR acknowledgment"],
                True,
            ))

    # ── Depreciation on books cases ──
    if income.depreciation_allowed > 0:
        recs.append(_rec(
            "DEPRECIATION_CLAIMED",
            f"Depreciation of ₹{income.depreciation_allowed:,.0f} was allowed under "
            "Section 32 (WDV block method). Keep the depreciation schedule and "
            "asset invoices for assessment.",
            "Section 32",
            "green",
            ["Depreciation schedule", "Asset purchase invoices"],
            False,
            benefit=income.depreciation_allowed * 0.3,
        ))
    elif biz.business_type == "regular_books" and not biz.depreciation_blocks:
        recs.append(_rec(
            "DEPRECIATION_MISSING",
            "Books cases can claim depreciation on business assets (computers 40%, "
            "plant 15%, furniture 10%). Enter opening WDV from last year's schedule "
            "if you own equipment used for work.",
            "Section 32",
            "yellow",
            ["Prior-year depreciation schedule"],
            True,
        ))

    # ── Block fake expense patterns ──
    if biz.business_type == "regular_books" and biz.actual_expenses > biz.actual_gross_receipts * 0.9:
        recs.append(_rec(
            "EXPENSE_RATIO_HIGH",
            "Expenses exceed 90% of gross receipts — ensure every expense is backed by "
            "invoices. Unsupported business expenses are not lawful deductions.",
            "Section 28",
            "red",
            ["Expense invoices", "Bank payment proof"],
            True,
            blocked=True,
        ))

    # ── Profession packs (hints for L2 RAG) ──
    if user.profile_flags.business_type_code == "w":
        recs.append(_rec(
            "PROFESSION_PACK_FREELANCE",
            "Freelancer profile: verify if 44ADA presumptive (50% of receipts) applies "
            "or if actual books (ITR-3) give a lower tax. L2 can ask profession-specific questions.",
            "Section 44ADA",
            "green",
            ["Professional receipts", "Client invoices"],
            False,
        ))

    return recs
