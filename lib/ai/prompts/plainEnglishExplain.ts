import { AI_GUARDRAILS, AI_SYSTEM_PROMPT } from "./guardrails";

export function buildPlainEnglishExplainPrompt(context: {
  explainType: "regime" | "deduction" | "companion";
  payload: Record<string, unknown>;
}): { systemPrompt: string; userPrompt: string } {
  const typeHint =
    context.explainType === "regime"
      ? "Explain old vs new tax regime tradeoffs for this taxpayer."
      : context.explainType === "deduction"
        ? "Explain whether and why a deduction applies, in plain English."
        : "Explain the next incometax.gov.in portal step — guidance only, no auto-filing.";

  return {
    systemPrompt: `${AI_SYSTEM_PROMPT}\n\n${AI_GUARDRAILS}`,
    userPrompt: `${typeHint}

Return ONLY valid JSON:
{
  "title": "short headline",
  "explanation": "2-4 sentences in plain English",
  "bulletPoints": ["optional supporting points"],
  "escalation": "none"|"ca_review",
  "disclaimer": "one sentence — estimates only, verify with Form 16/AIS"
}

Never change tax numbers in context — explain them only.

context:
${JSON.stringify(context.payload, null, 2)}`,
  };
}
