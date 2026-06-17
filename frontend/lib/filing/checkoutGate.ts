import type { ConfidenceResult } from "@/lib/engine/types";

export interface CheckoutGateInput {
  mismatchResolved: boolean;
  mismatchProceedWithExplanation: boolean;
  confidence: ConfidenceResult;
  engineUnavailable: boolean;
  loading: boolean;
}

export interface CheckoutGateResult {
  canCheckout: boolean;
  completenessScore: number;
  blockingHref: string;
  blockingLabel: string;
  engineOverride: boolean;
}

export function resolveCheckoutGate(input: CheckoutGateInput): CheckoutGateResult {
  const {
    mismatchResolved,
    mismatchProceedWithExplanation,
    confidence,
    engineUnavailable,
    loading,
  } = input;

  const mismatchOk = mismatchResolved || mismatchProceedWithExplanation;
  const engineOverride = !loading && engineUnavailable;

  if (!mismatchOk) {
    return {
      canCheckout: false,
      completenessScore: confidence.completeness_score,
      blockingHref: "/file/import/mismatch",
      blockingLabel: "Resolve salary mismatches with AIS",
      engineOverride: false,
    };
  }

  if (confidence.filing_ready) {
    return {
      canCheckout: true,
      completenessScore: confidence.completeness_score,
      blockingHref: "",
      blockingLabel: "",
      engineOverride: false,
    };
  }

  if (engineOverride) {
    return {
      canCheckout: false,
      completenessScore: confidence.completeness_score,
      blockingHref: "/file/regime",
      blockingLabel: "Tax calculation unavailable — retry before checkout",
      engineOverride: true,
    };
  }

  if (confidence.missing_documents.length > 0) {
    return {
      canCheckout: false,
      completenessScore: confidence.completeness_score,
      blockingHref: "/file/import/documents",
      blockingLabel: `Upload ${confidence.missing_documents[0]}`,
      engineOverride: false,
    };
  }

  return {
    canCheckout: false,
    completenessScore: confidence.completeness_score,
    blockingHref: "/file/review/risk#final-check",
    blockingLabel: "Complete the pre-submit checklist",
    engineOverride: false,
  };
}
