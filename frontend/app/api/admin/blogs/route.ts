import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/admin/rbac";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, "editContent");
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const blog = await prisma.blog.findUnique({ where: { id } });
      if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(blog);
    }

    const blogs = await prisma.blog.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(blogs);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load blogs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, "editContent");
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();
    const blog = await prisma.blog.create({
      data: {
        title: data.title || "Untitled Draft",
        slug: data.slug || `draft-${Date.now()}`,
        content: data.content || "",
        status: data.status || "draft",
        coverImage: data.coverImage || null,
        focusKeyword: data.focusKeyword || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoScore: data.seoScore || 0,
        authorId: data.authorId || null,
      },
    });
    return NextResponse.json(blog);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create blog";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
