"""
depreciation.py
===============
WDV block depreciation for ITR-3 books cases (Sec 32, Rule 5).

Rules implemented
-----------------
- Depreciation is computed block-wise on Written Down Value.
- Assets put to use for LESS than 180 days in the year of purchase get HALF
  the block rate (second proviso to Sec 32(1)).
- Sale proceeds reduce the block before depreciation. Sales first absorb the
  full-rate base (opening + ≥180d additions), then the <180d additions.
- If sale proceeds exceed the whole block, the excess is a deemed short-term
  capital gain u/s 50 — the engine reports it and flags CA review rather than
  guessing schedule placement.

Common block rates (Appendix I): buildings 10%, furniture 10%,
plant & machinery 15%, motor vehicles 15%, computers & software 40%,
intangibles 25%.
"""

from __future__ import annotations

from models import DepreciationBlockInput

KNOWN_BLOCK_RATES = {
    "building_10": 0.10,
    "furniture_10": 0.10,
    "plant_machinery_15": 0.15,
    "motor_vehicle_15": 0.15,
    "computers_40": 0.40,
    "intangibles_25": 0.25,
}


def compute_depreciation(blocks: list[DepreciationBlockInput]) -> dict:
    """
    Returns:
      total_depreciation   : deductible against books profit
      closing_wdv_total    : combined closing WDV across blocks
      st_gain_50           : deemed STCG u/s 50 (sale above block value)
      per_block            : detail rows for the depreciation schedule
    """
    total_dep = 0.0
    closing_total = 0.0
    st_gain_50 = 0.0
    per_block: list[dict] = []

    for b in blocks:
        rate = max(0.0, min(1.0, b.rate))
        opening = max(0.0, b.opening_wdv)
        add_full = max(0.0, b.additions_180d_plus)
        add_half = max(0.0, b.additions_under_180d)
        sale = max(0.0, b.sale_proceeds)

        # Sales absorb the full-rate base first, then half-rate additions.
        full_base = max(0.0, opening + add_full - sale)
        sale_remaining = max(0.0, sale - (opening + add_full))
        half_base = max(0.0, add_half - sale_remaining)
        excess_sale = max(0.0, sale_remaining - add_half)

        dep = 0.0
        if full_base + half_base > 0:
            dep = round(rate * full_base + (rate / 2.0) * half_base, 2)

        closing = round(full_base + half_base - dep, 2)

        total_dep += dep
        closing_total += closing
        st_gain_50 += excess_sale

        per_block.append({
            "block": b.block,
            "rate": rate,
            "opening_wdv": round(opening, 2),
            "additions_180d_plus": round(add_full, 2),
            "additions_under_180d": round(add_half, 2),
            "sale_proceeds": round(sale, 2),
            "depreciation": dep,
            "closing_wdv": closing,
            "st_gain_50": round(excess_sale, 2),
        })

    return {
        "total_depreciation": round(total_dep, 2),
        "closing_wdv_total": round(closing_total, 2),
        "st_gain_50": round(st_gain_50, 2),
        "per_block": per_block,
    }
