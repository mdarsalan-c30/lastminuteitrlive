/** Salaried fast path: Form 16 CTA / ?source=form16 skips welcome/sign-in, not eligibility. */

export const FORM16_FAST_PATH_SOURCE = "form16";

export function isForm16FastPath(
  searchParams: Pick<URLSearchParams, "get">
): boolean {
  return searchParams.get("source") === FORM16_FAST_PATH_SOURCE;
}

export interface SalariedFastPathSetters {
  setName: (name: string) => void;
  setFilingMode: (mode: "estimate" | "exact") => void;
  setFilingPath: (path: "simple" | "cabrain") => void;
  ensureIncomeChip: (chip: string) => void;
  setItrConfirmed: (confirmed: boolean) => void;
}

/** Defaults for Form 16 import-first entry — ITR form resolved on eligibility screen. */
export function applySalariedFastPathDefaults(
  setters: SalariedFastPathSetters,
  name?: string | null
): void {
  if (name?.trim()) {
    setters.setName(name.trim());
  }
  setters.setFilingMode("estimate");
  setters.setFilingPath("simple");
  setters.ensureIncomeChip("salary");
  setters.setItrConfirmed(false);
}

export function buildDocumentsFastPathUrl(name?: string | null): string {
  const params = new URLSearchParams({ source: FORM16_FAST_PATH_SOURCE });
  if (name?.trim()) {
    params.set("name", name.trim());
  }
  return `/file/import/documents?${params.toString()}`;
}

export function buildEligibilityForm16Url(
  step: "complete-profile" | "additional-income" = "additional-income"
): string {
  const params = new URLSearchParams({
    source: FORM16_FAST_PATH_SOURCE,
    step,
  });
  return `/file/start?${params.toString()}`;
}

/** @deprecated EXTRACT is inline on COLLECT — use documents URL. */
export function buildParsingForm16Url(): string {
  return `/file/import/documents?source=${FORM16_FAST_PATH_SOURCE}`;
}

/** Tabs on the /file/review reconcile dashboard, in display order. */
export const REVIEW_TABS = [
  "import",
  "income",
  "deductions",
  "taxes",
  "summary",
] as const;

export type ReviewTab = (typeof REVIEW_TABS)[number];

export function parseReviewTab(value: string | null | undefined): ReviewTab {
  return (REVIEW_TABS as readonly string[]).includes(value ?? "")
    ? (value as ReviewTab)
    : "import";
}

export function buildReviewUrl(tab: ReviewTab): string {
  return `/file/review?tab=${tab}`;
}
