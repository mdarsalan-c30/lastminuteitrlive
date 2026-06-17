import { describe, expect, it } from "vitest";
import { LAUNCH_OFFER, getLaunchOfferEndDate } from "../offer";

describe("LAUNCH_OFFER config", () => {
  it("targets ai_smart only", () => {
    expect(LAUNCH_OFFER.planId).toBe("ai_smart");
    expect(LAUNCH_OFFER.launchPriceInr).toBe(349);
    expect(LAUNCH_OFFER.originalPriceInr).toBe(799);
  });

  it("parses launchOfferEndsAt as a valid date", () => {
    const end = getLaunchOfferEndDate();
    expect(Number.isNaN(end.getTime())).toBe(false);
  });
});
