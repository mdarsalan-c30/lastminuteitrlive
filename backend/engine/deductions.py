"""
deductions.py
=============
Computes all deductions under Chapter VI-A (and 24b interest which is
a head-specific deduction, handled separately in house_property.py).

Old regime: all deductions applicable
New regime: ONLY standard deduction (in salary.py) + 80CCD(2) employer NPS

Limits now live on the Ruleset (rulesets.py) — one frozen block per AY:
80C ₹1.5L · 80CCD(1B) ₹50k · 80CCD(2) 10% basic old / 14% basic new ·
80D ₹25k/₹50k self, ₹25k/₹50k parents · 80E uncapped · 80G 100%/50% ·
80TTA ₹10k / 80TTB ₹50k · 80U ₹75k/₹1.25L · 80GG least-of-three, ₹60k cap.

Changes vs previous version (behaviour-preserving except where noted)
---------------------------------------------------------------------
- Every CAP_* constant sourced from the Ruleset (module-level aliases kept
  as deprecated re-exports so risk_checker/tests importing them don't break).
- Declared amounts clamped at entry (negative EPF/donation/interest values
  can no longer reduce other deductions or income). (Correction.)
- round2 (half-up) replaces round(x, 2) banker's rounding. (Correction.)
- KNOWN APPROXIMATION unchanged: 80GG uses the caller-supplied GTI proxy as
  "adjusted total income". Statutory ATI excludes special-rate LTCG/STCG and
  other Chapter VI-A deductions, so the proxy over-allows for filers with
  capital gains. Fix belongs in the orchestrator (pass true ATI); the
  formula here is already correct for whatever ATI it is given.
- KNOWN DEFERRAL unchanged: the 80G 10%-of-GTI qualifying limit for capped
  categories must be applied by the orchestrator once GTI is known. Verify
  it actually is — a stale comment covering an unapplied statutory cap is a
  silent over-deduction.
"""

from __future__ import annotations
from typing import Literal

from models import DeductionsInput, SalaryInput
from rulesets import Ruleset, DEFAULT_RULESET, round2, clamp0


# ── Deprecated aliases — values live on the Ruleset now. Kept only so
#    existing imports keep working; do not use in new code. ─────────────
CAP_80C = DEFAULT_RULESET.cap_80c
CAP_80CCD_1B = DEFAULT_RULESET.cap_80ccd_1b
CAP_80D_SELF_NORMAL = DEFAULT_RULESET.cap_80d_self_normal
CAP_80D_SELF_SENIOR = DEFAULT_RULESET.cap_80d_self_senior
CAP_80D_PARENTS_NORMAL = DEFAULT_RULESET.cap_80d_parents_normal
CAP_80D_PARENTS_SENIOR = DEFAULT_RULESET.cap_80d_parents_senior
CAP_80TTA = DEFAULT_RULESET.cap_80tta
CAP_80TTB = DEFAULT_RULESET.cap_80ttb
CAP_80U_NORMAL = DEFAULT_RULESET.cap_80u_normal
CAP_80U_SEVERE = DEFAULT_RULESET.cap_80u_severe
CAP_80GG_ANNUAL = DEFAULT_RULESET.cap_80gg_annual
RATE_80CCD2_OLD = DEFAULT_RULESET.rate_80ccd2_old
RATE_80CCD2_NEW = DEFAULT_RULESET.rate_80ccd2_new


def _compute_80gg(
    rent_paid: float,
    adjusted_total_income: float,
    ruleset: Ruleset,
) -> float:
    """
    80GG — deduction for rent paid when no HRA is received.
    Least of: (a) ₹60,000 p.a., (b) 25% of adjusted total income,
    (c) actual rent paid minus 10% of adjusted total income.
    """
    if rent_paid <= 0:
        return 0.0
    limit_rent_excess = max(
        0.0, rent_paid - ruleset.rate_80gg_rent_offset * adjusted_total_income
    )
    limit_25pct = ruleset.rate_80gg_ati * adjusted_total_income
    return round2(
        max(0.0, min(ruleset.cap_80gg_annual, limit_25pct, limit_rent_excess))
    )


