import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/rbac";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req as any);
    if (admin instanceof NextResponse) return admin;

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const link = await prisma.footerLink.findUnique({ where: { id } });
      return NextResponse.json({ link });
    }

    const links = await prisma.footerLink.findMany({
      orderBy: [{ section: "asc" }, { order: "asc" }]
    });
    return NextResponse.json({ links });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req as any);
    if (admin instanceof NextResponse) return admin;

    const body = await req.json();
    const link = await prisma.footerLink.create({
      data: {
        label: body.label,
        href: body.href,
        section: body.section,
        order: body.order ?? 0,
        isExternal: body.isExternal ?? false,
      }
    });
    return NextResponse.json({ link });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin(req as any);
    if (admin instanceof NextResponse) return admin;

    const body = await req.json();
    const { id, ...data } = body;
    const link = await prisma.footerLink.update({
      where: { id },
      data
    });
    return NextResponse.json({ link });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin(req as any);
    if (admin instanceof NextResponse) return admin;

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.footerLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
