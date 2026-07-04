import { NextResponse } from "next/server";
import { getReferralConfig } from "@/lib/admin/referrals";

export async function GET() {
  try {
    const config = await getReferralConfig();
    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
