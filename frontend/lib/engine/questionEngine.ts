import type { DraftState } from "@/lib/store/draft";
import { generateDeductionDiscoveryQuestions } from "./deductionDiscovery";
import type { ITRResult, UserInput } from "./types";

export type FollowUpCategory =
  | "documents"
  | "income"
  | "deductions"
  | "profile"
  | "reconciliation";

export type FollowUpPriority = "high" | "medium" | "low";

export interface FollowUpQuestion {
  id: string;
  prompt: string;
  whyWeAsk: string;
  category: FollowUpCategory;
  priority: FollowUpPriority;
  /** Deterministic "up to ₹X" saving estimate (deduction-discovery questions). */
  estimatedSaving?: number;
  /** Statutory anchor, e.g. "80D" (deduction-discovery questions). */
  section?: string;
}

export interface QuestionEngineContext {
  result?: ITRResult | null;
  userInput: UserInput;
  draft: Pick<
    DraftState,
    | "profile"
    | "income"
    | "incomeChips"
    | "connectedConnectors"
    | "mismatchResolved"
    | "lastParseResult"
    | "houseProperty"
    | "deductions"
  > &
    Partial<
      Pick<
        DraftState,
        "extraProperties" | "carryForward" | "depreciationBlocks" | "profession"
      >
    >;
  questionAnswers?: Record<string, unknown>;
}

const CHIP_INCOME_MAP: Record<string, keyof NonNullable<UserInput["other_income"]>> = {
  fd_interest: "fd_interest",
  bank_interest: "savings_account_interest",
};

const UNMAPPED_INCOME_CHIPS: Record<
  string,
  { prompt: string; whyWeAsk: string; priority: FollowUpPriority }
> = {
  pension: {
    prompt: "Do you receive pension income separate from salary?",
    whyWeAsk:
      "Pension may be taxable under salary or other sources depending on type — we need the amount to route correctly.",
    priority: "medium",
  },
  esop_rsu: {
    prompt: "Did you exercise ESOPs or receive RSUs this year?",
    whyWeAsk:
      "Equity compensation has specific perquisite and capital-gains treatment that affects your ITR form.",
    priority: "high",
  },
  rent_received: {
    prompt: "How much rent did you receive from let-out property?",
    whyWeAsk:
      "Rental income must be declared under house property — we only have a chip selected, not the amount.",
    priority: "high",
  },
};

function isAnswered(
  answers: Record<string, unknown> | undefined,
  id: string
): boolean {
  if (!answers) return false;
  return Object.prototype.hasOwnProperty.call(answers, id);
}

function questionsFromConfidence(
  result: ITRResult,
  answers?: Record<string, unknown>
): FollowUpQuestion[] {
  const questions: FollowUpQuestion[] = [];
  const { confidence } = result;

  for (const doc of confidence.missing_documents) {
    const id = `missing_doc_${doc.replace(/\W+/g, "_").toLowerCase()}`;
    if (isAnswered(answers, id)) continue;
    questions.push({
      id,
      prompt: `Do you have ${doc} available to upload?`,
      whyWeAsk:
        "Missing documents reduce filing confidence and may cause mismatches with AIS/26AS.",
      category: "documents",
      priority: confidence.filing_ready ? "low" : "high",
    });
  }

  if (confidence.completeness_score < 70 && !confidence.filing_ready) {
    const id = "confidence_low";
    if (!isAnswered(answers, id)) {
      questions.push({
        id,
        prompt: "Would you like to upload more documents before we finalize numbers?",
        whyWeAsk:
          "Your return is below 70% completeness — extra documents improve accuracy.",
        category: "documents",
        priority: "medium",
      });
    }
  }

  if (confidence.ca_escalation_recommended) {
    const id = "ca_escalation";
    if (!isAnswered(answers, id)) {
      questions.push({
        id,
        prompt: "Would you like a CA to review this return before filing?",
        whyWeAsk: confidence.ca_escalation_reasons.join(" · ") ||
          "Complexity flags suggest expert review may help.",
        category: "profile",
        priority: "high",
      });
    }
  }

  return questions;
}

