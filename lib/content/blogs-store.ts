import { promises as fs } from "fs";
import path from "path";

export interface UploadedBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  publishedAt: string;
  readMinutes: number;
}

const memoryStore: UploadedBlogPost[] = [];

function blogsFilePath(): string {
  return path.join(process.cwd(), "data", "blogs.json");
}

export async function loadUploadedBlogs(): Promise<UploadedBlogPost[]> {
  try {
    const raw = await fs.readFile(blogsFilePath(), "utf-8");
    return JSON.parse(raw) as UploadedBlogPost[];
  } catch {
    return [...memoryStore];
  }
}

export async function saveUploadedBlogs(posts: UploadedBlogPost[]): Promise<void> {
  const filePath = blogsFilePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(posts, null, 2), "utf-8");
  memoryStore.length = 0;
  memoryStore.push(...posts);
}
