"""Versioned ITR-3 compliance primitives for AY 2026-27.

This module deliberately sits beside the shared income-head calculators.  It owns
ITR-3-only classification and schedule arithmetic without changing ITR-1/ITR-2.
Amounts are rupees and percentages are decimal ratios (5% == 0.05).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal


ITR3_SCHEMA_ID = "ITR-3_2026_Main_V1.1"
ITR3_VALIDATION_RULES_VERSION = "1.0"
ITR3_RULESET_ID = "ITR3_AY2026_27_V1"

BUSINESS_AUDIT_LIMIT = 1_00_00_000.0
BUSINESS_AUDIT_ENHANCED_LIMIT = 10_00_00_000.0
PROFESSION_AUDIT_LIMIT = 50_00_000.0
CASH_AUDIT_RATIO_LIMIT = 0.05
BALANCE_TOLERANCE = 1.0

ActivityType = Literal["business", "profession"]
AuditStatus = Literal["required", "not_required", "review_required"]
ValidationCategory = Literal["A", "B", "D"]


@dataclass(frozen=True)
class ITR3ArtifactRegistry:
    assessment_year: str = "2026-27"
    ruleset_id: str = ITR3_RULESET_ID
    json_schema_id: str = ITR3_SCHEMA_ID
    validation_rules_version: str = ITR3_VALIDATION_RULES_VERSION


AY2026_27_ARTIFACTS = ITR3ArtifactRegistry()


@dataclass(frozen=True)
class AuditFacts:
    activity_type: ActivityType
    gross_receipts_or_turnover: float
    cash_receipts_ratio: float | None = None
    cash_payments_ratio: float | None = None


@dataclass(frozen=True)
class AuditDecision:
    status: AuditStatus
    threshold: float
    reason_code: str
    reason: str
    enhanced_limit_applied: bool = False

    @property
    def audit_applicable(self) -> bool | None:
        if self.status == "review_required":
            return None
        return self.status == "required"


def _valid_ratio(value: float | None) -> bool:
    return value is not None and 0.0 <= value <= 1.0


def classify_tax_audit(facts: AuditFacts) -> AuditDecision:
    """Classify the ordinary section 44AB turnover/receipt thresholds.

    The enhanced business threshold is available only when *both* cash ratios
    are known and do not exceed 5%.  Unknown evidence above the ordinary limit
    is routed to review instead of silently granting the ₹10 crore threshold.
    Other audit triggers (such as lower presumptive declarations) are validated
    separately because they require filing-history facts.
    """
    gross = max(0.0, facts.gross_receipts_or_turnover)
    if facts.activity_type == "profession":
        required = gross > PROFESSION_AUDIT_LIMIT
        return AuditDecision(
            status="required" if required else "not_required",
            threshold=PROFESSION_AUDIT_LIMIT,
            reason_code=(
                "PROFESSION_RECEIPTS_ABOVE_50L"
                if required
                else "PROFESSION_RECEIPTS_WITHIN_50L"
            ),
            reason=(
                "Professional gross receipts exceed ₹50 lakh."
                if required
                else "Professional gross receipts do not exceed ₹50 lakh."
            ),
        )

    if gross <= BUSINESS_AUDIT_LIMIT:
        return AuditDecision(
            status="not_required",
            threshold=BUSINESS_AUDIT_LIMIT,
            reason_code="BUSINESS_TURNOVER_WITHIN_1CR",
            reason="Business turnover does not exceed ₹1 crore.",
        )

    ratios_known = _valid_ratio(facts.cash_receipts_ratio) and _valid_ratio(
        facts.cash_payments_ratio
    )
    if not ratios_known:
        return AuditDecision(
            status="review_required",
            threshold=BUSINESS_AUDIT_LIMIT,
            reason_code="CASH_RATIOS_REQUIRED",
            reason=(
                "Turnover exceeds ₹1 crore; both cash-receipt and cash-payment "
                "ratios are required to test the enhanced ₹10 crore threshold."
            ),
        )

    low_cash = (
        facts.cash_receipts_ratio <= CASH_AUDIT_RATIO_LIMIT
        and facts.cash_payments_ratio <= CASH_AUDIT_RATIO_LIMIT
    )
    if low_cash:
        required = gross > BUSINESS_AUDIT_ENHANCED_LIMIT
        return AuditDecision(
            status="required" if required else "not_required",
            threshold=BUSINESS_AUDIT_ENHANCED_LIMIT,
            reason_code=(
                "BUSINESS_TURNOVER_ABOVE_10CR"
                if required
                else "LOW_CASH_BUSINESS_WITHIN_10CR"
            ),
            reason=(
                "Business turnover exceeds ₹10 crore after the 5% cash tests."
                if required
                else "Both cash ratios are at most 5% and turnover does not exceed ₹10 crore."
            ),
            enhanced_limit_applied=True,
        )

    return AuditDecision(
        status="required",
        threshold=BUSINESS_AUDIT_LIMIT,
        reason_code="BUSINESS_TURNOVER_ABOVE_1CR_CASH_TEST_FAILED",
        reason="Business turnover exceeds ₹1 crore and at least one 5% cash test fails.",
    )


@dataclass(frozen=True)
class Form10IEAFacts:
    has_business_or_profession_income: bool
    requested_regime: Literal["old", "new"]
    filed_by_section_139_1_due_date: bool | None = None
    acknowledgement_number: str = ""
    previously_opted_out: bool = False
    previously_reentered_new_regime: bool = False


@dataclass(frozen=True)
class Form10IEADecision:
    required: bool
    valid: bool
    reason_code: str
    reason: str


def evaluate_form_10iea(facts: Form10IEAFacts) -> Form10IEADecision:
    """Validate the regime-choice state for a taxpayer with business income."""
    if not facts.has_business_or_profession_income or facts.requested_regime == "new":
        return Form10IEADecision(False, True, "FORM_10IEA_NOT_REQUIRED", "Form 10-IEA is not required.")
    if facts.previously_reentered_new_regime:
        return Form10IEADecision(
            True,
            False,
            "FORM_10IEA_REENTRY_EXHAUSTED",
            "Old-regime opt-out is unavailable after the one permitted re-entry was used.",
        )
    if facts.filed_by_section_139_1_due_date is not True:
        return Form10IEADecision(
            True,
            False,
            "FORM_10IEA_DUE_DATE_NOT_CONFIRMED",
            "A timely Form 10-IEA filing must be confirmed for the old regime.",
        )
    if not facts.acknowledgement_number.strip():
        return Form10IEADecision(
            True,
            False,
            "FORM_10IEA_ACK_REQUIRED",
            "Form 10-IEA acknowledgement number is required.",
        )
    return Form10IEADecision(
        True,
        True,
        "FORM_10IEA_VALID",
        "Timely Form 10-IEA acknowledgement is available.",
    )


@dataclass(frozen=True)
class ProfitAndLossFacts:
    gross_receipts: float = 0.0
    opening_stock: float = 0.0
    purchases: float = 0.0
    direct_expenses: float = 0.0
    closing_stock: float = 0.0
    other_business_income: float = 0.0
    indirect_expenses: float = 0.0
    book_depreciation: float = 0.0


def compute_profit_and_loss(facts: ProfitAndLossFacts) -> dict[str, float]:
    cost_of_goods_sold = max(
        0.0,
        facts.opening_stock + facts.purchases + facts.direct_expenses - facts.closing_stock,
    )
    gross_profit = facts.gross_receipts - cost_of_goods_sold
    net_profit = (
        gross_profit
        + facts.other_business_income
        - facts.indirect_expenses
        - facts.book_depreciation
    )
    return {
        "cost_of_goods_sold": round(cost_of_goods_sold, 2),
        "gross_profit": round(gross_profit, 2),
        "net_profit_before_tax": round(net_profit, 2),
    }


@dataclass(frozen=True)
class ScheduleBPFacts:
    net_profit_before_tax: float
    inadmissible_expenses: float = 0.0
    taxable_credits_not_in_pl: float = 0.0
    exempt_or_other_head_credits: float = 0.0
    book_depreciation: float = 0.0
    tax_depreciation: float = 0.0
    other_allowable_deductions: float = 0.0


def compute_schedule_bp(facts: ScheduleBPFacts) -> dict[str, float]:
    additions = (
        facts.inadmissible_expenses
        + facts.taxable_credits_not_in_pl
        + facts.book_depreciation
    )
    deductions = (
        facts.exempt_or_other_head_credits
        + facts.tax_depreciation
        + facts.other_allowable_deductions
    )
    income = facts.net_profit_before_tax + additions - deductions
    return {
        "additions": round(additions, 2),
        "deductions": round(deductions, 2),
        "business_income_before_setoff": round(income, 2),
    }


@dataclass(frozen=True)
class BalanceSheetFacts:
    proprietor_capital: float = 0.0
    reserves: float = 0.0
    secured_loans: float = 0.0
    unsecured_loans: float = 0.0
    current_liabilities: float = 0.0
    fixed_assets: float = 0.0
    investments: float = 0.0
    inventory: float = 0.0
    receivables: float = 0.0
    cash_and_bank: float = 0.0
    other_assets: float = 0.0


def compute_balance_sheet(facts: BalanceSheetFacts) -> dict[str, float | bool]:
    liabilities = (
        facts.proprietor_capital
        + facts.reserves
        + facts.secured_loans
        + facts.unsecured_loans
        + facts.current_liabilities
    )
    assets = (
        facts.fixed_assets
        + facts.investments
        + facts.inventory
        + facts.receivables
        + facts.cash_and_bank
        + facts.other_assets
    )
    difference = assets - liabilities
    return {
        "total_assets": round(assets, 2),
        "total_liabilities": round(liabilities, 2),
        "difference": round(difference, 2),
        "balanced": abs(difference) <= BALANCE_TOLERANCE,
    }


@dataclass(frozen=True)
class ValidationIssue:
    code: str
    category: ValidationCategory
    message: str
    path: str


@dataclass(frozen=True)
class ITR3Facts:
    audit: AuditFacts
    profit_and_loss: ProfitAndLossFacts
    schedule_bp: ScheduleBPFacts
    balance_sheet: BalanceSheetFacts
    form_10iea: Form10IEAFacts | None = None
    books_maintained: bool = True


@dataclass(frozen=True)
class ITR3Evaluation:
    artifacts: ITR3ArtifactRegistry
    audit: AuditDecision
    profit_and_loss: dict[str, float]
    schedule_bp: dict[str, float]
    balance_sheet: dict[str, float | bool]
    form_10iea: Form10IEADecision | None
    issues: tuple[ValidationIssue, ...] = field(default_factory=tuple)

    @property
    def export_ready(self) -> bool:
        return not any(issue.category == "A" for issue in self.issues)


def evaluate_itr3(facts: ITR3Facts) -> ITR3Evaluation:
    """Compute the first canonical ITR-3 schedules and cross-schedule gates."""
    audit = classify_tax_audit(facts.audit)
    profit_and_loss = compute_profit_and_loss(facts.profit_and_loss)
    schedule_bp = compute_schedule_bp(facts.schedule_bp)
    balance_sheet = compute_balance_sheet(facts.balance_sheet)
    form_10iea = evaluate_form_10iea(facts.form_10iea) if facts.form_10iea else None
    issues: list[ValidationIssue] = []

    if facts.books_maintained and not balance_sheet["balanced"]:
        issues.append(ValidationIssue(
            "ITR3_BS_NOT_BALANCED",
            "A",
            "Part A-BS assets and liabilities must balance.",
            "PARTA_BS",
        ))
    if abs(profit_and_loss["net_profit_before_tax"] - facts.schedule_bp.net_profit_before_tax) > 1.0:
        issues.append(ValidationIssue(
            "ITR3_PL_BP_MISMATCH",
            "A",
            "Schedule BP must start with the net profit reported in Part A-P&L.",
            "ScheduleBP.netProfit",
        ))
    if audit.status == "review_required":
        issues.append(ValidationIssue(
            "ITR3_AUDIT_FACTS_INCOMPLETE",
            "A",
            audit.reason,
            "PartA_GEN1.auditInfo",
        ))
    if form_10iea and not form_10iea.valid:
        issues.append(ValidationIssue(
            form_10iea.reason_code,
            "A",
            form_10iea.reason,
            "PartA_GEN1.form10IEA",
        ))

    return ITR3Evaluation(
        artifacts=AY2026_27_ARTIFACTS,
        audit=audit,
        profit_and_loss=profit_and_loss,
        schedule_bp=schedule_bp,
        balance_sheet=balance_sheet,
        form_10iea=form_10iea,
        issues=tuple(issues),
    )
