import { describe, expect, it, vi } from "vitest";
import {
  trackCompanionLoad,
  trackComputeLatency,
  trackEngineEvent,
} from "../events";

describe("monitoring events", () => {
  it("emits structured compute_failure payloads", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    trackEngineEvent("compute_failure", {
      source: "client",
      error: "Network error",
      engineUnavailable: true,
    });
    expect(spy).toHaveBeenCalled();
    const payload = JSON.parse(String(spy.mock.calls[0]?.[1]));
    expect(payload.event).toBe("compute_failure");
    expect(payload.source).toBe("client");
    expect(payload.engineUnavailable).toBe(true);
    expect(typeof payload.timestamp).toBe("string");
    spy.mockRestore();
  });

  it("records compute latency", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    trackComputeLatency(142, { source: "server" });
    const payload = JSON.parse(String(spy.mock.calls[0]?.[1]));
    expect(payload.event).toBe("compute_latency");
    expect(payload.durationMs).toBe(142);
    spy.mockRestore();
  });

  it("records companion load events", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    trackCompanionLoad({ form: "ITR-1", source: "client" });
    const payload = JSON.parse(String(spy.mock.calls[0]?.[1]));
    expect(payload.event).toBe("companion_load");
    expect(payload.form).toBe("ITR-1");
    spy.mockRestore();
  });
});
