import { describe, expect, it } from "vitest";
import { draftToUserInput } from "../draftToUserInput";
import type { DraftState } from "@/lib/store/draft";

function baseDraft(
  overrides: Partial<
    Pick<
      DraftState,
      | "profile"
      | "income"
      | "houseProperty"
      | "deductions"
      | "connectedConnectors"
      | "incomeChips"
      | "matrix"
    >
  > = {}
): Pick<
  DraftState,
  | "filingMode"
  | "profile"
  | "matrix"
  | "incomeChips"
  | "income"
  | "houseProperty"
  | "deductions"
  | "connectedConnectors"
> {
  return {
    filingMode: "estimate",
    profile: {
      assessmentYear: "AY 2026-27 (FY 2025-26)",
      residentialStatus: "resident",
      ageBand: "under_60",
    },
    matrix: { income: "2", age: "a", business: "x" },
    incomeChips: ["salary", "fd_interest"],
    income: {
      grossSalary: 1_200_000,
      tds: 85_000,
      fdInterest: 18_400,
      employer: "Acme Pvt Ltd",
      advanceTax: 0,
      selfAssessmentTax: 0,
      hraReceived: 0,
      actualRentPaid: 0,
      cityTier: "metro",
      employers: [],
    },
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
      npsExtra: 50_000,
    },
    connectedConnectors: [],
    ...overrides,
  };
}

