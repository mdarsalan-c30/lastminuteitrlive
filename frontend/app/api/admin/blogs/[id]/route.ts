import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, context: any) {
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const { id } = await context.params;
    await prisma.blog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
