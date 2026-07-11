import { describe, expect, it } from "vitest";
import { computeHraExemption, standardDeductionCap } from "@/lib/tax/hra";
import { summarizeVdaTrades } from "@/lib/tax/vda";
import { is80DCashPaymentBlocked } from "@/lib/tax/section80d";
import { residentialStatusFromDaysInIndia } from "@/lib/tax/foreign";
import { evaluateScopeGate } from "@/lib/filing/scopeGate";
import { requiresForm10IeaAttestation } from "@/lib/copy/regime";
import { getExtractionPromptForKind } from "@/lib/ai/aiMasterPromptContext";

describe("HRA least-of-three", () => {
  it("picks the minimum of three limbs", () => {
    const r = computeHraExemption({
      hraReceived: 300_000,
      basicSalary: 600_000,
      actualRentPaid: 360_000,
      cityTier: "metro",
    });
    // limb1 3L, limb2 3L (50%), limb3 360k-60k=300k → 300k
    expect(r.exemption).toBe(300_000);
  });

  it("caps standard deduction once for multi Form 16", () => {
    expect(standardDeductionCap("new", 2_000_000)).toBe(75_000);
    expect(standardDeductionCap("old", 2_000_000)).toBe(50_000);
    expect(standardDeductionCap("new", 40_000)).toBe(40_000);
  });
});

describe("VDA no loss netting", () => {
  it("taxes winning trades at 30% and ignores losses across tokens", () => {
    const summary = summarizeVdaTrades([
      {
        id: "1",
        token: "BTC",
        costOfAcquisition: 100_000,
        considerationReceived: 200_000,
      },
      {
        id: "2",
        token: "ETH",
        costOfAcquisition: 150_000,
        considerationReceived: 50_000,
      },
    ]);
    expect(summary.totalTaxableGains).toBe(100_000);
    expect(summary.totalTaxAt30Pct).toBe(30_000);
    expect(summary.totalLossesBlocked).toBe(100_000);
  });
});

describe("80D cash block", () => {
  it("blocks cash payment modes", () => {
    expect(is80DCashPaymentBlocked("cash")).toBe(true);
    expect(is80DCashPaymentBlocked("upi")).toBe(false);
  });
});

describe("scopeGate guided unlocks", () => {
  it("supports crypto, nri, foreign as guided paths", () => {
    for (const chip of ["crypto", "nri", "foreign"] as const) {
      const r = evaluateScopeGate({
        incomeChips: ["salary", chip],
        recommendedForm: "ITR-2",
      });
      expect(r.verdict).toBe("supported");
      expect(r.guidance.length).toBeGreaterThan(0);
      expect(r.caRecommended).toBe(true);
    }
  });

  it("still blocks directors", () => {
    const r = evaluateScopeGate({
      incomeChips: ["salary", "director"],
      recommendedForm: "ITR-2",
    });
    expect(r.verdict).toBe("blocked");
  });
});

describe("Form 10-IEA gate", () => {
  it("requires attestation for old regime with freelance", () => {
    expect(requiresForm10IeaAttestation(["salary", "freelance"], "old")).toBe(
      true
    );
    expect(requiresForm10IeaAttestation(["salary", "freelance"], "new")).toBe(
      false
    );
  });
});

describe("foreign residential heuristic", () => {
  it("classifies NRI / RNOR / resident", () => {
    expect(residentialStatusFromDaysInIndia(200)).toBe("resident");
    // 120–181 days without the 60+365 prior-year resident test → RNOR heuristic
    expect(residentialStatusFromDaysInIndia(130, 100)).toBe("rnor");
    expect(residentialStatusFromDaysInIndia(40)).toBe("nri");
  });
});

describe("AI master prompt", () => {
  it("includes Form 16 and VDA section routing", () => {
    const form16 = getExtractionPromptForKind("form16");
    expect(form16).toMatch(/FORM 16/i);
    expect(form16).toMatch(/10\(13A\)/);
    const vda = getExtractionPromptForKind("vda");
    expect(vda).toMatch(/30%/);
    expect(vda).toMatch(/194S/);
  });
});
