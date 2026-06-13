import { selectOptimizationTips } from "@/lib/filing/optimizationTips";
import type {
  ITRResult,
  Recommendation,
  RegimeComparisonResult,
  RiskFlag,
  TaxRegime,
} from "./types";

export interface RecommendationEscalation {
  caReview: boolean;
  caReviewReasons: string[];
  unsupported: boolean;
  unsupportedReasons: string[];
}

export interface RecommendationBundle {
  recommendedRegime: TaxRegime;
  regimeComparison: RegimeComparisonResult;
  tips: Recommendation[];
  allRecommendations: Recommendation[];
  escalation: RecommendationEscalation;
  riskFlags: RiskFlag[];
  handoff: Record<string, unknown> | null;
}

export function buildRecommendationBundle(
  result: ITRResult,
  handoff?: Record<string, unknown> | null
): RecommendationBundle {
  const { regime_comparison: regimeComparison, recommendations, risk_flags } =
    result;

  const tips = selectOptimizationTips(
    recommendations,
    regimeComparison.recommended_regime
  );

  const unsupportedReasons = result.profile.out_of_scope_reasons ?? [];
  const unsupported =
    unsupportedReasons.length > 0 || result.profile.expert_required;

  return {
    recommendedRegime: regimeComparison.recommended_regime,
    regimeComparison,
    tips,
    allRecommendations: recommendations,
    escalation: {
      caReview: result.confidence.ca_escalation_recommended,
      caReviewReasons: result.confidence.ca_escalation_reasons,
      unsupported,
      unsupportedReasons,
    },
    riskFlags: risk_flags,
    handoff: handoff ?? null,
  };
}
