import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fallback = {
  enabled: true,
  imageUrl: "/coupon-narnia.png",
  linkUrl: null,
  altText: "₹349 offer — use code NARNIA for 10% discount",
  showOnMobile: false,
};

export async function GET() {
  try {
    const config = await prisma.heroRibbonConfig.findUnique({
      where: { id: "hero-offer" },
      select: {
        enabled: true,
        imageUrl: true,
        linkUrl: true,
        altText: true,
        showOnMobile: true,
      },
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
