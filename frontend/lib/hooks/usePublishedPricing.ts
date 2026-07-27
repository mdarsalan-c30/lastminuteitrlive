"use client";

import { useEffect, useState } from "react";
import type { PlanId } from "@/lib/payments/plans";
import { PLAN_LIST } from "@/lib/payments/plans";
import {
  getDisplayPricing,
  type DisplayPricing,
} from "@/lib/marketing/pricing";

export type PublishedPricingMap = Partial<Record<PlanId, DisplayPricing>>;

const fallbackPricing = Object.fromEntries(
  PLAN_LIST.map((plan) => [plan.id, getDisplayPricing(plan.id)])
) as PublishedPricingMap;

let cached: PublishedPricingMap | null = null;
let pending: Promise<PublishedPricingMap> | null = null;

function loadPricing(): Promise<PublishedPricingMap> {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = fetch("/api/public/pricing", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Pricing unavailable");
        const data = (await response.json()) as {
          pricing?: PublishedPricingMap;
        };
        cached = { ...fallbackPricing, ...(data.pricing ?? {}) };
        return cached;
      })
      .catch(() => fallbackPricing)
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

export function usePublishedPricingMap(): PublishedPricingMap {
  const [pricing, setPricing] = useState<PublishedPricingMap>(
    cached ?? fallbackPricing
  );

  useEffect(() => {
    let active = true;
    void loadPricing().then((next) => {
      if (active) setPricing(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return pricing;
}

export function usePublishedPricing(planId: PlanId): DisplayPricing {
  const pricing = usePublishedPricingMap();
  return pricing[planId] ?? getDisplayPricing(planId);
}
