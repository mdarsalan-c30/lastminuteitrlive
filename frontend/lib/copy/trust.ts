/** Shared trust, escalation, and why-we-ask copy — Phase 6. */

export const AI_ASSISTED_POSITIONING =
  "Your Smart AI Tax Assistant — we guide ITR-1 through ITR-7 and you submit on incometax.gov.in.";

export const AI_ASSISTED_TAGLINE =
  "Smart document reading, form selection, and step-by-step filing — like having a tax expert beside you.";

export const NO_CA_REPLACEMENT =
  "Not a substitute for professional advice on complex cases (business books, foreign assets, litigation).";

export const COMPLEX_CASE_ESCALATION_TITLE = "We will guide you through this";

export const COMPLEX_CASE_ESCALATION_BODY =
  "F&O, capital gains, foreign income, or business income need extra schedules — but you do not have to figure it out alone. We read broker statements, map figures to the right ITR form, and walk you screen-by-screen on the government portal.";

export const COMPLEX_CASE_FLAG = "Guided filing — we are with you";

export const CA_REVIEW_COMING_SOON =
  "CA Review is launching soon — optional human review before you file on the government portal.";

export const ESCALATION_CTA_PRIMARY = "Explore CA Review";
export const ESCALATION_CTA_SECONDARY = "Continue self-file anyway";

export const SELF_FILE_ELIGIBLE = "Self-file eligible with our guide";

/** Short why-we-ask hints for data-entry screens. */
export const WHY_WE_ASK = {
  profileIncome:
    "Income type decides which ITR form the law requires — wrong form triggers notices.",
  salaryConfirm:
    "Salary and TDS must match Form 16 and Form 26AS — mismatches delay refunds.",
  deductions:
    "Deductions reduce tax only in the old regime and only with proof — the portal validates totals.",
  regime:
    "You choose old or new regime once per year — it changes every deduction and slab downstream.",
  import:
    "Documents pre-fill your draft — you still verify every figure before filing on the portal.",
} as const;
