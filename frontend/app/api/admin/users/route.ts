import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/rbac";
import { writeAudit } from "@/lib/admin/audit";
import { prisma } from "@/lib/db/store";
import { hashPassword } from "@/lib/auth/b2c";

/** List B2C customers with family-profile counts (newest first). */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, "manageCrm");
  if (auth instanceof NextResponse) return auth;

  const q = request.nextUrl.searchParams.get("q")?.trim();
  const users = await prisma.b2CUser.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      flagReason: true,
      createdBy: true,
      createdAt: true,
    },
  });

  const counts = await prisma.familyProfile.groupBy({
    by: ["userId"],
    _count: { _all: true },
    where: { userId: { in: users.map((u) => u.id) } },
  });
  const countMap = new Map(counts.map((c) => [c.userId, c._count._all]));

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      familyProfiles: countMap.get(u.id) ?? 0,
    })),
  });
}

/** Create a customer account from the admin panel. */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, "manageCrm");
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const existing = await prisma.b2CUser.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 400 }
    );
  }

  const user = await prisma.b2CUser.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      createdBy: auth.email,
    },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
  });

  await writeAudit({
    adminEmail: auth.email,
    action: "create_customer",
    entity: "b2cUser",
    entityId: user.id,
    after: { name, email },
  });

  return NextResponse.json({ ok: true, user }, { status: 201 });
}
