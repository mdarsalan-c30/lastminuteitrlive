import { describe, expect, it } from "vitest";
import {
  AI_ASSISTED_POSITIONING,
  AI_ASSISTED_TAGLINE,
  CA_REVIEW_COMING_SOON,
  COMPLEX_CASE_ESCALATION_BODY,
  COMPLEX_CASE_ESCALATION_TITLE,
  COMPLEX_CASE_FLAG,
  ESCALATION_CTA_PRIMARY,
  ESCALATION_CTA_SECONDARY,
  NO_CA_REPLACEMENT,
  SELF_FILE_ELIGIBLE,
  WHY_WE_ASK,
} from "../trust";

describe("copy/trust constants", () => {
  it("positions AI-assisted filing without government affiliation", () => {
    expect(AI_ASSISTED_POSITIONING).toContain("incometax.gov.in");
    expect(AI_ASSISTED_TAGLINE).toContain("government portal");
    expect(NO_CA_REPLACEMENT).toContain("professional advice");
  });

  it("defines complex-case escalation copy", () => {
    expect(COMPLEX_CASE_ESCALATION_TITLE).toContain("tax professional");
    expect(COMPLEX_CASE_ESCALATION_BODY).toContain("₹50L");
    expect(COMPLEX_CASE_FLAG).toContain("Complex case");
    expect(SELF_FILE_ELIGIBLE).toContain("Self-file eligible");
  });

  it("exposes escalation CTAs and CA review placeholder", () => {
    expect(ESCALATION_CTA_PRIMARY).toBe("Explore CA Review");
    expect(ESCALATION_CTA_SECONDARY).toContain("self-file");
    expect(CA_REVIEW_COMING_SOON).toContain("launching soon");
  });

  it("provides why-we-ask hints for key screens", () => {
    expect(WHY_WE_ASK.profileIncome).toContain("ITR form");
    expect(WHY_WE_ASK.salaryConfirm).toContain("Form 16");
    expect(WHY_WE_ASK.deductions).toContain("old regime");
    expect(WHY_WE_ASK.regime).toContain("old or new regime");
    expect(WHY_WE_ASK.import).toContain("verify");
    expect(Object.keys(WHY_WE_ASK)).toHaveLength(5);
  });
});
