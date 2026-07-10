import { describe, expect, it } from "vitest";
import {
  getPortalWalkthrough,
  walkthroughImageUrl,
} from "@/lib/filing/portalWalkthrough";

describe("portalWalkthrough", () => {
  it("loads ITR-1 with screenshots and 9 chapters", () => {
    const wt = getPortalWalkthrough("ITR-1");
    expect(wt.schemaVersion).toContain("AY2026-27");
    expect(wt.hasScreenshots).toBe(true);
    expect(wt.chapters.length).toBe(9);
    expect(wt.chapters[0].id).toBe("before-you-start");
    expect(wt.chapters.at(-1)?.id).toBe("everify-receipt");
  });

  it("loads ITR-2/3/4 text shells without screenshots", () => {
    for (const form of ["ITR-2", "ITR-3", "ITR-4"] as const) {
      const wt = getPortalWalkthrough(form);
      expect(wt.form).toBe(form);
      expect(wt.hasScreenshots).toBe(false);
      expect(wt.chapters.length).toBeGreaterThanOrEqual(7);
    }
  });

  it("builds public image URLs for ITR-1", () => {
    expect(walkthroughImageUrl("ITR-1", "image8.jpg")).toBe(
      "/portal/itr1/image8.jpg"
    );
    expect(walkthroughImageUrl("ITR-1", undefined)).toBeUndefined();
  });
});
