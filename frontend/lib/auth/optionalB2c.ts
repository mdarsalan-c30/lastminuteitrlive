import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/store";
import { B2C_SESSION_COOKIE, readB2CSession } from "@/lib/auth/b2c";

/** Best-effort B2C session for routes that work for guests and logged-in users. */
export async function getOptionalB2CUser(request: NextRequest) {
  const token = request.cookies.get(B2C_SESSION_COOKIE)?.value;
  const session = readB2CSession(token);
  if (!session) return null;

  const user = await prisma.b2CUser.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      filingsRemaining: true,
    },
  });
  if (!user || user.status === "blocked") return null;
  return { session, user };
}
