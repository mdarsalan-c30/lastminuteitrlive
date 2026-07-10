/**
 * LASTMINUTE ITR — AI Engine Pre-Master Routing Instructions
 *
 * Foundational system prompt + section maps for document extraction.
 * Deterministic parsers remain primary; LLM calls use this context when
 * GEMINI_API_KEY / OPENAI_API_KEY are present (see documentPipeline.ts).
 *
 * // AI_API_TODO — wire live provider keys in production; until then
 * callers should fall through to deterministic parsers.
 */

export type AiDocumentKind =
  | "form16"
  | "ais"
  | "form26as"
  | "cams"
  | "broker_pnl"
  | "bank_interest"
  | "vda"
  | "unknown";

export interface DocumentSectionDef {
  id: string;
  label: string;
  extract: string[];
  scheduleHint?: string;
}

/** Structured map of what the AI must look for per document family. */
export const DOCUMENT_SECTION_MAP: Record<string, DocumentSectionDef[]> = {
  form16: [
    {
      id: "form16.partA",
      label: "Form 16 Part A",
      extract: [
        "Employer TAN",
        "Employer Name",
        "Assessment Year",
        "Employee PAN",
        "Total Tax Deposited (cross-check vs Form 26AS)",
      ],
    },
    {
      id: "form16.partB",
      label: "Form 16 Part B",
      extract: [
        "Gross Salary u/s 17(1)",
        "Value of Perquisites u/s 17(2) — map ESOP allotment values",
        "Profits in lieu of salary u/s 17(3) — severance / ex-gratia",
        "Section 10(13A) HRA exemption",
        "Section 10(5) LTA",
        "Chapter VI-A: 80C → savings bucket; 80CCD(2) → employer NPS tracker",
      ],
    },
  ],
  broker_pnl: [
    {
      id: "broker.equity",
      label: "Equity / MF capital gains",
      extract: [
        "Sale date before vs on/after 23-Jul-2024 (STCG 20% / LTCG 12.5%)",
        "Grandfathered assets bought before 31-Jan-2018: cost, sale, FMV 31-Jan-2018 (Sec 112A)",
        "Foreign stocks / RSUs: vesting-date FMV; flag Schedule FA",
      ],
      scheduleHint: "Schedule CG",
    },
    {
      id: "broker.derivatives",
      label: "F&O / derivatives",
      extract: [
        "F&O buy/sell for absolute turnover (abs profit + abs loss + options premium)",
        "Do NOT route to Schedule CG — route to Schedule BP only",
      ],
      scheduleHint: "Schedule BP",
    },
  ],
  cams: [
    {
      id: "cams.gains",
      label: "CAMS / MF Central gains",
      extract: [
        "STCG / LTCG by scheme",
        "112A equity gains",
        "Uncertain cost or date rows → needsUserConfirmation",
      ],
      scheduleHint: "Schedule CG",
    },
  ],
  vda: [
    {
      id: "vda.transactions",
      label: "Virtual digital assets",
      extract: [
        "Per-line Cost of Acquisition",
        "Consideration Received",
        "Token symbol / name",
        "1% TDS u/s 194S if present",
      ],
      scheduleHint: "Schedule VDA — 30% per winning trade; no cross-token loss netting",
    },
  ],
  ais: [
    {
      id: "ais.sft",
      label: "AIS SFT / information",
      extract: [
        "Sale of Securities total — must match broker statement sum",
        "Interest (194A) — catch hidden FD interest",
        "Professional fees (194J) — freelance turnover alignment",
        "Dividend, TDS credits",
      ],
    },
  ],
  form26as: [
    {
      id: "form26as.tds",
      label: "Form 26AS",
      extract: [
        "TDS on salary vs Form 16 Part A Total Tax Deposited",
        "Other TDS credits (194A, 194J, 194S)",
      ],
    },
  ],
  bank_interest: [
    {
      id: "bank.interest",
      label: "Bank interest certificate",
      extract: ["Savings / FD interest totals", "Account identifiers if present"],
    },
  ],
};

