import { formatINR } from "@/lib/format";
import type { RegimeComparisonResult, TaxRegime } from "@/lib/engine/types";

export interface NetPayableDisplay {
  isRefund: boolean;
  amount: number;
  label: string;
  formattedAmount: string;
  headline: string;
}

/** Net payable from the engine: positive = tax due, negative = refund. */
export function describeNetPayable(netPayable: number): NetPayableDisplay {
  const isRefund = netPayable < 0;
  const amount = Math.abs(netPayable);

  if (isRefund) {
    return {
      isRefund: true,
      amount,
      label: "Refund",
      formattedAmount: formatINR(amount),
      headline: `Refund ${formatINR(amount)}`,
    };
  }

  if (amount === 0) {
    return {
      isRefund: false,
      amount: 0,
      label: "Tax payable",
      formattedAmount: formatINR(0),
      headline: formatINR(0),
    };
  }

  return {
    isRefund: false,
    amount,
    label: "Tax payable",
    formattedAmount: formatINR(amount),
    headline: formatINR(amount),
  };
}

export interface RegimeComparisonSummary {
  recommended: TaxRegime;
  savings: number;
  oldNetPayable: number;
  newNetPayable: number;
}

export function summarizeRegimeComparison(
  rc: RegimeComparisonResult
): RegimeComparisonSummary {
  return {
    recommended: rc.recommended_regime,
    savings: rc.tax_saving,
    oldNetPayable: rc.old.net_payable,
    newNetPayable: rc.new.net_payable,
  };
}

export function summarizeRegimeComparisonFallback(
  oldNetPayable: number,
  newNetPayable: number
): RegimeComparisonSummary {
  const recommended: TaxRegime = oldNetPayable <= newNetPayable ? "old" : "new";
  return {
    recommended,
    savings: Math.abs(oldNetPayable - newNetPayable),
    oldNetPayable,
    newNetPayable,
  };
}

export function regimeSavingsHeadline(
  recommended: TaxRegime,
  savings: number
): string {
  const regimeLabel = recommended === "old" ? "Old" : "New";
  if (savings <= 0) {
    return "Both regimes result in the same tax outcome";
  }
  return `${regimeLabel} regime saves you ${formatINR(savings)}`;
}
