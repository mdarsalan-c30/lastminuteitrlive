import { NextRequest, NextResponse } from "next/server";
import { getEffectivePrice } from "@/lib/marketing/pricing";
import type { PlanId } from "@/lib/payments/plans";
import {
  createRazorpayOrder,
  hasRazorpayKeys,
} from "@/lib/payments/razorpay";

const VALID_PLANS: PlanId[] = ["free", "diy", "ai_smart", "ca"];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { planId?: string };
    const raw = body.planId as string;
    const planId = (raw === "ca_review" ? "ca" : raw) as PlanId;

    if (!planId || !VALID_PLANS.includes(planId)) {
      return NextResponse.json(
        { error: "Invalid plan. Choose free, diy, ai_smart, or ca." },
        { status: 400 }
      );
    }

    const effectivePrice = getEffectivePrice(planId);

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

    if (!hasRazorpayKeys()) {
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
