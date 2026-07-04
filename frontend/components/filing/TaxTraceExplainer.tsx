"use client";

import { WhyExpander } from "@/components/ds/WhyExpander";
import { StatusChip } from "@/components/ds/StatusChip";
import {
  explainRegimeVerdict,
  explainTrace,
} from "@/lib/ai/explainTrace";
import { ESTIMATE_CHIP } from "@/lib/copy/strings";
import type { RegimeComparisonResult, TaxRegime } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

/**
 * "How your tax adds up" — the COMPUTE-surface trace explainer (doc 40 §COMPUTE,
 * doc 50 surface #3). Every line renders deterministically from the engine
 * trace via the explanation catalog; nothing here is generated. If the engine
 * emitted no trace (older snapshot), the section simply doesn't render —
 * the honest degradation path.
 */
export function TaxTraceExplainer({
  comparison,
  selectedRegime,
  className,
}: {
  comparison: RegimeComparisonResult;
  selectedRegime: TaxRegime;
  className?: string;
}) {
  const slab = selectedRegime === "old" ? comparison.old : comparison.new;
  const lines = explainTrace(slab.trace);
  const verdict = explainRegimeVerdict(comparison);

  if (lines.length === 0) return null;

  return (
    <section
      aria-label="How your tax adds up"
      className={cn("rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm", className)}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">
          How your tax adds up
        </h3>
        <StatusChip status="estimate" label={ESTIMATE_CHIP} />
      </div>

      <div className="space-y-3">
        {verdict.expander ? (
          <WhyExpander summary={verdict.text} detail={verdict.expander} />
        ) : (
          <p className="text-sm text-foreground">{verdict.text}</p>
        )}

        <ul className="space-y-3 border-t border-slate-100 pt-3">
          {lines.map((line) => (
            <li key={line.ruleId}>
              {line.expander ? (
                <WhyExpander summary={line.text} detail={line.expander} />
              ) : (
                <p className="text-sm text-foreground">{line.text}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
