"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

const MAX_MESSAGE = 280;

interface FeedbackScreenProps {
  screen?: string;
  title?: string;
  subtitle?: string;
  onSubmitted?: () => void;
  className?: string;
  /** Tighter layout for filing flow / mobile viewport */
  compact?: boolean;
}

export function FeedbackScreen({
  screen = "filing-complete",
  title = "How was your filing experience?",
  subtitle = "Your rating helps us improve. Reviews with 3+ stars may appear on our public reviews page.",
  onSubmitted,
  className,
  compact = false,
}: FeedbackScreenProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isPrivate, setIsPrivate] = useState(false);

  const displayRating = hoverRating || rating;
  const messageRequired = rating > 0 && rating < 3;
  const canSubmit =
    rating >= 1 &&
    (!messageRequired || message.trim().length > 0) &&
    status !== "loading";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          message: message.trim() || undefined,
          screen,
        }),
      });
      const data = (await res.json()) as { public?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setIsPrivate(rating < 3);
      setStatus("success");
      onSubmitted?.();
    } catch {
      setStatus("error");
    }
  }

  const shellClass = cn(
    "rounded-2xl border border-border bg-background",
    compact
      ? "px-4 py-5 sm:px-5 sm:py-6"
      : "px-4 py-6 sm:px-6 sm:py-8",
    className
  );

  if (status === "success") {
    return (
      <div
        className={cn(
          shellClass,
          "flex flex-col items-center justify-center bg-muted/20 py-10 text-center"
        )}
      >
        <p className="text-lg font-semibold text-foreground">Thank you!</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {isPrivate
            ? "Your feedback was received privately and will not appear on our public reviews page. We appreciate you helping us improve."
            : "Thanks for sharing — your review may appear on our public reviews page after moderation."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn(shellClass, "flex flex-col gap-4 sm:gap-5")}>
      <div className="text-center">
        <h2
          className={cn(
            "font-bold",
            compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
          )}
        >
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        <div
          className="mt-4 flex justify-center gap-1 sm:mt-5 sm:gap-2"
          role="group"
          aria-label="Rating"
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            const filled = value <= displayRating;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="flex size-11 items-center justify-center rounded-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
              >
                <Star
                  className={cn(
                    compact ? "size-8 sm:size-9" : "size-9",
                    filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        <label htmlFor="feedback-message" className="text-sm font-medium">
          {messageRequired ? "What went wrong? (required)" : "Short note (optional)"}
        </label>
        <textarea
          id="feedback-message"
          className={cn(
            "flex w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            compact ? "min-h-[72px] sm:min-h-[80px]" : "min-h-[80px] sm:min-h-[88px]"
          )}
          placeholder={
            messageRequired
              ? "Tell us what we can fix…"
              : "What helped most? (max 280 chars)"
          }
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
          maxLength={MAX_MESSAGE}
        />
        <p className="text-right text-xs text-muted-foreground">
          {message.length}/{MAX_MESSAGE}
        </p>
        <Button type="submit" className="min-h-11 w-full rounded-xl" disabled={!canSubmit}>
          {status === "loading" ? "Sending…" : "Submit feedback"}
        </Button>
        {status === "error" && (
          <p className="text-center text-sm text-destructive">
            Could not send. Please try again.
          </p>
        )}
      </div>
    </form>
  );
}
