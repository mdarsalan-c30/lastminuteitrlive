import Link from "next/link";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { Form16QuickCard } from "@/components/marketing/Form16QuickCard";
import { ItrMistakesSection } from "@/components/marketing/ItrMistakesSection";
import { ItrReadinessChecklist } from "@/components/marketing/ItrReadinessChecklist";
import { ItrTypeQuiz } from "@/components/marketing/ItrTypeQuiz";
import { LastMinuteBanner } from "@/components/marketing/LastMinuteBanner";
import { NeedCaSection } from "@/components/marketing/NeedCaSection";
import { PostPaymentExplainer } from "@/components/marketing/PostPaymentExplainer";
import { PortalFilingExplainer } from "@/components/marketing/PortalFilingExplainer";
import { LAST_MINUTE_CHECKLIST } from "@/lib/content/hooks";
import { CONTENT_MAX, TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

/** Composite: urgency banner, Form 16 fork, mistakes, CA scope, readiness + quiz. */
export function FilingPrepHooksSection() {
  return (
    <section
      id="filing-prep"
      className="section-compact border-b border-border/40 bg-muted/15 px-4 sm:px-6 lg:px-8"
    >
      <div className={cn("mx-auto w-full min-w-0", CONTENT_MAX)}>
        <LastMinuteBanner className="mb-6" />

        <div className="grid gap-6 lg:grid-cols-2">
          <ScrollReveal>
            <Form16QuickCard />
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <ItrReadinessChecklist />
          </ScrollReveal>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <ScrollReveal delay={1}>
            <ItrMistakesSection />
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <NeedCaSection />
          </ScrollReveal>
        </div>

        <div className="mt-8">
          <ScrollReveal delay={2}>
            <ItrTypeQuiz />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Composite: last-minute checklist CTA. (Persona scenario cards now live in the
 * accessible PersonaCarousel inside IndianUseCases to avoid duplicate guides.)
 */
export function ScenarioHooksSection() {
  return (
    <section className="section-compact border-b border-border/40 px-4 sm:px-6 lg:px-8">
      <div className={cn("mx-auto w-full min-w-0", CONTENT_MAX)}>
        <ScrollReveal>
          <div className="rounded-2xl border border-border/60 bg-white/80 p-5 sm:p-6">
            <p className={cn("font-semibold uppercase tracking-[0.14em] text-primary", TYPOGRAPHY_SCALE.caption)}>
              {LAST_MINUTE_CHECKLIST.eyebrow}
            </p>
            <h3 className={cn("mt-2 font-semibold text-foreground", TYPOGRAPHY_SCALE.headline)}>
              {LAST_MINUTE_CHECKLIST.headline}
            </h3>
            <p className={cn("mt-2 text-muted-foreground", TYPOGRAPHY_SCALE.body)}>
              {LAST_MINUTE_CHECKLIST.subhead}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {LAST_MINUTE_CHECKLIST.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={LAST_MINUTE_CHECKLIST.cta.href}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {LAST_MINUTE_CHECKLIST.cta.label}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/** Composite: post-payment + portal filing explainers. */
export function FilingJourneySection() {
  return (
    <section className="section-compact border-b border-border/40 bg-primary/5 px-4 sm:px-6 lg:px-8">
      <div className={cn("mx-auto w-full min-w-0", CONTENT_MAX)}>
        <ScrollReveal className="text-center">
          <p className={cn("font-semibold uppercase tracking-[0.14em] text-primary", TYPOGRAPHY_SCALE.caption)}>
            End to end
          </p>
          <h2 className={cn("mt-2 font-semibold text-foreground", TYPOGRAPHY_SCALE.headline)}>
            From payment to portal submit
          </h2>
          <p className={cn("mx-auto mt-2 max-w-2xl text-muted-foreground", TYPOGRAPHY_SCALE.body)}>
            You always file on incometax.gov.in — we unlock the companion guide and prepare copy-ready values.
          </p>
        </ScrollReveal>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <ScrollReveal delay={1}>
            <PostPaymentExplainer />
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <PortalFilingExplainer />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
