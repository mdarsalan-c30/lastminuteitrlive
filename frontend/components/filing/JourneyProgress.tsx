"use client";

/**
 * Dev-only A–F journey debugger (engine labels). Not shown in the filing funnel.
 * Enable with NEXT_PUBLIC_SHOW_JOURNEY_DEBUG=1 in development.
 */
import { usePathname } from "next/navigation";
import {
  getJourneyScreenLabel,
  getJourneyStep,
  getJourneyStepIndex,
  JOURNEY_STEPS,
} from "@/lib/filing/journey";
import { cn } from "@/lib/utils";

export function JourneyProgress({ className }: { className?: string }) {
  const pathname = usePathname();

  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_SHOW_JOURNEY_DEBUG !== "1"
  ) {
    return null;
  }

  const activeStep = getJourneyStep(pathname);
  const activeIndex = getJourneyStepIndex(activeStep);
  const screenLabel = getJourneyScreenLabel(activeStep);

  return (
    <nav
      aria-label="Filing journey progress"
      className={cn("journey-progress", className)}
    >
      <div className="journey-progress-meta">
        <span className="journey-progress-screen">{screenLabel}</span>
        <span className="journey-progress-engine">
          {JOURNEY_STEPS[activeIndex]?.engine}
        </span>
      </div>
      <ol className="journey-progress-track">
        {JOURNEY_STEPS.map((step, index) => {
          const isActive = step.id === activeStep;
          const isDone = index < activeIndex;

          return (
            <li key={step.id} className="journey-progress-item">
              <span
                className={cn(
                  "journey-progress-dot",
                  isActive && "journey-progress-dot-active",
                  isDone && "journey-progress-dot-done"
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {step.id}
              </span>
              <span
                className={cn(
                  "journey-progress-label",
                  isActive && "journey-progress-label-active"
                )}
              >
                {step.label}
              </span>
              {index < JOURNEY_STEPS.length - 1 && (
                <span
                  className={cn(
                    "journey-progress-connector",
                    isDone && "journey-progress-connector-done"
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
