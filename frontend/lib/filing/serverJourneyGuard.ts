import { prisma } from "@/lib/db/store";
import { evaluateJourney } from "@/lib/filing/journeyGuard";

export async function validateSavedJourney(userId: string, profileId: string) {
  if (!profileId) {
    return {
      ok: false as const,
      status: 400,
      error: "Choose who you are filing for before payment.",
      nextUrl: "/file/family",
    };
  }
  const profile = await prisma.familyProfile.findFirst({
    where: { id: profileId, userId },
    select: { draftJson: true },
  });
  if (!profile) {
    return {
      ok: false as const,
      status: 404,
      error: "Filing profile not found.",
      nextUrl: "/file/family",
    };
  }
  const journey = evaluateJourney(profile.draftJson as Record<string, unknown>);
  if (!journey.complete) {
    const step = journey.firstIncomplete!;
    return {
      ok: false as const,
      status: 409,
      error: `Complete ${step.label} before payment: ${step.missing.join(", ")}.`,
      nextUrl: step.href,
    };
  }
  return { ok: true as const };
}
