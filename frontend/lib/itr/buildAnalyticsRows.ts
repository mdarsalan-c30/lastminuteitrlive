import type {
  CapitalGainsDraft,
  DeductionDraft,
  IncomeDraft,
  LastParseResult,
} from "@/lib/store/draft";
import type { AnalyticsRow } from "@/lib/itr/summaryTypes";

function row(
  category: string,
  particular: string,
  amount: number | null,
  source: string,
  confidence?: AnalyticsRow["confidence"],
  includeInSubtotal = true
): AnalyticsRow {
  return { category, particular, amount, source, confidence, includeInSubtotal };
}

export function buildAnalyticsRows(input: {
  income: IncomeDraft;
  deductions: DeductionDraft;
  lastParseResult: LastParseResult | null;
  connectedConnectors: string[];
  capitalGains?: CapitalGainsDraft | null;
}): AnalyticsRow[] {
  const { income, deductions, lastParseResult, connectedConnectors, capitalGains } = input;
  const confidence = lastParseResult?.fieldConfidence ?? {};
  const parseSource =
    lastParseResult?.connectorId === "form16"
      ? lastParseResult.demo
        ? "Form 16 (demo fallback)"
        : "Form 16 PDF"
      : lastParseResult?.connectorId ?? "Manual entry";
  const brokerSource = capitalGains?.sourceConnectorId
    ? `${capitalGains.sourceConnectorId} Tax P&L`
    : parseSource;

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
    ...(capitalGains
      ? [
          row("Capital gains", "Equity STCG (Section 111A)", capitalGains.stcg_111a ?? 0, brokerSource),
          row("Capital gains", "Equity LTCG (Section 112A)", capitalGains.ltcg_112a ?? 0, brokerSource),
          row("Capital gains", "Other short-term capital gains", capitalGains.stcg_other ?? 0, brokerSource),
          row("Capital gains", "Other long-term capital gains", capitalGains.ltcg_other ?? 0, brokerSource),
          row("Capital losses", "Short-term capital loss", -(capitalGains.stcl_equity ?? 0), brokerSource),
          row("Capital losses", "Long-term capital loss", -(capitalGains.ltcl ?? 0), brokerSource),
        ]
      : []),
    ...((income.fnoTurnover ?? 0) !== 0 ||
    (income.fnoNonSpeculativeProfit ?? 0) !== 0 ||
    (income.fnoSpeculativeProfit ?? 0) !== 0
      ? [
          row(
            "Business income",
            "F&O profit / loss (non-speculative)",
            income.fnoNonSpeculativeProfit ?? 0,
            parseSource
          ),
          row(
            "Business income",
            "Intraday profit / loss (speculative)",
            income.fnoSpeculativeProfit ?? 0,
            parseSource
          ),
          row(
            "Trading details",
            "F&O turnover",
            income.fnoTurnover ?? 0,
            parseSource,
            undefined,
            false
          ),
        ]
      : []),
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
    if (r.amount === null || r.includeInSubtotal === false) continue;
    totals[r.category] = (totals[r.category] ?? 0) + r.amount;
  }
  return totals;
}
