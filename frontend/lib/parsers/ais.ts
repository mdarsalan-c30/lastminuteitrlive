/**
 * Deterministic AIS / TIS PDF parsers (no AI keys required).
 * Works on text extracted after password unlock.
 */

export type AisDocumentKind = "ais" | "tis" | "unknown";

export interface AisParseFields {
  pan?: string;
  assesseeName?: string;
  financialYear?: string;
  /** Gross salary from TDS-192 / TIS Salary category */
  grossSalary?: number;
  /** Sum of TDS deducted on salary (Active rows preferred) */
  tdsSalary?: number;
  /** Savings bank interest (SFT-016) */
  savingsInterest?: number;
  /** Dividend (SFT-015) */
  dividendIncome?: number;
  /** Sale of securities / MF (TIS category) — not taxable gain; flag for CG review */
  saleOfSecurities?: number;
}

export interface AisParseResult {
  kind: AisDocumentKind;
  fields: AisParseFields;
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

/** Indian (17,71,368) or Western (1,771,368) grouped amounts */
const INR_AMOUNT = String.raw`\d{1,3}(?:,\d{2})*,\d{3}|\d{1,3}(?:,\d{3})+|\d+`;

function parseInr(raw: string): number | undefined {
  const cleaned = raw.replace(/[,₹\s]/g, "");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function detectKind(text: string): AisDocumentKind {
  const t = text.toLowerCase();
  if (t.includes("taxpayer information summary") || t.includes("(tis)")) {
    return "tis";
  }
  if (
    t.includes("annual information statement") ||
    t.includes("part b1-information relating to tax deducted")
  ) {
    return "ais";
  }
  return "unknown";
}

function extractPan(text: string): string | undefined {
  const m = text.match(/\b([A-Z]{5}\d{4}[A-Z])\b/);
  return m?.[1];
}

function extractName(text: string): string | undefined {
  // Line typically holds: <PAN> XXXX XXXX <aadhaar-tail> <ASSESSEE NAME>
  const line = text
    .split("\n")
    .map((l) => l.trim())
    .find((l) => /[A-Z]{5}\d{4}[A-Z]/.test(l) && /[A-Z]{2,}\s+[A-Z]{2,}/.test(l));
  if (!line) return undefined;
  const withoutPan = line.replace(/[A-Z]{5}\d{4}[A-Z]/, "").replace(/X{3,}/gi, "");
  const name = withoutPan.replace(/\d+/g, "").replace(/\s+/g, " ").trim();
  return name.length >= 3 ? name : undefined;
}

function extractFy(text: string): string | undefined {
  const m =
    text.match(/Financial Year\s+(\d{4}-\d{2})/i) ||
    text.match(/F\.?Y\.?\s*(\d{4}-\d{2})/i);
  return m?.[1];
}

/** TIS summary table: "1 Salary 17,71,368 17,71,368" */
function parseTisCategories(text: string): AisParseFields {
  const fields: AisParseFields = {};
  const patterns: Array<{ key: keyof AisParseFields; re: RegExp }> = [
    {
      key: "grossSalary",
      re: new RegExp(`\\bSalary\\s+(${INR_AMOUNT})\\s+(${INR_AMOUNT})`, "i"),
    },
    {
      key: "dividendIncome",
      re: new RegExp(`\\bDividend\\s+(${INR_AMOUNT})\\s+(${INR_AMOUNT})`, "i"),
    },
    {
      key: "savingsInterest",
      re: new RegExp(
        `Interest from savings bank\\s+(${INR_AMOUNT})\\s+(${INR_AMOUNT})`,
        "i"
      ),
    },
    {
      key: "saleOfSecurities",
      re: new RegExp(
        `Sale of securities and units of mutual fund\\s+(${INR_AMOUNT})\\s+(${INR_AMOUNT})`,
        "i"
      ),
    },
  ];
  for (const { key, re } of patterns) {
    const m = text.match(re);
    if (!m) continue;
    // Prefer "Accepted by taxpayer" (2nd amount) when present
    const accepted = parseInr(m[2] ?? m[1]);
    const processed = parseInr(m[1]);
    const value = accepted ?? processed;
    if (value !== undefined) {
      (fields as Record<string, number>)[key] = value;
    }
  }
  return fields;
}

/** AIS Part B1: TDS-192 … COUNT AMOUNT → 12 17,71,368 */
function parseAisSalaryHeader(text: string): {
  grossSalary?: number;
} {
  const m2 = text.match(
    new RegExp(
      `TDS-192[\\s\\S]{0,180}?(\\d{1,2})\\s+(${INR_AMOUNT})`,
      "i"
    )
  );
  const mAnnex = text.match(
    new RegExp(
      `TDS-Ann\\.II-SAL[\\s\\S]{0,180}?(\\d{1,2})\\s+(${INR_AMOUNT})`,
      "i"
    )
  );
  const amount =
    (m2 ? parseInr(m2[2]) : undefined) ??
    (mAnnex ? parseInr(mAnnex[2]) : undefined);
  return amount !== undefined ? { grossSalary: amount } : {};
}

/** Sum Active TDS Deducted column rows under salary schedule */
function parseAisSalaryTds(text: string): number | undefined {
  // Rows like: 1 Q4(Jan-Mar) 31/03/2026 1,14,601 7,229 7,229 Active
  const rowRe = new RegExp(
    `\\d+\\s+Q[1-4]\\([^)]+\\)\\s+\\d{2}/\\d{2}/\\d{4}\\s+(${INR_AMOUNT})\\s+(${INR_AMOUNT})\\s+(${INR_AMOUNT})\\s+(Active|Inactive)`,
    "gi"
  );
  let sum = 0;
  let count = 0;
  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(text)) !== null) {
    if (match[4].toLowerCase() !== "active") continue;
    const tds = parseInr(match[2]);
    if (tds === undefined) continue;
    sum += tds;
    count += 1;
  }
  return count > 0 ? sum : undefined;
}

