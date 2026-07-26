import {
  getManagedAiKeys,
  getManagedAiKeyStatus,
  replaceManagedAiKeys,
} from "@/lib/ai/providerKeys";

export async function getGroqApiKeys(): Promise<string[]> {
  return getManagedAiKeys("groq");
}

export async function getGroqKeyStatus() {
  return getManagedAiKeyStatus("groq");
}

export async function replaceGroqFallbackKeys(keys: string[], updatedBy: string) {
  return replaceManagedAiKeys("groq", keys, updatedBy);
}
