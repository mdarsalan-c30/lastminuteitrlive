import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fallback = {
  enabled: true,
  imageUrl: "/images/payment/filing-assistant.png",
  altText: "Filing assistant holding a laptop",
};

export async function GET() {
  try {
    const config = await prisma.heroRibbonConfig.findUnique({
      where: { id: "payment-assistant" },
      select: { enabled: true, imageUrl: true, altText: true },
    });
    return NextResponse.json(config ?? fallback, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json(fallback, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}
