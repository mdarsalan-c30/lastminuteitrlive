import { AI_GUARDRAILS, AI_SYSTEM_PROMPT } from "./guardrails";

export function buildFollowUpQuestionsPrompt(context: {
  draftSummary: Record<string, unknown>;
  computeSummary?: Record<string, unknown> | null;
  existingQuestionIds: string[];
}): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `${AI_SYSTEM_PROMPT}\n\n${AI_GUARDRAILS}`,
    userPrompt: `Generate up to 4 additional CA-style follow-up questions for this ITR draft.
Return ONLY valid JSON matching:
{
  "questions": [
    {
      "id": "llm_<unique_snake_case>",
      "prompt": "question for the user",
      "whyWeAsk": "one sentence rationale",
      "category": "documents"|"income"|"deductions"|"profile"|"reconciliation",
      "priority": "high"|"medium"|"low"
    }
  ],
  "escalation": "none"|"ca_review"
}

Rules:
- Do NOT repeat questions already asked (see existingQuestionIds).
- Focus on gaps: missing proofs, ambiguous income, unreconciled TDS/AIS, deduction eligibility.
- Never ask the user to enter fake numbers or claim unsupported deductions.
- If complexity flags are present in computeSummary, prefer escalation "ca_review".

existingQuestionIds: ${JSON.stringify(context.existingQuestionIds)}

draftSummary:
${JSON.stringify(context.draftSummary, null, 2)}

computeSummary:
${JSON.stringify(context.computeSummary ?? null, null, 2)}`,
  };
}