function questionsFromDraftProfile(
  ctx: QuestionEngineContext
): FollowUpQuestion[] {
  const questions: FollowUpQuestion[] = [];
  const { draft, userInput } = ctx;
  const answers = ctx.questionAnswers;

  const isSenior =
    draft.profile.ageBand === "senior" ||
    draft.profile.ageBand === "super_senior";

  if (isSenior && (userInput.other_income?.fd_interest ?? 0) > 0) {
    const id = "senior_80ttb_confirm";
    if (!isAnswered(answers, id)) {
      questions.push({
        id,
        prompt: "Confirm your total savings/FD interest for 80TTB (senior citizens)?",
        whyWeAsk:
          "Section 80TTB allows up to ₹50,000 deduction on interest for seniors — we need the exact figure.",
        category: "deductions",
        priority: "medium",
      });
    }
  }

  const hraReceived = draft.income.hraReceived;
  const rentPaid = draft.income.actualRentPaid;
  if (hraReceived > 0 && rentPaid === 0) {
    const id = "hra_rent_missing";
    if (!isAnswered(answers, id)) {
      questions.push({
        id,
        prompt: "What annual rent did you pay to claim HRA exemption?",
        whyWeAsk:
          "HRA exemption requires actual rent paid — without it we cannot compute the lawful exemption.",
        category: "deductions",
        priority: "high",
      });
    }
  }

  if (
    draft.incomeChips.includes("home_loan") &&
    draft.houseProperty.homeLoanInterest === 0
  ) {
    const id = "home_loan_interest";
    if (!isAnswered(answers, id)) {
      questions.push({
        id,
        prompt: "What is your home loan interest paid this year (Section 24(b))?",
        whyWeAsk:
          "Home loan interest can reduce taxable income — we need the certificate amount.",
        category: "deductions",
        priority: "high",
      });
    }
  }

  const form16Filenames = draft.lastParseResult?.filenames ?? [];
  const multipleForm16 =
    form16Filenames.length > 1 ||
    (draft.lastParseResult?.parsedParts?.length ?? 0) > 1;

  if (multipleForm16) {
    const id = "multiple_form16_reconcile";
    if (!isAnswered(answers, id)) {
      questions.push({
        id,
        prompt: "Did you have more than one employer this year?",
        whyWeAsk:
          "Multiple Form 16s require reconciling salary and TDS across employers to avoid mismatch notices.",
        category: "reconciliation",
        priority: "high",
      });
    }
  }

  const hasAisConnector = draft.connectedConnectors.includes("ais");
  const has26as = draft.connectedConnectors.includes("form26as");
  if (
    (hasAisConnector || has26as) &&
    !draft.mismatchResolved
  ) {
    const id = "ais_mismatch_review";
    if (!isAnswered(answers, id)) {
      questions.push({
        id,
        prompt: "Have you reviewed AIS/26AS entries against your Form 16 and bank interest?",
        whyWeAsk:
          "Unreconciled AIS mismatches are a common cause of ITD notices after filing.",
        category: "reconciliation",
        priority: "high",
      });
    }
  }

  return questions;
}

function questionsFromIncomeChips(
  ctx: QuestionEngineContext
): FollowUpQuestion[] {
  const questions: FollowUpQuestion[] = [];
  const { draft, userInput } = ctx;
  const answers = ctx.questionAnswers;

  for (const chip of draft.incomeChips) {
    if (chip in UNMAPPED_INCOME_CHIPS) {
      const meta = UNMAPPED_INCOME_CHIPS[chip];
      const id = `chip_unmapped_${chip}`;
      if (isAnswered(answers, id)) continue;
      questions.push({
        id,
        prompt: meta.prompt,
        whyWeAsk: meta.whyWeAsk,
        category: "income",
        priority: meta.priority,
      });
      continue;
    }

    const otherKey = CHIP_INCOME_MAP[chip];
    if (otherKey) {
      const value = userInput.other_income?.[otherKey] ?? 0;
      if (value === 0) {
        const id = `chip_zero_${chip}`;
        if (isAnswered(answers, id)) continue;
        questions.push({
          id,
          prompt: `What is your ${chip.replace(/_/g, " ")} amount for this year?`,
          whyWeAsk:
            "You selected this income type but entered ₹0 — confirm or enter the actual amount.",
          category: "income",
          priority: "medium",
        });
      }
    }
  }

  if (
    draft.incomeChips.includes("capital_gains") &&
    !userInput.documents?.has_capital_gains_statement
  ) {
    const id = "cg_statement_missing";
    if (!isAnswered(answers, id)) {
      questions.push({
        id,
        prompt: "Do you have a broker capital-gains statement (CAMS/KARVY)?",
        whyWeAsk:
          "Capital gains need schedule-wise breakup — a broker statement is the standard proof.",
        category: "documents",
        priority: "high",
      });
    }
  }

  return questions;
}

function questionsFromRiskFlags(
  result: ITRResult,
  answers?: Record<string, unknown>
): FollowUpQuestion[] {
  const questions: FollowUpQuestion[] = [];

  for (const flag of result.risk_flags) {
    if (flag.severity === "info") continue;
    const id = `risk_${flag.code}`;
    if (isAnswered(answers, id)) continue;
    questions.push({
      id,
      prompt: `Please confirm: ${flag.message}`,
      whyWeAsk:
        "This risk flag may affect your refund or trigger scrutiny — confirmation helps us advise correctly.",
      category: "reconciliation",
      priority: flag.severity === "error" ? "high" : "medium",
    });
  }

  return questions;
}

const PRIORITY_ORDER: Record<FollowUpPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/** Rule-based CA-style follow-up questions — no LLM required. */
export function generateFollowUpQuestions(
  ctx: QuestionEngineContext
): FollowUpQuestion[] {
  const seen = new Set<string>();
  const merged: FollowUpQuestion[] = [];

  const add = (list: FollowUpQuestion[]) => {
    for (const q of list) {
      if (seen.has(q.id)) continue;
      seen.add(q.id);
      merged.push(q);
    }
  };

  if (ctx.result) {
    add(questionsFromConfidence(ctx.result, ctx.questionAnswers));
    add(questionsFromRiskFlags(ctx.result, ctx.questionAnswers));
  }

  add(questionsFromDraftProfile(ctx));
  add(questionsFromIncomeChips(ctx));
  add(generateDeductionDiscoveryQuestions(ctx));

  return merged.sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );
}
