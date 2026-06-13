/** Server-only — import from API routes and server modules only. */

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

export function getOpenAiConfig(): {
  apiKey: string;
  baseUrl: string;
  model: string;
} | null {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: (process.env.AI_API_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(
      /\/$/,
      ""
    ),
    model: process.env.AI_MODEL?.trim() || DEFAULT_MODEL,
  };
}

export function isOpenAiConfigured(): boolean {
  return getOpenAiConfig() !== null;
}

export async function completeOpenAiRaw(params: {
  systemPrompt: string;
  userPrompt: string;
  signal?: AbortSignal;
}): Promise<{ content: string } | { error: string }> {
  const config = getOpenAiConfig();
  if (!config) {
    return { error: "OpenAI API key not configured" };
  }

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
    }),
    signal: params.signal,
  });

  if (!res.ok) {
    const text = await res.text();
    return { error: `OpenAI HTTP ${res.status}: ${text.slice(0, 200)}` };
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return { error: "OpenAI returned empty content" };
  }

  return { content };
}

export function extractJsonFromContent(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return trimmed;
}
