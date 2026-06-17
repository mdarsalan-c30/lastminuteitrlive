/**
 * Persona fixtures for case studies, simulation, and end-to-end QA.
 *
 * Each fixture is a fully-typed `DraftSlice` (the same shape the tax engine and
 * simulation runner consume via `draftToUserInput`) plus documentation metadata
 * describing the dummy Form 16 / AIS inputs and the taxpayer pain point it
 * exercises. All names, employers, and numbers are fabricated test data — no
 * real PAN or personal information is used, and nothing here is submitted to the
 * live income tax portal.
 *
 * Sources for the scenarios: qna.tax recurring threads + competitor landscape
 * (see docs/research/USER_PAINPOINTS_2026.md and docs/case-studies/CASE_STUDIES_2026.md).
 */
import type { DraftSlice } from "@/lib/simulation/types";

export interface PersonaForm16 {
  employer: string;
  grossSalary: number;
  tds: number;
}

export interface PersonaAisLine {
  line: string;
  amount: number;
  /** Whether this line is already reflected in the Form 16 figures. */
  inForm16: boolean;
}

export interface PersonaDocuments {
  form16?: PersonaForm16[];
  ais?: PersonaAisLine[];
  notes?: string[];
}

export interface PersonaFixture {
  id: string;
  /** Fabricated display name for the case study. */
  persona: string;
  /** One-line scenario headline. */
  headline: string;
  /** Which USER_PAINPOINTS_2026 theme this primarily exercises. */
  painPoint: string;
  /** Expected ITR form when we are confident; omitted for complex routing. */
  expectedItrForm?: string;
  documents: PersonaDocuments;
  draftSlice: DraftSlice;
}

const AY = "AY 2026-27 (FY 2025-26)";

