import type { BusinessType } from "@/lib/filing/case-matrix";
import { incomeBandFromGross } from "@/lib/filing/case-matrix";
import type {
  CarryForwardDraft,
  DepreciationBlockDraft,
  DraftState,
  ExtraPropertyDraft,
  HousePropertyDraft,
} from "@/lib/store/draft";
import type {
  BroughtForwardLossesInput,
  BusinessInput,
  CapitalGainsInput,
  HousePropertyInput,
  ProfileFlags,
  UserInput,
} from "./types";

const CAP_80TTB = 50_000;

function ageFromBand(band: DraftState["profile"]["ageBand"]): number {
  switch (band) {
    case "senior":
      return 65;
    case "super_senior":
      return 82;
    default:
      return 32;
  }
}

function incomeBandFromMatrix(
  band: DraftState["matrix"]["income"],
  grossSalary: number
): 1 | 2 | 3 | 4 | 5 {
  const fromMatrix = Number(band);
  const matrixBand =
    fromMatrix >= 1 && fromMatrix <= 5 ? (fromMatrix as 1 | 2 | 3 | 4 | 5) : 2;
  if (grossSalary <= 0) return matrixBand;
  const fromSalary = Number(incomeBandFromGross(grossSalary)) as 1 | 2 | 3 | 4 | 5;
  return fromSalary > matrixBand ? fromSalary : matrixBand;
}

function isSeniorAgeBand(band: DraftState["profile"]["ageBand"]): boolean {
  return band === "senior" || band === "super_senior";
}

function scaleByOwnership(amount: number, coOwnerPercent: number): number {
  const share = Math.min(100, Math.max(1, coOwnerPercent || 100)) / 100;
  return Math.round(amount * share);
}

function businessTypeCodeFromDraft(
  matrixBusiness: BusinessType,
  incomeChips: string[]
): BusinessType {
  if (matrixBusiness !== "x") return matrixBusiness;
  if (
    incomeChips.includes("freelance") ||
    incomeChips.includes("business_presumptive")
  ) {
    return "w";
  }
  if (incomeChips.includes("capital_gains")) {
    return "z";
  }
  return matrixBusiness;
}

function depreciationBlocksFromDraft(
  blocks: DepreciationBlockDraft[] | undefined
): BusinessInput["depreciation_blocks"] {
  if (!blocks?.length) return undefined;
  return blocks
    .filter((b) => b.openingWdv > 0 || b.additionsFullYear > 0 || b.additionsHalfYear > 0)
    .map((b) => ({
      block: b.label || "plant_machinery_15",
      rate: b.rate,
      opening_wdv: b.openingWdv,
      additions_180d_plus: b.additionsFullYear,
      additions_under_180d: b.additionsHalfYear,
      sale_proceeds: b.saleProceeds,
    }));
}

function businessFromChips(
  matrixBusiness: BusinessType,
  incomeChips: string[],
  income: DraftState["income"],
  depreciationBlocks?: DepreciationBlockDraft[]
): BusinessInput | undefined {
  if (incomeChips.includes("fno")) {
    const turnover = income.fnoTurnover ?? 0;
    const nonSpec = income.fnoNonSpeculativeProfit ?? 0;
    const spec = income.fnoSpeculativeProfit ?? 0;
    if (turnover > 0 || nonSpec !== 0 || spec !== 0) {
      return {
        business_type: "regular_books",
        actual_gross_receipts: Math.max(0, nonSpec) + Math.max(0, spec),
        actual_expenses: Math.max(0, -nonSpec) + Math.max(0, -spec),
        fno_turnover: turnover,
        fno_non_speculative_profit: nonSpec,
        fno_speculative_profit: spec,
      };
    }
  }
  if (matrixBusiness === "v") {
    const receipts = income.businessRevenue ?? 0;
    const expenses = income.businessExpenses ?? 0;
    const blocks = depreciationBlocksFromDraft(depreciationBlocks);
    return {
      business_type: "regular_books",
      actual_gross_receipts: receipts > 0 ? receipts : 0,
      actual_expenses: expenses,
      ...(blocks ? { depreciation_blocks: blocks } : {}),
    };
  }
  if (incomeChips.includes("business_presumptive") || matrixBusiness === "w") {
    const turnover = income.businessRevenue ?? 0;
    // Never invent turnover — route via profile_flags.business_type_code instead.
    if (turnover <= 0) return undefined;
    return {
      business_type: "presumptive_business",
      turnover,
      digital_turnover_pct: 1,
    };
  }
  if (incomeChips.includes("freelance")) {
    const receipts = income.freelanceRevenue ?? 0;
    if (receipts <= 0) return undefined;
    return {
      business_type: "presumptive_profession",
      gross_professional_receipts: receipts,
    };
  }
  return undefined;
}

