import { formatPlanPriceLabel } from "@/lib/marketing/pricing";
import { LAUNCH_OFFER } from "@/lib/marketing/offer";

export const FILING_START = {
  headline: "Start your return",
  welcomeBack: (name: string) => `Welcome back, ${name}`,
  subtitle:
    "Upload Form 16 and AIS. We run proof-based checks, then guide you to file on incometax.gov.in yourself.",
  trustLine: "Lawful optimization · DPDP compliant · Estimate mode by default",
  primaryCta: "Start my return",
  secondaryCta: "Government portal companion",
} as const;

export const FILING_IMPORT = {
  titleDefault: "How do you want to start?",
  titleForm16: (name?: string) =>
    name ? `${name}, upload your Form 16` : "Upload your Form 16",
  subtitleDefault:
    "Pick what you have handy — add documents or refine numbers anytime.",
  subtitleForm16:
    "We pre-fill salary and TDS from your PDF. Add AIS next for mismatch checks.",
} as const;

export const IMPORT_REVEAL = {
  eyebrow: "Imported from Form 16",
  headline: "Here's what we read so far",
  subhead:
    "These figures came straight from your Form 16. Confirm them, then add AIS and any other income before you compute tax.",
  standardDeductionNote:
    "Standard deduction (₹75,000 new regime / ₹50,000 old) is applied automatically by the tax engine — you don't enter it.",
  // Factual checklist of what a Form 16 alone does NOT cover.
  stillNeeded: [
    {
      id: "ais",
      label: "AIS / 26AS reconciliation",
      detail: "Match TDS and reported income against the ITD statement.",
    },
    {
      id: "other-income",
      label: "Interest, dividends, capital gains",
      detail: "Savings/FD interest, dividends, and any sale of shares or property.",
    },
    {
      id: "other-deductions",
      label: "Deductions outside Part B",
      detail: "80D, 80TTA/80TTB, home-loan interest, donations you can prove.",
    },
  ],
  primaryCta: "Confirm & continue",
  secondaryCta: "Add AIS",
} as const;

export const FILING_REGIME = {
  title: "Old vs new tax regime",
  subtitleLoading: "Calculating which regime saves you more tax…",
  subtitleResult: (regime: "old" | "new", savings: string) =>
    `Recommended: ${regime === "new" ? "New" : "Old"} regime — difference ${savings}`,
  subtitleFallback:
    "Could not compute — check your draft inputs or continue with estimates.",
} as const;

export const FILING_DEDUCTIONS = {
  title: "Eligible deductions",
  subtitle: "Only claim deductions that actually happened and you can prove.",
} as const;

export const FILING_COMPANION = {
  title: "Your incometax.gov.in walkthrough",
  subtitle:
    "Step-by-step guide with your numbers ready to copy — you file and submit on the government portal yourself.",
  paywallHeadline: "Pay to unlock your personalized portal filing guide",
  paywallSubtitle:
    "Unlocks your incometax.gov.in walkthrough — you still file and e-verify yourself.",
} as const;

export const CHECKOUT_PLANS = {
  title: "Choose plan",
  subtitle: FILING_COMPANION.paywallSubtitle,
  nextStep:
    "Pay securely — your portal filing guide unlocks immediately. You file on incometax.gov.in; we never auto-submit to ITD.",
  aiSmartOfferNote: `AI Smart launch offer: ${formatPlanPriceLabel(LAUNCH_OFFER.launchPriceInr)} (was ${formatPlanPriceLabel(LAUNCH_OFFER.originalPriceInr)})`,
} as const;

export const CHECKOUT_PAYMENT = {
  title: "Payment & tax summary",
  subtitle: FILING_COMPANION.paywallSubtitle,
  planLine: (planName: string, price: number) =>
    `${planName} · ${formatPlanPriceLabel(price)}`,
} as const;
