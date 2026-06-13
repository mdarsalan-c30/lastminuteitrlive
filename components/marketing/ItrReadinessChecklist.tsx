"use client";

import { useState } from "react";
import { READINESS_CHECKLIST } from "@/lib/content/hooks";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function ItrReadinessChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const doneCount = READINESS_CHECKLIST.items.filter((item) => checked[item.id]).length;
  const total = READINESS_CHECKLIST.items.length;

  return (
    <div className="card-premium p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">{READINESS_CHECKLIST.headline}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{READINESS_CHECKLIST.subhead}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {doneCount}/{total} ready
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {READINESS_CHECKLIST.items.map((item) => {
          const isChecked = Boolean(checked[item.id]);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() =>
                  setChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                }
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition",
                  isChecked
                    ? "border-emerald-300/80 bg-emerald-50/60 text-foreground"
                    : "border-border/60 bg-white text-foreground hover:bg-muted/30"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border",
                    isChecked
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-border bg-white"
                  )}
                >
                  {isChecked ? <Check className="size-3" /> : null}
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
