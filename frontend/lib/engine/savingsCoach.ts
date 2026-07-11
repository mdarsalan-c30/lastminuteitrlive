import { generateDeductionDiscoveryQuestions } from "@/lib/engine/deductionDiscovery";
import type { QuestionEngineContext } from "@/lib/engine/questionEngine";
import type { ITRResult, TaxRegime } from "@/lib/engine/types";

export interface SavingsCoachSummary {
  selectedRegime: TaxRegime;
  recommendedRegime: TaxRegime | null;
  netPayable: number;
  isRefund: boolean;
  regimeDelta: number;
  remainingUpside: number;
  totalPossibleUpside: number;
  breakevenGap: number;
  plainRegime: "old" | "new" | null;
}

export function buildSavingsCoachSummary(input: {
  result: ITRResult | null | undefined;
  selectedRegime: TaxRegime;
  questionContext?: QuestionEngineContext;
}): SavingsCoachSummary {
  const comparison = input.result?.regime_comparison;
  const selected = comparison?.[input.selectedRegime];
  const recommendedRegime = comparison?.recommended_regime ?? null;
  const remainingUpside = input.questionContext
    ? generateDeductionDiscoveryQuestions(input.questionContext)
        .filter((question) => {
          if (question.regimeScope === "both") return true;
          return recommendedRegime === null || recommendedRegime === "old";
        })
        .reduce((sum, question) => sum + Math.max(0, question.estimatedSaving), 0)
    : 0;

  const currentOldDeductions =
    input.result?.deductions.total_chapter_via ??
    input.result?.regime_comparison.deductions_lost_in_new ??
    0;
  const breakeven = comparison?.breakeven_deductions ?? 0;

  return {
    selectedRegime: input.selectedRegime,
    recommendedRegime,
    netPayable: selected?.net_payable ?? 0,
    isRefund: (selected?.net_payable ?? 0) < 0,
    regimeDelta: comparison?.tax_saving ?? 0,
    remainingUpside: Math.round(remainingUpside),
    totalPossibleUpside: Math.round((comparison?.tax_saving ?? 0) + remainingUpside),
    breakevenGap:
      recommendedRegime === "new"
        ? Math.max(0, Math.round(breakeven - currentOldDeductions))
        : 0,
    plainRegime: recommendedRegime,
  };
}

export function formatSavingsCoachInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
