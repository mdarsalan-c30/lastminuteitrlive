import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { PROOF_DEDUCTIONS } from "@/lib/content/homepage";
import { CONTENT_MAX, TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export function ProofDeductionSection() {
  return (
    <section className="section-compact border-b border-border/40 bg-muted/20 px-4 sm:px-6 lg:px-8">
      <div className={cn("mx-auto w-full min-w-0", CONTENT_MAX)}>
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className={cn("font-semibold uppercase tracking-[0.14em] text-primary", TYPOGRAPHY_SCALE.caption)}>
            {PROOF_DEDUCTIONS.eyebrow}
          </p>
          <h2 className={cn("mt-2 font-semibold text-foreground", TYPOGRAPHY_SCALE.headline)}>
            {PROOF_DEDUCTIONS.headline}
          </h2>
          <p className={cn("mt-3 text-muted-foreground", TYPOGRAPHY_SCALE.body)}>
            {PROOF_DEDUCTIONS.body}
          </p>
        </ScrollReveal>
        <ul className="mx-auto mt-8 grid max-w-2xl gap-3">
          {PROOF_DEDUCTIONS.points.map((point, i) => (
            <ScrollReveal key={point} delay={1}>
              <li className="flex items-start gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-3 text-sm text-foreground">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                {point}
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
