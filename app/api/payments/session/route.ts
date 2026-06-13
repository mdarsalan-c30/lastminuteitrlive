import { NextRequest, NextResponse } from "next/server";
import { hasServerCompanionAccess } from "@/lib/payments/access";
import { isPaymentBypassEnabled } from "@/lib/payments/bypass";
import { getPaymentSessionFromRequest } from "@/lib/payments/sessionRequest";
import {
  PAYMENT_SESSION_COOKIE,
  paymentSessionCookieOptions,
} from "@/lib/payments/session";

export async function GET(request: NextRequest) {
  if (isPaymentBypassEnabled()) {
    return NextResponse.json({
      verified: true,
      planId: "ai_smart",
      companionAccess: true,
      mock: true,
      bypass: true,
    });
  }

  const session = getPaymentSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ verified: false });
  }

  return NextResponse.json({
    verified: true,
    planId: session.planId,
    orderId: session.orderId,
    paymentId: session.paymentId,
    verifiedAt: session.verifiedAt,
    mock: session.mock,
    companionAccess: hasServerCompanionAccess(session),
  });
}

export async function DELETE() {
  const response = NextResponse.json({ cleared: true });
  response.cookies.set(PAYMENT_SESSION_COOKIE, "", {
    ...paymentSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
