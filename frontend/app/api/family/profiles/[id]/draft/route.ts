import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/store";
import { requireB2CUser } from "@/lib/auth/b2cRequest";

/** Draft payloads are the persisted Zustand draft state — cap at 1 MB. */
const MAX_DRAFT_BYTES = 1_000_000;

/** Load the saved filing draft for a family member. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const profile = await prisma.familyProfile.findFirst({
    where: { id, userId: auth.user.id },
    select: { draftJson: true, filingStatus: true, updatedAt: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    draft: profile.draftJson ?? null,
    filingStatus: profile.filingStatus,
    updatedAt: profile.updatedAt.toISOString(),
  });
}

/** Save the current filing draft against a family member. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const owned = await prisma.familyProfile.findFirst({
    where: { id, userId: auth.user.id },
    select: { id: true, filingStatus: true },
  });
  if (!owned) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const raw = await request.text();
  if (raw.length > MAX_DRAFT_BYTES) {
    return NextResponse.json({ error: "Draft too large" }, { status: 413 });
  }

  let body: { draft?: unknown; filingStatus?: string };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body.draft == null || typeof body.draft !== "object") {
    return NextResponse.json({ error: "draft object is required" }, { status: 400 });
  }

  const filingStatus =
    body.filingStatus === "filed"
      ? "filed"
      : owned.filingStatus === "filed"
        ? "filed"
        : "in_progress";

  const updated = await prisma.familyProfile.update({
    where: { id },
    data: { draftJson: body.draft as object, filingStatus },
  });

  return NextResponse.json({
    ok: true,
    filingStatus: updated.filingStatus,
    updatedAt: updated.updatedAt.toISOString(),
  });
}
