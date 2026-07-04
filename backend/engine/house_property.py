"""
house_property.py
=================
Computes income / loss from house property (Sec 22–27).

Rules implemented
-----------------
Self-Occupied Property (SOP)
  Gross Annual Value (GAV)         = 0 (deemed)
  Net Annual Value (NAV)           = 0
  Deduction u/s 24(b) interest cap = ₹2,00,000 p.a.
  Loss from SOP is set off against salary/other income (both regimes),
  BUT the ₹2L interest cap means excess interest is disallowed.
  Pre-construction interest: deductible in 5 equal instalments from
  year of completion. Caller supplies the 1/5th amount directly.

Let-Out Property
  GAV                              = annual rent received
  Municipal taxes (30% standard deduction u/s 24(a)) applied to NAV
  Deduction u/s 24(b)              = actual interest paid (no cap)
  Net income can be positive (taxable) or negative (loss)
  Loss set-off against other heads capped at ₹2,00,000 (remaining
  carried forward for 8 years).

New Regime (Budget 2023 onwards)
  Interest deduction u/s 24(b) for SOP is NOT available under the
  new regime (standard deduction replaces most deductions).
  However, let-out property income/loss computation remains the same.
  Loss from let-out property under new regime cannot be set off
  against other income (no loss set-off for house property in new regime).
"""

from __future__ import annotations
from typing import Literal

from models import HousePropertyInput

SOP_INTEREST_CAP = 200_000          # ₹2 lakh cap for self-occupied
LOSS_SETOFF_CAP = 200_000           # max set-off against other heads (let-out too)
REPAIR_DEDUCTION_RATE = 0.30        # Sec 24(a) standard deduction


def compute_house_property(
    hp: HousePropertyInput,
    regime: Literal["old", "new"],
) -> dict:
    """
    Returns dict with all house property head values.
    """
    if hp.property_type == "none":
        return _zero_hp()

    if hp.property_type == "self_occupied":
        return _compute_sop(hp, regime)

    return _compute_let_out(hp, regime)


def _zero_hp() -> dict:
    return {
        "gross_annual_value": 0.0,
        "municipal_tax": 0.0,
        "net_annual_value": 0.0,
        "repair_deduction_30pct": 0.0,
        "interest_on_loan_24b": 0.0,
        "net_house_property_income": 0.0,
        "excess_interest_disallowed": 0.0,
    }


def _compute_sop(hp: HousePropertyInput, regime: Literal["old", "new"]) -> dict:
    gav = 0.0
    municipal_tax = 0.0
    nav = 0.0
    repair = 0.0
    total_interest = hp.home_loan_interest + hp.pre_construction_interest

    if regime == "new":
        # SOP interest deduction not available in new regime
        allowed_interest = 0.0
        excess = total_interest
    else:
        allowed_interest = min(total_interest, SOP_INTEREST_CAP)
        excess = max(0.0, total_interest - SOP_INTEREST_CAP)

    net_hp_income = round(nav - repair - allowed_interest, 2)   # will be 0 or negative

    return {
        "gross_annual_value": gav,
        "municipal_tax": municipal_tax,
        "net_annual_value": nav,
        "repair_deduction_30pct": repair,
        "interest_on_loan_24b": allowed_interest,
        "net_house_property_income": net_hp_income,
        "excess_interest_disallowed": round(excess, 2),
    }


def _compute_let_out(
    hp: HousePropertyInput,
    regime: Literal["old", "new"],
    apply_head_caps: bool = True,
) -> dict:
    """
    apply_head_caps=False returns the RAW property result (loss uncapped) so
    the portfolio function can aggregate first and apply the head-level
    set-off cap once (Sec 71(3A) applies to the head, not per property).
    """
    gav = hp.annual_rent_received
    # Municipal/property taxes actually paid are deductible from GAV (Sec 23).
    municipal_tax = max(0.0, min(hp.municipal_tax, gav))
    nav = gav - municipal_tax
    repair = round(nav * REPAIR_DEDUCTION_RATE, 2)
    nav_after_repair = nav - repair

    total_interest = hp.home_loan_interest + hp.pre_construction_interest
    # No cap on interest for let-out property
    net_hp_income = round(nav_after_repair - total_interest, 2)

    # Loss set-off cap in both regimes
    excess_disallowed = 0.0
    if apply_head_caps and regime == "new" and net_hp_income < 0:
        # New regime: HP loss cannot be set off — disallow entirely
        excess_disallowed = abs(net_hp_income)
        net_hp_income = 0.0
    elif apply_head_caps and regime == "old" and net_hp_income < 0:
        # Old regime: cap set-off at ₹2L; carry forward the rest
        if abs(net_hp_income) > LOSS_SETOFF_CAP:
            excess_disallowed = abs(net_hp_income) - LOSS_SETOFF_CAP
            net_hp_income = -LOSS_SETOFF_CAP
        # else full loss allowed (within cap)

    return {
        "gross_annual_value": round(gav, 2),
        "municipal_tax": round(municipal_tax, 2),
        "net_annual_value": round(nav, 2),
        "repair_deduction_30pct": round(repair, 2),
        "interest_on_loan_24b": round(total_interest, 2),
        "net_house_property_income": round(net_hp_income, 2),
        "excess_interest_disallowed": round(excess_disallowed, 2),
    }


