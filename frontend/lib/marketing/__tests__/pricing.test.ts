import { describe, expect, it } from "vitest";
import {
  getDisplayPricing,
  getEffectivePrice,
  isLaunchOfferActive,
} from "../pricing";
import { LAUNCH_OFFER } from "../offer";

describe("launch offer pricing", () => {
  const beforeExpiry = new Date("2026-06-01T12:00:00+05:30");
  const afterExpiry = new Date("2026-08-01T12:00:00+05:30");

  it("is active before launchOfferEndsAt", () => {
    expect(isLaunchOfferActive(beforeExpiry)).toBe(true);
  });

  it("is inactive after launchOfferEndsAt", () => {
    expect(isLaunchOfferActive(afterExpiry)).toBe(false);
  });

  it("charges launch price for ai_smart during offer", () => {
    expect(getEffectivePrice("ai_smart", beforeExpiry)).toBe(349);
  });

  it("shows original price for ai_smart after expiry", () => {
    expect(getEffectivePrice("ai_smart", afterExpiry)).toBe(799);
  });

  it("does not discount diy or free", () => {
    expect(getEffectivePrice("diy", beforeExpiry)).toBe(499);
    expect(getEffectivePrice("free", beforeExpiry)).toBe(0);
  });

  it("returns strikethrough display during offer", () => {
    const display = getDisplayPricing("ai_smart", beforeExpiry);
    expect(display).toEqual({
      current: LAUNCH_OFFER.launchPriceInr,
      original: LAUNCH_OFFER.originalPriceInr,
      showOffer: true,
    });
  });

  it("hides offer styling after expiry", () => {
    const display = getDisplayPricing("ai_smart", afterExpiry);
    expect(display.current).toBe(799);
    expect(display.showOffer).toBe(false);
    expect(display.original).toBeUndefined();
  });
});
