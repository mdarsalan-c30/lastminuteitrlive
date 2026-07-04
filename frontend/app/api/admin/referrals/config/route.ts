import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/rbac";
import { updateReferralConfig } from "@/lib/admin/referrals";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req, "editPricing");
    if (admin instanceof NextResponse) return admin;

    const data = await req.json();

    const config = await updateReferralConfig({
      referrerRewardCoins: data.referrerRewardCoins,
      refereeDiscountPct: data.refereeDiscountPct,
      maxCoinUsePerFiling: data.maxCoinUsePerFiling,
      updatedBy: admin.email,
    });

    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
