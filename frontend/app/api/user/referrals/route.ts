import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { B2C_SESSION_COOKIE, readB2CSession } from "@/lib/auth/b2c";
import { generateReferralCode, getReferralCodeByOwner, getB2CWallet } from "@/lib/admin/referrals";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(B2C_SESSION_COOKIE)?.value;
    const session = readB2CSession(token);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const code = await getReferralCodeByOwner(session.email);
    const wallet = await getB2CWallet(session.email);

    return NextResponse.json({ code, wallet });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(B2C_SESSION_COOKIE)?.value;
    const session = readB2CSession(token);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const code = await generateReferralCode(session.email);
    return NextResponse.json({ code });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
