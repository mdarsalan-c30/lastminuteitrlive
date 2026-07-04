import { describe, expect, it } from "vitest";
import {
  estimateMarginalRate,
  generateDeductionDiscoveryQuestions,
} from "../deductionDiscovery";
import type { QuestionEngineContext } from "../questionEngine";
import type { UserInput } from "../types";

const baseDraft: QuestionEngineContext["draft"] = {
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
  connectedConnectors: [],
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
    section80C: 0,
    section80D: 0,
    section80GG: 0,
    npsExtra: 0,
  },
};

function ctxWith(
  userInput: Partial<UserInput>,
  draft: Partial<QuestionEngineContext["draft"]> = {},
  answers?: Record<string, unknown>
): QuestionEngineContext {
  return {
    result: null,
    userInput: {
      age: 32,
      salary: { gross_salary: 1_200_000, basic_salary: 600_000 },
      ...userInput,
    } as UserInput,
    draft: { ...baseDraft, ...draft },
    questionAnswers: answers,
  };
}

describe("estimateMarginalRate", () => {
  it("uses the 30% band with cess for 12L fallback income", () => {
    expect(estimateMarginalRate(null, 1_200_000)).toBeCloseTo(0.312, 3);
  });

  it("uses the 5% band for low income", () => {
    expect(estimateMarginalRate(null, 400_000)).toBeCloseTo(0.052, 3);
  });
});

describe("generateDeductionDiscoveryQuestions", () => {
  it("asks about empty 80C with quantified full-cap saving", () => {
    const qs = generateDeductionDiscoveryQuestions(ctxWith({}));
    const q = qs.find((x) => x.id === "disc_80c");
    expect(q).toBeDefined();
    // 1.5L headroom × 31.2% ≈ ₹46,800
    expect(q!.estimatedSaving).toBe(46_800);
    expect(q!.priority).toBe("high");
    expect(q!.section).toBe("80C");
  });

  it("does not ask 80C when the pool is already full", () => {
    const qs = generateDeductionDiscoveryQuestions(
      ctxWith({ deductions: { ppf: 150_000 } })
    );
    expect(qs.find((x) => x.id === "disc_80c")).toBeUndefined();
  });

  it("skips a question the user already answered", () => {
    const qs = generateDeductionDiscoveryQuestions(
      ctxWith({}, {}, { disc_80c: "no" })
    );
    expect(qs.find((x) => x.id === "disc_80c")).toBeUndefined();
  });

  it("asks about employer NPS (both regimes) when Form 16 shows none", () => {
    const qs = generateDeductionDiscoveryQuestions(ctxWith({}));
    const q = qs.find((x) => x.id === "disc_80ccd2");
    expect(q).toBeDefined();
    expect(q!.regimeScope).toBe("both");
    // 14% of 6L basic = 84k × 31.2% ≈ 26,208
    expect(q!.estimatedSaving).toBe(26_208);
  });

  it("asks about rent (80GG) only when no HRA and rent unknown", () => {
    const withoutHra = generateDeductionDiscoveryQuestions(ctxWith({}));
    expect(withoutHra.find((x) => x.id === "disc_rent_80gg")).toBeDefined();

    const withHra = generateDeductionDiscoveryQuestions(
      ctxWith({}, { income: { ...baseDraft.income, hraReceived: 100_000 } })
    );
    expect(withHra.find((x) => x.id === "disc_rent_80gg")).toBeUndefined();
  });

  it("asks for home-loan principal when interest is known but principal is not", () => {
    const qs = generateDeductionDiscoveryQuestions(
      ctxWith(
        {},
        {
          houseProperty: {
            ...baseDraft.houseProperty,
            propertyType: "self_occupied",
            homeLoanInterest: 180_000,
          },
        }
      )
    );
    expect(qs.find((x) => x.id === "disc_home_loan_principal")).toBeDefined();
  });

  it("asks 44AD business owners about digital receipts with 2% advantage", () => {
    const qs = generateDeductionDiscoveryQuestions(
      ctxWith({
        business: {
          business_type: "presumptive_business",
          turnover: 10_000_000,
          digital_turnover_pct: 0,
        },
      })
    );
    const q = qs.find((x) => x.id === "disc_digital_receipts");
    expect(q).toBeDefined();
    // 1Cr × 2% = 2L deemed-income reduction × 31.2% = ₹62,400
    expect(q!.estimatedSaving).toBe(62_400);
    expect(q!.priority).toBe("high");
  });

  it("asks 44ADA professionals whether books could beat presumptive", () => {
    const qs = generateDeductionDiscoveryQuestions(
      ctxWith({
        business: {
          business_type: "presumptive_profession",
          gross_professional_receipts: 3_000_000,
        },
      })
    );
    expect(qs.find((x) => x.id === "disc_books_vs_presumptive")).toBeDefined();
  });

  it("uses senior 80TTB cap for senior citizens", () => {
    const qs = generateDeductionDiscoveryQuestions(
      ctxWith(
        {},
        { profile: { ...baseDraft.profile, ageBand: "senior" as const } }
      )
    );
    const q = qs.find((x) => x.id === "disc_savings_interest");
    expect(q).toBeDefined();
    expect(q!.section).toBe("80TTB");
  });

  it("sorts questions by estimated saving, highest first", () => {
    const qs = generateDeductionDiscoveryQuestions(ctxWith({}));
    for (let i = 1; i < qs.length; i++) {
      expect(qs[i - 1].estimatedSaving).toBeGreaterThanOrEqual(
        qs[i].estimatedSaving
      );
    }
  });

  it("never fabricates savings — zero when not quantifiable", () => {
    const qs = generateDeductionDiscoveryQuestions(ctxWith({}));
    const q80e = qs.find((x) => x.id === "disc_80e");
    expect(q80e!.estimatedSaving).toBe(0);
  });

  it("asks about brought-forward losses when capital gains chip is on", () => {
    const qs = generateDeductionDiscoveryQuestions(
      ctxWith({}, { incomeChips: ["salary", "capital_gains"] })
    );
    const q = qs.find((x) => x.id === "disc_bf_losses");
    expect(q).toBeDefined();
    expect(q!.section).toBe("CFL/BFLA");
    expect(q!.estimatedSaving).toBeGreaterThan(0);
  });

  it("skips BF-loss question once losses are already entered", () => {
    const qs = generateDeductionDiscoveryQuestions(
      ctxWith(
        { carry_forward: { stcl: 50_000 } },
        { incomeChips: ["salary", "capital_gains"] }
      )
    );
    expect(qs.find((x) => x.id === "disc_bf_losses")).toBeUndefined();
    expect(qs.find((x) => x.id === "disc_bf_sec80")).toBeDefined();
  });

  it("asks about a second property when one is already declared", () => {
    const qs = generateDeductionDiscoveryQuestions(
      ctxWith(
        {},
        {
          houseProperty: {
            ...baseDraft.houseProperty,
            propertyType: "self_occupied",
            homeLoanInterest: 100_000,
          },
        }
      )
    );
    expect(qs.find((x) => x.id === "disc_second_property")).toBeDefined();
  });

  it("asks books filers about depreciation when no blocks entered", () => {
    const qs = generateDeductionDiscoveryQuestions(
      ctxWith(
        {
          business: {
            business_type: "regular_books",
            actual_gross_receipts: 1_000_000,
            actual_expenses: 200_000,
          },
        },
        { income: { ...baseDraft.income, businessRevenue: 1_000_000 } }
      )
    );
    const q = qs.find((x) => x.id === "disc_depreciation");
    expect(q).toBeDefined();
    expect(q!.section).toBe("Sec 32");
  });
});
