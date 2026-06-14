import { describe, it, expect } from "vitest";
import { computeHraExemption } from "@/lib/calculators/hra";

describe("computeHraExemption", () => {
  it("returns the least of the three limbs (metro, rent-bound)", () => {
    // basic 600000, HRA 300000, rent 240000, metro
    // limb1 = 300000
    // limb2 = 50% * 600000 = 300000
    // limb3 = 240000 - 60000 = 180000  <- binding
    const r = computeHraExemption({
      hraReceived: 300000,
      basicSalary: 600000,
      rentPaid: 240000,
      cityTier: "metro",
    });
    expect(r.exemption).toBe(180000);
    expect(r.taxable).toBe(120000);
    expect(r.bindingLimb).toBe("rent_minus_10pct");
  });

  it("uses 40% of basic for non-metro cities", () => {
    // basic 500000, HRA 250000, rent 300000, non_metro
    // limb1 = 250000
    // limb2 = 40% * 500000 = 200000  <- binding
    // limb3 = 300000 - 50000 = 250000
    const r = computeHraExemption({
      hraReceived: 250000,
      basicSalary: 500000,
      rentPaid: 300000,
      cityTier: "non_metro",
    });
    expect(r.exemption).toBe(200000);
    expect(r.taxable).toBe(50000);
    expect(r.bindingLimb).toBe("percent_of_basic");
  });

  it("is bound by actual HRA received when it is the smallest", () => {
    // basic 800000, HRA 90000, rent 360000, metro
    // limb1 = 90000  <- binding
    // limb2 = 400000
    // limb3 = 360000 - 80000 = 280000
    const r = computeHraExemption({
      hraReceived: 90000,
      basicSalary: 800000,
      rentPaid: 360000,
      cityTier: "metro",
    });
    expect(r.exemption).toBe(90000);
    expect(r.taxable).toBe(0);
    expect(r.bindingLimb).toBe("actual_hra");
  });

  it("returns zero exemption when no rent is paid", () => {
    const r = computeHraExemption({
      hraReceived: 200000,
      basicSalary: 600000,
      rentPaid: 0,
      cityTier: "metro",
    });
    expect(r.exemption).toBe(0);
    expect(r.taxable).toBe(200000);
    expect(r.bindingLimb).toBe("none");
  });

  it("returns zero exemption when no HRA is received", () => {
    const r = computeHraExemption({
      hraReceived: 0,
      basicSalary: 600000,
      rentPaid: 240000,
      cityTier: "metro",
    });
    expect(r.exemption).toBe(0);
    expect(r.taxable).toBe(0);
    expect(r.bindingLimb).toBe("none");
  });

  it("clamps the rent limb at zero when rent is below 10% of basic", () => {
    // basic 600000, rent 40000 -> rent - 60000 = -20000 -> 0
    const r = computeHraExemption({
      hraReceived: 200000,
      basicSalary: 600000,
      rentPaid: 40000,
      cityTier: "metro",
    });
    expect(r.limbs.rentMinusTenPercent).toBe(0);
    expect(r.exemption).toBe(0);
    expect(r.bindingLimb).toBe("rent_minus_10pct");
  });

  it("handles negative/garbage input defensively", () => {
    const r = computeHraExemption({
      hraReceived: -5000,
      basicSalary: -100,
      rentPaid: -200,
      cityTier: "non_metro",
    });
    expect(r.exemption).toBe(0);
    expect(r.taxable).toBe(0);
  });

  it("rounds to two decimals", () => {
    // basic 333333, metro 50% = 166666.5
    const r = computeHraExemption({
      hraReceived: 500000,
      basicSalary: 333333,
      rentPaid: 500000,
      cityTier: "metro",
    });
    expect(r.limbs.percentOfBasic).toBe(166666.5);
    expect(r.exemption).toBe(166666.5);
  });
});
