import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface BlogCTAProps {
  className?: string;
}

/** In-article conversion card — links to filing flow with launch-offer copy. */
export function BlogCTA({ className }: BlogCTAProps) {
  return (
    <aside
      className={cn(
        "rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        LastMinute ITR
      </p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">
        Check your ITR before you file on incometax.gov.in
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Upload Form 16 and AIS, compare old vs new regime on your numbers, and catch mismatches
        early. Plans from ₹349 — you still submit and e-verify on the government portal
        yourself.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link href="/file" className={cn(buttonVariants(), "gap-1.5")}>
          Check your ITR with LastMinute
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/file/import/documents?source=form16"
          className={cn(buttonVariants({ variant: "outline" }), "text-sm")}
        >
          Import Form 16 — free estimate
        </Link>
      </div>
    </aside>
  );
}
