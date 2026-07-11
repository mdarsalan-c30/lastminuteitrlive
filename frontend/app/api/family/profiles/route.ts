import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/store";
import { requireB2CUser } from "@/lib/auth/b2cRequest";
import { MAX_FILING_PROFILES } from "@/lib/family/server";

const RELATIONSHIPS = [
  "self",
  "spouse",
  "father",
  "mother",
  "son",
  "daughter",
  "sibling",
  "client",
  "other",
] as const;

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

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

/** List all family profiles for the logged-in user. */
export async function GET(request: NextRequest) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const profiles = await prisma.familyProfile.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    profiles: profiles.map(serializeProfile),
    limit: MAX_FILING_PROFILES,
  });
}

/** Create a new family member profile (up to 10 per account). */
export async function POST(request: NextRequest) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const relationship = RELATIONSHIPS.includes(body.relationship)
    ? (body.relationship as string)
    : "other";
  const pan =
    typeof body.pan === "string" && body.pan.trim()
      ? body.pan.trim().toUpperCase()
      : null;
  const dob = typeof body.dob === "string" && body.dob.trim() ? body.dob.trim() : null;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (pan && !PAN_REGEX.test(pan)) {
    return NextResponse.json(
      { error: "That PAN doesn't look right — it should be like ABCDE1234F" },
      { status: 400 }
    );
  }

  const count = await prisma.familyProfile.count({
    where: { userId: auth.user.id },
  });
  if (count >= MAX_FILING_PROFILES) {
    return NextResponse.json(
      { error: `You can file for up to ${MAX_FILING_PROFILES} people from one account` },
      { status: 400 }
    );
  }

  if (pan) {
    const dupe = await prisma.familyProfile.findFirst({
      where: { userId: auth.user.id, pan },
      select: { id: true, name: true },
    });
    if (dupe) {
      return NextResponse.json(
        { error: `This PAN is already added for ${dupe.name}` },
        { status: 400 }
      );
    }
  }

  const profile = await prisma.familyProfile.create({
    data: { userId: auth.user.id, name, relationship, pan, dob },
  });

  return NextResponse.json({ profile: serializeProfile(profile) }, { status: 201 });
}
