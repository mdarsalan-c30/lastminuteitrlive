/**
 * Multi-employer Form 16 aggregation (job-change scenario).
 *
 * When a taxpayer changes jobs during the year, each employer issues its own
 * Form 16. The income tax return needs the combined gross salary and the
 * combined TDS across all employers. This module is the single source of truth
 * for that aggregation so the draft store and the engine stay consistent.
 */

export interface EmployerForm16 {
  id: string;
  name: string;
  grossSalary: number;
  tds: number;
}

export interface EmployerAggregate {
  grossSalary: number;
  tds: number;
  /** Display name for the primary (highest-salary) employer. */
  primaryName: string;
  count: number;
}

export function makeEmployerId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `emp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Sum gross salary and TDS across employers; pick the highest-salary employer
 * as the primary display name. Returns zeros and an empty name for an empty
 * list so callers can fall back to single-employer fields.
 */
export function aggregateEmployers(employers: EmployerForm16[]): EmployerAggregate {
  if (employers.length === 0) {
    return { grossSalary: 0, tds: 0, primaryName: "", count: 0 };
  }

  let grossSalary = 0;
  let tds = 0;
  let primary = employers[0];

  for (const employer of employers) {
    grossSalary += Math.max(0, Math.round(employer.grossSalary || 0));
    tds += Math.max(0, Math.round(employer.tds || 0));
    if ((employer.grossSalary || 0) > (primary.grossSalary || 0)) {
      primary = employer;
    }
  }

  const primaryName = primary.name?.trim() || "Employer";
  const displayName =
    employers.length > 1
      ? `${primaryName} (+${employers.length - 1} more)`
      : primaryName;

  return {
    grossSalary,
    tds,
    primaryName: displayName,
    count: employers.length,
  };
}
