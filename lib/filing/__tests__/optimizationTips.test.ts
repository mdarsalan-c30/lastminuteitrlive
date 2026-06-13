import { describe, expect, it } from "vitest";
import type { Recommendation } from "@/lib/engine/types";
import { selectOptimizationTips } from "../optimizationTips";

function rec(
  id: string,
  benefit: number,
  overrides: Partial<Recommendation> = {}
): Recommendation {
  return {
    id,
    gov_section: "Test",
    plain_english: id,
    estimated_benefit: benefit,
    risk: "green",
    blocked: false,
    proof_required: [],
    requires_user_confirmation: false,
    ...overrides,
  };
}

describe("selectOptimizationTips", () => {
  it("shows regime tips even when new regime is recommended", () => {
    const recommendations = [
      rec("REGIME_OLD_BETTER", 12_000),
      rec("80C_TOPUP", 50_000),
    ];

    const tips = selectOptimizationTips(recommendations, "new", 3);

    expect(tips.map((t) => t.id)).toContain("REGIME_OLD_BETTER");
    expect(tips.map((t) => t.id)).not.toContain("80C_TOPUP");
  });

  it("shows regime and Chapter VI-A tips when old regime is recommended", () => {
    const recommendations = [
      rec("REGIME_NEW_BETTER", 8_000),
      rec("80C_TOPUP", 50_000),
    ];

    const tips = selectOptimizationTips(recommendations, "old", 3);

    expect(tips.map((t) => t.id)).toEqual(["80C_TOPUP", "REGIME_NEW_BETTER"]);
  });
});
