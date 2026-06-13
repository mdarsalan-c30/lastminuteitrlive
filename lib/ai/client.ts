import type {
  AiExplainRequest,
  AiQuestionsRequest,
  FollowUpQuestionsResponse,
  PlainEnglishExplainOutput,
} from "./schemas";

export interface AiQuestionsApiResponse {
  questions: FollowUpQuestionsResponse["questions"];
  source: "rules" | "rules+llm";
  llmUsed: boolean;
  fallback: boolean;
  escalation: "none" | "ca_review";
  message?: string;
}

export interface AiExplainApiResponse {
  explain: PlainEnglishExplainOutput;
  source: "llm" | "rules";
  fallback: boolean;
  message?: string;
}

export async function fetchAiQuestions(
  body: AiQuestionsRequest
): Promise<AiQuestionsApiResponse> {
  const res = await fetch("/api/ai/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`AI questions failed: ${res.status}`);
  }
  return res.json() as Promise<AiQuestionsApiResponse>;
}

export async function fetchAiExplain(
  body: AiExplainRequest
): Promise<AiExplainApiResponse> {
  const res = await fetch("/api/ai/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`AI explain failed: ${res.status}`);
  }
  return res.json() as Promise<AiExplainApiResponse>;
}
