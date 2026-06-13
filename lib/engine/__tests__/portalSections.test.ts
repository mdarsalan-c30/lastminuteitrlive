import { describe, expect, it } from "vitest";
import type { PortalFootprintScreen } from "../types";
import {
  buildPortalSectionRoadmap,
  firstScreenIndexForSection,
  isPortalSectionId,
  portalSectionForScreen,
  PORTAL_ITR1_SECTIONS,
} from "../portalSections";

function screen(partial: Partial<PortalFootprintScreen>): PortalFootprintScreen {
  return {
    id: partial.id ?? "s",
    title: partial.title ?? "",
    portalScreenTitle: partial.portalScreenTitle ?? "",
    portalPath: partial.portalPath ?? "",
    fields: [],
    warnings: [],
    ...partial,
  };
}

describe("portalSectionForScreen", () => {
  it("maps personal-info screens to personal", () => {
    const result = portalSectionForScreen(
      screen({ portalScreenTitle: "Personal Information", portalPath: "Profile" })
    );
    expect(result.id).toBe("personal");
  });

  it("maps salary screens to income", () => {
    const result = portalSectionForScreen(
      screen({ portalScreenTitle: "Gross Total Income", title: "Salary details" })
    );
    expect(result.id).toBe("income");
  });

  it("maps 80C/80D screens to deductions", () => {
    const result = portalSectionForScreen(
      screen({ portalScreenTitle: "Total Deductions", title: "80C and 80D" })
    );
    expect(result.id).toBe("deductions");
  });

  it("maps TDS screens to taxes-paid", () => {
    const result = portalSectionForScreen(
      screen({ portalScreenTitle: "Tax Paid", title: "TDS from salary (26AS)" })
    );
    expect(result.id).toBe("taxes-paid");
  });

  it("maps preview/verify screens to verify", () => {
    const result = portalSectionForScreen(
      screen({ portalScreenTitle: "Preview and submit", title: "Validate & confirm" })
    );
    expect(result.id).toBe("verify");
  });

  it("falls back to income when nothing matches", () => {
    const result = portalSectionForScreen(screen({ portalScreenTitle: "zzz", title: "qqq" }));
    expect(result.id).toBe("income");
  });
});

describe("buildPortalSectionRoadmap", () => {
  it("returns sections in ITD order with first-screen indexes, de-duplicated", () => {
    const screens = [
      screen({ id: "a", portalScreenTitle: "Personal Information" }),
      screen({ id: "b", portalScreenTitle: "Gross Total Income", title: "Salary" }),
      screen({ id: "c", portalScreenTitle: "Gross Total Income", title: "Other sources" }),
      screen({ id: "d", portalScreenTitle: "Total Deductions", title: "80C" }),
      screen({ id: "e", portalScreenTitle: "Preview and verify" }),
    ];
    const roadmap = buildPortalSectionRoadmap(screens);
    expect(roadmap.map((r) => r.section.id)).toEqual([
      "personal",
      "income",
      "deductions",
      "verify",
    ]);
    // income's first screen is index 1, not 2 (de-duplicated)
    expect(roadmap.find((r) => r.section.id === "income")?.firstScreenIndex).toBe(1);
  });

  it("preserves the canonical section order regardless of screen order", () => {
    const order = PORTAL_ITR1_SECTIONS.map((s) => s.id);
    expect(order.indexOf("income")).toBeLessThan(order.indexOf("deductions"));
    expect(order.indexOf("deductions")).toBeLessThan(order.indexOf("taxes-paid"));
    expect(order.indexOf("taxes-paid")).toBeLessThan(order.indexOf("tax-liability"));
  });
});

describe("firstScreenIndexForSection / isPortalSectionId", () => {
  it("finds the first screen index for a section", () => {
    const screens = [
      screen({ portalScreenTitle: "Personal Information" }),
      screen({ portalScreenTitle: "Total Deductions", title: "80D" }),
    ];
    expect(firstScreenIndexForSection(screens, "deductions")).toBe(1);
    expect(firstScreenIndexForSection(screens, "tax-liability")).toBe(-1);
  });

  it("validates section ids", () => {
    expect(isPortalSectionId("deductions")).toBe(true);
    expect(isPortalSectionId("nope")).toBe(false);
    expect(isPortalSectionId(null)).toBe(false);
  });
});
