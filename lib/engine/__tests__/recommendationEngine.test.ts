import { describe, expect, it } from "vitest";
import { buildRecommendationBundle } from "../recommendationEngine";
import type { ITRResult, Recommendation } from "../types";

function makeRecommendation(
  overrides: Partial<Recommendation> = {}
): Recommendation {
  return {
    id: "80C_HEADROOM",
    plain_english: "You can still invest in ELSS under 80C",
    gov_section: "Section 80C",
    risk: "green",
    proof_required: ["Investment proof"],
    requires_user_confirmation: false,
    estimated_benefit: 5000,
    blocked: false,
    ...overrides,
  };
}

function minimalResult(
  overrides: Partial<ITRResult> = {}
): ITRResult {
  return {
    assessment_year: "2025-26",
    age: 32,
    mode: "estimate",
    profile: {
      age_group: "30_to_34",
      is_senior: false,
      is_super_senior: false,
      new_regime_eligible: true,
      old_regime_eligible: true,
      itr_form: "ITR-1",
      routing_reasons: [],
      expert_required: false,
      out_of_scope_reasons: [],
    },
    income_heads: {} as ITRResult["income_heads"],
    business_income: {} as ITRResult["business_income"],
    deductions: {} as ITRResult["deductions"],
    regime_comparison: {
      old: {} as ITRResult["regime_comparison"]["old"],
      new: {} as ITRResult["regime_comparison"]["new"],
      recommended_regime: "old",
      tax_saving: 12_000,
      breakeven_deductions: 100_000,
      deductions_lost_in_new: 175_000,
      old_effective_rate: 10,
      new_effective_rate: 8,
    },
    risk_flags: [{ code: "MISSING_AIS", severity: "warning", message: "AIS missing" }],
    recommendations: [
      makeRecommendation(),
      makeRecommendation({
        id: "REGIME_OLD_BETTER",
        estimated_benefit: 12_000,
      }),
      makeRecommendation({
        id: "BLOCKED_TIP",
        blocked: true,
        estimated_benefit: 99_000,
      }),
    ],
    confidence: {
      completeness_score: 72,
      filing_ready: false,
      missing_documents: [],
      ca_escalation_recommended: true,
      ca_escalation_reasons: ["Multiple employers"],
      is_estimate_mode: true,
    },
    ...overrides,
  };
}

describe("buildRecommendationBundle", () => {
  it("selects green tips for old regime and excludes blocked recs from tips", () => {
    const bundle = buildRecommendationBundle(minimalResult());

    expect(bundle.recommendedRegime).toBe("old");
    expect(bundle.tips.every((t) => !t.blocked)).toBe(true);
    expect(bundle.tips.some((t) => t.id === "BLOCKED_TIP")).toBe(false);
  });

  it("surfaces CA escalation from confidence", () => {
    const bundle = buildRecommendationBundle(minimalResult());

    expect(bundle.escalation.caReview).toBe(true);
    expect(bundle.escalation.caReviewReasons).toContain("Multiple employers");
  });

  it("marks unsupported when expert required or out of scope", () => {
    const bundle = buildRecommendationBundle(
      minimalResult({
        profile: {
          ...minimalResult().profile,
          expert_required: true,
          out_of_scope_reasons: ["NRI income"],
        },
      })
    );

    expect(bundle.escalation.unsupported).toBe(true);
    expect(bundle.escalation.unsupportedReasons).toContain("NRI income");
  });

  it("passes through handoff payload when provided", () => {
    const handoff = { layer1_complete: true, recommendations: [] };
    const bundle = buildRecommendationBundle(minimalResult(), handoff);

    expect(bundle.handoff).toEqual(handoff);
  });

  it("includes risk flags from compute result", () => {
    const bundle = buildRecommendationBundle(minimalResult());

    expect(bundle.riskFlags).toHaveLength(1);
    expect(bundle.riskFlags[0]?.code).toBe("MISSING_AIS");
  });
});
