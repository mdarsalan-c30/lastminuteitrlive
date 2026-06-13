import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ItrTypeQuiz } from "@/components/marketing/ItrTypeQuiz";
import { TaxEstimator } from "@/components/tools/TaxEstimator";
import { HraCalculator } from "@/components/tools/HraCalculator";
import { BlogCTA } from "@/components/marketing/BlogCTA";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import {
  ASSESSMENT_YEAR,
  FINANCIAL_YEAR,
  ITR_FILING_DEADLINE_LABEL,
} from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";
import { Calendar, Scale } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Tools — tax estimator, regime compare, HRA & ITR form quiz",
  description:
    "Free tools for AY 2026-27: income tax estimator, old vs new regime compare, HRA exemption calculator, ITR form quiz and deadlines. Estimates only — file on incometax.gov.in yourself.",
  path: "/tools",
});

const DEADLINE_MILESTONES = [
  {
    date: ITR_FILING_DEADLINE_LABEL,
    label: "Original due date (non-audit individuals)",
    detail: "Verify on incometax.gov.in — extensions announced separately by CBDT.",
  },
  {
    date: "Within 30 days of submit",
    label: "E-verify deadline",
    detail: "Mandatory on the government portal after you file.",
  },
  {
    date: "Quarterly (if applicable)",
    label: "Advance tax instalments",
    detail: "Salaried TDS usually covers liability; freelancers may owe advance tax.",
  },
];

export default function ToolsPage() {
  return (
    <>
      <SiteHeader />
      <PageShell className="py-10 sm:py-12" contentClassName="max-w-4xl">
        <ScrollReveal delay={0}>
          <h1 className={`font-semibold text-foreground ${TYPOGRAPHY_SCALE.headline}`}>
            Free filing tools
          </h1>
          <p className={`mt-2 text-muted-foreground ${TYPOGRAPHY_SCALE.body}`}>
            Quick helpers for {ASSESSMENT_YEAR} ({FINANCIAL_YEAR}). Results are rule-based
            estimates — not tax advice.{" "}
            <Link href="/file/import/documents?source=form16" className="text-primary hover:underline">
              Start prep with Form 16
            </Link>
            .
          </p>
        </ScrollReveal>

        <ScrollReveal delay={1} className="mt-8">
          <div id="itr-quiz">
            <ItrTypeQuiz />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={2} className="mt-8">
          <TaxEstimator />
        </ScrollReveal>

        <ScrollReveal delay={3} className="mt-8">
          <HraCalculator />
        </ScrollReveal>

        <ScrollReveal delay={4} className="mt-10">
          <div className="card-premium p-5">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  ITR deadline calendar
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Key dates for salaried filers — confirm official notifications on ITD.
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-3">
              {DEADLINE_MILESTONES.map((m) => (
                <li
                  key={m.label}
                  className="rounded-lg border border-border/60 bg-white/80 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-foreground">{m.date}</p>
                  <p className="text-sm text-foreground">{m.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{m.detail}</p>
                </li>
              ))}
            </ul>
            <Link
              href="/itr-deadline-2026"
              className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
            >
              Full deadline guide →
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={4} className="mt-8">
          <div className="card-premium p-5">
            <div className="flex items-start gap-2">
              <Scale className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Go deeper on regime choice
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The estimator above compares old vs new on your numbers. For the rules behind it,
                  read the guide or import Form 16 for a draft comparison inside the filing flow.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href="/old-vs-new-regime"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Regime guide
                  </Link>
                  <Link
                    href="/file/regime"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Compare in filing flow →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-10">
          <BlogCTA />
        </div>
      </PageShell>
      <SiteFooter />
    </>
  );
}
