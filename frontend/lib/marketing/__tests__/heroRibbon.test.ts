import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    heroOfferRibbonConfig: { findUnique },
  },
}));

import { shouldShowHeroRibbon } from "@/lib/marketing/heroRibbon";
import { getPublishedHeroRibbon } from "@/lib/marketing/heroRibbon.server";

const enabledRibbon = {
  enabled: true as const,
  imageUrl: "/uploads/current-offer.png",
  linkUrl: null,
  altText: "Current filing offer",
  showOnMobile: false,
};

describe("independent hero offer ribbon", () => {
  beforeEach(() => findUnique.mockReset());

  it("fails closed for missing, disabled, incomplete, or unavailable config", async () => {
    findUnique.mockResolvedValueOnce(null);
    await expect(getPublishedHeroRibbon()).resolves.toBeNull();

    findUnique.mockResolvedValueOnce({ ...enabledRibbon, enabled: false });
    await expect(getPublishedHeroRibbon()).resolves.toBeNull();

    findUnique.mockResolvedValueOnce({ ...enabledRibbon, imageUrl: "" });
    await expect(getPublishedHeroRibbon()).resolves.toBeNull();

    findUnique.mockRejectedValueOnce(new Error("database unavailable"));
    await expect(getPublishedHeroRibbon()).resolves.toBeNull();
  });

  it("returns only complete enabled config", async () => {
    findUnique.mockResolvedValueOnce(enabledRibbon);
    await expect(getPublishedHeroRibbon()).resolves.toEqual(enabledRibbon);
  });

  it("renders only in enabled B2C mode", () => {
    expect(shouldShowHeroRibbon("b2c", null)).toBe(false);
    expect(shouldShowHeroRibbon("b2b", enabledRibbon)).toBe(false);
    expect(shouldShowHeroRibbon("b2c", enabledRibbon)).toBe(true);
  });
});
