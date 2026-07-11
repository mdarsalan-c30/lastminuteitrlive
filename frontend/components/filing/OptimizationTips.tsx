"use client";

import { useMemo } from "react";
import { Lightbulb, ShieldCheck, TrendingUp } from "lucide-react";
import type { Recommendation, TaxRegime } from "@/lib/engine/types";
import { selectOptimizationTips } from "@/lib/filing/optimizationTips";
import { formatINR } from "@/lib/format";
import { highlightCopyText } from "@/lib/copy/highlightCopy";
import { cn } from "@/lib/utils";

export interface OptimizationTipsProps {
  recommendations: Recommendation[];
  /** Net payable for the selected/recommended regime. Negative means a refund. */
  netPayable: number | null;
  recommendedRegime: TaxRegime;
  /** Max tips to show. */
  limit?: number;
  className?: string;
}

/**
 * Companion-style header: surfaces the engine's already-computed lawful
 * optimisation recommendations (estimated refund + top savings tips).
 */
export function OptimizationTips({
  recommendations,
  netPayable,
  recommendedRegime,
  limit = 3,
  className,
}: OptimizationTipsProps) {
  const tips = useMemo(
    () => selectOptimizationTips(recommendations, recommendedRegime, limit),
    [recommendations, recommendedRegime, limit]
  );

  const isRefund = netPayable !== null && netPayable < 0;
  const headlineAmount = netPayable !== null ? Math.abs(netPayable) : null;
  const potentialSaving = tips.reduce((sum, t) => sum + t.estimated_benefit, 0);

  if (headlineAmount === null && tips.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-blue-200/70 bg-blue-50/40 p-3 sm:p-4",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 shrink-0 text-blue-700" aria-hidden />
          <strong className="text-xs font-semibold text-slate-900 sm:text-sm">
            Tax summary
          </strong>
        </div>
        {headlineAmount !== null && (
          <p className="text-xs text-slate-700 sm:text-sm">
            {isRefund ? "Estimated refund" : "Estimated tax payable"}:{" "}
            <strong className="tabular-nums text-slate-900">
              {formatINR(headlineAmount)}
            </strong>
          </p>
        )}
      </div>

      {headlineAmount !== null && (
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
          Estimate from your draft — final figure depends on what ITD accepts.
        </p>
      )}

      {tips.length > 0 && (
        <>
          <div className="mt-2.5 flex items-center gap-1.5 sm:mt-3">
            <Lightbulb className="size-3.5 shrink-0 text-amber-600" aria-hidden />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
              {tips.length === 1 ? "Savings tip" : `Top ${tips.length} savings tips`}
              {potentialSaving > 0 && (
                <span className="ml-1 normal-case text-emerald-700">
                  · up to {formatINR(potentialSaving)} more
                </span>
              )}
            </p>
          </div>
          <ul className="mt-2 space-y-2">
            {tips.map((tip) => (
              <li
                key={tip.id}
                className="rounded-lg border border-slate-100 bg-white px-2.5 py-2 sm:px-3 sm:py-2.5"
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <p className="text-xs leading-relaxed text-slate-700 sm:text-sm sm:leading-snug">
                    {highlightCopyText(tip.plain_english)}
                  </p>
                  {tip.estimated_benefit > 0 && (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-700 sm:px-2 sm:text-xs">
                      ~{formatINR(tip.estimated_benefit)}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 sm:gap-2 sm:text-xs">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                    {tip.gov_section}
                  </span>
                  {tip.proof_required.length > 0 && (
                    <span className="inline-flex items-center gap-1 leading-snug">
                      <ShieldCheck className="size-3 shrink-0" aria-hidden />
                      Proof: {tip.proof_required.join(", ")}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-400 sm:text-xs">
            Legal, proof-backed suggestions only. We never guarantee a refund.
          </p>
        </>
      )}
    </div>
  );
}
