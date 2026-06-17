"use client";

import type { ITRResult } from "@/lib/engine/types";
import { Button } from "@/components/filing/ui";

export interface EngineComputeFallbackProps {
  loading: boolean;
  error: string | null;
  engineUnavailable: boolean;
  lastSnapshot: ITRResult | null;
  onRetry: () => void;
  onContinueWithSnapshot?: () => void;
  className?: string;
}

export function EngineComputeFallback({
  loading,
  error,
  engineUnavailable,
  lastSnapshot,
  onRetry,
  onContinueWithSnapshot,
  className = "",
}: EngineComputeFallbackProps) {
  if (loading || !error) return null;

  const title = engineUnavailable
    ? "Tax engine temporarily unavailable"
    : "Tax calculation failed";

  const message =
    error ||
    "We could not recalculate your return. Your draft is saved — try again in a moment.";

  return (
    <div
      className={`mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 ${className}`}
      role="alert"
    >
      <p className="text-sm font-semibold text-amber-950">{title}</p>
      <p className="mt-1 text-sm text-amber-900">{message}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={onRetry}
          disabled={loading}
        >
          Retry calculation
        </Button>
        {lastSnapshot && onContinueWithSnapshot && (
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={onContinueWithSnapshot}
            disabled={loading}
          >
            Continue with last calculated figures
          </Button>
        )}
      </div>
    </div>
  );
}
