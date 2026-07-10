/**
 * professionQuestions.ts
 * ======================
 * Profession-specific "Smart CA" questions. A real CA asks different things
 * to a doctor, a lawyer, and a software freelancer. These are deterministic
 * add-ons to the deduction-discovery bank — same rules of the house:
 * lawful-only, proof-required, "up to ₹X" estimates from statutory rates.
 */

import type { DiscoveryQuestion } from "./deductionDiscovery";

export interface ProfessionOption {
  id: string;
  label: string;
  /** 44ADA-listed profession (legal, medical, engineering, accountancy, etc.) */
  is44ada: boolean;
}

export const PROFESSION_OPTIONS: ProfessionOption[] = [
  { id: "doctor", label: "Doctor / medical practice", is44ada: true },
  { id: "lawyer", label: "Lawyer / legal practice", is44ada: true },
  { id: "it_freelancer", label: "Software / IT freelancer", is44ada: true },
  { id: "ca_consultant", label: "CA / finance consultant", is44ada: true },
  { id: "architect_engineer", label: "Architect / engineer", is44ada: true },
  { id: "teacher_tutor", label: "Teacher / tutor / coach", is44ada: false },
  { id: "creator", label: "Content creator / influencer", is44ada: false },
  { id: "trader_shop", label: "Shop / trading business", is44ada: false },
  { id: "gig_driver", label: "Driver / delivery / gig work", is44ada: false },
  { id: "other", label: "Other", is44ada: false },
];

interface ProfessionQuestionSpec {
  id: string;
  prompt: string;
  whyWeAsk: string;
  section: string;
  regimeScope: DiscoveryQuestion["regimeScope"];
  priority: DiscoveryQuestion["priority"];
}

const QUESTION_BANK: Record<string, ProfessionQuestionSpec[]> = {
  doctor: [
    {
      id: "prof_doctor_indemnity",
      prompt:
        "Do you pay professional indemnity insurance for your medical practice?",
      whyWeAsk:
        "Indemnity premium is a full business expense if you file with books (ITR-3). If your clinic costs — rent, staff, equipment, indemnity — cross half your receipts, books beat the 50% presumptive rate.",
      section: "Sec 37",
      regimeScope: "both",
      priority: "medium",
    },
    {
      id: "prof_doctor_equipment",
      prompt:
        "Did you buy medical equipment this year (ultrasound, dental chair, diagnostic machines)?",
      whyWeAsk:
        "Medical equipment gets 15% depreciation every year under Section 32 when you file with books. A ₹10 lakh machine is ₹1.5 lakh off your taxable profit in year one.",
      section: "Sec 32",
      regimeScope: "both",
      priority: "medium",
    },
    {
      id: "prof_doctor_pharmacy",
      prompt:
        "Do you also sell medicines or run a pharmacy alongside consultations?",
      whyWeAsk:
        "Pharmacy sales are business income (44AD at 6-8%), while consultation fees are professional income (44ADA at 50%). Splitting them correctly usually lowers your total tax.",
      section: "44AD/44ADA",
      regimeScope: "both",
      priority: "high",
    },
  ],
  lawyer: [
    {
      id: "prof_lawyer_chamber",
      prompt:
        "Do you pay chamber rent, clerk salary, or fees to junior advocates?",
      whyWeAsk:
        "These are full business expenses with books (ITR-3). If your real costs cross half your receipts, books beat the 50% presumptive rate under 44ADA.",
      section: "Sec 37",
      regimeScope: "both",
      priority: "medium",
    },
    {
      id: "prof_lawyer_barfees",
      prompt:
        "Did you pay bar council fees, law-library subscriptions, or buy legal books?",
      whyWeAsk:
        "Professional fees and reference material are deductible business expenses when you file with books. Keep the receipts — they add up.",
      section: "Sec 37",
      regimeScope: "both",
      priority: "low",
    },
  ],
  it_freelancer: [
    {
      id: "prof_it_equipment",
      prompt:
        "Did you buy a laptop, monitor, or other work equipment this year?",
      whyWeAsk:
        "Computers depreciate at 40% under Section 32 with books — a ₹1.5 lakh laptop is ₹60,000 off your taxable profit in year one. Under 44ADA presumptive, expenses are already assumed, so this matters if you compare books.",
      section: "Sec 32",
      regimeScope: "both",
      priority: "medium",
    },
    {
      id: "prof_it_foreign_clients",
      prompt: "Do foreign clients pay you (Upwork, direct transfers, PayPal)?",
      whyWeAsk:
        "Foreign receipts are fully taxable in India, and AIS often shows them via banking channels. Declaring them correctly avoids a mismatch notice — and export of services has no extra income tax.",
      section: "AIS match",
      regimeScope: "both",
      priority: "high",
    },
    {
      id: "prof_it_home_office",
      prompt:
        "Do you work from home and pay for internet, electricity, or a co-working desk?",
      whyWeAsk:
        "A fair share of these is deductible with books (ITR-3). If your total real expenses cross half your receipts, books beat 44ADA presumptive.",
      section: "Sec 37",
      regimeScope: "both",
      priority: "low",
    },
  ],
  ca_consultant: [
    {
      id: "prof_ca_membership",
      prompt:
        "Did you pay institute membership fees, licence renewals, or professional software subscriptions?",
      whyWeAsk:
        "Membership and practice software are deductible business expenses with books. If total costs cross half your receipts, books beat 44ADA presumptive.",
      section: "Sec 37",
      regimeScope: "both",
      priority: "low",
    },
  ],
  architect_engineer: [
    {
      id: "prof_arch_software",
      prompt:
        "Do you pay for design software (AutoCAD, Revit), site travel, or drafting staff?",
      whyWeAsk:
        "These are full business expenses with books (ITR-3). If they cross half your receipts, books beat the 50% presumptive rate.",
      section: "Sec 37",
      regimeScope: "both",
      priority: "medium",
    },
  ],
  teacher_tutor: [
    {
      id: "prof_teacher_44ada",
      prompt:
        "Is your tuition income from your own coaching (not a salary from a school)?",
      whyWeAsk:
        "Own coaching income can use presumptive tax — often just 6-8% of receipts deemed as profit under 44AD if it is run as a business. We route the lower lawful option for you.",
      section: "44AD",
      regimeScope: "both",
      priority: "high",
    },
  ],
  creator: [
    {
      id: "prof_creator_equipment",
      prompt:
        "Did you buy a camera, mic, lighting, or editing gear this year?",
      whyWeAsk:
        "Creator equipment depreciates under Section 32 with books. Editing subscriptions and studio rent are expenses too — if they cross half your receipts, books beat presumptive.",
      section: "Sec 32/37",
      regimeScope: "both",
      priority: "medium",
    },
    {
      id: "prof_creator_gifts",
      prompt:
        "Did brands send you products or pay you in kind (barter collabs)?",
      whyWeAsk:
        "Freebies above ₹20,000 attract TDS under Section 194R and count as income. AIS usually shows them — declaring correctly avoids a notice.",
      section: "194R",
      regimeScope: "both",
      priority: "high",
    },
  ],
  trader_shop: [
    {
      id: "prof_shop_digital",
      prompt:
        "What share of your shop's sales come through UPI, card, or bank transfer?",
      whyWeAsk:
        "Digital sales are deemed at 6% profit instead of 8% under Section 44AD — on ₹50 lakh turnover that is ₹1 lakh less deemed income.",
      section: "44AD",
      regimeScope: "both",
      priority: "high",
    },
  ],
  gig_driver: [
    {
      id: "prof_gig_tds",
      prompt:
        "Did the platform (Ola, Uber, Swiggy, Zomato, urban services) deduct TDS from your payouts?",
      whyWeAsk:
        "Platforms deduct TDS under 194C/194-O — it shows in your Form 26AS and is refundable if your total tax is lower. Many gig workers leave this refund unclaimed.",
      section: "26AS TDS",
      regimeScope: "both",
      priority: "high",
    },
    {
      id: "prof_gig_vehicle",
      prompt: "Do you own the vehicle you drive for work?",
      whyWeAsk:
        "With books, vehicle depreciation (15%) plus fuel and maintenance are deductible. With presumptive 44AD, only 6-8% of receipts is deemed profit — we compare both for you.",
      section: "Sec 32/44AD",
      regimeScope: "both",
      priority: "medium",
    },
  ],
};

