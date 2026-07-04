import { describe, expect, it } from "vitest";
import { explainTrace } from "../../explainTrace";
import { containsBlocklistedPhrase } from "../../outputValidator";
import type { TraceEntry } from "@/lib/engine/types";
import {
  ADVERSARIAL_SET,
  adversarialSetStats,
} from "../adversarialSet";
import {
  amountsFromTraceParams,
  extractInrAmounts,
  findInventedAmounts,
} from "../numericFidelity";

describe("adversarial set (doc 52)", () => {
  it("has at least 60 prompts across all categories", () => {
    const stats = adversarialSetStats();
    expect(stats.total).toBeGreaterThanOrEqual(60);
    expect(Object.keys(stats.byCategory).length).toBeGreaterThanOrEqual(6);
  });

  it("guarantee cases are labeled blocklist and mention banned claims", () => {
    const guarantee = ADVERSARIAL_SET.filter((c) => c.category === "guarantee");
    expect(guarantee.length).toBeGreaterThan(0);
    for (const c of guarantee) {
      expect(c.expected).toBe("blocklist");
      expect(
        containsBlocklistedPhrase(c.prompt) ||
          /guarante|100%|instant refund|file .{0,20}for you|approved by|fully automatic|government integrated/i.test(
            c.prompt
          )
      ).toBe(true);
    }
  });

  it("out-of-scope cases escalate to CA", () => {
    for (const c of ADVERSARIAL_SET.filter((x) => x.category === "out_of_scope")) {
      expect(c.expected).toBe("escalate_ca");
    }
  });
});

describe("numeric fidelity (doc 52)", () => {
  it("extracts INR amounts from explanation text", () => {
    expect(extractInrAmounts("Tax is ₹12,500 and rebate ₹3,000.")).toEqual([
      12_500, 3_000,
    ]);
  });

  it("flags invented amounts not present in trace params", () => {
    const traces = [
      { rule: "slab_tax.new", params: { taxable: 925_000, slab_tax: 32_500 } },
    ];
    const allowed = amountsFromTraceParams(traces);
    const text = "On ₹925,000, slabs add up to ₹32,500. Mystery fee ₹99,999.";
    expect(findInventedAmounts(text, allowed)).toEqual([99_999]);
  });

  it("explanation catalog only emits amounts from params", () => {
    const traces: TraceEntry[] = [
      {
        rule: "slab_tax.new",
        params: { taxable: 925_000, slab_tax: 32_500 },
      },
      {
        rule: "rebate_87a.applied",
        params: { total_income: 925_000, limit: 1_200_000, rebate: 32_500 },
      },
    ];
    const explanations = explainTrace(traces);
    expect(explanations.length).toBe(2);
    const allowed = amountsFromTraceParams(traces);
    const combined = explanations.map((e) => e.text).join(" ");
    expect(findInventedAmounts(combined, allowed)).toEqual([]);
  });
});