/**
 * Capital-gains chip alone must NOT invent STCG amounts.
 * Real CG amounts come from CAMS / broker extract stored on draft.capitalGains.
 */
function capitalGainsFromDraft(
  draft: { capitalGains?: DraftState["capitalGains"] | null }
): CapitalGainsInput | undefined {
  const cg = draft.capitalGains;
  if (!cg) return undefined;

  const out: CapitalGainsInput = {};
  if (cg.stcg_111a != null && cg.stcg_111a > 0) out.stcg_111a = cg.stcg_111a;
  if (cg.ltcg_112a != null && cg.ltcg_112a > 0) out.ltcg_112a = cg.ltcg_112a;
  if (cg.stcg_other != null && cg.stcg_other > 0) out.stcg_other = cg.stcg_other;
  if (cg.ltcg_other != null && cg.ltcg_other > 0) out.ltcg_other = cg.ltcg_other;
  if (cg.stcl_equity != null && cg.stcl_equity > 0) {
    out.stcl_equity = cg.stcl_equity;
  }
  if (cg.ltcl != null && cg.ltcl > 0) out.ltcl = cg.ltcl;

  return Object.keys(out).length > 0 ? out : undefined;
}

function profileFlagsFromDraft(
  matrix: DraftState["matrix"],
  incomeChips: string[],
  grossSalary: number
): ProfileFlags {
  return {
    income_band: incomeBandFromMatrix(matrix.income, grossSalary),
    business_type_code: businessTypeCodeFromDraft(matrix.business, incomeChips),
    is_director: incomeChips.includes("director"),
    has_foreign_income: incomeChips.includes("foreign"),
    has_foreign_assets: incomeChips.includes("foreign"),
  };
}

function housePropertyToInput(
  hp: HousePropertyDraft | ExtraPropertyDraft
): HousePropertyInput | undefined {
  if (hp.propertyType === "none") return undefined;

  const share = hp.coOwnerPercent;
  const principal = hp.homeLoanPrincipal ?? 0;
  if (hp.propertyType === "let_out") {
    return {
      property_type: "let_out",
      annual_rent_received: scaleByOwnership(hp.annualRent, share),
      municipal_tax: scaleByOwnership(hp.municipalTax, share),
      home_loan_interest: scaleByOwnership(hp.homeLoanInterest, share),
      ...(principal > 0
        ? { home_loan_principal: scaleByOwnership(principal, share) }
        : {}),
    };
  }

  return {
    property_type: "self_occupied",
    home_loan_interest: scaleByOwnership(hp.homeLoanInterest, share),
    ...(principal > 0
      ? { home_loan_principal: scaleByOwnership(principal, share) }
      : {}),
  };
}

function carryForwardToInput(
  cf: CarryForwardDraft | undefined
): BroughtForwardLossesInput | undefined {
  if (!cf) return undefined;
  const hasAny =
    cf.hpLoss > 0 ||
    cf.stcl > 0 ||
    cf.ltcl > 0 ||
    cf.businessLoss > 0 ||
    cf.unabsorbedDepreciation > 0;
  if (!hasAny) return undefined;
  return {
    hp_loss: cf.hpLoss,
    stcl: cf.stcl,
    ltcl: cf.ltcl,
    business_loss: cf.businessLoss,
    unabsorbed_depreciation: cf.unabsorbedDepreciation,
    prior_return_filed_on_time: cf.priorReturnOnTime,
  };
}

