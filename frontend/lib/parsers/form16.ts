import "./polyfill";
import { PDFParse, PasswordException } from "pdf-parse";

export type FieldConfidence = "high" | "review" | "missing";
export type ParseMode = "extracted" | "demo_fallback";
export type Form16PartKind = "part_a" | "part_b" | "annexure" | "unknown";

export interface Form16Fields {
  employer?: string;
  grossSalary?: number;
  tds?: number;
  section80C?: number;
  section80D?: number;
  npsExtra?: number;
  hraReceived?: number;
  actualRentPaid?: number;
  cityTier?: "metro" | "non_metro";
}

export interface Form16ParseResult {
  fields: Form16Fields;
  confidence: Record<string, FieldConfidence>;
  parseMode: ParseMode;
  warnings: string[];
}

export interface Form16FileParseResult {
  name: string;
  partKind: Form16PartKind;
  textLength: number;
  fields: Form16Fields;
  confidence: Record<string, FieldConfidence>;
  parseMode: ParseMode;
  warnings: string[];
  error?: string;
}

export interface Form16MultiParseResult extends Form16ParseResult {
  files: Form16FileParseResult[];
  filenames: string[];
}

export class Form16PdfOpenError extends Error {
  readonly code: "password_required" | "parse_failed";

  constructor(message: string, code: "password_required" | "parse_failed") {
    super(message);
    this.name = "Form16PdfOpenError";
    this.code = code;
  }
}

const DEMO_FALLBACK_FIELDS: Form16Fields = {
  employer: "Acme Pvt Ltd",
  grossSalary: 1200000,
  tds: 85000,
  section80C: 150000,
};

const PASSWORD_HINT =
  "Could not open PDF — check password (usually PAN in capitals)";

const PAN_PATTERN = /[A-Z]{5}[0-9]{4}[A-Z]/g;
const MIN_GROSS_SALARY = 10_000;
const MIN_TDS = 100;
const MAX_SECTION_80C = 150_000;
const MAX_SECTION_80D = 100_000;

function parseIndianAmount(raw: string): number | undefined {
  const normalized = raw.replace(/,/g, "").trim();
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value < 0) return undefined;
  return Math.round(value);
}

function firstAmountAfter(
  labelPattern: RegExp,
  text: string,
  options: { min?: number; max?: number; window?: number } = {}
): number | undefined {
  const match = labelPattern.exec(text);
  if (!match) return undefined;

  const window = options.window ?? 120;
  const tail = text.slice(match.index + match[0].length, match.index + match[0].length + window);
  const amountMatch = tail.match(/(\d[\d,]*(?:\.\d{1,2})?)/);
  if (!amountMatch) return undefined;

  const value = parseIndianAmount(amountMatch[1]);
  if (value === undefined) return undefined;
  if (options.min !== undefined && value < options.min) return undefined;
  if (options.max !== undefined && value > options.max) return undefined;
  return value;
}

function matchAmountsInText(
  text: string,
  patterns: RegExp[],
  options: { min?: number; max?: number } = {}
): number | undefined {
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (!match?.[1]) continue;
    const value = parseIndianAmount(match[1]);
    if (value === undefined) continue;
    if (options.min !== undefined && value < options.min) continue;
    if (options.max !== undefined && value > options.max) continue;
    return value;
  }
  return undefined;
}

