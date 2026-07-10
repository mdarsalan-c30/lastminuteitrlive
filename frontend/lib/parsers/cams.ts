/**
 * Deterministic CAMS Mutual Fund Capital Gain / Loss statement parser.
 * Unlock PDF with password first, then parse text (no AI keys required).
 *
 * Read:
 * - Equity STCG / LTCG (112A without indexation) from summary + scheme TOTAL
 * - Non-equity STCG / LTCG when present
 * - PAN, name, statement period
 *
 * Calculate / map into tax engine:
 * - Equity STCG gain → stcg_111a; STCG loss → stcl_equity
 * - Equity LTCG gain → ltcg_112a; LTCG loss → ltcl
 * - Non-equity → stcg_other / ltcg_other (gains) or folded into stcl/ltcl (losses)
 */

export interface CamsCgFields {
  pan?: string;
  assesseeName?: string;
  periodFrom?: string;
  periodTo?: string;
  equityStcg?: number;
  equityLtcg?: number;
  equityStcl?: number;
  equityLtcl?: number;
  nonEquityStcg?: number;
  nonEquityLtcg?: number;
  nonEquityStcl?: number;
  nonEquityLtcl?: number;
  equitySaleValue?: number;
  equityCost?: number;
}

export interface CamsParseResult {
  kind: "cams_cg";
  fields: CamsCgFields;
  capitalGains: {
    stcg_111a?: number;
    ltcg_112a?: number;
    stcg_other?: number;
    ltcg_other?: number;
    stcl_equity?: number;
    ltcl?: number;
  };
  facts: Array<{
    key: string;
    label: string;
    value: string | number;
    confidence: number;
    source: string;
    needsUserConfirmation: boolean;
  }>;
  summary: string[];
  warnings: string[];
  parseMode: "extracted" | "failed";
}

/** Full amount token: optional minus, Indian or Western grouping, optional decimals */
const AMT =
  String.raw`-?(?:\d{1,2}(?:,\d{2})+,\d{3}|\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?`;

function parseAmount(raw: string): number | undefined {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : undefined;
}

function lastAmount(line: string): number | undefined {
  const matches = [...line.matchAll(new RegExp(`(${AMT})`, "g"))];
  if (matches.length === 0) return undefined;
  return parseAmount(matches[matches.length - 1][1]);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function isCamsCapitalGainStatement(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("capital gain / loss statement") ||
    t.includes("capital gain/loss statement") ||
    (t.includes("consolidated across cams") && t.includes("capital gains")) ||
    (t.includes("cams serviced") && t.includes("capital gain"))
  );
}

function extractPan(text: string): string | undefined {
  const m = text.match(/\bPAN\s*:\s*([A-Z]{5}\d{4}[A-Z])\b/i);
  if (m) return m[1].toUpperCase();
  return undefined;
}

function extractPeriod(text: string): { from?: string; to?: string } {
  const m = text.match(
    /For the period\s+(\d{2}-[A-Za-z]{3}-\d{4})\s+To\s+(\d{2}-[A-Za-z]{3}-\d{4})/i
  );
  if (!m) return {};
  return { from: m[1], to: m[2] };
}

function extractName(text: string): string | undefined {
  const m2 = text.match(/\bNAME\s*:\s*([A-Za-z][A-Za-z .]+?)\s+STATUS\s*:/i);
  if (m2?.[1]) return m2[1].trim();

  // Line right after "Email:" is usually the investor name; the lines that
  // follow are postal address. Accept only 2–4 alphabetic words with no
  // digits or address tokens so we never mistake an address line for a name.
  const m = text.match(/Email:\s*\S+\s*\n\s*([A-Za-z][A-Za-z .]{2,60})\s*\n/i);
  const candidate = m?.[1]?.trim();
  if (!candidate) return undefined;
  const words = candidate.split(/\s+/);
  const looksLikeAddress =
    /\d/.test(candidate) ||
    /\b(road|street|sector|qtr|floor|house|city|district|state|india|mobile|address|pin|near)\b/i.test(
      candidate
    );
  if (words.length >= 2 && words.length <= 4 && !looksLikeAddress) {
    return candidate;
  }
  return undefined;
}

/** Lines like: Capital Gains / Loss -5,934.22 0.00 … -5,934.22 */
function capitalGainLossTotals(text: string): number[] {
  const totals: number[] = [];
  for (const line of text.split(/\n/)) {
    if (!/Capital Gains\s*\/\s*Loss/i.test(line)) continue;
    const amt = lastAmount(line);
    if (amt !== undefined) totals.push(amt);
  }
  return totals;
}

/**
 * Scheme-level equity TOTAL row:
 * TotalAmount TotalCost … ShortTerm … LongTermWithoutIndexation … TOTAL
 * e.g. 77,995.24 87,699.56 0.00 0.00 -5,934.21 0.00 -3,769.31 0.00 TOTAL
 */