# ─────────────────────────────────────────────
#  Multi-property portfolio (ITR-2 / ITR-3)
# ─────────────────────────────────────────────

MAX_NIL_VALUE_SOPS = 2   # Sec 23(4): up to two self-occupied at NIL annual value


def compute_house_property_portfolio(
    properties: list[HousePropertyInput],
    regime: Literal["old", "new"],
) -> dict:
    """
    Aggregates a property portfolio into the house-property head.

    Rules
    -----
    - Up to TWO self-occupied properties get NIL annual value (Sec 23(4)).
      Their combined 24(b) interest cap is ₹2,00,000 (old regime only).
    - A third+ self-occupied is DEEMED LET-OUT on notional rent. The engine
      does not invent a notional rent — it flags `deemed_letout_pending` for
      CA review instead of guessing.
    - Let-out properties: full interest deduction, losses offset profits
      freely WITHIN the head; the ₹2L inter-head set-off cap (old regime) /
      full disallowance (new regime) applies ONCE to the head total.
    - Head loss beyond the cap is reported as `hp_loss_carried_forward`
      (8 assessment years, intra-head only).
    """
    if not properties:
        return {**_zero_hp(), "hp_loss_carried_forward": 0.0,
                "deemed_letout_pending": 0}

    sops = [p for p in properties if p.property_type == "self_occupied"]
    let_outs = [p for p in properties if p.property_type == "let_out"]

    # ── Self-occupied block (combined) ──
    nil_value_sops = sops[:MAX_NIL_VALUE_SOPS]
    deemed_pending = max(0, len(sops) - MAX_NIL_VALUE_SOPS)

    sop_interest_total = sum(
        p.home_loan_interest + p.pre_construction_interest
        for p in nil_value_sops
    )
    if regime == "new":
        sop_allowed = 0.0
        sop_excess = sop_interest_total
    else:
        sop_allowed = min(sop_interest_total, SOP_INTEREST_CAP)
        sop_excess = max(0.0, sop_interest_total - SOP_INTEREST_CAP)
    sop_income = -sop_allowed   # NIL annual value → income is 0 or negative

    # ── Let-out block (raw, uncapped per property) ──
    gav = municipal = nav = repair = lo_interest = lo_income = 0.0
    for p in let_outs:
        raw = _compute_let_out(p, regime, apply_head_caps=False)
        gav += raw["gross_annual_value"]
        municipal += raw["municipal_tax"]
        nav += raw["net_annual_value"]
        repair += raw["repair_deduction_30pct"]
        lo_interest += raw["interest_on_loan_24b"]
        lo_income += raw["net_house_property_income"]

    # ── Head aggregation + one-time set-off cap ──
    head_income = round(sop_income + lo_income, 2)
    excess_disallowed = sop_excess
    hp_loss_cf = 0.0

    if head_income < 0:
        if regime == "new":
            # 115BAC: HP loss cannot be set off against other heads
            excess_disallowed += abs(head_income)
            head_income = 0.0
        elif abs(head_income) > LOSS_SETOFF_CAP:
            hp_loss_cf = round(abs(head_income) - LOSS_SETOFF_CAP, 2)
            head_income = -LOSS_SETOFF_CAP

    return {
        "gross_annual_value": round(gav, 2),
        "municipal_tax": round(municipal, 2),
        "net_annual_value": round(nav, 2),
        "repair_deduction_30pct": round(repair, 2),
        "interest_on_loan_24b": round(sop_allowed + lo_interest, 2),
        "net_house_property_income": round(head_income, 2),
        "excess_interest_disallowed": round(excess_disallowed, 2),
        "hp_loss_carried_forward": hp_loss_cf,
        "deemed_letout_pending": deemed_pending,
    }
