import { describe, expect, it } from "vitest";
import {
  filingStateFromPath,
  ROUTE_REDIRECTS,
  STATE_ROUTES,
} from "../stateMachine";

describe("stateMachine (doc 21 / 40)", () => {
  it("maps canonical paths to states", () => {
    expect(filingStateFromPath("/file/start")).toBe("GATE");
    expect(filingStateFromPath("/file/not-yet")).toBe("BLOCKED");
    expect(filingStateFromPath("/file/import/documents")).toBe("COLLECT");
    expect(filingStateFromPath("/file/import/mismatch")).toBe("RECONCILE");
    expect(filingStateFromPath("/file/review")).toBe("CONFIRM");
    expect(filingStateFromPath("/file/regime")).toBe("COMPUTE");
    expect(filingStateFromPath("/file/companion")).toBe("COMPANION");
    expect(filingStateFromPath("/file/done")).toBe("FILED");
  });

  it("has redirects for the kill list", () => {
    const froms = ROUTE_REDIRECTS.map((r) => r.from);
    expect(froms).toContain("/file/import/parsing");
    expect(froms).toContain("/file/import/bank");
    expect(froms).toContain("/file/advisor");
    expect(froms).toContain("/file/deductions");
    expect(froms).toContain("/file/onboarding/case-matrix");
  });

  it("STATE_ROUTES cover every state", () => {
    expect(STATE_ROUTES.GATE).toBe("/file/start");
    expect(STATE_ROUTES.BLOCKED).toBe("/file/not-yet");
    expect(STATE_ROUTES.FILED).toBe("/file/done");
  });
});
