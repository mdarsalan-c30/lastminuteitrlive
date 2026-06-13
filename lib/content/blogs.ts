import { LEARN_ARTICLES, type LearnArticle } from "./learn-articles";
import { loadUploadedBlogs, type UploadedBlogPost } from "./blogs-store";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  publishedAt: string;
  readMinutes: number;
  source: "learn" | "upload";
  relatedGlossarySlugs?: [string, string];
}

function learnToBlog(article: LearnArticle): BlogPost {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.description,
    body: article.body,
    tags: article.tags ?? ["ITR", "Guide"],
    publishedAt: article.publishedAt,
    readMinutes: article.readMinutes,
    source: "learn",
    relatedGlossarySlugs: article.relatedGlossarySlugs,
  };
}

function uploadToBlog(post: UploadedBlogPost): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    tags: post.tags,
    publishedAt: post.publishedAt,
    readMinutes: post.readMinutes,
    source: "upload",
  };
}

export function getStaticBlogPosts(): BlogPost[] {
  return LEARN_ARTICLES.map(learnToBlog);
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const uploaded = await loadUploadedBlogs();
  const staticPosts = getStaticBlogPosts();
  const uploadedPosts = uploaded.map(uploadToBlog);
  const staticSlugs = new Set(staticPosts.map((p) => p.slug));
  const uniqueUploaded = uploadedPosts.filter((p) => !staticSlugs.has(p.slug));
  return [...uniqueUploaded, ...staticPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const posts = await getAllBlogPosts();
  return posts.find((p) => p.slug === slug);
}

export function estimateReadMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(3, Math.ceil(words / 200));
}
