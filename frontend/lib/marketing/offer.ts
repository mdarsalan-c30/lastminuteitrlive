import type { PlanId } from "@/lib/filing/types";

export const LAUNCH_OFFER = {
  planId: "ai_smart" as PlanId,
  originalPriceInr: 799,
  launchPriceInr: 349,
  /** Configurable ISO end time (IST). */
  launchOfferEndsAt: "2026-07-31T23:59:59+05:30",
  afterExpiryBehavior: "show_original" as const,
} as const;

export const OFFER_PILL_LABEL = "Launch offer";

export const OFFER_HELPER_COPY =
  "Limited-time launch pricing on AI Smart — pay once to unlock your portal filing guide. You still file on incometax.gov.in yourself.";

export const OFFER_EXPIRED_COPY =
  "Launch offer ended — AI Smart is now at regular pricing.";

export function getLaunchOfferEndDate(): Date {
  return new Date(LAUNCH_OFFER.launchOfferEndsAt);
}
