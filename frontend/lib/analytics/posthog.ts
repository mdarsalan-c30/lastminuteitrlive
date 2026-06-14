"use client";

import posthog from "posthog-js";
import type { AnalyticsEventName, AnalyticsEventProps } from "./events";
import type { AnalyticsProvider } from "./provider";

const PII_KEYS = new Set([
  "email",
  "pan",
  "phone",
  "mobile",
  "name",
  "address",
  "aadhaar",
  "aadhar",
]);

function sanitizeProps(
  props?: AnalyticsEventProps
): AnalyticsEventProps | undefined {
  if (!props) return undefined;

  const safe: AnalyticsEventProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (PII_KEYS.has(key.toLowerCase())) continue;
    safe[key] = value;
  }
  return Object.keys(safe).length > 0 ? safe : undefined;
}

let initialized = false;

function initPostHog(): boolean {
  if (initialized) return true;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return false;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });

  initialized = true;
  return true;
}

export function createPostHogProvider(): AnalyticsProvider {
  return {
    name: "posthog",
    track(name: AnalyticsEventName, props?: AnalyticsEventProps) {
      if (!initPostHog()) return;
      posthog.capture(name, sanitizeProps(props));
    },
  };
}
