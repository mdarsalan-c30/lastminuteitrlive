import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/store";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { passkey?: string };
    if (!body.passkey) {
      return NextResponse.json(
        { verified: false, error: "Passkey is required" },
        { status: 400 }
      );
    }

    const normalizedPasskey = body.passkey.trim().toUpperCase();
    const grant = await prisma.companionGrant.findFirst({
      where: { passkey: { equals: normalizedPasskey, mode: "insensitive" } },
    });

    if (!grant) {
      return NextResponse.json(
        { verified: false, error: "Invalid passkey" },
        { status: 404 }
      );
    }

    if (grant.expiresAt && new Date(grant.expiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { verified: false, error: "Passkey has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      plan: grant.plan,
      expiresAt: grant.expiresAt,
      sessionId: grant.sessionId,
    });
  } catch (error) {
    console.error("Passkey verification error:", error);
    return NextResponse.json(
      { verified: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
