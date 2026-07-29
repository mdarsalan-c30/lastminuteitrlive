import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import { writeAudit } from "@/lib/admin/audit";
import { HERO_LIVE_STAT_ID } from "@/lib/heroLiveStat";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, "editContent");
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json()) as { baseValue?: number };
  const baseValue = Number(body.baseValue);
  if (!Number.isInteger(baseValue) || baseValue < 0 || baseValue > 100_000_000) {
    return NextResponse.json(
      { error: "Enter a whole number between 0 and 100,000,000." },
      { status: 400 }
    );
  }

  const before = await prisma.heroLiveStatConfig.findUnique({
    where: { id: HERO_LIVE_STAT_ID },
  });
  const config = await prisma.heroLiveStatConfig.upsert({
    where: { id: HERO_LIVE_STAT_ID },
    create: {
      id: HERO_LIVE_STAT_ID,
      baseValue,
      incrementBy: 200,
      intervalHours: 4,
      baseAt: new Date(),
      updatedBy: auth.email,
    },
    update: {
      baseValue,
      incrementBy: 200,
      intervalHours: 4,
      baseAt: new Date(),
      updatedBy: auth.email,
    },
  });

  await writeAudit({
    adminEmail: auth.email,
    action: "hero_live_stat.publish",
    entity: "hero_live_stat_config",
    entityId: config.id,
    before,
    after: config,
  });
  revalidatePath("/");
  return NextResponse.json({ ok: true, config });
}
