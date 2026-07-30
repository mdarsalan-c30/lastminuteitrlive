import { describe, expect, it } from "vitest";
import { resolveRecommendedForm } from "@/lib/filing/case-matrix";

describe("resolveRecommendedForm", () => {
  it("does not keep a stale ITR-2 recommendation after complex income is removed", () => {
    const result = resolveRecommendedForm(
      { income: "3", age: "b", business: "z" },
      new Set(["salary"])
    );

    expect(result.form).toBe("ITR-1");
  });

  it("uses ITR-2 when capital gains are actually selected", () => {
    const result = resolveRecommendedForm(
      { income: "3", age: "b", business: "z" },
      new Set(["salary", "capital_gains"])
    );

    expect(result.form).toBe("ITR-2");
  });

  it("uses ITR-3 when F&O is selected", () => {
    const result = resolveRecommendedForm(
      { income: "3", age: "b", business: "w" },
      new Set(["salary", "fno"])
    );

    expect(result.form).toBe("ITR-3");
  });
});
