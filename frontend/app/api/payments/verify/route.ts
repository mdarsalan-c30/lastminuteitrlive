import { NextRequest, NextResponse } from "next/server";
import { getPlan, type PlanId } from "@/lib/payments/plans";
import {
  hasRazorpayKeys,
  verifyPaymentSignature,
} from "@/lib/payments/razorpay";
import {
  buildPaymentSessionPayload,
  createPaymentSessionToken,
  paymentSessionCookieOptions,
  PAYMENT_SESSION_COOKIE,
} from "@/lib/payments/session";

const VALID_PLANS: PlanId[] = ["free", "diy", "ai_smart", "ca"];

function resolvePlanId(raw: string | undefined): PlanId | null {
  if (!raw || !VALID_PLANS.includes(raw as PlanId)) return null;
  return raw as PlanId;
}

function verifiedResponse(
  input: {
    mock: boolean;
    orderId: string;
    paymentId: string;
    planId: PlanId;
  }
) {
  const response = NextResponse.json({
    verified: true,
    mock: input.mock,
    orderId: input.orderId,
    paymentId: input.paymentId,
    planId: input.planId,
  });

  const token = createPaymentSessionToken(
    buildPaymentSessionPayload({
      planId: input.planId,
      orderId: input.orderId,
      paymentId: input.paymentId,
      mock: input.mock,
    })
  );

  response.cookies.set(
    PAYMENT_SESSION_COOKIE,
    token,
    paymentSessionCookieOptions()
  );

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      planId?: string;
      mock?: boolean;
    };

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id) {
      return NextResponse.json(
        { error: "Missing order id" },
        { status: 400 }
      );
    }

    const hasKeys = hasRazorpayKeys();
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction && !hasKeys) {
      return NextResponse.json(
        { error: "Payment verification unavailable" },
        { status: 503 }
      );
    }
    const isMockAllowed = !hasKeys && !isProduction;
    const planId = resolvePlanId(body.planId);

    if (
      isMockAllowed &&
      razorpay_order_id.startsWith("order_mock_")
    ) {
      if (!planId) {
        return NextResponse.json({ error: "Invalid plan id" }, { status: 400 });
      }
      return verifiedResponse({
        mock: true,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id ?? `pay_mock_${Date.now()}`,
        planId,
      });
    }

    if (razorpay_order_id.startsWith("order_free_")) {
      if (planId && getPlan(planId).price === 0) {
        return verifiedResponse({
          mock: true,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id ?? `pay_free_${Date.now()}`,
          planId,
        });
      }
      return NextResponse.json(
        { verified: false, error: "Invalid free order" },
        { status: 400 }
      );
    }

    if (!razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment id or signature" },
        { status: 400 }
      );
    }

    if (!hasRazorpayKeys()) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 503 }
      );
    }

    const valid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET!
    );

    if (!valid) {
      return NextResponse.json(
        { verified: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    if (!planId) {
      return NextResponse.json({ error: "Invalid plan id" }, { status: 400 });
    }

    return verifiedResponse({
      mock: false,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      planId,
    });
  } catch (error) {
    console.error("verify error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
