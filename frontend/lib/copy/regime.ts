/**
 * Form 10-IEA attestation when switching new → old with business/freelance income.
 */

export const REGIME_COPY = {
  defaultNew:
    "New regime is the default for AY 2026-27. You can still pick Old if it saves you more.",
  form10IeaTitle: "Form 10-IEA required for Old regime",
  form10IeaBody:
    "You have freelance or business income. To use the Old tax regime, you must file Form 10-IEA on the income-tax portal (once, unless you switch again). Tick below only if you will file it.",
  form10IeaCheckbox:
    "I understand I must file Form 10-IEA to opt for the Old regime with business/profession income.",
  blockedWithoutAttestation:
    "Confirm Form 10-IEA before choosing Old regime with business income.",
} as const;

const BUSINESS_CHIPS = new Set([
  "freelance",
  "business_presumptive",
  "fno",
]);

export function requiresForm10IeaAttestation(
  incomeChips: readonly string[],
  selectedRegime: "old" | "new" | null
): boolean {
  if (selectedRegime !== "old") return false;
  return incomeChips.some((c) => BUSINESS_CHIPS.has(c));
}
