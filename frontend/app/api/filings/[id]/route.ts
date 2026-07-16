import { NextRequest, NextResponse } from "next/server";
import { requireB2CUser } from "@/lib/auth/b2cRequest";
import { getFiling, NotFoundError } from "@/lib/db/filings";

/** Load one filing (full input + result payload) for resume/display. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const filing = await getFiling(id, auth.user.id);
    return NextResponse.json({ ok: true, filing });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: "Filing not found" }, { status: 404 });
    }
    throw err;
  }
}
