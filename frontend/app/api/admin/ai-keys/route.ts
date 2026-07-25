import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/rbac";
import { writeAudit } from "@/lib/admin/audit";
import {
  getGroqKeyStatus,
  replaceGroqFallbackKeys,
} from "@/lib/ai/groqKeys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, "manageAi");
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(await getGroqKeyStatus());
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request, "manageAi");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const keys = Array.isArray(body?.keys) ? body.keys : [];
    if (keys.some((key: unknown) => typeof key !== "string")) {
      return NextResponse.json({ error: "Keys must be strings" }, { status: 400 });
    }

    await replaceGroqFallbackKeys(keys, auth.email);
    const status = await getGroqKeyStatus();
    await writeAudit({
      adminEmail: auth.email,
      action: "ai_keys.updated",
      entity: "aiProviderConfig",
      entityId: "groq",
      after: {
        configuredSlots: status.fallbackSlots.filter((slot) => slot.configured).map((slot) => slot.slot),
      },
    });
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save AI keys" },
      { status: 400 }
    );
  }
}
