"use client";

import { LAUNCH_OFFER, OFFER_PILL_LABEL } from "@/lib/marketing/offer";
import { formatPlanPriceLabel } from "@/lib/marketing/pricing";
import { usePublishedPricing } from "@/lib/hooks/usePublishedPricing";
import { cn } from "@/lib/utils";

export interface OfferPillProps {
  className?: string;
}

export function OfferPill({ className }: OfferPillProps) {
  const pricing = usePublishedPricing(LAUNCH_OFFER.planId);

  if (!pricing.showOffer) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900",
        className
      )}
    >
      <span>{OFFER_PILL_LABEL}:</span>
      <span className="font-bold tabular-nums">
        {formatPlanPriceLabel(pricing.current)}
      </span>
      {pricing.original !== undefined && (
        <span className="text-emerald-700/70 line-through tabular-nums">
          {formatPlanPriceLabel(pricing.original)}
        </span>
      )}
    </span>
  );
}
