import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/rbac";

function optionalHttpsUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const url = new URL(value.trim());
  if (url.protocol !== "https:") throw new Error("Profile and image URLs must use https://.");
  return url.toString();
}

function reviewData(body: any) {
  if (typeof body.name !== "string" || !body.name.trim()) throw new Error("Name is required.");
  if (typeof body.quote !== "string" || !body.quote.trim()) throw new Error("Review text is required.");
  const rating = Number(body.rating);
  return {
    name: body.name.trim(),
    role: typeof body.role === "string" && body.role.trim() ? body.role.trim() : null,
    city: typeof body.city === "string" && body.city.trim() ? body.city.trim() : null,
    quote: body.quote.trim(),
    rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : 5,
    plan: typeof body.plan === "string" && body.plan.trim() ? body.plan.trim() : null,
    outcomeTag:
      typeof body.outcomeTag === "string" && body.outcomeTag.trim()
        ? body.outcomeTag.trim()
        : null,
    avatarUrl: optionalHttpsUrl(body.avatarUrl),
    profileUrl: optionalHttpsUrl(body.profileUrl),
    published: body.published !== false,
    order: Number.isInteger(Number(body.order)) ? Number(body.order) : 0,
  };
}

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
    const review = await prisma.review.create({ data: reviewData(body) });
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
    const { id } = body;
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "Missing review id." }, { status: 400 });
    }
    const review = await prisma.review.update({
      where: { id },
      data: reviewData(body),
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
