#!/usr/bin/env python3
"""Generate data/portal_steps.json from ITR_FORM_MAP field definitions."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENGINE = ROOT.parent / "itr-filing-wireframes" / "sources" / "engine"
import sys

sys.path.insert(0, str(ENGINE))
from plain_english import explain, label  # noqa: E402


def step(
    n: int,
    portal_page: str,
    field_label: str,
    action: str,
    engine_field: str | None = None,
    gov_section: str = "",
    proof: list[str] | None = None,
    plain: str | None = None,
) -> dict:
    pe = plain or (explain(gov_section) if gov_section else "")
    return {
        "step": n,
        "portalPage": portal_page,
        "fieldLabel": field_label,
        "action": action,
        "engineField": engine_field,
        "plainEnglish": pe,
        "proofRequired": proof or [],
        "govSection": gov_section,
    }


def itr1_steps() -> list[dict]:
    s: list[dict] = []
    n = 1

    nav = [
        ("Login", "User ID & password", "Sign in at incometax.gov.in with your PAN as user ID.", None, ""),
        ("Dashboard", "e-File menu", "Click e-File in the top navigation bar.", None, ""),
        ("e-File", "Income Tax Return", "Select Income Tax Return from the e-File submenu.", None, ""),
        ("ITR filing", "Assessment Year", "Choose AY 2026-27 (FY 2025-26).", None, ""),
        ("ITR filing", "Filing mode", "Select Prepare and submit online.", None, ""),
        ("ITR filing", "Status", "Choose Individual as taxpayer status.", None, ""),
        ("ITR filing", "ITR form", "Select ITR-1 (SAHAJ).", "profile.itr_form", "itr_form"),
        ("ITR filing", "Reason for filing", "Pick the applicable reason (e.g. taxable income exceeds basic exemption).", None, ""),
    ]
    for page, fld, act, eng, gov in nav:
        s.append(step(n, page, fld, act, eng, gov))
        n += 1

    personal = [
        ("Personal info", "PAN", "Verify PAN matches your card — pre-filled from account.", None, "A1"),
        ("Personal info", "Date of birth", "Confirm DOB — affects senior-citizen slabs.", None, "A4"),
        ("Personal info", "Address", "Confirm current address matches Aadhaar.", None, ""),
        ("Bank details", "Refund bank account", "Select or add bank account for refund credit.", None, ""),
        ("Tax regime", "Opt out of new regime", "Select based on our regime recommendation.", "regime_comparison.recommended_regime", "regime_old"),
    ]
    for page, fld, act, eng, gov in personal:
        s.append(step(n, page, fld, act, eng, gov, proof=["PAN card"] if fld == "PAN" else []))
        n += 1

    salary_rows = [
        ("Schedule Salary", "Gross salary u/s 17(1)", "Enter total salary from Form 16 Part-B.", "income_heads.gross_salary", "B1_ia", ["Form 16"]),
        ("Schedule Salary", "Exempt allowances u/s 10", "Enter HRA + LTA exemptions.", "income_heads.hra_exemption", "B1_ii", ["Rent receipts", "Form 16"]),
        ("Schedule Salary", "Standard deduction u/s 16(ia)", "Enter standard deduction amount.", "income_heads.standard_deduction", "B1_iva", ["Form 16"]),
        ("Schedule Salary", "Professional tax u/s 16(iii)", "Enter professional tax deducted.", "income_heads.professional_tax", "B1_ivc", ["Form 16"]),
        ("Schedule Salary", "LTA exemption", "Enter LTA exempt amount if claimed.", "income_heads.lta_exemption", "B1_ii", ["Travel bills"]),
        ("Schedule Salary", "Net salary income", "Verify computed net salary head total.", "income_heads.net_salary_income", "B1", ["Form 16"]),
    ]
    for page, fld, act, eng, gov, proof in salary_rows:
        s.append(step(n, page, fld, act, eng, gov, proof))
        n += 1

    hp_rows = [
        ("Schedule HP", "Property type", "Select self-occupied, let-out, or none.", None, "B2", []),
        ("Schedule HP", "Annual rent received", "Enter gross rent if let-out.", None, "B2", ["Rent agreement"]),
        ("Schedule HP", "Municipal taxes paid", "Enter municipal tax paid on property.", None, "B2", []),
        ("Schedule HP", "Interest u/s 24(b)", "Enter home-loan interest from bank certificate.", "income_heads.interest_on_loan_24b", "B2_1h", ["Home loan interest certificate"]),
        ("Schedule HP", "Net house property income", "Verify net HP income (can be loss).", "income_heads.net_house_property_income", "B2", ["Home loan interest certificate"]),
    ]
    for page, fld, act, eng, gov, proof in hp_rows:
        s.append(step(n, page, fld, act, eng, gov, proof))
        n += 1

    other_rows = [
        ("Schedule OS", "FD / term deposit interest", "Enter total FD interest (match AIS/26AS).", "income_heads.fd_interest", "B3", ["Bank interest certificate", "AIS"]),
        ("Schedule OS", "Savings account interest", "Enter savings interest — gross before 80TTA.", "income_heads.savings_interest_gross", "B3", ["Bank statement"]),
        ("Schedule OS", "Dividend income", "Enter dividend income from shares/MFs.", "income_heads.dividend_income", "B3", ["Broker statement", "AIS"]),
        ("Schedule OS", "Total other sources", "Verify total other-income head.", "income_heads.total_other_income", "B3", ["AIS"]),
    ]
    for page, fld, act, eng, gov, proof in other_rows:
        s.append(step(n, page, fld, act, eng, gov, proof))
        n += 1

    s.append(step(n, "Part B — Total", "Gross total income", "Verify GTI before deductions.", "income_heads.gross_total_income", "B4"))
    n += 1

    ded_rows = [
        ("Schedule VI-A", "Section 80C", "Enter EPF+PPF+ELSS+LIC+principal — cap ₹1.5L.", "deductions.capped_80c", "80C", ["Investment proofs", "Form 16"]),
        ("Schedule VI-A", "Section 80CCD(1B)", "Enter additional NPS contribution.", "deductions.deduction_80ccd_1b", "80CCD_1B", ["NPS statement"]),
        ("Schedule VI-A", "Section 80CCD(2)", "Enter employer NPS — allowed in both regimes.", "deductions.deduction_80ccd_2", "80CCD_2", ["Form 16"]),
        ("Schedule VI-A", "Section 80D", "Enter health insurance premium.", "deductions.deduction_80d", "80D", ["Premium receipts"]),
        ("Schedule VI-A", "Section 80TTA / 80TTB", "Enter savings-interest deduction.", "deductions.deduction_80tta_ttb", "80TTA", ["Bank statement"]),
        ("Schedule VI-A", "Section 80U", "Enter disability deduction if applicable.", "deductions.deduction_80u", "80U", ["Disability certificate"]),
        ("Schedule VI-A", "Total Chapter VI-A", "Verify total deductions (old regime).", "deductions.total_chapter_via", "C1", []),
        ("Tax computation", "Total income (taxable)", "Verify taxable income after deductions.", None, "C2", []),
    ]
    for page, fld, act, eng, gov, proof in ded_rows:
        s.append(step(n, page, fld, act, eng, gov, proof))
        n += 1

    regime_field = "regime_comparison.old"  # API merges recommended regime slab
    tax_rows = [
        ("Part D — Tax", "Tax on total income", "Verify slab + special-rate tax.", None, "D1"),
        ("Part D — Tax", "Rebate u/s 87A", "Verify rebate amount.", None, "D2"),
        ("Part D — Tax", "Health & education cess", "Verify 4% cess.", None, "D4"),
        ("Part D — Tax", "Total taxes paid", "Enter TDS + advance + self-assessment.", None, "D12", ["Form 16", "Form 26AS"]),
        ("Part D — Tax", "Tax payable", "Verify amount due if positive.", "regime_comparison.recommended_regime_net_payable", "D13"),
        ("Part D — Tax", "Refund", "Verify refund if TDS exceeds liability.", "regime_comparison.recommended_regime_net_payable", "D14"),
    ]
    for row in tax_rows:
        page, fld, act, eng, gov = row[:5]
        proof = row[5] if len(row) > 5 else []
        s.append(step(n, page, fld, act, eng or regime_field, gov, proof))
        n += 1

    tds_rows = [
        ("Schedule TDS", "TDS on salary", "Match Form 16 Part-A TDS with 26AS.", "taxes_paid.tds_salary", "Schedule_TDS", ["Form 16", "Form 26AS"]),
        ("Schedule TDS", "TDS on other income", "Enter FD/dividend TDS from 26AS.", "taxes_paid.tds_other", "Schedule_TDS", ["Form 26AS"]),
        ("Schedule IT", "Advance / self-assessment tax", "Enter challan payments if any.", "taxes_paid.advance_tax_paid", "Schedule_IT", ["Challan receipt"]),
    ]
    for page, fld, act, eng, gov, proof in tds_rows:
        s.append(step(n, page, fld, act, eng, gov, proof))
        n += 1

    final = [
        ("Preview", "Return preview", "Download JSON/PDF preview and compare every head with our values.", None, ""),
        ("Validate", "Validate return", "Click Validate — fix any portal errors before submit.", None, ""),
        ("Submit", "Submit return", "Submit only after all mismatches resolved in LastMinute ITR.", None, ""),
        ("E-verify", "E-verification", "Complete e-verify within 30 days via Aadhaar OTP or net banking.", None, ""),
    ]
    for page, fld, act, eng, gov in final:
        s.append(step(n, page, fld, act, eng, gov))
        n += 1

    return s


def itr4_steps() -> list[dict]:
    base = [st for st in itr1_steps() if st["portalPage"] != "ITR filing" or st["fieldLabel"] != "ITR form"]
    # Replace ITR-1 selection step
    for st in base:
        if st["fieldLabel"] == "ITR form":
            st["action"] = "Select ITR-4 (SUGAM)."
            st["engineField"] = "profile.itr_form"
            st["govSection"] = "itr_form"
            st["plainEnglish"] = "Presumptive business/profession form for turnover ≤ ₹2Cr / receipts ≤ ₹50L."

    n = max(st["step"] for st in base) + 1
    bp = [
        ("Schedule BP", "Nature of business", "Select business or profession type.", None, "Schedule_BP"),
        ("Schedule BP", "Turnover / gross receipts", "Enter total turnover or professional receipts.", "business.turnover", "Schedule_BP", ["Bank statements"]),
        ("Schedule BP", "Digital receipts %", "Enter share of digital receipts for 6% rate.", "business.digital_turnover_pct", "E2_44AD"),
        ("Schedule BP", "Presumptive income u/s 44AD", "Enter 8%/6% of turnover — verify eligibility.", "business_income.presumptive_44ad", "E2_44AD", ["Bank statements"]),
        ("Schedule BP", "Presumptive income u/s 44ADA", "Enter 50% of professional receipts.", "business_income.presumptive_44ada", "E3_44ADA", ["Receipts summary"]),
        ("Schedule BP", "Cash receipts check", "Confirm cash receipts ≤ 5% — else presumptive not allowed.", "business.cash_receipts_pct", "Schedule_BP"),
        ("Schedule BP", "Net business income", "Verify net business head total.", "business_income.net_business_income", "Schedule_BP"),
    ]
    insert_at = next(i for i, st in enumerate(base) if st["fieldLabel"] == "Total other sources") + 1
    extra = []
    for page, fld, act, eng, gov, *rest in bp:
        proof = rest[0] if rest else []
        extra.append(step(n, page, fld, act, eng, gov, proof))
        n += 1
    return base[:insert_at] + extra + base[insert_at:]


def itr2_steps() -> list[dict]:
    base = [dict(st) for st in itr1_steps()]
    for st in base:
        if st["fieldLabel"] == "ITR form":
            st["action"] = "Select ITR-2."
            st["plainEnglish"] = "For capital gains, foreign income, director status, or income above ₹50L."

    n = max(st["step"] for st in base) + 1
    insert_at = next(i for i, st in enumerate(base) if st["fieldLabel"] == "Total other sources") + 1
    cg = [
        ("Schedule CG", "STCG u/s 111A", "Enter listed equity STCG.", "income_heads.stcg_111a_net", "Schedule_CG", ["Capital gains statement"]),
        ("Schedule CG", "LTCG u/s 112A", "Enter listed equity LTCG after ₹1.25L exemption.", "income_heads.ltcg_112a_net", "Schedule_CG", ["Capital gains statement"]),
        ("Schedule CG", "Other capital gains", "Enter other CG at slab/special rates.", "income_heads.ltcg_other_net", "Schedule_CG", ["Capital gains statement"]),
    ]
    extra = []
    for page, fld, act, eng, gov, *rest in cg:
        proof = rest[0] if rest else []
        extra.append(step(n, page, fld, act, eng, gov, proof))
        n += 1
    return base[:insert_at] + extra + base[insert_at:]


def itr3_steps() -> list[dict]:
    base = [dict(st) for st in itr1_steps()]
    for st in base:
        if st["fieldLabel"] == "ITR form":
            st["action"] = "Select ITR-3."
            st["plainEnglish"] = "For business/profession with regular books of account."

    n = max(st["step"] for st in base) + 1
    insert_at = next(i for i, st in enumerate(base) if st["fieldLabel"] == "Total other sources") + 1
    biz = [
        ("Schedule BP", "Gross receipts (books)", "Enter actual revenue from P&L.", "business.actual_gross_receipts", "Schedule_BP", ["P&L statement"]),
        ("Schedule BP", "Total expenses", "Enter allowable business expenses.", "business.actual_expenses", "Schedule_BP", ["P&L statement"]),
        ("Schedule BP", "Net profit from business", "Verify books profit.", "business_income.books_profit", "Schedule_BP", ["P&L statement"]),
        ("Schedule BP", "Net business income", "Verify net business head.", "business_income.net_business_income", "Schedule_BP"),
        ("Schedule CG", "STCG u/s 111A", "Enter listed equity STCG.", "income_heads.stcg_111a_net", "Schedule_CG", ["Capital gains statement"]),
        ("Schedule CG", "LTCG u/s 112A", "Enter listed equity LTCG after ₹1.25L exemption.", "income_heads.ltcg_112a_net", "Schedule_CG", ["Capital gains statement"]),
        ("Schedule CG", "Other capital gains", "Enter other CG at slab/special rates.", "income_heads.ltcg_other_net", "Schedule_CG", ["Capital gains statement"]),
    ]
    extra = []
    for page, fld, act, eng, gov, *rest in biz:
        proof = rest[0] if rest else []
        extra.append(step(n, page, fld, act, eng, gov, proof))
        n += 1
    return base[:insert_at] + extra + base[insert_at:]


def main() -> None:
    data = {
        "ITR-1": itr1_steps(),
        "ITR-2": itr2_steps(),
        "ITR-3": itr3_steps(),
        "ITR-4": itr4_steps(),
    }
    out = ROOT / "data" / "portal_steps.json"
    out.write_text(json.dumps(data, indent=2), encoding="utf-8")
    for form, steps in data.items():
        print(f"{form}: {len(steps)} steps")


if __name__ == "__main__":
    main()
