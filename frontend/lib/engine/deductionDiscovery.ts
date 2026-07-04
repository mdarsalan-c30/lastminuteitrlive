/**
 * deductionDiscovery.ts
 * =====================
 * The "personal CA" question policy: looks at what the user has already
 * told us and asks only the questions that could lawfully increase their
 * refund — each with a deterministic "up to ₹X" saving estimate.
 *
 * Rules of the house (doc 50 §4):
 *  - Deterministic. No LLM. Every saving figure comes from engine constants.
 *  - Ask only when the fact is UNKNOWN (zero + never confirmed), never when
 *    the user already answered.
 *  - Money first: every question says what it is worth before why we ask.
 *  - Never suggest anything without proof requirements (lawful-only).
 */

import type {
  FollowUpQuestion,
  QuestionEngineContext,
} from "./questionEngine";
import type { ITRResult } from "./types";

// ── Statutory caps (mirror backend/engine/deductions.py) ──
const CAP_80C = 150_000;
const CAP_80CCD_1B = 50_000;
const CAP_80D_SELF = 25_000;
const CAP_80D_SELF_SENIOR = 50_000;
const CAP_80D_PARENTS = 25_000;
const CAP_80D_PARENTS_SENIOR = 50_000;
const CAP_80GG_ANNUAL = 60_000;
const CAP_80TTA = 10_000;
const CAP_80TTB = 50_000;
const RATE_80CCD2_NEW = 0.14;
const CESS = 1.04;
// 44AD digital rate advantage: 8% deemed → 6% deemed on digital receipts
const RATE_44AD_DIGITAL_ADVANTAGE = 0.02;

export interface DiscoveryQuestion extends FollowUpQuestion {
  /** Deterministic "up to" saving estimate in ₹ (0 = not quantifiable). */
  estimatedSaving: number;
  /** Statutory anchor shown to the user. */
  section: string;
  /** Whether the deduction survives in the new regime. */
  regimeScope: "old_only" | "both";
}

/**
 * Marginal-rate estimate for "up to ₹X" savings.
 * Uses old-regime taxable income when available (Chapter VI-A deductions
 * apply in the old regime), otherwise falls back to a draft-based band.
 * Includes 4% cess. This is an estimate label, never a promise.
 */
export function estimateMarginalRate(
  result: ITRResult | null | undefined,
  grossIncomeFallback: number
): number {
  const taxable =
    result?.regime_comparison?.old?.taxable_income ?? grossIncomeFallback;
  let slabRate: number;
  if (taxable <= 250_000) slabRate = 0;
  else if (taxable <= 500_000) slabRate = 0.05;
  else if (taxable <= 1_000_000) slabRate = 0.2;
  else slabRate = 0.3;
  return slabRate * CESS;
}

function priorityFor(saving: number): FollowUpQuestion["priority"] {
  if (saving >= 10_000) return "high";
  if (saving >= 2_000) return "medium";
  return "low";
}

function isAnswered(
  answers: Record<string, unknown> | undefined,
  id: string
): boolean {
  if (!answers) return false;
  return Object.prototype.hasOwnProperty.call(answers, id);
}

/**
 * Generates lawful deduction-discovery questions, highest saving first.
 */
