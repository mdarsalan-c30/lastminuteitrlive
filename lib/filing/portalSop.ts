/** Typed SOP screen schema for incometax.gov.in companion walkthrough. */

export type PortalSopFieldAction =
  | "enter"
  | "skip"
  | "deselect"
  | "select_no"
  | "verify";

export type PortalSopSkipCondition =
  | "no_capital_gains"
  | "no_business_income"
  | "no_house_property"
  | "new_regime_selected"
  | "no_foreign_income"
  | "no_salary_income"
  | "old_regime_only_deduction";

export interface PortalSopFieldHint {
  whyWeAsk: string;
  validationTips?: string[];
  screenshotRef?: string;
  itrFormCrossLink?: string;
  proofRequired?: string[];
}

export interface PortalSopField {
  id: string;
  label: string;
  engineFieldKey: string | null;
  action: PortalSopFieldAction;
  copyValue: boolean;
  plainEnglishWhy: string;
  proofRequired: string[];
  govSection?: string;
  skipWhen?: PortalSopSkipCondition;
  hint?: PortalSopFieldHint;
}

export interface PortalSopScreen {
  id: string;
  order: number;
  title: string;
  portalScreenTitle: string;
  portalPath: string;
  fields: PortalSopField[];
  warnings: string[];
  skipWhen?: PortalSopSkipCondition;
  screenTips?: string[];
  screenshotRef?: string;
}

export interface PortalSopGuide {
  form: "ITR-1" | "ITR-2" | "ITR-3" | "ITR-4";
  screens: PortalSopScreen[];
  totalScreens: number;
}

/** Draft-derived signals used to personalize companion guidance. */
export interface PortalDraftSlice {
  regime: "old" | "new" | null;
  incomeChips: string[];
  recommendedForm: string;
  mismatchResolved: boolean;
  paidPlanId?: string | null;
  paymentVerifiedAt?: number | null;
  income: {
    grossSalary: number;
  };
  houseProperty: {
    propertyType: "none" | "self_occupied" | "let_out";
  };
  deductions: {
    section80C: number;
    section80D: number;
    section80GG: number;
    npsExtra: number;
  };
}

export interface PortalPersonalizationOverlay {
  regime: "old" | "new" | null;
  incomeChips: string[];
  deductionsClaimed: string[];
  hasSalary: boolean;
  hasCapitalGains: boolean;
  hasBusinessIncome: boolean;
  hasHouseProperty: boolean;
  hasForeignIncome: boolean;
  paymentUnlocked: boolean;
  mismatchResolved: boolean;
  recommendedForm: string;
  personalizedTips: string[];
}

export interface PortalPersonalizedFieldOverlay {
  personalizedWhy?: string;
  validationTips?: string[];
  hidden?: boolean;
  emphasized?: boolean;
}
