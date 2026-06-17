import { describe, expect, it } from "vitest";
import { PERSONA_FIXTURES, getPersona } from "@/e2e/fixtures/personas";
import { draftToUserInput } from "@/lib/engine/draftToUserInput";
import { aggregateEmployers } from "@/lib/filing/employers";

describe("persona fixtures", () => {
  it("exposes a spread of 6+ personas with unique ids", () => {
    expect(PERSONA_FIXTURES.length).toBeGreaterThanOrEqual(6);
    const ids = new Set(PERSONA_FIXTURES.map((p) => p.id));
    expect(ids.size).toBe(PERSONA_FIXTURES.length);
  });

  it("every fixture has non-negative salary/tds and converts to a finite engine input", () => {
    for (const p of PERSONA_FIXTURES) {
      const inc = p.draftSlice.income;
      expect(inc).toBeDefined();
      expect(inc.grossSalary).toBeGreaterThanOrEqual(0);
      expect(inc.tds).toBeGreaterThanOrEqual(0);

      const userInput = draftToUserInput(p.draftSlice);
      expect(userInput.salary).toBeDefined();
      expect(Number.isFinite(userInput.salary?.gross_salary ?? NaN)).toBe(true);
      expect(userInput.salary?.gross_salary).toBe(inc.grossSalary);
      expect(userInput.taxes_paid?.tds_salary).toBe(inc.tds);
    }
  });

  it("job-change persona aggregates two Form 16s correctly", () => {
    const priya = getPersona("job-change-multi-form16");
    expect(priya).toBeDefined();
    const employers = priya!.draftSlice.income.employers ?? [];
    expect(employers).toHaveLength(2);

    const agg = aggregateEmployers(employers);
    expect(agg.grossSalary).toBe(1_300_000);
    expect(agg.tds).toBe(97_000);
    // Primary display name is the highest-salary employer (Acme 7L > Globex 6L),
    // with a "(+N more)" suffix when multiple employers are present.
    expect(agg.primaryName).toBe("Acme Analytics Pvt Ltd (+1 more)");
    // Aggregate is mirrored into the income fields.
    expect(priya!.draftSlice.income.grossSalary).toBe(agg.grossSalary);
    expect(priya!.draftSlice.income.tds).toBe(agg.tds);
    expect(priya!.draftSlice.income.employer).toBe(agg.primaryName);
  });

  it("NRI persona maps to non-resident residential status", () => {
    const daniel = getPersona("nri-let-out-property");
    expect(daniel?.draftSlice.profile.residentialStatus).toBe("non_resident");
    const userInput = draftToUserInput(daniel!.draftSlice);
    expect(userInput.residential_status).toBe("nri");
    expect(userInput.house_property?.property_type).toBe("let_out");
  });

  it("AIS-mismatch persona records AIS-only income lines", () => {
    const rohan = getPersona("salaried-ais-mismatch");
    const aisOnly = (rohan?.documents.ais ?? []).filter((l) => !l.inForm16);
    expect(aisOnly.length).toBeGreaterThanOrEqual(2);
  });
});
