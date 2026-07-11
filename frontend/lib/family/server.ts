import { prisma } from "@/lib/db/store";
import type { PlanId } from "@/lib/payments/plans";

export const MAX_FILING_PROFILES = 50;

/** Ensure every B2C account has a "self" profile to file for. */
export async function ensureSelfProfile(
  userId: string,
  name: string
): Promise<{ id: string; name: string; relationship: string }> {
  const existing = await prisma.familyProfile.findFirst({
    where: { userId, relationship: "self" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, relationship: true },
  });
  if (existing) return existing;

  const profile = await prisma.familyProfile.create({
    data: { userId, name: name.trim() || "Myself", relationship: "self" },
    select: { id: true, name: true, relationship: true },
  });
  return profile;
}

/** Mark a filing profile as paid/unlocked for companion access. */
export async function unlockFamilyProfile(input: {
  profileId: string;
  userId: string;
  planId: PlanId;
  paymentId: string;
}): Promise<void> {
  await prisma.familyProfile.updateMany({
    where: { id: input.profileId, userId: input.userId },
    data: {
      unlockedPlanId: input.planId,
      unlockedAt: new Date(),
      lastPaymentId: input.paymentId,
      filingStatus: "in_progress",
    },
  });
}

export async function getProfileUnlockStatus(
  profileId: string,
  userId: string
): Promise<{ unlocked: boolean; planId: string | null }> {
  const profile = await prisma.familyProfile.findFirst({
    where: { id: profileId, userId },
    select: { unlockedPlanId: true },
  });
  return {
    unlocked: Boolean(profile?.unlockedPlanId),
    planId: profile?.unlockedPlanId ?? null,
  };
}
