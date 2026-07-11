import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/rbac";
import { writeAudit } from "@/lib/admin/audit";
import { prisma } from "@/lib/db/store";

/**
 * Admin actions on a customer:
 *   { action: "block" } | { action: "unblock" }
 *   { action: "flag", reason: string } | { action: "unflag" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request, "manageCrm");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const user = await prisma.b2CUser.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body.action as string;

  let data: { status?: string; flagReason?: string | null };
  switch (action) {
    case "block":
      data = { status: "blocked" };
      break;
    case "unblock":
      data = { status: "active" };
      break;
    case "flag": {
      const reason = typeof body.reason === "string" ? body.reason.trim() : "";
      if (!reason) {
        return NextResponse.json(
          { error: "A reason is required to flag a user" },
          { status: 400 }
        );
      }
      data = { flagReason: reason };
      break;
    }
    case "unflag":
      data = { flagReason: null };
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const updated = await prisma.b2CUser.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, status: true, flagReason: true },
  });

  await writeAudit({
    adminEmail: auth.email,
    action: `user_${action}`,
    entity: "b2cUser",
    entityId: id,
    before: { status: user.status, flagReason: user.flagReason },
    after: { status: updated.status, flagReason: updated.flagReason },
  });

  return NextResponse.json({ ok: true, user: updated });
}
