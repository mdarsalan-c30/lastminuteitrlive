import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { POST_PAYMENT } from "@/lib/content/hooks";
import { TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { cn } from "@/lib/utils";
import { CreditCard } from "lucide-react";

export function PostPaymentExplainer() {
  return (
    <div>
      <ScrollReveal>
        <p className={cn("font-semibold uppercase tracking-[0.14em] text-primary", TYPOGRAPHY_SCALE.caption)}>
          {POST_PAYMENT.eyebrow}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">
          {POST_PAYMENT.headline}
        </h3>
      </ScrollReveal>
      <ol className="mt-5 space-y-3">
        {POST_PAYMENT.steps.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-3 rounded-xl border border-border/60 bg-white/80 p-4"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 flex items-center gap-1.5 text-tier-legal text-muted-foreground">
        <CreditCard className="size-3.5 shrink-0" />
        Razorpay checkout · We never auto-submit to ITD
      </p>
    </div>
  );
}
