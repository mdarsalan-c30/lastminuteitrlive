/**
 * Authoritative AY 2026-27 (FY 2025-26) rules manifest for Genie.
 * Engine is L1 truth for user numbers — this is L0 for law & limits.
 */

export const AY_2026_27 = {
  assessmentYear: "2026-27",
  financialYear: "2025-26",
  filingDeadline: "31 July 2026 (extendable by ITD notification)",
  revisedReturnWindow: "31 December 2026 (typical — verify on portal)",
} as const;

export const AY_2026_27_RULES_BLOCKS: Array<{
  id: string;
  topic: string;
  keywords: string[];
  bullets: string[];
}> = [
  {
    id: "new-regime-slabs",
    topic: "New tax regime slabs (AY 2026-27)",
    keywords: ["new regime", "slab", "tax rate", "87a", "rebate"],
    bullets: [
      "Slabs: 0–4L nil, 4–8L 5%, 8–12L 10%, 12–16L 15%, 16–20L 20%, 20–24L 25%, above 24L 30%",
      "Section 87A rebate up to ₹60,000 if total income ≤ ₹12 lakh (verify latest Finance Act)",
      "Marginal relief may apply near ₹12L — portal computes final tax",
      "Standard deduction on salary: ₹75,000 (no proof needed)",
      "Most Chapter VI-A deductions (80C, HRA, home loan interest) NOT available in new regime",
    ],
  },
  {
    id: "old-regime",
    topic: "Old tax regime",
    keywords: ["old regime", "80c", "hra", "deduction"],
    bullets: [
      "Higher slab rates but 80C, 80D, HRA, 24(b) home loan interest allowed",
      "80C combined cap: ₹1.5 lakh (EPF, PPF, ELSS, LIC, tuition, principal)",
      "80D: ₹25k self/family; ₹25k/₹50k parents (higher if senior parents)",
      "HRA exemption: least of actual HRA, rent−10% salary, 50%/40% of salary",
      "Home loan interest (self-occupied): max ₹2 lakh under Section 24(b)",
      "Salaried can switch between old and new each year",
    ],
  },
  {
    id: "capital-gains",
    topic: "Capital gains (equity & mutual funds)",
    keywords: ["ltcg", "stcg", "112a", "capital gain", "share", "mutual fund", "equity"],
    bullets: [
      "Listed equity STCG (<12 months): 15% on net gain (Section 111A)",
      "Listed equity LTCG (12+ months): 12.5% after ₹1.25 lakh annual exemption (Section 112A)",
      "Use broker Tax P&L — enter on Schedule CG / 112A on incometax.gov.in",
      "Loss harvesting: STCL offsets STCG then LTCG; LTCL only offsets LTCG",
      "Loss carry-forward: 8 years if return filed on time",
    ],
  },
  {
    id: "fno-business",
    topic: "F&O and business income",
    keywords: ["fno", "futures", "options", "intraday", "turnover", "audit", "itr-3"],
    bullets: [
      "F&O profit is business income — ITR-3, Schedule BP (not capital gains)",
      "Turnover = sum of absolute profits and losses from all F&O trades",
      "Tax audit may be required if turnover exceeds ₹10 crore (digital trades)",
      "Business loss carry-forward: 8 years against future business income",
      "Speculative (intraday equity) loss: 4 years, only against speculative gains",
    ],
  },
  {
    id: "vda-crypto",
    topic: "Virtual Digital Assets (crypto)",
    keywords: ["crypto", "vda", "bitcoin", "virtual digital"],
    bullets: [
      "Flat 30% tax on VDA gains plus 4% cess — no slab benefit",
      "No loss set-off against other income; TDS 1% on transfers above threshold",
      "Report in Schedule VDA on ITR-2/3",
      "Keep exchange statements and wallet records",
    ],
  },
  {
    id: "tds-ais",
    topic: "TDS, AIS, and 26AS",
    keywords: ["tds", "ais", "26as", "mismatch", "form 16"],
    bullets: [
      "Form 16 Part A = employer TDS; must match Form 26AS",
      "AIS shows all income/TDS reported to ITD by third parties",
      "Declare all AIS lines (FD interest, dividends, broker sales) to avoid notices",
      "Mismatch: ask employer to revise TDS or file matching AIS figures",
    ],
  },
  {
    id: "filing-process",
    topic: "Filing and e-verification",
    keywords: ["file", "submit", "e-verify", "everify", "acknowledgement", "portal"],
    bullets: [
      "File on incometax.gov.in — we guide, you submit yourself",
      "E-verify within 30 days of submission (Aadhaar OTP easiest)",
      "Without e-verify, return is invalid",
      "Late filing: fee up to ₹5,000; loss carry-forward may be lost",
      "Advance tax if liability > ₹10,000 — interest under 234B/234C if missed",
    ],
  },
  {
    id: "itr-forms",
    topic: "Which ITR form",
    keywords: ["itr-1", "itr-2", "itr-3", "itr-4", "which itr", "choose form"],
    bullets: [
      "ITR-1: resident, salary, one house, small other income, no CG",
      "ITR-2: capital gains, foreign income, multiple properties, director",
      "ITR-3: business, F&O, professional income with books/schedules",
      "ITR-4: presumptive business/profession (44AD/44ADA/44AE) with salary mix",
      "Wrong form = defective return — pick based on income types",
    ],
  },
  {
    id: "senior-citizen",
    topic: "Senior citizens",
    keywords: ["senior", "super senior", "60", "80", "pension", "80ttb"],
    bullets: [
      "Senior (60–79): higher basic exemption in old regime",
      "Super senior (80+): even higher exemption",
      "80TTB: ₹50k interest deduction for seniors on deposits (old regime)",
      "80D limit higher when parents are senior citizens",
    ],
  },
  {
    id: "notices-pain",
    topic: "Notices and common pain points",
    keywords: ["notice", "demand", "scrutiny", "defective", "mismatch", "penalty"],
    bullets: [
      "Most notices: undeclared interest, TDS mismatch, wrong ITR form",
      "Fix: compare AIS + Form 16 + 26AS before filing",
      "Defective return: wrong form or missing schedules — file revised return",
      "Do not ignore ITD emails — respond within deadline shown",
      "Keep proofs 6 years for deductions claimed",
    ],
  },
];

/** Compact text block for LLM system context. */
export function formatAyRulesForPrompt(maxBlocks = 6): string {
  return AY_2026_27_RULES_BLOCKS.slice(0, maxBlocks)
    .map(
      (b) =>
        `### ${b.topic}\n${b.bullets.map((x) => `• ${x}`).join("\n")}`
    )
    .join("\n\n");
}

/** Rules most relevant to a question (keyword overlap). */
export function pickRelevantAyRules(question: string, limit = 4): string {
  const n = question.toLowerCase();
  const scored = AY_2026_27_RULES_BLOCKS.map((block) => {
    const score = block.keywords.reduce(
      (sum, k) => (n.includes(k) ? sum + 2 : sum),
      0
    );
    return { block, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length === 0) {
    return formatAyRulesForPrompt(3);
  }

  return scored
    .map(({ block }) => `### ${block.topic}\n${block.bullets.map((x) => `• ${x}`).join("\n")}`)
    .join("\n\n");
}
