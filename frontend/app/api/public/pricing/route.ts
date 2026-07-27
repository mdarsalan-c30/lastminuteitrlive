import { NextResponse } from "next/server";
import { PLAN_LIST } from "@/lib/payments/plans";
import { getPublishedPricing } from "@/lib/pricing/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await Promise.all(
    PLAN_LIST.map(async (plan) => [
      plan.id,
      await getPublishedPricing(plan.id),
    ] as const)
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
