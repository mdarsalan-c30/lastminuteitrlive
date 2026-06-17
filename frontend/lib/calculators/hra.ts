/**
 * Standalone HRA exemption calculator (Section 10(13A)).
 *
 * Mirrors engine/salary.py::compute_hra_exemption so standalone tool results
 * match the filing engine within rounding. HRA exemption is the least of:
 *   1. Actual HRA received
 *   2. 50% of basic (metro) / 40% of basic (non-metro)
 *   3. Actual rent paid − 10% of basic
 *
 * Exemption is 0 when no rent is paid, no HRA is received, or basic ≤ 0.
 * It is only allowed under the OLD regime; the new regime substitutes the
 * higher ₹75,000 standard deduction instead.
 */

export type CityTier = "metro" | "non_metro";

export interface HraInput {
  /** Annual HRA received from employer (₹). */
  hraReceived: number;
  /** Annual basic salary + DA forming part of retirement benefits (₹). */
  basicSalary: number;
  /** Annual rent actually paid (₹). */
  rentPaid: number;
  /** Metro cities (Delhi, Mumbai, Kolkata, Chennai) get 50%, else 40%. */
  cityTier: CityTier;
}

export interface HraResult {
  /** Exempt portion of HRA (₹), rounded to 2 decimals. */
  exemption: number;
  /** Taxable portion of HRA received (₹) = hraReceived − exemption. */
  taxable: number;
  /** The three statutory limbs, for transparent display. */
  limbs: {
    actualHraReceived: number;
    percentOfBasic: number;
    rentMinusTenPercent: number;
  };
  /** Which limb determined the exemption (for "why" copy). */
  bindingLimb: "actual_hra" | "percent_of_basic" | "rent_minus_10pct" | "none";
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computeHraExemption(input: HraInput): HraResult {
  const hraReceived = Math.max(0, input.hraReceived || 0);
  const basicSalary = Math.max(0, input.basicSalary || 0);
  const rentPaid = Math.max(0, input.rentPaid || 0);

  const metroFactor = input.cityTier === "metro" ? 0.5 : 0.4;
  const limbActual = hraReceived;
  const limbPercent = round2(basicSalary * metroFactor);
  const limbRent = round2(Math.max(0, rentPaid - 0.1 * basicSalary));

  const limbs = {
    actualHraReceived: round2(limbActual),
    percentOfBasic: limbPercent,
    rentMinusTenPercent: limbRent,
  };

  // No exemption when any required input is missing.
  if (hraReceived <= 0 || rentPaid <= 0 || basicSalary <= 0) {
    return { exemption: 0, taxable: round2(hraReceived), limbs, bindingLimb: "none" };
  }

  const exemption = round2(Math.min(limbActual, limbPercent, limbRent));
  const taxable = round2(Math.max(0, hraReceived - exemption));

  let bindingLimb: HraResult["bindingLimb"] = "actual_hra";
  if (exemption === limbPercent && limbPercent <= limbActual && limbPercent <= limbRent) {
    bindingLimb = "percent_of_basic";
  } else if (exemption === limbRent && limbRent <= limbActual && limbRent <= limbPercent) {
    bindingLimb = "rent_minus_10pct";
  } else {
    bindingLimb = "actual_hra";
  }

  return { exemption, taxable, limbs, bindingLimb };
}
