/**
 * Product scope gate (doc 30 Finding 5).
 *
 * Engine supports ITR-1/2/3/4 core paths. Crypto/VDA, NRI, and foreign assets
 * are guided self-serve wizards (Wave E). Directors / unlisted / minors still
 * hard-block with an honest exit.
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
  /** Guidance for complex but supported paths */
  guidance: string[];
  /** What form they actually need (even when blocked) */
  actualFormNeeded: string;
  /** CA path recommended */
  caRecommended: boolean;
}

/** Capabilities the product is willing to expose end-to-end. */
export const PRODUCT_READY_FORMS = new Set(["ITR-1", "ITR-2", "ITR-3", "ITR-4"]);

/** Chips that always block self-serve (honest exit). */
const BLOCKING_CHIPS: Record<string, string> = {
  director: "Company directors cannot use the simple path — ITR-2 with director disclosures.",
  unlisted: "Unlisted equity needs additional disclosures we do not collect yet.",
};

/** Shown as guidance only — user can still continue on guided paths. */
export const GUIDED_COMPLEX_CHIPS: Record<string, string> = {
  fno: "F&O is business income on ITR-3 — we guide turnover, expenses, and audit checks.",
  crypto:
    "Crypto / VDA uses Schedule VDA — 30% on each winning trade, no loss netting. We guide you trade-by-trade.",
  nri: "NRI / RNOR filing — we guide days-in-India status and Schedule FA. Confirm DTAA with a CA if needed.",
  foreign:
    "Foreign income or assets need Schedule FA / FSI — we collect the checklist and route to ITR-2.",
};

export function evaluateScopeGate(input: ScopeGateInput): ScopeGateResult {
  const chips = new Set(input.incomeChips);
  const reasons: string[] = [];
  const guidance: string[] = [];

  for (const [chip, message] of Object.entries(BLOCKING_CHIPS)) {
    if (chips.has(chip)) reasons.push(message);
  }

  for (const [chip, message] of Object.entries(GUIDED_COMPLEX_CHIPS)) {
    if (chips.has(chip)) guidance.push(message);
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
      guidance,
      actualFormNeeded: actual,
      caRecommended: true,
    };
  }

  let form = PRODUCT_READY_FORMS.has(input.recommendedForm)
    ? input.recommendedForm
    : "ITR-1";

  if (chips.has("fno") || chips.has("freelance") || chips.has("business_presumptive")) {
    form = form === "ITR-1" || form === "ITR-2" ? "ITR-3" : form;
  } else if (chips.has("crypto") || chips.has("nri") || chips.has("foreign") || chips.has("capital_gains")) {
    form = form === "ITR-1" ? "ITR-2" : form;
  }

  return {
    verdict: "supported",
    form,
    reasons: [],
    guidance,
    actualFormNeeded: form,
    caRecommended:
      chips.has("fno") || chips.has("crypto") || chips.has("nri") || chips.has("foreign"),
  };
}

/** Persistable summary for the blocked screen. */
export function scopeGateToQuery(result: ScopeGateResult): string {
  const params = new URLSearchParams();
  params.set("form", result.actualFormNeeded);
  if (result.reasons[0]) params.set("reason", result.reasons[0]);
  return params.toString();
}
