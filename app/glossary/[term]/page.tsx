import Link from "next/link";
import { notFound } from "next/navigation";
import { GlossaryTermFooter } from "@/components/marketing/GlossaryTermFooter";
import { MarkdownArticleBody } from "@/components/marketing/MarkdownArticleBody";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Badge } from "@/components/ui/badge";
import {
  getGlossarySlugs,
  getGlossaryTerm,
  isGlossaryTermIndexable,
} from "@/lib/content/glossary";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ term: string }>;
}

export async function generateStaticParams() {
  return getGlossarySlugs().map((term) => ({ term }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { term: slug } = await params;
  const entry = getGlossaryTerm(slug);
  if (!entry) return { title: "Term not found" };
  const indexable = isGlossaryTermIndexable(entry);
  return pageMetadata({
    title: entry.label,
    description: entry.explanation,
    path: `/glossary/${slug}`,
    robots: indexable ? undefined : { index: false, follow: true },
  });
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { term: slug } = await params;
  const entry = getGlossaryTerm(slug);
  if (!entry) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/glossary" className="text-sm text-primary hover:underline">
          ← Glossary
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{entry.id}</Badge>
          {entry.category && (
            <Badge variant="outline" className="text-xs font-normal">
              {entry.category}
            </Badge>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{entry.label}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {entry.explanation}
        </p>
        {entry.extendedBody && (
          <article className="prose-article mt-8">
            <MarkdownArticleBody body={entry.extendedBody} />
          </article>
        )}
        <GlossaryTermFooter term={entry} />
      </main>
      <SiteFooter />
    </>
  );
}
