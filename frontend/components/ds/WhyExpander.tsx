"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The "Why?" affordance (doc 41 §4, doc 50 surface #1): plain-language line
 * visible, jargon layer one tap away. Content must come from the explanation
 * catalog (lib/ai/explainTrace.ts) or the strings file — never free-form.
 */
export function WhyExpander({
  summary,
  detail,
  label = "Why?",
  className,
}: {
  /** Always-visible plain-language line. */
  summary: string;
  /** The expander body — section numbers, math, sources. */
  detail: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const detailId = useId();

  return (
    <div className={cn("text-sm", className)}>
      <p className="text-foreground">
        {summary}{" "}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={() => setOpen((v) => !v)}
          className="inline min-h-0 font-medium text-primary underline-offset-2 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-ring"
        >
          {open ? "Hide" : label}
        </button>
      </p>
      {open && (
        <p id={detailId} className="mt-1.5 rounded-lg bg-muted p-3 text-muted-foreground">
          {detail}
        </p>
      )}
    </div>
  );
}
