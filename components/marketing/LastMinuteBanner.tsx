"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ASSESSMENT_YEAR,
  ITR_FILING_DEADLINE,
  ITR_FILING_DEADLINE_LABEL,
} from "@/lib/constants";
import { LAST_MINUTE_BANNER } from "@/lib/content/hooks";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock } from "lucide-react";

type Urgency = "before" | "today" | "after";

function getUrgency(now: Date): Urgency {
  const deadline = new Date(ITR_FILING_DEADLINE);
  const startOfDeadlineDay = new Date(deadline);
  startOfDeadlineDay.setHours(0, 0, 0, 0);

  if (now > deadline) return "after";
  if (now >= startOfDeadlineDay) return "today";
  return "before";
}

function getDaysLeft(now: Date): number {
  const deadline = new Date(ITR_FILING_DEADLINE);
  const ms = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function LastMinuteBanner({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [urgency, setUrgency] = useState<Urgency>("before");
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const now = new Date();
    setUrgency(getUrgency(now));
    setDaysLeft(getDaysLeft(now));
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const message =
    urgency === "today"
      ? LAST_MINUTE_BANNER.onDeadlineDay.replace("{deadline}", ITR_FILING_DEADLINE_LABEL)
      : urgency === "after"
        ? LAST_MINUTE_BANNER.afterDeadline.replace("{deadline}", ITR_FILING_DEADLINE_LABEL)
        : LAST_MINUTE_BANNER.beforeDeadline
            .replace("{deadline}", ITR_FILING_DEADLINE_LABEL)
            .replace("{assessmentYear}", ASSESSMENT_YEAR);

  const isUrgent = urgency === "today" || (urgency === "before" && daysLeft <= 14);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
        isUrgent
          ? "border-amber-300/80 bg-amber-50/80"
          : "border-primary/20 bg-primary/5",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        {isUrgent ? (
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
        ) : (
          <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
        )}
        <div className="min-w-0">
          {urgency === "before" && daysLeft > 0 ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              {daysLeft} day{daysLeft === 1 ? "" : "s"} to {ITR_FILING_DEADLINE_LABEL}
            </p>
          ) : null}
          <p className="text-sm text-foreground">{message}</p>
        </div>
      </div>
      <Link
        href={LAST_MINUTE_BANNER.cta.href}
        className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        {LAST_MINUTE_BANNER.cta.label}
      </Link>
    </div>
  );
}
