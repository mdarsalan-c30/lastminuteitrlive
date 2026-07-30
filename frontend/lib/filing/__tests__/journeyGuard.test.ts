import { describe, expect, it } from "vitest";
import { evaluateJourney } from "../journeyGuard";

const completeDraft = {
  name: "Test User",
  itrConfirmed: true,
  profile: { pan: "ABCDE1234F", mobile: "9876543210" },
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

  it("keeps About You complete when the optional draft name is absent", () => {
    const result = evaluateJourney({ ...completeDraft, name: "" });

    expect(result.steps.find((step) => step.id === "about")?.complete).toBe(
      true
    );
    expect(result.complete).toBe(true);
  });

  it("recognizes a completed About You form even if the legacy checkbox was not saved", () => {
    const result = evaluateJourney({ ...completeDraft, itrConfirmed: false });

    expect(result.steps.find((step) => step.id === "about")?.complete).toBe(
      true
    );
    expect(result.complete).toBe(true);
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

  it("accepts manual document entry when no tax document is available", () => {
    const result = evaluateJourney({
      ...completeDraft,
      connectedConnectors: [],
      questionAnswers: { document_form16_manual: true },
    });

    expect(result.steps.find((step) => step.id === "documents")?.complete).toBe(
      true
    );
    expect(result.complete).toBe(true);
  });
});
