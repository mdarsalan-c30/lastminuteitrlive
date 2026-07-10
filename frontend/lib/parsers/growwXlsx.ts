/**
 * Groww / broker Mutual Fund Excel parsers.
 *
 * Two common downloads:
 * 1) Holdings snapshot (`Mutual_Funds_*.xlsx`, sheet "Holdings")
 *    → identity only (PAN/name). NOT taxable CG for ITR.
 * 2) Capital Gains – Mutual Funds / Stocks (FY report)
 *    → STCG / LTCG totals for Schedule CG.
 *
 * What we take for filing:
 * - Equity MF STCG → stcg_111a; LTCG → ltcg_112a
 * - Debt / other STCG → stcg_other; LTCG → ltcg_other
 * - Losses (negative) → stcl_equity / ltcl (absolute)
 *
 * What we ignore for tax calc:
 * - Current portfolio value, XIRR, unrealised P&L (not realised CG)
 */

import * as XLSX from "xlsx";

export type GrowwWorkbookKind =
  | "holdings"
  | "capital_gains"
  | "unknown";

export interface GrowwXlsxFields {
  pan?: string;
  assesseeName?: string;
  mobile?: string;
  asOnDate?: string;
  totalInvested?: number;
  currentValue?: number;
  unrealisedPnL?: number;
  holdingCount?: number;
}

export interface GrowwXlsxParseResult {
  kind: GrowwWorkbookKind;
  fields: GrowwXlsxFields;
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
  parseMode: "extracted" | "failed" | "wrong_document";
  /** User-facing guidance when holdings (or empty) file is uploaded */
  guidance?: string[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseNum(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) return round2(raw);
  if (typeof raw !== "string") return undefined;
  const cleaned = raw.replace(/[,₹\s]/g, "").replace(/\((.*)\)/, "-$1");
  if (!cleaned || cleaned === "-" || /^n\/?a$/i.test(cleaned)) return undefined;
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? round2(n) : undefined;
}

function cellStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function sheetToMatrix(sheet: XLSX.WorkSheet): string[][] {
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });
  return rows.map((row) =>
    (Array.isArray(row) ? row : []).map((c) => cellStr(c))
  );
}

function flattenText(matrices: string[][][]): string {
  return matrices
    .flat()
    .flat()
    .join(" ")
    .toLowerCase();
}

function detectKind(
  sheetNames: string[],
  text: string
): GrowwWorkbookKind {
  const names = sheetNames.map((s) => s.toLowerCase()).join(" ");
  if (
    text.includes("holding summary") ||
    text.includes("holdings as on") ||
    text.includes("no holdings found") ||
    (names.includes("holding") && !text.includes("capital gain"))
  ) {
    return "holdings";
  }
  if (
    text.includes("capital gain") ||
    text.includes("short term") ||
    text.includes("long term") ||
    text.includes("stcg") ||
    text.includes("ltcg") ||
    names.includes("capital") ||
    names.includes("gain") ||
    names.includes("pnl") ||
    names.includes("p&l")
  ) {
    return "capital_gains";
  }
  return "unknown";
}

function extractIdentity(matrix: string[][]): GrowwXlsxFields {
  const fields: GrowwXlsxFields = {};
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    const key = (row[0] ?? "").toLowerCase();
    const val = row[1] ?? "";
    if (key === "name" && val) fields.assesseeName = val;
    if (key === "pan" && val) fields.pan = val.toUpperCase();
    if ((key === "mobile number" || key === "mobile") && val) {
      fields.mobile = val;
    }
    const asOn = row.join(" ").match(/HOLDINGS AS ON\s+(\d{4}-\d{2}-\d{2})/i);
    if (asOn) fields.asOnDate = asOn[1];
  }

  // Summary row: headers then values
  for (let i = 0; i < matrix.length - 1; i++) {
    const header = matrix[i].map((c) => c.toLowerCase());
    if (header.includes("total investments") && header.includes("current portfolio value")) {
      const vals = matrix[i + 1];
      fields.totalInvested = parseNum(vals[0]);
      fields.currentValue = parseNum(vals[1]);
      fields.unrealisedPnL = parseNum(vals[2]);
    }
  }

  // Count scheme rows under holdings table
  const headerIdx = matrix.findIndex((r) =>
    r.some((c) => /^scheme name$/i.test(c))
  );
  if (headerIdx >= 0) {
    let count = 0;
    for (let i = headerIdx + 1; i < matrix.length; i++) {
      const name = matrix[i][0] ?? "";
      if (!name || /^no holdings/i.test(name)) continue;
      if (/^[A-Za-z0-9].{2,}/.test(name)) count += 1;
    }
    fields.holdingCount = count;
  }

  return fields;
}

function normHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function findHeaderRow(matrix: string[][]): {
  index: number;
  headers: string[];
} | null {
  for (let i = 0; i < matrix.length; i++) {
    const cells = matrix[i].map(normHeader).filter(Boolean);
    const joined = cells.join("|");
    const looksLikeCg =
      (joined.includes("stcg") || joined.includes("short_term")) &&
      (joined.includes("ltcg") || joined.includes("long_term"));
    const looksLikeTxn =
      joined.includes("scheme") &&
      (joined.includes("sale") ||
        joined.includes("redeem") ||
        joined.includes("gain") ||
        joined.includes("purchase"));
    if (looksLikeCg || looksLikeTxn) {
      return { index: i, headers: matrix[i].map(normHeader) };
    }
  }
  return null;
}

function colIndex(headers: string[], ...candidates: string[]): number {
  for (const c of candidates) {
    const i = headers.findIndex(
      (h) => h === c || h.includes(c) || c.includes(h)
    );
    if (i >= 0) return i;
  }
  return -1;
}

function isEquityCategory(raw: string): boolean {
  const t = raw.toLowerCase();
  if (!t) return true; // default equity MF on Groww CG reports
  if (
    t.includes("debt") ||
    t.includes("liquid") ||
    t.includes("overnight") ||
    t.includes("arbitrage") ||
    t.includes("gilt") ||
    (t.includes("hybrid") && t.includes("conservative"))
  ) {
    return false;
  }
  return (
    t.includes("equity") ||
    t.includes("elss") ||
    t.includes("index") ||
    t.includes("flexi") ||
    t.includes("large") ||
    t.includes("mid") ||
    t.includes("small") ||
    t.includes("stock") ||
    t.includes("eq")
  );
}

function splitGainLoss(net: number): { gain?: number; loss?: number } {
  if (net > 0) return { gain: round2(net) };
  if (net < 0) return { loss: round2(Math.abs(net)) };
  return {};
}

/**
 * Sum STCG/LTCG columns from a capital-gains style sheet.
 * Supports summary totals and per-scheme / per-trade rows.
 */
