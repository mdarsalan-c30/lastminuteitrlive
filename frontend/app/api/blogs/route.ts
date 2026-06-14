import { NextRequest, NextResponse } from "next/server";
import {
  estimateReadMinutes,
  getAllBlogPosts,
} from "@/lib/content/blogs";
import {
  loadUploadedBlogs,
  saveUploadedBlogs,
  type UploadedBlogPost,
} from "@/lib/content/blogs-store";

function isAdminAuthorized(request: NextRequest): boolean {
  const token = process.env.BLOG_ADMIN_TOKEN?.trim();
  if (!token) return false;
  const header =
    request.headers.get("x-blog-admin-token") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === token;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const posts = await getAllBlogPosts();
  return NextResponse.json({
    count: posts.length,
    posts: posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      tags: p.tags,
      publishedAt: p.publishedAt,
      readMinutes: p.readMinutes,
      source: p.source,
    })),
  });
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      slug?: string;
      excerpt?: string;
      body?: string;
      tags?: string[];
    };

    if (!body.title?.trim() || !body.excerpt?.trim() || !body.body?.trim()) {
      return NextResponse.json(
        { error: "title, excerpt, and body are required" },
        { status: 400 }
      );
    }

    const slug = body.slug?.trim() || slugify(body.title);
    if (!slug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const existing = await loadUploadedBlogs();
    if (existing.some((p) => p.slug === slug)) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const post: UploadedBlogPost = {
      slug,
      title: body.title.trim(),
      excerpt: body.excerpt.trim(),
      body: body.body.trim(),
      tags: (body.tags ?? []).map((t) => t.trim()).filter(Boolean),
      publishedAt: new Date().toISOString().slice(0, 10),
      readMinutes: estimateReadMinutes(body.body),
    };

    existing.push(post);
    await saveUploadedBlogs(existing);

    return NextResponse.json({ success: true, slug: post.slug });
  } catch (error) {
    console.error("blogs POST error:", error);
    return NextResponse.json({ error: "Failed to save blog" }, { status: 500 });
  }
}
