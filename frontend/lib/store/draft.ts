"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlanId } from "@/lib/filing/types";
import {
  DRAFT_STORAGE_KEY,
  ensureFreshBrowserSession,
} from "@/lib/store/sessionInit";
import type { AgeBand, BusinessType, IncomeBand } from "@/lib/filing/case-matrix";
import {
  aggregateEmployers,
  makeEmployerId,
  type EmployerForm16,
} from "@/lib/filing/employers";

export interface Profile {
  assessmentYear: string;
  residentialStatus: "resident" | "non_resident" | "rnor";
  ageBand: "under_60" | "senior" | "super_senior";
  lateFiling?: boolean;
}

export interface IncomeDraft {
  grossSalary: number;
  tds: number;
  fdInterest: number;
  employer: string;
  advanceTax: number;
  selfAssessmentTax: number;
  /** Form 16 Part B — HRA received (Sec 10(13A)) */
  hraReceived: number;
  /** Annual rent paid — used for HRA exemption in old regime */
  actualRentPaid: number;
  cityTier: "metro" | "non_metro";
  /**
   * Per-employer Form 16 entries for job-change scenarios. When non-empty,
   * grossSalary and tds above hold the aggregate across all employers.
   * Optional so older persisted drafts and fixtures remain valid.
   */
  employers?: EmployerForm16[];
  
  /** Business / Freelance Fields */
  businessRevenue?: number;
  businessExpenses?: number;
  freelanceRevenue?: number;
  freelanceExpenses?: number;
  otherIncome?: number;
  /** F&O absolute turnover (abs P + abs L + options premium). */
  fnoTurnover?: number;
  /** Non-speculative F&O P&L (Schedule BP). */
  fnoNonSpeculativeProfit?: number;
  /** Speculative / intraday P&L — isolated set-off bucket. */
  fnoSpeculativeProfit?: number;
}

export interface HousePropertyDraft {
  propertyType: "none" | "self_occupied" | "let_out";
  annualRent: number;
  homeLoanInterest: number;
  municipalTax: number;
  coOwnerPercent: number;
  /** Principal repaid this year — feeds 80C when set. */
  homeLoanPrincipal?: number;
}

/** Extra properties beyond the primary (ITR-2/3 portfolio). */
export type ExtraPropertyDraft = HousePropertyDraft;

/** Prior-year losses from last ITR Schedule CFL — plain amounts only. */
export interface CarryForwardDraft {
  hpLoss: number;
  stcl: number;
  ltcl: number;
  businessLoss: number;
  unabsorbedDepreciation: number;
  /** False if the loss-year return was filed after the due date (Sec 80). */
  priorReturnOnTime: boolean;
}

/** One WDV block for books cases — user enters opening WDV + rate. */
export interface DepreciationBlockDraft {
  id: string;
  label: string;
  rate: number;
  openingWdv: number;
  additionsFullYear: number;
  additionsHalfYear: number;
  saleProceeds: number;
}

export interface DeductionDraft {
  section80C: number;
  section80D: number;
  section80GG: number;
  npsExtra: number;
}

export type FieldConfidence = "high" | "review" | "missing";
export type ParseMode = "extracted" | "demo_fallback";

/** AIS / 26AS figures extracted from documents — never invent sample amounts. */
export interface AisFigures {
  grossSalary?: number;
  tds?: number;
  fdInterest?: number;
}

/** Capital gains from CAMS / broker P&L — losses stored as positive stcl/ltcl. */
export interface CapitalGainsDraft {
  stcg_111a?: number;
  ltcg_112a?: number;
  stcg_other?: number;
  ltcg_other?: number;
  stcl_equity?: number;
  ltcl?: number;
  sourceConnectorId?: string;
}

export interface DocumentFactDraft {
  key: string;
  label: string;
  value: string | number | boolean;
  confidence?: number;
  sourceConnectorId?: string;
}

export interface LastParseResult {
  connectorId: string;
  mode: ParseMode;
  fieldConfidence: Record<string, FieldConfidence>;
  warnings: string[];
  demo: boolean;
  filename?: string;
  filenames?: string[];
  parsedParts?: Array<{ name: string; partKind: string }>;
  parsedAt?: string;
}

