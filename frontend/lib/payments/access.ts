import { isPaymentBypassEnabled } from "./bypass";
import type { PlanId } from "./plans";
import type { PaymentSessionPublic } from "./session";

export interface CompanionAccessState {
  plan: PlanId;
  paidPlanId: PlanId | null;
  paymentVerifiedAt: number | null;
}

/** Paid tiers that include companion export */
export function canExportCompanion(plan: PlanId): boolean {
  return plan === "diy" || plan === "ai_smart" || plan === "ca";
}

/** Companion copy / print / export after Razorpay verify (client draft state) */
export function hasCompanionExportAccess(state: CompanionAccessState): boolean {
  if (isPaymentBypassEnabled()) return true;
  if (state.paymentVerifiedAt == null) return false;
  const effectivePlan = state.paidPlanId ?? state.plan;
  return canExportCompanion(effectivePlan);
}

/** Server-validated payment session — required for companion export (P2-6) */
export function hasServerCompanionAccess(
  session: PaymentSessionPublic | null
): boolean {
  if (isPaymentBypassEnabled()) return true;
  if (!session?.verified) return false;
  return canExportCompanion(session.planId);
}

/** AIS / 26AS mismatch engine — AI Smart and CA Review */
export function canUseMismatchEngine(plan: PlanId): boolean {
  return plan === "ai_smart" || plan === "ca";
}

/** Guided ITR-1 filing workflow */
export function canFileGuided(plan: PlanId): boolean {
  return plan !== "free";
}

/** Regime compare optimizer */
export function canUseRegimeOptimizer(plan: PlanId): boolean {
  return plan === "ai_smart" || plan === "ca";
}
