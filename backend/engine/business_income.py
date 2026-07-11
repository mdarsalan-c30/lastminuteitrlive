"""
business_income.py
==================
Computes business/profession income for ITR-3 (regular books) and ITR-4 (presumptive).

Sections implemented
--------------------
44AD  : Presumptive income for small business — 8% of turnover (6% for digital
        receipts). Turnover limit ₹2 crore, ENHANCED to ₹3 crore where cash
        receipts are ≤ 5% of turnover (Finance Act 2023; retained for AY 2026-27).
44ADA : Presumptive income for specified profession — 50% of gross receipts.
        Receipts limit ₹50 lakh, ENHANCED to ₹75 lakh where cash receipts ≤ 5%.
Books : ITR-3 — actual profit = gross receipts − expenses (caller supplies values).

Note: cash receipts above 5% do NOT disqualify presumptive taxation — they only
mean the lower (non-enhanced) turnover/receipt limit applies.
"""

from __future__ import annotations

from depreciation import compute_depreciation
from models import BusinessInput

TURNOVER_LIMIT_44AD = 2_00_00_000
TURNOVER_LIMIT_44AD_ENHANCED = 3_00_00_000    # cash receipts ≤ 5%
RECEIPTS_LIMIT_44ADA = 50_00_000
RECEIPTS_LIMIT_44ADA_ENHANCED = 75_00_000     # cash receipts ≤ 5%
RATE_44AD_DEFAULT = 0.08
RATE_44AD_DIGITAL = 0.06
RATE_44ADA = 0.50
CASH_ENHANCED_LIMIT_PCT = 0.05


def _low_cash(biz: BusinessInput) -> bool:
    return biz.cash_receipts_pct <= CASH_ENHANCED_LIMIT_PCT


def compute_business_income(biz: BusinessInput) -> dict:
    """
    Returns dict matching BusinessIncomeResult fields.
    """
    if biz.business_type == "none":
        return {
            "presumptive_44ad": 0.0,
            "presumptive_44ada": 0.0,
            "books_profit": 0.0,
            "net_business_income": 0.0,
            "section_used": "",
            "presumptive_eligible": False,
        }

    if biz.business_type == "regular_books":
        # Prefer explicit F&O Schedule BP buckets when provided (isolated set-off).
        if (
            biz.fno_turnover > 0
            or biz.fno_non_speculative_profit != 0
            or biz.fno_speculative_profit != 0
        ):
            non_spec = biz.fno_non_speculative_profit
            spec = biz.fno_speculative_profit
            # Speculative and non-speculative losses stay in their own buckets —
            # we do not net them against each other here.
            profit = max(0.0, non_spec) + max(0.0, spec)
            current_year_loss_cf = round(
                max(0.0, -non_spec) + max(0.0, -spec), 2
            )
            return {
                "presumptive_44ad": 0.0,
                "presumptive_44ada": 0.0,
                "books_profit": round(profit, 2),
                "net_business_income": round(profit, 2),
                "section_used": "books_fno",
                "presumptive_eligible": False,
                "depreciation_allowed": 0.0,
                "depreciation_schedule": [],
                "depreciation_st_gain_50": 0.0,
                "current_year_business_loss_cf": current_year_loss_cf,
                "fno_turnover": biz.fno_turnover,
                "audit_flag_10cr": biz.fno_turnover >= 10_00_00_000,
            }

        dep = compute_depreciation(biz.depreciation_blocks)
        raw_profit = (
            biz.actual_gross_receipts
            - biz.actual_expenses
            - dep["total_depreciation"]
        )
        # A books loss cannot be set off against salary (Sec 71(2A)); the
        # engine keeps V1 conservative — income floors at 0 and the loss is
        # reported for carry-forward (8 AYs) instead of inter-head set-off.
        profit = max(0.0, raw_profit)
        current_year_loss_cf = round(max(0.0, -raw_profit), 2)
        return {
            "presumptive_44ad": 0.0,
            "presumptive_44ada": 0.0,
            "books_profit": round(profit, 2),
            "net_business_income": round(profit, 2),
            "section_used": "books",
            "presumptive_eligible": False,
            "depreciation_allowed": dep["total_depreciation"],
            "depreciation_schedule": dep["per_block"],
            "depreciation_st_gain_50": dep["st_gain_50"],
            "current_year_business_loss_cf": current_year_loss_cf,
        }

    if biz.business_type == "presumptive_business":
        limit = TURNOVER_LIMIT_44AD_ENHANCED if _low_cash(biz) else TURNOVER_LIMIT_44AD
        eligible = biz.turnover <= limit
        if not eligible:
            return {
                "presumptive_44ad": 0.0,
                "presumptive_44ada": 0.0,
                "books_profit": 0.0,
                "net_business_income": 0.0,
                "section_used": "",
                "presumptive_eligible": False,
            }
        digital_pct = min(1.0, max(0.0, biz.digital_turnover_pct))
        digital_part = biz.turnover * digital_pct * RATE_44AD_DIGITAL
        non_digital_part = biz.turnover * (1 - digital_pct) * RATE_44AD_DEFAULT
        income = round(digital_part + non_digital_part, 2)
        return {
            "presumptive_44ad": income,
            "presumptive_44ada": 0.0,
            "books_profit": 0.0,
            "net_business_income": income,
            "section_used": "44AD",
            "presumptive_eligible": True,
        }

    if biz.business_type == "presumptive_profession":
        receipts = biz.gross_professional_receipts
        limit = RECEIPTS_LIMIT_44ADA_ENHANCED if _low_cash(biz) else RECEIPTS_LIMIT_44ADA
        eligible = receipts <= limit
        if not eligible:
            return {
                "presumptive_44ad": 0.0,
                "presumptive_44ada": 0.0,
                "books_profit": 0.0,
                "net_business_income": 0.0,
                "section_used": "",
                "presumptive_eligible": False,
            }
        income = round(receipts * RATE_44ADA, 2)
        return {
            "presumptive_44ad": 0.0,
            "presumptive_44ada": income,
            "books_profit": 0.0,
            "net_business_income": income,
            "section_used": "44ADA",
            "presumptive_eligible": True,
        }

    return {
        "presumptive_44ad": 0.0,
        "presumptive_44ada": 0.0,
        "books_profit": 0.0,
        "net_business_income": 0.0,
        "section_used": "",
        "presumptive_eligible": False,
    }
