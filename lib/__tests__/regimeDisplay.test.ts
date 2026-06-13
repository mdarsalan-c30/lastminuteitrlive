import { describe, expect, it } from "vitest";
import {
  describeNetPayable,
  regimeSavingsHeadline,
  summarizeRegimeComparison,
  summarizeRegimeComparisonFallback,
} from "@/lib/regimeDisplay";
import type { RegimeComparisonResult } from "@/lib/engine/types";

function stubSlabResult(netPayable: number, totalTax = Math.max(0, netPayable)) {
  return {
    regime: "new" as const,
    taxable_income: 0,
    slab_tax: 0,
    special_rate_tax: 0,
    gross_tax: 0,
    rebate_87a: 0,
    tax_after_rebate: 0,
    surcharge: 0,
    surcharge_rate: 0,
    marginal_relief: 0,
    tax_plus_surcharge: 0,
    cess: 0,
    total_tax: totalTax,
    tds_and_advance_tax: totalTax - netPayable,
    net_payable: netPayable,
  };
}

describe("describeNetPayable", () => {
  it("shows refund in plain English for negative net payable", () => {
    const display = describeNetPayable(-96_000);
    expect(display.isRefund).toBe(true);
    expect(display.amount).toBe(96_000);
    expect(display.label).toBe("Refund");
    expect(display.headline).toBe("Refund ₹96,000");
  });

  it("shows tax payable for positive net payable", () => {
    const display = describeNetPayable(29_736);
    expect(display.isRefund).toBe(false);
    expect(display.amount).toBe(29_736);
    expect(display.label).toBe("Tax payable");
    expect(display.headline).toBe("₹29,736");
  });

  it("shows zero tax payable without refund wording", () => {
    const display = describeNetPayable(0);
    expect(display.isRefund).toBe(false);
    expect(display.headline).toBe("₹0");
  });
});

describe("summarizeRegimeComparison", () => {
  it("uses engine tax_saving and recommended_regime", () => {
    const rc: RegimeComparisonResult = {
      old: stubSlabResult(29_736, 125_736),
      new: stubSlabResult(-96_000, 0),
      recommended_regime: "new",
      tax_saving: 125_736,
      breakeven_deductions: 0,
      deductions_lost_in_new: 0,
      old_effective_rate: 0,
      new_effective_rate: 0,
    };

    const summary = summarizeRegimeComparison(rc);
    expect(summary.recommended).toBe("new");
    expect(summary.savings).toBe(125_736);
    expect(summary.oldNetPayable).toBe(29_736);
    expect(summary.newNetPayable).toBe(-96_000);
  });

  it("maps default draft engine output (GTI ~11.68L, ₹85k refund on new)", () => {
    const rc: RegimeComparisonResult = {
      old: stubSlabResult(20_227.2, 105_227.2),
      new: stubSlabResult(-85_000, 0),
      recommended_regime: "new",
      tax_saving: 105_227.2,
      breakeven_deductions: 668_400,
      deductions_lost_in_new: 225_000,
      old_effective_rate: 9.01,
      new_effective_rate: 0,
    };

    const summary = summarizeRegimeComparison(rc);
    const newDisplay = describeNetPayable(summary.newNetPayable);

    expect(summary.recommended).toBe("new");
    expect(summary.savings).toBe(105_227.2);
    expect(newDisplay.isRefund).toBe(true);
    expect(newDisplay.amount).toBe(85_000);
    expect(newDisplay.headline).toBe("Refund ₹85,000");
  });
});

describe("summarizeRegimeComparisonFallback", () => {
  it("picks lower net payable and absolute savings difference", () => {
    const summary = summarizeRegimeComparisonFallback(29_736, -96_000);
    expect(summary.recommended).toBe("new");
    expect(summary.savings).toBe(125_736);
  });
});

describe("regimeSavingsHeadline", () => {
  it("names the cheaper regime and formatted savings", () => {
    expect(regimeSavingsHeadline("new", 125_736)).toBe(
      "New regime saves you ₹1,25,736"
    );
  });

  it("handles tied outcomes", () => {
    expect(regimeSavingsHeadline("old", 0)).toBe(
      "Both regimes result in the same tax outcome"
    );
  });
});
