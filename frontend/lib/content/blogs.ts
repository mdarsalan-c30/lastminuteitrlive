import { promises as fs } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  publishedAt: string;
  readMinutes: number;
  coverImage?: string | null;
  source: "upload" | "prisma";
  relatedGlossarySlugs?: [string, string];
}

const prisma = new PrismaClient();

function blogsFilePath(): string {
  return path.join(process.cwd(), "data", "blogs.json");
}

export function estimateReadMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(3, Math.ceil(words / 200));
}

async function loadFileBlogs(): Promise<BlogPost[]> {
  try {
    const raw = await fs.readFile(blogsFilePath(), "utf-8");
    const parsed = JSON.parse(raw) as BlogPost[];
    return parsed.map((post) => ({
      ...post,
      source: "upload" as const,
      readMinutes: post.readMinutes ?? estimateReadMinutes(post.body),
    }));
  } catch {
    return [];
  }
}

async function loadPrismaBlogs(): Promise<BlogPost[]> {
  try {
    const dbBlogs = await prisma.blog.findMany({
      where: { status: "published" },
      orderBy: { updatedAt: "desc" },
    });

    return dbBlogs.map((b) => ({
      slug: b.slug,
      title: b.title,
      excerpt:
        b.seoDescription ||
        b.content.substring(0, 150).replace(/(<([^>]+)>)/gi, ""),
      body: b.content,
      tags: b.focusKeyword ? [b.focusKeyword] : ["Blog"],
      publishedAt: b.updatedAt.toISOString(),
      readMinutes: estimateReadMinutes(b.content),
      coverImage: b.coverImage,
      source: "prisma" as const,
    }));
  } catch {
    return [];
  }
}

/** File-based blogs ship with the repo; Prisma blogs merge in when DB is configured. */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const [filePosts, prismaPosts] = await Promise.all([
    loadFileBlogs(),
    loadPrismaBlogs(),
  ]);

  const bySlug = new Map<string, BlogPost>();
  for (const post of filePosts) {
    bySlug.set(post.slug, post);
  }
  for (const post of prismaPosts) {
    if (!bySlug.has(post.slug)) {
      bySlug.set(post.slug, post);
    }
  }

  return [...bySlug.values()].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const posts = await getAllBlogPosts();
  return posts.find((p) => p.slug === slug);
}
