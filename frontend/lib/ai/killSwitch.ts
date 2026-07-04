/**
 * AI kill switch (doc 52 §4).
 * When on, all LLM surfaces degrade to template-only (L2) — never block compute.
 */

export function isAiKillSwitchOn(): boolean {
  const raw = process.env.AI_KILL_SWITCH?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "on";
}

export function aiDegradedReason(): string {
  return "AI language layer is in template-only mode";
}
