import { describe, expect, it } from "vitest";
import {
  buildDocumentsFastPathUrl,
  buildEligibilityForm16Url,
  buildParsingForm16Url,
  isForm16FastPath,
} from "../routes";

describe("filing routes helpers", () => {
  it("detects form16 fast path source", () => {
    const params = new URLSearchParams("source=form16");
    expect(isForm16FastPath(params)).toBe(true);
    expect(isForm16FastPath(new URLSearchParams())).toBe(false);
  });

  it("builds documents fast path URL with optional name", () => {
    expect(buildDocumentsFastPathUrl()).toBe(
      "/file/import/documents?source=form16"
    );
    expect(buildDocumentsFastPathUrl("Priya")).toBe(
      "/file/import/documents?source=form16&name=Priya"
    );
  });

  it("builds eligibility and parsing URLs for form16 path", () => {
    expect(buildEligibilityForm16Url()).toContain("source=form16");
    expect(buildEligibilityForm16Url("complete-profile")).toContain(
      "step=complete-profile"
    );
    expect(buildParsingForm16Url()).toBe("/file/import/parsing?source=form16");
  });
});
