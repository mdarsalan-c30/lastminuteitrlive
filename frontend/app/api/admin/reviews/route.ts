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
      const review = await prisma.review.findUnique({ where: { id } });
      return NextResponse.json({ review });
    }

    const reviews = await prisma.review.findMany({
      orderBy: { order: "asc" }
    });
    return NextResponse.json({ reviews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req as any);
    if (admin instanceof NextResponse) return admin;

    const body = await req.json();
    const review = await prisma.review.create({
      data: {
        name: body.name,
        role: body.role || null,
        city: body.city || null,
        quote: body.quote,
        rating: body.rating ?? 5,
        plan: body.plan || null,
        outcomeTag: body.outcomeTag || null,
        published: body.published ?? true,
        order: body.order ?? 0,
      }
    });
    return NextResponse.json({ review });
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
    const review = await prisma.review.update({
      where: { id },
      data
    });
    return NextResponse.json({ review });
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

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