function parseAisInterestAndDividend(text: string): {
  savingsInterest?: number;
  dividendIncome?: number;
} {
  let savingsInterest = 0;
  let dividendIncome = 0;
  let hasSavings = false;
  let hasDiv = false;

  // Header lines: SFT-016(SB) … 1 1,090  (Indian commas). Allow short wrap.
  const sbHeaders = [
    ...text.matchAll(
      new RegExp(
        `SFT-016\\(SB\\)[\\s\\S]{0,280}?(\\d{1,2})\\s+(${INR_AMOUNT})`,
        "gi"
      )
    ),
  ];
  for (const m of sbHeaders) {
    const amt = parseInr(m[2]);
    if (amt === undefined) continue;
    savingsInterest += amt;
    hasSavings = true;
  }

  // SFT-015 blocks may wrap the TAN line; take COUNT AMOUNT after each code.
  const divHeaders = [
    ...text.matchAll(
      new RegExp(
        `SFT-015[\\s\\S]{0,320}?(\\d{1,2})\\s+(${INR_AMOUNT})(?=\\s*(?:SR\\.|Active|Inactive|\\d+\\s+SFT-|Part B|$))`,
        "gi"
      )
    ),
  ];
  for (const m of divHeaders) {
    const amt = parseInr(m[2]);
    if (amt === undefined) continue;
    dividendIncome += amt;
    hasDiv = true;
  }

  // Fallback: dividend detail rows "1 19/05/2026 72 Active"
  if (!hasDiv) {
    const detailRows = [
      ...text.matchAll(
        new RegExp(
          `\\d+\\s+\\d{2}/\\d{2}/\\d{4}\\s+(${INR_AMOUNT})\\s+Active`,
          "gi"
        )
      ),
    ];
    // Only trust this inside a Dividend section window
    const divSection = text.match(
      /Dividend[\s\S]*?(?=Interest from savings bank|Part B3|Part C|$)/i
    )?.[0];
    if (divSection) {
      for (const m of divSection.matchAll(
        new RegExp(
          `\\d+\\s+\\d{2}/\\d{2}/\\d{4}\\s+(${INR_AMOUNT})\\s+Active`,
          "gi"
        )
      )) {
        const amt = parseInr(m[1]);
        if (amt === undefined) continue;
        dividendIncome += amt;
        hasDiv = true;
      }
    } else {
      void detailRows;
    }
  }

  return {
    ...(hasSavings ? { savingsInterest } : {}),
    ...(hasDiv ? { dividendIncome } : {}),
  };
}