def compute_deductions(
    d: DeductionsInput,
    salary: SalaryInput,
    is_senior: bool,
    regime: Literal["old", "new"],
    home_loan_principal: float = 0.0,    # pulled from HousePropertyInput
    adjusted_total_income: float = 0.0,  # GTI proxy for 80GG least-of-three cap
    ruleset: Ruleset = DEFAULT_RULESET,
) -> dict:
    """
    Returns dict with all deduction line items and totals.
    """
    # ── 80CCD(2) Employer NPS — allowed in BOTH regimes ──
    # New regime cap is 14% of basic (Finance (No.2) Act 2024); old regime 10%.
    ccd2_rate = ruleset.rate_80ccd2_new if regime == "new" else ruleset.rate_80ccd2_old
    max_ccd2 = clamp0(salary.basic_salary) * ccd2_rate
    ccd2 = min(clamp0(salary.employer_nps_contribution), max_ccd2)

    if regime == "new":
        # Only employer NPS is available in new regime
        return {
            "raw_80c_pool": 0.0,
            "capped_80c": 0.0,
            "deduction_80d": 0.0,
            "deduction_80ccd_1b": 0.0,
            "deduction_80ccd_2": round2(ccd2),
            "deduction_80e": 0.0,
            "deduction_80g": 0.0,
            "deduction_80gg": 0.0,
            "deduction_80tta_ttb": 0.0,
            "deduction_80u": 0.0,
            "total_chapter_via": 0.0,
            "new_regime_deductions": round2(ccd2),
        }

    # ── Old regime: full Chapter VI-A ──

    # 80C pool (each item clamped — a negative parse can't offset the pool)
    pool_80c = (
        clamp0(d.epf)
        + clamp0(d.ppf)
        + clamp0(d.elss)
        + clamp0(d.lic_premium)
        + clamp0(d.nsc)
        + clamp0(home_loan_principal)    # from house property
        + clamp0(d.tuition_fees)
        + clamp0(d.other_80c)
    )
    capped_80c = min(pool_80c, ruleset.cap_80c)

    # 80D
    self_limit = (
        ruleset.cap_80d_self_senior if is_senior else ruleset.cap_80d_self_normal
    )
    parent_limit = (
        ruleset.cap_80d_parents_senior if d.parents_senior
        else ruleset.cap_80d_parents_normal
    )
    deduction_80d = min(clamp0(d.health_insurance_self), self_limit) + min(
        clamp0(d.health_insurance_parents), parent_limit
    )

    # 80CCD(1B)
    deduction_80ccd_1b = min(clamp0(d.nps_self), ruleset.cap_80ccd_1b)

    # 80E — no cap
    deduction_80e = clamp0(d.education_loan_interest)

    # 80GG — rent paid when no HRA received (mutually exclusive with HRA Sec 10(13A))
    if salary.hra_received > 0:
        deduction_80gg = 0.0
    else:
        deduction_80gg = _compute_80gg(
            clamp0(d.rent_paid_no_hra), clamp0(adjusted_total_income), ruleset
        )

    # 80G
    deduction_80g = clamp0(d.donations_100pct) + (clamp0(d.donations_50pct) * 0.50)
    # Note: qualifying limit (10% of GTI) for some categories is applied
    # in orchestrator once GTI is known; here we take full declared amount.

    # 80TTA / 80TTB
    savings_int = clamp0(d.savings_interest_deduction)
    if is_senior:
        deduction_80tta_ttb = min(savings_int, ruleset.cap_80ttb)
    else:
        deduction_80tta_ttb = min(savings_int, ruleset.cap_80tta)

    # 80U
    if d.self_disability:
        deduction_80u = (
            ruleset.cap_80u_severe if d.disability_severe else ruleset.cap_80u_normal
        )
    else:
        deduction_80u = 0.0

    total_chapter_via = round2(
        capped_80c
        + deduction_80d
        + deduction_80ccd_1b
        + ccd2
        + deduction_80e
        + deduction_80g
        + deduction_80gg
        + deduction_80tta_ttb
        + deduction_80u
    )

    return {
        "raw_80c_pool": round2(pool_80c),
        "capped_80c": round2(capped_80c),
        "deduction_80d": round2(deduction_80d),
        "deduction_80ccd_1b": round2(deduction_80ccd_1b),
        "deduction_80ccd_2": round2(ccd2),
        "deduction_80e": round2(deduction_80e),
        "deduction_80g": round2(deduction_80g),
        "deduction_80gg": round2(deduction_80gg),
        "deduction_80tta_ttb": round2(deduction_80tta_ttb),
        "deduction_80u": round2(deduction_80u),
        "total_chapter_via": total_chapter_via,
        "new_regime_deductions": round2(ccd2),
    }
