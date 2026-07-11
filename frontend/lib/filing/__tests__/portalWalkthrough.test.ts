import { describe, expect, it } from "vitest";
import {
  getPortalWalkthrough,
  getChapterCaGuidance,
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

  it("loads ITR-2/3/4 screenshot walkthroughs", () => {
    const counts: Record<string, number> = {
      "ITR-2": 13,
      "ITR-3": 15,
      "ITR-4": 12,
    };
    for (const form of ["ITR-2", "ITR-3", "ITR-4"] as const) {
      const wt = getPortalWalkthrough(form);
      expect(wt.form).toBe(form);
      expect(wt.hasScreenshots).toBe(true);
      expect(wt.chapters.length).toBe(counts[form]);
      expect(wt.chapters[0].steps[0].image).toBeTruthy();
      expect(wt.chapters.at(-1)?.id).toBe("everify-receipt");
    }
  });

  it("returns CA guidance for capital gains and loss chapters", () => {
    expect(getChapterCaGuidance("schedule-112a", "ITR-2")).toContain("112A");
    expect(getChapterCaGuidance("loss-carry-forward", "ITR-3")).toContain("BFLA");
  });

  it("builds public image URLs per form", () => {
    expect(walkthroughImageUrl("ITR-1", "image8.jpg")).toBe(
      "/portal/itr1/image8.jpg"
    );
    expect(walkthroughImageUrl("ITR-2", "image8.jpg")).toBe(
      "/portal/itr2/image8.jpg"
    );
    expect(walkthroughImageUrl("ITR-1", undefined)).toBeUndefined();
  });
});
