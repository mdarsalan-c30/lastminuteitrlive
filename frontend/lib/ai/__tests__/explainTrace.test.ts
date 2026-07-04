import { describe, expect, it } from "vitest";

import {
  explainRegimeVerdict,
  explainTrace,
  explainableRuleIds,
} from "../explainTrace";
import type { RegimeComparisonResult, TraceEntry } from "@/lib/engine/types";

// Trace produced by the engine for the golden A-02 case (₹11.9L taxable).
const REBATE_TRACE: TraceEntry[] = [
  { rule: "slab_tax.new", params: { taxable: 1_190_000, slab_tax: 59_000 } },
  {
    rule: "rebate_87a.applied",
    params: { total_income: 1_190_000, limit: 1_200_000, rebate: 59_000 },
  },
];

describe("explainTrace (doc 51 catalog, deterministic)", () => {
  it("renders the 87A rebate story with engine-sourced amounts only", () => {
    const out = explainTrace(REBATE_TRACE);
    expect(out).toHaveLength(2);
    expect(out[1].ruleId).toBe("rebate_87a.applied");
    expect(out[1].text).toContain("₹11,90,000");
    expect(out[1].text).toContain("₹12,00,000");
    expect(out[1].text).toContain("₹59,000");
    expect(out[1].expander).toContain("87A");
  });

  it("renders marginal relief (golden A-04)", () => {
    const out = explainTrace([
      {
        rule: "rebate_87a.marginal_relief",
        params: { limit: 1_200_000, max_tax: 10_000, tax_before: 61_500, relief: 51_500 },
      },
    ]);
    expect(out[0].text).toContain("₹10,000");
    expect(out[0].text).toContain("₹51,500");
  });

  it("refuses to render unknown rules — never guesses", () => {
    const out = explainTrace([
      { rule: "some_future_rule", params: { amount: 999 } },
    ]);
    expect(out).toHaveLength(0);
  });

  it("refuses to render with missing params — no default values", () => {
    const out = explainTrace([
      { rule: "rebate_87a.applied", params: { rebate: 59_000 } },
    ]);
    expect(out).toHaveLength(0);
  });

  it("numeric fidelity: every rupee figure in output exists in trace params", () => {
    const out = explainTrace(REBATE_TRACE);
    const allowed = new Set(
      REBATE_TRACE.flatMap((t) => Object.values(t.params).map((v) => Math.round(v)))
    );
    for (const exp of out) {
      const amounts = exp.text.match(/₹[\d,]+/g) ?? [];
      for (const raw of amounts) {
        const value = Number(raw.replace(/[₹,]/g, ""));
        expect(allowed.has(value), `${raw} in "${exp.text}" not in trace`).toBe(true);
      }
    }
  });

  it("covers every rule the engine emits on golden families A/B", () => {
    // Rules emitted by tax_slabs.py trace for families A and B.
    const emitted = [
      "slab_tax.new",
      "rebate_87a.applied",
      "rebate_87a.denied",
      "rebate_87a.marginal_relief",
      "special_rate.total",
      "cess",
    ];
    const catalog = new Set(explainableRuleIds());
    for (const rule of emitted) {
      expect(catalog.has(rule), `no template for ${rule}`).toBe(true);
    }
  });
});

describe("explainRegimeVerdict", () => {
  const base = {
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
    tds_and_advance_tax: 0,
    net_payable: 0,
  };

  it("states the winner and both totals", () => {
    const rc: RegimeComparisonResult = {
      old: { ...base, regime: "old", total_tax: 70_200 },
      new: { ...base, regime: "new", total_tax: 0 },
      recommended_regime: "new",
      tax_saving: 70_200,
      breakeven_deductions: 250_000,
      deductions_lost_in_new: 175_000,
      old_effective_rate: 7,
      new_effective_rate: 0,
    };
    const v = explainRegimeVerdict(rc);
    expect(v.text).toContain("new regime saves you ₹70,200");
    expect(v.text).toContain("₹70,200");
    expect(v.expander).toContain("₹2,50,000");
  });

  it("handles a tie without inventing a saving", () => {
    const rc: RegimeComparisonResult = {
      old: { ...base, regime: "old", total_tax: 0 },
      new: { ...base, regime: "new", total_tax: 0 },
      recommended_regime: "new",
      tax_saving: 0,
      breakeven_deductions: 0,
      deductions_lost_in_new: 0,
      old_effective_rate: 0,
      new_effective_rate: 0,
    };
    expect(explainRegimeVerdict(rc).text).toContain("same tax");
  });
});
