"""
carry_forward.py
================
Brought-forward loss set-off (Schedule BFLA) — Sec 70–74, 32(2), 80.

Order of operations (statutory)
-------------------------------
Current-year intra-head set-off happens first (capital_gains.py,
house_property.py). THEN brought-forward losses apply:

  b/f HP loss        → only against current-year HP income (positive part)
  b/f STCL           → against any remaining capital gain (STCG then LTCG,
                       taxpayer-beneficial order: slab/20% buckets before
                       the 12.5% 112A bucket)
  b/f LTCL           → against remaining LTCG only (same beneficial order)
  b/f business loss  → against business income only (never salary, Sec 71(2A))
  unabsorbed dep     → against business income first; V1 does not spread the
                       remainder across other heads (CA review flag instead)

Sec 80 gate: STCL / LTCL / business loss are claimable only if the loss-year
return was filed by the due date. HP loss and unabsorbed depreciation are
exempt from this condition.
"""

from __future__ import annotations

from models import BroughtForwardLossesInput


def apply_brought_forward(
    cf: BroughtForwardLossesInput,
    hp_income: float,
    cg: dict,                    # output of capital_gains.compute_capital_gains
    business_income: float,
    dep_against_business_allowed: bool = True,
) -> dict:
    """
    Returns adjusted head values plus a full carry-out ledger.

    dep_against_business_allowed=False for presumptive (44AD/44ADA) income —
    depreciation is deemed already allowed there, so unabsorbed depreciation
    cannot be set off against it (it still carries forward).

    Output keys:
      hp_income, business_income        : adjusted head values
      cg                                : adjusted capital-gains dict (copy)
      bf_set_off_total                  : total b/f loss consumed this year
      carried_out                       : losses going to next year
      lapsed_sec80                      : losses denied by the Sec 80 gate
      notes                             : machine-readable events for risk/UI
    """
    notes: list[str] = []
    timely = cf.prior_return_filed_on_time

    usable_stcl = max(0.0, cf.stcl) if timely else 0.0
    usable_ltcl = max(0.0, cf.ltcl) if timely else 0.0
    usable_bloss = max(0.0, cf.business_loss) if timely else 0.0
    lapsed = 0.0
    if not timely:
        lapsed = max(0.0, cf.stcl) + max(0.0, cf.ltcl) + max(0.0, cf.business_loss)
        if lapsed > 0:
            notes.append("bf_losses_denied_sec80")

    set_off_total = 0.0

    # ── 1. b/f HP loss: intra-head only ──
    bf_hp = max(0.0, cf.hp_loss)
    hp_positive = max(0.0, hp_income)
    hp_absorb = min(bf_hp, hp_positive)
    hp_income_out = round(hp_income - hp_absorb, 2)
    hp_cf_out = round(bf_hp - hp_absorb, 2)
    set_off_total += hp_absorb
    if hp_absorb > 0:
        notes.append("bf_hp_loss_set_off")

    # ── 2. b/f capital losses (beneficial ordering) ──
    out = dict(cg)
    stcg_other = out.get("stcg_other_slab", 0.0)   # slab rate (highest)
    stcg_111a = out.get("stcg_111a_net", 0.0)      # 20%
    ltcg_other = out.get("ltcg_other_net", 0.0)    # 20%
    ltcg_112a = out.get("ltcg_112a_net", 0.0)      # 12.5% + 1.25L exemption

    def absorb(loss: float, amount: float) -> tuple[float, float]:
        used = min(loss, amount)
        return loss - used, amount - used

    stcl = usable_stcl
    stcl, stcg_other = absorb(stcl, stcg_other)
    stcl, stcg_111a = absorb(stcl, stcg_111a)
    stcl, ltcg_other = absorb(stcl, ltcg_other)
    stcl, ltcg_112a = absorb(stcl, ltcg_112a)

    ltcl = usable_ltcl
    ltcl, ltcg_other = absorb(ltcl, ltcg_other)
    ltcl, ltcg_112a = absorb(ltcl, ltcg_112a)

    cg_absorbed = (usable_stcl - stcl) + (usable_ltcl - ltcl)
    set_off_total += cg_absorbed
    if cg_absorbed > 0:
        notes.append("bf_capital_loss_set_off")

    out["stcg_other_slab"] = round(stcg_other, 2)
    out["stcg_111a_net"] = round(stcg_111a, 2)
    out["ltcg_other_net"] = round(ltcg_other, 2)
    out["ltcg_112a_net"] = round(ltcg_112a, 2)

    # ── 3. b/f business loss: against business income only ──
    biz_absorb = min(usable_bloss, max(0.0, business_income))
    business_out = round(business_income - biz_absorb, 2)
    bloss_cf_out = round(usable_bloss - biz_absorb, 2)
    set_off_total += biz_absorb
    if biz_absorb > 0:
        notes.append("bf_business_loss_set_off")

    # ── 4. Unabsorbed depreciation: business income first, rest carried ──
    dep = max(0.0, cf.unabsorbed_depreciation)
    dep_absorb = min(dep, business_out) if dep_against_business_allowed else 0.0
    business_out = round(business_out - dep_absorb, 2)
    dep_cf_out = round(dep - dep_absorb, 2)
    set_off_total += dep_absorb
    if dep_absorb > 0:
        notes.append("unabsorbed_dep_set_off")
    if dep_cf_out > 0:
        notes.append("unabsorbed_dep_remainder_ca_review")

    return {
        "hp_income": hp_income_out,
        "business_income": business_out,
        "cg": out,
        "bf_set_off_total": round(set_off_total, 2),
        "carried_out": {
            "hp": hp_cf_out,
            "stcl": round(stcl, 2),
            "ltcl": round(ltcl, 2),
            "business": bloss_cf_out,
            "unabsorbed_depreciation": dep_cf_out,
        },
        "lapsed_sec80": round(lapsed, 2),
        "notes": notes,
    }
