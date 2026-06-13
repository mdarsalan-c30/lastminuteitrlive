import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCTA } from "@/components/marketing/BlogCTA";
import { MarkdownArticleBody } from "@/components/marketing/MarkdownArticleBody";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Badge } from "@/components/ui/badge";
import {
  getHelpArticle,
  getNativeHelpArticles,
  HELP_ARTICLES,
  HELP_PILLARS,
} from "@/lib/content/help-articles";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getNativeHelpArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getHelpArticle(slug);
  if (!article) return { title: "Help article not found" };
  return pageMetadata({
    title: `${article.title} — Help`,
    description: article.summary,
    path: `/help/${slug}`,
  });
}

export default async function HelpArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getHelpArticle(slug);
  if (!article || !article.body) notFound();

  const pillar = HELP_PILLARS.find((p) => p.id === article.pillar);
  const related = HELP_ARTICLES.filter(
    (a) => a.pillar === article.pillar && a.slug !== article.slug && a.body
  ).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/help" className="text-sm text-primary hover:underline">
          ← Help center
        </Link>
        {pillar && (
          <div className="mt-4">
            <Badge variant="secondary">{pillar.label}</Badge>
          </div>
        )}
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{article.title}</h1>
        <p className="mt-2 text-muted-foreground">{article.summary}</p>
        <article className="prose-article mt-8">
          <MarkdownArticleBody body={article.body} />
        </article>

        <BlogCTA className="mt-10" />

        {related.length > 0 && (
          <section className="mt-10 border-t border-border/60 pt-6">
            <h2 className="text-sm font-semibold text-foreground">
              More in {pillar?.label ?? "Help"}
            </h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={r.href} className="text-sm text-primary hover:underline">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
