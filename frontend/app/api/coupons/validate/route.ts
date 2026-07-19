import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/admin/coupons";
import { validateReferralCode } from "@/lib/admin/referrals";
import type { PlanId } from "@/lib/payments/plans";
import { PLANS } from "@/lib/payments/plans";

const VALID_PLANS = Object.keys(PLANS) as PlanId[];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { code?: string; planId?: string };
    if (!body.code) {
      return NextResponse.json({ valid: false, reason: "Enter a code" });
    }
    const planId = (body.planId === "ca_review" ? "ca" : body.planId) as PlanId;
    if (!planId || !VALID_PLANS.includes(planId)) {
      return NextResponse.json({ valid: false, reason: "Invalid plan" });
    }

    let result = await validateCoupon(body.code, planId);
    let isReferral = false;
    let refResult: any = null;

    if (!result.valid) {
      refResult = await validateReferralCode(body.code, planId);
      if (refResult.valid) {
        isReferral = true;
      } else {
        return NextResponse.json({ valid: false, reason: result.reason }); // Original reason
      }
    }

    if (isReferral) {
      return NextResponse.json({
        valid: true,
        discount: "percentage",
        amountOff: null,
        percentageOff: refResult.refereeDiscountPct,
      });
    }

    // Regular coupons are only "full" or "amount" (never "percentage" — that
    // path is referral-only, handled above). So amountOff carries the value and
    // percentageOff is always null here.
    const discountType = result.coupon!.discount;
    return NextResponse.json({
      valid: true,
      discount: discountType,
      amountOff: result.coupon!.amountOff ?? null,
      percentageOff: null,
    });
  } catch {
    return NextResponse.json(
      { valid: false, reason: "Validation failed" },
      { status: 500 }
    );
  }
}
