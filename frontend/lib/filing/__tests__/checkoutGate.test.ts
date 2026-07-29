import { describe, expect, it } from "vitest";
import { resolveCheckoutGate } from "../checkoutGate";
import type { ConfidenceResult } from "@/lib/engine/types";

function confidence(overrides: Partial<ConfidenceResult> = {}): ConfidenceResult {
  return {
    completeness_score: 72,
    filing_ready: true,
    missing_documents: [],
    ca_escalation_recommended: false,
    ca_escalation_reasons: [],
    is_estimate_mode: false,
    ...overrides,
  };
}

describe("resolveCheckoutGate", () => {
  it("blocks checkout when mismatch is unresolved", () => {
    const result = resolveCheckoutGate({
      mismatchResolved: false,
      mismatchProceedWithExplanation: false,
      confidence: confidence(),
      engineUnavailable: false,
      loading: false,
    });

    expect(result.canCheckout).toBe(false);
    expect(result.blockingHref).toBe("/file/import/mismatch");
    expect(result.engineOverride).toBe(false);
  });

  it("allows checkout when user proceeds with explanation", () => {
    const result = resolveCheckoutGate({
      mismatchResolved: false,
      mismatchProceedWithExplanation: true,
      confidence: confidence(),
      engineUnavailable: false,
      loading: false,
    });

    expect(result.canCheckout).toBe(true);
    expect(result.blockingHref).toBe("");
  });

  it("blocks checkout when tax calculation is unavailable", () => {
    const result = resolveCheckoutGate({
      mismatchResolved: true,
      mismatchProceedWithExplanation: false,
      confidence: confidence({ filing_ready: false }),
      engineUnavailable: true,
      loading: false,
    });

    expect(result.canCheckout).toBe(false);
    expect(result.engineOverride).toBe(true);
    expect(result.blockingHref).toBe("/file/regime");
  });

  it("allows checkout with missing documents and marks the result estimated", () => {
    const result = resolveCheckoutGate({
      mismatchResolved: true,
      mismatchProceedWithExplanation: false,
      confidence: confidence({
        filing_ready: false,
        missing_documents: ["Form 16"],
      }),
      engineUnavailable: false,
      loading: false,
    });

    expect(result.canCheckout).toBe(true);
    expect(result.blockingHref).toBe("");
    expect(result.estimateOverride).toBe(true);
  });

  it("does not block on mismatch when no open mismatch exists", () => {
    const result = resolveCheckoutGate({
      mismatchResolved: false,
      mismatchProceedWithExplanation: false,
      confidence: confidence(),
      engineUnavailable: false,
      loading: false,
      hasOpenMismatch: false,
    });

    expect(result.canCheckout).toBe(true);
    expect(result.blockingHref).toBe("");
  });

  it("allows checkout in estimate mode with estimateOverride flag", () => {
    const result = resolveCheckoutGate({
      mismatchResolved: false,
      mismatchProceedWithExplanation: false,
      confidence: confidence({
        filing_ready: false,
        is_estimate_mode: true,
        missing_documents: ["Annual Information Statement (AIS)", "Form 26AS"],
      }),
      engineUnavailable: false,
      loading: false,
      hasOpenMismatch: false,
    });

    expect(result.canCheckout).toBe(true);
    expect(result.estimateOverride).toBe(true);
  });

  it("does not send users back after they completed the document decision", () => {
    const result = resolveCheckoutGate({
      mismatchResolved: false,
      mismatchProceedWithExplanation: false,
      confidence: confidence({
        completeness_score: 47,
        filing_ready: false,
        missing_documents: ["Form 26AS", "Annual Information Statement (AIS)"],
      }),
      engineUnavailable: false,
      loading: false,
      hasOpenMismatch: false,
      documentsResolvedEarlier: true,
    });

    expect(result.canCheckout).toBe(true);
    expect(result.blockingHref).toBe("");
    expect(result.estimateOverride).toBe(true);
  });

  it("does not apply engine override while loading", () => {
    const result = resolveCheckoutGate({
      mismatchResolved: true,
      mismatchProceedWithExplanation: false,
      confidence: confidence({ filing_ready: false }),
      engineUnavailable: true,
      loading: true,
    });

    expect(result.canCheckout).toBe(false);
    expect(result.engineOverride).toBe(false);
    expect(result.blockingHref).toBe("");
  });
});
