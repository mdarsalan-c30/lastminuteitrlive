import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { AI_CA_CHECKS } from "@/lib/content/homepage";
import { CONTENT_MAX, TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export function AiCaChecksSection() {
  return (
    <section className="section-compact border-b border-border/40 px-4 sm:px-6 lg:px-8">
      <div className={cn("mx-auto w-full min-w-0", CONTENT_MAX)}>
        <ScrollReveal className="text-center">
          <p className={cn("font-semibold uppercase tracking-[0.14em] text-primary", TYPOGRAPHY_SCALE.caption)}>
            {AI_CA_CHECKS.eyebrow}
          </p>
          <h2 className={cn("mt-2 font-semibold text-foreground", TYPOGRAPHY_SCALE.headline)}>
            {AI_CA_CHECKS.headline}
          </h2>
        </ScrollReveal>
        <ul className="mx-auto mt-8 grid max-w-3xl gap-3">
          {AI_CA_CHECKS.checks.map((check, i) => (
            <ScrollReveal key={check} delay={1}>
              <li className="flex items-start gap-3 rounded-xl border border-border/60 bg-white/80 px-4 py-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <span className="text-sm text-foreground">{check}</span>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
