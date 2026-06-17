import type { DeductionDraft, HousePropertyDraft, IncomeDraft } from "@/lib/store/draft";

/**
 * Factual checklist statuses — no advice. We only state what the draft contains:
 * - "claimed": an amount > 0 is entered in an allowed slot.
 * - "needs-proof": the slot is allowed but nothing is entered yet (claim only with proof).
 * - "not-applicable": the current regime or the user's situation disallows the slot.
 */
export type DeductionStatus = "claimed" | "needs-proof" | "not-applicable";

export interface DeductionChecklistItem {
  id: string;
  label: string;
  section: string;
  amount: number;
  status: DeductionStatus;
  /** Factual proof / scope note. Never advisory. */
  note: string;
}

export interface DeductionChecklistInput {
  deductions: Pick<DeductionDraft, "section80C" | "section80D" | "section80GG" | "npsExtra">;
  houseProperty: Pick<HousePropertyDraft, "propertyType" | "homeLoanInterest">;
  income: Pick<IncomeDraft, "hraReceived">;
  regime: "old" | "new" | null;
}

function classify(amount: number, applicable: boolean): DeductionStatus {
  if (!applicable) return "not-applicable";
  return amount > 0 ? "claimed" : "needs-proof";
}

/**
 * Build the deduction checklist from the current draft. Most Chapter VI-A
 * deductions are disallowed under the new regime; standard deduction applies in
 * both and is auto-applied by the engine.
 */
export function buildDeductionChecklist(
  input: DeductionChecklistInput
): DeductionChecklistItem[] {
  const { deductions, houseProperty, income, regime } = input;
  const isNew = regime === "new";
  const hasHra = income.hraReceived > 0;
  const hasProperty = houseProperty.propertyType !== "none";

  const items: DeductionChecklistItem[] = [
    {
      id: "standard-deduction",
      label: "Standard deduction",
      section: "Sec 16(ia)",
      amount: isNew ? 75000 : 50000,
      status: "claimed",
      note: "Auto-applied by the tax engine — you don't enter this.",
    },
    {
      id: "80c",
      label: "Investments & savings",
      section: "Sec 80C",
      amount: deductions.section80C,
      status: classify(deductions.section80C, !isNew),
      note: isNew
        ? "Not allowed under the new regime."
        : "Cap ₹1,50,000. Proof: PF/PPF/ELSS/LIC/tuition receipts.",
    },
    {
      id: "80d",
      label: "Health insurance premium",
      section: "Sec 80D",
      amount: deductions.section80D,
      status: classify(deductions.section80D, !isNew),
      note: isNew
        ? "Not allowed under the new regime."
        : "Proof: insurer premium receipts for self/family/parents.",
    },
    {
      id: "80ccd1b",
      label: "Additional NPS contribution",
      section: "Sec 80CCD(1B)",
      amount: deductions.npsExtra,
      status: classify(deductions.npsExtra, !isNew),
      note: isNew
        ? "Not allowed under the new regime."
        : "Cap ₹50,000 over 80C. Proof: NPS transaction statement.",
    },
    {
      id: "80gg",
      label: "Rent paid (no HRA)",
      section: "Sec 80GG",
      amount: deductions.section80GG,
      status: classify(deductions.section80GG, !isNew && !hasHra),
      note: hasHra
        ? "Not applicable — you received HRA, claim HRA exemption instead."
        : isNew
          ? "Not allowed under the new regime."
          : "Proof: rent receipts and Form 10BA.",
    },
    {
      id: "24b",
      label: "Home loan interest",
      section: "Sec 24(b)",
      amount: houseProperty.homeLoanInterest,
      status: classify(houseProperty.homeLoanInterest, hasProperty),
      note: !hasProperty
        ? "No house property declared."
        : isNew
          ? "Self-occupied interest is not deductible under the new regime; let-out interest is."
          : "Proof: lender interest certificate.",
    },
  ];

  return items;
}

export interface DeductionChecklistSummary {
  claimed: number;
  needsProof: number;
  notApplicable: number;
  totalClaimedAmount: number;
}

export function summarizeDeductionChecklist(
  items: DeductionChecklistItem[]
): DeductionChecklistSummary {
  return items.reduce<DeductionChecklistSummary>(
    (acc, item) => {
      if (item.status === "claimed") {
        acc.claimed += 1;
        acc.totalClaimedAmount += item.amount;
      } else if (item.status === "needs-proof") {
        acc.needsProof += 1;
      } else {
        acc.notApplicable += 1;
      }
      return acc;
    },
    { claimed: 0, needsProof: 0, notApplicable: 0, totalClaimedAmount: 0 }
  );
}
