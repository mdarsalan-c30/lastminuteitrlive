export type EngineEventName =
  | "compute_failure"
  | "compute_latency"
  | "portal_guide_failure"
  | "companion_load";

export interface EngineEventPayload {
  event: EngineEventName;
  timestamp: string;
  durationMs?: number;
  form?: string;
  error?: string;
  engineUnavailable?: boolean;
  source?: "client" | "server";
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV === "development";

function logStructured(payload: EngineEventPayload): void {
  const line = JSON.stringify(payload);
  if (typeof window === "undefined") {
    console.error("[monitoring]", line);
    return;
  }
  if (isDev) {
    console.log("[monitoring]", payload);
  }
}

export function trackEngineEvent(
  event: EngineEventName,
  details: Omit<EngineEventPayload, "event" | "timestamp"> = {}
): void {
  logStructured({
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

export function trackComputeLatency(
  durationMs: number,
  details: Omit<EngineEventPayload, "event" | "timestamp" | "durationMs"> = {}
): void {
  trackEngineEvent("compute_latency", { durationMs, ...details });
}

export function trackCompanionLoad(
  details: Omit<EngineEventPayload, "event" | "timestamp"> = {}
): void {
  trackEngineEvent("companion_load", details);
}
