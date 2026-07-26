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
  hasOpenMismatch?: boolean;
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
  const money = (value: number) => Math.round(Math.abs(value)).toLocaleString("en-IN");
  if (context.grossSalary != null && context.grossSalary >= 1) {
    lines.push(`• Gross salary: ₹${money(context.grossSalary)}`);
  }
  if (context.taxableIncome != null && Math.abs(context.taxableIncome) >= 1) {
    lines.push(`• Taxable income: ₹${money(context.taxableIncome)}`);
  }
  if (context.netPayable != null && Math.abs(context.netPayable) >= 1) {
    const label = context.isRefund || context.netPayable < 0 ? "Est. refund" : "Est. tax due";
    lines.push(`• ${label}: ₹${money(context.netPayable)}`);
  }
  if (context.taxSaving != null && context.taxSaving >= 1) {
    lines.push(`• Regime tax saving: ₹${money(context.taxSaving)}`);
  }
  if (context.completenessScore != null) {
    lines.push(`• Draft completeness: ${Math.round(context.completenessScore)}%`);
  }
  if (context.filingReady != null) {
    lines.push(`• Filing ready: ${context.filingReady ? "yes" : "not yet"}`);
  }
  if (context.hasOpenMismatch) {
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
