import { AI_GUARDRAILS, AI_SYSTEM_PROMPT } from "./guardrails";
import { AI_MASTER_SYSTEM_PROMPT } from "@/lib/ai/aiMasterPromptContext";

export function buildCompanionGuidancePrompt(context: {
  form?: string;
  stepId?: string;
  stepTitle?: string;
  portalField?: string;
  ourValue?: string | number | null;
  proofRequired?: string[];
  extra?: Record<string, unknown>;
}): { systemPrompt: string; userPrompt: string } {
  // AI_API_TODO — live companion LLM uses this system stack when keys exist.
  const formHint =
    context.form === "ITR-3" || context.form === "ITR-4"
      ? "This user is on a business/profession form — emphasise Schedule BP / presumptive rules."
      : context.form === "ITR-2"
        ? "This user may have capital gains, VDA, or foreign assets — emphasise Schedule CG / VDA / FA."
        : "This user is on a simple salaried path — keep steps short.";

  return {
    systemPrompt: `${AI_SYSTEM_PROMPT}\n\n${AI_GUARDRAILS}\n\n${AI_MASTER_SYSTEM_PROMPT}\n\n${formHint}`,
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
