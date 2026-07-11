import { getEntryPriceInr, LAUNCH_OFFER } from "@/lib/marketing/offer";
import { formatPlanPriceLabel } from "@/lib/marketing/pricing";

export const HERO_HEADLINE =
  "File your own ITR — Your Personal smart AI assisted CA.";

export const HERO_HEADLINE_ACCENT =
  "Upload Form 16, AIS, capital gains, F&O — step-by-step guide on incometax.gov.in.";

export const HERO_EMOTIONAL_HOOK =
  "Upload your Form 16, AIS, capital gains, F&O, answer a few easy questions, and get a step-by-step guide to file directly on incometax.gov.in with an expert by your side.";

export const HERO_TRUST_LINE =
  "Estimate only — ITD confirms your final refund · You file on incometax.gov.in · Not a government service";

export const HERO_CTAS = {
  uploadForm16: {
    label: "Upload Form 16",
    href: "/file/import/documents?source=form16",
  },
  startFiling: {
    label: `Start filing from ${formatPlanPriceLabel(getEntryPriceInr())}`,
    href: "/file/checkout/plans?plan=normal",
  },
  howItWorks: {
    label: "See how it works",
    href: "#how-it-works",
  },
} as const;

export const PRICING_SECTION = {
  eyebrow: "Pricing",
  headline: "Pay to unlock your portal guide",
  subhead:
    "Start free with estimates. Pay only to unlock your personalized incometax.gov.in walkthrough — you still file and e-verify yourself.",
  helperLine:
    "Prices in ₹ · Secure Razorpay checkout · We never store card details · Your files stay on the portal after you submit",
} as const;

export const PAYMENT_COPY = {
  secureLine: "UPI / card via Razorpay · Secure payment · No card storage on our servers",
  portalLine:
    "Payment unlocks your step-by-step portal guide — you copy values into incometax.gov.in yourself.",
  filesLine: "After filing, your return and acknowledgements live on the government portal.",
} as const;

export const OFFER_COPY = {
  pill: `Plans from ${formatPlanPriceLabel(getEntryPriceInr())}`,
  countdownPrefix: "Offer ends in",
  expired: "Launch offer ended",
} as const;

export const FINAL_CTA = {
  headline: "Ready before the deadline?",
  subhead:
    "Import your documents, review eligible deductions, and unlock your portal guide when you're confident.",
  primary: HERO_CTAS.startFiling.label,
  secondary: "Start free estimate",
} as const;
