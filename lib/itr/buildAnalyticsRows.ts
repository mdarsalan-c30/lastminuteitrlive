import type { DeductionDraft, IncomeDraft, LastParseResult } from "@/lib/store/draft";
import type { AnalyticsRow } from "@/lib/itr/summaryTypes";

function row(
  category: string,
  particular: string,
  amount: number | null,
  source: string,
  confidence?: AnalyticsRow["confidence"]
): AnalyticsRow {
  return { category, particular, amount, source, confidence };
}

export function buildAnalyticsRows(input: {
  income: IncomeDraft;
  deductions: DeductionDraft;
  lastParseResult: LastParseResult | null;
  connectedConnectors: string[];
}): AnalyticsRow[] {
  const { income, deductions, lastParseResult, connectedConnectors } = input;
  const confidence = lastParseResult?.fieldConfidence ?? {};
  const parseSource =
    lastParseResult?.connectorId === "form16"
      ? lastParseResult.demo
        ? "Form 16 (demo fallback)"
        : "Form 16 PDF"
      : lastParseResult?.connectorId ?? "Manual entry";

  const rows: AnalyticsRow[] = [
    row(
      "Income",
      "Gross salary",
      income.grossSalary,
      connectedConnectors.includes("form16") ? parseSource : "Draft",
      confidence.grossSalary
    ),
    row(
      "Income",
      "Employer name",
      null,
      income.employer
        ? `${income.employer}${connectedConnectors.includes("form16") ? ` (${parseSource})` : ""}`
        : "—",
      confidence.employer
    ),
    row(
      "Income",
      "FD / savings interest",
      income.fdInterest,
      connectedConnectors.includes("ais") ? "AIS" : "Draft"
    ),
    row(
      "Deductions",
      "Section 80C",
      deductions.section80C,
      parseSource,
      confidence.section80C
    ),
    row(
      "Deductions",
      "Section 80D",
      deductions.section80D,
      parseSource,
      confidence.section80D
    ),
    row(
      "Deductions",
      "Section 80GG (rent, no HRA)",
      deductions.section80GG,
      "Draft"
    ),
    row(
      "Deductions",
      "NPS (80CCD(1B))",
      deductions.npsExtra,
      parseSource,
      confidence.npsExtra
    ),
    row("Tax credits", "TDS on salary", income.tds, parseSource, confidence.tds),
    row("Tax credits", "Advance tax", income.advanceTax, "Draft"),
    row(
      "Tax credits",
      "Self-assessment tax",
      income.selfAssessmentTax,
      "Draft"
    ),
  ];

  return rows;
}

export function sectionSubtotals(rows: AnalyticsRow[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const r of rows) {
    if (r.amount === null) continue;
    totals[r.category] = (totals[r.category] ?? 0) + r.amount;
  }
  return totals;
}
