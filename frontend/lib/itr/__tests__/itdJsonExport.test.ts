import { describe, expect, it } from "vitest";
import {
  buildItr1Export,
  buildItr2Export,
  buildItr3Export,
  buildItr4Export,
} from "../itdJsonExport";
import type { ITRResult, UserInput } from "@/lib/engine/types";

function makeResult(overrides: {
  form: string;
  incomeHeads?: Partial<ITRResult["income_heads"]>;
  business?: Partial<ITRResult["business_income"]>;
}): ITRResult {
  return {
    assessment_year: "2026-27",
    age: 32,
    mode: "detailed",
    profile: { itr_form: overrides.form } as ITRResult["profile"],
    income_heads: {
      net_salary_income: 1_000_000,
      net_house_property_income: 0,
      total_other_income: 0,
      stcg_other_slab: 0,
      stcg_111a_net: 0,
      ltcg_112a_net: 0,
      ltcg_other_net: 0,
      gross_total_income: 1_000_000,
      carry_forward_loss_set_off: 0,
      losses_carried_forward: {},
      depreciation_allowed: 0,
      ...overrides.incomeHeads,
    } as ITRResult["income_heads"],
    business_income: {
      presumptive_44ad: 0,
      presumptive_44ada: 0,
      books_profit: 0,
      net_business_income: 0,
      section_used: "",
      presumptive_eligible: false,
      ...overrides.business,
    } as ITRResult["business_income"],
    deductions: {
      capped_80c: 0,
      deduction_80d: 0,
      deduction_80ccd_1b: 0,
      deduction_80ccd_2: 0,
      deduction_80e: 0,
      deduction_80g: 0,
      deduction_80gg: 0,
      deduction_80tta_ttb: 0,
      total_chapter_via: 0,
    } as ITRResult["deductions"],
    regime_comparison: {
      recommended_regime: "new",
      new: {
        taxable_income: 925_000,
        total_tax: 26_000,
        tds_and_advance_tax: 30_000,
        net_payable: -4_000,
      },
      old: {
        taxable_income: 950_000,
        total_tax: 106_600,
        tds_and_advance_tax: 30_000,
        net_payable: 76_600,
      },
    } as ITRResult["regime_comparison"],
    risk_flags: [],
    recommendations: [],
    confidence: {} as ITRResult["confidence"],
  } as ITRResult;
}

const baseUserInput = {
  age: 32,
  residential_status: "resident",
} as unknown as UserInput;

describe("buildItr3Export", () => {
  it("exports F&O business detail without blocking when engine routed ITR-3", () => {
    const result = makeResult({
      form: "ITR-3",
      business: {
        section_used: "books_fno",
        net_business_income: 300_000,
        books_profit: 300_000,
      },
    });
    const userInput = {
      ...baseUserInput,
      business: {
        business_type: "regular_books",
        fno_turnover: 8_000_000,
        fno_non_speculative_profit: 300_000,
        fno_speculative_profit: 0,
      },
    } as unknown as UserInput;

    const payload = buildItr3Export({ userInput, result });
    expect(payload.form).toBe("ITR-3");
    expect(payload.schemaVersion).toBe("AY2026_27_ITR3_FOUNDATION");
    expect(payload.validation.blocking).toHaveLength(0);
    expect(payload.business.fno.turnover).toBe(8_000_000);
    expect(payload.business.fno.auditFlag10Cr).toBe(false);
    expect(payload.business.netBusinessIncome).toBe(300_000);
  });

  it("warns when F&O turnover crosses the ₹10 crore audit threshold", () => {
    const result = makeResult({ form: "ITR-3", business: { section_used: "books_fno" } });
    const userInput = {
      ...baseUserInput,
      business: {
        business_type: "regular_books",
        fno_turnover: 11_00_00_000,
      },
    } as unknown as UserInput;

    const payload = buildItr3Export({ userInput, result });
    expect(payload.business.fno.auditFlag10Cr).toBe(true);
    expect(payload.validation.warnings.join(" ")).toContain("₹10 crore");
  });

  it("blocks when the engine routed a different form", () => {
    const result = makeResult({ form: "ITR-1" });
    const payload = buildItr3Export({ userInput: baseUserInput, result });
    expect(payload.validation.blocking.join(" ")).toContain("not ITR-3");
  });
});

describe("buildItr4Export", () => {
  it("exports presumptive 44ADA detail without blocking", () => {
    const result = makeResult({
      form: "ITR-4",
      business: {
        section_used: "44ADA",
        presumptive_44ada: 1_500_000,
        net_business_income: 1_500_000,
        presumptive_eligible: true,
      },
    });
    const userInput = {
      ...baseUserInput,
      business: {
        business_type: "presumptive_profession",
        gross_professional_receipts: 3_000_000,
      },
    } as unknown as UserInput;

    const payload = buildItr4Export({ userInput, result });
    expect(payload.form).toBe("ITR-4");
    expect(payload.validation.blocking).toHaveLength(0);
    expect(payload.presumptive.presumptive44ada).toBe(1_500_000);
    expect(payload.presumptive.sectionUsed).toBe("44ADA");
  });

  it("blocks capital gains in ITR-4", () => {
    const result = makeResult({
      form: "ITR-4",
      incomeHeads: { ltcg_112a_net: 200_000 },
      business: { section_used: "44AD", presumptive_eligible: true },
    });
    const payload = buildItr4Export({ userInput: baseUserInput, result });
    expect(payload.validation.blocking.join(" ")).toContain("Capital gains");
  });
});

describe("existing builders still work", () => {
  it("ITR-1 exports cleanly for an ITR-1 case", () => {
    const result = makeResult({ form: "ITR-1" });
    const payload = buildItr1Export({ userInput: baseUserInput, result });
    expect(payload.validation.blocking).toHaveLength(0);
    expect(payload.tax.totalTax).toBe(26_000);
  });

  it("ITR-2 exports capital gains buckets", () => {
    const result = makeResult({
      form: "ITR-2",
      incomeHeads: { ltcg_112a_net: 300_000 },
    });
    const payload = buildItr2Export({ userInput: baseUserInput, result });
    expect(payload.validation.blocking).toHaveLength(0);
    expect(payload.capitalGains.ltcg112a).toBe(300_000);
  });
});