export function draftToUserInput(draft: Pick<
  DraftState,
  | "filingMode"
  | "profile"
  | "matrix"
  | "incomeChips"
  | "income"
  | "houseProperty"
  | "deductions"
  | "connectedConnectors"
> & Partial<Pick<
  DraftState,
  | "extraProperties"
  | "carryForward"
  | "depreciationBlocks"
  | "capitalGains"
  | "profession"
>>): UserInput {
  const age = ageFromBand(draft.profile.ageBand);
  const gross = draft.income.grossSalary;
  const basic = Math.round(gross * 0.5);
  const hasForm16 = draft.connectedConnectors.includes("form16");
  const fdInterest = draft.income.fdInterest;

  const employerCount = draft.income.employers?.length ?? 0;
  const salary: UserInput["salary"] = {
    gross_salary: gross,
    basic_salary: basic,
    // Multiple Form 16s: engine still applies one std deduction; flag for Form 12B.
    ...(employerCount > 1 ? { multiple_employers: true } : {}),
  };
  if (draft.income.hraReceived > 0) {
    salary.hra_received = draft.income.hraReceived;
  }
  if (draft.income.actualRentPaid > 0) {
    salary.actual_rent_paid = draft.income.actualRentPaid;
    salary.city_tier = draft.income.cityTier;
  }

  const deductions: UserInput["deductions"] = {
    epf: draft.deductions.section80C,
    health_insurance_self: draft.deductions.section80D,
    nps_self: draft.deductions.npsExtra,
  };

  if (draft.deductions.section80GG > 0) {
    deductions.rent_paid_no_hra = draft.deductions.section80GG;
  }

  if (isSeniorAgeBand(draft.profile.ageBand) && fdInterest > 0) {
    deductions.savings_interest_deduction = Math.min(fdInterest, CAP_80TTB);
  }

  const primaryHp = housePropertyToInput(draft.houseProperty);
  const extras = (draft.extraProperties ?? [])
    .map(housePropertyToInput)
    .filter((p): p is HousePropertyInput => p !== undefined);
  // Portfolio path when 2+ properties; otherwise keep the single-property field.
  const usePortfolio = primaryHp !== undefined && extras.length > 0;
  const houseProperties = usePortfolio && primaryHp
    ? [primaryHp, ...extras]
    : undefined;
  const housePropertyInput = usePortfolio ? undefined : primaryHp;

  const capitalGainsInput = capitalGainsFromDraft(draft);
  const businessInput = businessFromChips(
    draft.matrix.business,
    draft.incomeChips,
    draft.income,
    draft.depreciationBlocks
  );
  if (businessInput && draft.profession) {
    businessInput.profession_name = draft.profession;
  }
  const carryForwardInput = carryForwardToInput(draft.carryForward);
  const profileFlags = profileFlagsFromDraft(
    draft.matrix,
    draft.incomeChips,
    draft.income.grossSalary
  );

  // Home-loan principal from primary property also feeds the 80C pool.
  const principal80c = draft.houseProperty.homeLoanPrincipal ?? 0;
  if (principal80c > 0 && (deductions.home_loan_principal ?? 0) === 0) {
    deductions.home_loan_principal = principal80c;
  }

  return {
    age,
    mode: draft.filingMode,
    residential_status:
      draft.profile.residentialStatus === "non_resident" ? "nri" : draft.profile.residentialStatus,
    assessment_year: "2026-27",
    late_filing: draft.profile.lateFiling ?? false,
    salary,
    ...(housePropertyInput ? { house_property: housePropertyInput } : {}),
    ...(houseProperties ? { house_properties: houseProperties } : {}),
    ...(capitalGainsInput ? { capital_gains: capitalGainsInput } : {}),
    ...(carryForwardInput ? { carry_forward: carryForwardInput } : {}),
    ...(businessInput ? { business: businessInput } : {}),
    other_income: {
      fd_interest: fdInterest,
    },
    deductions,
    taxes_paid: {
      tds_salary: draft.income.tds,
      advance_tax_paid: draft.income.advanceTax,
      self_assessment_tax_paid: draft.income.selfAssessmentTax,
    },
    profile_flags: profileFlags,
    documents: {
      has_form16: hasForm16,
      ...(draft.incomeChips.includes("capital_gains") || draft.capitalGains
        ? { has_capital_gains_statement: true }
        : {}),
    },
  };
}
