import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { PORTAL_FILING } from "@/lib/content/hooks";
import { TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export function PortalFilingExplainer() {
  return (
    <div>
      <ScrollReveal>
        <p className={cn("font-semibold uppercase tracking-[0.14em] text-primary", TYPOGRAPHY_SCALE.caption)}>
          {PORTAL_FILING.eyebrow}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">
          {PORTAL_FILING.headline}
        </h3>
        <p className={cn("mt-2 text-muted-foreground", TYPOGRAPHY_SCALE.body)}>
          {PORTAL_FILING.subhead}
        </p>
      </ScrollReveal>
      <ol className="mt-5 space-y-2">
        {PORTAL_FILING.steps.map((step) => (
          <li
            key={step.step}
            className="flex items-start gap-3 rounded-xl border border-border/60 bg-white/80 px-4 py-3"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-primary">
              {step.step}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ExternalLink className="size-3.5 shrink-0 text-primary" />
        You file and e-verify at incometax.gov.in — we prepare values only.
      </p>
    </div>
  );
}
