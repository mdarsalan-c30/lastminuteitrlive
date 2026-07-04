/**
 * Product scope gate (doc 30 Finding 5).
 *
 * Engine supports ITR-1/2/3/4 core paths (goldens H/I/J + multiform).
 * GATE still hard-blocks personas whose validations are not product-ready:
 * NRI, foreign assets, crypto/VDA, F&O audit cases, directors, minors.
 */

export type ScopeVerdict = "supported" | "blocked";

export interface ScopeGateInput {
  incomeChips: readonly string[];
  recommendedForm: string;
  /** Matrix income band "1"…"7" */
  incomeBand?: string;
}

export interface ScopeGateResult {
  verdict: ScopeVerdict;
  /** ITR form we can run when supported */
  form: string;
  /** Plain-language reasons (shown on /file/not-yet) */
  reasons: string[];
  /** What form they actually need (even when blocked) */
  actualFormNeeded: string;
  /** CA path recommended */
  caRecommended: boolean;
}

/** Capabilities the product is willing to expose end-to-end. */
export const PRODUCT_READY_FORMS = new Set(["ITR-1", "ITR-2", "ITR-3", "ITR-4"]);

/** Chips that always block self-serve (honest exit). */
const BLOCKING_CHIPS: Record<string, string> = {
  nri: "NRI / RNOR filing needs DTAA and residential-status schedules we do not support yet.",
  foreign:
    "Foreign income or assets require Schedule FA / FSI — please use the ITD portal with a CA.",
  crypto:
    "Virtual digital assets (crypto) need specialised schedules — we will not mis-file this.",
  fno: "Futures & options usually need turnover and audit checks — a CA should review.",
  director: "Company directors cannot use the simple path — ITR-2 with director disclosures.",
  unlisted: "Unlisted equity needs additional disclosures we do not collect yet.",
};

export function evaluateScopeGate(input: ScopeGateInput): ScopeGateResult {
  const chips = new Set(input.incomeChips);
  const reasons: string[] = [];

  for (const [chip, message] of Object.entries(BLOCKING_CHIPS)) {
    if (chips.has(chip)) reasons.push(message);
  }

  if (input.recommendedForm === "BLOCK") {
    reasons.push(
      "Minor taxpayers cannot file a standalone return — income is clubbed with a parent."
    );
  }

  if (reasons.length > 0) {
    const actual =
      chips.has("fno") || chips.has("freelance") || chips.has("business_presumptive")
        ? "ITR-3"
        : chips.has("nri") || chips.has("foreign") || chips.has("crypto") || chips.has("director")
          ? "ITR-2"
          : input.recommendedForm === "BLOCK"
            ? "Parent's return"
            : input.recommendedForm;

    return {
      verdict: "blocked",
      form: input.recommendedForm,
      reasons,
      actualFormNeeded: actual,
      caRecommended: true,
    };
  }

  const form = PRODUCT_READY_FORMS.has(input.recommendedForm)
    ? input.recommendedForm
    : "ITR-1";

  return {
    verdict: "supported",
    form,
    reasons: [],
    actualFormNeeded: form,
    caRecommended: false,
  };
}

/** Persistable summary for the blocked screen. */
export function scopeGateToQuery(result: ScopeGateResult): string {
  const params = new URLSearchParams();
  params.set("form", result.actualFormNeeded);
  if (result.reasons[0]) params.set("reason", result.reasons[0]);
  return params.toString();
}
