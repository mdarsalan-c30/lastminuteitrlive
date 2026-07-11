import type { ConfidenceResult } from "@/lib/engine/types";

export interface CheckoutGateInput {
  mismatchResolved: boolean;
  mismatchProceedWithExplanation: boolean;
  confidence: ConfidenceResult;
  engineUnavailable: boolean;
  loading: boolean;
  /**
   * True only when an actual salary mismatch exists (AIS imported and figures
   * differ). Users who never imported AIS have nothing to resolve, so the
   * mismatch screen must not block them. Defaults to true for backwards
   * compatibility with call sites that only track the resolved flag.
   */
  hasOpenMismatch?: boolean;
}

export interface CheckoutGateResult {
  canCheckout: boolean;
  completenessScore: number;
  blockingHref: string;
  blockingLabel: string;
  engineOverride: boolean;
  /** Checkout allowed on estimate-mode figures — guide uses draft values. */
  estimateOverride: boolean;
}

export function resolveCheckoutGate(input: CheckoutGateInput): CheckoutGateResult {
  const {
    mismatchResolved,
    mismatchProceedWithExplanation,
    confidence,
    engineUnavailable,
    loading,
    hasOpenMismatch = true,
  } = input;

  const mismatchOk =
    !hasOpenMismatch || mismatchResolved || mismatchProceedWithExplanation;
  const engineOverride = !loading && engineUnavailable;

  if (!mismatchOk) {
    return {
      canCheckout: false,
      completenessScore: confidence.completeness_score,
      blockingHref: "/file/import/mismatch",
      blockingLabel: "Your Form 16 and AIS don't match — fix this first",
      engineOverride: false,
      estimateOverride: false,
    };
  }

  if (confidence.filing_ready) {
    return {
      canCheckout: true,
      completenessScore: confidence.completeness_score,
      blockingHref: "",
      blockingLabel: "",
      engineOverride: false,
      estimateOverride: false,
    };
  }

  if (engineOverride) {
    return {
      canCheckout: true,
      completenessScore: confidence.completeness_score,
      blockingHref: "",
      blockingLabel: "",
      engineOverride: true,
      estimateOverride: false,
    };
  }

  // Estimate mode: the user chose quick numbers instead of uploads. Paying
  // unlocks the portal guide with their draft figures — we warn them to
  // switch to exact before actually filing, but we don't block payment.
  if (confidence.is_estimate_mode) {
    return {
      canCheckout: true,
      completenessScore: confidence.completeness_score,
      blockingHref: "",
      blockingLabel: "",
      engineOverride: false,
      estimateOverride: true,
    };
  }

  if (confidence.missing_documents.length > 0) {
    return {
      canCheckout: false,
      completenessScore: confidence.completeness_score,
      blockingHref: "/file/import/documents",
      blockingLabel: `Upload ${confidence.missing_documents[0]}`,
      engineOverride: false,
      estimateOverride: false,
    };
  }

  return {
    canCheckout: false,
    completenessScore: confidence.completeness_score,
    blockingHref: "/file/review/risk#final-check",
    blockingLabel: "Complete the pre-submit checklist",
    engineOverride: false,
    estimateOverride: false,
  };
}
