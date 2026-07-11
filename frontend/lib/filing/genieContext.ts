/**
 * Draft-aware context passed from client → Genie chat API.
 */

import type { GenieDocumentSnapshot } from "@/lib/filing/genieDocumentContext";
import { formatDocumentContextBlock } from "@/lib/filing/genieDocumentContext";

export interface GenieChatContext {
  step?: string;
  recommendedForm?: string;
  regime?: string;
  recommendedRegime?: string;
  grossSalary?: number;
  netPayable?: number;
  taxableIncome?: number;
  taxSaving?: number;
  activeField?: string;
  filingFor?: string;
  completenessScore?: number;
  filingReady?: boolean;
  missingDocuments?: string[];
  mismatchResolved?: boolean;
  incomeTypes?: string[];
  deductions?: {
    section80C?: number;
    section80D?: number;
    hraReceived?: number;
    npsExtra?: number;
  };
  riskFlags?: string[];
  recommendations?: string[];
  isRefund?: boolean;
  /** Parsed Form 16, CAMS, AIS, broker uploads */
  documents?: GenieDocumentSnapshot;
}

export function formatGenieContextBlock(context?: GenieChatContext): string {
  if (!context) return "";

  const lines: string[] = ["=== User's current return (use these numbers only — never invent) ==="];

  if (context.filingFor) lines.push(`• Filing for: ${context.filingFor}`);
  if (context.step) lines.push(`• Current step: ${context.step}`);
  if (context.recommendedForm) lines.push(`• ITR form: ${context.recommendedForm}`);
  if (context.regime) lines.push(`• Selected regime: ${context.regime}`);
  if (context.recommendedRegime && context.recommendedRegime !== context.regime) {
    lines.push(`• Engine recommends: ${context.recommendedRegime} regime`);
  }
  if (context.grossSalary != null && context.grossSalary > 0) {
    lines.push(`• Gross salary: ₹${context.grossSalary.toLocaleString("en-IN")}`);
  }
  if (context.taxableIncome != null) {
    lines.push(`• Taxable income: ₹${context.taxableIncome.toLocaleString("en-IN")}`);
  }
  if (context.netPayable != null) {
    const label = context.isRefund || context.netPayable < 0 ? "Est. refund" : "Est. tax due";
    lines.push(`• ${label}: ₹${Math.abs(context.netPayable).toLocaleString("en-IN")}`);
  }
  if (context.taxSaving != null && context.taxSaving > 0) {
    lines.push(`• Regime tax saving: ₹${context.taxSaving.toLocaleString("en-IN")}`);
  }
  if (context.completenessScore != null) {
    lines.push(`• Draft completeness: ${Math.round(context.completenessScore)}%`);
  }
  if (context.filingReady != null) {
    lines.push(`• Filing ready: ${context.filingReady ? "yes" : "not yet"}`);
  }
  if (context.mismatchResolved === false) {
    lines.push(`• ⚠ Salary/AIS mismatch not resolved yet`);
  }
  if (context.missingDocuments?.length) {
    lines.push(`• Missing docs: ${context.missingDocuments.join(", ")}`);
  }
  if (context.incomeTypes?.length) {
    lines.push(`• Income types: ${context.incomeTypes.join(", ")}`);
  }
  if (context.deductions) {
    const d = context.deductions;
    const parts: string[] = [];
    if (d.section80C) parts.push(`80C ₹${d.section80C.toLocaleString("en-IN")}`);
    if (d.section80D) parts.push(`80D ₹${d.section80D.toLocaleString("en-IN")}`);
    if (d.hraReceived) parts.push(`HRA ₹${d.hraReceived.toLocaleString("en-IN")}`);
    if (d.npsExtra) parts.push(`NPS extra ₹${d.npsExtra.toLocaleString("en-IN")}`);
    if (parts.length) lines.push(`• Deductions entered: ${parts.join(", ")}`);
  }
  if (context.riskFlags?.length) {
    lines.push(`• Risk flags: ${context.riskFlags.slice(0, 4).join("; ")}`);
  }
  if (context.recommendations?.length) {
    lines.push(`• Smart tips: ${context.recommendations.slice(0, 3).join("; ")}`);
  }
  if (context.activeField) lines.push(`• User is focused on field: ${context.activeField}`);

  const docBlock = formatDocumentContextBlock(context.documents);
  if (docBlock) {
    lines.push("");
    lines.push(docBlock);
  }

  return lines.length > 1 ? lines.join("\n") : "";
}

export function buildPersonalizationFooter(context?: GenieChatContext): string {
  if (!context) return "";
  const lines: string[] = [];

  if (context.recommendedForm) {
    lines.push(`Your draft suggests **${context.recommendedForm}**`);
  }
  if (context.recommendedRegime && context.taxSaving != null && context.taxSaving > 0) {
    lines.push(
      `${context.recommendedRegime === "old" ? "Old" : "New"} regime looks lower by ₹${context.taxSaving.toLocaleString("en-IN")} on your numbers`
    );
  }
  if (context.netPayable != null) {
    if (context.netPayable < 0) {
      lines.push(`Estimated refund: ₹${Math.abs(context.netPayable).toLocaleString("en-IN")}`);
    } else if (context.netPayable > 0) {
      lines.push(`Estimated tax due: ₹${context.netPayable.toLocaleString("en-IN")}`);
    }
  }
  if (context.mismatchResolved === false) {
    lines.push("Fix AIS/Form 16 mismatches on Review before paying");
  }
  if (context.missingDocuments?.length) {
    lines.push(`Still need: ${context.missingDocuments[0]}`);
  }

  if (lines.length === 0) return "";
  return `\n\nFor your return:\n${lines.map((l) => `• ${l.replace(/\*\*/g, "")}`).join("\n")}`;
}
