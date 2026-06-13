import type { EmployerForm16 } from "@/lib/filing/employers";

/**
 * Reconciliation flags compare what we imported from Form 16 against the ITD
 * records (AIS / Form 26AS). We only have what the user connected, so flags are
 * factual statements about coverage and totals — never advice or guarantees.
 */
export type ReconciliationSeverity = "ok" | "info" | "warning";

export interface ReconciliationFlag {
  id: string;
  label: string;
  detail: string;
  severity: ReconciliationSeverity;
}

export interface ReconciliationInput {
  connectedConnectors: string[];
  employers: EmployerForm16[];
  grossSalary: number;
  tds: number;
  mismatchResolved: boolean;
  /** Optional AIS-reported figures when available; enables exact delta flags. */
  aisGrossSalary?: number;
  aisTds?: number;
}

const TOLERANCE = 100; // ₹ — ignore rounding noise below this.

export function buildReconciliationFlags(
  input: ReconciliationInput
): ReconciliationFlag[] {
  const {
    connectedConnectors,
    employers,
    grossSalary,
    tds,
    mismatchResolved,
    aisGrossSalary,
    aisTds,
  } = input;
  const connected = new Set(connectedConnectors);
  const hasAis = connected.has("ais");
  const has26AS = connected.has("form26as");
  const flags: ReconciliationFlag[] = [];

  // AIS coverage
  if (!hasAis) {
    flags.push({
      id: "ais-missing",
      label: "AIS not imported",
      detail:
        "We can't cross-check your TDS and reported income against ITD records until you add AIS.",
      severity: "warning",
    });
  } else if (aisTds !== undefined && Math.abs(aisTds - tds) > TOLERANCE) {
    flags.push({
      id: "ais-tds-delta",
      label: "TDS differs from AIS",
      detail: `Form 16 TDS and AIS TDS differ by about ₹${Math.abs(
        Math.round(aisTds - tds)
      ).toLocaleString("en-IN")}. Confirm which figure is correct before filing.`,
      severity: "warning",
    });
  } else if (
    aisGrossSalary !== undefined &&
    Math.abs(aisGrossSalary - grossSalary) > TOLERANCE
  ) {
    flags.push({
      id: "ais-salary-delta",
      label: "Salary differs from AIS",
      detail: `Form 16 gross salary and AIS differ by about ₹${Math.abs(
        Math.round(aisGrossSalary - grossSalary)
      ).toLocaleString("en-IN")}. Reconcile before filing.`,
      severity: "warning",
    });
  } else if (!mismatchResolved) {
    flags.push({
      id: "ais-review",
      label: "AIS imported — review open items",
      detail: "Check each AIS line against your draft and mark mismatches resolved.",
      severity: "info",
    });
  } else {
    flags.push({
      id: "ais-ok",
      label: "AIS reconciled",
      detail: "No open mismatches between your draft and AIS.",
      severity: "ok",
    });
  }

  // 26AS coverage
  if (!has26AS) {
    flags.push({
      id: "form26as-missing",
      label: "Form 26AS not imported",
      detail: "Form 26AS confirms TDS credits deposited against your PAN.",
      severity: "info",
    });
  }

  // Multiple employers — combined TDS must match 26AS/AIS total
  if (employers.length > 1) {
    flags.push({
      id: "multi-employer",
      label: `Combined ${employers.length} employers`,
      detail:
        "Each employer reports TDS separately. The portal expects the combined total — confirm it against Form 26AS/AIS.",
      severity: "info",
    });
  }

  return flags;
}

export function hasOpenReconciliationWarnings(
  flags: ReconciliationFlag[]
): boolean {
  return flags.some((flag) => flag.severity === "warning");
}

/**
 * Per-line three-way reconciliation (Form 16 vs AIS vs Form 26AS vs draft).
 * Elevates the line-item view from the mismatch screen into a reusable shape so
 * the review dashboard and the mismatch page can present the same source of
 * truth. Values stay factual: a source is `undefined` when it is not imported.
 */
export type ReconciliationRowSeverity = "matched" | "attention" | "missing";

export interface ReconciliationRow {
  id: string;
  label: string;
  form16?: number;
  ais?: number;
  form26as?: number;
  draft: number;
  severity: ReconciliationRowSeverity;
  detail: string;
}

