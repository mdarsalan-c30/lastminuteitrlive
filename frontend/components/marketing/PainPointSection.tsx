import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ImageBlock } from "@/components/marketing/ImageBlock";
import { PAIN_POINTS } from "@/lib/content/homepage";
import { CONTENT_MAX, TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export function PainPointSection() {
  return (
    <section className="section-compact border-b border-border/40 px-4 sm:px-6 lg:px-8">
      <div className={cn("mx-auto w-full min-w-0", CONTENT_MAX)}>
        <ScrollReveal className="text-center">
          <p className={cn("font-semibold uppercase tracking-[0.14em] text-primary", TYPOGRAPHY_SCALE.caption)}>
            {PAIN_POINTS.eyebrow}
          </p>
          <h2 className={cn("mt-2 font-semibold text-foreground", TYPOGRAPHY_SCALE.headline)}>
            {PAIN_POINTS.headline}
          </h2>
          <div className="mx-auto mt-6 max-w-md">
            <ImageBlock
              src="/marketing/ais-mismatch.svg"
              alt="Form 16 and AIS side by side with a warning when reported income does not match"
              width={480}
              height={280}
              className="border border-border/60 shadow-sm"
            />
          </div>
        </ScrollReveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PAIN_POINTS.items.map((item, i) => (
            <ScrollReveal key={item.title} delay={1}>
              <div className="card-premium flex gap-3 p-5">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
