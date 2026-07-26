import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/rbac";
import { writeAudit } from "@/lib/admin/audit";
import {
  getManagedAiKeyStatus,
  isManagedAiProvider,
  replaceManagedAiKeys,
} from "@/lib/ai/providerKeys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, "manageAi");
  if (auth instanceof NextResponse) return auth;
  const [openai, groq] = await Promise.all([
    getManagedAiKeyStatus("openai"),
    getManagedAiKeyStatus("groq"),
  ]);
  return NextResponse.json({ providers: { openai, groq } });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request, "manageAi");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const provider = body?.provider;
    if (!isManagedAiProvider(provider)) {
      return NextResponse.json({ error: "Provider must be openai or groq" }, { status: 400 });
    }
    const keys = Array.isArray(body?.keys) ? body.keys : [];
    if (keys.some((key: unknown) => typeof key !== "string")) {
      return NextResponse.json({ error: "Keys must be strings" }, { status: 400 });
    }

    await replaceManagedAiKeys(provider, keys, auth.email);
    const status = await getManagedAiKeyStatus(provider);
    await writeAudit({
      adminEmail: auth.email,
      action: "ai_keys.updated",
      entity: "aiProviderConfig",
      entityId: provider,
      after: {
        configuredSlots: status.fallbackSlots.filter((slot) => slot.configured).map((slot) => slot.slot),
      },
    });
    return NextResponse.json({ provider, status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save AI keys" },
      { status: 400 }
    );
  }
}