export const AI_MASTER_SYSTEM_PROMPT = `### LASTMINUTE ITR - AI ENGINE PRE-MASTER ROUTING INSTRUCTIONS

You are the intelligent parsing core of the LastMinute ITR platform. When a user uploads their documents, your job is to scan the text data, extract values, map them to the correct Income Tax Department schedules, and flag mismatches against the Annual Information Statement (AIS) or Form 26AS.

Never invent amounts. If a field is unclear, set needsUserConfirmation=true and add a plain-English question.

Look at these specific files and extract exactly as follows:

1. FORM 16 (PART A & PART B)
   - Extract Employer TAN, Employer Name, Assessment Year, and PAN.
   - Cross-check "Total Tax Deposited" in Part A against the user's Form 26AS real-time record when available.
   - Extract "Gross Salary u/s 17(1)", "Value of Perquisites u/s 17(2)" (specifically map ESOP allotment values), and "Profits in lieu of salary u/s 17(3)" (map standard severance/ex-gratia payouts here).
   - Locate Section 10 exemptions: Check line 10(13A) for HRA and 10(5) for LTA.
   - Map Chapter VI-A deductions: Send Section 80C to the main savings bucket and Section 80CCD(2) directly to the Employer NPS contribution tracker.

2. CONSOLIDATED BROKER TAX P&L STATEMENTS (Zerodha, Groww, Dhan, Upstox, CAMS)
   - Identify transaction timelines: Tag shares/equity mutual funds sold before vs. on/after July 23, 2024 to apply correct capital gains rates (20% STCG / 12.5% LTCG).
   - For grandfathered assets bought before Jan 31, 2018, locate actual purchase cost, sale value, and the Fair Market Value (FMV) on 31-Jan-2018 to apply Section 112A protection logic.
   - Parse Derivative sheets: Identify F&O buy/sell details to calculate absolute values for the platform's absolute turnover metric. Do not route these to Schedule CG (Capital Gains); route them exclusively to Schedule BP (Business & Profession).
   - For Foreign Stocks / Tech RSUs: Extract vesting-date FMVs to prevent double taxation on sale. Flag any asset lines holding foreign stock for mandatory routing to Schedule FA (Foreign Assets).

3. VIRTUAL DIGITAL ASSETS / CRYPTO STATEMENTS
   - Map transaction entries line-by-line.
   - Extract "Cost of Acquisition" and "Consideration Received".
   - Flag and pass each distinct token sale to the UI step-by-step mapping wizard so the system isolates winning trades at a flat 30% tax, while completely blocking cross-token loss netting or loss carry-forward arrays.
   - Track 1% TDS credit under Section 194S when present.

4. GOVERNMENT PORTAL DATA (AIS, TIS, Form 26AS)
   - Read the "Sale of Securities" total in the AIS SFT Information panel. Verify that the sum of the user's uploaded broker statements matches this gross value perfectly.
   - Extract Section 194J professional fees to verify freelance turnover alignment, and Section 194A lines to catch hidden fixed deposit interest.

Return only JSON of shape:
{ summary: string[], facts: [{ key, label, value, confidence, source, needsUserConfirmation }], questions: string[], warnings: string[] }.
`;

const KIND_FOCUS: Record<AiDocumentKind, string> = {
  form16: "Focus on Form 16 Part A and Part B sections listed above.",
  ais: "Focus on AIS SFT, interest, dividend, TDS, and mismatch candidates.",
  form26as: "Focus on TDS credits and employer deposit totals.",
  cams: "Focus on STCG, LTCG, 112A/equity gains, and uncertain date/cost rows.",
  broker_pnl:
    "Focus on equity CG rate dates, grandfathering, F&O absolute turnover (Schedule BP), and foreign/RSU FA flags.",
  bank_interest: "Focus on savings and FD interest totals.",
  vda: "Focus on per-token cost, consideration, 194S TDS; never net losses across tokens.",
  unknown: "Extract only clearly labelled Indian tax amounts; ask questions for ambiguity.",
};

/**
 * Composes the master system prompt with kind-specific section checklist.
 */
export function getExtractionPromptForKind(kind: AiDocumentKind): string {
  const sections =
    DOCUMENT_SECTION_MAP[kind] ??
    (kind === "broker_pnl" ? DOCUMENT_SECTION_MAP.broker_pnl : undefined);
  const checklist = (sections ?? [])
    .map(
      (s) =>
        `- ${s.label} (${s.id})${s.scheduleHint ? ` → ${s.scheduleHint}` : ""}\n` +
        s.extract.map((e) => `  • ${e}`).join("\n")
    )
    .join("\n");

  return [
    AI_MASTER_SYSTEM_PROMPT,
    `Document kind: ${kind}.`,
    KIND_FOCUS[kind],
    checklist ? `Section checklist:\n${checklist}` : "",
    "Use simple labels a salaried Indian can understand.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Plain-English checklist shown in UI before upload (L3 surface). */
export function getUploadSectionChecklist(kind: AiDocumentKind): string[] {
  const sections = DOCUMENT_SECTION_MAP[kind];
  if (!sections) return ["We will only use amounts clearly printed on your document."];
  return sections.flatMap((s) => s.extract.map((e) => `${s.label}: ${e}`));
}
