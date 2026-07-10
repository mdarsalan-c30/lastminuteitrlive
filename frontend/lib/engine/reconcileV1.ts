import type { ExtractedDocumentFact } from "@/lib/ai/documentPipeline";
import type { UserInput } from "@/lib/engine/types";

export interface ReconcileIssueV1 {
  factKey: string;
  label: string;
  documentValue: string | number | boolean;
  draftValue: string | number | boolean | null;
  severity: "confirm" | "mismatch";
  question: string;
}

function draftValueForFact(userInput: UserInput, key: string): number | null {
  switch (key) {
    case "fd_interest":
      return userInput.other_income?.fd_interest ?? null;
    case "savings_account_interest":
      return userInput.other_income?.savings_account_interest ?? null;
    case "dividend_income":
      return userInput.other_income?.dividend_income ?? null;
    case "tds_salary":
      return userInput.taxes_paid?.tds_salary ?? null;
    case "tds_other":
      return userInput.taxes_paid?.tds_other ?? null;
    case "stcg_111a":
      return userInput.capital_gains?.stcg_111a ?? null;
    case "ltcg_112a":
      return userInput.capital_gains?.ltcg_112a ?? null;
    case "stcg_other":
      return userInput.capital_gains?.stcg_other ?? null;
    case "ltcg_other":
      return userInput.capital_gains?.ltcg_other ?? null;
    default:
      return null;
  }
}

function numericValue(value: string | number | boolean): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[,₹\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function reconcileExtractedFactsV1(input: {
  userInput: UserInput;
  facts: Array<Pick<ExtractedDocumentFact, "key" | "label" | "value">>;
}): ReconcileIssueV1[] {
  return input.facts.flatMap<ReconcileIssueV1>((fact) => {
    const documentAmount = numericValue(fact.value);
    const draftAmount = draftValueForFact(input.userInput, fact.key);
    if (documentAmount === null) return [];

    if (draftAmount === null || draftAmount === 0) {
      return [
        {
          factKey: fact.key,
          label: fact.label,
          documentValue: fact.value,
          draftValue: draftAmount,
          severity: "confirm",
          question: `${fact.label} shows ₹${Math.round(documentAmount).toLocaleString("en-IN")}. Should we include it?`,
        },
      ];
    }

    const delta = Math.abs(documentAmount - draftAmount);
    if (delta <= Math.max(10, documentAmount * 0.01)) return [];

    return [
      {
        factKey: fact.key,
        label: fact.label,
        documentValue: fact.value,
        draftValue: draftAmount,
        severity: "mismatch",
        question: `${fact.label} differs from your draft by ₹${Math.round(delta).toLocaleString("en-IN")}. Which value is correct?`,
      },
    ];
  });
}
