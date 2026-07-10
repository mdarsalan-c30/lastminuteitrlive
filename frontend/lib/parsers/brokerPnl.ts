/**
 * Broker Tax P&L stub parser.
 * // AI_API_TODO — full column detection + LLM extraction when AI API is wired.
 * Returns facts that always need user confirmation.
 */

export interface BrokerPnlFact {
  key: string;
  label: string;
  value: string | number;
  confidence: number;
  needsUserConfirmation: boolean;
  source: string;
}

export interface BrokerPnlParseResult {
  facts: BrokerPnlFact[];
  warnings: string[];
  summary: string[];
}

const HEADER_HINTS = [
  /stcg/i,
  /ltcg/i,
  /turnover/i,
  /realized/i,
  /f&o|futures|options/i,
  /intraday/i,
  /112a|111a/i,
];

/**
 * Lightweight text/CSV scan — does not invent amounts.
 */
export function parseBrokerPnlText(
  text: string,
  source = "broker_pnl"
): BrokerPnlParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const matchedHeaders = HEADER_HINTS.filter((re) =>
    lines.some((line) => re.test(line))
  ).map((re) => re.source);

  const facts: BrokerPnlFact[] = [];
  const warnings: string[] = [
    "AI_API_TODO: Full broker P&L extraction will run when the AI API is connected. Confirm every figure below.",
  ];

  if (matchedHeaders.length > 0) {
    facts.push({
      key: "broker_headers_detected",
      label: "Columns we noticed",
      value: matchedHeaders.join(", "),
      confidence: 0.4,
      needsUserConfirmation: true,
      source,
    });
  }

  // Look for currency-like numbers near "turnover" / "profit"
  for (const line of lines.slice(0, 80)) {
    const turnoverMatch = line.match(/turnover[^0-9\-]*([\d,]+\.?\d*)/i);
    if (turnoverMatch?.[1]) {
      facts.push({
        key: "fno_turnover_candidate",
        label: "Possible F&O turnover (confirm)",
        value: Number(turnoverMatch[1].replace(/,/g, "")),
        confidence: 0.35,
        needsUserConfirmation: true,
        source,
      });
      break;
    }
  }

  return {
    facts,
    warnings,
    summary: [
      matchedHeaders.length
        ? `Detected ${matchedHeaders.length} tax-related column hints — please confirm amounts.`
        : "Could not auto-read this file — enter STCG / LTCG / F&O figures manually.",
    ],
  };
}
