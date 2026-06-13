import Link from "next/link";
import { FORM16_QUICK } from "@/lib/content/hooks";
import { FileText, PenLine } from "lucide-react";

export function Form16QuickCard() {
  return (
    <div className="card-premium p-5">
      <h3 className="text-base font-semibold text-foreground">{FORM16_QUICK.headline}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{FORM16_QUICK.subhead}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link
          href={FORM16_QUICK.yes.href}
          className="group flex flex-col rounded-xl border border-primary/30 bg-primary/5 p-4 transition hover:border-primary/50 hover:bg-primary/10"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-primary">
            <FileText className="size-4" />
            {FORM16_QUICK.yes.label}
          </span>
          <span className="mt-1.5 text-xs text-muted-foreground">{FORM16_QUICK.yes.detail}</span>
        </Link>
        <Link
          href={FORM16_QUICK.no.href}
          className="group flex flex-col rounded-xl border border-border/80 bg-white p-4 transition hover:border-border hover:bg-muted/30"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <PenLine className="size-4" />
            {FORM16_QUICK.no.label}
          </span>
          <span className="mt-1.5 text-xs text-muted-foreground">{FORM16_QUICK.no.detail}</span>
        </Link>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {FORM16_QUICK.regimeHint}{" "}
        <Link
          href="/#regime-compare"
          className="font-semibold text-primary hover:underline"
        >
          Compare regimes
        </Link>
      </p>
    </div>
  );
}
