import Link from "next/link";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ITR_MISTAKES } from "@/lib/content/hooks";
import { CONTENT_MAX, TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { cn } from "@/lib/utils";
import { ArrowRight, XCircle } from "lucide-react";

export function ItrMistakesSection() {
  return (
    <div>
      <ScrollReveal>
        <p className={cn("font-semibold uppercase tracking-[0.14em] text-primary", TYPOGRAPHY_SCALE.caption)}>
          {ITR_MISTAKES.eyebrow}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">
          {ITR_MISTAKES.headline}
        </h3>
        <p className={cn("mt-2 text-muted-foreground", TYPOGRAPHY_SCALE.body)}>
          {ITR_MISTAKES.subhead}
        </p>
      </ScrollReveal>
      <ul className="mt-5 space-y-2">
        {ITR_MISTAKES.items.map((item) => (
          <li
            key={item.mistake}
            className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border/60 bg-white/80 px-4 py-3"
          >
            <div className="flex min-w-0 items-start gap-2">
              <XCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <span className="text-sm text-foreground">{item.mistake}</span>
            </div>
            <Link
              href={item.learnHref}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {item.learnLabel}
              <ArrowRight className="size-3" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
