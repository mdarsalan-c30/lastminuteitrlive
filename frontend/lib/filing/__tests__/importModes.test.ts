import { describe, expect, it } from "vitest";
import { getImportContinueHref } from "../importModes";

describe("importModes", () => {
  it("routes form16 fast path to GATE", () => {
    expect(
      getImportContinueHref("form16", {
        form16Connected: false,
        form16FastPath: true,
      })
    ).toBe("/file/start?source=form16&step=additional-income");
  });

  it("routes connected form16 to RECONCILE (no self-loop)", () => {
    expect(
      getImportContinueHref("form16", {
        form16Connected: true,
        form16FastPath: false,
      })
    ).toBe("/file/import/mismatch");
  });

  it("keeps unconnected form16 on the documents screen", () => {
    expect(
      getImportContinueHref("form16", {
        form16Connected: false,
        form16FastPath: false,
      })
    ).toBe("/file/import/documents");
  });

  it("routes manual estimates to regime compare", () => {
    expect(
      getImportContinueHref("manual", {
        form16Connected: false,
        form16FastPath: false,
      })
    ).toBe("/file/regime");
  });

  it("routes capital gains / F&O import to comprehensive review", () => {
    expect(
      getImportContinueHref("capital_gains", {
        form16Connected: false,
        form16FastPath: false,
      })
    ).toBe("/file/comprehensive");
  });
});
