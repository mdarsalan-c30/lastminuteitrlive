"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import { useDraftStore } from "@/lib/store/draft";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const SUMMARY_PATH_PREFIXES = [
  "/file/import",
  "/file/income",
  "/file/house-property",
  "/file/other",
  "/file/deductions",
  "/file/regime",
  "/file/review",
  "/file/checkout",
];

export function shouldShowSummaryRail(pathname: string): boolean {
  return SUMMARY_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}

export function FilingSummaryRail({ className }: { className?: string }) {
  const pathname = usePathname();
  const regime = useDraftStore((s) => s.regime);
  const { loading, result, confidence, isEstimated } = useDraftTaxCompute({ readOnly: true });

  if (!shouldShowSummaryRail(pathname)) {
    return null;
  }

  const selectedRegime = regime ?? result?.regime_comparison.recommended_regime ?? "new";
  const netPayable =
    result?.regime_comparison[selectedRegime].net_payable ?? null;
  const isRefund = netPayable !== null && netPayable < 0;
  const score = Math.round(confidence.completeness_score);

  return (
    <div
      className={cn(
        "border-b border-slate-200/80 bg-slate-50/90 backdrop-blur-sm",
        className
      )}
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tax summary
            {isEstimated && !loading ? " (estimate)" : ""}
          </p>
          {loading ? (
            <span className="text-sm text-slate-600">Calculating…</span>
          ) : netPayable !== null ? (
            <span
              className={cn(
                "text-lg font-bold tabular-nums",
                isRefund ? "text-emerald-700" : "text-slate-900"
              )}
            >
              {isRefund ? "Est. refund " : "Est. tax due "}
              {formatINR(Math.abs(netPayable))}
            </span>
          ) : (
            <span className="text-sm text-slate-600">
              Add income to see estimate
            </span>
          )}
          <span className="text-xs text-slate-500">
            Not guaranteed — ITD confirms final amount
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium text-slate-600">
              {confidence.filing_ready ? "Filing-ready" : "Not filing-ready"}
            </p>
            <p className="text-sm font-semibold tabular-nums text-slate-900">
              {score}% complete
            </p>
          </div>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 sm:w-32">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                confidence.filing_ready
                  ? "bg-emerald-500"
                  : score >= 70
                    ? "bg-amber-500"
                    : "bg-slate-400"
              )}
              style={{ width: `${Math.min(100, score)}%` }}
            />
          </div>
          {!confidence.filing_ready && (
            <Link
              href="/file/import/documents"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Upload docs
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
