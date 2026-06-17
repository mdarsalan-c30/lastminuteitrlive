import type { Recommendation, TaxRegime } from "@/lib/engine/types";

const REGIME_TIP_IDS = new Set(["REGIME_NEW_BETTER", "REGIME_OLD_BETTER"]);

function isGreenBenefitTip(rec: Recommendation): boolean {
  return !rec.blocked && rec.risk === "green" && rec.estimated_benefit > 0;
}

/** Regime tips always surface; Chapter VI-A tips only when old regime is selected. */
export function selectOptimizationTips(
  recommendations: Recommendation[],
  recommendedRegime: TaxRegime,
  limit = 3
): Recommendation[] {
  const regimeTips = recommendations.filter(
    (rec) =>
      REGIME_TIP_IDS.has(rec.id) && !rec.blocked && rec.risk === "green"
  );

  const chapterViaTips =
    recommendedRegime === "old"
      ? recommendations.filter(
          (rec) => isGreenBenefitTip(rec) && !REGIME_TIP_IDS.has(rec.id)
        )
      : [];

  return [...regimeTips, ...chapterViaTips]
    .sort((a, b) => b.estimated_benefit - a.estimated_benefit)
    .slice(0, limit);
}
