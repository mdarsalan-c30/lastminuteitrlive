import type { DraftState } from "@/lib/store/draft";
import type { ReviewTab } from "@/lib/filing/routes";

export type SectionNavStatus = "complete" | "partial" | "missing";

export type IncomeSectionId =
  | "salary"
  | "house"
  | "other"
  | "deductions"
  | "regime";

const STATUS_DOT_CLASS: Record<SectionNavStatus, string> = {
  complete: "bg-emerald-500",
  partial: "bg-amber-400",
  missing: "bg-slate-300",
};

export function statusDotClass(status: SectionNavStatus): string {
  return STATUS_DOT_CLASS[status];
}

export function getIncomeSectionStatuses(
  draft: Pick<
    DraftState,
    | "income"
    | "houseProperty"
    | "deductions"
    | "regime"
    | "incomeChips"
    | "connectedConnectors"
    | "mismatchResolved"
  >
): Record<IncomeSectionId, SectionNavStatus> {
  const hasSalary =
    draft.income.grossSalary > 0 ||
    draft.connectedConnectors.includes("form16");
  const salary: SectionNavStatus = hasSalary
    ? draft.income.tds > 0
      ? "complete"
      : "partial"
    : "missing";

  const hp = draft.houseProperty;
  let house: SectionNavStatus = "missing";
  if (hp.propertyType !== "none") {
    house =
      hp.propertyType === "self_occupied" || hp.annualRent > 0
        ? "complete"
        : "partial";
  } else if (draft.incomeChips.includes("house_property")) {
    house = "partial";
  }

  const hasOther =
    draft.income.fdInterest > 0 ||
    draft.incomeChips.includes("fd_interest") ||
    draft.incomeChips.includes("bank_interest");
  const other: SectionNavStatus = hasOther ? "complete" : "partial";

  const hasDeductions =
    draft.deductions.section80C > 0 ||
    draft.deductions.section80D > 0 ||
    draft.deductions.npsExtra > 0;
  const deductions: SectionNavStatus =
    draft.regime === "new"
      ? "complete"
      : hasDeductions
        ? "complete"
        : draft.regime === "old"
          ? "partial"
          : "missing";

  const regime: SectionNavStatus = draft.regime
    ? draft.mismatchResolved || draft.regime === "new"
      ? "complete"
      : "partial"
    : "missing";

  return { salary, house, other, deductions, regime };
}

/**
 * Status dots for the /file/review reconcile tabs. Derived from the same draft
 * signals as the income sections so the dashboard stays consistent with the
 * left nav.
 */
export function getReviewTabStatuses(
  draft: Pick<
    DraftState,
    | "income"
    | "houseProperty"
    | "deductions"
    | "regime"
    | "incomeChips"
    | "connectedConnectors"
    | "mismatchResolved"
  >
): Record<ReviewTab, SectionNavStatus> {
  const sections = getIncomeSectionStatuses(draft);

  const hasForm16 = draft.connectedConnectors.includes("form16");
  const hasAis = draft.connectedConnectors.includes("ais");
  const importStatus: SectionNavStatus = hasForm16
    ? hasAis
      ? "complete"
      : "partial"
    : "missing";

  // Income tab rolls up salary, house, and other-sources sections.
  const incomeParts = [sections.salary, sections.house, sections.other];
  const income: SectionNavStatus = incomeParts.includes("missing")
    ? incomeParts.every((s) => s === "missing")
      ? "missing"
      : "partial"
    : incomeParts.includes("partial")
      ? "partial"
      : "complete";

  const taxes: SectionNavStatus = draft.regime
    ? draft.income.tds > 0 || draft.income.advanceTax > 0
      ? "complete"
      : "partial"
    : "missing";

  const summary: SectionNavStatus =
    draft.regime && (draft.mismatchResolved || draft.regime === "new")
      ? "complete"
      : draft.regime
        ? "partial"
        : "missing";

  return {
    import: importStatus,
    income,
    deductions: sections.deductions,
    taxes,
    summary,
  };
}
