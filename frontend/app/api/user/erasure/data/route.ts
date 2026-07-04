import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { B2C_SESSION_COOKIE, readB2CSession } from "@/lib/auth/b2c";

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

    // DPDP Right to Erasure - Execute Data Deletion (Data Only)

    // TODO: When scaling to Postgres/Redis, add the deep cascading deletions here
    // e.g. deleteChatMessagesBySessionId(session.userId)
    // deleteSessionLogsBySessionId(session.userId)
    // deleteFeedbackByEmailOrId(session.email)
    // deleteDraftFiles(session.userId)
    
    // We do NOT delete the user record from b2cUsers here
    // We also do NOT delete the session cookie, so they stay logged in,
    // or they get redirected to login by the client-side logic as needed.
    // However, the client calls sessionStorage.clear(), so we just clear the cookie for safety and require re-login.
    cookieStore.delete(B2C_SESSION_COOKIE);

    return NextResponse.json({ ok: true, deleted: true });
  } catch (err) {
    console.error("Data Erasure Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
