import { describe, expect, it } from "vitest";
import { evaluateJourney } from "../journeyGuard";

const completeDraft = {
  name: "Test User",
  itrConfirmed: true,
  filingMode: "exact",
  connectedConnectors: ["form16"],
  incomeChips: ["salary"],
  income: { grossSalary: 800000 },
  houseProperty: { propertyType: "none" },
  capitalGains: null,
  calculationCompletedAt: 1,
  regime: "new",
  guidedCheckCompletedAt: 1,
  finalReviewCompletedAt: 1,
  bankValidated: true,
  eVerifyMethod: "aadhaar_otp",
  plan: "normal",
  planSelectedAt: 1,
};

describe("evaluateJourney", () => {
  it("accepts a fully completed ordered journey", () => {
    expect(evaluateJourney(completeDraft).complete).toBe(true);
  });

  it("returns the first incomplete step in order", () => {
    const result = evaluateJourney({
      ...completeDraft,
      calculationCompletedAt: null,
      guidedCheckCompletedAt: null,
    });
    expect(result.complete).toBe(false);
    expect(result.firstIncomplete?.id).toBe("calculation");
    expect(result.firstIncomplete?.href).toBe("/file/regime");
  });

  it("requires applicable capital-gains details", () => {
    const result = evaluateJourney({
      ...completeDraft,
      incomeChips: ["salary", "capital_gains"],
      capitalGains: null,
    });
    expect(result.firstIncomplete?.id).toBe("income");
    expect(result.firstIncomplete?.missing).toContain("capital gains details");
  });
});
