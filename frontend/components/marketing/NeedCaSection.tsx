import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { NEED_CA } from "@/lib/content/hooks";
import { CA_REVIEW_COMING_SOON } from "@/lib/copy/trust";
import { TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { cn } from "@/lib/utils";
import { CheckCircle2, UserRound } from "lucide-react";

export function NeedCaSection() {
  return (
    <div>
      <ScrollReveal>
        <p className={cn("font-semibold uppercase tracking-[0.14em] text-primary", TYPOGRAPHY_SCALE.caption)}>
          {NEED_CA.eyebrow}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">
          {NEED_CA.headline}
        </h3>
      </ScrollReveal>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="size-4 text-emerald-600" />
            {NEED_CA.simpleCases.title}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {NEED_CA.simpleCases.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-emerald-600">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserRound className="size-4 text-amber-700" />
            {NEED_CA.complexCases.title}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {NEED_CA.complexCases.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-amber-700">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-tier-legal text-muted-foreground">
        {CA_REVIEW_COMING_SOON} {NEED_CA.footnote}
      </p>
    </div>
  );
}
