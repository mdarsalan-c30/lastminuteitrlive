import { describe, expect, it } from "vitest";
import { generateRuleBasedQuestions } from "../fallbackQuestionRules";
import type { ITRResult } from "@/lib/engine/types";

function minimalResult(): ITRResult {
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
    regime_comparison: {} as ITRResult["regime_comparison"],
    risk_flags: [],
    recommendations: [],
    confidence: {
      completeness_score: 55,
      filing_ready: false,
      missing_documents: ["Annual Information Statement (AIS)"],
      ca_escalation_recommended: false,
      ca_escalation_reasons: [],
      is_estimate_mode: true,
    },
  };
}

const baseDraft = {
  profile: {
    assessmentYear: "AY 2026-27 (FY 2025-26)",
    residentialStatus: "resident" as const,
    ageBand: "under_60" as const,
  },
  income: {
    grossSalary: 1_200_000,
    tds: 85_000,
    fdInterest: 0,
    employer: "Acme",
    advanceTax: 0,
    selfAssessmentTax: 0,
    hraReceived: 240_000,
    actualRentPaid: 0,
    cityTier: "metro" as const,
  },
  incomeChips: ["salary"],
  connectedConnectors: [] as string[],
  mismatchResolved: false,
  lastParseResult: null,
  houseProperty: {
    propertyType: "none" as const,
    annualRent: 0,
    homeLoanInterest: 0,
    municipalTax: 0,
    coOwnerPercent: 100,
  },
  deductions: {
    section80C: 150_000,
    section80D: 25_000,
    section80GG: 0,
    npsExtra: 0,
  },
};

describe("generateRuleBasedQuestions", () => {
  it("delegates to questionEngine rules", () => {
    const questions = generateRuleBasedQuestions({
      result: minimalResult(),
      userInput: { age: 32, mode: "estimate", salary: { gross_salary: 1_200_000, basic_salary: 600_000 } },
      draft: baseDraft,
    });

    expect(questions.length).toBeGreaterThan(0);
    expect(questions.some((q) => q.id.startsWith("missing_doc_"))).toBe(true);
  });

  it("asks for rent when HRA received but rent is zero", () => {
    const questions = generateRuleBasedQuestions({
      userInput: {
        age: 32,
        mode: "estimate",
        salary: {
          gross_salary: 1_200_000,
          basic_salary: 600_000,
          hra_received: 240_000,
        },
      },
      draft: baseDraft,
    });

    expect(questions.some((q) => q.id === "hra_rent_missing")).toBe(true);
  });
});