describe("draftToUserInput", () => {
  it("sets has_form16 only when form16 connector is connected", () => {
    const without = draftToUserInput(baseDraft());
    const withForm16 = draftToUserInput(
      baseDraft({ connectedConnectors: ["form16"] })
    );

    expect(without.documents?.has_form16).toBe(false);
    expect(withForm16.documents?.has_form16).toBe(true);
  });

  it("maps FD interest to 80TTB for senior taxpayers", () => {
    const senior = draftToUserInput(
      baseDraft({
        profile: {
          assessmentYear: "AY 2026-27 (FY 2025-26)",
          residentialStatus: "resident",
          ageBand: "senior",
        },
        income: {
          grossSalary: 800_000,
          tds: 40_000,
          fdInterest: 60_000,
          employer: "Retired Corp",
          advanceTax: 0,
          selfAssessmentTax: 0,
          hraReceived: 0,
          actualRentPaid: 0,
          cityTier: "metro",
        },
      })
    );

    expect(senior.deductions?.savings_interest_deduction).toBe(50_000);
  });

  it("does not apply 80TTB for taxpayers under 60", () => {
    const under60 = draftToUserInput(
      baseDraft({
        income: {
          grossSalary: 1_200_000,
          tds: 85_000,
          fdInterest: 60_000,
          employer: "Acme Pvt Ltd",
          advanceTax: 0,
          selfAssessmentTax: 0,
          hraReceived: 0,
          actualRentPaid: 0,
          cityTier: "metro",
        },
      })
    );

    expect(under60.deductions?.savings_interest_deduction).toBeUndefined();
  });

  it("maps HRA and rent into salary when present", () => {
    const input = draftToUserInput(
      baseDraft({
        income: {
          grossSalary: 1_200_000,
          tds: 85_000,
          fdInterest: 0,
          employer: "Acme Pvt Ltd",
          advanceTax: 0,
          selfAssessmentTax: 0,
          hraReceived: 240_000,
          actualRentPaid: 180_000,
          cityTier: "metro",
        },
      })
    );

    expect(input.salary?.hra_received).toBe(240_000);
    expect(input.salary?.actual_rent_paid).toBe(180_000);
    expect(input.salary?.city_tier).toBe("metro");
  });

  it("maps salary, TDS, and deductions into engine input", () => {
    const input = draftToUserInput(baseDraft());

    expect(input.salary?.gross_salary).toBe(1_200_000);
    expect(input.taxes_paid?.tds_salary).toBe(85_000);
    expect(input.deductions?.epf).toBe(150_000);
    expect(input.deductions?.health_insurance_self).toBe(25_000);
    expect(input.other_income?.fd_interest).toBe(18_400);
  });

  it("maps advance tax and self-assessment tax into taxes paid", () => {
    const input = draftToUserInput(
      baseDraft({
        income: {
          grossSalary: 1_200_000,
          tds: 85_000,
          fdInterest: 18_400,
          employer: "Acme Pvt Ltd",
          advanceTax: 30_000,
          selfAssessmentTax: 12_000,
          hraReceived: 0,
          actualRentPaid: 0,
          cityTier: "metro",
        },
      })
    );

    expect(input.taxes_paid?.advance_tax_paid).toBe(30_000);
    expect(input.taxes_paid?.self_assessment_tax_paid).toBe(12_000);
  });

  it("maps 80GG rent paid only when an amount is entered", () => {
    const without = draftToUserInput(baseDraft());
    const withRent = draftToUserInput(
      baseDraft({
        deductions: {
          section80C: 150_000,
          section80D: 25_000,
          section80GG: 96_000,
          npsExtra: 50_000,
        },
      })
    );

    expect(without.deductions?.rent_paid_no_hra).toBeUndefined();
    expect(withRent.deductions?.rent_paid_no_hra).toBe(96_000);
  });

  it("omits house property when no property is declared", () => {
    const input = draftToUserInput(baseDraft());
    expect(input.house_property).toBeUndefined();
  });

  it("maps let-out house property scaled by ownership share", () => {
    const input = draftToUserInput(
      baseDraft({
        houseProperty: {
          propertyType: "let_out",
          annualRent: 240_000,
          homeLoanInterest: 180_000,
          municipalTax: 20_000,
          coOwnerPercent: 50,
        },
      })
    );

    expect(input.house_property?.property_type).toBe("let_out");
    expect(input.house_property?.annual_rent_received).toBe(120_000);
    expect(input.house_property?.municipal_tax).toBe(10_000);
    expect(input.house_property?.home_loan_interest).toBe(90_000);
  });

  it("maps self-occupied house property with home loan interest", () => {
    const input = draftToUserInput(
      baseDraft({
        houseProperty: {
          propertyType: "self_occupied",
          annualRent: 0,
          homeLoanInterest: 200_000,
          municipalTax: 0,
          coOwnerPercent: 100,
        },
      })
    );

    expect(input.house_property?.property_type).toBe("self_occupied");
    expect(input.house_property?.home_loan_interest).toBe(200_000);
    expect(input.house_property?.annual_rent_received).toBeUndefined();
  });

  it("maps capital_gains chip to capital gains input and CG document flag", () => {
    const input = draftToUserInput(
      baseDraft({ incomeChips: ["salary", "capital_gains"] })
    );

    expect(input.capital_gains?.stcg_other).toBe(1);
    expect(input.profile_flags?.business_type_code).toBe("z");
    expect(input.documents?.has_capital_gains_statement).toBe(true);
  });

  it("maps freelance chip to presumptive profession business input", () => {
    const input = draftToUserInput(
      baseDraft({ incomeChips: ["salary", "freelance"] })
    );

    expect(input.business?.business_type).toBe("presumptive_profession");
    expect(input.profile_flags?.business_type_code).toBe("w");
  });

  it("maps business_presumptive chip to presumptive business input", () => {
    const input = draftToUserInput(
      baseDraft({ incomeChips: ["salary", "business_presumptive"] })
    );

    expect(input.business?.business_type).toBe("presumptive_business");
    expect(input.profile_flags?.business_type_code).toBe("w");
  });

  it("maps foreign and director chips to profile flags", () => {
    const input = draftToUserInput(
      baseDraft({ incomeChips: ["salary", "foreign", "director"] })
    );

    expect(input.profile_flags?.has_foreign_income).toBe(true);
    expect(input.profile_flags?.has_foreign_assets).toBe(true);
    expect(input.profile_flags?.is_director).toBe(true);
  });
});
