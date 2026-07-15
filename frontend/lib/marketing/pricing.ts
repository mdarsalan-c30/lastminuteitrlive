import type { PlanId } from "@/lib/filing/types";
import { PLANS } from "@/lib/payments/plans";
import { LAUNCH_OFFER } from "./offer";

export interface DisplayPricing {
  current: number;
  original?: number;
  showOffer: boolean;
}

export function isLaunchOfferActive(now: Date = new Date()): boolean {
  if (LAUNCH_OFFER.planId !== "pro" && LAUNCH_OFFER.planId !== "ai_smart") {
    return false;
  }
  return now.getTime() < new Date(LAUNCH_OFFER.launchOfferEndsAt).getTime();
}

export function getEffectivePrice(planId: PlanId, now: Date = new Date()): number {
  if (planId === LAUNCH_OFFER.planId && isLaunchOfferActive(now)) {
    return LAUNCH_OFFER.launchPriceInr;
  }
  return PLANS[planId].price;
}

export function getDisplayPricing(
  planId: PlanId,
  now: Date = new Date()
): DisplayPricing {
  const current = getEffectivePrice(planId, now);
  const plan = PLANS[planId];

  if (planId === LAUNCH_OFFER.planId && isLaunchOfferActive(now)) {
    return {
      current,
      original: LAUNCH_OFFER.originalPriceInr,
      showOffer: true,
    };
  }

  if (plan.originalPrice !== undefined) {
    return {
      current,
      original: plan.originalPrice,
      showOffer: true,
    };
  }

  return { current, showOffer: false };
}

export function formatPlanPriceLabel(amount: number): string {
  if (amount === 0) return `₹${amount}`;
  return `₹${amount.toLocaleString("en-IN")} + GST`;
}

export function getPlanPriceLabel(planId: PlanId, now: Date = new Date()): string {
  return formatPlanPriceLabel(getEffectivePrice(planId, now));
}
