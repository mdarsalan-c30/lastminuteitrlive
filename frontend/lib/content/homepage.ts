export const PAIN_POINTS = {
  eyebrow: "Sound familiar?",
  headline: "Last-minute filing shouldn't feel like guesswork",
  items: [
    {
      title: "Form 16 vs AIS mismatch",
      detail: "TDS or salary figures don't match — refunds get delayed or notices follow.",
    },
    {
      title: "Old vs new regime confusion",
      detail: "One wrong choice can cost thousands. You need a clear comparison, not jargon.",
    },
    {
      title: "Portal field anxiety",
      detail: "incometax.gov.in has dozens of fields — one typo can block submission.",
    },
    {
      title: "Deduction proof stress",
      detail: "80C, 80D, HRA — only eligible claims with proof count. No shortcuts.",
    },
  ],
} as const;

export const HOW_IT_WORKS = {
  eyebrow: "How it works",
  headline: "Four steps from upload to portal submit",
  steps: [
    {
      step: "1",
      title: "Upload Tax Documents",
      detail:
        "Upload your Form 16, AIS, mutual fund, F&O, or capital gains documents — or start with estimates.",
    },
    {
      step: "2",
      title: "Real-time AI Calculations",
      detail:
        "Review your tax status, salary, TDS, investments, interest, and other income. Compare the Old and New Tax Regimes using the details you provide.",
    },
    {
      step: "3",
      title: "Answer a Few Questions for Your ITR",
      detail:
        "Answer simple questions based on your ITR and selected tax regime. Review your information before filing and resolve document mismatches with guided assistance.",
    },
    {
      step: "4",
      title: "File on the Income Tax Portal",
      detail:
        "Option A: Download the JSON file and upload it on incometax.gov.in. Option B: Follow our screen-by-screen guide to enter the details, submit your return, and complete e-verification on incometax.gov.in.",
    },
  ],
} as const;

export const AI_CA_CHECKS = {
  eyebrow: "AI checks",
  headline: "What your AI assistant reviews before you file",
  checks: [
    "Form 16 salary vs AIS TDS reconciliation",
    "Old vs new regime tax comparison",
    "Eligible deduction suggestions with proof reminders",
    "ITR form recommendation (ITR-1, 2, 3, or 4)",
    "Pre-submit completeness and notice-risk flags",
  ],
} as const;

export const PORTAL_COMPANION = {
  eyebrow: "Portal companion",
  headline: "Your numbers, mapped to incometax.gov.in",
  body:
    "After prep, unlock a step-by-step guide with copy-ready values for each portal field. You stay in control — we never auto-submit to the Income Tax Department.",
  bullets: [
    "Field-by-field mapping to the government portal",
    "Copy-paste ready figures from your verified draft",
    "Works for ITR-1 salaried returns and beyond",
    "You submit and e-verify on incometax.gov.in yourself",
  ],
} as const;

export const INDIAN_USE_CASES = {
  eyebrow: "Built for Indian filers",
  headline: "Real situations we help with",
  personas: [
    {
      title: "Senior salaried",
      detail: "Pension + FD interest + 80D — regime choice matters more than you think.",
    },
    {
      title: "Two Form 16s",
      detail: "Job switch mid-year? We combine employers and reconcile total TDS.",
    },
    {
      title: "AIS surprises",
      detail: "Extra interest or TDS entries in AIS — catch them before filing.",
    },
    {
      title: "Refund anxiety",
      detail: "Estimate refund or tax due — no guaranteed refund, just honest math.",
    },
    {
      title: "Parents' return",
      detail: "Help mom or dad file — simple walkthrough, proof-based deductions only.",
    },
  ],
} as const;

export const PROOF_DEDUCTIONS = {
  eyebrow: "Proof-based claims",
  headline: "Lawful tax saving — nothing made up",
  body:
    "We suggest eligible deductions based on what you tell us. Every claim should match real payments and documents you can show if asked.",
  points: [
    "80C only for investments you actually made",
    "HRA with valid rent proof where applicable",
    "80D for health premiums you paid",
    "No fake donations, inflated rent, or hidden loopholes",
  ],
} as const;

export const EXPANDED_FAQ = {
  eyebrow: "Questions",
  headline: "Straight answers before you start",
} as const;
