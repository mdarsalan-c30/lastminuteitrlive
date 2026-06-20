"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Button, Card, FilingActions } from "./ui";

export function OnboardingProgress({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  return (
    <div
      className="mb-4 sm:mb-5"
      aria-label={`Step ${current} of ${total}${label ? `: ${label}` : ""}`}
    >
      <div className="filing-step-indicator">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            data-active={i + 1 === current}
            data-done={i + 1 < current}
            className="filing-step-segment"
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-semibold">
          Step {current} of {total}
        </Badge>
        {label && (
          <span className="text-sm font-medium text-muted-foreground sm:text-base">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export function FormSection({
  step,
  totalSteps,
  title,
  description,
  requirement = "required",
  children,
  className,
}: {
  step?: number;
  totalSteps?: number;
  title: string;
  description?: string;
  requirement?: "required" | "optional";
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {step != null && totalSteps != null && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Step {step} of {totalSteps}
            </p>
          )}
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {title}
          </h2>
          {description && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">
              {description}
            </p>
          )}
        </div>
        <FieldRequirementBadge requirement={requirement} />
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

export function FieldRequirementBadge({
  requirement,
}: {
  requirement: "required" | "optional";
}) {
  return (
    <Badge
      variant={requirement === "required" ? "default" : "outline"}
      className="shrink-0"
    >
      {requirement === "required" ? "Required" : "Optional"}
    </Badge>
  );
}

export function WhyWeNeedThis({
  children,
  defaultOpen = false,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-xl border border-blue-200 bg-blue-100/80">
      <CollapsibleTrigger className="border-0 bg-transparent px-4 py-3 hover:bg-blue-100/90">
        Why we need this
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        <div className="space-y-2 text-sm leading-relaxed text-slate-700">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function OnboardingActions({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  secondaryLabel,
  onSecondary,
  hint,
}: {
  primaryLabel: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  hint?: ReactNode;
}) {
  return (
    <FilingActions
      hint={hint}
      className="border-t border-slate-200/80 pt-5"
    >
      <Button
        onClick={onPrimary}
        disabled={primaryDisabled}
        className="w-full sm:w-auto sm:min-w-[220px]"
      >
        {primaryLabel}
      </Button>
      {secondaryLabel && onSecondary && (
        <Button
          onClick={onSecondary}
          variant="ghost"
          className="w-full text-muted-foreground sm:w-auto"
        >
          {secondaryLabel}
        </Button>
      )}
    </FilingActions>
  );
}

export function FieldGroup({
  label,
  requirement,
  helper,
  children,
}: {
  label: string;
  requirement?: "required" | "optional";
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        {requirement && <FieldRequirementBadge requirement={requirement} />}
      </div>
      {children}
      {helper && (
        <p className="text-tier-feature">{helper}</p>
      )}
    </div>
  );
}
