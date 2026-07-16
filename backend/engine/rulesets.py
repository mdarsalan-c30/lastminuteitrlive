"""
rulesets.py
===========
AY-versioned tax rule constants.

Every constant that can change between Assessment Years lives here, in a
frozen Ruleset per AY — never inline in computation modules. This is the
structural fix for the "engine silently computes last year's tax" defect
(docs/research/30_ENGINE_GAP_AUDIT.md, Finding 1).

Both rulesets must remain available: belated/revised AY 2025-26 returns are
legal until 31-Dec-2026 / 31-Mar-2027.
"""

from __future__ import annotations

import math
from dataclasses import dataclass


# Slab tables: tuple of (upper_limit, rate); upper_limit None = top slab.
SlabTable = tuple[tuple[float | None, float], ...]


def round2(x: float) -> float:
    """Round-half-up to 2 decimals — the statutory convention. Python's
    built-in round() uses banker's rounding, which differs on exact
    .xx5 paise boundaries."""
    if x >= 0:
        return math.floor(x * 100 + 0.5) / 100
    return -math.floor(-x * 100 + 0.5) / 100


def clamp0(x: float) -> float:
    """Clamp a declared amount at zero. A negative parsed value (bad
    input/parser error) must not reduce other deductions or income."""
    return max(0.0, x)


@dataclass(frozen=True)
class Ruleset:
    ruleset_id: str
    assessment_year: str

    # Slab tables
    new_regime_slabs: SlabTable
    old_general_slabs: SlabTable
    old_senior_slabs: SlabTable
    old_super_senior_slabs: SlabTable

    # Surcharge bands
    surcharge_old: SlabTable
    surcharge_new: SlabTable
    surcharge_special: SlabTable

    cess_rate: float

    # 87A rebate — old regime
    rebate_87a_old_limit: float
    rebate_87a_old_cap: float

    # 87A rebate — new regime.
    # cap None = full slab-tax rebate (AY 2025-26 style);
    # a number = min(slab_tax, cap) (AY 2026-27: ₹60,000).
    rebate_87a_new_limit: float
    rebate_87a_new_cap: float | None

    # Special-rate capital gains (post 23-Jul-2024 rates in both AYs here)
    stcg_111a_rate: float
    ltcg_112a_rate: float
    ltcg_112a_exemption: float
    ltcg_other_rate: float

    # Chapter VI-A deduction caps (old regime only, except 80CCD(2))
    cap_80c: float
    cap_80ccd_1b: float
    cap_80d_self_normal: float
    cap_80d_self_senior: float
    cap_80d_parents_normal: float
    cap_80d_parents_senior: float
    cap_80tta: float
    cap_80ttb: float
    cap_80u_normal: float
    cap_80u_severe: float
    cap_80gg_annual: float
    rate_80ccd2_old: float          # employer NPS cap, old regime (% of basic)
    rate_80ccd2_new: float          # employer NPS cap, new regime (% of basic)
    rate_80gg_rent_offset: float    # 80GG: rent minus this % of ATI
    rate_80gg_ati: float            # 80GG: this % of ATI
    rate_80g_qualifying_limit: float  # 80G: 50%-category cap, % of GTI proxy

    # Sec 234F late-filing fee
    late_fee_234f_income_threshold: float
    late_fee_234f_low: float
    late_fee_234f_high: float


_OLD_GENERAL: SlabTable = (
    (250_000, 0.00),
    (500_000, 0.05),
    (1_000_000, 0.20),
    (None, 0.30),
)

_OLD_SENIOR: SlabTable = (  # age >= 60 and < 80
    (300_000, 0.00),
    (500_000, 0.05),
    (1_000_000, 0.20),
    (None, 0.30),
)

_OLD_SUPER_SENIOR: SlabTable = (  # age >= 80
    (500_000, 0.00),
    (1_000_000, 0.20),
    (None, 0.30),
)

_SURCHARGE_OLD: SlabTable = (
    (5_000_000, 0.00),
    (10_000_000, 0.10),
    (20_000_000, 0.15),
    (50_000_000, 0.25),
    (None, 0.37),
)

_SURCHARGE_NEW: SlabTable = (  # 37% band does not apply in new regime
    (5_000_000, 0.00),
    (10_000_000, 0.10),
    (20_000_000, 0.15),
    (None, 0.25),
)

_SURCHARGE_SPECIAL: SlabTable = (  # 111A/112A surcharge capped at 15%
    (5_000_000, 0.00),
    (10_000_000, 0.10),
    (None, 0.15),
)


