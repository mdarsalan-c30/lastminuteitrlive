import { describe, expect, it } from "vitest";
import {
  aiExplainRequestSchema,
  aiQuestionsRequestSchema,
  followUpQuestionsResponseSchema,
  plainEnglishExplainSchema,
} from "../schemas";

describe("followUpQuestionsResponseSchema", () => {
  it("accepts valid follow-up questions payload", () => {
    const result = followUpQuestionsResponseSchema.safeParse({
      questions: [
        {
          id: "llm_hra_proof",
          prompt: "Do you have rent receipts?",
          whyWeAsk: "HRA needs proof.",
          category: "deductions",
          priority: "high",
        },
      ],
      escalation: "none",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty question id", () => {
    const result = followUpQuestionsResponseSchema.safeParse({
      questions: [
        {
          id: "",
          prompt: "Test?",
          whyWeAsk: "Because.",
          category: "income",
          priority: "low",
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("plainEnglishExplainSchema", () => {
  it("requires disclaimer", () => {
    const result = plainEnglishExplainSchema.safeParse({
      title: "Regime",
      explanation: "Plain text.",
      disclaimer: "Estimates only.",
    });
    expect(result.success).toBe(true);
  });
});

describe("aiQuestionsRequestSchema", () => {
  it("accepts minimal draft slice", () => {
    const result = aiQuestionsRequestSchema.safeParse({
      draft: {
        profile: {
          assessmentYear: "AY 2026-27 (FY 2025-26)",
          residentialStatus: "resident",
          ageBand: "under_60",
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
          cityTier: "metro",
        },
        incomeChips: ["salary"],
        connectedConnectors: [],
        mismatchResolved: false,
        lastParseResult: null,
        houseProperty: {
          propertyType: "none",
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
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("aiExplainRequestSchema", () => {
  it("accepts regime explain request", () => {
    const result = aiExplainRequestSchema.safeParse({
      type: "regime",
      context: { recommendedRegime: "old", taxOld: 120000, taxNew: 130000 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown explain type", () => {
    const result = aiExplainRequestSchema.safeParse({
      type: "unknown",
      context: {},
    });
    expect(result.success).toBe(false);
  });
});
