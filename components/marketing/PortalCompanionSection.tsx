import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ImageBlock } from "@/components/marketing/ImageBlock";
import { PORTAL_COMPANION } from "@/lib/content/homepage";
import { CONTENT_MAX, TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export function PortalCompanionSection() {
  return (
    <section className="section-compact border-b border-border/40 bg-primary/5 px-4 sm:px-6 lg:px-8">
      <div className={cn("mx-auto w-full min-w-0", CONTENT_MAX)}>
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <ScrollReveal>
            <p className={cn("font-semibold uppercase tracking-[0.14em] text-primary", TYPOGRAPHY_SCALE.caption)}>
              {PORTAL_COMPANION.eyebrow}
            </p>
            <h2 className={cn("mt-2 font-semibold text-foreground", TYPOGRAPHY_SCALE.headline)}>
              {PORTAL_COMPANION.headline}
            </h2>
            <p className={cn("mt-3 text-muted-foreground", TYPOGRAPHY_SCALE.body)}>
              {PORTAL_COMPANION.body}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <ImageBlock
              src="/marketing/portal-guide.svg"
              alt="Illustration of copying field values to incometax.gov.in and e-verifying your return"
              width={480}
              height={320}
              className="mb-4 border border-border/60 shadow-sm"
            />
            <ul className="space-y-3">
              {PORTAL_COMPANION.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-2 rounded-xl border border-border/60 bg-white p-4 text-sm text-foreground"
                >
                  <ExternalLink className="mt-0.5 size-4 shrink-0 text-primary" />
                  {bullet}
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
