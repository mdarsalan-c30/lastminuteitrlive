import { NextRequest, NextResponse } from "next/server";
import { requireB2CUser } from "@/lib/auth/b2cRequest";
import { getAuditTrail, NotFoundError } from "@/lib/db/filings";

/** Append-only audit event log for a filing (creation, revisions, status transitions). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const events = await getAuditTrail(id, auth.user.id);
    return NextResponse.json({ ok: true, events });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: "Filing not found" }, { status: 404 });
    }
    throw err;
  }
}
