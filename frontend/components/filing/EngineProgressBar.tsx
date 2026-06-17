"use client";

/**
 * Dev-only engine pipeline debugger. Removed from main filing screens;
 * ProductProcessFlow covers user-facing progress. Enable with
 * NEXT_PUBLIC_SHOW_ENGINE_DEBUG=1 in development.
 */
import { ENGINE_ORDER, ENGINE_STEPS } from "@/lib/filing/constants";
import type { EngineStepId } from "@/lib/filing/constants";

export function EngineProgressBar({
  activeStep,
}: {
  activeStep: EngineStepId;
}) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_SHOW_ENGINE_DEBUG !== "1"
  ) {
    return null;
  }

  const activeIdx = ENGINE_ORDER.indexOf(activeStep);

  return (
    <div
      className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4"
      aria-label="Tax analysis progress"
    >
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
        Tax analysis progress
      </h4>
      <div className="flex flex-wrap gap-2">
        {ENGINE_STEPS.map((step, i) => {
          const isActive = i === activeIdx;
          const isDone = i < activeIdx;

          return (
            <span
              key={step.id}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isActive
                  ? "bg-blue-600 text-white"
                  : isDone
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-white border border-slate-200 text-slate-500"
              }`}
            >
              {step.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
