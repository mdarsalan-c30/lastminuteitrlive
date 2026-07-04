import { describe, expect, it } from "vitest";
import {
  getJourneyStep,
  getJourneyStepIndex,
  getProductProcessLabel,
  getProductProcessStepFromPath,
  getProductProcessStepNumber,
  JOURNEY_ROUTE_MAP,
  JOURNEY_STEPS,
  PRODUCT_PROCESS_STEPS,
} from "../journey";

describe("journey step derivation", () => {
  it("maps GATE routes to step A", () => {
    expect(getJourneyStep("/file/start")).toBe("A");
    expect(getJourneyStep("/file/not-yet")).toBe("A");
    expect(getJourneyStep("/file/onboarding/eligibility")).toBe("A");
  });

  it("maps COLLECT documents to step B", () => {
    expect(getJourneyStep("/file/import/documents")).toBe("B");
  });

  it("maps RECONCILE to step C", () => {
    expect(getJourneyStep("/file/import/mismatch")).toBe("C");
  });

  it("maps COMPUTE regime to step D", () => {
    expect(getJourneyStep("/file/regime")).toBe("D");
  });

  it("maps CONFIRM / ENTITLE to step E", () => {
    expect(getJourneyStep("/file/checkout/plans")).toBe("E");
    expect(getJourneyStep("/file/checkout/payment")).toBe("E");
    expect(getJourneyStep("/file/review/presubmit")).toBe("E");
    expect(getJourneyStep("/file/review")).toBe("E");
  });

  it("maps COMPANION and FILED to step F", () => {
    expect(getJourneyStep("/file/companion")).toBe("F");
    expect(getJourneyStep("/file/done")).toBe("F");
    expect(getJourneyStep("/file/checkout/everify")).toBe("F");
    expect(getJourneyStep("/file/checkout/tracker")).toBe("F");
    expect(getJourneyStep("/file/support")).toBe("F");
  });

  it("defaults unknown paths to step A", () => {
    expect(getJourneyStep("/file/unknown")).toBe("A");
  });

  it("returns 1-based product process numbers A→1 … F→6", () => {
    expect(getProductProcessStepNumber("A")).toBe(1);
    expect(getProductProcessStepNumber("D")).toBe(4);
    expect(getProductProcessStepNumber("F")).toBe(6);
    expect(getJourneyStepIndex("C")).toBe(2);
  });

  it("exposes user-facing labels for each macro step", () => {
    expect(getProductProcessLabel("A")).toBe("Get started");
    expect(getProductProcessLabel("F")).toBe("File on portal");
    expect(PRODUCT_PROCESS_STEPS).toHaveLength(6);
    expect(JOURNEY_STEPS).toHaveLength(6);
  });

  it("keeps route map aligned with getJourneyStep", () => {
    for (const group of JOURNEY_ROUTE_MAP) {
      for (const route of group.routes) {
        expect(getJourneyStep(route)).toBe(group.step);
        expect(getProductProcessStepFromPath(route)).toBe(group.step);
      }
    }
  });
});