export type EnginePhase =
  | "inputs"
  | "computed"
  | "questioning"
  | "recomputed"
  | "recommended"
  | "filing";

/** Retention loop (doc 21 FILED / VERIFIED / LAPSED). */
export type FilingOutcomeStatus = "none" | "filed" | "verified" | "lapsed";

export interface FilingOutcome {
  status: FilingOutcomeStatus;
  acknowledgementNumber: string;
  submittedAt: number | null;
  eVerifiedAt: number | null;
  reminderOptIn: boolean;
}

export interface ComputeHistoryEntry {
  trigger: string;
  beforeSnapshot: unknown;
  afterSnapshot: unknown;
  changedFields: string[];
}

export interface DraftState {
  name: string;
  filingMode: "estimate" | "exact";
  filingPath: "simple" | "cabrain";
  profile: Profile;
  matrix: { income: IncomeBand; age: AgeBand; business: BusinessType };
  incomeChips: string[];
  recommendedForm: string;
  caseId: string;
  itrConfirmed: boolean;
  income: IncomeDraft;
  houseProperty: HousePropertyDraft;
  /** Second+ properties (primary stays in houseProperty). */
  extraProperties: ExtraPropertyDraft[];
  carryForward: CarryForwardDraft;
  depreciationBlocks: DepreciationBlockDraft[];
  deductions: DeductionDraft;
  regime: "old" | "new" | null;
  profession: string | null;
  plan: PlanId;
  paidPlanId: PlanId | null;
  paymentVerifiedAt: number | null;
  mismatchResolved: boolean;
  mismatchProceedWithExplanation: boolean;
  consentGiven: boolean;
  eVerifyMethod: string | null;
  bankValidated: boolean;
  seniorMode: boolean;
  connectedConnectors: string[];
  /** Real AIS figures when imported — undefined means not imported. */
  aisFigures: AisFigures | null;
  /** Real CG figures from CAMS / broker statements — never invent sample amounts. */
  capitalGains: CapitalGainsDraft | null;
  /** Facts extracted via document AI pipeline for reconcile. */
  documentFacts: DocumentFactDraft[];
  lastParseResult: LastParseResult | null;
  engineRecommendationCount: number;
  questionAnswers: Record<string, unknown>;
  computeHistory: ComputeHistoryEntry[];
  enginePhase: EnginePhase;
  filingOutcome: FilingOutcome;

