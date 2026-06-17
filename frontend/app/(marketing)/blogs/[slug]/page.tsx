import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCTA } from "@/components/marketing/BlogCTA";
import { LearnArticleFooter } from "@/components/marketing/LearnArticleFooter";
import { LearnArticleJsonLd } from "@/components/marketing/LearnArticleJsonLd";
import { MarkdownArticleBody } from "@/components/marketing/MarkdownArticleBody";
import { RelatedArticles } from "@/components/marketing/RelatedArticles";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { getAllBlogPosts, getBlogPost, getStaticBlogPosts } from "@/lib/content/blogs";
import { getLearnArticle } from "@/lib/content/learn-articles";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const staticPosts = getStaticBlogPosts();
  return staticPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Blog not found" };
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blogs/${slug}`,
  });
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const learnArticle = post.source === "learn" ? getLearnArticle(slug) : undefined;

  return (
    <>
      {learnArticle && <LearnArticleJsonLd article={learnArticle} />}
      <SiteHeader />
      <main className="mx-auto max-w-3xl min-w-0 overflow-x-hidden px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/blogs" className="text-sm text-primary hover:underline">
          ← All blogs
        </Link>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{post.title}</h1>
        <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            {post.readMinutes} min read · {post.publishedAt}
          </span>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>
        <article className="prose-article mt-8">
          <MarkdownArticleBody body={post.body} />
        </article>
        <BlogCTA className="mt-10" />
        {post.source === "learn" && <RelatedArticles slug={slug} basePath="/blogs" />}
        {post.relatedGlossarySlugs && (
          <LearnArticleFooter relatedGlossarySlugs={post.relatedGlossarySlugs} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