function extractEmployerName(text: string): string | undefined {
  const patterns = [
    /Name and address of the Employer\/Specified Bank\s*\n\s*([^\n]+)/i,
    /Name and address of the Employer\/Deductor\s*\n\s*([^\n]+)/i,
    /Name and address of the Employer\s*\n\s*([^\n]+)/i,
    /Employer\s*\/\s*Deductor\s*\n\s*([^\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      const name = match[1].trim();
      if (
        name.length >= 3 &&
        !/^(PAN|TAN|Address|@)/i.test(name) &&
        !/\b\d{5,}\b/.test(name)
      ) {
        return name;
      }
    }
  }

  return undefined;
}

function extractGrossSalary(text: string): number | undefined {
  const patterns = [
    // EY/TRACES Part B: section 17(1) salary line
    /Salary\s+as\s+per\s+provisions\s+contained\s+in\s+section\s+17\s*\(\s*1\s*\)[\s\S]{0,40}?(?:\(a\)\s*)?([\d,]+(?:\.\d{1,2})?)/i,
    // EY/TRACES: (d) Total after gross salary block
    /1\.\s*Gross\s+Salary[\s\S]{0,200}?\(d\)\s*Total\s+([\d,]+(?:\.\d{1,2})?)/i,
    // Total salary from current employer
    /Total\s+amount\s+of\s+salary\s+received\s+from\s+current\s+employer[\s\S]{0,60}?([\d,]+(?:\.\d{1,2})?)/i,
    // Annexure earnings total
    /([\d,]+(?:\.\d{1,2})?)\s*Total\s*$/im,
    /Earnings\s*\/?\s*Perquisites[\s\S]{0,200}?([\d,]+(?:\.\d{1,2})?)\s*Total/i,
    // Classic TRACES Part B
    /\(1\)\s*Gross\s+Salary\s*\n\s*([\d,]+(?:\.\d{1,2})?)/i,
    /Total\s+of\s+Gross\s+Salary[\s\S]{0,80}?([\d,]+(?:\.\d{1,2})?)/i,
  ];

  const fromPatterns = matchAmountsInText(text, patterns, { min: MIN_GROSS_SALARY });
  if (fromPatterns !== undefined) return fromPatterns;

  // Avoid matching "section 17(1)" row numbers — require minimum salary
  return firstAmountAfter(/Gross\s+Salary/i, text, { min: MIN_GROSS_SALARY, window: 200 });
}

function extractTds(text: string): number | undefined {
  const patterns = [
    // EY Part A summary row: Total (Rs.) tds tds salary
    /Total\s*\(Rs\.\)\s+([\d,]+(?:\.\d{1,2})?)\s+([\d,]+(?:\.\d{1,2})?)\s+([\d,]+(?:\.\d{1,2})?)/i,
    // Certification block
    /sum\s+of\s+Rs\.\s*([\d,]+(?:\.\d{1,2})?)\s*\[.*?has\s+been\s+deducted/i,
    /has\s+been\s+deducted\s+and\s+a\s+sum\s+of\s+Rs\.\s*([\d,]+(?:\.\d{1,2})?)/i,
    // Form 12BA section 9
    /Tax\s+deducted\s+from\s+salary\s+of\s+the\s+employee\s+u\/s\s+192\s*\(\s*1\s*\)\s+([\d,]+(?:\.\d{1,2})?)/i,
    /\(c\)\s*Total\s+tax\s+paid\s+([\d,]+(?:\.\d{1,2})?)/i,
    // Classic TRACES Part A
    /Total\s+amount\s+of\s+tax\s+deducted\/collected\s*\(Rs\.\)\s*\n\s*([\d,]+(?:\.\d{1,2})?)/i,
    /Total\s+amount\s+of\s+tax\s+deducted[\s\S]{0,80}?([\d,]+(?:\.\d{1,2})?)/i,
    /Tax\s+deducted\s*\/\s*collected[\s\S]{0,80}?([\d,]+(?:\.\d{1,2})?)/i,
    /Total\s+TDS[\s\S]{0,80}?([\d,]+(?:\.\d{1,2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (!match) continue;

    // Total (Rs.) pattern has tds in group 1
    const raw = match[1];
    const value = parseIndianAmount(raw);
    if (value !== undefined && value >= MIN_TDS) return value;
  }

  return firstAmountAfter(/Total\s+amount\s+of\s+tax\s+deducted/i, text, {
    min: MIN_TDS,
    window: 120,
  });
}

function extractSection80C(text: string): number | undefined {
  const patterns = [
    /Total\s+deduction\s+under\s+section\s+80C,\s*80CCC\s+and\s+80CCD\s*\(\s*1\s*\)[\s\S]{0,80}?\(c\)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /Deduction\s+in\s+respect\s+of\s+life\s+insurance\s+premia[\s\S]{0,60}?([\d,]+(?:\.\d{1,2})?)/i,
    /Aggregate\s+of\s+deductible\s+amount\s+under\s+Chapter\s+VI-A[\s\S]{0,40}?([\d,]+(?:\.\d{1,2})?)/i,
    /Aggregate\s+amount\s+deductible\s+under\s+section\s+80C[\s\S]{0,80}?([\d,]+(?:\.\d{1,2})?)/i,
    /\(iii\)\s*Aggregate\s+amount\s+deductible\s+under\s+section\s+80C\s*\n\s*([\d,]+(?:\.\d{1,2})?)/i,
  ];

  const value = matchAmountsInText(text, patterns, { min: 1, max: MAX_SECTION_80C });
  return value;
}

function extractSection80D(text: string): number | undefined {
  const patterns = [
    /Deduction\s+in\s+respect\s+of\s+health\s+insurance\s+premia\s+under\s+section\s+80D[\s\S]{0,60}?([\d,]+(?:\.\d{1,2})?)/i,
    /Aggregate\s+amount\s+deductible\s+under\s+section\s+80D[\s\S]{0,80}?([\d,]+(?:\.\d{1,2})?)/i,
  ];

  return matchAmountsInText(text, patterns, { min: 1, max: MAX_SECTION_80D });
}

function extractHraReceived(text: string): number | undefined {
  const patterns = [
    /House\s+Rent\s+Allowance[\s\S]{0,80}?([\d,]+(?:\.\d{1,2})?)/i,
    /Allowance\s+under\s+section\s+10\s*\(\s*13\s*\(\s*A\s*\)\s*\)[\s\S]{0,80}?([\d,]+(?:\.\d{1,2})?)/i,
    /\(2\)\s*Allowances[\s\S]{0,200}?House\s+Rent[\s\S]{0,60}?([\d,]+(?:\.\d{1,2})?)/i,
  ];
  return matchAmountsInText(text, patterns, { min: 1 });
}

function extractActualRentPaid(text: string): number | undefined {
  const patterns = [
    /Rent\s+paid[\s\S]{0,60}?([\d,]+(?:\.\d{1,2})?)/i,
    /Actual\s+rent\s+paid[\s\S]{0,60}?([\d,]+(?:\.\d{1,2})?)/i,
  ];
  return matchAmountsInText(text, patterns, { min: 1 });
}

function inferCityTier(text: string): "metro" | "non_metro" | undefined {
  if (/\b(mumbai|delhi|kolkata|chennai|metro)\b/i.test(text)) return "metro";
  if (/\bnon[\s-]?metro\b/i.test(text)) return "non_metro";
  return undefined;
}

function extractPerquisitesTotal(text: string): number | undefined {
  const patterns = [
    /Value\s+of\s+perquisites[\s\S]{0,80}?(\d[\d,]*(?:\.\d{1,2})?)/i,
    /Total\s+value\s+of\s+perquisites[\s\S]{0,80}?(\d[\d,]*(?:\.\d{1,2})?)/i,
    /12BA[\s\S]{0,120}?Total[\s\S]{0,40}?(\d[\d,]*(?:\.\d{1,2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      const value = parseIndianAmount(match[1]);
      if (value !== undefined) return value;
    }
  }

  return undefined;
}

function scoreConfidence(
  value: string | number | undefined,
  kind: "text" | "amount"
): FieldConfidence {
  if (value === undefined || value === "") return "missing";
  if (kind === "amount" && typeof value === "number" && value > 0) return "high";
  if (kind === "text" && typeof value === "string" && value.length >= 3) {
    return "high";
  }
  return "review";
}

export function detectForm16PartKind(
  filename: string,
  text?: string
): Form16PartKind {
  const lower = filename.toLowerCase();
  if (/part\s*a|parta|_parta|_a[\._\s\(]|form16a/i.test(lower)) return "part_a";
  if (/part\s*b|partb|_partb|_b[\._\s\(]|form16b/i.test(lower)) return "part_b";
  if (/12ba|anex|annexure/i.test(lower)) return "annexure";

  if (text) {
    if (/PART\s+A|Certificate\s+under\s+section\s+203/i.test(text)) return "part_a";
    if (/PART\s+B|Annexure\s+I|Salary\s+under\s+section\s+17/i.test(text)) {
      return "part_b";
    }
    if (/12BA|ANNEXURE\s+12BA|Value\s+of\s+perquisites/i.test(text)) {
      return "annexure";
    }
  }

  return "unknown";
}

function partKindLabel(kind: Form16PartKind): string {
  switch (kind) {
    case "part_a":
      return "Part A";
    case "part_b":
      return "Part B";
    case "annexure":
      return "Annexure (12BA)";
    default:
      return "Form 16";
  }
}

export function parseForm16Text(text: string, partKind: Form16PartKind = "unknown"): Form16ParseResult {
  const normalized = text.replace(/\r\n/g, "\n");
  const employer = extractEmployerName(normalized);
  const grossSalary = extractGrossSalary(normalized);
  const tds = extractTds(normalized);
  const skipChapterVia =
    partKind === "annexure" || partKind === "part_a";
  const section80C = skipChapterVia ? undefined : extractSection80C(normalized);
  const section80D = skipChapterVia ? undefined : extractSection80D(normalized);
  const hraReceived = skipChapterVia ? undefined : extractHraReceived(normalized);
  const actualRentPaid = skipChapterVia ? undefined : extractActualRentPaid(normalized);
  const cityTier = skipChapterVia ? undefined : inferCityTier(normalized);

  const fields: Form16Fields = {};
  if (employer) fields.employer = employer;
  if (grossSalary !== undefined) fields.grossSalary = grossSalary;
  if (tds !== undefined) fields.tds = tds;
  if (section80C !== undefined) fields.section80C = section80C;
  if (section80D !== undefined) fields.section80D = section80D;
  if (hraReceived !== undefined) fields.hraReceived = hraReceived;
  if (actualRentPaid !== undefined) fields.actualRentPaid = actualRentPaid;
  if (cityTier !== undefined) fields.cityTier = cityTier;

  const confidence: Record<string, FieldConfidence> = {
    employer: scoreConfidence(fields.employer, "text"),
    grossSalary: scoreConfidence(fields.grossSalary, "amount"),
    tds: scoreConfidence(fields.tds, "amount"),
    section80C: scoreConfidence(fields.section80C, "amount"),
    section80D: scoreConfidence(fields.section80D, "amount"),
    npsExtra: scoreConfidence(fields.npsExtra, "amount"),
    hraReceived: scoreConfidence(fields.hraReceived, "amount"),
    actualRentPaid: scoreConfidence(fields.actualRentPaid, "amount"),
  };

  const hasCoreFields =
    confidence.grossSalary !== "missing" && confidence.tds !== "missing";

  if (hasCoreFields) {
    const warnings: string[] = [];
    if (confidence.employer === "missing") {
      warnings.push("Employer name not found — enter manually.");
    }
    if (confidence.section80C === "missing") {
      warnings.push("Section 80C total not found — enter manually.");
    }
    return { fields, confidence, parseMode: "extracted", warnings };
  }

  const hasPartialFields = Object.values(fields).some((v) => v !== undefined);

  if (hasPartialFields) {
    const warnings: string[] = [];
    if (partKind !== "unknown") {
      warnings.push(`Parsed ${partKindLabel(partKind)} — some fields may need other parts.`);
    }
    if (confidence.grossSalary === "missing" && partKind === "part_a") {
      warnings.push("Gross salary is usually on Part B — upload Part B if missing.");
    }
    if (confidence.tds === "missing" && partKind === "part_b") {
      warnings.push("TDS is usually on Part A — upload Part A if missing.");
    }
    return { fields, confidence, parseMode: "extracted", warnings };
  }

  return {
    fields: { ...DEMO_FALLBACK_FIELDS },
    confidence: {
      employer: "missing",
      grossSalary: "missing",
      tds: "missing",
      section80C: "missing",
      section80D: "missing",
      npsExtra: "missing",
    },
    parseMode: "demo_fallback",
    warnings: [
      "Could not read salary or TDS from this PDF. Sample numbers shown — verify against your Form 16.",
      "If this is a scanned photo PDF, download a text-based PDF from the TRACES portal.",
    ],
  };
}

function isPasswordRelatedError(error: unknown): boolean {
  if (error instanceof PasswordException) return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("password") ||
      msg.includes("encrypted") ||
      msg.includes("decrypt")
    );
  }
  return false;
}

export interface ParseForm16PdfOptions {
  password?: string;
  filename?: string;
}

async function extractForm16PdfText(
  buffer: Buffer,
  password?: string
): Promise<string> {
  let parser: PDFParse | undefined;
  try {
    parser = new PDFParse({
      data: buffer,
      ...(password ? { password } : {}),
    });
    const result = await parser.getText();
    return result.text?.trim() ?? "";
    } catch (error) {
    console.error("[DEBUG PDFPARSE ERROR]", error);
    if (isPasswordRelatedError(error)) {
      throw new Form16PdfOpenError(PASSWORD_HINT, "password_required");
    }
    throw new Form16PdfOpenError(
      "Unable to read this PDF file. Ensure it is a text-based Form 16 PDF.",
      "parse_failed"
    );
  } finally {
    await parser?.destroy();
  }
}

export async function parseForm16Pdf(
  buffer: Buffer,
  options: ParseForm16PdfOptions = {}
): Promise<Form16ParseResult> {
  const text = await extractForm16PdfText(buffer, options.password);
  const partKind = detectForm16PartKind(options.filename ?? "", text);

  if (text.length < 50) {
    return {
      fields: { ...DEMO_FALLBACK_FIELDS },
      confidence: {
        employer: "missing",
        grossSalary: "missing",
        tds: "missing",
        section80C: "missing",
        section80D: "missing",
        npsExtra: "missing",
      },
      parseMode: "demo_fallback",
      warnings: [
        "PDF has little or no extractable text — it may be scanned.",
        "Download a digital PDF from TRACES or your employer portal.",
      ],
    };
  }

  return parseForm16Text(text, partKind);
}

function mergeFieldConfidence(
  target: Record<string, FieldConfidence>,
  source: Record<string, FieldConfidence>
): Record<string, FieldConfidence> {
  const rank: Record<FieldConfidence, number> = {
    high: 3,
    review: 2,
    missing: 1,
  };
  const merged = { ...target };
  for (const [key, level] of Object.entries(source)) {
    const existing = merged[key];
    if (!existing || rank[level] > rank[existing]) {
      merged[key] = level;
    }
  }
  return merged;
}

function isUsablePartField(
  part: Form16FileParseResult,
  key: keyof Form16Fields
): boolean {
  if (part.error || part.parseMode === "demo_fallback") return false;
  const confidence = part.confidence[key];
  if (confidence === "missing") return false;
  return part.fields[key] !== undefined;
}

function confidenceFromMergedFields(fields: Form16Fields): Record<string, FieldConfidence> {
  return {
    employer: scoreConfidence(fields.employer, "text"),
    grossSalary: scoreConfidence(fields.grossSalary, "amount"),
    tds: scoreConfidence(fields.tds, "amount"),
    section80C: scoreConfidence(fields.section80C, "amount"),
    section80D: scoreConfidence(fields.section80D, "amount"),
    npsExtra: scoreConfidence(fields.npsExtra, "amount"),
    hraReceived: scoreConfidence(fields.hraReceived, "amount"),
    actualRentPaid: scoreConfidence(fields.actualRentPaid, "amount"),
  };
}

function mergeForm16FileResults(
  fileResults: Form16FileParseResult[]
): Form16ParseResult {
  const mergedFields: Form16Fields = {};
  const warnings: string[] = [];
  const successfulParts = fileResults.filter((f) => !f.error);

  const pickField = (
    kinds: Form16PartKind[],
    key: keyof Form16Fields
  ): void => {
    for (const kind of kinds) {
      const part = successfulParts.find((p) => p.partKind === kind);
      if (part && isUsablePartField(part, key)) {
        (mergedFields as Record<string, string | number>)[key] = part.fields[key]!;
        return;
      }
    }
    for (const part of successfulParts) {
      if (isUsablePartField(part, key)) {
        (mergedFields as Record<string, string | number>)[key] = part.fields[key]!;
        return;
      }
    }
  };

  pickField(["part_a", "unknown"], "employer");
  pickField(["part_a", "unknown"], "tds");
  pickField(["part_b", "unknown"], "grossSalary");
  pickField(["part_b", "unknown"], "section80C");
  pickField(["part_b", "unknown"], "section80D");
  pickField(["part_b", "unknown"], "hraReceived");
  pickField(["part_b", "unknown"], "actualRentPaid");
  pickField(["part_b", "unknown"], "cityTier");
  pickField(["annexure", "unknown"], "npsExtra");

  for (const part of successfulParts) {
    for (const warning of part.warnings) {
      if (!warnings.includes(warning)) warnings.push(warning);
    }
    if (part.partKind !== "unknown") {
      const tag = `Parsed ${partKindLabel(part.partKind)}: ${part.name}`;
      if (!warnings.includes(tag)) warnings.push(tag);
    }
  }

  for (const part of fileResults) {
    if (part.error) {
      warnings.push(`${part.name}: ${part.error}`);
    }
  }

  const mergedConfidence = confidenceFromMergedFields(mergedFields);
  const hasCoreFields =
    mergedFields.grossSalary !== undefined &&
    mergedFields.tds !== undefined &&
    mergedConfidence.grossSalary !== "missing" &&
    mergedConfidence.tds !== "missing";

  if (hasCoreFields) {
    return {
      fields: mergedFields,
      confidence: mergedConfidence,
      parseMode: "extracted",
      warnings,
    };
  }

  const hasAnyUsableField = Object.keys(mergedFields).length > 0;
  if (hasAnyUsableField) {
    warnings.push(
      "Upload Part A and Part B together for complete salary and TDS figures."
    );
    return {
      fields: mergedFields,
      confidence: mergedConfidence,
      parseMode: "demo_fallback",
      warnings,
    };
  }

  return {
    fields: { ...DEMO_FALLBACK_FIELDS },
    confidence: {
      employer: "missing",
      grossSalary: "missing",
      tds: "missing",
      section80C: "missing",
      section80D: "missing",
      npsExtra: "missing",
    },
    parseMode: "demo_fallback",
    warnings: [
      ...warnings,
      "Could not read salary or TDS from uploaded PDFs. Sample numbers shown — verify against your Form 16.",
    ],
  };
}

export async function parseForm16MultiPart(
  buffers: { name: string; buffer: Buffer }[],
  password?: string
): Promise<Form16MultiParseResult> {
  const fileResults: Form16FileParseResult[] = [];

  for (const { name, buffer } of buffers) {
    try {
      const text = await extractForm16PdfText(buffer, password);
      const partKind = detectForm16PartKind(name, text);
      const parsed = parseForm16Text(text, partKind);

      fileResults.push({
        name,
        partKind,
        textLength: text.length,
        fields: parsed.fields,
        confidence: parsed.confidence,
        parseMode: parsed.parseMode,
        warnings: parsed.warnings,
      });
    } catch (error) {
      if (error instanceof Form16PdfOpenError) {
        fileResults.push({
          name,
          partKind: detectForm16PartKind(name),
          textLength: 0,
          fields: {},
          confidence: {},
          parseMode: "demo_fallback",
          warnings: [],
          error: error.message,
        });
      } else {
        fileResults.push({
          name,
          partKind: detectForm16PartKind(name),
          textLength: 0,
          fields: {},
          confidence: {},
          parseMode: "demo_fallback",
          warnings: [],
          error: "Unable to read this PDF file.",
        });
      }
    }
  }

  const merged = mergeForm16FileResults(fileResults);

  return {
    ...merged,
    files: fileResults,
    filenames: buffers.map((b) => b.name),
  };
}

/** @internal Exported for unit tests */
export const mergeForm16FileResultsForTests = mergeForm16FileResults;

/** @internal Exported for unit tests */
export const form16ExtractorsForTests = {
  extractEmployerName,
  extractGrossSalary,
  extractTds,
  extractSection80C,
  extractSection80D,
};

/** Strip PAN-like tokens before logging — never log raw PAN. */
export function scrubPanFromLogMessage(message: string): string {
  return message.replace(PAN_PATTERN, "*****PAN*****");
}
