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

  it("blocks minors with honest reasons", () => {
    const r = evaluateScopeGate({
      incomeChips: ["salary"],
      recommendedForm: "BLOCK",
    });
    expect(r.verdict).toBe("blocked");
    expect(r.caRecommended).toBe(true);
    expect(r.reasons.some((x) => /Minor/i.test(x))).toBe(true);
  });

  it("guides crypto / foreign / nri — F&O guided, director blocked", () => {
    for (const chip of ["crypto", "foreign", "nri"]) {
      const r = evaluateScopeGate({
        incomeChips: ["salary", chip],
        recommendedForm: "ITR-2",
      });
      expect(r.verdict).toBe("supported");
      expect(r.guidance.length).toBeGreaterThan(0);
    }

    const director = evaluateScopeGate({
      incomeChips: ["salary", "director"],
      recommendedForm: "ITR-2",
    });
    expect(director.verdict).toBe("blocked");

    const fno = evaluateScopeGate({
      incomeChips: ["salary", "fno"],
      recommendedForm: "ITR-3",
    });
    expect(fno.verdict).toBe("supported");
    expect(fno.form).toBe("ITR-3");
    expect(fno.caRecommended).toBe(true);
    expect(fno.guidance.some((g) => /F&O/i.test(g))).toBe(true);
  });

  it("routes firms/LLPs to CA-assisted ITR-5 (partial support, never a dead end)", () => {
    const r = evaluateScopeGate({
      incomeChips: ["firm_llp"],
      recommendedForm: "ITR-1",
    });
    expect(r.verdict).toBe("blocked");
    expect(r.actualFormNeeded).toBe("ITR-5");
    expect(r.caRecommended).toBe(true);
    expect(r.guidance.some((g) => /partner CA/i.test(g))).toBe(true);
  });

  it("routes companies to CA-assisted ITR-6", () => {
    const r = evaluateScopeGate({
      incomeChips: ["company"],
      recommendedForm: "ITR-1",
    });
    expect(r.verdict).toBe("blocked");
    expect(r.actualFormNeeded).toBe("ITR-6");
    expect(r.caRecommended).toBe(true);
  });
});
