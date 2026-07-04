/**
 * Referral economics (doc 62).
 * Admin defaults must stay aligned with these constants.
 */

export const REFERRAL_ECONOMICS = {
  /** Percent off paid plan for the referee. */
  refereeDiscountPct: 10,
  /** Coins credited to referrer after referee payment verifies. */
  referrerRewardCoins: 100,
  /** Max coins redeemable against a single filing. */
  maxCoinUsePerFiling: 25,
  /** Minimum net list-price retention after discount + coin liability. */
  minNetListPricePct: 60,
  /** V1 success trigger. */
  trigger: "paid_plan_purchase" as const,
} as const;

export const REFERRAL_REFERRER_COPY =
  "Share your code. When a friend unlocks companion prep, you get coins toward your next filing.";

export const REFERRAL_REFEREE_COPY =
  "Use a friend's code for 10% off. You still file on incometax.gov.in — we help you prepare.";

/**
 * Quick margin check for a plan list price in ₹.
 * Returns whether discount + max coin liability leave ≥ minNetListPricePct.
 */
export function referralMarginOk(listPriceInr: number): boolean {
  if (listPriceInr <= 0) return false;
  const discount =
    (listPriceInr * REFERRAL_ECONOMICS.refereeDiscountPct) / 100;
  // Coins are internal credit; treat max use as rupee-equivalent liability.
  const coinLiability = REFERRAL_ECONOMICS.maxCoinUsePerFiling;
  const net = listPriceInr - discount - coinLiability;
  const minNet =
    (listPriceInr * REFERRAL_ECONOMICS.minNetListPricePct) / 100;
  return net >= minNet;
}