export interface ReconciliationStatementInput {
  connectedConnectors: string[];
  grossSalary: number;
  tds: number;
  fdInterest: number;
  mismatchResolved: boolean;
  aisGrossSalary?: number;
  aisTds?: number;
  aisInterest?: number;
}

export function buildReconciliationStatements(
  input: ReconciliationStatementInput
): ReconciliationRow[] {
  const {
    connectedConnectors,
    grossSalary,
    tds,
    fdInterest,
    mismatchResolved,
    aisGrossSalary,
    aisTds,
    aisInterest,
  } = input;
  const connected = new Set(connectedConnectors);
  const hasAis = connected.has("ais");
  const has26AS = connected.has("form26as");
  const rows: ReconciliationRow[] = [];

  // Salary — Form 16 is the source; AIS cross-checks.
  {
    const ais = hasAis ? (aisGrossSalary ?? grossSalary) : undefined;
    let severity: ReconciliationRowSeverity;
    let detail: string;
    if (!hasAis) {
      severity = "missing";
      detail = "Add AIS to confirm reported salary against ITD records.";
    } else if (ais !== undefined && Math.abs(ais - grossSalary) > TOLERANCE) {
      severity = "attention";
      detail = `Form 16 and AIS differ by about ₹${Math.abs(
        Math.round(ais - grossSalary)
      ).toLocaleString("en-IN")}. Reconcile before you file.`;
    } else if (!mismatchResolved) {
      severity = "attention";
      detail = "AIS imported — confirm the salary line and mark it resolved.";
    } else {
      severity = "matched";
      detail = "Form 16 salary matches your AIS line.";
    }
    rows.push({
      id: "salary",
      label: "Salary",
      form16: grossSalary,
      ais,
      draft: grossSalary,
      severity,
      detail,
    });
  }

  // TDS — Form 16 reports it; Form 26AS confirms the deposit against PAN.
  {
    const ais = hasAis ? (aisTds ?? tds) : undefined;
    const form26as = has26AS ? tds : undefined;
    let severity: ReconciliationRowSeverity;
    let detail: string;
    if (!has26AS && !hasAis) {
      severity = "missing";
      detail = "Add Form 26AS or AIS to confirm TDS credited against your PAN.";
    } else if (ais !== undefined && Math.abs(ais - tds) > TOLERANCE) {
      severity = "attention";
      detail = `Form 16 TDS and AIS TDS differ by about ₹${Math.abs(
        Math.round(ais - tds)
      ).toLocaleString("en-IN")}. Confirm the correct figure.`;
    } else {
      severity = "matched";
      detail = has26AS
        ? "TDS in Form 16 matches the credit in Form 26AS."
        : "TDS in Form 16 matches your AIS line.";
    }
    rows.push({
      id: "tds",
      label: "TDS credits",
      form16: tds,
      ais,
      form26as,
      draft: tds,
      severity,
      detail,
    });
  }

  // Interest income — typically surfaced by AIS, not Form 16.
  {
    const ais = hasAis ? (aisInterest ?? fdInterest) : undefined;
    let severity: ReconciliationRowSeverity;
    let detail: string;
    if (!hasAis) {
      severity = "missing";
      detail = "AIS lists interest and dividend income — add it to cross-check.";
    } else if (ais !== undefined && Math.abs(ais - fdInterest) > TOLERANCE) {
      severity = "attention";
      detail = `AIS interest differs from your draft by about ₹${Math.abs(
        Math.round(ais - fdInterest)
      ).toLocaleString("en-IN")}. Add the missing income.`;
    } else if (!mismatchResolved) {
      severity = "attention";
      detail = "Confirm AIS interest is fully captured in your draft.";
    } else {
      severity = "matched";
      detail = "Interest income matches your AIS line.";
    }
    rows.push({
      id: "interest",
      label: "Interest income",
      ais,
      draft: fdInterest,
      severity,
      detail,
    });
  }

  return rows;
}

export function summarizeReconciliationRows(rows: ReconciliationRow[]): {
  matched: number;
  attention: number;
  missing: number;
} {
  return rows.reduce(
    (acc, row) => {
      acc[row.severity] += 1;
      return acc;
    },
    { matched: 0, attention: 0, missing: 0 }
  );
}
