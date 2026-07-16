import { NextRequest, NextResponse } from "next/server";
import { requireB2CUser } from "@/lib/auth/b2cRequest";
import { setStatus, FILING_STATUSES, FilingStatus, NotFoundError } from "@/lib/db/filings";

/** Record a lifecycle transition (computed -> reviewed -> filed_on_portal, or superseded). */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  let body: { status?: string; detail?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.status || !FILING_STATUSES.includes(body.status as FilingStatus)) {
    return NextResponse.json(
      { error: `status must be one of ${FILING_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    await setStatus(id, auth.user.id, body.status as FilingStatus, body.detail ?? null);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: "Filing not found" }, { status: 404 });
    }
    throw err;
  }
}
