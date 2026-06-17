import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCTA } from "@/components/marketing/BlogCTA";
import { LearnArticleFooter } from "@/components/marketing/LearnArticleFooter";
import { LearnArticleJsonLd } from "@/components/marketing/LearnArticleJsonLd";
import { RelatedArticles } from "@/components/marketing/RelatedArticles";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { getLearnArticle, LEARN_ARTICLES } from "@/lib/content/learn-articles";
import { renderInlineMarkdown } from "@/lib/content/render-inline-markdown";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return LEARN_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) return { title: "Article not found" };
  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `/learn/${slug}`,
  });
}

function renderMarkdownBody(body: string) {
  const blocks = body.trim().split("\n\n");
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-8 mb-3 text-xl font-semibold">
          {block.replace(/^## /, "")}
        </h2>
      );
    }
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="mt-6 mb-2 text-lg font-semibold">
          {block.replace(/^### /, "")}
        </h3>
      );
    }
    if (block.startsWith("|")) {
      const rows = block.split("\n").filter((r) => !r.includes("---"));
      return (
        <div key={i} className="my-4 overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split("|").filter(Boolean);
                const Tag = ri === 0 ? "th" : "td";
                return (
                  <tr key={ri}>
                    {cells.map((cell, ci) => (
                      <Tag key={ci} className="border border-border px-3 py-2 text-left">
                        {cell.trim()}
                      </Tag>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    if (/^\d+\./.test(block)) {
      const items = block.split("\n");
      return (
        <ol key={i} className="mb-4 ml-6 list-decimal space-y-1 text-muted-foreground">
          {items.map((item, li) => (
            <li key={li}>{renderInlineMarkdown(item.replace(/^\d+\.\s*/, ""))}</li>
          ))}
        </ol>
      );
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n");
      return (
        <ul key={i} className="mb-4 ml-6 list-disc space-y-1 text-muted-foreground">
          {items.map((item, li) => (
            <li key={li}>{renderInlineMarkdown(item.replace(/^-\s*/, ""))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mb-4 leading-relaxed text-muted-foreground">
        {renderInlineMarkdown(block)}
      </p>
    );
  });
}

export default async function LearnArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) notFound();

  return (
    <>
      <LearnArticleJsonLd article={article} />
      <SiteHeader />
      <main className="mx-auto max-w-3xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/learn" className="text-sm text-primary hover:underline">
          ← All articles
        </Link>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{article.title}</h1>
        <p className="mt-2 text-muted-foreground">{article.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {article.readMinutes} min read · {article.publishedAt}
        </p>
        <article className="prose-article mt-8">{renderMarkdownBody(article.body)}</article>
        <BlogCTA className="mt-10" />
        <RelatedArticles slug={slug} basePath="/learn" />
        <LearnArticleFooter relatedGlossarySlugs={article.relatedGlossarySlugs} />
      </main>
      <SiteFooter />
    </>
  );
}
