import { NextRequest, NextResponse } from "next/server";
import {
  CHECKOUT_PLAN_IDS,
  normalizePlanId,
  type PlanId,
} from "@/lib/payments/plans";
import {
  createRazorpayOrder,
  hasRazorpayKeys,
} from "@/lib/payments/razorpay";
import { getPublishedPrice } from "@/lib/pricing/config";
import { validateCoupon } from "@/lib/admin/coupons";
import { validateReferralCode } from "@/lib/admin/referrals";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      planId?: string;
      couponCode?: string;
    };
    const planId = normalizePlanId(body.planId);

    if (!planId || !CHECKOUT_PLAN_IDS.includes(planId)) {
      return NextResponse.json(
        {
          error:
            "Invalid plan. Choose free, normal, pro, diy, ai_smart, or ca.",
        },
        { status: 400 }
      );
    }

    let effectivePrice = await getPublishedPrice(planId);

    if (body.couponCode) {
      let valid = false;
      let discountType: "fixed" | "percentage" = "fixed";
      let amountOff = 0;
      let percentageOff = 0;

      const result = await validateCoupon(body.couponCode, planId);
      if (result.valid) {
        valid = true;
        if (result.coupon!.discount === "full") {
          discountType = "percentage";
          percentageOff = 100;
        } else {
          discountType = "fixed";
          amountOff = result.coupon!.amountOff ?? 0;
        }
      } else {
        const refResult = await validateReferralCode(body.couponCode, planId);
        if (refResult.valid) {
          valid = true;
          discountType = "percentage";
          percentageOff = refResult.refereeDiscountPct;
        }
      }

      if (valid) {
        if (discountType === "percentage") {
          effectivePrice = Math.max(
            0,
            effectivePrice - (effectivePrice * percentageOff) / 100
          );
        } else {
          effectivePrice = Math.max(0, effectivePrice - amountOff);
        }
      }
    }

    if (effectivePrice === 0) {
      return NextResponse.json({
        orderId: `order_free_${Date.now()}`,
        amount: 0,
        currency: "INR",
        planId,
        mock: true,
        message: "Free plan — no payment required",
      });
    }

    const amountPaise = effectivePrice * 100;
    const receipt = `itr_${planId}_${Date.now()}`;
    const isProduction = process.env.NODE_ENV === "production";

    if (!hasRazorpayKeys()) {
      if (isProduction) {
        return NextResponse.json(
          {
            error:
              "Payments are temporarily unavailable. Razorpay is not configured.",
          },
          { status: 503 }
        );
      }
      return NextResponse.json({
        orderId: `order_mock_${Date.now()}`,
        amount: amountPaise,
        currency: "INR",
        planId,
        mock: true,
        keyId: null,
        message:
          "Razorpay keys not configured — using mock order for development",
      });
    }

    const order = await createRazorpayOrder(amountPaise, receipt);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planId,
      mock: false,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("create-order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
