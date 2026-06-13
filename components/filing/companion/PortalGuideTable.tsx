"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { PortalForm, PortalStep } from "@/lib/engine/types";
import { displayValue } from "@/lib/format";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Lock,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PortalGuideTableProps {
  form: PortalForm;
  steps: PortalStep[];
  completedSteps?: number[];
  mismatches?: string[];
  onStepToggle?: (step: number, done: boolean) => void;
  /** Unresolved mismatches block export even when paid */
  blockExport?: boolean;
  /** Razorpay-verified payment unlocks copy / print / export */
  exportUnlocked?: boolean;
}

export function PortalGuideTable({
  form,
  steps,
  completedSteps = [],
  mismatches = [],
  onStepToggle,
  blockExport = false,
  exportUnlocked = false,
}: PortalGuideTableProps) {
  const [filter, setFilter] = useState("");
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [localDone, setLocalDone] = useState<Set<number>>(new Set(completedSteps));

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return steps;
    return steps.filter(
      (s) =>
        s.portalPage.toLowerCase().includes(q) ||
        s.fieldLabel.toLowerCase().includes(q) ||
        s.action.toLowerCase().includes(q) ||
        s.plainEnglish.toLowerCase().includes(q)
    );
  }, [steps, filter]);

  const doneCount = useMemo(() => {
    return steps.filter((s) => localDone.has(s.step) || s.status === "done").length;
  }, [steps, localDone]);

  const mismatchCount = useMemo(() => {
    const stepMismatches = steps.filter(
      (s) => s.status === "mismatch" || mismatches.includes(String(s.step))
    ).length;
    return stepMismatches + (mismatches.length > 0 ? mismatches.length : 0);
  }, [steps, mismatches]);

  const paymentLocked = !exportUnlocked;
  const exportBlocked = paymentLocked || blockExport || mismatches.length > 0;
  const progressPct = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0;

  const copyValue = useCallback(
    async (step: PortalStep) => {
      if (exportBlocked) return;
      const text = step.ourValue != null ? String(step.ourValue) : step.action;
      await navigator.clipboard.writeText(text);
      setCopiedStep(step.step);
      setTimeout(() => setCopiedStep(null), 1500);
    },
    [exportBlocked]
  );

  const toggleDone = (stepNum: number) => {
    setLocalDone((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) next.delete(stepNum);
      else next.add(stepNum);
      onStepToggle?.(stepNum, next.has(stepNum));
      return next;
    });
  };

  const handlePrint = () => {
    if (exportBlocked) return;
    window.print();
  };

  return (
    <div className="portal-guide">
      <div className="mb-6 print:hidden">
        <div className="card-premium p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Portal checklist — {form}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {doneCount} of {steps.length} steps complete
                {mismatchCount > 0 && (
                  <span className="font-medium text-red-600">
                    {" "}
                    · {mismatchCount} mismatch{mismatchCount > 1 ? "es" : ""}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handlePrint}
              disabled={exportBlocked}
              title={
                paymentLocked
                  ? "Pay to unlock print and export"
                  : blockExport
                    ? "Resolve mismatches before export"
                    : "Print guide"
              }
            >
              Print / Export
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search steps…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter portal steps"
              className="w-full rounded-xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
      </div>

      {paymentLocked && (
        <div
          className="mb-4 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-900 print:hidden sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Filing guide locked</p>
              <p className="mt-0.5 text-blue-800/90">
                Preview the steps below. Pay to unlock copy, print, and PDF export for
                incometax.gov.in.
              </p>
            </div>
          </div>
          <Link
            href="/file/checkout/plans"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Pay & unlock filing guide
          </Link>
        </div>
      )}

      {!paymentLocked && blockExport && (
        <div
          className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 print:hidden"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          Export blocked — resolve mismatches before printing or exporting.
        </div>
      )}

      <div
        className={cn(
          "space-y-3 print:space-y-2",
          paymentLocked && "relative"
        )}
      >
        {paymentLocked && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-24 z-10 bg-gradient-to-b from-transparent via-white/60 to-white print:hidden"
            aria-hidden
          />
        )}

        {filtered.map((step) => {
          const isDone = localDone.has(step.step) || step.status === "done";
          const isMismatch =
            step.status === "mismatch" || mismatches.includes(String(step.step));
          const status = isMismatch ? "mismatch" : isDone ? "done" : "pending";

          return (
            <div
              key={step.step}
              data-done={isDone}
              data-mismatch={isMismatch}
              className={cn(
                "companion-step print:border print:shadow-none",
                status === "mismatch" && "border-red-200 bg-red-50/40",
                status === "done" && "border-emerald-200 bg-emerald-50/30",
                paymentLocked && "select-none"
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleDone(step.step)}
                  className="mt-0.5 shrink-0 print:hidden"
                  aria-label={`Mark step ${step.step} complete`}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-6 text-emerald-500" />
                  ) : isMismatch ? (
                    <AlertTriangle className="size-6 text-red-500" />
                  ) : (
                    <Circle className="size-6 text-slate-300" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                      Step {step.step}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {step.portalPage}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        status === "done"
                          ? "bg-emerald-100 text-emerald-700"
                          : status === "mismatch"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {status}
                    </span>
                  </div>

                  <h3 className="mt-2 font-semibold text-slate-900">{step.fieldLabel}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.plainEnglish}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div
                      className={cn(
                        "rounded-xl bg-slate-50 px-3 py-2",
                        paymentLocked && "blur-sm"
                      )}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Our value
                      </p>
                      <p className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                        {paymentLocked ? "••••••" : displayValue(step.ourValue)}
                      </p>
                    </div>
                    {step.proofRequired.length > 0 && (
                      <div className="text-xs text-slate-500">
                        Proof: {step.proofRequired.join(", ")}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-primary shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
                  onClick={() => copyValue(step)}
                  disabled={
                    exportBlocked || (step.ourValue == null && !step.action)
                  }
                  title={paymentLocked ? "Pay to unlock copy" : "Copy value"}
                >
                  {paymentLocked ? (
                    <>
                      <Lock className="size-3.5" />
                      Locked
                    </>
                  ) : copiedStep === step.step ? (
                    <>
                      <Check className="size-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @media print {
          nav,
          header,
          footer,
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
