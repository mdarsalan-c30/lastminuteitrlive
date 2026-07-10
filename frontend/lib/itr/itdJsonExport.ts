import type { ITRResult, UserInput } from "@/lib/engine/types";

export interface Itr1ExportPayload {
  schemaVersion:
    | "AY2026_27_ITR1_FOUNDATION"
    | "AY2026_27_ITR2_FOUNDATION"
    | "AY2026_27_ITR3_FOUNDATION"
    | "AY2026_27_ITR4_FOUNDATION";
  generatedBy: "LastMinute ITR";
  disclaimer: string;
  assessmentYear: string;
  form: "ITR-1" | "ITR-2" | "ITR-3" | "ITR-4";
  personalInfo: {
    residentialStatus: string;
    age: number;
  };
  income: {
    salary: number;
    houseProperty: number;
    otherSources: number;
    grossTotalIncome: number;
  };
  deductions: {
    section80C: number;
    section80D: number;
    section80CCD1B: number;
    section80CCD2: number;
    section80E: number;
    section80G: number;
    section80GG: number;
    section80TTAOrTTB: number;
    totalChapterVIA: number;
  };
  tax: {
    regime: "old" | "new";
    taxableIncome: number;
    totalTax: number;
    tdsAndAdvanceTax: number;
    netPayable: number;
  };
  validation: {
    blocking: string[];
    warnings: string[];
  };
}

export interface Itr2ExportPayload extends Itr1ExportPayload {
  form: "ITR-2";
  schemaVersion: "AY2026_27_ITR2_FOUNDATION";
  capitalGains: {
    stcg111a: number;
    stcgOther: number;
    ltcg112a: number;
    ltcgOther: number;
  };
  houseProperties: {
    count: number;
    netIncome: number;
  };
  carryForward: {
    hpLoss: number;
    stcl: number;
    ltcl: number;
  };
}

export interface Itr3ExportPayload extends Omit<Itr2ExportPayload, "form" | "schemaVersion" | "carryForward"> {
  form: "ITR-3";
  schemaVersion: "AY2026_27_ITR3_FOUNDATION";
  business: {
    sectionUsed: string;
    booksProfit: number;
    netBusinessIncome: number;
    depreciationAllowed: number;
    depreciationBlocks: Array<{
      block: string;
      rate: number;
      openingWdv: number;
    }>;
    fno: {
      turnover: number;
      nonSpeculativeProfit: number;
      speculativeProfit: number;
      auditFlag10Cr: boolean;
    };
  };
  carryForward: {
    hpLoss: number;
    stcl: number;
    ltcl: number;
    businessLoss: number;
    unabsorbedDepreciation: number;
  };
}

export interface Itr4ExportPayload extends Itr1ExportPayload {
  form: "ITR-4";
  schemaVersion: "AY2026_27_ITR4_FOUNDATION";
  presumptive: {
    sectionUsed: string;
    eligible: boolean;
    turnover: number;
    digitalTurnoverPct: number;
    grossProfessionalReceipts: number;
    presumptive44ad: number;
    presumptive44ada: number;
    netBusinessIncome: number;
  };
}

/** F&O digital-books audit consideration threshold (₹10 crore). */
const FNO_AUDIT_TURNOVER = 10_00_00_000;

export function buildItr1Export(input: {
  userInput: UserInput;
  result: ITRResult;
}): Itr1ExportPayload {
  const { userInput, result } = input;
  const regime = result.regime_comparison.recommended_regime;
  const slab = result.regime_comparison[regime];

  const blocking: string[] = [];
  if (result.profile.itr_form !== "ITR-1") {
    blocking.push(`Engine routed this case to ${result.profile.itr_form}, not ITR-1.`);
  }
  if (result.risk_flags.some((flag) => flag.severity === "error")) {
    blocking.push("Resolve blocking risk flags before export.");
  }

  const warnings = result.risk_flags
    .filter((flag) => flag.severity !== "error")
    .map((flag) => flag.message);

  return {
    schemaVersion: "AY2026_27_ITR1_FOUNDATION",
    generatedBy: "LastMinute ITR",
    disclaimer:
      "Foundation export for portal mapping. User must preview, verify, submit, and e-verify on incometax.gov.in.",
    assessmentYear: result.assessment_year,
    form: "ITR-1",
    personalInfo: {
      residentialStatus: userInput.residential_status ?? "resident",
      age: userInput.age,
    },
    income: {
      salary: result.income_heads.net_salary_income,
      houseProperty: result.income_heads.net_house_property_income,
      otherSources: result.income_heads.total_other_income,
      grossTotalIncome: result.income_heads.gross_total_income,
    },
    deductions: {
      section80C: result.deductions.capped_80c,
      section80D: result.deductions.deduction_80d,
      section80CCD1B: result.deductions.deduction_80ccd_1b,
      section80CCD2: result.deductions.deduction_80ccd_2,
      section80E: result.deductions.deduction_80e,
      section80G: result.deductions.deduction_80g,
      section80GG: result.deductions.deduction_80gg,
      section80TTAOrTTB: result.deductions.deduction_80tta_ttb,
      totalChapterVIA: result.deductions.total_chapter_via,
    },
    tax: {
      regime,
      taxableIncome: slab.taxable_income,
      totalTax: slab.total_tax,
      tdsAndAdvanceTax: slab.tds_and_advance_tax,
      netPayable: slab.net_payable,
    },
    validation: {
      blocking,
      warnings,
    },
  };
}

