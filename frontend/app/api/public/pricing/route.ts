import { NextResponse } from "next/server";
import { PLAN_LIST } from "@/lib/payments/plans";
import { getPublishedPricing, isPublishedPlanVisible } from "@/lib/pricing/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await Promise.all(
    PLAN_LIST.map(async (plan) => {
      const [pricing, isVisible] = await Promise.all([
        getPublishedPricing(plan.id),
        isPublishedPlanVisible(plan.id),
      ]);
      return [plan.id, { ...pricing, isVisible }] as const;
    })
  );

  return NextResponse.json(
    { pricing: Object.fromEntries(entries) },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
