import { AI_GUARDRAILS, AI_SYSTEM_PROMPT } from "./guardrails";

export function buildCompanionGuidancePrompt(context: {
  form?: string;
  stepId?: string;
  stepTitle?: string;
  portalField?: string;
  ourValue?: string | number | null;
  proofRequired?: string[];
  extra?: Record<string, unknown>;
}): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `${AI_SYSTEM_PROMPT}\n\n${AI_GUARDRAILS}`,
    userPrompt: `Explain how to complete this incometax.gov.in portal step. You guide — you do NOT file.

Return ONLY valid JSON:
{
  "title": "step title",
  "stepSummary": "what this portal screen is for",
  "instructions": ["numbered-style short steps for the user"],
  "proofToKeep": ["documents to keep handy"],
  "escalation": "none"|"ca_review",
  "disclaimer": "user must verify values on the official portal"
}

Rules:
- Copy values from ourValue when provided; do not invent amounts.
- Never claim government integration or automatic filing.

context:
${JSON.stringify(context, null, 2)}`,
  };
}
