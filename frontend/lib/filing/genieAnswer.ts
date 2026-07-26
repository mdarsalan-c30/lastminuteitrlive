import { completeGeminiText } from "@/lib/ai/providers/geminiText";
import { isGeminiConfigured } from "@/lib/ai/providers/gemini";
import { completeFilingAssistantText } from "@/lib/ai/groqAdvisor";
import { lookupLocalAnswer } from "@/lib/filing/genieKnowledge";
import { formatGenieContextBlock, type GenieChatContext } from "@/lib/filing/genieContext";
import {
  bestRetrievalScore,
  retrieveGenieChunks,
  type RetrievedChunk,
} from "@/lib/filing/genieRetrieval";
import { buildGenieSystemPrompt, buildGenieUserPrompt } from "@/lib/filing/geniePrompt";
import {
  answerFromDocuments,
  isDocumentPersonalQuestion,
} from "@/lib/filing/genieDocumentContext";

export type GenieAnswerSource = "local" | "retrieved" | "llm" | "fallback" | "documents";
export interface GenieAnswerResult {
  text: string;
  source: GenieAnswerSource;
  confidence: number;
  citations?: Array<{ title: string; href: string }>;
}

const RETRIEVAL_COMPOSE_THRESHOLD = 8;
const FALLBACK_ANSWER =
  "I couldn't verify enough information to answer that safely, so I won't guess. Tell me the document or field you want to check—for example, “salary in my Form 16” or “why is AIS different?”";

function formatCitations(chunks: RetrievedChunk[]) {
  return chunks
    .filter((chunk) => chunk.href)
    .slice(0, 2)
    .map((chunk) => ({ title: chunk.title, href: chunk.href! }));
}

function citationsText(citations: Array<{ title: string; href: string }>) {
  return citations.map((citation) => `• ${citation.title}: ${citation.href}`).join("\n");
}

function composeFromRetrieval(chunks: RetrievedChunk[]): string {
  const top = chunks[0];
  const lines = top.text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("•") || line.startsWith("-") || line.startsWith("Q:"))
    .slice(0, 7);
  if (lines.length < 2) {
    lines.length = 0;
    for (const sentence of top.text
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter((item) => item.length > 20)
      .slice(0, 5)) {
      lines.push(`• ${sentence.trim()}`);
    }
  }
  const citations = formatCitations(chunks);
  if (citations.length) lines.push(`• Read more: ${citations[0].title}`);
  return lines.join("\n");
}

function formatRetrievedExcerpts(chunks: RetrievedChunk[]): string {
  return chunks
    .slice(0, 3)
    .map(
      (chunk, index) =>
        `[${index + 1}] ${chunk.title} (${chunk.source})\n${chunk.text.slice(0, 600)}${
          chunk.text.length > 600 ? "…" : ""
        }`
    )
    .join("\n\n");
}

export async function answerGenieQuestion(
  question: string,
  context?: GenieChatContext
): Promise<GenieAnswerResult> {
  const trimmed = question.trim();
  if (!trimmed) return { text: FALLBACK_ANSWER, source: "fallback", confidence: 0 };

  if (/^(ok|okay|thanks|thank you|got it|cool|great)[\s!.]*$/i.test(trimmed)) {
    return {
      text: "You're welcome. Ask me about any field, uploaded document, or tax calculation whenever you need help.",
      source: "local",
      confidence: 1,
    };
  }

  const docLayerActive =
    (context?.documents?.connectedConnectors.length ?? 0) > 0 ||
    isDocumentPersonalQuestion(trimmed);
  if (docLayerActive) {
    const docAnswer = answerFromDocuments(trimmed, context?.documents);
    if (docAnswer) {
      return {
        text: docAnswer,
        source: "documents",
        confidence: context?.documents?.connectedConnectors.length ? 0.95 : 0.5,
      };
    }
  }

  const local = lookupLocalAnswer(trimmed);
  if (local) return { text: local, source: "local", confidence: 1 };

  const retrieved = retrieveGenieChunks(trimmed, context, 5);
  const topScore = bestRetrievalScore(retrieved);
  const citations = formatCitations(retrieved);
  if (topScore >= RETRIEVAL_COMPOSE_THRESHOLD) {
    return {
      text: composeFromRetrieval(retrieved),
      source: "retrieved",
      confidence: Math.min(0.95, topScore / 20),
      citations,
    };
  }

  const contextBlock = formatGenieContextBlock(context);
  const retrievedExcerpts = formatRetrievedExcerpts(retrieved);
  const citeBlock = citationsText(citations);
  const prompt = buildGenieUserPrompt({
    question: trimmed,
    contextBlock,
    retrievedExcerpts,
    citations: citeBlock,
  });

  try {
    const content = await completeFilingAssistantText({
      systemPrompt: buildGenieSystemPrompt(trimmed),
      userPrompt: prompt,
    });
    if (content.trim()) {
      return { text: content.trim(), source: "llm", confidence: 0.75, citations };
    }
  } catch {
    // Continue to the legacy Gemini provider or a grounded local answer.
  }

  if (isGeminiConfigured()) {
    const result = await completeGeminiText({
      systemPrompt: buildGenieSystemPrompt(trimmed),
      userPrompt: prompt,
      maxOutputTokens: 800,
      temperature: 0.25,
    });
    if (!("error" in result)) {
      return { text: result.content, source: "llm", confidence: 0.7, citations };
    }
  }

  if (retrieved.length > 0 && topScore >= 3) {
    return {
      text: composeFromRetrieval(retrieved),
      source: "retrieved",
      confidence: topScore / 30,
      citations,
    };
  }
  return { text: FALLBACK_ANSWER, source: "fallback", confidence: 0.1 };
}
