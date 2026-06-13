import { describe, expect, it } from "vitest";
import {
  buildReconciliationFlags,
  hasOpenReconciliationWarnings,
  type ReconciliationInput,
} from "@/lib/filing/reconciliation";

const base: ReconciliationInput = {
  connectedConnectors: ["form16"],
  employers: [],
  grossSalary: 1200000,
  tds: 90000,
  mismatchResolved: false,
};

function ids(input: ReconciliationInput) {
  return buildReconciliationFlags(input).map((f) => f.id);
}

describe("buildReconciliationFlags", () => {
  it("warns when AIS is not imported", () => {
    const flags = buildReconciliationFlags(base);
    const ais = flags.find((f) => f.id === "ais-missing");
    expect(ais?.severity).toBe("warning");
    expect(hasOpenReconciliationWarnings(flags)).toBe(true);
  });

  it("flags an info review when AIS is imported but not reconciled", () => {
    const flags = buildReconciliationFlags({
      ...base,
      connectedConnectors: ["form16", "ais"],
    });
    expect(ids({ ...base, connectedConnectors: ["form16", "ais"] })).toContain(
      "ais-review"
    );
    expect(hasOpenReconciliationWarnings(flags)).toBe(false);
  });

  it("reports ok when AIS is imported and reconciled", () => {
    const flags = buildReconciliationFlags({
      ...base,
      connectedConnectors: ["form16", "ais", "form26as"],
      mismatchResolved: true,
    });
    expect(flags.find((f) => f.id === "ais-ok")?.severity).toBe("ok");
    expect(flags.some((f) => f.id === "form26as-missing")).toBe(false);
  });

  it("warns on a TDS delta beyond tolerance", () => {
    const flags = buildReconciliationFlags({
      ...base,
      connectedConnectors: ["form16", "ais"],
      tds: 90000,
      aisTds: 95000,
    });
    const delta = flags.find((f) => f.id === "ais-tds-delta");
    expect(delta?.severity).toBe("warning");
    expect(delta?.detail).toContain("5,000");
  });

  it("ignores sub-tolerance TDS noise", () => {
    const flags = buildReconciliationFlags({
      ...base,
      connectedConnectors: ["form16", "ais"],
      tds: 90000,
      aisTds: 90050,
      mismatchResolved: true,
    });
    expect(flags.some((f) => f.id === "ais-tds-delta")).toBe(false);
    expect(flags.some((f) => f.id === "ais-ok")).toBe(true);
  });

  it("adds a multi-employer total flag", () => {
    const flags = buildReconciliationFlags({
      ...base,
      employers: [
        { id: "a", name: "A", grossSalary: 700000, tds: 50000 },
        { id: "b", name: "B", grossSalary: 500000, tds: 40000 },
      ],
    });
    expect(flags.find((f) => f.id === "multi-employer")?.label).toContain("2");
  });
});
