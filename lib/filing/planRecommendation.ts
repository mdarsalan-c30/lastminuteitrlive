import type { ConfidenceResult } from "@/lib/engine/types";
import type { PlanId } from "@/lib/filing/types";

/** Map engine confidence → checkout plan highlight (TRUST_CONVERSION §9). */
export function recommendPlanFromConfidence(
  confidence: Pick<ConfidenceResult, "ca_escalation_recommended">
): PlanId {
  if (confidence.ca_escalation_recommended) {
    return "ca";
  }
  return "ai_smart";
}
