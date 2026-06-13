/** Server-only — import from API routes and server modules only. */

const DEFAULT_MODEL = "gemini-2.0-flash";
const DEFAULT_BASE = "https://generativelanguage.googleapis.com/v1beta";

export function getGeminiConfig(): {
  apiKey: string;
  model: string;
  baseUrl: string;
} | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    model: process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL,
    baseUrl: DEFAULT_BASE,
  };
}

export function isGeminiConfigured(): boolean {
  return getGeminiConfig() !== null;
}

export async function completeGeminiRaw(params: {
  systemPrompt: string;
  userPrompt: string;
  signal?: AbortSignal;
}): Promise<{ content: string } | { error: string }> {
  const config = getGeminiConfig();
  if (!config) {
    return { error: "Gemini API key not configured" };
  }

  const url = `${config.baseUrl}/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: params.systemPrompt }],
      },
      contents: [{ role: "user", parts: [{ text: params.userPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
    signal: params.signal,
  });

  if (!res.ok) {
    const text = await res.text();
    return { error: `Gemini HTTP ${res.status}: ${text.slice(0, 200)}` };
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    return { error: "Gemini returned empty content" };
  }

  return { content };
}
