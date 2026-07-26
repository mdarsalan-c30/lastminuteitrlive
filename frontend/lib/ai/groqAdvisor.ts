import { getManagedAiKeys, type ManagedAiProvider } from "@/lib/ai/providerKeys";

type AdvisorMessage = { role: "user" | "assistant"; content: string };

const PROVIDERS: Array<{ id: ManagedAiProvider; url: string; model: () => string }> = [
  {
    id: "openai",
    url: "https://api.openai.com/v1/chat/completions",
    model: () => process.env.OPENAI_ADVISOR_MODEL?.trim() || "gpt-4.1-mini",
  },
  {
    id: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: () => process.env.GROQ_ADVISOR_MODEL?.trim() || "llama-3.1-8b-instant",
  },
];

async function complete(system: string, messages: AdvisorMessage[] = []) {
  let lastError = "AI provider request failed";
  let configured = false;
  for (const provider of PROVIDERS) {
    const keys = await getManagedAiKeys(provider.id);
    if (keys.length) configured = true;
    for (const apiKey of keys) {
      try {
        const response = await fetch(provider.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: provider.model(),
          messages: [{ role: "system", content: system }, ...messages],
          temperature: 0.25,
          max_tokens: 900,
        }),
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) {
          lastError = `${provider.id} returned ${response.status}`;
          continue;
        }
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (typeof reply === "string" && reply.trim()) return reply.trim();
        lastError = `${provider.id} returned an empty response`;
      } catch (error) {
        lastError = error instanceof Error ? error.message : lastError;
      }
    }
  }
  if (!configured) throw new Error("AI advisor is not configured");
  throw new Error(lastError);
}

function basePrompt(context: unknown) {
  return `You are LastminuteITR's Filing Assistant for Indian income-tax preparation.
Use only the supplied context and clearly label assumptions. Do not claim to be a Chartered Accountant,
do not guarantee savings or refunds, and remind the user to review values before submission.
Never invent a value, filing status, uploaded document, mismatch, deadline, or professional review.
Round Indian rupee amounts to whole rupees and omit values below ₹1 because they may be calculation noise.
Answer only the question asked. Do not append a generic return summary to every reply.
If information is missing or inconsistent, say what cannot be verified and ask one useful follow-up.
Keep answers concise, friendly and actionable. Use short sections and bullets where helpful.
User context: ${JSON.stringify(context ?? {})}`;
}

export async function runAdvisorChat(payload: {
  messages?: AdvisorMessage[];
  context?: unknown;
}) {
  return complete(basePrompt(payload.context), payload.messages ?? []);
}

export async function runAdvisorAction(payload: { action?: string; context?: unknown }) {
  const instruction: Record<string, string> = {
    optimize: "Identify lawful deductions or missing information worth checking. Do not promise savings.",
    anomalies: "Check the supplied information for inconsistencies or missing items.",
    explain: "Explain the tax position in simple English with light conversational Hindi where useful.",
  };
  return complete(`${basePrompt(payload.context)}
Task: ${instruction[payload.action ?? "explain"] ?? instruction.explain}`);
}

export async function completeFilingAssistantText(payload: {
  systemPrompt: string;
  userPrompt: string;
}) {
  return complete(payload.systemPrompt, [{ role: "user", content: payload.userPrompt }]);
}
