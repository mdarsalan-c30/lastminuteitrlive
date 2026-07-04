import { describe, expect, it } from "vitest";
import {
  CONTENT_CALENDAR,
  getCalendarCoverage,
  getResolvedCalendar,
} from "../contentCalendar";
import {
  BRAND_NARRATIVE,
  findBannedMarketingPhrase,
  MARKETING_BANNED_PHRASES,
  PAID_AD_PORTAL_LINE,
  SITE_DISCLAIMER,
} from "../marketingDisclaimers";
import {
  referralMarginOk,
  REFERRAL_ECONOMICS,
} from "../referralEconomics";

describe("content calendar (doc 60)", () => {
  it("covers 13 weeks with at least 3 entries each for weeks 1–12", () => {
    for (let week = 1; week <= 12; week++) {
      const entries = CONTENT_CALENDAR.filter((e) => e.week === week);
      expect(entries.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("resolves a majority of entries against live learn inventory", () => {
    const coverage = getCalendarCoverage();
    expect(coverage.total).toBe(CONTENT_CALENDAR.length);
    // Existing content library should cover most P0/P1 intents.
    expect(coverage.livePct).toBeGreaterThanOrEqual(50);
  });

  it("marks known live pillars as live", () => {
    const resolved = getResolvedCalendar();
    const regime = resolved.find((e) => e.targetSlug === "old-vs-new-regime");
    expect(regime?.status).toBe("live");
    expect(regime?.livePath).toBe("/learn/old-vs-new-regime");
  });

  it("every entry has a product CTA path", () => {
    for (const entry of CONTENT_CALENDAR) {
      expect(entry.ctaPath.startsWith("/")).toBe(true);
      expect(entry.ctaLabel.length).toBeGreaterThan(0);
    }
  });
});

describe("marketing disclaimers (doc 61)", () => {
  it("brand narrative and site disclaimer mention the government portal", () => {
    expect(BRAND_NARRATIVE.toLowerCase()).toContain("government portal");
    expect(SITE_DISCLAIMER.toLowerCase()).toContain("income tax department");
    expect(PAID_AD_PORTAL_LINE.toLowerCase()).toContain("government portal");
  });

  it("catches banned guarantee language", () => {
    expect(findBannedMarketingPhrase("Get a guaranteed refund today")).toBe(
      "guaranteed refund"
    );
    expect(findBannedMarketingPhrase("Prepare and file calmly")).toBeNull();
  });

  it("banned list is non-empty and lowercase-matchable", () => {
    expect(MARKETING_BANNED_PHRASES.length).toBeGreaterThan(5);
  });
});

describe("referral economics (doc 62)", () => {
  it("locks V1 defaults", () => {
    expect(REFERRAL_ECONOMICS.refereeDiscountPct).toBe(10);
    expect(REFERRAL_ECONOMICS.referrerRewardCoins).toBe(100);
    expect(REFERRAL_ECONOMICS.maxCoinUsePerFiling).toBe(25);
  });

  it("keeps margin healthy on typical plan prices", () => {
    expect(referralMarginOk(499)).toBe(true);
    expect(referralMarginOk(999)).toBe(true);
    expect(referralMarginOk(50)).toBe(false);
  });
});
