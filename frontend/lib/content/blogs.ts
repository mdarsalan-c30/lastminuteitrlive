import { PrismaClient } from "@prisma/client";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  publishedAt: string;
  readMinutes: number;
  source: "upload";
  relatedGlossarySlugs?: [string, string];
}

const prisma = new PrismaClient();

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  // Load from Prisma
  const dbBlogs = await prisma.blog.findMany({
    where: { status: "published" },
    orderBy: { updatedAt: 'desc' }
  });

  const prismaPosts: BlogPost[] = dbBlogs.map(b => ({
    slug: b.slug,
    title: b.title,
    excerpt: b.seoDescription || b.content.substring(0, 150).replace(/(<([^>]+)>)/gi, ""),
    body: b.content,
    tags: b.focusKeyword ? [b.focusKeyword] : ["Blog"],
    publishedAt: b.updatedAt.toISOString(),
    readMinutes: estimateReadMinutes(b.content),
    source: "upload"
  }));
  
  return prismaPosts;
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const dbBlog = await prisma.blog.findUnique({ where: { slug } });
  if (dbBlog && dbBlog.status === 'published') {
    return {
      slug: dbBlog.slug,
      title: dbBlog.title,
      excerpt: dbBlog.seoDescription || dbBlog.content.substring(0, 150).replace(/(<([^>]+)>)/gi, ""),
      body: dbBlog.content,
      tags: dbBlog.focusKeyword ? [dbBlog.focusKeyword] : ["Blog"],
      publishedAt: dbBlog.updatedAt.toISOString(),
      readMinutes: estimateReadMinutes(dbBlog.content),
      source: "upload"
    };
  }

  return undefined;
}

export function estimateReadMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(3, Math.ceil(words / 200));
}
