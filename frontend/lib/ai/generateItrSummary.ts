import type {
  ItrSummaryPayload,
  ItrSummaryRequest,
} from "@/lib/itr/summaryTypes";
import { completeJson, isAnyLlmConfigured } from "./llmService";
import { itrSummaryPayloadSchema } from "./schemas";

function buildSummaryPrompt(body: ItrSummaryRequest): string {
  return `You are summarizing a salaried taxpayer's ITR draft from parsed Form 16 / draft data.

Return ONLY valid JSON matching this schema (no markdown):
{
  "bullets": string[] (3-5 plain-English summary bullets for the taxpayer),
  "flags": [{ "type": "warning"|"info"|"success", "text": string }] (0-4 items: mismatches, missing docs, review items),
  "regimeHint": string|null (one sentence old vs new regime hint if taxSnapshot present, else null),
  "rowInsights": { "<particular exact string from rows>": "short insight" } (optional per-row notes, max 6 keys)
}

Rules:
- Use ₹ amounts in Indian numbering when mentioning figures.
- Never invent numbers not in the data.
- If demo/fallback parsing, warn user to verify against Form 16.
- Do not guarantee refund or legal outcomes.
- Keep bullets concise (under 120 chars each).

Data:
${JSON.stringify(body, null, 2)}`;
}

export async function generateItrSummary(
  body: ItrSummaryRequest
): Promise<{ summary: ItrSummaryPayload | null; aiEnabled: boolean }> {
  const aiEnabled = isAnyLlmConfigured();
  if (!aiEnabled) {
    return { summary: null, aiEnabled: false };
  }

  const result = await completeJson({
    schema: itrSummaryPayloadSchema,
    systemPrompt:
      "You output strict JSON only for Indian ITR filing summaries. Never guarantee outcomes.",
    userPrompt: buildSummaryPrompt(body),
    routeKey: "itr-summary",
  });

  if (!result.ok) {
    console.error("AI summary error:", result.error);
    return { summary: null, aiEnabled: true };
  }

  const parsed = result.data;
  return {
    summary: {
      bullets: parsed.bullets.slice(0, 6).map(String),
      flags: parsed.flags.slice(0, 5).map((f) => ({
        type:
          f.type === "warning" || f.type === "success" ? f.type : "info",
        text: String(f.text),
      })),
      regimeHint:
        typeof parsed.regimeHint === "string" ? parsed.regimeHint : null,
      rowInsights: Object.fromEntries(
        Object.entries(parsed.rowInsights ?? {})
          .slice(0, 8)
          .map(([k, v]) => [String(k), String(v)])
      ),
    },
    aiEnabled: true,
  };
}
