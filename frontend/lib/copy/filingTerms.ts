export const FILING_TERMS = {
  filingAssistant: "Filing Assistant",
  taxAssistant: "Tax Assistant",
  guidedTaxCheck: "Guided Tax Check",
  portalGuide: "Portal Filing Guide",
  humanCaReview: "Human CA Review",
} as const;

export const FILING_HELP = {
  about:
    "We ask only the personal details needed to suggest the filing steps that may apply to you.",
  documents:
    "Add the tax documents you have. We read available figures, but you must review them before filing.",
  income:
    "Add every type of income you received during the financial year, even if tax was not deducted.",
  regime:
    "This compares estimated tax under the old and new tax options using the information currently in your draft.",
  check:
    "This check points out missing information, possible differences and questions worth reviewing. It is not a professional opinion.",
  plans:
    "Choose the level of guided support you need. You can review the plan price and inclusions before paying.",
  portal:
    "This guide shows where your reviewed values go on incometax.gov.in. You submit and e-verify the return yourself.",
} as const;
