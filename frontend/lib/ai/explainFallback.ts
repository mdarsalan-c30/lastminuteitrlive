import type { AiExplainRequest } from "./schemas";
import type { PlainEnglishExplainOutput } from "./schemas";

const DISCLAIMER =
  "This is guidance only — verify all figures against Form 16, AIS, and the official incometax.gov.in portal before filing.";

export function buildExplainFallback(
  request: AiExplainRequest
): PlainEnglishExplainOutput {
  const ctx = request.context;

  if (request.type === "regime") {
    const recommended = String(ctx.recommendedRegime ?? "unknown");
    const taxOld = ctx.taxOld != null ? Number(ctx.taxOld) : null;
    const taxNew = ctx.taxNew != null ? Number(ctx.taxNew) : null;
    const saving = ctx.taxSaving != null ? Number(ctx.taxSaving) : null;

    return {
      title: "Old vs new tax regime",
      explanation:
        recommended === "old"
          ? "Based on your deductions and income mix, the old regime may result in lower estimated tax because Chapter VI-A deductions apply."
          : recommended === "new"
            ? "The new regime uses lower slab rates but most deductions are not available — for your profile it may be cheaper overall."
            : "Compare both regimes using your salary, deductions, and other income. The cheaper estimated tax is shown in your compute summary.",
      bulletPoints: [
        taxOld != null ? `Estimated tax (old regime): ₹${taxOld.toLocaleString("en-IN")}` : "Old regime tax: run compute to see estimate",
        taxNew != null ? `Estimated tax (new regime): ₹${taxNew.toLocaleString("en-IN")}` : "New regime tax: run compute to see estimate",
        saving != null && saving > 0
          ? `Potential saving with recommended regime: ₹${saving.toLocaleString("en-IN")}`
          : "Switching regime may not reduce tax for every filer — confirm with your documents.",
      ],
      escalation:
        ctx.caEscalationRecommended === true ? "ca_review" : "none",
      disclaimer: DISCLAIMER,
    };
  }

  if (request.type === "deduction") {
    const section = String(ctx.section ?? "Deduction");
    const eligible = ctx.eligible === true;
    return {
      title: `${section} eligibility`,
      explanation: eligible
        ? `${section} may apply if you have valid proof and meet statutory conditions. Amounts are capped by law.`
        : `${section} may not apply to your current inputs — check regime, caps, and whether proof documents exist.`,
      bulletPoints: Array.isArray(ctx.proofRequired)
        ? (ctx.proofRequired as string[]).slice(0, 4)
        : ["Keep receipts, certificates, or statements that support the claim."],
      escalation: ctx.expertRequired === true ? "ca_review" : "none",
      disclaimer: DISCLAIMER,
    };
  }

  const stepTitle = String(ctx.stepTitle ?? ctx.portalField ?? "Portal step");
  const ourValue =
    ctx.ourValue != null ? String(ctx.ourValue) : "your computed value";
  const form = ctx.form ? String(ctx.form) : "your ITR form";
  const tips = Array.isArray(ctx.screenTips)
    ? (ctx.screenTips as string[]).slice(0, 3)
    : [];

  return {
    title: stepTitle,
    explanation: `On incometax.gov.in (${form}), enter ${ourValue} for this field after checking your documents.`,
    bulletPoints: [
      ctx.portalPath
        ? `Go to: ${String(ctx.portalPath)}`
        : "Open the matching schedule on incometax.gov.in",
      "Copy our number only if it matches Form 16, AIS, or broker statements",
      ...tips,
      "Keep proofs handy before you click Submit on the government portal",
    ].slice(0, 5),
    escalation: "none",
    disclaimer: DISCLAIMER,
  };
}
