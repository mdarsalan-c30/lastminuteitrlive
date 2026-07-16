import { NextRequest, NextResponse } from "next/server";
import { requireB2CUser } from "@/lib/auth/b2cRequest";
import { getRevisionChain, NotFoundError } from "@/lib/db/filings";

/** Full revision chain (original -> latest) for a filing. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireB2CUser(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const chain = await getRevisionChain(id, auth.user.id);
    return NextResponse.json({ ok: true, chain });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: "Filing not found" }, { status: 404 });
    }
    throw err;
  }
}
