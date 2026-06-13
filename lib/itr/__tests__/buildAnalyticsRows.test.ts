import { describe, expect, it } from "vitest";
import { buildAnalyticsRows, sectionSubtotals } from "@/lib/itr/buildAnalyticsRows";

describe("buildAnalyticsRows", () => {
  it("builds spreadsheet rows from draft and parse metadata", () => {
    const rows = buildAnalyticsRows({
      income: {
        grossSalary: 1_200_000,
        tds: 85_000,
        fdInterest: 18_400,
        employer: "Acme Pvt Ltd",
        advanceTax: 0,
        selfAssessmentTax: 0,
        hraReceived: 0,
        actualRentPaid: 0,
        cityTier: "metro",
      },
      deductions: {
        section80C: 150_000,
        section80D: 25_000,
        section80GG: 0,
        npsExtra: 50_000,
      },
      lastParseResult: {
        connectorId: "form16",
        mode: "extracted",
        fieldConfidence: { grossSalary: "high", tds: "high" },
        warnings: [],
        demo: false,
        parsedAt: "2026-01-01T00:00:00.000Z",
      },
      connectedConnectors: ["form16"],
    });

    expect(rows.some((r) => r.particular === "Gross salary")).toBe(true);
    expect(rows.some((r) => r.particular === "Section 80C")).toBe(true);
    const totals = sectionSubtotals(rows);
    expect(totals.Income).toBe(1_200_000 + 18_400);
    expect(totals.Deductions).toBe(150_000 + 25_000 + 50_000);
  });
});
