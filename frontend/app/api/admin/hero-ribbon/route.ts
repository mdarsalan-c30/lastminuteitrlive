import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import { writeAudit } from "@/lib/admin/audit";
import { prisma } from "@/lib/prisma";

const CONFIG_ID = "hero-offer-v2";

function validLink(value: string): boolean {
  return value.startsWith("/") || /^https:\/\/[^\s]+$/i.test(value);
}

function validImage(value: string): boolean {
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

  const config = await prisma.heroOfferRibbonConfig.findUnique({
    where: { id: CONFIG_ID },
  });
  return NextResponse.json({
    config: config ?? {
      id: CONFIG_ID,
      enabled: false,
      imageUrl: "",
      linkUrl: null,
      altText: "",
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
  const enabled = body.enabled === true;
  const imageUrl = body.imageUrl?.trim() || "";
  const linkUrl = body.linkUrl?.trim() || null;
  const altText = body.altText?.trim() || "";

  if (
    (enabled && (!imageUrl || !altText)) ||
    (imageUrl && !validImage(imageUrl)) ||
    (linkUrl && !validLink(linkUrl))
  ) {
    return NextResponse.json(
      { error: "An enabled ribbon needs a valid image and accessible description." },
      { status: 400 }
    );
  }
  if (altText.length > 160) {
    return NextResponse.json({ error: "Description is too long." }, { status: 400 });
  }

  const before = await prisma.heroOfferRibbonConfig.findUnique({
    where: { id: CONFIG_ID },
  });
  const values = {
    enabled,
    imageUrl,
    linkUrl,
    altText,
    showOnMobile: body.showOnMobile === true,
    updatedBy: auth.email,
  };
  const config = await prisma.heroOfferRibbonConfig.upsert({
    where: { id: CONFIG_ID },
    create: { id: CONFIG_ID, ...values },
    update: values,
  });

  await writeAudit({
    adminEmail: auth.email,
    action: "hero_offer_ribbon.publish",
    entity: "hero_offer_ribbon_config",
    entityId: config.id,
    before,
    after: config,
  });
  revalidatePath("/");
  return NextResponse.json({ ok: true, config });
}