AY_2025_26 = Ruleset(
    ruleset_id="AY2025-26.r1",
    assessment_year="2025-26",
    new_regime_slabs=(
        (300_000, 0.00),
        (700_000, 0.05),
        (1_000_000, 0.10),
        (1_200_000, 0.15),
        (1_500_000, 0.20),
        (None, 0.30),
    ),
    old_general_slabs=_OLD_GENERAL,
    old_senior_slabs=_OLD_SENIOR,
    old_super_senior_slabs=_OLD_SUPER_SENIOR,
    surcharge_old=_SURCHARGE_OLD,
    surcharge_new=_SURCHARGE_NEW,
    surcharge_special=_SURCHARGE_SPECIAL,
    cess_rate=0.04,
    rebate_87a_old_limit=500_000,
    rebate_87a_old_cap=12_500,
    rebate_87a_new_limit=700_000,
    rebate_87a_new_cap=None,  # full rebate up to 7L
    stcg_111a_rate=0.20,
    ltcg_112a_rate=0.125,
    ltcg_112a_exemption=125_000,
    ltcg_other_rate=0.20,
    cap_80c=150_000,
    cap_80ccd_1b=50_000,
    cap_80d_self_normal=25_000,
    cap_80d_self_senior=50_000,
    cap_80d_parents_normal=25_000,
    cap_80d_parents_senior=50_000,
    cap_80tta=10_000,
    cap_80ttb=50_000,
    cap_80u_normal=75_000,
    cap_80u_severe=125_000,
    cap_80gg_annual=60_000,
    rate_80ccd2_old=0.10,
    rate_80ccd2_new=0.14,
    rate_80gg_rent_offset=0.10,
    rate_80gg_ati=0.25,
    rate_80g_qualifying_limit=0.10,
    late_fee_234f_income_threshold=500_000,
    late_fee_234f_low=1_000,
    late_fee_234f_high=5_000,
)

AY_2026_27 = Ruleset(
    ruleset_id="AY2026-27.r1",
    assessment_year="2026-27",
    # Finance Act 2025 slabs (FY 2025-26): 4/8/12/16/20/24L
    new_regime_slabs=(
        (400_000, 0.00),
        (800_000, 0.05),
        (1_200_000, 0.10),
        (1_600_000, 0.15),
        (2_000_000, 0.20),
        (2_400_000, 0.25),
        (None, 0.30),
    ),
    old_general_slabs=_OLD_GENERAL,
    old_senior_slabs=_OLD_SENIOR,
    old_super_senior_slabs=_OLD_SUPER_SENIOR,
    surcharge_old=_SURCHARGE_OLD,
    surcharge_new=_SURCHARGE_NEW,
    surcharge_special=_SURCHARGE_SPECIAL,
    cess_rate=0.04,
    rebate_87a_old_limit=500_000,
    rebate_87a_old_cap=12_500,
    # 87A: up to ₹60,000 where total income <= ₹12,00,000; marginal relief above.
    rebate_87a_new_limit=1_200_000,
    rebate_87a_new_cap=60_000,
    stcg_111a_rate=0.20,
    ltcg_112a_rate=0.125,
    ltcg_112a_exemption=125_000,
    ltcg_other_rate=0.20,
    cap_80c=150_000,
    cap_80ccd_1b=50_000,
    cap_80d_self_normal=25_000,
    cap_80d_self_senior=50_000,
    cap_80d_parents_normal=25_000,
    cap_80d_parents_senior=50_000,
    cap_80tta=10_000,
    cap_80ttb=50_000,
    cap_80u_normal=75_000,
    cap_80u_severe=125_000,
    cap_80gg_annual=60_000,
    rate_80ccd2_old=0.10,
    rate_80ccd2_new=0.14,
    rate_80gg_rent_offset=0.10,
    rate_80gg_ati=0.25,
    rate_80g_qualifying_limit=0.10,
    late_fee_234f_income_threshold=500_000,
    late_fee_234f_low=1_000,
    late_fee_234f_high=5_000,
)

DEFAULT_RULESET = AY_2026_27

_BY_AY = {
    "2025-26": AY_2025_26,
    "2026-27": AY_2026_27,
}


def get_ruleset(assessment_year: str | None) -> Ruleset:
    """
    Resolve a Ruleset from an assessment-year string.
    Accepts "2026-27", "AY 2026-27", "AY2026-27" etc.
    Unknown/missing AY resolves to the current default (latest AY).
    """
    if not assessment_year:
        return DEFAULT_RULESET
    key = assessment_year.upper().replace("AY", "").strip()
    return _BY_AY.get(key, DEFAULT_RULESET)
