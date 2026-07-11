import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/store";
import { requireB2CUser } from "@/lib/auth/b2cRequest";

const FILING_STATUSES = ["not_started", "in_progress", "filed"] as const;

async function loadOwnedProfile(userId: string, profileId: string) {
  return prisma.familyProfile.findFirst({
    where: { id: profileId, userId },
  });
}

/** Update a family member's details or filing status. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const profile = await loadOwnedProfile(auth.user.id, id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.relationship === "string") data.relationship = body.relationship;
  if (typeof body.pan === "string") data.pan = body.pan.trim().toUpperCase() || null;
  if (typeof body.dob === "string") data.dob = body.dob.trim() || null;
  if (FILING_STATUSES.includes(body.filingStatus)) data.filingStatus = body.filingStatus;

  const updated = await prisma.familyProfile.update({ where: { id }, data });
  return NextResponse.json({
    profile: {
      id: updated.id,
      name: updated.name,
      relationship: updated.relationship,
      pan: updated.pan,
      dob: updated.dob,
      filingStatus: updated.filingStatus,
      hasDraft: updated.draftJson != null,
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}

/** Remove a family member profile (and its saved draft). */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const profile = await loadOwnedProfile(auth.user.id, id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await prisma.familyProfile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
