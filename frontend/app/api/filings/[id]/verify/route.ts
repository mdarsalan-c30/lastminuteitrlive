import { NextRequest, NextResponse } from "next/server";
import { requireB2CUser } from "@/lib/auth/b2cRequest";
import { verifyIntegrity, NotFoundError } from "@/lib/db/filings";

/** Re-hash the stored input/result payloads against their recorded sha256 digests. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const result = await verifyIntegrity(id, auth.user.id);
    return NextResponse.json({ ok: true, valid: result.ok, detail: result.detail });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: "Filing not found" }, { status: 404 });
    }
    throw err;
  }
}
