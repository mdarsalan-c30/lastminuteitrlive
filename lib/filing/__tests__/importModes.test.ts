import { describe, expect, it } from "vitest";
import { getImportContinueHref } from "../importModes";

describe("importModes", () => {
  it("routes form16 fast path to eligibility", () => {
    expect(
      getImportContinueHref("form16", {
        form16Connected: false,
        form16FastPath: true,
      })
    ).toBe("/file/onboarding/eligibility?source=form16&step=additional-income");
  });

  it("routes standard form16 path to parsing", () => {
    expect(
      getImportContinueHref("form16", {
        form16Connected: true,
        form16FastPath: false,
      })
    ).toBe("/file/import/parsing");
  });

  it("routes manual estimates to regime compare", () => {
    expect(
      getImportContinueHref("manual", {
        form16Connected: false,
        form16FastPath: false,
      })
    ).toBe("/file/regime");
  });

  it("returns null for ITD until ERI connect ships", () => {
    expect(
      getImportContinueHref("itd", {
        form16Connected: false,
        form16FastPath: false,
      })
    ).toBeNull();
  });
});
