import { describe, expect, it } from "vitest";
import { evaluateScopeGate } from "../scopeGate";

describe("scopeGate (doc 30 Finding 5)", () => {
  it("supports simple salaried ITR-1", () => {
    const r = evaluateScopeGate({
      incomeChips: ["salary"],
      recommendedForm: "ITR-1",
    });
    expect(r.verdict).toBe("supported");
    expect(r.form).toBe("ITR-1");
  });

  it("supports capital gains ITR-2 (engine ready)", () => {
    const r = evaluateScopeGate({
      incomeChips: ["salary", "capital_gains"],
      recommendedForm: "ITR-2",
    });
    expect(r.verdict).toBe("supported");
  });

  it("supports presumptive ITR-4", () => {
    const r = evaluateScopeGate({
      incomeChips: ["freelance"],
      recommendedForm: "ITR-4",
    });
    expect(r.verdict).toBe("supported");
  });

  it("blocks NRI with honest reasons", () => {
    const r = evaluateScopeGate({
      incomeChips: ["salary", "nri"],
      recommendedForm: "BLOCK",
    });
    expect(r.verdict).toBe("blocked");
    expect(r.caRecommended).toBe(true);
    expect(r.reasons.some((x) => /NRI/i.test(x))).toBe(true);
  });

  it("blocks crypto / foreign / F&O", () => {
    for (const chip of ["crypto", "foreign", "fno", "director"]) {
      const r = evaluateScopeGate({
        incomeChips: ["salary", chip],
        recommendedForm: "ITR-2",
      });
      expect(r.verdict).toBe("blocked");
    }
  });
});
