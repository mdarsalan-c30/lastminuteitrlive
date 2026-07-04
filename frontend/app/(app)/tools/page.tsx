import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ItrTypeQuiz } from "@/components/marketing/ItrTypeQuiz";
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
import { Calendar, Scale, ArrowRight, Calculator, FileText } from "lucide-react";
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

const tools = [
  {
    title: "HRA Exemption Calculator",
    description: "Calculate your exact House Rent Allowance exemption based on salary, rent paid, and city tier.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" style={{ color: "#0e5f63" }}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
    link: "/tools/hra-calculator",
  },
  {
    title: "Old vs New Regime Calculator",
    description: "Compare your tax liability under both regimes to find out which one saves you more money.",
    icon: <Calculator className="size-6" style={{ color: "#0e5f63" }} />,
    link: "/tools/tax-calculator",
  },
  {
    title: "Rent Receipt Generator",
    description: "Instantly generate valid rent receipts to submit to your employer for HRA claims.",
    icon: <FileText className="size-6" style={{ color: "#0e5f63" }} />,
    link: "/tools/rent-receipt",
  },
];

export default function ToolsPage() {
  return (
    <>
      <SiteHeader />
      <PageShell className="py-10 sm:py-12" contentClassName="max-w-6xl">
        <ScrollReveal delay={0}>
          <div className="text-center mb-16">
            <h1 className={`font-semibold text-foreground ${TYPOGRAPHY_SCALE.headline}`}>
              Free filing tools
            </h1>
            <p className={`mt-4 text-muted-foreground ${TYPOGRAPHY_SCALE.body}`}>
              Quick helpers for {ASSESSMENT_YEAR} ({FINANCIAL_YEAR}). Results are rule-based
              estimates — not tax advice.{" "}
              <Link href="/file/import/documents?source=form16" className="text-primary hover:underline">
                Start prep with Form 16
              </Link>
              .
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {tools.map((tool, index) => (
              <Link key={index} href={tool.link} className="block group">
                <div 
                  className="h-full rounded-2xl p-8 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                  style={{ backgroundColor: "#bfe9e0" }}
                >
                  {/* Background decorative element */}
                  <div 
                    className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"
                    style={{ backgroundColor: "#0e5f63" }}
                  />

                  <div>
                    <div 
                      className="inline-flex items-center justify-center rounded-xl p-3 mb-6 bg-white/60 shadow-sm group-hover:bg-white transition-colors duration-300"
                    >
                      {tool.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: "#0e5f63" }}>
                      {tool.title}
                    </h3>
                    <p className="text-sm font-medium leading-relaxed opacity-80" style={{ color: "#0e5f63" }}>
                      {tool.description}
                    </p>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#0e5f63" }}>
                      Use Tool
                    </span>
                    <div 
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white group-hover:-rotate-45 transition-transform duration-300 shadow-sm"
                    >
                      <ArrowRight className="size-5" style={{ color: "#0e5f63" }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto">
          <ScrollReveal delay={2} className="mt-8">
            <div id="itr-quiz">
              <ItrTypeQuiz />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={3} className="mt-10">
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
        </div>
      </PageShell>
      <SiteFooter />
    </>
  );
}
