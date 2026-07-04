/**
 * Marketing voice + disclaimer rules (doc 61).
 * Shared with content CI so SEO/ads never invent guarantees.
 */

/** Site-wide footer / TrustFooter. */
export const SITE_DISCLAIMER =
  "LastMinute ITR helps you prepare and understand your return. You submit and e-verify on the Income Tax Department portal. Tax estimates are not a filing. Not financial advice.";

/** Money pages with ₹ amounts. */
export const MONEY_PAGE_DISCLAIMER =
  "Figures are for AY 2026-27 unless noted. Examples are illustrative. Your tax depends on your documents and the portal's computation.";

/** Regime / calculator surfaces. */
export const REGIME_DISCLAIMER =
  "Regime comparison is an estimate from the facts you entered. Confirm on incometax.gov.in before you submit.";

/** Capital gains / business / ITR-2+ pages. */
export const COMPLEX_CASE_DISCLAIMER =
  "ITR-2/3/4 topics can be complex. If you have foreign assets, audit requirements, or unusual losses, consult a Chartered Accountant.";

/** Required line for paid ads. */
export const PAID_AD_PORTAL_LINE = "You file on the government portal.";

/** Brand narrative (doc 61 §1). */
export const BRAND_NARRATIVE =
  "Your calm, evidence-linked tax companion for filing on the government portal — built for ordinary Indians, honest about what we don't support.";

/**
 * Phrases that must never appear in marketing or learn copy.
 * Overlaps product banned words (doc 42) plus growth-specific claims.
 */
export const MARKETING_BANNED_PHRASES: readonly string[] = [
  "guaranteed refund",
  "maximum refund guaranteed",
  "100% accurate",
  "fully automatic",
  "instant refund",
  "approved by itd",
  "approved by the income tax department",
  "we file your itr",
  "we file your return",
  "auto-submit your itr",
  "auto submit your itr",
  "no ca needed ever",
  "beat cleartax",
  "earn unlimited cash",
  "free itr forever",
] as const;

export function findBannedMarketingPhrase(text: string): string | null {
  const lower = text.toLowerCase();
  for (const phrase of MARKETING_BANNED_PHRASES) {
    if (lower.includes(phrase)) return phrase;
  }
  return null;
}

export function assertNoBannedMarketingPhrases(text: string): void {
  const hit = findBannedMarketingPhrase(text);
  if (hit) {
    throw new Error(`Banned marketing phrase: "${hit}"`);
  }
}