function parseEquitySchemeTotal(text: string): {
  saleValue?: number;
  cost?: number;
  stcg?: number;
  ltcg?: number;
} {
  const m = text.match(
    new RegExp(
      `(${AMT})\\s+(${AMT})\\s+(${AMT})\\s+(${AMT})\\s+(${AMT})\\s+(${AMT})\\s+(${AMT})\\s+(${AMT})\\s+TOTAL\\b`,
      "i"
    )
  );
  if (!m) return {};
  return {
    saleValue: parseAmount(m[1]),
    cost: parseAmount(m[2]),
    stcg: parseAmount(m[5]),
    ltcg: parseAmount(m[7]),
  };
}

/**
 * Page-1 Short Term block (before Overall Summary): first Capital Gains / Loss total.
 * Equity LTCG without indexation: last non-zero Capital Gains / Loss before Non Equity,
 * or the line under Overall Summary (Equity).
 */
function parseEquityFromSummaries(text: string): {
  stcg?: number;
  ltcg?: number;
  saleValue?: number;
  cost?: number;
} {
  const equityEnd = text.search(/Overall Summary\s*\(Non Equity\)/i);
  const equityPart =
    equityEnd > 0 ? text.slice(0, equityEnd) : text.slice(0, Math.min(text.length, 4500));

  const gainTotals = capitalGainLossTotals(equityPart);
  // Typical order on page 1: STCG, LTCG-with-indexation (0), LTCG-without-indexation
  const stcg = gainTotals[0];
  const ltcg =
    gainTotals.length >= 2
      ? gainTotals.filter((g, i) => i > 0).find((g) => g !== 0) ??
        gainTotals[gainTotals.length - 1]
      : undefined;

  // Sale / cost under Short Term Capital Gain
  const stBlock = equityPart.match(
    /Short Term Capital Gain[\s\S]{0,500}?Capital Gains\s*\/\s*Loss[^\n]*/i
  )?.[0];
  let saleValue: number | undefined;
  let cost: number | undefined;
  if (stBlock) {
    const saleLine = stBlock.match(
      new RegExp(`(?:Total sale value\\)[\\s\\S]{0,40}?)(${AMT})`, "i")
    );
    // Prefer first data line after "(Total sale value)"
    const afterSale = stBlock.split(/\(Total sale value\)/i)[1] ?? "";
    saleValue = lastAmount(afterSale.split("\n").find((l) => new RegExp(AMT).test(l)) ?? "");
    const afterCost = stBlock.split(/\(Purchase cost of redeemed units\)/i)[1] ?? "";
    cost = lastAmount(afterCost.split("\n").find((l) => new RegExp(AMT).test(l)) ?? "");
    void saleLine;
  }

  return { stcg, ltcg, saleValue, cost };
}

function parseNonEquityFromSummaries(text: string): {
  stcg?: number;
  ltcg?: number;
} {
  const start = text.search(/Overall Summary\s*\(Non Equity\)/i);
  if (start < 0) return {};
  const end = text.search(/Capital Gain \/ Loss – Scheme level/i);
  const part = text.slice(start, end > start ? end : start + 2000);
  const gains = capitalGainLossTotals(part);
  if (gains.length === 0) return {};
  // If all zero, still return zeros as undefined
  const stcg = gains[0];
  const ltcg = gains[gains.length - 1];
  return {
    stcg: stcg === 0 ? undefined : stcg,
    ltcg: ltcg === 0 ? undefined : ltcg,
  };
}

function splitGainLoss(net: number | undefined): {
  gain?: number;
  loss?: number;
} {
  if (net === undefined) return {};
  if (net > 0) return { gain: round2(net) };
  if (net < 0) return { loss: round2(Math.abs(net)) };
  return {};
}

function toFacts(
  fields: CamsCgFields,
  cg: CamsParseResult["capitalGains"]
): CamsParseResult["facts"] {
  const facts: CamsParseResult["facts"] = [];
  const push = (
    key: string,
    label: string,
    value: string | number | undefined,
    confirm = true
  ) => {
    if (value === undefined || value === "") return;
    facts.push({
      key,
      label,
      value,
      confidence: 0.92,
      source: "cams",
      needsUserConfirmation: confirm,
    });
  };

  push("pan", "PAN", fields.pan, false);
  push("assessee_name", "Name", fields.assesseeName, false);
  push(
    "period",
    "Statement period",
    fields.periodFrom && fields.periodTo
      ? `${fields.periodFrom} to ${fields.periodTo}`
      : undefined,
    false
  );
  push("stcg_111a", "Equity STCG (111A)", cg.stcg_111a);
  push("ltcg_112a", "Equity LTCG (112A)", cg.ltcg_112a);
  push("stcl_equity", "STCL for set-off", cg.stcl_equity);
  push("ltcl", "LTCL for set-off", cg.ltcl);
  push("stcg_other", "Non-equity STCG", cg.stcg_other);
  push("ltcg_other", "Non-equity LTCG", cg.ltcg_other);
  push("equity_sale_value", "Equity sale value (info)", fields.equitySaleValue, false);
  push("equity_cost", "Equity cost (info)", fields.equityCost, false);
  return facts;
}

