import { NextRequest, NextResponse } from "next/server";
import { hashIp, recordRedemption, validateCoupon } from "@/lib/admin/coupons";
import { validateReferralCode, recordReferralRedemption } from "@/lib/admin/referrals";
import {
  buildPaymentSessionPayload,
  createPaymentSessionToken,
  paymentSessionCookieOptions,
  PAYMENT_SESSION_COOKIE,
} from "@/lib/payments/session";
import { PLANS } from "@/lib/payments/plans";
import type { PlanId } from "@/lib/payments/plans";
import { cookies } from "next/headers";
import { B2C_SESSION_COOKIE, readB2CSession } from "@/lib/auth/b2c";
import { spendCoins } from "@/lib/admin/referrals";

const VALID_PLANS = Object.keys(PLANS) as PlanId[];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      code?: string;
      planId?: string;
      sessionId?: string;
      useCoins?: number;
    };
    if (!body.code && !body.useCoins) {
      return NextResponse.json({ error: "Enter a code or use coins" }, { status: 400 });
    }
    const planId = (body.planId === "ca_review" ? "ca" : body.planId) as PlanId;
    if (!planId || !VALID_PLANS.includes(planId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    let result: { valid: boolean; reason?: string; coupon?: any } = { valid: false };
    let isReferral = false;
    let refResult: any = null;

    if (body.code) {
      result = await validateCoupon(body.code, planId);
      if (!result.valid) {
        refResult = await validateReferralCode(body.code, planId);
        if (refResult.valid) {
          isReferral = true;
        } else {
          return NextResponse.json({ error: result.reason }, { status: 400 });
        }
      }
    }

    if (body.useCoins && body.useCoins > 0) {
      const cookieStore = await cookies();
      const token = cookieStore.get(B2C_SESSION_COOKIE)?.value;
      const session = readB2CSession(token);
      if (session) {
        try {
          await spendCoins(session.email, body.useCoins);
        } catch (e: any) {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: "Must be logged in to use coins" }, { status: 401 });
      }
    }

    const { getPublishedPrice } = await import("@/lib/pricing/config");
    let effectivePrice = await getPublishedPrice(planId);
    
    if (isReferral && refResult) {
       effectivePrice = Math.max(0, effectivePrice - (effectivePrice * refResult.refereeDiscountPct) / 100);
    } else if (result.coupon) {
       if (result.coupon.discount === "percentage") {
           effectivePrice = Math.max(0, effectivePrice - (effectivePrice * (result.coupon.percentageOff ?? 0)) / 100);
       } else {
           effectivePrice = Math.max(0, effectivePrice - (result.coupon.amountOff ?? 0));
       }
    }
    
    if (effectivePrice > 0) {
      return NextResponse.json({ error: "Code does not cover full price. Please proceed to payment." }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    const paymentId = isReferral ? `pay_ref_${body.code}` : (result.coupon ? `pay_coupon_${result.coupon.code}` : `pay_coins`);

    if (isReferral) {
      await recordReferralRedemption(refResult.referralCodeId, body.sessionId || "b2c", paymentId);
    } else if (result.coupon) {
      await recordRedemption(result.coupon, {
        sessionId: body.sessionId || "b2c",
        ipHash: hashIp(ip),
        planId,
      });
    }

    const response = NextResponse.json({ unlocked: true, planId });
    const token = createPaymentSessionToken(
      buildPaymentSessionPayload({
        planId,
        orderId: `order_custom_${Date.now()}`,
        paymentId,
        mock: true,
        sessionId: body.sessionId,
      })
    );
    response.cookies.set(
      PAYMENT_SESSION_COOKIE,
      token,
      paymentSessionCookieOptions()
    );
    return response;
  } catch {
    return NextResponse.json({ error: "Redemption failed" }, { status: 500 });
  }
}