  setName: (name: string) => void;
  setFilingMode: (mode: "estimate" | "exact") => void;
  setFilingPath: (path: "simple" | "cabrain") => void;
  setProfile: (profile: Partial<Profile>) => void;
  setMatrix: (matrix: Partial<DraftState["matrix"]>) => void;
  toggleIncomeChip: (chip: string) => void;
  ensureIncomeChip: (chip: string) => void;
  setRecommendedForm: (form: string, caseId: string) => void;
  setItrConfirmed: (confirmed: boolean) => void;
  setIncome: (income: Partial<IncomeDraft>) => void;
  /** Seed the employers list from the currently parsed single Form 16. */
  seedPrimaryEmployer: () => void;
  /** Append a Form 16 from another employer (job change) and re-aggregate. */
  addEmployerForm16: (input: { name: string; grossSalary: number; tds: number }) => void;
  /** Remove an employer entry and re-aggregate salary/TDS. */
  removeEmployerForm16: (id: string) => void;
  setHouseProperty: (houseProperty: Partial<HousePropertyDraft>) => void;
  setExtraProperties: (properties: ExtraPropertyDraft[]) => void;
  addExtraProperty: (property?: Partial<ExtraPropertyDraft>) => void;
  removeExtraProperty: (index: number) => void;
  setCarryForward: (carryForward: Partial<CarryForwardDraft>) => void;
  setDepreciationBlocks: (blocks: DepreciationBlockDraft[]) => void;
  setDeductions: (deductions: Partial<DeductionDraft>) => void;
  setRegime: (regime: "old" | "new") => void;
  setProfession: (profession: string | null) => void;
  setPlan: (plan: PlanId) => void;
  setPaymentVerified: (planId: PlanId) => void;
  setMismatchResolved: (resolved: boolean) => void;
  setMismatchProceedWithExplanation: (proceeded: boolean) => void;
  setConsentGiven: (given: boolean) => void;
  setEVerifyMethod: (method: string) => void;
  setBankValidated: (validated: boolean) => void;
  setSeniorMode: (enabled: boolean) => void;
  setConnectorConnected: (connectorId: string) => void;
  setAisFigures: (figures: AisFigures | null) => void;
  setCapitalGains: (capitalGains: CapitalGainsDraft | null) => void;
  setDocumentFacts: (facts: DocumentFactDraft[]) => void;
  mergeDocumentFacts: (facts: DocumentFactDraft[]) => void;
  setEngineRecommendationCount: (count: number) => void;
  setQuestionAnswer: (questionId: string, answer: unknown) => void;
  appendComputeHistory: (entry: ComputeHistoryEntry) => void;
  setEnginePhase: (phase: EnginePhase) => void;
  setFilingOutcome: (outcome: Partial<FilingOutcome>) => void;
  markReturnSubmitted: (acknowledgementNumber: string) => void;
  markReturnEVerified: () => void;
  mergeParsedFields: (
    connectorId: string,
    payload: {
      fields: Record<string, string | number>;
      fieldConfidence?: Record<string, FieldConfidence>;
      parseMode?: ParseMode;
      warnings?: string[];
      demo?: boolean;
      filename?: string;
      filenames?: string[];
      parsedParts?: Array<{ name: string; partKind: string }>;
      parsedAt?: string;
      /** When true, append the parsed salary/TDS as another employer. */
      appendAsEmployer?: boolean;
    }
  ) => void;
  activeField: string | null;
  setActiveField: (field: string | null) => void;
  reset: () => void;
  resetEligibilityStep: () => void;
  resetOnboardingProfile: () => void;
}

const defaultProfile: Profile = {
  assessmentYear: "AY 2026-27 (FY 2025-26)",
  residentialStatus: "resident",
  ageBand: "under_60",
  lateFiling: false,
};

const defaultIncome: IncomeDraft = {
  grossSalary: 0,
  tds: 0,
  fdInterest: 0,
  employer: "",
  advanceTax: 0,
  selfAssessmentTax: 0,
  hraReceived: 0,
  actualRentPaid: 0,
  cityTier: "metro",
  employers: [],
  businessRevenue: 0,
  businessExpenses: 0,
  freelanceRevenue: 0,
  freelanceExpenses: 0,
  otherIncome: 0,
  fnoTurnover: 0,
  fnoNonSpeculativeProfit: 0,
  fnoSpeculativeProfit: 0,
};

const defaultHouseProperty: HousePropertyDraft = {
  propertyType: "none",
  annualRent: 0,
  homeLoanInterest: 0,
  municipalTax: 0,
  coOwnerPercent: 100,
  homeLoanPrincipal: 0,
};

const defaultCarryForward: CarryForwardDraft = {
  hpLoss: 0,
  stcl: 0,
  ltcl: 0,
  businessLoss: 0,
  unabsorbedDepreciation: 0,
  priorReturnOnTime: true,
};

const defaultDeductions: DeductionDraft = {
  section80C: 0,
  section80D: 0,
  section80GG: 0,
  npsExtra: 0,
};

const defaultFilingOutcome: FilingOutcome = {
  status: "none",
  acknowledgementNumber: "",
  submittedAt: null,
  eVerifiedAt: null,
  reminderOptIn: false,
};

/** 30 days in ms — e-verify window (doc 21 FILED). */
export const EVERIFY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function deriveFilingOutcomeStatus(
  outcome: FilingOutcome,
  nowMs: number
): FilingOutcomeStatus {
  if (outcome.status === "verified" || outcome.eVerifiedAt) return "verified";
  if (outcome.status === "none" || !outcome.submittedAt) return "none";
  if (nowMs - outcome.submittedAt > EVERIFY_WINDOW_MS) return "lapsed";
  return "filed";
}

