/**
 * Schedule VDA — flat 30% on each winning trade; no cross-token loss netting.
 * Sec 115BBH / 194S TDS credit tracked separately.
 */

export interface VdaTrade {
  id: string;
  token: string;
  costOfAcquisition: number;
  considerationReceived: number;
  tds194S?: number;
}

export interface VdaTradeResult extends VdaTrade {
  gain: number;
  taxableGain: number;
  taxAt30Pct: number;
  lossIgnored: number;
}

export interface VdaSummary {
  trades: VdaTradeResult[];
  totalTaxableGains: number;
  totalTaxAt30Pct: number;
  totalLossesBlocked: number;
  totalTds194S: number;
}

export function computeVdaTradeTax(trade: VdaTrade): VdaTradeResult {
  const cost = Math.max(0, trade.costOfAcquisition);
  const consideration = Math.max(0, trade.considerationReceived);
  const gain = consideration - cost;
  const taxableGain = Math.max(0, gain);
  const lossIgnored = Math.max(0, -gain);
  return {
    ...trade,
    gain,
    taxableGain,
    taxAt30Pct: Math.round(taxableGain * 0.3 * 100) / 100,
    lossIgnored,
  };
}

/**
 * Aggregate VDA — never nets losses across tokens or trades.
 */
export function summarizeVdaTrades(trades: VdaTrade[]): VdaSummary {
  const results = trades.map(computeVdaTradeTax);
  return {
    trades: results,
    totalTaxableGains: results.reduce((s, t) => s + t.taxableGain, 0),
    totalTaxAt30Pct: results.reduce((s, t) => s + t.taxAt30Pct, 0),
    totalLossesBlocked: results.reduce((s, t) => s + t.lossIgnored, 0),
    totalTds194S: results.reduce((s, t) => s + (t.tds194S ?? 0), 0),
  };
}

export const FNO_AUDIT_TURNOVER_THRESHOLD = 10_00_00_000; // ₹10 Cr digital

export function fnoAuditWarning(turnover: number): string | null {
  if (turnover >= FNO_AUDIT_TURNOVER_THRESHOLD) {
    return "Your F&O absolute turnover is at or above ₹10 crore (digital). A tax audit under Sec 44AB may apply — we recommend a CA review.";
  }
  return null;
}
