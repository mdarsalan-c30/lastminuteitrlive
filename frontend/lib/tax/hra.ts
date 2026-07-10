/**
 * HRA exemption — least of three (Sec 10(13A)), old regime only.
 * Mirrors backend/engine/salary.py::compute_hra_exemption.
 */

export type CityTier = "metro" | "non_metro";

export interface HraInput {
  hraReceived: number;
  basicSalary: number;
  actualRentPaid: number;
  cityTier: CityTier;
}

export interface HraBreakdown {
  limb1ActualHra: number;
  limb2PercentOfBasic: number;
  limb3RentMinus10PctBasic: number;
  exemption: number;
  metroFactor: number;
}

export function computeHraExemption(input: HraInput): HraBreakdown {
  const hra = Math.max(0, input.hraReceived);
  const basic = Math.max(0, input.basicSalary);
  const rent = Math.max(0, input.actualRentPaid);
  const metroFactor = input.cityTier === "metro" ? 0.5 : 0.4;

  if (hra <= 0 || rent <= 0 || basic <= 0) {
    return {
      limb1ActualHra: hra,
      limb2PercentOfBasic: Math.round(basic * metroFactor),
      limb3RentMinus10PctBasic: Math.max(0, Math.round(rent - 0.1 * basic)),
      exemption: 0,
      metroFactor,
    };
  }

  const limb1 = hra;
  const limb2 = Math.round(basic * metroFactor);
  const limb3 = Math.max(0, Math.round(rent - 0.1 * basic));
  const exemption = Math.min(limb1, limb2, limb3);

  return {
    limb1ActualHra: limb1,
    limb2PercentOfBasic: limb2,
    limb3RentMinus10PctBasic: limb3,
    exemption,
    metroFactor,
  };
}

/** Standard deduction caps — one per return even with multiple Form 16s. */
export const STD_DEDUCTION_NEW = 75_000;
export const STD_DEDUCTION_OLD = 50_000;

export function standardDeductionCap(
  regime: "old" | "new",
  grossSalary: number
): number {
  const cap = regime === "new" ? STD_DEDUCTION_NEW : STD_DEDUCTION_OLD;
  return Math.min(cap, Math.max(0, grossSalary));
}
