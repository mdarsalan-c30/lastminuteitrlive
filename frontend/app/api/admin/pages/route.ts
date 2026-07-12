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
      const page = await prisma.landingPage.findUnique({ where: { id } });
      return NextResponse.json({ page });
    }

    const pages = await prisma.landingPage.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ pages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req as any);
    if (admin instanceof NextResponse) return admin;

    const body = await req.json();
    const page = await prisma.landingPage.create({
      data: {
        slug: body.slug,
        title: body.title,
        description: body.description || null,
        bodyMarkdown: body.bodyMarkdown,
        seoKeywords: body.seoKeywords || null,
        seoDescription: body.seoDescription || null,
        published: body.published ?? false,
      }
    });
    return NextResponse.json({ page });
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
    const page = await prisma.landingPage.update({
      where: { id },
      data
    });
    return NextResponse.json({ page });
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

    await prisma.landingPage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
