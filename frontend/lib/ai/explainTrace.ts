/**
 * explainTrace.ts — deterministic explanation layer (doc 51 catalog).
 *
 * Renders plain-language explanations ONLY from engine trace entries
 * (doc 22 §3). Every rupee amount comes from `entry.params`; nothing is
 * generated. A rule id with no template renders nothing — the honest
 * "can't explain this yet" path — never a guess.
 *
 * This is L2 of the AI CA architecture (doc 50): if the LLM layer is down
 * or unentitled, these strings ship verbatim.
 */

import { formatINR } from "@/lib/format";
import type { RegimeComparisonResult, TraceEntry } from "@/lib/engine/types";

export interface TraceExplanation {
  ruleId: string;
  /** Plain-language line (doc 42 voice). */
  text: string;
  /** The jargon layer, shown inside a "Why?" expander. */
  expander?: string;
}

type Params = Record<string, number>;
type Template = {
  /** Every listed param must be present or the template refuses to render. */
  requires: string[];
  render: (p: Params) => { text: string; expander?: string };
};

// formatINR already includes the ₹ symbol (Intl currency style)
const inr = (n: number) => formatINR(Math.round(n));
const pct = (n: number) => `${Number(n.toFixed(2))}%`;

const CATALOG: Record<string, Template> = {
  "slab_tax.new": {
    requires: ["taxable", "slab_tax"],
    render: (p) => ({
      text: `On ${inr(p.taxable)}, the new-regime slabs add up to ${inr(p.slab_tax)}.`,
      expander:
        "New regime (AY 2026-27): 0% up to ₹4L, then 5% / 10% / 15% / 20% / 25% bands to ₹24L, 30% above.",
    }),
  },
  "slab_tax.old": {
    requires: ["taxable", "slab_tax"],
    render: (p) => ({
      text: `On ${inr(p.taxable)}, the old-regime slabs add up to ${inr(p.slab_tax)}.`,
      expander:
        "Old regime: 0% up to ₹2.5L (₹3L senior, ₹5L super-senior), 5% to ₹5L, 20% to ₹10L, 30% above.",
    }),
  },
  "rebate_87a.applied": {
    requires: ["total_income", "limit", "rebate"],
    render: (p) => ({
      text: `Your income (${inr(p.total_income)}) is under ${inr(p.limit)}, so ${inr(p.rebate)} of tax is waived.`,
      expander:
        "Section 87A rebate. In the new regime for AY 2026-27, slab tax up to ₹60,000 is waived when total income is ₹12,00,000 or less. It never reduces tax on capital gains taxed at special rates.",
    }),
  },
  "rebate_87a.denied": {
    requires: ["total_income", "limit"],
    render: (p) => ({
      text: `Your income (${inr(p.total_income)}) is over ${inr(p.limit)}, so the Section 87A tax waiver doesn't apply this year.`,
      expander:
        "Section 87A applies only when total income is within the limit. Just above it, a marginal-relief rule may still cap your tax.",
    }),
  },
  "rebate_87a.marginal_relief": {
    requires: ["limit", "max_tax", "tax_before", "relief"],
    render: (p) => ({
      text: `You're just over ${inr(p.limit)}. A special rule caps your tax at ${inr(p.max_tax)} — the amount you're over by — instead of ${inr(p.tax_before)}. You save ${inr(p.relief)}.`,
      expander:
        "Marginal relief under the proviso to Section 87A: slab tax cannot exceed the amount by which total income exceeds ₹12,00,000.",
    }),
  },
  "special_rate.total": {
    requires: ["tax"],
    render: (p) => ({
      text: `${inr(p.tax)} is tax on investment profits (capital gains), calculated at flat rates separate from your salary slabs.`,
      expander:
        "STCG on listed shares: 20% u/s 111A. LTCG over ₹1,25,000: 12.5% u/s 112A. The 87A rebate never offsets these.",
    }),
  },
  "surcharge.applied": {
    requires: ["rate", "surcharge", "total_income"],
    render: (p) => ({
      text: `Because total income exceeds the surcharge threshold, a ${pct(p.rate)} surcharge of ${inr(p.surcharge)} applies.`,
      expander:
        "Surcharge bands: 10% above ₹50L, 15% above ₹1Cr, 25% above ₹2Cr (new regime caps at 25%; special-rate gains cap at 15%).",
    }),
  },
  cess: {
    requires: ["cess"],
    render: (p) => ({
      text: `A 4% health & education cess of ${inr(p.cess)} applies on the tax — everyone pays this.`,
      expander: "Health & Education Cess, 4% of income tax plus surcharge.",
    }),
  },
};

/** Render explanations for a trace. Unknown rules are skipped, never guessed. */
export function explainTrace(trace: TraceEntry[] | undefined): TraceExplanation[] {
  if (!trace || trace.length === 0) return [];
  const out: TraceExplanation[] = [];
  for (const entry of trace) {
    const template = CATALOG[entry.rule];
    if (!template) continue;
    const params = entry.params ?? {};
    const resolvable = template.requires.every(
      (key) => typeof params[key] === "number" && Number.isFinite(params[key])
    );
    if (!resolvable) continue; // partial data: refuse rather than default
    const rendered = template.render(params);
    out.push({ ruleId: entry.rule, ...rendered });
  }
  return out;
}

/** Rule ids the catalog can explain — used by the coverage test (doc 51 §6). */
export function explainableRuleIds(): string[] {
  return Object.keys(CATALOG);
}

/**
 * The regime verdict line (doc 51 `regime.verdict`) — synthesized from the
 * comparison result, not the trace, because it spans both regimes.
 */
export function explainRegimeVerdict(rc: RegimeComparisonResult): TraceExplanation {
  const winner = rc.recommended_regime === "old" ? "old" : "new";
  if (Math.round(rc.tax_saving) === 0) {
    return {
      ruleId: "regime.verdict",
      text: `Both regimes come to the same tax for you (old ${inr(rc.old.total_tax)}, new ${inr(rc.new.total_tax)}). We default to the new regime — it needs no proof of deductions.`,
    };
  }
  return {
    ruleId: "regime.verdict",
    text: `The ${winner} regime saves you ${inr(rc.tax_saving)}. We computed both — old: ${inr(rc.old.total_tax)}, new: ${inr(rc.new.total_tax)}.`,
    expander:
      winner === "new"
        ? `Your old-regime deductions would need to reach ${inr(rc.breakeven_deductions)} before the old regime wins.`
        : `Your deductions (${inr(rc.deductions_lost_in_new)} forfeited in the new regime) are large enough that the old regime wins.`,
  };
}
