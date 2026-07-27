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

  it("stays active until changed from admin pricing", () => {
    expect(isLaunchOfferActive(afterExpiry)).toBe(true);
  });

  it("charges launch price for pro during offer", () => {
    expect(getEffectivePrice("pro", beforeExpiry)).toBe(
      LAUNCH_OFFER.launchPriceInr
    );
  });

  it("uses the configured offer price for pro", () => {
    expect(getEffectivePrice("pro", afterExpiry)).toBe(349);
  });

  it("keeps starter and free at catalog prices", () => {
    expect(getEffectivePrice("normal", beforeExpiry)).toBe(349);
    expect(getEffectivePrice("diy", beforeExpiry)).toBe(349);
    expect(getEffectivePrice("free", beforeExpiry)).toBe(0);
  });

  it("returns strikethrough display during offer", () => {
    const display = getDisplayPricing("pro", beforeExpiry);
    expect(display).toEqual({
      current: LAUNCH_OFFER.launchPriceInr,
      original: LAUNCH_OFFER.originalPriceInr,
      showOffer: true,
    });
  });

  it("hides offer styling after expiry when catalog has no original", () => {
    const display = getDisplayPricing("pro", afterExpiry);
    expect(display.current).toBe(349);
    expect(display.showOffer).toBe(true);
    expect(display.original).toBe(1999);
  });
});
