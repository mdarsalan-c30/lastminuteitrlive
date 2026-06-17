import { describe, expect, it } from "vitest";
import {
  buildDeductionChecklist,
  summarizeDeductionChecklist,
  type DeductionChecklistInput,
} from "@/lib/filing/deductionChecklist";

const baseInput: DeductionChecklistInput = {
  deductions: { section80C: 0, section80D: 0, section80GG: 0, npsExtra: 0 },
  houseProperty: { propertyType: "none", homeLoanInterest: 0 },
  income: { hraReceived: 0 },
  regime: "old",
};

function byId(input: DeductionChecklistInput, id: string) {
  return buildDeductionChecklist(input).find((i) => i.id === id);
}

describe("buildDeductionChecklist", () => {
  it("always lists standard deduction as claimed (auto-applied)", () => {
    const sd = byId(baseInput, "standard-deduction");
    expect(sd?.status).toBe("claimed");
    expect(sd?.amount).toBe(50000);
  });

  it("uses ₹75,000 standard deduction under the new regime", () => {
    const sd = byId({ ...baseInput, regime: "new" }, "standard-deduction");
    expect(sd?.amount).toBe(75000);
  });

  it("marks entered 80C as claimed in the old regime", () => {
    const item = byId(
      { ...baseInput, deductions: { ...baseInput.deductions, section80C: 150000 } },
      "80c"
    );
    expect(item?.status).toBe("claimed");
    expect(item?.amount).toBe(150000);
  });

  it("marks an empty allowed slot as needs-proof", () => {
    expect(byId(baseInput, "80c")?.status).toBe("needs-proof");
    expect(byId(baseInput, "80d")?.status).toBe("needs-proof");
  });

  it("marks Chapter VI-A slots not-applicable under the new regime", () => {
    const newRegime: DeductionChecklistInput = {
      ...baseInput,
      regime: "new",
      deductions: { section80C: 150000, section80D: 25000, section80GG: 0, npsExtra: 50000 },
    };
    expect(byId(newRegime, "80c")?.status).toBe("not-applicable");
    expect(byId(newRegime, "80d")?.status).toBe("not-applicable");
    expect(byId(newRegime, "80ccd1b")?.status).toBe("not-applicable");
  });

  it("marks 80GG not-applicable when HRA was received", () => {
    const item = byId(
      { ...baseInput, income: { hraReceived: 240000 } },
      "80gg"
    );
    expect(item?.status).toBe("not-applicable");
    expect(item?.note).toMatch(/HRA/i);
  });

  it("marks home loan interest not-applicable without a property", () => {
    expect(byId(baseInput, "24b")?.status).toBe("not-applicable");
  });

  it("marks home loan interest claimed for a let-out property with interest", () => {
    const item = byId(
      {
        ...baseInput,
        houseProperty: { propertyType: "let_out", homeLoanInterest: 200000 },
      },
      "24b"
    );
    expect(item?.status).toBe("claimed");
  });
});

describe("summarizeDeductionChecklist", () => {
  it("counts statuses and sums claimed amounts", () => {
    const items = buildDeductionChecklist({
      ...baseInput,
      deductions: { section80C: 150000, section80D: 25000, section80GG: 0, npsExtra: 0 },
    });
    const summary = summarizeDeductionChecklist(items);
    // standard deduction (50000) + 80C (150000) + 80D (25000) claimed
    expect(summary.claimed).toBe(3);
    expect(summary.totalClaimedAmount).toBe(225000);
    expect(summary.needsProof).toBeGreaterThan(0);
    expect(summary.notApplicable).toBeGreaterThan(0);
  });
});
