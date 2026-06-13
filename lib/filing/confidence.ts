import { companionStepCountForForm } from "@/lib/filing/portalStepCounts";
import type { ConfidenceResult } from "@/lib/engine/types";
import type { DraftState } from "@/lib/store/draft";

export { companionStepCountForForm };

/** Document weights — mirrors engine/confidence.py */
export const DOC_WEIGHTS: Record<string, number> = {
  has_form16: 35,
  has_ais: 20,
  has_form26as: 20,
  has_bank_interest_cert: 10,
  has_home_loan_cert: 10,
  has_capital_gains_statement: 5,
};

export const DOC_DISPLAY_NAMES: Record<string, string> = {
  has_form16: "Form 16 (Part A + B)",
  has_ais: "Annual Information Statement (AIS)",
  has_form26as: "Form 26AS",
  has_bank_interest_cert: "Bank interest certificate",
  has_home_loan_cert: "Home loan interest certificate",
  has_capital_gains_statement: "Capital gains / broker statement",
};

/** Map engine missing-document labels → connector upload keys */
export const MISSING_DOC_UPLOAD_KEY: Record<string, string> = {
  "Form 16 (Part A + B)": "form16",
  "Annual Information Statement (AIS)": "ais",
  "Form 26AS": "form26as",
  "Bank interest certificate": "bank_interest",
  "Home loan interest certificate": "home_loan",
  "Capital gains / broker statement": "cams",
};

export function uploadKeyForMissingDoc(label: string): string | undefined {
  return MISSING_DOC_UPLOAD_KEY[label];
}

/** Fallback when compute API is unavailable — mirrors engine estimate/exact rules */
export function fallbackConfidenceFromDraft(
  draft: Pick<DraftState, "filingMode" | "mismatchResolved" | "incomeChips">
): ConfidenceResult {
  const isEstimate = draft.filingMode === "estimate";
  const hasInterest =
    draft.incomeChips.includes("fd_interest") ||
    draft.incomeChips.includes("bank_interest");
  const hasHomeLoan = draft.incomeChips.includes("home_loan");
  const hasCg = draft.incomeChips.includes("capital_gains");

  const relevant: string[] = ["has_form16", "has_ais", "has_form26as"];
  if (hasInterest) relevant.push("has_bank_interest_cert");
  if (hasHomeLoan) relevant.push("has_home_loan_cert");
  if (hasCg) relevant.push("has_capital_gains_statement");

  const present = new Set(["has_form16"]);
  const missing = relevant
    .filter((k) => !present.has(k))
    .map((k) => DOC_DISPLAY_NAMES[k] ?? k);

  const totalWeight = relevant.reduce((s, k) => s + (DOC_WEIGHTS[k] ?? 0), 0);
  const earnedWeight = relevant
    .filter((k) => present.has(k))
    .reduce((s, k) => s + (DOC_WEIGHTS[k] ?? 0), 0);
  const completeness =
    totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 1000) / 10 : 0;

  const alwaysMissing = ["has_ais", "has_form26as"].filter((k) => !present.has(k));
  const filingReady =
    !isEstimate &&
    alwaysMissing.length === 0 &&
    missing.length === 0 &&
    draft.mismatchResolved;

  return {
    completeness_score: isEstimate ? Math.min(completeness, 72) : completeness,
    filing_ready: filingReady,
    missing_documents: isEstimate
      ? ["Annual Information Statement (AIS)", "Form 26AS"]
      : missing,
    ca_escalation_recommended: false,
    ca_escalation_reasons: [],
    is_estimate_mode: isEstimate,
  };
}

export function scoreTone(
  confidence: ConfidenceResult
): "green" | "amber" | "red" {
  if (confidence.filing_ready && confidence.completeness_score >= 90) {
    return "green";
  }
  if (
    confidence.is_estimate_mode ||
    confidence.completeness_score < 70
  ) {
    return "red";
  }
  return "amber";
}
