import type { GenieKnowledgeChunk } from "@/lib/filing/genieContentIndex";
import { getGenieContentIndex } from "@/lib/filing/genieContentIndex";
import { normalizeQuestion } from "@/lib/filing/genieKnowledge";
import type { GenieChatContext } from "@/lib/filing/genieContext";

export interface RetrievedChunk extends GenieKnowledgeChunk {
  score: number;
}

function questionTokens(question: string): string[] {
  const n = normalizeQuestion(question);
  return n.split(" ").filter((t) => t.length > 2);
}

/**
 * BM25-style keyword retrieval over the Genie content index.
 */
export function retrieveGenieChunks(
  question: string,
  context?: GenieChatContext,
  limit = 5
): RetrievedChunk[] {
  const tokens = questionTokens(question);
  const nq = normalizeQuestion(question);
  const index = getGenieContentIndex();

  const scored: RetrievedChunk[] = index.map((chunk) => {
    let score = 0;

    for (const key of chunk.keywords) {
      const k = key.toLowerCase();
      if (nq.includes(k) || k.includes(nq)) score += 6;
      else if (tokens.some((t) => k.includes(t) || t.includes(k))) score += 3;
    }

    for (const t of tokens) {
      if (chunk.title.toLowerCase().includes(t)) score += 2;
      if (chunk.text.toLowerCase().includes(t)) score += 1;
    }

    if (context?.step && chunk.cluster === context.step) score += 4;
    if (context?.activeField && chunk.id === `field_${context.activeField}`) score += 25;
    if (
      context?.recommendedForm &&
      chunk.text.toLowerCase().includes(context.recommendedForm.toLowerCase())
    ) {
      score += 2;
    }

    return { ...chunk, score };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function bestRetrievalScore(chunks: RetrievedChunk[]): number {
  return chunks[0]?.score ?? 0;
}