function parseCapitalGainsMatrix(matrix: string[][]): {
  capitalGains: GrowwXlsxParseResult["capitalGains"];
  rowCount: number;
} {
  const capitalGains: GrowwXlsxParseResult["capitalGains"] = {};
  const header = findHeaderRow(matrix);
  if (!header) {
    // Fallback: scan for labelled total cells
    let stcg = 0;
    let ltcg = 0;
    let found = false;
    for (const row of matrix) {
      const line = row.join(" ").toLowerCase();
      if (!line.includes("stcg") && !line.includes("ltcg") && !line.includes("short") && !line.includes("long")) {
        continue;
      }
      for (let i = 0; i < row.length; i++) {
        const label = row[i].toLowerCase();
        const next = parseNum(row[i + 1]);
        if (next === undefined) continue;
        if (/stcg|short\s*term/.test(label)) {
          stcg += next;
          found = true;
        }
        if (/ltcg|long\s*term/.test(label)) {
          ltcg += next;
          found = true;
        }
      }
    }
    if (found) {
      const st = splitGainLoss(stcg);
      const lt = splitGainLoss(ltcg);
      if (st.gain) capitalGains.stcg_111a = st.gain;
      if (st.loss) capitalGains.stcl_equity = st.loss;
      if (lt.gain) capitalGains.ltcg_112a = lt.gain;
      if (lt.loss) capitalGains.ltcl = lt.loss;
    }
    return { capitalGains, rowCount: 0 };
  }

  const { index, headers } = header;
  const iScheme = colIndex(headers, "scheme_name", "scheme", "scrip", "stock_name", "name");
  const iCat = colIndex(headers, "category", "sub_category", "asset_class", "type");
  const iStcg = colIndex(
    headers,
    "stcg",
    "short_term_capital_gain",
    "short_term_gain",
    "short_term",
    "st_gain"
  );
  const iLtcg = colIndex(
    headers,
    "ltcg",
    "long_term_capital_gain",
    "long_term_gain",
    "long_term",
    "lt_gain"
  );
  const iGain = colIndex(headers, "capital_gain", "gain_loss", "net_gain", "profit_loss", "returns");
  const iHolding = colIndex(headers, "holding_period", "holding_days", "period");

  let eqSt = 0;
  let eqLt = 0;
  let othSt = 0;
  let othLt = 0;
  let rowCount = 0;
  let detailHadAmounts = false;

  for (let r = index + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (row.every((c) => !c)) continue;
    const first = (row[0] ?? "").toLowerCase();
    const isTotalRow =
      first.includes("total") ||
      first.includes("grand") ||
      first.includes("summary");

    const stcg = iStcg >= 0 ? parseNum(row[iStcg]) : undefined;
    const ltcg = iLtcg >= 0 ? parseNum(row[iLtcg]) : undefined;
    const gain = iGain >= 0 ? parseNum(row[iGain]) : undefined;

    // Prefer scheme/trade rows for equity vs debt split; TOTAL is fallback only.
    if (isTotalRow) {
      if (!detailHadAmounts && (stcg !== undefined || ltcg !== undefined || gain !== undefined)) {
        if (stcg !== undefined) eqSt += stcg;
        if (ltcg !== undefined) eqLt += ltcg;
        if (gain !== undefined && stcg === undefined && ltcg === undefined) {
          eqSt += gain;
        }
        rowCount += 1;
      }
      continue;
    }

    const cat = iCat >= 0 ? row[iCat] : "";
    const equity = isEquityCategory(cat || (iScheme >= 0 ? row[iScheme] : ""));

    if (stcg === undefined && ltcg === undefined && gain !== undefined) {
      const holding = iHolding >= 0 ? row[iHolding].toLowerCase() : "";
      const days = parseNum(holding);
      const isLong =
        holding.includes("long") ||
        (days !== undefined && days > 365) ||
        holding.includes("ltcg");
      if (isLong) {
        if (equity) eqLt += gain;
        else othLt += gain;
      } else {
        if (equity) eqSt += gain;
        else othSt += gain;
      }
      detailHadAmounts = true;
      rowCount += 1;
      continue;
    }

    if (stcg === undefined && ltcg === undefined) continue;
    detailHadAmounts = true;
    rowCount += 1;
    if (stcg !== undefined) {
      if (equity) eqSt += stcg;
      else othSt += stcg;
    }
    if (ltcg !== undefined) {
      if (equity) eqLt += ltcg;
      else othLt += ltcg;
    }
  }

  const mapBucket = (
    net: number,
    gainKey: keyof GrowwXlsxParseResult["capitalGains"],
    lossKey: keyof GrowwXlsxParseResult["capitalGains"]
  ) => {
    const { gain, loss } = splitGainLoss(net);
    if (gain) capitalGains[gainKey] = round2((capitalGains[gainKey] ?? 0) + gain);
    if (loss) capitalGains[lossKey] = round2((capitalGains[lossKey] ?? 0) + loss);
  };

  mapBucket(eqSt, "stcg_111a", "stcl_equity");
  mapBucket(eqLt, "ltcg_112a", "ltcl");
  mapBucket(othSt, "stcg_other", "stcl_equity");
  mapBucket(othLt, "ltcg_other", "ltcl");

  return { capitalGains, rowCount };
}

function toFacts(
  fields: GrowwXlsxFields,
  cg: GrowwXlsxParseResult["capitalGains"],
  kind: GrowwWorkbookKind
): GrowwXlsxParseResult["facts"] {
  const facts: GrowwXlsxParseResult["facts"] = [];
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
      confidence: kind === "capital_gains" ? 0.9 : 0.85,
      source: "groww_xlsx",
      needsUserConfirmation: confirm,
    });
  };

  push("pan", "PAN", fields.pan, false);
  push("assessee_name", "Name", fields.assesseeName, false);
  push("as_on_date", "Holdings as on", fields.asOnDate, false);
  push("holding_count", "Schemes held", fields.holdingCount, false);
  push("unrealised_pnl", "Unrealised P/L (not taxable yet)", fields.unrealisedPnL, false);
  push("stcg_111a", "Equity STCG (111A)", cg.stcg_111a);
  push("ltcg_112a", "Equity LTCG (112A)", cg.ltcg_112a);
  push("stcl_equity", "STCL for set-off", cg.stcl_equity);
  push("ltcl", "LTCL for set-off", cg.ltcl);
  push("stcg_other", "Non-equity STCG", cg.stcg_other);
  push("ltcg_other", "Non-equity LTCG", cg.ltcg_other);
  return facts;
}

