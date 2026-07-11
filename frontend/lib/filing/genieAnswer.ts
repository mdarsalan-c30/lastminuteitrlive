import { completeGeminiText } from "@/lib/ai/providers/geminiText";
import { isGeminiConfigured } from "@/lib/ai/providers/gemini";
import { lookupLocalAnswer } from "@/lib/filing/genieKnowledge";
import {
  buildPersonalizationFooter,
  formatGenieContextBlock,
  type GenieChatContext,
} from "@/lib/filing/genieContext";
import {
  bestRetrievalScore,
  retrieveGenieChunks,
  type RetrievedChunk,
} from "@/lib/filing/genieRetrieval";
import {
  buildGenieSystemPrompt,
  buildGenieUserPrompt,
} from "@/lib/filing/geniePrompt";
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
const HIGH_CONFIDENCE_LOCAL = 1;

function formatCitations(chunks: RetrievedChunk[]): Array<{ title: string; href: string }> {
  return chunks
    .filter((c) => c.href)
    .slice(0, 2)
    .map((c) => ({ title: c.title, href: c.href! }));
}

function citationsText(citations: Array<{ title: string; href: string }>): string {
  if (!citations.length) return "";
  return citations.map((c) => `• ${c.title}: ${c.href}`).join("\n");
}

/** Turn retrieved chunks into a composed bullet answer (no LLM). */
function composeFromRetrieval(
  question: string,
  chunks: RetrievedChunk[],
  context?: GenieChatContext
): string {
  const top = chunks[0];
  const lines: string[] = [];

  // Extract bullet lines from top chunk
  const bulletLines = top.text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("Q:"));

  if (bulletLines.length >= 2) {
    lines.push(...bulletLines.slice(0, 7));
  } else {
    // Summarize first chunk into bullets
    const sentences = top.text
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 20)
      .slice(0, 5);
    for (const s of sentences) {
      lines.push(`• ${s.trim()}`);
    }
  }

  // Add second chunk insight if different topic
  if (chunks[1] && chunks[1].score >= RETRIEVAL_COMPOSE_THRESHOLD) {
    const extra = chunks[1].text
      .split("\n")
      .find((l) => l.trim().startsWith("•"));
    if (extra && !lines.includes(extra)) {
      lines.push(extra.trim());
    }
  }

  const citations = formatCitations(chunks);
  if (citations.length) {
    lines.push(`• Read more: ${citations[0].title}`);
  }

  const footer = buildPersonalizationFooter(context);
  return lines.join("\n") + footer;
}

function formatRetrievedExcerpts(chunks: RetrievedChunk[]): string {
  return chunks
    .slice(0, 3)
    .map(
      (c, i) =>
        `[${i + 1}] ${c.title} (${c.source})\n${c.text.slice(0, 600)}${c.text.length > 600 ? "…" : ""}`
    )
    .join("\n\n");
}

const FALLBACK_ANSWER =
  "• I want to give you the right answer — try rephrasing with more detail\n• Examples: \"Can I claim HRA in new regime?\", \"ITR-2 vs ITR-3 for F&O\", \"How to fix AIS mismatch\"\n• Or tap a suggested question below\n• For your exact tax numbers, check the Review screen";

/**
 * Main Genie answer pipeline: local KB → content retrieval → Gemini LLM.
 */
export async function answerGenieQuestion(
  question: string,
  context?: GenieChatContext
): Promise<GenieAnswerResult> {
  const trimmed = question.trim();
  if (!trimmed) {
    return { text: FALLBACK_ANSWER, source: "fallback", confidence: 0 };
  }

  // Layer 0: Answer from uploaded Form 16 / CAMS / AIS / broker files
  const docLayerActive =
    (context?.documents?.connectedConnectors.length ?? 0) > 0 ||
    isDocumentPersonalQuestion(trimmed);
  // #region agent log
  fetch('http://127.0.0.1:7563/ingest/b08ac730-6614-46b3-bb0c-a50e7f63316c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2c61ed'},body:JSON.stringify({sessionId:'2c61ed',location:'genieAnswer.ts:layer0',message:'document layer check',data:{docLayerActive,connectorCount:context?.documents?.connectedConnectors.length??0,question:trimmed.slice(0,80),isPersonal:isDocumentPersonalQuestion(trimmed)},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  if (docLayerActive) {
    const docAnswer = answerFromDocuments(trimmed, context?.documents);
    // #region agent log
    fetch('http://127.0.0.1:7563/ingest/b08ac730-6614-46b3-bb0c-a50e7f63316c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2c61ed'},body:JSON.stringify({sessionId:'2c61ed',location:'genieAnswer.ts:layer0',message:'document answer result',data:{hasAnswer:!!docAnswer,preview:docAnswer?.slice(0,120)??null},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    if (docAnswer) {
      const footer = buildPersonalizationFooter(context);
      const text =
        footer && !docAnswer.includes("For your return")
          ? docAnswer + footer
          : docAnswer;
      return {
        text,
        source: "documents",
        confidence: context?.documents?.connectedConnectors.length ? 0.95 : 0.5,
      };
    }
  }

  // Layer 1: Exact local keyword match (fast path)
  const local = lookupLocalAnswer(trimmed);
  if (local) {
    const footer = buildPersonalizationFooter(context);
    return {
      text: local + footer,
      source: "local",
      confidence: HIGH_CONFIDENCE_LOCAL,
    };
  }

  // Layer 2: Retrieve from learn articles, help, glossary, rules (~150+ chunks)
  const retrieved = retrieveGenieChunks(trimmed, context, 5);
  const topScore = bestRetrievalScore(retrieved);
  const citations = formatCitations(retrieved);

  if (topScore >= RETRIEVAL_COMPOSE_THRESHOLD) {
    return {
      text: composeFromRetrieval(trimmed, retrieved, context),
      source: "retrieved",
      confidence: Math.min(0.95, topScore / 20),
      citations,
    };
  }

  // Layer 3: Gemini with full context + retrieved excerpts
  if (isGeminiConfigured()) {
    const contextBlock = formatGenieContextBlock(context);
    const retrievedExcerpts = formatRetrievedExcerpts(retrieved);
    const citeBlock = citationsText(citations);

    const result = await completeGeminiText({
      systemPrompt: buildGenieSystemPrompt(trimmed),
      userPrompt: buildGenieUserPrompt({
        question: trimmed,
        contextBlock,
        retrievedExcerpts,
        citations: citeBlock,
      }),
      maxOutputTokens: 800,
      temperature: 0.35,
    });

    if (!("error" in result)) {
      const footer = buildPersonalizationFooter(context);
      const llmText = result.content + (footer && !result.content.includes("For your return") ? footer : "");
      return {
        text: llmText,
        source: "llm",
        confidence: 0.7,
        citations,
      };
    }
  }

  // Layer 4: Weak retrieval without LLM — still better than generic fallback
  if (retrieved.length > 0 && topScore >= 3) {
    return {
      text: composeFromRetrieval(trimmed, retrieved, context),
      source: "retrieved",
      confidence: topScore / 30,
      citations,
    };
  }

  return {
    text: FALLBACK_ANSWER,
    source: "fallback",
    confidence: 0.1,
  };
}
