import { prisma, update } from "@/lib/db/store";
import type { PlanId } from "@/lib/payments/plans";

/** Filing credits granted per B2B pack purchase. */
export const B2B_PACK_CREDITS: Partial<Record<PlanId, number>> = {
  b2b_20: 20,
  b2b_40: 40,
  b2b_100: 100,
};

export function isB2bPackPlan(planId: PlanId): boolean {
  return planId in B2B_PACK_CREDITS;
}

export function creditsForB2bPlan(planId: PlanId): number {
  return B2B_PACK_CREDITS[planId] ?? 0;
}

/** Top up a CA tenant wallet after a B2B pack purchase. */
export async function addTenantFilingCredits(
  tenantId: string,
  credits: number
): Promise<number> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { creditsAvailable: true },
  });
  if (!tenant) throw new Error("Tenant not found");
  const next = (tenant.creditsAvailable ?? 0) + credits;
  await update("tenants", tenantId, { creditsAvailable: next });
  return next;
}

/** Consume one B2C wallet credit (multi-pack purchases). */
export async function consumeB2CFilingCredit(userId: string): Promise<boolean> {
  const user = await prisma.b2CUser.findUnique({
    where: { id: userId },
    select: { filingsRemaining: true },
  });
  if (!user || user.filingsRemaining < 1) return false;
  await prisma.b2CUser.update({
    where: { id: userId },
    data: { filingsRemaining: user.filingsRemaining - 1 },
  });
  return true;
}

/** Grant B2C wallet credits (admin or future multi-pack). */
export async function addB2CFilingCredits(
  userId: string,
  credits: number
): Promise<number> {
  const user = await prisma.b2CUser.findUnique({
    where: { id: userId },
    select: { filingsRemaining: true },
  });
  if (!user) throw new Error("User not found");
  const next = user.filingsRemaining + credits;
  await prisma.b2CUser.update({
    where: { id: userId },
    data: { filingsRemaining: next },
  });
  return next;
}
