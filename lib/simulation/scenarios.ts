import { INCOME_CHIPS } from "@/lib/filing/constants";
import { incomeBandFromGross, resolveRecommendedForm } from "@/lib/filing/case-matrix";
import type { IncomeBand, AgeBand, BusinessType } from "@/lib/filing/case-matrix";
import type { DraftSlice, SimulationScenario } from "./types";

const CHIP_IDS = INCOME_CHIPS.map((c) => c.id);

const SALARY_TIERS = [0, 300_000, 800_000, 1_200_000, 2_500_000, 5_500_000] as const;
const AGE_BANDS = ["under_60", "senior", "super_senior"] as const;
const MATRIX_AGES: AgeBand[] = ["a", "b", "c", "d"];
const MATRIX_INCOMES: IncomeBand[] = ["1", "2", "3", "4", "5"];

const DEDUCTION_PRESETS = [
  { section80C: 0, section80D: 0, section80GG: 0, npsExtra: 0 },
  { section80C: 50_000, section80D: 15_000, section80GG: 0, npsExtra: 0 },
  { section80C: 150_000, section80D: 25_000, section80GG: 0, npsExtra: 50_000 },
  { section80C: 150_000, section80D: 25_000, section80GG: 96_000, npsExtra: 50_000 },
] as const;

const HOUSE_PRESETS = [
  { propertyType: "none" as const, annualRent: 0, homeLoanInterest: 0, municipalTax: 0 },
  {
    propertyType: "self_occupied" as const,
    annualRent: 0,
    homeLoanInterest: 200_000,
    municipalTax: 0,
  },
  {
    propertyType: "let_out" as const,
    annualRent: 240_000,
    homeLoanInterest: 180_000,
    municipalTax: 20_000,
  },
] as const;

const INCOME_SOURCE_CHIPS = new Set([
  "salary",
  "pension",
  "fd_interest",
  "rent_received",
  "freelance",
  "capital_gains",
  "foreign",
  "business_presumptive",
]);

/** Max combinatorial scenarios (pruned cartesian product). */
export const MAX_SCENARIO_COUNT = 9_999;

function hasIncomeSource(chips: string[]): boolean {
  return chips.some((c) => INCOME_SOURCE_CHIPS.has(c));
}

function isChipComboValid(chips: string[]): boolean {
  if (chips.length === 0) return false;
  if (!hasIncomeSource(chips)) return false;
  if (chips.includes("home_loan") && !chips.includes("rent_received")) {
    return false;
  }
  if (chips.includes("business_presumptive") && chips.includes("freelance")) {
    return false;
  }
  return true;
}

function enumerateChipCombos(): string[][] {
  const combos: string[][] = [];
  const n = CHIP_IDS.length;
  for (let mask = 1; mask < 1 << n; mask++) {
    const chips: string[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) chips.push(CHIP_IDS[i]);
    }
    if (isChipComboValid(chips)) combos.push(chips);
  }
  return combos;
}

function salaryForTier(tier: number, chips: string[]): number {
  if (!chips.includes("salary") && !chips.includes("pension")) return 0;
  return tier;
}

function tdsForSalary(gross: number): number {
  if (gross <= 0) return 0;
  return Math.round(gross * 0.1);
}

function fdInterestForChips(chips: string[], tier: number): number {
  if (!chips.includes("fd_interest")) return 0;
  return tier > 0 ? Math.min(80_000, Math.round(tier * 0.05)) : 5_000;
}

function matrixForChips(
  chips: string[],
  salaryTier: number
): { income: IncomeBand; age: AgeBand; business: BusinessType } {
  let business: BusinessType = "x";
  if (chips.includes("business_presumptive") || chips.includes("freelance")) {
    business = "w";
  } else if (chips.includes("capital_gains")) {
    business = "z";
  } else if (chips.includes("foreign") || chips.includes("director")) {
    business = "z";
  }
  const income = salaryTier > 0 ? incomeBandFromGross(salaryTier) : ("2" as IncomeBand);
  return { income, age: "a", business };
}

