"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CompactGrid } from "@/components/layout/CompactGrid";
import { LandingCard } from "@/components/marketing/LandingCard";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { COMPACT_PAGE_SHELL, TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { LEARN_ARTICLES } from "@/lib/content/learn-articles";
import {
  LEARN_PILLARS,
  pillarForCluster,
  type LearnPillar,
} from "@/lib/content/learn-pillars";
import { cn } from "@/lib/utils";

export function LearnHubPage() {
  const [pillar, setPillar] = useState<LearnPillar | "all">("all");

  const filtered = useMemo(() => {
    if (pillar === "all") return LEARN_ARTICLES;
    const clusters = LEARN_PILLARS.find((p) => p.id === pillar)?.clusters ?? [];
    return LEARN_ARTICLES.filter((a) => a.cluster && clusters.includes(a.cluster));
  }, [pillar]);

  return (
    <>
      <SiteHeader />
      <PageShell className={COMPACT_PAGE_SHELL} contentClassName="max-w-4xl">
        <ScrollReveal delay={0}>
          <h1 className={`font-semibold text-foreground ${TYPOGRAPHY_SCALE.headline}`}>Learn</h1>
          <p className={`mt-1.5 text-muted-foreground ${TYPOGRAPHY_SCALE.caption}`}>
            Tax filing feels harder than it is — browse by{" "}
            <strong className="font-medium text-foreground">Prep · Reconcile · Regime · File on portal</strong>.
            Read a guide, then{" "}
            <Link href="/file/import/documents?source=form16" className="text-primary hover:underline">
              upload Form 16
            </Link>{" "}
            before you submit on incometax.gov.in.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={1} className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPillar("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              pillar === "all"
                ? "border-primary bg-blue-100 text-primary"
                : "border-border/70 text-muted-foreground hover:bg-muted/40"
            )}
          >
            All guides
          </button>
          {LEARN_PILLARS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPillar(p.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                pillar === p.id
                  ? "border-primary bg-blue-100 text-primary"
                  : "border-border/70 text-muted-foreground hover:bg-muted/40"
              )}
            >
              {p.label}
            </button>
          ))}
        </ScrollReveal>

        <CompactGrid cols={2} className="mt-4">
          {LEARN_PILLARS.map((p) => (
            <LandingCard key={p.id} className="!p-3">
              <h2 className="text-xs font-semibold text-foreground sm:text-sm">{p.label}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
            </LandingCard>
          ))}
        </CompactGrid>

        <ul className="mt-6 space-y-3">
          {filtered.map((article) => (
            <li key={article.slug} className="min-w-0">
              <ScrollReveal delay={1}>
                <Link href={`/learn/${article.slug}`} className="block">
                  <Card className="h-full w-full transition-shadow hover:shadow-md">
                    <CardHeader className="py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-primary">
                        {LEARN_PILLARS.find((p) => p.id === pillarForCluster(article.cluster))?.label ??
                          "Prep"}
                      </p>
                      <CardTitle className="text-base sm:text-lg">{article.title}</CardTitle>
                      <CardDescription>{article.description}</CardDescription>
                      <p className="text-xs text-muted-foreground">
                        {article.readMinutes} min read · {article.publishedAt}
                      </p>
                    </CardHeader>
                  </Card>
                </Link>
              </ScrollReveal>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-muted-foreground sm:text-sm">
          Need searchable help? Visit{" "}
          <Link href="/help" className="text-primary hover:underline">
            Help center
          </Link>{" "}
          or try the{" "}
          <Link href="/tools" className="text-primary hover:underline">
            ITR form quiz
          </Link>
          .
        </p>
      </PageShell>
      <SiteFooter />
    </>
  );
}
