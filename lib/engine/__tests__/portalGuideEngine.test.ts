import { describe, expect, it } from "vitest";
import type { PortalDraftSlice } from "@/lib/filing/portalSop";
import type { PortalFootprintScreen, PortalGuideResponse, PortalStep } from "../types";
import {
  applyPersonalizationToGuide,
  buildPersonalizationOverlay,
  personalizeFootprintScreens,
  shouldSkipByCondition,
} from "../portalGuideEngine";

function baseDraft(overrides: Partial<PortalDraftSlice> = {}): PortalDraftSlice {
  return {
    regime: "old",
    incomeChips: ["salary"],
    recommendedForm: "ITR-1",
    mismatchResolved: true,
    paymentVerifiedAt: Date.now(),
    income: { grossSalary: 1_200_000 },
    houseProperty: { propertyType: "none" },
    deductions: {
      section80C: 150_000,
      section80D: 25_000,
      section80GG: 0,
      npsExtra: 0,
    },
    ...overrides,
  };
}

const sampleScreens: PortalFootprintScreen[] = [
  {
    id: "salary",
    title: "Salary",
    portalScreenTitle: "Salary",
    portalPath: "Income → Salary",
    warnings: [],
    skipWhen: "no_salary_income",
    fields: [
      {
        id: "gross",
        label: "Gross salary",
        ourValueKey: "income_heads.gross_salary",
        action: "enter",
        copyValue: true,
        plainEnglishWhy: "Base salary",
      },
    ],
  },
  {
    id: "deductions",
    title: "Deductions",
    portalScreenTitle: "VI-A",
    portalPath: "Deductions",
    warnings: ["Watch regime"],
    fields: [
      {
        id: "80c",
        label: "Section 80C",
        ourValueKey: "deductions.capped_80c",
        action: "enter",
        copyValue: true,
        plainEnglishWhy: "80C cap",
        skipWhen: "old_regime_only_deduction",
      },
      {
        id: "80ccd2",
        label: "Section 80CCD(2)",
        ourValueKey: "deductions.deduction_80ccd_2",
        action: "enter",
        copyValue: true,
        plainEnglishWhy: "Employer NPS",
      },
    ],
  },
  {
    id: "capital_gains",
    title: "Capital gains",
    portalScreenTitle: "CG",
    portalPath: "CG",
    warnings: [],
    skipWhen: "no_capital_gains",
    fields: [
      {
        label: "STCG",
        ourValueKey: "income_heads.stcg_111a_net",
        action: "enter",
        copyValue: true,
        plainEnglishWhy: "STCG",
      },
    ],
  },
];

describe("buildPersonalizationOverlay", () => {
  it("detects salary, deductions, and new-regime tips", () => {
    const overlay = buildPersonalizationOverlay(baseDraft({ regime: "new" }));
    expect(overlay.hasSalary).toBe(true);
    expect(overlay.deductionsClaimed).toEqual(["80C", "80D"]);
    expect(overlay.personalizedTips.some((t) => t.includes("new tax regime"))).toBe(
      true
    );
  });

  it("flags unresolved import mismatch", () => {
    const overlay = buildPersonalizationOverlay(
      baseDraft({ mismatchResolved: false })
    );
    expect(overlay.personalizedTips.some((t) => t.includes("mismatch"))).toBe(true);
  });
});

describe("shouldSkipByCondition", () => {
  it("skips capital gains screen when chip absent", () => {
    const overlay = buildPersonalizationOverlay(baseDraft());
    expect(shouldSkipByCondition("no_capital_gains", overlay)).toBe(true);
    expect(
      shouldSkipByCondition(
        "no_capital_gains",
        buildPersonalizationOverlay(
          baseDraft({ incomeChips: ["salary", "capital_gains"] })
        )
      )
    ).toBe(false);
  });

  it("skips old-regime deductions under new regime", () => {
    const overlay = buildPersonalizationOverlay(baseDraft({ regime: "new" }));
    expect(shouldSkipByCondition("old_regime_only_deduction", overlay)).toBe(true);
  });
});

describe("personalizeFootprintScreens", () => {
  it("removes inapplicable screens and old-regime-only fields", () => {
    const overlay = buildPersonalizationOverlay(baseDraft({ regime: "new" }));
    const result = personalizeFootprintScreens(sampleScreens, overlay);

    expect(result.some((s) => s.id === "capital_gains")).toBe(false);
    expect(
      result
        .find((s) => s.id === "deductions")
        ?.fields.some((f) => f.ourValueKey === "deductions.capped_80c")
    ).toBe(false);
    expect(result.find((s) => s.id === "deductions")?.warnings.some((w) => w.includes("New regime"))).toBe(
      true
    );
  });

  it("adds validation tips for 80C when claimed in old regime", () => {
    const overlay = buildPersonalizationOverlay(baseDraft({ regime: "old" }));
    const deductions = personalizeFootprintScreens(sampleScreens, overlay).find(
      (s) => s.id === "deductions"
    );
    const field80c = deductions?.fields.find((f) => f.ourValueKey === "deductions.capped_80c");
    expect(field80c?.validationTips?.some((t) => t.includes("₹1.5L"))).toBe(true);
    expect(field80c?.emphasized).toBe(true);
  });

  it("hides salary schedule when no salary income", () => {
    const overlay = buildPersonalizationOverlay(
      baseDraft({ income: { grossSalary: 0 }, incomeChips: ["fd_interest"] })
    );
    const result = personalizeFootprintScreens(sampleScreens, overlay);
    expect(result.some((s) => s.id === "salary")).toBe(false);
  });
});

describe("applyPersonalizationToGuide", () => {
  it("merges overlay into full guide response", () => {
    const guide: PortalGuideResponse = {
      form: "ITR-1",
      steps: [
        {
          step: 1,
          portalPage: "VI-A",
          fieldLabel: "80C",
          action: "enter",
          engineField: "deductions.capped_80c",
          plainEnglish: "Enter 80C",
          proofRequired: [],
          govSection: "80C",
        } satisfies PortalStep,
      ],
      footprintScreens: sampleScreens,
      totalSteps: 1,
      completedSteps: 0,
      hasMismatches: false,
    };

    const overlay = buildPersonalizationOverlay(baseDraft({ regime: "new" }));
    const personalized = applyPersonalizationToGuide(guide, overlay);

    expect(personalized.steps[0]?.plainEnglish).toContain("New regime");
    expect(personalized.footprintScreens?.some((s) => s.id === "capital_gains")).toBe(
      false
    );
  });
});