function buildDraftSlice(
  chips: string[],
  salaryTier: number,
  ageBand: (typeof AGE_BANDS)[number],
  deductionIdx: number,
  houseIdx: number,
  filingMode: "estimate" | "exact",
  connectors: string[]
): DraftSlice {
  const gross = salaryForTier(salaryTier, chips);
  const matrix = matrixForChips(chips, salaryTier);
  const house = HOUSE_PRESETS[houseIdx];

  return {
    filingMode,
    profile: {
      assessmentYear: "AY 2026-27 (FY 2025-26)",
      residentialStatus: "resident",
      ageBand,
    },
    matrix,
    incomeChips: [...chips],
    income: {
      grossSalary: gross,
      tds: tdsForSalary(gross),
      fdInterest: fdInterestForChips(chips, salaryTier),
      employer: gross > 0 ? "Simulation Employer" : "",
      advanceTax: gross > 1_000_000 ? 20_000 : 0,
      selfAssessmentTax: 0,
      hraReceived: chips.includes("salary") && salaryTier > 500_000 ? 120_000 : 0,
      actualRentPaid: chips.includes("salary") && salaryTier > 500_000 ? 96_000 : 0,
      cityTier: "metro",
    },
    houseProperty: {
      ...house,
      coOwnerPercent: 100,
    },
    deductions: { ...DEDUCTION_PRESETS[deductionIdx] },
    connectedConnectors: connectors,
  };
}

function expectedFormForDraft(draft: DraftSlice): string | undefined {
  const rec = resolveRecommendedForm(
    draft.matrix,
    new Set(draft.incomeChips),
    draft.income.grossSalary
  );
  if (rec.form === "BLOCK") return undefined;
  return rec.form;
}

/**
 * Generate pruned combinatorial filing scenarios up to `limit` (default 9999).
 */
export function generateScenarios(limit = MAX_SCENARIO_COUNT): SimulationScenario[] {
  const chipCombos = enumerateChipCombos();
  const scenarios: SimulationScenario[] = [];
  let seq = 0;

  outer: for (const chips of chipCombos) {
    for (const salaryTier of SALARY_TIERS) {
      for (const ageBand of AGE_BANDS) {
        for (let d = 0; d < DEDUCTION_PRESETS.length; d++) {
          for (let h = 0; h < HOUSE_PRESETS.length; h++) {
            for (const filingMode of ["estimate", "exact"] as const) {
              for (const hasForm16 of [false, true]) {
                if (scenarios.length >= limit) break outer;

                const connectors = hasForm16 ? ["form16"] : [];
                const draftSlice = buildDraftSlice(
                  chips,
                  salaryTier,
                  ageBand,
                  d,
                  h,
                  filingMode,
                  connectors
                );

                seq += 1;
                scenarios.push({
                  id: `S${String(seq).padStart(5, "0")}`,
                  name: `${chips.join("+")} ₹${salaryTier} ${ageBand} d${d} h${h}`,
                  draftSlice,
                  expected: {
                    noThrow: true,
                    itrForm: expectedFormForDraft(draftSlice),
                  },
                });
              }
            }
          }
        }
      }
    }
  }

  return scenarios;
}

/** ITR-3 matrix-only scenarios (books business, not chip-driven). */
export function generateItr3MatrixScenarios(): SimulationScenario[] {
  const scenarios: SimulationScenario[] = [];
  let seq = 0;

  for (const income of MATRIX_INCOMES) {
    for (const age of MATRIX_AGES) {
      for (const salaryTier of [0, 600_000, 1_500_000]) {
        seq += 1;
        const draftSlice: DraftSlice = {
          filingMode: "estimate",
          profile: {
            assessmentYear: "AY 2026-27 (FY 2025-26)",
            residentialStatus: "resident",
            ageBand: age === "b" || age === "c" ? "senior" : "under_60",
          },
          matrix: { income, age, business: "v" },
          incomeChips: ["salary", "freelance"],
          income: {
            grossSalary: salaryTier,
            tds: tdsForSalary(salaryTier),
            fdInterest: 10_000,
            employer: "Books Corp",
            advanceTax: 0,
            selfAssessmentTax: 0,
            hraReceived: 0,
            actualRentPaid: 0,
            cityTier: "metro",
          },
          houseProperty: {
            propertyType: "none",
            annualRent: 0,
            homeLoanInterest: 0,
            municipalTax: 0,
            coOwnerPercent: 100,
          },
          deductions: DEDUCTION_PRESETS[2],
          connectedConnectors: [],
        };

        scenarios.push({
          id: `ITR3-${String(seq).padStart(3, "0")}`,
          name: `ITR-3 matrix ${income}${age} ₹${salaryTier}`,
          draftSlice,
          expected: { noThrow: true, itrForm: "ITR-3" },
        });
      }
    }
  }

  return scenarios;
}

export function getScenarioCount(): number {
  return generateScenarios().length + generateItr3MatrixScenarios().length;
}
