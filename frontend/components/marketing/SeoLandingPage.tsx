import Link from "next/link";
import { MarkdownArticleBody } from "@/components/marketing/MarkdownArticleBody";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LearnArticle } from "@/lib/content/learn-articles";
import type { SeoLandingPage as SeoLandingConfig } from "@/lib/seo/landing-pages";
import { pageMetadata } from "@/lib/seo";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

interface SeoLandingPageProps {
  config: SeoLandingConfig;
  article: LearnArticle;
}

export function buildLandingMetadata(
  config: SeoLandingConfig,
  article: LearnArticle
): Metadata {
  return pageMetadata({
    title: article.title,
    description: article.description,
    path: config.path,
  });
}

export function SeoLandingPageView({ config, article }: SeoLandingPageProps) {
  const previewBody = article.body.split("\n\n").slice(0, 6).join("\n\n");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl min-w-0 px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm text-muted-foreground">
          <Link href="/learn" className="text-primary hover:underline">
            Learn
          </Link>
          {" · "}
          <Link href={`/learn/${article.slug}`} className="text-primary hover:underline">
            Full article
          </Link>
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{article.description}</p>

        <Link
          href={config.ctaHref}
          className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex gap-2")}
        >
          {config.ctaLabel}
          <ArrowRight className="size-4" />
        </Link>

        <article className="prose-article mt-10">
          <MarkdownArticleBody body={previewBody} />
        </article>

        <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <p className="text-sm text-muted-foreground">
            Continue reading the full guide for examples, tables, and step-by-step checklists.
          </p>
          <Link
            href={`/learn/${article.slug}`}
            className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
          >
            Read full guide
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
