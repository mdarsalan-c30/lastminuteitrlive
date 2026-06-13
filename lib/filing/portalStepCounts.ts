import type { PortalForm } from "@/lib/engine/types";

/** Step counts per ITR form — kept in sync with `data/portal_steps.json`. */
export const PORTAL_STEP_COUNTS: Record<PortalForm, number> = {
  "ITR-1": 50,
  "ITR-2": 53,
  "ITR-3": 57,
  "ITR-4": 56,
};

const DEFAULT_STEP_COUNT = 47;

export function companionStepCountForForm(form: string): number {
  return PORTAL_STEP_COUNTS[form as PortalForm] ?? DEFAULT_STEP_COUNT;
}
