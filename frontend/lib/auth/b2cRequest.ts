import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/store";
import { B2C_SESSION_COOKIE, readB2CSession, type B2CSession } from "@/lib/auth/b2c";

export interface AuthedB2CUser {
  session: B2CSession;
  user: { id: string; name: string; email: string; status: string };
}

/**
 * API-route guard for logged-in B2C users. Verifies the session cookie,
 * loads the user, and enforces admin blocks.
 *
 * Usage:
 *   const auth = await requireB2CUser(request);
 *   if (auth instanceof NextResponse) return auth;
 */
export async function requireB2CUser(
  request: NextRequest
): Promise<AuthedB2CUser | NextResponse> {
  const token = request.cookies.get(B2C_SESSION_COOKIE)?.value;
  const session = readB2CSession(token);
  if (!session) {
    return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  }

  const user = await prisma.b2CUser.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, status: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 401 });
  }
  if (user.status === "blocked") {
    return NextResponse.json(
      {
        error:
          "Your account has been temporarily blocked. Please contact support@lastminute-itr.com.",
        code: "ACCOUNT_BLOCKED",
      },
      { status: 403 }
    );
  }

  return { session, user };
}
