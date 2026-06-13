/**
 * Testing bypass for companion / portal guide paywall.
 *
 * Client bundle (PresubmitChecklist, companion page):
 *   NEXT_PUBLIC_BYPASS_PAYMENT, NEXT_PUBLIC_TESTING_MODE, or NODE_ENV=development
 *
 * Server (API routes, portal guide POST):
 *   Any client flag above, BYPASS_COMPANION_PAYWALL, or NODE_ENV=development
 *
 * For production testing without payment, set NEXT_PUBLIC_BYPASS_PAYMENT=true on Vercel
 * and redeploy — the value is inlined at build time.
 */
function isPublicBypassFlagEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_BYPASS_PAYMENT === "true" ||
    process.env.NEXT_PUBLIC_TESTING_MODE === "true"
  );
}

export function isPaymentBypassEnabled(): boolean {
  return (
    isPublicBypassFlagEnabled() ||
    process.env.BYPASS_COMPANION_PAYWALL === "true" ||
    process.env.NODE_ENV === "development"
  );
}

/** Client-safe check (NEXT_PUBLIC_* + dev mode in browser bundles). */
export function isClientPaymentBypassEnabled(): boolean {
  return isPublicBypassFlagEnabled() || process.env.NODE_ENV === "development";
}
