export const SITE_NAME = "LastMinute ITR";
export const SITE_TAGLINE =
  "Prepare your ITR with AI — you file and submit on incometax.gov.in yourself";
export const SITE_DESCRIPTION =
  "Import-first ITR prep with lawful optimization, regime comparison, and mismatch checks before you file on the government portal. DPDP compliant.";

export const ASSESSMENT_YEAR = "AY 2026-27";
export const FINANCIAL_YEAR = "FY 2025-26";

/** Original due date for non-audit individual filers (IST). */
export const ITR_FILING_DEADLINE = "2026-07-31T23:59:59+05:30";
export const ITR_FILING_DEADLINE_LABEL = "31 July 2026";

export type { Plan as PricingPlan, PlanId as PricingPlanId } from "@/lib/payments/plans";
export { PLAN_LIST as PRICING_PLANS } from "@/lib/payments/plans";

export const DEMO_REGIME_TAX: { old: number; new: number } = {
  old: 82_429,
  new: 65_913,
};

export const TRUST_ITEMS = [
  "Lawful optimization only",
  "DPDP compliant",
  "Companion filing on gov portal",
] as const;

/** Seeded illustrative testimonials — not live analytics; do not show as verified metrics */
export const BETA_TESTIMONIAL_COUNT = 6;

export const QUICK_START_CONNECTORS = [
  {
    id: "form16",
    title: "Form 16",
    description: "Upload salary certificate from employer",
    href: "/file/import/documents?source=form16",
  },
  {
    id: "ais",
    title: "AIS",
    description: "Annual Information Statement from ITD",
    href: "/file/import/documents?source=ais",
  },
  {
    id: "groww",
    title: "Groww",
    description: "Capital gains and MF statements",
    href: "/file/import/documents?source=groww",
  },
  {
    id: "mfcentral",
    title: "MFCentral",
    description: "Consolidated mutual fund CAS",
    href: "/file/import/documents?source=mfcentral",
  },
] as const;
