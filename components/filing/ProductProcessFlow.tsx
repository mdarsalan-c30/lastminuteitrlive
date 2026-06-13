"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getJourneyStepIndex,
  getProductProcessLabel,
  getProductProcessRoute,
  getProductProcessStepFromPath,
  PRODUCT_PROCESS_STEPS,
} from "@/lib/filing/journey";
import type { JourneyStepId } from "@/lib/filing/journey";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type StepState = "done" | "active" | "upcoming";

function getStepState(stepIndex: number, activeIndex: number): StepState {
  if (stepIndex < activeIndex) return "done";
  if (stepIndex === activeIndex) return "active";
  return "upcoming";
}

/**
 * Guided Path bar (Salesforce-Path style). Step is derived from the current
 * route via `journey.ts`. Completed and current steps are navigable; upcoming
 * steps stay quiet. A meta line communicates distance to filing on the portal.
 */
export function ProductProcessFlow({
  className,
  scroll = false,
}: {
  className?: string;
  scroll?: boolean;
}) {
  const pathname = usePathname();
  const activeStep = getProductProcessStepFromPath(pathname);
  const activeIndex = getJourneyStepIndex(activeStep);
  const total = PRODUCT_PROCESS_STEPS.length;
  const stepsRemaining = Math.max(0, total - (activeIndex + 1));
  const onPortalStep = activeIndex >= total - 1;

  const distanceLabel = onPortalStep
    ? "You're on the final step — file and e-verify on incometax.gov.in yourself."
    : stepsRemaining === 1
      ? "1 step until you file on incometax.gov.in yourself."
      : `${stepsRemaining} steps until you file on incometax.gov.in yourself.`;

  return (
    <div className={cn("macro-process", className)}>
      <div className="macro-process-meta">
        <span className="macro-process-meta__step">
          Step {activeIndex + 1} of {total} · {getProductProcessLabel(activeStep)}
        </span>
        <span className="macro-process-meta__distance">{distanceLabel}</span>
      </div>

      <nav
        aria-label="Filing progress"
        className={cn(
          "macro-process-flow",
          scroll && "macro-process-flow--scroll"
        )}
      >
        {PRODUCT_PROCESS_STEPS.map((step, i) => {
          const state = getStepState(i, activeIndex);
          const isFirst = i === 0;
          const isLast = i === total - 1;
          const connectorDone = i <= activeIndex;
          const navigable = state === "done" || state === "active";

          const pill = (
            <span className="macro-process-pill">
              {state === "done" ? (
                <Check
                  className="macro-process-check"
                  strokeWidth={2.5}
                  aria-hidden
                />
              ) : null}
              <span className="macro-process-label">{step.label}</span>
            </span>
          );

          const stepInner = (
            <>
              {pill}
              {state === "active" && isAiAssistedStep(step.id) ? (
                <span className="macro-process-ai-hint" title="AI-assisted step">
                  <Sparkles className="size-2.5" aria-hidden />
                  <span className="sr-only">AI-assisted</span>
                </span>
              ) : null}
            </>
          );

          const stepStatusLabel =
            state === "done"
              ? "completed"
              : state === "active"
                ? "current step"
                : "upcoming";

          return (
            <div key={step.id} className="macro-process-segment">
              <div
                className={cn(
                  "macro-process-line macro-process-line--leading",
                  isFirst && "macro-process-line--hidden"
                )}
                data-complete={connectorDone || undefined}
                aria-hidden
              />
              {navigable ? (
                <Link
                  href={getProductProcessRoute(step.id)}
                  className="macro-process-step"
                  data-state={state}
                  aria-current={state === "active" ? "step" : undefined}
                  aria-label={`${step.label} — ${stepStatusLabel}`}
                >
                  {stepInner}
                </Link>
              ) : (
                <div
                  className="macro-process-step"
                  data-state={state}
                  aria-label={`${step.label} — ${stepStatusLabel}`}
                >
                  {stepInner}
                </div>
              )}
              <div
                className={cn(
                  "macro-process-line macro-process-line--trailing",
                  isLast && "macro-process-line--hidden"
                )}
                data-complete={i < activeIndex || undefined}
                aria-hidden
              />
            </div>
          );
        })}
      </nav>
    </div>
  );
}

function isAiAssistedStep(step: JourneyStepId): boolean {
  return step === "B" || step === "D" || step === "E";
}
