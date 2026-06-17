"use client";

import { useEffect, useState } from "react";
import { LAUNCH_OFFER, OFFER_EXPIRED_COPY } from "@/lib/marketing/offer";
import { isLaunchOfferActive, formatPlanPriceLabel } from "@/lib/marketing/pricing";
import { OFFER_COPY } from "@/lib/copy/marketing";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(end: Date, now: Date): TimeLeft | null {
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export interface CountdownOfferProps {
  className?: string;
  compact?: boolean;
}

export function CountdownOffer({ className, compact = false }: CountdownOfferProps) {
  const endDate = new Date(LAUNCH_OFFER.launchOfferEndsAt);
  const [now, setNow] = useState(() => new Date());
  const active = isLaunchOfferActive(now);
  const timeLeft = active ? getTimeLeft(endDate, now) : null;

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  if (!active) {
    if (LAUNCH_OFFER.afterExpiryBehavior === "show_original") {
      return (
        <p className={cn("text-tier-legal text-muted-foreground", className)}>
          {OFFER_EXPIRED_COPY} — AI Smart {formatPlanPriceLabel(LAUNCH_OFFER.originalPriceInr)}
        </p>
      );
    }
    return null;
  }

  if (!timeLeft) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/90 px-3 py-1.5 text-sm text-amber-950",
        className
      )}
      role="timer"
      aria-live="polite"
    >
      <span className="font-medium">{OFFER_COPY.countdownPrefix}</span>
      {compact ? (
        <span className="tabular-nums font-semibold">
          {timeLeft.days}d {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 tabular-nums font-semibold">
          <span>{timeLeft.days}d</span>
          <span>{pad(timeLeft.hours)}h</span>
          <span>{pad(timeLeft.minutes)}m</span>
          <span>{pad(timeLeft.seconds)}s</span>
        </span>
      )}
    </div>
  );
}
