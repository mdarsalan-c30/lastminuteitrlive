import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { formatINR } from "@/lib/filing/types";
import { IMPORT_REVEAL } from "@/lib/copy/filing";
import { Button, Card } from "@/components/filing/ui";

export interface ImportRevealPanelProps {
  employerName: string;
  grossSalary: number;
  tds: number;
  section80C: number;
  employerCount: number;
  aisConnected: boolean;
  /** Where "Confirm & continue" goes. Defaults to the bank/AIS merge step. */
  nextHref?: string;
}

/**
 * Post-parse summary shown after a successful Form 16 import. Restates the
 * imported figures (companion-first: we read, you confirm) and lists what a
 * Form 16 alone does not cover. No advice, no guarantees — factual labels only.
 */
export function ImportRevealPanel({
  employerName,
  grossSalary,
  tds,
  section80C,
  employerCount,
  aisConnected,
  nextHref = "/file/import/bank",
}: ImportRevealPanelProps) {
  const summaryRows: Array<{ label: string; value: string }> = [
    {
      label: employerCount > 1 ? `Employers (${employerCount})` : "Employer",
      value: employerName || "—",
    },
    { label: "Gross salary", value: formatINR(grossSalary) },
    { label: "TDS already deducted", value: formatINR(tds) },
    { label: "80C (Form 16 Part B)", value: formatINR(section80C) },
  ];

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
        {IMPORT_REVEAL.eyebrow}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">
        {IMPORT_REVEAL.headline}
      </h3>
      <p className="mt-1 text-sm text-slate-600">{IMPORT_REVEAL.subhead}</p>

      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        {summaryRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <dt className="text-sm text-slate-600">{row.label}</dt>
            <dd className="text-sm font-semibold text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        {IMPORT_REVEAL.standardDeductionNote}
      </p>

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-900">
          Still needs your input
        </p>
        <ul className="mt-2 space-y-2">
          {IMPORT_REVEAL.stillNeeded.map((item) => {
            const done = item.id === "ais" && aisConnected;
            const Icon = done ? CheckCircle2 : Circle;
            return (
              <li key={item.id} className="flex items-start gap-2">
                <Icon
                  className={`mt-0.5 size-4 shrink-0 ${
                    done ? "text-emerald-600" : "text-slate-400"
                  }`}
                  aria-hidden
                />
                <span className="text-sm">
                  <span
                    className={`font-medium ${
                      done ? "text-slate-500 line-through" : "text-slate-900"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="block text-slate-600">{item.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button href={nextHref}>{IMPORT_REVEAL.primaryCta}</Button>
        {!aisConnected && (
          <Link
            href="/file/import/documents?source=ais"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {IMPORT_REVEAL.secondaryCta}
          </Link>
        )}
      </div>
    </Card>
  );
}
