import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/store";
import { requireB2CUser } from "@/lib/auth/b2cRequest";
import {
  PAYMENT_SESSION_COOKIE,
  paymentSessionCookieOptions,
} from "@/lib/payments/session";

/**
 * Clear payment cookie and optionally wipe the active profile's saved draft.
 * Client should also reset local Zustand state after this call.
 */
export async function POST(request: NextRequest) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const profileId =
    typeof body.profileId === "string" ? body.profileId : undefined;
  const clearDraft = body.clearDraft !== false;

  if (profileId && clearDraft) {
    await prisma.familyProfile.updateMany({
      where: { id: profileId, userId: auth.user.id },
      data: {
        draftJson: Prisma.JsonNull,
        filingStatus: "not_started",
        unlockedPlanId: null,
        unlockedAt: null,
        lastPaymentId: null,
      },
    });
  }

  const response = NextResponse.json({ cleared: true });
  response.cookies.set(PAYMENT_SESSION_COOKIE, "", {
    ...paymentSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