const initialState = {
  name: "",
  filingMode: "estimate" as const,
  filingPath: "simple" as const,
  profile: defaultProfile,
  matrix: { income: "2" as IncomeBand, age: "a" as AgeBand, business: "x" as BusinessType },
  incomeChips: [] as string[],
  recommendedForm: "ITR-1",
  caseId: "ITR1-2a-x",
  itrConfirmed: false,
  income: defaultIncome,
  houseProperty: defaultHouseProperty,
  extraProperties: [] as ExtraPropertyDraft[],
  carryForward: defaultCarryForward,
  depreciationBlocks: [] as DepreciationBlockDraft[],
  deductions: defaultDeductions,
  filingOutcome: defaultFilingOutcome,
  regime: null as "old" | "new" | null,
  profession: null as string | null,
  plan: "normal" as PlanId,
  paidPlanId: null as PlanId | null,
  paymentVerifiedAt: null as number | null,
  mismatchResolved: false,
  mismatchProceedWithExplanation: false,
  consentGiven: false,
  eVerifyMethod: null as string | null,
  bankValidated: false,
  seniorMode: false,
  connectedConnectors: [] as string[],
  aisFigures: null as AisFigures | null,
  capitalGains: null as CapitalGainsDraft | null,
  documentFacts: [] as DocumentFactDraft[],
  lastParseResult: null as LastParseResult | null,
  engineRecommendationCount: 0,
  questionAnswers: {} as Record<string, unknown>,
  computeHistory: [] as ComputeHistoryEntry[],
  activeField: null as string | null,
  enginePhase: "inputs" as EnginePhase,
};