export function parseGrowwWorkbookBuffer(buffer: Buffer): GrowwXlsxParseResult {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  } catch {
    return {
      kind: "unknown",
      fields: {},
      capitalGains: {},
      facts: [],
      summary: [],
      warnings: ["Could not open this Excel file. Re-download from Groww Reports."],
      parseMode: "failed",
    };
  }

  if (!workbook.SheetNames.length) {
    return {
      kind: "unknown",
      fields: {},
      capitalGains: {},
      facts: [],
      summary: [],
      warnings: ["Excel file has no sheets."],
      parseMode: "failed",
    };
  }

  const matrices = workbook.SheetNames.map((name) =>
    sheetToMatrix(workbook.Sheets[name])
  );
  const text = flattenText(matrices);
  const kind = detectKind(workbook.SheetNames, text);
  const primary = matrices[0] ?? [];
  const fields = extractIdentity(primary);

  if (kind === "holdings") {
    const empty =
      (fields.holdingCount ?? 0) === 0 ||
      text.includes("no holdings found") ||
      ((fields.totalInvested ?? 0) === 0 && (fields.currentValue ?? 0) === 0);

    return {
      kind: "holdings",
      fields,
      capitalGains: {},
      facts: toFacts(fields, {}, "holdings"),
      summary: [
        empty
          ? "Groww Mutual Fund holdings export — no holdings / zero portfolio."
          : `Groww holdings snapshot${fields.asOnDate ? ` as on ${fields.asOnDate}` : ""}.`,
      ],
      warnings: [
        "Holdings / portfolio value is unrealised — it is not capital gains for ITR.",
        "For filing, download Capital Gains – Mutual Funds (and Stocks if needed) for the financial year.",
      ],
      guidance: [
        "Groww → Profile / Reports → Capital Gains – Mutual Funds → choose FY → Download.",
        "Also upload CAMS Capital Gain / Loss PDF if funds are held outside Groww.",
        "Do not use Holdings or User Profile exports for Schedule CG.",
      ],
      parseMode: "wrong_document",
    };
  }

  // Capital gains (or unknown that still has CG-looking columns)
  let mergedCg: GrowwXlsxParseResult["capitalGains"] = {};
  let totalRows = 0;
  for (const matrix of matrices) {
    const { capitalGains, rowCount } = parseCapitalGainsMatrix(matrix);
    totalRows += rowCount;
    for (const [k, v] of Object.entries(capitalGains)) {
      if (typeof v !== "number") continue;
      const key = k as keyof typeof mergedCg;
      mergedCg[key] = round2((mergedCg[key] ?? 0) + v);
    }
  }

  if (Object.keys(mergedCg).length === 0) {
    return {
      kind: kind === "capital_gains" ? "capital_gains" : "unknown",
      fields,
      capitalGains: {},
      facts: toFacts(fields, {}, kind),
      summary: ["Opened Excel but could not find STCG/LTCG columns."],
      warnings: [
        "Expected a Capital Gains report with STCG/LTCG (or gain) columns.",
        "From Groww Reports, download Capital Gains – Mutual Funds for the FY — not Holdings.",
      ],
      guidance: [
        "Groww → Reports → Capital Gains – Mutual Funds → select FY → Download Excel.",
      ],
      parseMode: "failed",
    };
  }

  const summaryBits = [
    mergedCg.stcg_111a != null
      ? `Equity STCG ₹${mergedCg.stcg_111a.toLocaleString("en-IN")}`
      : null,
    mergedCg.ltcg_112a != null
      ? `Equity LTCG ₹${mergedCg.ltcg_112a.toLocaleString("en-IN")}`
      : null,
    mergedCg.stcl_equity != null
      ? `STCL ₹${mergedCg.stcl_equity.toLocaleString("en-IN")}`
      : null,
    mergedCg.ltcl != null
      ? `LTCL ₹${mergedCg.ltcl.toLocaleString("en-IN")}`
      : null,
    mergedCg.stcg_other != null
      ? `Other STCG ₹${mergedCg.stcg_other.toLocaleString("en-IN")}`
      : null,
    mergedCg.ltcg_other != null
      ? `Other LTCG ₹${mergedCg.ltcg_other.toLocaleString("en-IN")}`
      : null,
  ].filter(Boolean);

  return {
    kind: "capital_gains",
    fields,
    capitalGains: mergedCg,
    facts: toFacts(fields, mergedCg, "capital_gains"),
    summary: [
      `Parsed Groww / broker capital gains Excel (${totalRows} data row${totalRows === 1 ? "" : "s"}).`,
      summaryBits.join(" · "),
    ],
    warnings: [
      "Confirm STCG/LTCG with your broker statement before filing.",
      "Equity MF gains map to 111A / 112A; debt/other to slab / other LTCG buckets.",
    ],
    parseMode: "extracted",
  };
}

export function isSpreadsheetFile(fileName: string, mime: string): boolean {
  const lower = fileName.toLowerCase();
  return (
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".csv") ||
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    mime === "text/csv"
  );
}