/** Base draft slice with all-zero defaults; spread and override per persona. */
function baseSlice(): DraftSlice {
  return {
    filingMode: "exact",
    profile: {
      assessmentYear: AY,
      residentialStatus: "resident",
      ageBand: "under_60",
    },
    matrix: { income: "2", age: "a", business: "x" },
    incomeChips: [],
    income: {
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
    },
    houseProperty: {
      propertyType: "none",
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
    connectedConnectors: [],
  };
}

export const PERSONA_FIXTURES: PersonaFixture[] = [
  {
    id: "salaried-single-form16",
    persona: "Aarav Sharma",
    headline: "Salaried, single Form 16 — the happy path.",
    painPoint: "Theme 9 (which ITR?) + Theme 4 (regime choice)",
    expectedItrForm: "ITR-1",
    documents: {
      form16: [{ employer: "Infotech Solutions Pvt Ltd", grossSalary: 1_200_000, tds: 85_000 }],
      ais: [
        { line: "Salary (Infotech Solutions)", amount: 1_200_000, inForm16: true },
        { line: "Savings interest (HDFC)", amount: 8_000, inForm16: false },
      ],
      notes: ["Pays metro rent with HRA component in Form 16 Part B."],
    },
    draftSlice: {
      ...baseSlice(),
      matrix: { income: "3", age: "a", business: "x" },
      incomeChips: ["salary", "fd_interest"],
      income: {
        ...baseSlice().income,
        grossSalary: 1_200_000,
        tds: 85_000,
        fdInterest: 8_000,
        employer: "Infotech Solutions Pvt Ltd",
        hraReceived: 240_000,
        actualRentPaid: 300_000,
        cityTier: "metro",
      },
      deductions: { section80C: 150_000, section80D: 25_000, section80GG: 0, npsExtra: 0 },
      connectedConnectors: ["form16"],
    },
  },
  {
    id: "job-change-multi-form16",
    persona: "Priya Nair",
    headline: "Changed jobs mid-year — two Form 16s, both gave the basic exemption, TDS under-deducted.",
    painPoint: "Multi-employer aggregation + Theme 1 (TDS reconciliation)",
    expectedItrForm: "ITR-1",
    documents: {
      form16: [
        { employer: "Acme Analytics Pvt Ltd", grossSalary: 700_000, tds: 45_000 },
        { employer: "Globex Software Ltd", grossSalary: 600_000, tds: 52_000 },
      ],
      notes: [
        "Aggregate gross ₹13,00,000; aggregate TDS ₹97,000.",
        "Both employers applied the basic exemption separately, so combined TDS is short — expect a small payable on review.",
      ],
    },
    draftSlice: {
      ...baseSlice(),
      matrix: { income: "3", age: "a", business: "x" },
      incomeChips: ["salary"],
      income: {
        ...baseSlice().income,
        grossSalary: 1_300_000,
        tds: 97_000,
        employer: "Acme Analytics Pvt Ltd (+1 more)",
        employers: [
          { id: "emp-acme", name: "Acme Analytics Pvt Ltd", grossSalary: 700_000, tds: 45_000 },
          { id: "emp-globex", name: "Globex Software Ltd", grossSalary: 600_000, tds: 52_000 },
        ],
      },
      deductions: { section80C: 150_000, section80D: 22_000, section80GG: 0, npsExtra: 0 },
      connectedConnectors: ["form16"],
    },
  },
  {
    id: "salaried-ais-mismatch",
    persona: "Rohan Mehta",
    headline: "Form 16 salary is clean, but AIS shows extra FD interest and dividends not on Form 16.",
    painPoint: "Theme 1 (AIS vs Form 16 vs 26AS reconciliation) — the #1 pain point",
    expectedItrForm: "ITR-1",
    documents: {
      form16: [{ employer: "Meridian Consulting LLP", grossSalary: 1_500_000, tds: 120_000 }],
      ais: [
        { line: "Salary (Meridian Consulting)", amount: 1_500_000, inForm16: true },
        { line: "FD interest (ICICI)", amount: 45_000, inForm16: false },
        { line: "Dividend (listed equity)", amount: 12_000, inForm16: false },
      ],
      notes: [
        "Classic mismatch: filing on Form 16 alone would omit ₹57,000 of AIS income and risk a 143(1) notice.",
        "Reconcile view must surface both AIS-only lines as 'needs attention'.",
      ],
    },
    draftSlice: {
      ...baseSlice(),
      matrix: { income: "3", age: "a", business: "x" },
      incomeChips: ["salary", "fd_interest", "dividend"],
      income: {
        ...baseSlice().income,
        grossSalary: 1_500_000,
        tds: 120_000,
        fdInterest: 45_000,
        employer: "Meridian Consulting LLP",
      },
      deductions: { section80C: 150_000, section80D: 30_000, section80GG: 0, npsExtra: 0 },
      connectedConnectors: ["form16"],
    },
  },
  {
    id: "freelancer-44ada",
    persona: "Sneha Iyer",
    headline: "Freelance designer with foreign clients — presumptive 44ADA question.",
    painPoint: "Theme 3 (presumptive 44ADA, foreign clients, GST threshold)",
    documents: {
      ais: [{ line: "Professional receipts (foreign + domestic)", amount: 1_800_000, inForm16: false }],
      notes: [
        "Receives in foreign currency from overseas clients.",
        "Honest escalation: foreign income / GST nuance → consider expert; we estimate the presumptive position.",
      ],
    },
    draftSlice: {
      ...baseSlice(),
      matrix: { income: "3", age: "a", business: "x" },
      incomeChips: ["freelance", "foreign", "fd_interest"],
      income: {
        ...baseSlice().income,
        grossSalary: 0,
        fdInterest: 20_000,
        employer: "",
      },
      deductions: { section80C: 90_000, section80D: 18_000, section80GG: 0, npsExtra: 0 },
      connectedConnectors: [],
    },
  },
  {
    id: "trader-capital-gains",
    persona: "Vikram Reddy",
    headline: "Salaried + equity capital gains and intraday/F&O activity.",
    painPoint: "Theme 2 (capital gains, F&O turnover, 111A/112A)",
    documents: {
      form16: [{ employer: "Nimbus Retail Pvt Ltd", grossSalary: 900_000, tds: 30_000 }],
      ais: [
        { line: "Salary (Nimbus Retail)", amount: 900_000, inForm16: true },
        { line: "Securities transactions (broker SFT)", amount: 0, inForm16: false },
      ],
      notes: [
        "Capital gains detected → routes ITR-2/3.",
        "Surface honest 'complex case → consider expert' nudge for F&O turnover/audit.",
      ],
    },
    draftSlice: {
      ...baseSlice(),
      matrix: { income: "2", age: "a", business: "z" },
      incomeChips: ["salary", "capital_gains"],
      income: {
        ...baseSlice().income,
        grossSalary: 900_000,
        tds: 30_000,
        employer: "Nimbus Retail Pvt Ltd",
      },
      deductions: { section80C: 120_000, section80D: 20_000, section80GG: 0, npsExtra: 0 },
      connectedConnectors: ["form16"],
    },
  },
  {
    id: "rent-no-hra-80gg",
    persona: "Karthik Menon",
    headline: "Salaried with no HRA component, pays rent — 80GG and old-vs-new decision.",
    painPoint: "Theme 4 (regime) + 80GG rent-without-HRA",
    expectedItrForm: "ITR-1",
    documents: {
      form16: [{ employer: "Cobalt Systems Pvt Ltd", grossSalary: 1_000_000, tds: 60_000 }],
      notes: [
        "No HRA in salary structure, so claims 80GG in the old regime.",
        "Reconcile dashboard should show the regime recommendation and why (80GG only helps old regime).",
      ],
    },
    draftSlice: {
      ...baseSlice(),
      matrix: { income: "3", age: "a", business: "x" },
      incomeChips: ["salary"],
      income: {
        ...baseSlice().income,
        grossSalary: 1_000_000,
        tds: 60_000,
        employer: "Cobalt Systems Pvt Ltd",
      },
      deductions: { section80C: 120_000, section80D: 22_000, section80GG: 60_000, npsExtra: 0 },
      connectedConnectors: ["form16"],
    },
  },
  {
    id: "nri-let-out-property",
    persona: "Daniel Thomas (NRI)",
    headline: "NRI with a let-out flat in India and home-loan interest.",
    painPoint: "Theme 6 (NRI + property), house property set-off",
    expectedItrForm: "ITR-2",
    documents: {
      ais: [
        { line: "Rent received (let-out flat)", amount: 360_000, inForm16: false },
        { line: "TDS on rent (tenant)", amount: 36_000, inForm16: false },
      ],
      notes: [
        "Residential status NRI → ITR-2.",
        "Honest escalation for NRI specifics; we estimate the house-property head.",
      ],
    },
    draftSlice: {
      ...baseSlice(),
      profile: { assessmentYear: AY, residentialStatus: "non_resident", ageBand: "under_60" },
      matrix: { income: "2", age: "a", business: "x" },
      incomeChips: ["house_property"],
      income: {
        ...baseSlice().income,
        grossSalary: 0,
        tds: 36_000,
        employer: "",
      },
      houseProperty: {
        propertyType: "let_out",
        annualRent: 360_000,
        homeLoanInterest: 200_000,
        municipalTax: 12_000,
        coOwnerPercent: 100,
      },
      deductions: { section80C: 0, section80D: 0, section80GG: 0, npsExtra: 0 },
      connectedConnectors: [],
    },
  },
  {
    id: "senior-pensioner-80ttb",
    persona: "Lakshmi Rao (senior)",
    headline: "Senior citizen pensioner with FD interest — 80TTB.",
    painPoint: "Theme 1 (interest reconciliation) + senior 80TTB",
    expectedItrForm: "ITR-1",
    documents: {
      form16: [{ employer: "State Pension (Form 16 / pension)", grossSalary: 800_000, tds: 40_000 }],
      ais: [
        { line: "Pension", amount: 800_000, inForm16: true },
        { line: "FD interest (multiple banks)", amount: 80_000, inForm16: false },
      ],
      notes: ["Senior → 80TTB up to ₹50,000 on interest in the old regime."],
    },
    draftSlice: {
      ...baseSlice(),
      profile: { assessmentYear: AY, residentialStatus: "resident", ageBand: "senior" },
      matrix: { income: "2", age: "b", business: "x" },
      incomeChips: ["salary", "fd_interest"],
      income: {
        ...baseSlice().income,
        grossSalary: 800_000,
        tds: 40_000,
        fdInterest: 80_000,
        employer: "State Pension",
      },
      deductions: { section80C: 100_000, section80D: 30_000, section80GG: 0, npsExtra: 0 },
      connectedConnectors: ["form16"],
    },
  },
];

export function getPersona(id: string): PersonaFixture | undefined {
  return PERSONA_FIXTURES.find((p) => p.id === id);
}
