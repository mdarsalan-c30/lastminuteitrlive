import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/admin/rbac";

const prisma = new PrismaClient();

interface BlogRouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: BlogRouteContext) {
  const auth = await requireAdmin(request, "editContent");
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await context.params;
    const data = await request.json();

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        status: data.status,
        coverImage: data.coverImage,
        focusKeyword: data.focusKeyword,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoScore: data.seoScore,
        authorId: data.authorId,
      },
    });
    return NextResponse.json(blog);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update blog";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: BlogRouteContext) {
  const auth = await requireAdmin(request, "editContent");
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await context.params;
    await prisma.blog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete blog";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
