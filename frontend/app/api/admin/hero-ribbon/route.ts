import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import { writeAudit } from "@/lib/admin/audit";
import { prisma } from "@/lib/prisma";

const DEFAULT_IMAGE = "/coupon-narnia.png";

function validUrl(value: string): boolean {
  return value.startsWith("/") || /^https:\/\/[^\s]+$/i.test(value);
}

function validImageUrl(value: string): boolean {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, "editContent");
  if (auth instanceof NextResponse) return auth;

  const config = await prisma.heroRibbonConfig.findUnique({
    where: { id: "hero-offer" },
  });
  return NextResponse.json({
    config: config ?? {
      id: "hero-offer",
      enabled: true,
      imageUrl: DEFAULT_IMAGE,
      linkUrl: null,
      altText: "₹349 offer — use code NARNIA for 10% discount",
      showOnMobile: false,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, "editContent");
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json()) as {
    enabled?: boolean;
    imageUrl?: string;
    linkUrl?: string | null;
    altText?: string;
    showOnMobile?: boolean;
  };
  const imageUrl = body.imageUrl?.trim() || DEFAULT_IMAGE;
  const linkUrl = body.linkUrl?.trim() || null;
  const altText = body.altText?.trim() || "Special filing offer";

  if (!validImageUrl(imageUrl) || (linkUrl && !validUrl(linkUrl))) {
    return NextResponse.json(
      {
        error:
          "Use an uploaded Cloudinary image or an internal /path. Links may use secure https:// URLs.",
      },
      { status: 400 }
    );
  }
  if (altText.length > 160) {
    return NextResponse.json(
      { error: "Alt text must be 160 characters or fewer." },
      { status: 400 }
    );
  }

  const before = await prisma.heroRibbonConfig.findUnique({
    where: { id: "hero-offer" },
  });
  const config = await prisma.heroRibbonConfig.upsert({
    where: { id: "hero-offer" },
    create: {
      id: "hero-offer",
      enabled: body.enabled !== false,
      imageUrl,
      linkUrl,
      altText,
      showOnMobile: body.showOnMobile === true,
      updatedBy: auth.email,
    },
    update: {
      enabled: body.enabled !== false,
      imageUrl,
      linkUrl,
      altText,
      showOnMobile: body.showOnMobile === true,
      updatedBy: auth.email,
    },
  });

  await writeAudit({
    adminEmail: auth.email,
    action: "hero_ribbon.publish",
    entity: "hero_ribbon_config",
    entityId: config.id,
    before,
    after: config,
  });
  revalidatePath("/");
  return NextResponse.json({ ok: true, config });
}
