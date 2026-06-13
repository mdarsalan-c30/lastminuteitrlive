"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlainEnglishHelpProps {
  title?: string;
  summary: string;
  points: string[];
  className?: string;
  defaultOpen?: boolean;
}

export function PlainEnglishHelp({
  title = "Need this in plain English?",
  summary,
  points,
  className,
  defaultOpen = false,
}: PlainEnglishHelpProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (points.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "card-premium mb-4 border-blue-100/80 bg-blue-50/30 p-4 sm:p-5",
        className
      )}
    >
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="filing-icon-label min-w-0 items-start">
          <MessageCircleQuestion className="text-blue-700" aria-hidden />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-900 sm:text-base">
              {title}
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">
              {summary}
            </span>
          </span>
        </span>
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-slate-500" aria-hidden />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-slate-500" aria-hidden />
        )}
      </button>

      {open && (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700 sm:text-base sm:leading-7">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
