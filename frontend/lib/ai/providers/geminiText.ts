/** Plain-text Gemini completion for Genie chat (no JSON mode). */

import { getGeminiConfig } from "./gemini";

export async function completeGeminiText(params: {
  systemPrompt: string;
  userPrompt: string;
  signal?: AbortSignal;
  maxOutputTokens?: number;
  temperature?: number;
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
        temperature: params.temperature ?? 0.3,
        maxOutputTokens: params.maxOutputTokens ?? 400,
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

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!content) {
    return { error: "Gemini returned empty content" };
  }

  return { content };
}
