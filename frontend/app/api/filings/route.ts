import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/store";
import { requireB2CUser } from "@/lib/auth/b2cRequest";
import { saveFiling, listFilings, NotFoundError } from "@/lib/db/filings";

/** Cap the stored input+result payload to guard against runaway request bodies. */
const MAX_BODY_BYTES = 2_000_000;

/** List this user's filings (newest first), optionally filtered by assessment year. */
export async function GET(request: NextRequest) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const assessmentYear = searchParams.get("assessmentYear") ?? undefined;
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 200) : 50;

  const filings = await listFilings(auth.user.id, assessmentYear, limit);
  return NextResponse.json({ ok: true, filings });
}

/**
 * Persist a computed ITR result as an immutable filing row.
 * Pass parentId to record a correction/revision of an earlier filing.
 */
export async function POST(request: NextRequest) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: {
    familyProfileId?: string;
    assessmentYear?: string;
    userInput?: unknown;
    result?: unknown;
    rulesetId?: string;
    engineVersion?: string;
    parentId?: string;
    notes?: string;
  };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.assessmentYear !== "string" || !body.assessmentYear) {
    return NextResponse.json({ error: "assessmentYear is required" }, { status: 400 });
  }
  if (body.userInput == null || typeof body.userInput !== "object") {
    return NextResponse.json({ error: "userInput object is required" }, { status: 400 });
  }
  if (body.result == null || typeof body.result !== "object") {
    return NextResponse.json({ error: "result object is required" }, { status: 400 });
  }
  if (typeof body.rulesetId !== "string" || !body.rulesetId) {
    return NextResponse.json({ error: "rulesetId is required" }, { status: 400 });
  }
  if (typeof body.engineVersion !== "string" || !body.engineVersion) {
    return NextResponse.json({ error: "engineVersion is required" }, { status: 400 });
  }

  if (body.familyProfileId) {
    const owned = await prisma.familyProfile.findFirst({
      where: { id: body.familyProfileId, userId: auth.user.id },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "familyProfileId not found" }, { status: 404 });
    }
  }

  try {
    const filingId = await saveFiling({
      userId: auth.user.id,
      familyProfileId: body.familyProfileId ?? null,
      assessmentYear: body.assessmentYear,
      userInput: body.userInput,
      result: body.result,
      rulesetId: body.rulesetId,
      engineVersion: body.engineVersion,
      parentId: body.parentId ?? null,
      notes: body.notes ?? null,
    });
    return NextResponse.json({ ok: true, filingId }, { status: 201 });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
