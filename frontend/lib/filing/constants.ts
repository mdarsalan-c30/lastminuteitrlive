export const MACRO_STEPS = [
  "Understand",
  "Import",
  "Reconcile",
  "Optimize",
  "Review",
  "File & Track",
] as const;

export type MacroStep = 1 | 2 | 3 | 4 | 5 | 6;

export const ENGINE_STEPS = [
  { id: "profiler", label: "Profiler" },
  { id: "heads", label: "Income heads" },
  { id: "gti", label: "GTI" },
  { id: "deductions", label: "Deductions" },
  { id: "regime", label: "Regime fork" },
  { id: "nettax", label: "Net tax" },
] as const;

export type EngineStepId = (typeof ENGINE_STEPS)[number]["id"];

export const ENGINE_ORDER: EngineStepId[] = [
  "profiler",
  "heads",
  "gti",
  "deductions",
  "regime",
  "nettax",
];

export const INCOME_CHIPS = [
  { id: "salary", label: "Salary" },
  { id: "pension", label: "Pension" },
  { id: "fd_interest", label: "Bank / FD interest" },
  { id: "rent_received", label: "Rent from property" },
  { id: "home_loan", label: "Home loan" },
  { id: "esop_rsu", label: "ESOP / RSU" },
  { id: "freelance", label: "Freelance" },
  { id: "capital_gains", label: "Capital gains" },
  { id: "foreign", label: "Foreign income" },
  { id: "director", label: "Company director" },
  { id: "business_presumptive", label: "44AD / 44ADA" },
] as const;

export const PLANS = [
  {
    id: "free" as const,
    name: "Draft free",
    price: 0,
    features: ["Estimate + checklist"],
  },
  {
    id: "diy" as const,
    name: "Self-file",
    price: 499,
    features: ["ITR-1 guided filing"],
  },
  {
    id: "ai_smart" as const,
    name: "Self-file + AI",
    price: 349,
    features: ["Mismatch + regime + file"],
  },
  {
    id: "ca" as const,
    name: "Expert review",
    price: 2499,
    features: ["CA sign-off · 24h SLA"],
  },
];
