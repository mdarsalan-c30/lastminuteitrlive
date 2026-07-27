import type { PlanId } from "@/lib/filing/types";
import { PLANS } from "@/lib/payments/plans";

export interface DisplayPricing {
  current: number;
  original?: number;
  showOffer: boolean;
}

export function isLaunchOfferActive(now: Date = new Date()): boolean {
  void now;
  return true;
}

export function getEffectivePrice(planId: PlanId, now: Date = new Date()): number {
  void now;
  return PLANS[planId].price;
}

export function getDisplayPricing(
  planId: PlanId,
  now: Date = new Date()
): DisplayPricing {
  const plan = PLANS[planId];
  return {
    current: getEffectivePrice(planId, now),
    original: plan.originalPrice,
    showOffer:
      plan.originalPrice !== undefined && plan.originalPrice > plan.price,
  };
}

export function formatPlanPriceLabel(amount: number): string {
  if (amount === 0) return `₹${amount}`;
  return `₹${amount.toLocaleString("en-IN")} + GST`;
}

export function getPlanPriceLabel(planId: PlanId, now: Date = new Date()): string {
  return formatPlanPriceLabel(getEffectivePrice(planId, now));
}
