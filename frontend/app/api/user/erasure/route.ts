import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { B2C_SESSION_COOKIE, readB2CSession } from "@/lib/auth/b2c";
import { remove } from "@/lib/db/store";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(B2C_SESSION_COOKIE)?.value;
    const session = readB2CSession(token);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();

    if (email !== session.email) {
      return NextResponse.json(
        { error: "Email does not match logged-in user" },
        { status: 400 }
      );
    }

    // DPDP Right to Erasure - Execute Deletion

    // 1. Delete user from the database
    await remove("b2cUsers", session.userId);

    // TODO: When scaling to Postgres/Redis, add the deep cascading deletions here
    // e.g. deleteChatMessagesBySessionId(session.userId)
    // deleteSessionLogsBySessionId(session.userId)
    // deleteFeedbackByEmailOrId(session.email)

    // 2. Clear Session Cookie
    cookieStore.delete(B2C_SESSION_COOKIE);

    return NextResponse.json({ ok: true, deleted: true });
  } catch (err) {
    console.error("Erasure Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