export function generateDeductionDiscoveryQuestions(
  ctx: QuestionEngineContext
): DiscoveryQuestion[] {
  const { userInput, draft, result } = ctx;
  const answers = ctx.questionAnswers;
  const d = userInput.deductions ?? {};
  const s = userInput.salary;
  const biz = userInput.business ?? {};
  const other = userInput.other_income ?? {};

  const isSenior =
    draft.profile.ageBand === "senior" ||
    draft.profile.ageBand === "super_senior";
  const rate = estimateMarginalRate(result, s?.gross_salary ?? 0);
  const questions: DiscoveryQuestion[] = [];

  const push = (
    id: string,
    prompt: string,
    whyWeAsk: string,
    section: string,
    saving: number,
    regimeScope: DiscoveryQuestion["regimeScope"]
  ) => {
    if (isAnswered(answers, id)) return;
    questions.push({
      id,
      prompt,
      whyWeAsk,
      category: "deductions",
      priority: priorityFor(saving),
      estimatedSaving: Math.round(saving),
      section,
      regimeScope,
    });
  };

  // ── 80C pool ──
  const pool80c =
    (d.epf ?? 0) + (d.ppf ?? 0) + (d.elss ?? 0) + (d.lic_premium ?? 0) +
    (d.nsc ?? 0) + (d.home_loan_principal ?? 0) + (d.tuition_fees ?? 0) +
    (d.other_80c ?? 0);
  const headroom80c = Math.max(0, CAP_80C - pool80c);
  if (headroom80c > 0) {
    push(
      "disc_80c",
      "Did you pay LIC premium, PPF, ELSS, EPF, or children's school tuition this year?",
      `These count under Section 80C (₹1.5 lakh limit). You have ₹${headroom80c.toLocaleString("en-IN")} of the limit unused — worth up to ₹${Math.round(headroom80c * rate).toLocaleString("en-IN")} in tax if you have receipts.`,
      "80C",
      headroom80c * rate,
      "old_only"
    );
  }

  // ── 80D health insurance — self ──
  const selfCap = isSenior ? CAP_80D_SELF_SENIOR : CAP_80D_SELF;
  if ((d.health_insurance_self ?? 0) === 0) {
    push(
      "disc_80d_self",
      "Do you pay a health insurance premium for yourself or your family?",
      `Premiums up to ₹${selfCap.toLocaleString("en-IN")} are deductible under Section 80D — worth up to ₹${Math.round(selfCap * rate).toLocaleString("en-IN")}. A policy receipt is enough proof.`,
      "80D",
      selfCap * rate,
      "old_only"
    );
  }

  // ── 80D health insurance — parents ──
  if ((d.health_insurance_parents ?? 0) === 0) {
    const parentCap = d.parents_senior ? CAP_80D_PARENTS_SENIOR : CAP_80D_PARENTS;
    push(
      "disc_80d_parents",
      "Do you pay health insurance for your parents?",
      `A separate Section 80D limit applies for parents — up to ₹${CAP_80D_PARENTS_SENIOR.toLocaleString("en-IN")} if they are senior citizens. Worth up to ₹${Math.round(parentCap * rate).toLocaleString("en-IN")}.`,
      "80D",
      parentCap * rate,
      "old_only"
    );
  }

  // ── 80CCD(1B) extra NPS ──
  const npsHeadroom = Math.max(0, CAP_80CCD_1B - (d.nps_self ?? 0));
  if (npsHeadroom > 0) {
    push(
      "disc_nps_1b",
      "Did you put money into NPS from your own pocket this year?",
      `Self NPS contributions get an extra ₹50,000 deduction under Section 80CCD(1B) — over and above the 80C limit. Worth up to ₹${Math.round(npsHeadroom * rate).toLocaleString("en-IN")}.`,
      "80CCD(1B)",
      npsHeadroom * rate,
      "old_only"
    );
  }

  // ── 80CCD(2) employer NPS — works in BOTH regimes ──
  if ((s?.employer_nps_contribution ?? 0) === 0 && (s?.gross_salary ?? 0) > 0) {
    const basic = s?.basic_salary ?? 0;
    const potential = basic * RATE_80CCD2_NEW;
    push(
      "disc_80ccd2",
      "Does your employer contribute to NPS on your behalf? (Check your Form 16 or salary slip.)",
      `Employer NPS is deductible in BOTH regimes — up to 14% of basic salary in the new regime. For your salary that could be worth up to ₹${Math.round(potential * rate).toLocaleString("en-IN")}.`,
      "80CCD(2)",
      potential * rate,
      "both"
    );
  }

  // ── Rent without HRA → 80GG ──
  const hraReceived = draft.income.hraReceived;
  const rentKnown = draft.income.actualRentPaid > 0 || (d.rent_paid_no_hra ?? 0) > 0;
  if (hraReceived === 0 && !rentKnown) {
    push(
      "disc_rent_80gg",
      "Do you live in a rented house?",
      `Even without HRA in your salary, rent can be deductible under Section 80GG — up to ₹60,000 a year. Worth up to ₹${Math.round(CAP_80GG_ANNUAL * rate).toLocaleString("en-IN")}. Needs rent receipts and Form 10BA.`,
      "80GG",
      CAP_80GG_ANNUAL * rate,
      "old_only"
    );
  }

  // ── Home loan principal → 80C (only if interest is known but principal isn't) ──
  if (
    draft.houseProperty.homeLoanInterest > 0 &&
    (d.home_loan_principal ?? 0) === 0 &&
    headroom80c > 0
  ) {
    push(
      "disc_home_loan_principal",
      "Your home loan certificate also shows a principal repayment — how much was it?",
      `Principal repayment counts toward your Section 80C limit. With ₹${headroom80c.toLocaleString("en-IN")} of the limit unused, this is often free money people miss.`,
      "80C",
      Math.min(headroom80c, 100_000) * rate,
      "old_only"
    );
  }

  // ── 80E education loan ──
  if ((d.education_loan_interest ?? 0) === 0) {
    push(
      "disc_80e",
      "Are you repaying an education loan for yourself, your spouse, or your children?",
      "The full interest on an education loan is deductible under Section 80E — no upper limit, for the first 8 years of repayment.",
      "80E",
      0,
      "old_only"
    );
  }

  // ── Savings interest → 80TTA / 80TTB + reconciliation safety ──
  if ((other.savings_account_interest ?? 0) === 0) {
    const cap = isSenior ? CAP_80TTB : CAP_80TTA;
    const section = isSenior ? "80TTB" : "80TTA";
    push(
      "disc_savings_interest",
      "How much interest did your savings account earn this year? (It's in your bank statement or AIS.)",
      `Two reasons: interest up to ₹${cap.toLocaleString("en-IN")} is deductible under Section ${section}, and declaring it prevents an AIS mismatch notice later.`,
      section,
      cap * rate,
      "old_only"
    );
  }

  // ── Donations 80G ──
  if ((d.donations_100pct ?? 0) === 0 && (d.donations_50pct ?? 0) === 0) {
    push(
      "disc_80g",
      "Did you donate to a registered charity, relief fund, or temple trust with an 80G receipt?",
      "Donations with an 80G receipt are 50% or 100% deductible. The receipt must show the organisation's 80G registration number.",
      "80G",
      0,
      "old_only"
    );
  }

  // ── 44AD digital receipts — 6% vs 8% deemed income ──
  if (
    biz.business_type === "presumptive_business" &&
    (biz.turnover ?? 0) > 0 &&
    (biz.digital_turnover_pct ?? 0) === 0
  ) {
    const turnover = biz.turnover ?? 0;
    const saving = turnover * RATE_44AD_DIGITAL_ADVANTAGE * rate;
    push(
      "disc_digital_receipts",
      "What share of your business receipts came through bank, UPI, or card (not cash)?",
      `Digital receipts are deemed at 6% profit instead of 8% under Section 44AD. On your turnover that difference is worth up to ₹${Math.round(saving).toLocaleString("en-IN")}.`,
      "44AD",
      saving,
      "both"
    );
  }

  // ── 44ADA vs books ──
  if (
    biz.business_type === "presumptive_profession" &&
    (biz.gross_professional_receipts ?? 0) > 0
  ) {
    push(
      "disc_books_vs_presumptive",
      "Were your actual work expenses (rent, equipment, staff, software) more than half of what you earned?",
      "Presumptive tax assumes 50% profit. If your real expenses are higher, filing ITR-3 with books can lawfully lower your tax — we can compare both for you.",
      "44ADA",
      0,
      "both"
    );
  }

  // ── Brought-forward losses (Schedule CFL) — often the biggest refund lever ──
  const cf = userInput.carry_forward ?? {};
  const hasBf =
    (cf.hp_loss ?? 0) > 0 ||
    (cf.stcl ?? 0) > 0 ||
    (cf.ltcl ?? 0) > 0 ||
    (cf.business_loss ?? 0) > 0 ||
    (cf.unabsorbed_depreciation ?? 0) > 0;
  const hasCgChip = draft.incomeChips.includes("capital_gains");
  const hasHp =
    draft.houseProperty.propertyType !== "none" ||
    (draft.extraProperties?.length ?? 0) > 0;
  const hasBooks = biz.business_type === "regular_books";
  if (!hasBf && (hasCgChip || hasHp || hasBooks || draft.incomeChips.includes("business_presumptive"))) {
    // Estimate: a typical unused STCL of ₹1L at the user's marginal rate
    // (or special CG rate). Label is "up to" — not a promise.
    const illustrative = 100_000 * Math.max(rate, 0.125 * 1.04);
    push(
      "disc_bf_losses",
      "Did last year's ITR show any losses you could not use (capital loss, house-property loss, or business loss)?",
      `Those losses carry forward for up to 8 years and can cut this year's tax. Check Schedule CFL in last year's ITR acknowledgment — even ₹1 lakh of unused capital loss can save up to ₹${Math.round(illustrative).toLocaleString("en-IN")}.`,
      "CFL/BFLA",
      illustrative,
      "both"
    );
  }

  // ── Second house property ──
  if (
    draft.houseProperty.propertyType !== "none" &&
    (draft.extraProperties?.length ?? 0) === 0
  ) {
    push(
      "disc_second_property",
      "Do you own another house or flat (even if it is vacant or co-owned)?",
      "A second property changes your ITR form and how interest and rent are taxed. Up to two self-occupied homes can claim interest (combined ₹2 lakh cap in the old regime). We will add a simple second-property card — no complex forms.",
      "Sec 23/24",
      0,
      "both"
    );
  }

  // ── Depreciation for books cases ──
  if (
    hasBooks &&
    (biz.depreciation_blocks?.length ?? 0) === 0 &&
    ((biz.actual_gross_receipts ?? 0) > 0 || (draft.income.businessRevenue ?? 0) > 0)
  ) {
    // Illustrative: 15% on ₹5L plant block
    const illustrativeDep = 500_000 * 0.15 * rate;
    push(
      "disc_depreciation",
      "Do you own business assets (laptop, equipment, furniture, vehicle) bought for your work?",
      `Books cases can claim depreciation under Section 32 — computers at 40%, plant at 15%, furniture at 10%. On a typical ₹5 lakh equipment block that is worth up to ₹${Math.round(illustrativeDep).toLocaleString("en-IN")}. Enter the opening written-down value from last year's depreciation schedule.`,
      "Sec 32",
      illustrativeDep,
      "both"
    );
  }

  // ── Sec 80 gate — confirm loss-year return was on time ──
  if (hasBf) {
    push(
      "disc_bf_sec80",
      "Was last year's return filed on or before the due date?",
      "Capital and business losses can only be carried forward if that year's return was filed on time (Section 80). House-property loss and unabsorbed depreciation are still allowed even if it was late.",
      "Sec 80",
      0,
      "both"
    );
  }

  return questions.sort((a, b) => b.estimatedSaving - a.estimatedSaving);
}
