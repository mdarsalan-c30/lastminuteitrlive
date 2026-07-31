import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import { writeAudit } from "@/lib/admin/audit";
import { prisma } from "@/lib/prisma";

const CONFIG_ID = "payment-assistant";
const DEFAULT_IMAGE = "/images/payment/filing-assistant.png";
const DEFAULT_ALT = "Filing assistant holding a laptop";

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
    where: { id: CONFIG_ID },
  });
  return NextResponse.json({
    config: config ?? {
      id: CONFIG_ID,
      enabled: true,
      imageUrl: DEFAULT_IMAGE,
      altText: DEFAULT_ALT,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, "editContent");
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json()) as {
    enabled?: boolean;
    imageUrl?: string;
    altText?: string;
  };
  const imageUrl = body.imageUrl?.trim() || DEFAULT_IMAGE;
  const altText = body.altText?.trim() || DEFAULT_ALT;

  if (!validImageUrl(imageUrl)) {
    return NextResponse.json(
      { error: "Use an uploaded Cloudinary image or an internal /path." },
      { status: 400 }
    );
  }
  if (altText.length > 160) {
    return NextResponse.json(
      { error: "Description must be 160 characters or fewer." },
      { status: 400 }
    );
  }

  const before = await prisma.heroRibbonConfig.findUnique({
    where: { id: CONFIG_ID },
  });
  const config = await prisma.heroRibbonConfig.upsert({
    where: { id: CONFIG_ID },
    create: {
      id: CONFIG_ID,
      enabled: body.enabled !== false,
      imageUrl,
      linkUrl: null,
      altText,
      showOnMobile: false,
      updatedBy: auth.email,
    },
    update: {
      enabled: body.enabled !== false,
      imageUrl,
      altText,
      updatedBy: auth.email,
    },
  });

  await writeAudit({
    adminEmail: auth.email,
    action: "payment_image.publish",
    entity: "payment_image_config",
    entityId: config.id,
    before,
    after: config,
  });
  revalidatePath("/file/checkout/payment");
  return NextResponse.json({ ok: true, config });
}
