import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const links = await prisma.footerLink.findMany({
      orderBy: { order: "asc" }
    });
    return NextResponse.json({ links });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
