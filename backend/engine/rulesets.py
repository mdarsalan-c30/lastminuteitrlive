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

from dataclasses import dataclass


# Slab tables: tuple of (upper_limit, rate); upper_limit None = top slab.
SlabTable = tuple[tuple[float | None, float], ...]


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
