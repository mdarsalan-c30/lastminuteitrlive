from itr3_engine import (
    AY2026_27_ARTIFACTS,
    AuditFacts,
    BalanceSheetFacts,
    Form10IEAFacts,
    ITR3Facts,
    ProfitAndLossFacts,
    ScheduleBPFacts,
    classify_tax_audit,
    compute_balance_sheet,
    compute_profit_and_loss,
    compute_schedule_bp,
    evaluate_form_10iea,
    evaluate_itr3,
)
from business_income import compute_business_income
from models import BusinessInput


def test_artifacts_are_pinned_to_ay_2026_27_v11_schema():
    assert AY2026_27_ARTIFACTS.assessment_year == "2026-27"
    assert AY2026_27_ARTIFACTS.json_schema_id == "ITR-3_2026_Main_V1.1"
    assert AY2026_27_ARTIFACTS.validation_rules_version == "1.0"


def test_business_audit_ordinary_threshold_boundaries():
    at_limit = classify_tax_audit(AuditFacts("business", 1_00_00_000))
    assert at_limit.status == "not_required"

    above_without_payment_evidence = classify_tax_audit(
        AuditFacts("business", 1_00_00_001, cash_receipts_ratio=0.01)
    )
    assert above_without_payment_evidence.status == "review_required"


def test_business_audit_enhanced_threshold_requires_both_cash_tests():
    within = classify_tax_audit(AuditFacts("business", 10_00_00_000, 0.05, 0.05))
    assert within.status == "not_required"
    assert within.enhanced_limit_applied is True

    above = classify_tax_audit(AuditFacts("business", 10_00_00_001, 0.05, 0.05))
    assert above.status == "required"

    failed_cash_test = classify_tax_audit(AuditFacts("business", 1_00_00_001, 0.051, 0.01))
    assert failed_cash_test.status == "required"
    assert failed_cash_test.threshold == 1_00_00_000


def test_profession_audit_uses_50_lakh_boundary():
    assert classify_tax_audit(AuditFacts("profession", 50_00_000)).status == "not_required"
    assert classify_tax_audit(AuditFacts("profession", 50_00_001)).status == "required"


def test_form_10iea_old_regime_requires_timely_acknowledgement():
    missing = evaluate_form_10iea(Form10IEAFacts(True, "old", True, ""))
    assert missing.required is True
    assert missing.valid is False
    assert missing.reason_code == "FORM_10IEA_ACK_REQUIRED"

    valid = evaluate_form_10iea(Form10IEAFacts(True, "old", True, "ACK123"))
    assert valid.valid is True

    exhausted = evaluate_form_10iea(
        Form10IEAFacts(True, "old", True, "ACK123", previously_reentered_new_regime=True)
    )
    assert exhausted.valid is False
    assert exhausted.reason_code == "FORM_10IEA_REENTRY_EXHAUSTED"


def test_schedule_arithmetic():
    pl = compute_profit_and_loss(ProfitAndLossFacts(
        gross_receipts=1_000_000,
        opening_stock=100_000,
        purchases=300_000,
        direct_expenses=50_000,
        closing_stock=150_000,
        other_business_income=20_000,
        indirect_expenses=100_000,
        book_depreciation=20_000,
    ))
    assert pl == {
        "cost_of_goods_sold": 300_000.0,
        "gross_profit": 700_000.0,
        "net_profit_before_tax": 600_000.0,
    }

    bp = compute_schedule_bp(ScheduleBPFacts(
        net_profit_before_tax=600_000,
        inadmissible_expenses=25_000,
        book_depreciation=20_000,
        tax_depreciation=30_000,
    ))
    assert bp["business_income_before_setoff"] == 615_000.0


def test_balance_sheet_and_cross_schedule_category_a_gates():
    balanced = BalanceSheetFacts(proprietor_capital=500_000, fixed_assets=400_000, cash_and_bank=100_000)
    assert compute_balance_sheet(balanced)["balanced"] is True

    evaluation = evaluate_itr3(ITR3Facts(
        audit=AuditFacts("business", 2_00_00_000, 0.01, None),
        profit_and_loss=ProfitAndLossFacts(gross_receipts=1_000_000, indirect_expenses=400_000),
        schedule_bp=ScheduleBPFacts(net_profit_before_tax=599_000),
        balance_sheet=BalanceSheetFacts(proprietor_capital=500_000, fixed_assets=400_000),
    ))
    codes = {issue.code for issue in evaluation.issues}
    assert "ITR3_BS_NOT_BALANCED" in codes
    assert "ITR3_PL_BP_MISMATCH" in codes
    assert "ITR3_AUDIT_FACTS_INCOMPLETE" in codes
    assert evaluation.export_ready is False


def test_business_income_integration_is_additive_and_fno_boundary_is_not_audit():
    result = compute_business_income(BusinessInput(
        business_type="regular_books",
        fno_turnover=10_00_00_000,
        fno_non_speculative_profit=100_000,
        cash_receipts_pct=0.05,
        cash_payments_pct=0.05,
    ))
    assert result["net_business_income"] == 100_000
    assert result["audit_status"] == "not_required"
    assert result["audit_flag_10cr"] is False
    assert result["itr3_schema_id"] == "ITR-3_2026_Main_V1.1"