function toFacts(
  fields: AisParseFields,
  source: string
): AisParseResult["facts"] {
  const facts: AisParseResult["facts"] = [];
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
      confidence: 0.9,
      source,
      needsUserConfirmation: confirm,
    });
  };

  push("pan", "PAN", fields.pan, false);
  push("assessee_name", "Name", fields.assesseeName, false);
  push("financial_year", "Financial year", fields.financialYear, false);
  push("gross_salary", "Salary (AIS/TIS)", fields.grossSalary);
  push("salary", "Salary (AIS/TIS)", fields.grossSalary);
  push("tds_salary", "TDS on salary", fields.tdsSalary);
  push("savings_account_interest", "Savings bank interest", fields.savingsInterest);
  push("fd_interest", "Bank interest (savings)", fields.savingsInterest);
  push("dividend_income", "Dividend income", fields.dividendIncome);
  push(
    "sale_of_securities",
    "Sale of securities / MF (turnover — not gain)",
    fields.saleOfSecurities
  );
  return facts;
}

export function parseAisOrTisText(text: string): AisParseResult {
  const kind = detectKind(text);
  if (text.trim().length < 80) {
    return {
      kind,
      fields: {},
      facts: [],
      summary: [],
      warnings: ["PDF text too short — may still be locked or scanned."],
      parseMode: "failed",
    };
  }

  const base: AisParseFields = {
    pan: extractPan(text),
    assesseeName: extractName(text),
    financialYear: extractFy(text),
  };

  let fields: AisParseFields = { ...base };
  const warnings: string[] = [];
  const summary: string[] = [];

  if (kind === "tis") {
    fields = { ...fields, ...parseTisCategories(text) };
    summary.push("Parsed Taxpayer Information Summary (TIS).");
    if (fields.saleOfSecurities) {
      warnings.push(
        "TIS shows sale of securities/MF — this is turnover, not capital gains. Upload CAMS/broker P&L for taxable gains."
      );
    }
  } else if (kind === "ais") {
    fields = {
      ...fields,
      ...parseAisSalaryHeader(text),
      ...parseAisInterestAndDividend(text),
    };
    const tds = parseAisSalaryTds(text);
    if (tds !== undefined) fields.tdsSalary = tds;
    summary.push("Parsed Annual Information Statement (AIS).");
  } else {
    // Try both heuristics
    fields = {
      ...fields,
      ...parseTisCategories(text),
      ...parseAisSalaryHeader(text),
      ...parseAisInterestAndDividend(text),
    };
    const tds = parseAisSalaryTds(text);
    if (tds !== undefined) fields.tdsSalary = tds;
    warnings.push("Could not clearly detect AIS vs TIS — used combined heuristics.");
    summary.push("Parsed tax information PDF with heuristics.");
  }

  if (!fields.grossSalary && !fields.savingsInterest && !fields.dividendIncome) {
    return {
      kind,
      fields,
      facts: toFacts(fields, kind),
      summary,
      warnings: [
        ...warnings,
        "No salary/interest/dividend amounts found. Check password and that this is an AIS or TIS PDF.",
      ],
      parseMode: "failed",
    };
  }

  summary.push(
    [
      fields.grossSalary != null
        ? `Salary ₹${fields.grossSalary.toLocaleString("en-IN")}`
        : null,
      fields.tdsSalary != null
        ? `TDS ₹${fields.tdsSalary.toLocaleString("en-IN")}`
        : null,
      fields.savingsInterest != null
        ? `SB interest ₹${fields.savingsInterest.toLocaleString("en-IN")}`
        : null,
      fields.dividendIncome != null
        ? `Dividend ₹${fields.dividendIncome.toLocaleString("en-IN")}`
        : null,
    ]
      .filter(Boolean)
      .join(" · ")
  );

  return {
    kind: kind === "unknown" ? "ais" : kind,
    fields,
    facts: toFacts(fields, kind === "unknown" ? "ais" : kind),
    summary: summary.filter(Boolean),
    warnings,
    parseMode: "extracted",
  };
}
