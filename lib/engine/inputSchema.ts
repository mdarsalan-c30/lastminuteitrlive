import { z } from "zod";
import type { UserInput } from "./types";

const taxRegimeSchema = z.enum(["old", "new"]);
const filingModeSchema = z.enum(["estimate", "exact"]);
const residentialStatusSchema = z.enum(["resident", "nri", "rnor"]);
const cityTierSchema = z.enum(["metro", "non_metro"]);
const propertyTypeSchema = z.enum(["self_occupied", "let_out", "none"]);
const businessTypeSchema = z.enum([
  "none",
  "presumptive_business",
  "presumptive_profession",
  "regular_books",
]);
const incomeBandSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
const businessTypeCodeSchema = z.enum(["x", "y", "z", "w", "v"]);

export const salaryInputSchema = z.object({
  gross_salary: z.number().min(0),
  basic_salary: z.number().min(0),
  hra_received: z.number().min(0).optional(),
  actual_rent_paid: z.number().min(0).optional(),
  city_tier: cityTierSchema.optional(),
  professional_tax: z.number().min(0).optional(),
  lta_claimed: z.number().min(0).optional(),
  perquisites_taxable: z.number().min(0).optional(),
  multiple_employers: z.boolean().optional(),
  employer_nps_contribution: z.number().min(0).optional(),
});

export const housePropertyInputSchema = z.object({
  property_type: propertyTypeSchema.optional(),
  annual_rent_received: z.number().min(0).optional(),
  municipal_tax: z.number().min(0).optional(),
  home_loan_interest: z.number().min(0).optional(),
  home_loan_principal: z.number().min(0).optional(),
  pre_construction_interest: z.number().min(0).optional(),
});

export const otherIncomeInputSchema = z.object({
  fd_interest: z.number().min(0).optional(),
  savings_account_interest: z.number().min(0).optional(),
  dividend_income: z.number().min(0).optional(),
});

export const capitalGainsInputSchema = z.object({
  stcg_111a: z.number().optional(),
  ltcg_112a: z.number().optional(),
  stcg_other: z.number().optional(),
  ltcg_other: z.number().optional(),
  stcl_equity: z.number().optional(),
  ltcl: z.number().optional(),
});

export const deductionsInputSchema = z.object({
  epf: z.number().min(0).optional(),
  ppf: z.number().min(0).optional(),
  elss: z.number().min(0).optional(),
  lic_premium: z.number().min(0).optional(),
  nsc: z.number().min(0).optional(),
  home_loan_principal: z.number().min(0).optional(),
  tuition_fees: z.number().min(0).optional(),
  other_80c: z.number().min(0).optional(),
  health_insurance_self: z.number().min(0).optional(),
  health_insurance_parents: z.number().min(0).optional(),
  parents_senior: z.boolean().optional(),
  nps_self: z.number().min(0).optional(),
  education_loan_interest: z.number().min(0).optional(),
  rent_paid_no_hra: z.number().min(0).optional(),
  donations_100pct: z.number().min(0).optional(),
  donations_50pct: z.number().min(0).optional(),
  savings_interest_deduction: z.number().min(0).optional(),
  self_disability: z.boolean().optional(),
  disability_severe: z.boolean().optional(),
});

export const taxPaidInputSchema = z.object({
  tds_salary: z.number().min(0).optional(),
  tds_other: z.number().min(0).optional(),
  advance_tax_paid: z.number().min(0).optional(),
  self_assessment_tax_paid: z.number().min(0).optional(),
});

export const businessInputSchema = z.object({
  business_type: businessTypeSchema.optional(),
  turnover: z.number().min(0).optional(),
  digital_turnover_pct: z.number().min(0).max(1).optional(),
  gross_professional_receipts: z.number().min(0).optional(),
  actual_gross_receipts: z.number().min(0).optional(),
  actual_expenses: z.number().min(0).optional(),
  profession_name: z.string().optional(),
  cash_receipts_pct: z.number().min(0).max(1).optional(),
});

export const profileFlagsSchema = z.object({
  income_band: incomeBandSchema.optional(),
  business_type_code: businessTypeCodeSchema.optional(),
  is_director: z.boolean().optional(),
  has_unlisted_equity: z.boolean().optional(),
  has_foreign_income: z.boolean().optional(),
  has_foreign_assets: z.boolean().optional(),
  tds_deducted_194n: z.boolean().optional(),
  esop_tax_deferred: z.boolean().optional(),
  agricultural_income: z.number().min(0).optional(),
});

export const documentFlagsSchema = z.object({
  has_form16: z.boolean().optional(),
  has_ais: z.boolean().optional(),
  has_form26as: z.boolean().optional(),
  has_bank_interest_cert: z.boolean().optional(),
  has_home_loan_cert: z.boolean().optional(),
  has_capital_gains_statement: z.boolean().optional(),
});

export const userInputSchema = z.object({
  age: z.number().int().min(0).max(120),
  residential_status: residentialStatusSchema.optional(),
  assessment_year: z.string().optional(),
  mode: filingModeSchema.optional(),
  salary: salaryInputSchema.optional(),
  house_property: housePropertyInputSchema.optional(),
  other_income: otherIncomeInputSchema.optional(),
  capital_gains: capitalGainsInputSchema.optional(),
  deductions: deductionsInputSchema.optional(),
  taxes_paid: taxPaidInputSchema.optional(),
  business: businessInputSchema.optional(),
  profile_flags: profileFlagsSchema.optional(),
  documents: documentFlagsSchema.optional(),
});

export type ParsedUserInput = z.infer<typeof userInputSchema>;

export interface InputValidationResult {
  ok: boolean;
  data?: UserInput;
  errors?: string[];
}

export function validateUserInput(input: unknown): InputValidationResult {
  const parsed = userInputSchema.safeParse(input);
  if (parsed.success) {
    return { ok: true, data: parsed.data as UserInput };
  }
  const errors = parsed.error.issues.map(
    (issue) => `${issue.path.join(".") || "input"}: ${issue.message}`
  );
  return { ok: false, errors };
}

export function assertUserInput(input: unknown): UserInput {
  const result = validateUserInput(input);
  if (!result.ok || !result.data) {
    throw new Error(result.errors?.join("; ") ?? "Invalid user input");
  }
  return result.data;
}

/** Shallow diff of draft-derived input keys for recompute history. */
export function diffUserInputFields(
  before: UserInput,
  after: UserInput
): string[] {
  const changed: string[] = [];
  const topKeys = new Set([
    ...Object.keys(before),
    ...Object.keys(after),
  ] as Array<keyof UserInput>);

  for (const key of topKeys) {
    const b = before[key];
    const a = after[key];
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      changed.push(String(key));
    }
  }
  return changed;
}

/** Validate a draft slice before calling compute — returns human-readable gaps. */
export function validateDraftForCompute(input: UserInput): string[] {
  const gaps: string[] = [];
  if (input.age < 18) {
    gaps.push("age: taxpayer must be at least 18");
  }
  if (!input.salary?.gross_salary && input.salary?.gross_salary !== 0) {
    gaps.push("salary.gross_salary: required for salaried returns");
  }
  if (
    input.salary?.hra_received &&
    input.salary.hra_received > 0 &&
    !input.salary.actual_rent_paid
  ) {
    gaps.push("salary.actual_rent_paid: required when HRA is claimed");
  }
  if (input.mode === "exact" && !input.documents?.has_form16) {
    gaps.push("documents.has_form16: Form 16 required in exact mode");
  }
  return gaps;
}
