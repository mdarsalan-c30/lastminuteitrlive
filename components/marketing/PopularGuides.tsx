import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getLearnArticle } from "@/lib/content/learn-articles";
import { TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { ArrowRight, BookOpen } from "lucide-react";

const PRIORITY_GUIDE_SLUGS = [
  "file-itr-without-ca",
  "old-vs-new-regime",
  "itr-1-salaried-guide",
  "ais-mismatch",
  "last-minute-filing",
  "two-form-16-job-change",
] as const;

function getPriorityGuides() {
  return PRIORITY_GUIDE_SLUGS.map((slug) => getLearnArticle(slug)).filter(
    (article): article is NonNullable<typeof article> => article !== undefined
  );
}

export function PopularGuides() {
  const guides = getPriorityGuides();

  return (
    <section className="section-compact border-b border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-tier-feature font-medium text-primary">
              <BookOpen className="size-3.5" />
              Popular guides
            </div>
            <h2 className={`mt-1 font-heading font-bold ${TYPOGRAPHY_SCALE.headline}`}>
              Read before you file
            </h2>
            <p className={`mt-1 max-w-xl text-muted-foreground ${TYPOGRAPHY_SCALE.caption}`}>
              Plain-English explainers on filing without a CA, regimes, AIS gaps, and Sahaj for
              salaried Indians.
            </p>
          </div>
          <Link
            href="/learn"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
          >
            All guides
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
          {guides.map((article) => (
            <li key={article.slug}>
              <Link href={`/learn/${article.slug}`}>
                <Card
                  size="sm"
                  className="h-full min-h-0 transition-shadow hover:shadow-md [&_[data-slot=card-header]]:gap-0.5 [&_[data-slot=card-header]]:py-0"
                >
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm leading-snug">{article.title}</CardTitle>
                    <p className="line-clamp-1 text-xs leading-snug text-muted-foreground">
                      {article.description}
                    </p>
                    <p className="text-tier-feature">{article.readMinutes} min read</p>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-col items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:justify-between sm:py-3.5 md:text-left">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium">Ready to import your documents?</p>
            <p className={`mt-0.5 text-muted-foreground ${TYPOGRAPHY_SCALE.caption}`}>
              Upload Form 16 and AIS — get a free estimate before you file on incometax.gov.in.
            </p>
          </div>
          <Link
            href="/file/import/documents?source=form16"
            className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
          >
            Import Form 16 — free estimate
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
