"""
validations.py
==============
Named, ID-tagged compliance validators — the runtime half of the validation
catalog (docs/research/31_VALIDATION_CATALOG.md).

Contract (from doc 31 §11): **one runtime validator + one CI test per ID,
same source of truth.** Every check has a stable `{AREA}-{NNN}` ID, a severity
(B blocking / W warn / I info), the fact keys it reads, and a legal/citation
anchor. Checks are registered into `_CHECKS` via the `@check(...)` decorator so
the set is introspectable (a test asserts every catalog ID it claims is present)
and extensible to the full 180-check V1 (ITR-1) surface without code churn.

Scope of THIS slice
-------------------
- GAT — ITR-1 eligibility gates (doc 31 §2). All blocking. These determine
  whether a return is *permitted* on ITR-1; a failing gate is the reason the
  engine routes to ITR-2/3/4. Runs as an independent cross-check of routing.
- A handful of universal engine-output INVARIANTS (DED/TAX) that must hold on
  every computed return regardless of form — these catch engine regressions.

Deliberately NOT wired into orchestrator.compute_itr() / ITRResult yet: that
changes the API response contract (and the frontend types), which can't be
verified here right now. This module is standalone and pytest-covered; wiring
it into the response + export-gating is the next integration step.

Two catalog rows are intentionally unimplemented for want of a fact key in the
current input model — flagged here so they're not silently dropped:
  - GAT-013 (no VDA/crypto income): no crypto fact on CapitalGainsInput.
  - GAT-017 (business + old regime ⇒ Form 10-IEA): no Form-10-IEA fact.

KNOWN SPEC DOUBT — GAT-004: doc 31 says "house property count ≤ 2" for ITR-1.
Standard ITD guidance restricts ITR-1 to a SINGLE house property (ITR-2 for
2+). Implemented to the catalog's ≤2 threshold via HP_COUNT_MAX below, but
flagged for CA (Mrigank) sign-off — flip HP_COUNT_MAX to 1 if the stricter
reading is confirmed. This is exactly the kind of threshold doc 31 §1 says
should live as a versioned constant, not inline.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Optional

from models import (
    UserInput,
    ProfileResult,
    IncomeHeadsResult,
    DeductionsResult,
    RegimeComparisonResult,
)
from rulesets import Ruleset, DEFAULT_RULESET


# ── Reviewable thresholds (see module docstring / doc 31 §1) ──────────────
HP_COUNT_MAX = 2                 # GAT-004 — CA review: ITD guidance may be 1
ITR1_TOTAL_INCOME_CAP = 5_000_000  # GAT-002
LTCG_112A_ITR1_CAP = 125_000     # GAT-006 — matches ruleset.ltcg_112a_exemption
AGRI_INCOME_ITR1_CAP = 5_000     # GAT-016


Severity = str  # "B" | "W" | "I"


@dataclass(frozen=True)
class ValidationResult:
    id: str
    severity: Severity
    passed: bool
    message: str
    fact_keys: tuple[str, ...]
    citation: str


@dataclass
class ValidationContext:
    """Everything a validator may read. Bundled so check signatures are stable."""
    user: UserInput
    profile: ProfileResult
    income: IncomeHeadsResult
    deductions: DeductionsResult
    comparison: RegimeComparisonResult
    ruleset: Ruleset = DEFAULT_RULESET


# A check returns (passed, detail_message). It must be pure/side-effect-free.
CheckFn = Callable[[ValidationContext], "tuple[bool, str]"]


@dataclass(frozen=True)
class _CheckSpec:
    id: str
    severity: Severity
    fact_keys: tuple[str, ...]
    citation: str
    fn: CheckFn


_CHECKS: list[_CheckSpec] = []


def check(check_id: str, severity: Severity, fact_keys: list[str], citation: str):
    """Register a validator under its catalog ID."""
    def deco(fn: CheckFn) -> CheckFn:
        _CHECKS.append(
            _CheckSpec(check_id, severity, tuple(fact_keys), citation, fn)
        )
        return fn
    return deco


def _hp_count(user: UserInput) -> int:
    if user.house_properties:
        return sum(1 for p in user.house_properties if p.property_type != "none")
    return 1 if user.house_property.property_type != "none" else 0


# ─────────────────────────────────────────────────────────────────────────
#  GAT — ITR-1 eligibility gates (all blocking). doc 31 §2.
# ─────────────────────────────────────────────────────────────────────────

@check("GAT-001", "B", ["residential_status"],
       "ITR-1 instructions: only Resident (not RNOR) individuals.")
def gat_001_resident(ctx: ValidationContext) -> tuple[bool, str]:
    ok = ctx.user.residential_status == "resident"
    return ok, "" if ok else (
        f"Residential status is '{ctx.user.residential_status}'. ITR-1 is only "
        "for Resident (non-RNOR) individuals; use ITR-2."
    )


@check("GAT-002", "B", ["income.gross_total_income"],
       "ITR-1 instructions: total income must not exceed ₹50,00,000.")
def gat_002_income_cap(ctx: ValidationContext) -> tuple[bool, str]:
    gti = ctx.income.gross_total_income
    ok = gti <= ITR1_TOTAL_INCOME_CAP
    return ok, "" if ok else (
        f"Total income ₹{gti:,.0f} exceeds the ₹50,00,000 ITR-1 limit; use ITR-2."
    )


@check("GAT-003", "B", ["business.business_type"],
       "ITR-1 excludes income from business or profession.")
def gat_003_no_business(ctx: ValidationContext) -> tuple[bool, str]:
    ok = ctx.user.business.business_type == "none"
    return ok, "" if ok else (
        "Business/professional income present. ITR-1 does not permit it; "
        "use ITR-3 (books) or ITR-4 (presumptive)."
    )


@check("GAT-004", "B", ["house_properties", "house_property.property_type"],
       "ITR-1 house-property count limit (see module note — CA review).")
def gat_004_hp_count(ctx: ValidationContext) -> tuple[bool, str]:
    n = _hp_count(ctx.user)
    ok = n <= HP_COUNT_MAX
    return ok, "" if ok else (
        f"{n} house properties declared; ITR-1 allows at most {HP_COUNT_MAX}. Use ITR-2."
    )


@check("GAT-005", "B", ["capital_gains.stcg_111a", "capital_gains.stcg_other"],
       "ITR-1 excludes any short-term capital gains.")
def gat_005_no_stcg(ctx: ValidationContext) -> tuple[bool, str]:
    cg = ctx.user.capital_gains
    ok = cg.stcg_111a == 0 and cg.stcg_other == 0
    return ok, "" if ok else (
        "Short-term capital gains present. Any STCG ejects the return to ITR-2."
    )


@check("GAT-006", "B", ["capital_gains.ltcg_112a"],
       "ITR-1: LTCG u/s 112A permitted only up to ₹1,25,000.")
def gat_006_ltcg_112a_cap(ctx: ValidationContext) -> tuple[bool, str]:
    v = ctx.user.capital_gains.ltcg_112a
    ok = v <= LTCG_112A_ITR1_CAP
    return ok, "" if ok else (
        f"LTCG u/s 112A ₹{v:,.0f} exceeds ₹1,25,000; ITR-1 not permitted, use ITR-2."
    )


@check("GAT-007", "B", ["capital_gains.ltcg_other"],
       "ITR-1 excludes non-112A capital gains (property/gold/debt).")
def gat_007_no_other_cg(ctx: ValidationContext) -> tuple[bool, str]:
    ok = ctx.user.capital_gains.ltcg_other == 0
    return ok, "" if ok else (
        "Non-112A long-term capital gains (property/debt/other) present; use ITR-2."
    )


@check("GAT-008", "B",
       ["capital_gains.stcl_equity", "capital_gains.ltcl",
        "carry_forward.stcl", "carry_forward.ltcl"],
       "ITR-1 excludes returns with capital losses to set off or carry forward.")
def gat_008_no_capital_losses(ctx: ValidationContext) -> tuple[bool, str]:
    cg = ctx.user.capital_gains
    cf = ctx.user.carry_forward
    ok = cg.stcl_equity == 0 and cg.ltcl == 0 and cf.stcl == 0 and cf.ltcl == 0
    return ok, "" if ok else (
        "Capital losses to set off or carry forward present; use ITR-2."
    )


@check("GAT-009", "B", ["profile_flags.is_director"],
       "ITR-1 excludes company directors.")
def gat_009_not_director(ctx: ValidationContext) -> tuple[bool, str]:
    ok = not ctx.user.profile_flags.is_director
    return ok, "" if ok else "Company director — ITR-1 not permitted; use ITR-2."


@check("GAT-010", "B", ["profile_flags.has_unlisted_equity"],
       "ITR-1 excludes holders of unlisted equity shares.")
def gat_010_no_unlisted_equity(ctx: ValidationContext) -> tuple[bool, str]:
    ok = not ctx.user.profile_flags.has_unlisted_equity
    return ok, "" if ok else "Unlisted equity held during the year; use ITR-2."


@check("GAT-011", "B", ["profile_flags.has_foreign_assets"],
       "ITR-1 excludes foreign assets / account signing authority.")
def gat_011_no_foreign_assets(ctx: ValidationContext) -> tuple[bool, str]:
    ok = not ctx.user.profile_flags.has_foreign_assets
    return ok, "" if ok else "Foreign assets / signing authority; use ITR-2."


@check("GAT-012", "B", ["profile_flags.has_foreign_income"],
       "ITR-1 excludes treaty-relief (90/90A/91) foreign-income claims.")
def gat_012_no_foreign_income(ctx: ValidationContext) -> tuple[bool, str]:
    ok = not ctx.user.profile_flags.has_foreign_income
    return ok, "" if ok else "Foreign income / treaty relief claim; use ITR-2."


@check("GAT-014", "B", ["profile_flags.tds_deducted_194n"],
       "ITR-1 excluded where TDS u/s 194N (cash withdrawal) was deducted.")
def gat_014_no_194n(ctx: ValidationContext) -> tuple[bool, str]:
    ok = not ctx.user.profile_flags.tds_deducted_194n
    return ok, "" if ok else "TDS u/s 194N deducted; ITR-1 not permitted."


@check("GAT-015", "B", ["profile_flags.esop_tax_deferred"],
       "ITR-1 excludes deferred ESOP tax (eligible start-up).")
def gat_015_no_deferred_esop(ctx: ValidationContext) -> tuple[bool, str]:
    ok = not ctx.user.profile_flags.esop_tax_deferred
    return ok, "" if ok else "Deferred ESOP tax present; use ITR-2."


@check("GAT-016", "B", ["profile_flags.agricultural_income"],
       "ITR-1: agricultural income permitted only up to ₹5,000.")
def gat_016_agri_cap(ctx: ValidationContext) -> tuple[bool, str]:
    v = ctx.user.profile_flags.agricultural_income
    ok = v <= AGRI_INCOME_ITR1_CAP
    return ok, "" if ok else (
        f"Agricultural income ₹{v:,.0f} exceeds ₹5,000; ITR-1 not permitted, use ITR-2."
    )


# ─────────────────────────────────────────────────────────────────────────
#  Universal engine-output invariants (must hold on every return).
# ─────────────────────────────────────────────────────────────────────────

@check("DED-001", "B", ["deductions.capped_80c"],
       "80C deduction capped at ₹1,50,000 (Sec 80C).")
def ded_001_80c_cap(ctx: ValidationContext) -> tuple[bool, str]:
    v = ctx.deductions.capped_80c
    ok = v <= ctx.ruleset.cap_80c + 0.01
    return ok, "" if ok else (
        f"Allowed 80C ₹{v:,.0f} exceeds the ₹{ctx.ruleset.cap_80c:,.0f} cap — engine bug."
    )


@check("DED-004", "B", ["deductions.deduction_80ccd_1b"],
       "80CCD(1B) additional NPS capped at ₹50,000, outside the 80C cap.")
def ded_004_80ccd1b_cap(ctx: ValidationContext) -> tuple[bool, str]:
    v = ctx.deductions.deduction_80ccd_1b
    ok = v <= ctx.ruleset.cap_80ccd_1b + 0.01
    return ok, "" if ok else (
        f"80CCD(1B) ₹{v:,.0f} exceeds the ₹{ctx.ruleset.cap_80ccd_1b:,.0f} cap — engine bug."
    )


@check("DED-009", "B",
       ["deductions.total_chapter_via", "income.gross_total_income"],
       "Total Chapter VI-A deductions cannot exceed Gross Total Income (Sec 80A(2)).")
def ded_009_deductions_le_gti(ctx: ValidationContext) -> tuple[bool, str]:
    ded = ctx.deductions.total_chapter_via
    gti = ctx.income.gross_total_income
    ok = ded <= gti + 0.01
    return ok, "" if ok else (
        f"Chapter VI-A deductions ₹{ded:,.0f} exceed GTI ₹{gti:,.0f} — engine bug (Sec 80A(2))."
    )


@check("TAX-003", "B",
       ["comparison.old.rebate_87a", "comparison.old.slab_tax",
        "comparison.new.rebate_87a", "comparison.new.slab_tax"],
       "87A rebate never offsets special-rate (111A/112A) tax.")
def tax_003_rebate_not_on_special(ctx: ValidationContext) -> tuple[bool, str]:
    for r in (ctx.comparison.old, ctx.comparison.new):
        # Rebate may only reduce slab tax, never the special-rate component.
        if r.rebate_87a > r.slab_tax + 0.01:
            return False, (
                f"{r.regime} regime: 87A rebate ₹{r.rebate_87a:,.0f} exceeds slab tax "
                f"₹{r.slab_tax:,.0f} — it would wrongly offset 111A/112A tax."
            )
    return True, ""


# ─────────────────────────────────────────────────────────────────────────
#  Runner
# ─────────────────────────────────────────────────────────────────────────

def run_validations(
    ctx: ValidationContext,
    only: Optional[set[str]] = None,
) -> list[ValidationResult]:
    """
    Execute registered validators against a computed return.
    `only` optionally restricts to a set of check IDs.
    Returns one ValidationResult per executed check (passed and failed alike,
    so callers can render an audit-complete "N/N passed" report).
    """
    results: list[ValidationResult] = []
    for spec in _CHECKS:
        if only is not None and spec.id not in only:
            continue
        passed, message = spec.fn(ctx)
        results.append(
            ValidationResult(
                id=spec.id,
                severity=spec.severity,
                passed=passed,
                message=message,
                fact_keys=spec.fact_keys,
                citation=spec.citation,
            )
        )
    return results


def registered_check_ids() -> list[str]:
    """All catalog IDs currently implemented (used by the coverage test)."""
    return [spec.id for spec in _CHECKS]


def failing(results: list[ValidationResult]) -> list[ValidationResult]:
    return [r for r in results if not r.passed]


def blocking_failures(results: list[ValidationResult]) -> list[ValidationResult]:
    """Failed checks that must prevent export (severity B)."""
    return [r for r in results if not r.passed and r.severity == "B"]