export function parseCamsCgText(text: string): CamsParseResult {
  if (text.trim().length < 120) {
    return {
      kind: "cams_cg",
      fields: {},
      capitalGains: {},
      facts: [],
      summary: [],
      warnings: ["PDF text too short — may still be locked or scanned."],
      parseMode: "failed",
    };
  }

  if (!isCamsCapitalGainStatement(text)) {
    return {
      kind: "cams_cg",
      fields: {},
      capitalGains: {},
      facts: [],
      summary: [],
      warnings: [
        "This does not look like a CAMS Capital Gain / Loss statement. Upload the CG statement (not CAS holdings-only).",
      ],
      parseMode: "failed",
    };
  }

  const period = extractPeriod(text);
  const fields: CamsCgFields = {
    pan: extractPan(text),
    assesseeName: extractName(text),
    periodFrom: period.from,
    periodTo: period.to,
  };

  const fromSummary = parseEquityFromSummaries(text);
  const fromTotal = parseEquitySchemeTotal(text);
  const nonEq = parseNonEquityFromSummaries(text);

  // Prefer scheme TOTAL for ST/LT nets (most reliable); fall back to summary lines.
  const equityStNet = fromTotal.stcg ?? fromSummary.stcg;
  const equityLtNet = fromTotal.ltcg ?? fromSummary.ltcg;
  fields.equitySaleValue = fromTotal.saleValue ?? fromSummary.saleValue;
  fields.equityCost = fromTotal.cost ?? fromSummary.cost;

  const eqSt = splitGainLoss(equityStNet);
  const eqLt = splitGainLoss(equityLtNet);
  const neSt = splitGainLoss(nonEq.stcg);
  const neLt = splitGainLoss(nonEq.ltcg);

  fields.equityStcg = eqSt.gain;
  fields.equityStcl = eqSt.loss;
  fields.equityLtcg = eqLt.gain;
  fields.equityLtcl = eqLt.loss;
  fields.nonEquityStcg = neSt.gain;
  fields.nonEquityStcl = neSt.loss;
  fields.nonEquityLtcg = neLt.gain;
  fields.nonEquityLtcl = neLt.loss;

  const capitalGains: CamsParseResult["capitalGains"] = {};
  if (eqSt.gain) capitalGains.stcg_111a = eqSt.gain;
  if (eqLt.gain) capitalGains.ltcg_112a = eqLt.gain;
  if (neSt.gain) capitalGains.stcg_other = neSt.gain;
  if (neLt.gain) capitalGains.ltcg_other = neLt.gain;

  const stcl = round2((eqSt.loss ?? 0) + (neSt.loss ?? 0));
  const ltcl = round2((eqLt.loss ?? 0) + (neLt.loss ?? 0));
  if (stcl > 0) capitalGains.stcl_equity = stcl;
  if (ltcl > 0) capitalGains.ltcl = ltcl;

  const warnings = [
    "CAMS disclaimer: statement is informational — confirm with your CA before filing.",
    "Equity MF mapped to STCG 111A / LTCG 112A; losses go to set-off / carry-forward buckets.",
  ];

  const hasAny = Object.keys(capitalGains).length > 0;
  if (!hasAny) {
    return {
      kind: "cams_cg",
      fields,
      capitalGains: {},
      facts: toFacts(fields, {}),
      summary: ["Opened CAMS statement but found no capital gain totals."],
      warnings: [
        ...warnings,
        "Check password and that this is a Capital Gain / Loss Statement for the FY.",
      ],
      parseMode: "failed",
    };
  }

  const summaryBits = [
    capitalGains.stcg_111a != null
      ? `Equity STCG ₹${capitalGains.stcg_111a.toLocaleString("en-IN")}`
      : null,
    capitalGains.stcl_equity != null
      ? `STCL ₹${capitalGains.stcl_equity.toLocaleString("en-IN")}`
      : null,
    capitalGains.ltcg_112a != null
      ? `Equity LTCG ₹${capitalGains.ltcg_112a.toLocaleString("en-IN")}`
      : null,
    capitalGains.ltcl != null
      ? `LTCL ₹${capitalGains.ltcl.toLocaleString("en-IN")}`
      : null,
    capitalGains.stcg_other != null
      ? `Other STCG ₹${capitalGains.stcg_other.toLocaleString("en-IN")}`
      : null,
    capitalGains.ltcg_other != null
      ? `Other LTCG ₹${capitalGains.ltcg_other.toLocaleString("en-IN")}`
      : null,
  ].filter(Boolean);

  return {
    kind: "cams_cg",
    fields,
    capitalGains,
    facts: toFacts(fields, capitalGains),
    summary: [
      "Parsed CAMS Mutual Fund Capital Gain / Loss statement.",
      summaryBits.join(" · "),
    ],
    warnings,
    parseMode: "extracted",
  };
}
