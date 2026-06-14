import { AI_GUARDRAILS, AI_SYSTEM_PROMPT } from "./guardrails";

export function buildDeductionEligibilityPrompt(context: {
  section: string;
  claimedAmount?: number;
  cap?: number;
  regime?: string;
  proofHints?: string[];
  extra?: Record<string, unknown>;
}): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `${AI_SYSTEM_PROMPT}\n\n${AI_GUARDRAILS}`,
    userPrompt: `Explain deduction eligibility for the user.

Return ONLY valid JSON:
{
  "title": "Section headline",
  "eligible": true|false,
  "explanation": "plain English — why eligible or not",
  "proofRequired": ["documents needed if claiming"],
  "escalation": "none"|"ca_review",
  "disclaimer": "estimates only; ITD may disallow without proof"
}

Rules:
- Lawful positions only; if proof is missing, say eligible is false or conditional.
- Never invent claimed amounts.

context:
${JSON.stringify(context, null, 2)}`,
  };
}
