import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/store";
import { requireB2CUser } from "@/lib/auth/b2cRequest";
import { ensureSelfProfile, MAX_FILING_PROFILES } from "@/lib/family/server";
import { hasServerCompanionAccess } from "@/lib/payments/access";
import { getPaymentSessionFromRequest } from "@/lib/payments/sessionRequest";
import { canExportCompanion } from "@/lib/payments/access";
import type { PlanId } from "@/lib/payments/plans";

function serializeProfile(p: {
  id: string;
  name: string;
  relationship: string;
  pan: string | null;
  dob: string | null;
  filingStatus: string;
  draftJson: unknown;
  unlockedPlanId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: p.id,
    name: p.name,
    relationship: p.relationship,
    pan: p.pan,
    dob: p.dob,
    filingStatus: p.filingStatus,
    hasDraft: p.draftJson != null,
    unlocked: Boolean(p.unlockedPlanId),
    unlockedPlanId: p.unlockedPlanId,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

/** Workspace state for logged-in multi-person filing. */
export async function GET(request: NextRequest) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const self = await ensureSelfProfile(auth.user.id, auth.user.name);

  const profiles = await prisma.familyProfile.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "asc" },
  });

  const paymentSession = getPaymentSessionFromRequest(request);
  const cookieUnlocked = hasServerCompanionAccess(paymentSession);

  const profileId =
    request.nextUrl.searchParams.get("profileId") ?? self.id;
  const active =
    profiles.find((p) => p.id === profileId) ??
    profiles.find((p) => p.relationship === "self") ??
    profiles[0];

  const profileUnlocked =
    active?.unlockedPlanId && canExportCompanion(active.unlockedPlanId as PlanId);

  const user = await prisma.b2CUser.findUnique({
    where: { id: auth.user.id },
    select: { filingsRemaining: true },
  });

  return NextResponse.json({
    selfProfileId: self.id,
    activeProfileId: active?.id ?? self.id,
    profiles: profiles.map(serializeProfile),
    limit: MAX_FILING_PROFILES,
    filingsRemaining: user?.filingsRemaining ?? 0,
    companionAccess: cookieUnlocked || Boolean(profileUnlocked),
    activeProfileUnlocked: Boolean(profileUnlocked),
    activeUnlockedPlanId: active?.unlockedPlanId ?? null,
    paymentSession: paymentSession
      ? {
          verified: paymentSession.verified,
          planId: paymentSession.planId,
        }
      : null,
  });
}
