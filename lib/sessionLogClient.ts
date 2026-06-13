"use client";

import { getBrowserSessionId } from "@/lib/store/sessionInit";
import type { SessionLogEvent } from "@/lib/sessionLog";

export function draftSnapshotForLog(state: {
  name: string;
  profile: unknown;
  income: unknown;
  deductions: unknown;
  houseProperty: unknown;
  regime: unknown;
  recommendedForm: string;
  plan: string;
  paymentVerifiedAt: number | null;
  enginePhase: string;
}): Record<string, unknown> {
  return {
    name: state.name,
    profile: state.profile,
    income: state.income,
    deductions: state.deductions,
    houseProperty: state.houseProperty,
    regime: state.regime,
    recommendedForm: state.recommendedForm,
    plan: state.plan,
    paymentVerifiedAt: state.paymentVerifiedAt,
    enginePhase: state.enginePhase,
  };
}

export async function logSessionEvent(
  event: SessionLogEvent,
  payload: {
    draft?: Record<string, unknown>;
    computeResult?: Record<string, unknown> | null;
    meta?: Record<string, unknown>;
  } = {}
): Promise<void> {
  try {
    await fetch("/api/sessions/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getBrowserSessionId(),
        event,
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
        draft: payload.draft,
        computeResult: payload.computeResult ?? null,
        meta: payload.meta,
      }),
      keepalive: event === "page_leave",
    });
  } catch {
    // Best-effort logging — never block filing flow
  }
}