export function buildItr2Export(input: {
  userInput: UserInput;
  result: ITRResult;
}): Itr2ExportPayload {
  const base = buildItr1Export(input);
  const { userInput, result } = input;
  const blocking = [...base.validation.blocking].filter(
    (message) => !message.includes("not ITR-1")
  );

  if (result.profile.itr_form !== "ITR-2") {
    blocking.push(`Engine routed this case to ${result.profile.itr_form}, not ITR-2.`);
  }

  return {
    ...base,
    schemaVersion: "AY2026_27_ITR2_FOUNDATION",
    form: "ITR-2",
    capitalGains: {
      stcg111a: result.income_heads.stcg_111a_net,
      stcgOther: result.income_heads.stcg_other_slab,
      ltcg112a: result.income_heads.ltcg_112a_net,
      ltcgOther: result.income_heads.ltcg_other_net,
    },
    houseProperties: {
      count: userInput.house_properties?.length ?? 0,
      netIncome: result.income_heads.net_house_property_income,
    },
    carryForward: {
      hpLoss: result.income_heads.losses_carried_forward?.hp ?? 0,
      stcl: result.income_heads.losses_carried_forward?.stcl ?? 0,
      ltcl: result.income_heads.losses_carried_forward?.ltcl ?? 0,
    },
    validation: {
      ...base.validation,
      blocking,
    },
  };
}

export function buildItr3Export(input: {
  userInput: UserInput;
  result: ITRResult;
}): Itr3ExportPayload {
  const itr2 = buildItr2Export(input);
  const { userInput, result } = input;
  const biz = userInput.business;

  const blocking = itr2.validation.blocking.filter(
    (message) => !message.includes("not ITR-2")
  );
  if (result.profile.itr_form !== "ITR-3") {
    blocking.push(`Engine routed this case to ${result.profile.itr_form}, not ITR-3.`);
  }

  const fnoTurnover = biz?.fno_turnover ?? 0;
  const warnings = [...itr2.validation.warnings];
  if (fnoTurnover > FNO_AUDIT_TURNOVER) {
    warnings.push(
      "F&O turnover is above ₹10 crore — a tax audit (Section 44AB) is likely required. Confirm with a CA before filing."
    );
  }

  return {
    ...itr2,
    form: "ITR-3",
    schemaVersion: "AY2026_27_ITR3_FOUNDATION",
    business: {
      sectionUsed: result.business_income.section_used,
      booksProfit: result.business_income.books_profit,
      netBusinessIncome: result.business_income.net_business_income,
      depreciationAllowed: result.income_heads.depreciation_allowed ?? 0,
      depreciationBlocks: (biz?.depreciation_blocks ?? []).map((block) => ({
        block: block.block,
        rate: block.rate,
        openingWdv: block.opening_wdv ?? 0,
      })),
      fno: {
        turnover: fnoTurnover,
        nonSpeculativeProfit: biz?.fno_non_speculative_profit ?? 0,
        speculativeProfit: biz?.fno_speculative_profit ?? 0,
        auditFlag10Cr: fnoTurnover > FNO_AUDIT_TURNOVER,
      },
    },
    carryForward: {
      hpLoss: result.income_heads.losses_carried_forward?.hp ?? 0,
      stcl: result.income_heads.losses_carried_forward?.stcl ?? 0,
      ltcl: result.income_heads.losses_carried_forward?.ltcl ?? 0,
      businessLoss: result.income_heads.losses_carried_forward?.business ?? 0,
      unabsorbedDepreciation:
        result.income_heads.losses_carried_forward?.unabsorbed_depreciation ?? 0,
    },
    validation: {
      blocking,
      warnings,
    },
  };
}

export function buildItr4Export(input: {
  userInput: UserInput;
  result: ITRResult;
}): Itr4ExportPayload {
  const base = buildItr1Export(input);
  const { userInput, result } = input;
  const biz = userInput.business;

  const blocking = base.validation.blocking.filter(
    (message) => !message.includes("not ITR-1")
  );
  if (result.profile.itr_form !== "ITR-4") {
    blocking.push(`Engine routed this case to ${result.profile.itr_form}, not ITR-4.`);
  }

  const hasCapitalGains =
    result.income_heads.stcg_111a_net > 0 ||
    result.income_heads.stcg_other_slab > 0 ||
    result.income_heads.ltcg_112a_net > 0 ||
    result.income_heads.ltcg_other_net > 0;
  if (hasCapitalGains) {
    blocking.push(
      "Capital gains are not allowed in ITR-4. Use ITR-3 (with business) or ITR-2 instead."
    );
  }

  return {
    ...base,
    form: "ITR-4",
    schemaVersion: "AY2026_27_ITR4_FOUNDATION",
    presumptive: {
      sectionUsed: result.business_income.section_used,
      eligible: result.business_income.presumptive_eligible,
      turnover: biz?.turnover ?? 0,
      digitalTurnoverPct: biz?.digital_turnover_pct ?? 0,
      grossProfessionalReceipts: biz?.gross_professional_receipts ?? 0,
      presumptive44ad: result.business_income.presumptive_44ad,
      presumptive44ada: result.business_income.presumptive_44ada,
      netBusinessIncome: result.business_income.net_business_income,
    },
    validation: {
      blocking,
      warnings: base.validation.warnings,
    },
  };
}
