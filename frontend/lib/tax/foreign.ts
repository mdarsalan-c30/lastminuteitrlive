/**
 * NRI / foreign asset guided helpers — residential status + Schedule FA checklist.
 */

export type ResidentialStatusResult = "resident" | "rnor" | "nri";

export function residentialStatusFromDaysInIndia(
  daysInIndia: number,
  daysInIndiaPriorYears = 0
): ResidentialStatusResult {
  // Simplified AY 2026-27 retail heuristic for the wizard (not a substitute for CA advice).
  if (daysInIndia >= 182) return "resident";
  if (daysInIndia >= 60 && daysInIndiaPriorYears >= 365) return "resident";
  if (daysInIndia >= 120 && daysInIndia < 182) return "rnor";
  return "nri";
}

export const SCHEDULE_FA_CHECKLIST = [
  "Foreign bank accounts (account number, peak balance, closing)",
  "Foreign shares / ETFs / RSUs (including vesting-date FMV for cost basis)",
  "Foreign mutual funds or retirement accounts",
  "Immovable property outside India",
  "Any other capital asset or financial interest abroad",
] as const;

export const RSU_GUIDANCE =
  "For tech RSUs: use vesting-date FMV as cost of acquisition when you sell, so salary tax already paid is not taxed again as capital gains. Flag Schedule FA if shares are foreign-listed.";