/** For salaried users with no business chips: the side-income opener. */
const SIDE_INCOME_QUESTION: ProfessionQuestionSpec = {
  id: "prof_side_income",
  prompt:
    "Did you earn anything outside salary this year — weekend consulting, tuition, YouTube, rent from equipment, referral bonuses?",
  whyWeAsk:
    "Side income is common and easy to file: most of it qualifies for presumptive tax where only 6-50% of receipts is deemed profit. Declaring it also matches your AIS and avoids notices. Tell us and we set it up in two questions.",
  section: "44AD/44ADA",
  regimeScope: "both",
  priority: "medium",
};

function isAnswered(
  answers: Record<string, unknown> | undefined,
  id: string
): boolean {
  if (!answers) return false;
  return Object.prototype.hasOwnProperty.call(answers, id);
}

/**
 * Profession-specific questions for the SmartSavingsFinder.
 * Deterministic; savings marked 0 (not quantifiable without receipts).
 */
export function generateProfessionQuestions(input: {
  profession: string | null | undefined;
  incomeChips: readonly string[];
  questionAnswers?: Record<string, unknown>;
}): DiscoveryQuestion[] {
  const { profession, incomeChips, questionAnswers } = input;
  const chips = new Set(incomeChips);
  const hasBusiness =
    chips.has("freelance") ||
    chips.has("business_presumptive") ||
    chips.has("fno");

  const out: DiscoveryQuestion[] = [];

  const pushSpec = (spec: ProfessionQuestionSpec) => {
    if (isAnswered(questionAnswers, spec.id)) return;
    out.push({
      id: spec.id,
      prompt: spec.prompt,
      whyWeAsk: spec.whyWeAsk,
      category: "deductions",
      priority: spec.priority,
      estimatedSaving: 0,
      section: spec.section,
      regimeScope: spec.regimeScope,
    });
  };

  // Salaried-only users get the side-income opener (the "what else could
  // you be earning" question a smart CA always asks).
  if (!hasBusiness && chips.has("salary")) {
    pushSpec(SIDE_INCOME_QUESTION);
    return out;
  }

  if (hasBusiness && profession && QUESTION_BANK[profession]) {
    for (const spec of QUESTION_BANK[profession]) pushSpec(spec);
  }

  return out;
}
