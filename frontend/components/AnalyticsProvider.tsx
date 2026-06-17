"use client";

import { useEffect } from "react";
import { setAnalyticsProvider } from "@/lib/analytics";
import { noopAnalyticsProvider } from "@/lib/analytics/provider";
import { createPostHogProvider } from "@/lib/analytics/posthog";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (key) {
      setAnalyticsProvider(createPostHogProvider());
    } else {
      setAnalyticsProvider(noopAnalyticsProvider);
    }
  }, []);

  return children;
}