if (typeof window !== "undefined") {
  ensureFreshBrowserSession();
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      ...initialState,

      setActiveField: (activeField) => set({ activeField }),
      setName: (name) => set({ name }),
      setFilingMode: (filingMode) => set({ filingMode }),
      setFilingPath: (filingPath) => set({ filingPath }),
      setProfile: (profile) =>
        set((s) => ({ profile: { ...s.profile, ...profile } })),
      setMatrix: (matrix) =>
        set((s) => ({ matrix: { ...s.matrix, ...matrix } })),
      toggleIncomeChip: (chip) =>
        set((s) => ({
          incomeChips: s.incomeChips.includes(chip)
            ? s.incomeChips.filter((c) => c !== chip)
            : [...s.incomeChips, chip],
        })),
      ensureIncomeChip: (chip) =>
        set((s) => ({
          incomeChips: s.incomeChips.includes(chip)
            ? s.incomeChips
            : [...s.incomeChips, chip],
        })),
      setRecommendedForm: (recommendedForm, caseId) =>
        set({ recommendedForm, caseId }),
      setItrConfirmed: (itrConfirmed) => set({ itrConfirmed }),
      setIncome: (income) =>
        set((s) => ({ income: { ...s.income, ...income } })),
      seedPrimaryEmployer: () =>
        set((s) => {
          if ((s.income.employers ?? []).length > 0) return {};
          const employers: EmployerForm16[] = [
            {
              id: makeEmployerId(),
              name: s.income.employer || "Employer 1",
              grossSalary: s.income.grossSalary,
              tds: s.income.tds,
            },
          ];
          return { income: { ...s.income, employers } };
        }),
      addEmployerForm16: (input) =>
        set((s) => {
          const existing = s.income.employers ?? [];
          const employers: EmployerForm16[] = [
            ...existing,
            {
              id: makeEmployerId(),
              name: input.name || `Employer ${existing.length + 1}`,
              grossSalary: Math.max(0, Math.round(input.grossSalary || 0)),
              tds: Math.max(0, Math.round(input.tds || 0)),
            },
          ];
          const aggregate = aggregateEmployers(employers);
          return {
            income: {
              ...s.income,
              employers,
              grossSalary: aggregate.grossSalary,
              tds: aggregate.tds,
              employer: aggregate.primaryName,
            },
          };
        }),
      removeEmployerForm16: (id) =>
        set((s) => {
          const employers = (s.income.employers ?? []).filter((e) => e.id !== id);
          if (employers.length === 0) {
            return { income: { ...s.income, employers } };
          }
          const aggregate = aggregateEmployers(employers);
          return {
            income: {
              ...s.income,
              employers,
              grossSalary: aggregate.grossSalary,
              tds: aggregate.tds,
              employer: aggregate.primaryName,
            },
          };
        }),
      setHouseProperty: (houseProperty) =>
        set((s) => ({
          houseProperty: { ...s.houseProperty, ...houseProperty },
        })),
      setExtraProperties: (extraProperties) => set({ extraProperties }),
      addExtraProperty: (property) =>
        set((s) => ({
          extraProperties: [
            ...s.extraProperties,
            {
              propertyType: property?.propertyType ?? "let_out",
              annualRent: property?.annualRent ?? 0,
              homeLoanInterest: property?.homeLoanInterest ?? 0,
              municipalTax: property?.municipalTax ?? 0,
              coOwnerPercent: property?.coOwnerPercent ?? 100,
              homeLoanPrincipal: property?.homeLoanPrincipal ?? 0,
            },
          ],
        })),
      removeExtraProperty: (index) =>
        set((s) => ({
          extraProperties: s.extraProperties.filter((_, i) => i !== index),
        })),
      setCarryForward: (carryForward) =>
        set((s) => ({
          carryForward: { ...s.carryForward, ...carryForward },
        })),
      setDepreciationBlocks: (depreciationBlocks) => set({ depreciationBlocks }),
      setDeductions: (deductions) =>
        set((s) => ({ deductions: { ...s.deductions, ...deductions } })),
      setRegime: (regime) => set({ regime }),
      setProfession: (profession) => set({ profession }),
      setPlan: (plan) => set({ plan }),
      setPaymentVerified: (planId) =>
        set({
          paidPlanId: planId,
          plan: planId,
          paymentVerifiedAt: Date.now(),
        }),
      setMismatchResolved: (mismatchResolved) => set({ mismatchResolved }),
      setMismatchProceedWithExplanation: (mismatchProceedWithExplanation) =>
        set({ mismatchProceedWithExplanation }),
      setConsentGiven: (consentGiven) => set({ consentGiven }),
      setEVerifyMethod: (eVerifyMethod) => set({ eVerifyMethod }),
      setBankValidated: (bankValidated) => set({ bankValidated }),
      setSeniorMode: (seniorMode) => set({ seniorMode }),
      setConnectorConnected: (connectorId) =>
        set((s) => ({
          connectedConnectors: s.connectedConnectors.includes(connectorId)
            ? s.connectedConnectors
            : [...s.connectedConnectors, connectorId],
        })),
      setAisFigures: (aisFigures) => set({ aisFigures }),
      setCapitalGains: (capitalGains) => set({ capitalGains }),
      setDocumentFacts: (documentFacts) => set({ documentFacts }),
      mergeDocumentFacts: (facts) =>
        set((s) => {
          const byKey = new Map(
            s.documentFacts.map((f) => [f.key, f] as const)
          );
          for (const fact of facts) {
            byKey.set(fact.key, fact);
          }
          return { documentFacts: Array.from(byKey.values()) };
        }),
      setEngineRecommendationCount: (engineRecommendationCount) =>
        set({ engineRecommendationCount }),
      setQuestionAnswer: (questionId, answer) =>
        set((s) => ({
          questionAnswers: { ...s.questionAnswers, [questionId]: answer },
        })),
      appendComputeHistory: (entry) =>
        set((s) => ({
          computeHistory: [...s.computeHistory, entry].slice(-20),
        })),
      setEnginePhase: (enginePhase) => set({ enginePhase }),
      setFilingOutcome: (filingOutcome) =>
        set((s) => ({
          filingOutcome: { ...s.filingOutcome, ...filingOutcome },
        })),
      markReturnSubmitted: (acknowledgementNumber) =>
        set((s) => ({
          filingOutcome: {
            ...s.filingOutcome,
            status: "filed",
            acknowledgementNumber: acknowledgementNumber.trim(),
            submittedAt: Date.now(),
            eVerifiedAt: null,
          },
        })),
      markReturnEVerified: () =>
        set((s) => ({
          filingOutcome: {
            ...s.filingOutcome,
            status: "verified",
            eVerifiedAt: Date.now(),
          },
        })),
      mergeParsedFields: (connectorId, payload) =>
        set((s) => {
          const { fields } = payload;
          const incomePatch: Partial<IncomeDraft> = {};
          const deductionsPatch: Partial<DeductionDraft> = {};

          const appendAsEmployer =
            payload.appendAsEmployer === true && connectorId === "form16";

          if (appendAsEmployer) {
            // Job change: fold this Form 16 into the employers list and
            // re-aggregate salary + TDS instead of overwriting.
            const baseEmployers: EmployerForm16[] =
              (s.income.employers ?? []).length > 0
                ? (s.income.employers ?? [])
                : [
                    {
                      id: makeEmployerId(),
                      name: s.income.employer || "Employer 1",
                      grossSalary: s.income.grossSalary,
                      tds: s.income.tds,
                    },
                  ];
            const employers: EmployerForm16[] = [
              ...baseEmployers,
              {
                id: makeEmployerId(),
                name:
                  typeof fields.employer === "string"
                    ? fields.employer
                    : `Employer ${baseEmployers.length + 1}`,
                grossSalary:
                  typeof fields.grossSalary === "number" ? fields.grossSalary : 0,
                tds: typeof fields.tds === "number" ? fields.tds : 0,
              },
            ];
            const aggregate = aggregateEmployers(employers);
            incomePatch.employers = employers;
            incomePatch.grossSalary = aggregate.grossSalary;
            incomePatch.tds = aggregate.tds;
            incomePatch.employer = aggregate.primaryName;
          } else {
            if (typeof fields.grossSalary === "number") {
              incomePatch.grossSalary = fields.grossSalary;
            }
            if (typeof fields.tds === "number") {
              incomePatch.tds = fields.tds;
            }
            if (typeof fields.employer === "string") {
              incomePatch.employer = fields.employer;
            }
          }
          if (typeof fields.section80C === "number") {
            deductionsPatch.section80C = fields.section80C;
          }
          if (typeof fields.section80D === "number") {
            deductionsPatch.section80D = fields.section80D;
          }
          if (typeof fields.npsExtra === "number") {
            deductionsPatch.npsExtra = fields.npsExtra;
          }
          if (typeof fields.hraReceived === "number") {
            incomePatch.hraReceived = fields.hraReceived;
          }
          if (typeof fields.actualRentPaid === "number") {
            incomePatch.actualRentPaid = fields.actualRentPaid;
          }
          if (fields.cityTier === "metro" || fields.cityTier === "non_metro") {
            incomePatch.cityTier = fields.cityTier;
          }

          const parseMode = payload.parseMode ?? "demo_fallback";
          const filingModePatch =
            connectorId === "form16" && parseMode === "extracted"
              ? ({ filingMode: "exact" as const } satisfies Pick<DraftState, "filingMode">)
              : {};

          return {
            ...filingModePatch,
            income: { ...s.income, ...incomePatch },
            deductions: { ...s.deductions, ...deductionsPatch },
            lastParseResult: {
              connectorId,
              mode: payload.parseMode ?? "demo_fallback",
              fieldConfidence: payload.fieldConfidence ?? {},
              warnings: payload.warnings ?? [],
              demo: payload.demo ?? true,
              filename: payload.filename,
              filenames: payload.filenames,
              parsedParts: payload.parsedParts,
              parsedAt: payload.parsedAt,
            },
          };
        }),
      reset: () => set(initialState),
      resetEligibilityStep: () =>
        set({
          incomeChips: [],
          profile: { ...defaultProfile },
          matrix: {
            income: "2" as IncomeBand,
            age: "a" as AgeBand,
            business: "x" as BusinessType,
          },
          itrConfirmed: false,
          seniorMode: false,
          recommendedForm: "ITR-1",
          caseId: "ITR1-2a-x",
        }),
      resetOnboardingProfile: () =>
        set({
          name: "",
          consentGiven: false,
          profile: { ...defaultProfile },
        }),
    }),
    { name: DRAFT_STORAGE_KEY }
  )
);
