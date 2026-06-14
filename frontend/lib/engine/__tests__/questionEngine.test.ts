import { describe, expect, it } from "vitest";
import { generateFollowUpQuestions } from "../questionEngine";
import type { ITRResult } from "../types";

function minimalResult(
  overrides: Partial<ITRResult["confidence"]> = {}
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
      ...overrides,
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
    hraReceived: 0,
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

describe("generateFollowUpQuestions", () => {
  it("asks about missing documents from engine confidence", () => {
    const questions = generateFollowUpQuestions({
      result: minimalResult(),
      userInput: { age: 32 },
      draft: baseDraft,
    });

    expect(questions.some((q) => q.id.startsWith("missing_doc_"))).toBe(true);
    expect(questions[0]?.category).toBe("documents");
  });

  it("asks for rent when HRA is set but rent is zero", () => {
    const questions = generateFollowUpQuestions({
      userInput: { age: 32, salary: { gross_salary: 1_000_000, basic_salary: 500_000, hra_received: 200_000 } },
      draft: {
        ...baseDraft,
        income: {
          ...baseDraft.income,
          hraReceived: 200_000,
          actualRentPaid: 0,
        },
      },
    });

    expect(questions.some((q) => q.id === "hra_rent_missing")).toBe(true);
  });

  it("asks about pension when chip selected but not mapped to engine input", () => {
    const questions = generateFollowUpQuestions({
      userInput: { age: 65 },
      draft: {
        ...baseDraft,
        profile: { ...baseDraft.profile, ageBand: "senior" },
        incomeChips: ["salary", "pension"],
      },
    });

    expect(questions.some((q) => q.id === "chip_unmapped_pension")).toBe(true);
  });

  it("asks about multiple Form 16 parts", () => {
    const questions = generateFollowUpQuestions({
      userInput: { age: 32 },
      draft: {
        ...baseDraft,
        lastParseResult: {
          connectorId: "form16",
          mode: "extracted",
          fieldConfidence: {},
          warnings: [],
          demo: false,
          filenames: ["part_a.pdf", "part_b.pdf"],
          parsedParts: [
            { name: "part_a.pdf", partKind: "part_a" },
            { name: "part_b.pdf", partKind: "part_b" },
          ],
        },
      },
    });

    expect(questions.some((q) => q.id === "multiple_form16_reconcile")).toBe(
      true
    );
  });

  it("skips questions already answered", () => {
    const questions = generateFollowUpQuestions({
      userInput: { age: 32 },
      draft: {
        ...baseDraft,
        income: { ...baseDraft.income, hraReceived: 100_000, actualRentPaid: 0 },
      },
      questionAnswers: { hra_rent_missing: "180000" },
    });

    expect(questions.some((q) => q.id === "hra_rent_missing")).toBe(false);
  });

  it("sorts high-priority questions first", () => {
    const questions = generateFollowUpQuestions({
      result: minimalResult({ ca_escalation_recommended: true, ca_escalation_reasons: ["High income"] }),
      userInput: { age: 32 },
      draft: {
        ...baseDraft,
        income: { ...baseDraft.income, hraReceived: 50_000, actualRentPaid: 0 },
      },
    });

    const highIndex = questions.findIndex((q) => q.priority === "high");
    const lowIndex = questions.findIndex((q) => q.priority === "low");
    if (highIndex >= 0 && lowIndex >= 0) {
      expect(highIndex).toBeLessThan(lowIndex);
    }
  });
});
