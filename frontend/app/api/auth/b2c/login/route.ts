import { NextRequest, NextResponse } from "next/server";
import { prisma, update } from "@/lib/db/store";
import {
  hashPassword,
  isLegacyPasswordHash,
  verifyPassword,
  createB2CSessionToken,
  B2C_SESSION_COOKIE,
  b2cCookieOptions,
} from "@/lib/auth/b2c";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.b2CUser.findFirst({
      where: { email: normalizedEmail },
    });
    if (!user) {
      // Check if they are a CA partner
      const isTenant = Boolean(
        await prisma.tenant.findFirst({
          where: { email: { equals: normalizedEmail, mode: "insensitive" } },
          select: { id: true },
        })
      );
      if (isTenant) {
        return NextResponse.json(
          { error: "This email is registered as a CA Partner. Please log in through the CA Partner Login page." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }


    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (isLegacyPasswordHash(user.passwordHash)) {
      await update("b2cUsers", user.id, {
        passwordHash: hashPassword(password),
      });
    }

    // Create session
    const token = createB2CSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set(B2C_SESSION_COOKIE, token, b2cCookieOptions());

    return NextResponse.json({ ok: true, user: { name: user.name, email: user.email } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
