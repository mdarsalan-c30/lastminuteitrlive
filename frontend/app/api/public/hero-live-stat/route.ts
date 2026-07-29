import { NextResponse } from "next/server";
import {
  calculateHeroLiveStat,
  HERO_LIVE_STAT_FALLBACK,
  HERO_LIVE_STAT_ID,
} from "@/lib/heroLiveStat";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await prisma.heroLiveStatConfig.findUnique({
      where: { id: HERO_LIVE_STAT_ID },
    });
    const resolved = config ?? HERO_LIVE_STAT_FALLBACK;
    return NextResponse.json(
      {
        value: calculateHeroLiveStat(resolved),
        incrementBy: resolved.incrementBy,
        intervalHours: resolved.intervalHours,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json(
      { value: 6578, incrementBy: 200, intervalHours: 4 },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
