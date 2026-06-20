import { PageShell } from "@/components/layout/PageShell";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { GlossarySearch } from "@/components/marketing/GlossarySearch";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { GLOSSARY_TERMS } from "@/lib/content/glossary";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Glossary — tax terms in plain English",
  description: "Government ITR field labels explained in simple language.",
  path: "/glossary",
});

export default function GlossaryPage() {
  return (
    <>
      <SiteHeader />
      <PageShell className="section-shell" contentClassName="max-w-5xl">
        <ScrollReveal
          delay={0}
          className="rounded-2xl border border-border/70 bg-white/90 p-5 shadow-sm sm:p-7"
        >
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Filing-friendly glossary
          </span>
          <h1 className={`mt-3 font-heading font-semibold text-foreground ${TYPOGRAPHY_SCALE.display}`}>
            Glossary
          </h1>
          <p className={`mt-3 max-w-3xl text-muted-foreground ${TYPOGRAPHY_SCALE.body}`}>
            {GLOSSARY_TERMS.length} tax terms explained in plain language for Indian taxpayers.
            Tap any term for a simple breakdown and filing context.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <GlossarySearch terms={GLOSSARY_TERMS} />
        </ScrollReveal>
      </PageShell>
      <SiteFooter />
    </>
  );
}
