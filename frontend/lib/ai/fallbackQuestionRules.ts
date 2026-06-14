import {
  generateFollowUpQuestions,
  type FollowUpQuestion,
  type QuestionEngineContext,
} from "@/lib/engine/questionEngine";

export type { FollowUpQuestion, QuestionEngineContext };

/** Deterministic rule-based questions — used when LLM is unavailable or fails. */
export function generateRuleBasedQuestions(
  ctx: QuestionEngineContext
): FollowUpQuestion[] {
  return generateFollowUpQuestions(ctx);
}

/** @deprecated Use generateRuleBasedQuestions */
export const generateFallbackQuestions = generateRuleBasedQuestions;
