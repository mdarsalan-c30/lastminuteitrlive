import { describe, expect, it } from "vitest";
import { aggregateEmployers, type EmployerForm16 } from "../employers";

function emp(
  name: string,
  grossSalary: number,
  tds: number,
  id = name
): EmployerForm16 {
  return { id, name, grossSalary, tds };
}

describe("aggregateEmployers", () => {
  it("returns zeros and empty name for no employers", () => {
    expect(aggregateEmployers([])).toEqual({
      grossSalary: 0,
      tds: 0,
      primaryName: "",
      count: 0,
    });
  });

  it("passes a single employer through unchanged", () => {
    const result = aggregateEmployers([emp("Acme Pvt Ltd", 1_200_000, 85_000)]);
    expect(result.grossSalary).toBe(1_200_000);
    expect(result.tds).toBe(85_000);
    expect(result.primaryName).toBe("Acme Pvt Ltd");
    expect(result.count).toBe(1);
  });

  it("sums salary and TDS across two employers (job change)", () => {
    // Partial-year split: employer A Apr–Sep, employer B Oct–Mar.
    const result = aggregateEmployers([
      emp("Old Corp", 700_000, 42_000),
      emp("New Corp", 800_000, 61_000),
    ]);
    expect(result.grossSalary).toBe(1_500_000);
    expect(result.tds).toBe(103_000);
    expect(result.count).toBe(2);
  });

  it("uses the highest-salary employer as the primary display name", () => {
    const result = aggregateEmployers([
      emp("Small Co", 300_000, 5_000),
      emp("Big Co", 1_400_000, 120_000),
    ]);
    expect(result.primaryName).toBe("Big Co (+1 more)");
  });

  it("rounds and floors negative inputs to zero", () => {
    const result = aggregateEmployers([
      emp("A", 500_000.6, 10_000.4),
      emp("B", -100, -50),
    ]);
    expect(result.grossSalary).toBe(500_001);
    expect(result.tds).toBe(10_000);
  });
});
