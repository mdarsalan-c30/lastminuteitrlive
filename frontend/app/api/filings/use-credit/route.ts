import { NextRequest, NextResponse } from "next/server";
import { requireB2CUser } from "@/lib/auth/b2cRequest";
import { unlockFamilyProfile } from "@/lib/family/server";
import { consumeB2CFilingCredit } from "@/lib/filings/credits";
import {
  buildPaymentSessionPayload,
  createPaymentSessionToken,
  paymentSessionCookieOptions,
  PAYMENT_SESSION_COOKIE,
} from "@/lib/payments/session";
import type { PlanId } from "@/lib/payments/plans";

/** Spend one wallet credit to unlock companion for a filing profile. */
export async function POST(request: NextRequest) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const profileId = typeof body.profileId === "string" ? body.profileId : "";
  const planId = (body.planId === "pro" ? "pro" : "normal") as PlanId;

  if (!profileId) {
    return NextResponse.json({ error: "profileId is required" }, { status: 400 });
  }

  const consumed = await consumeB2CFilingCredit(auth.user.id);
  if (!consumed) {
    return NextResponse.json(
      { error: "No filing credits left in your wallet" },
      { status: 402 }
    );
  }

  const paymentId = `credit_${Date.now()}`;
  await unlockFamilyProfile({
    profileId,
    userId: auth.user.id,
    planId,
    paymentId,
  });

  const response = NextResponse.json({
    ok: true,
    profileId,
    planId,
    paymentId,
  });

  const token = createPaymentSessionToken(
    buildPaymentSessionPayload({
      planId,
      orderId: paymentId,
      paymentId,
      mock: true,
    })
  );
  response.cookies.set(PAYMENT_SESSION_COOKIE, token, paymentSessionCookieOptions());
  return response;
}
