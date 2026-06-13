/** Phase 6 — landing engagement hooks (static + interactive copy). */

export const ITR_MISTAKES = {
  eyebrow: "Common mistakes",
  headline: "Are you making these ITR mistakes?",
  subhead: "Most last-minute notices come from fixable gaps — not complex tax law.",
  items: [
    {
      mistake: "Filing with only the latest Form 16 after a job change",
      learnHref: "/learn/two-form-16-job-change",
      learnLabel: "Two Form 16s guide",
    },
    {
      mistake: "Ignoring AIS interest or TDS lines not in Form 16",
      learnHref: "/learn/ais-mismatch",
      learnLabel: "AIS mismatch guide",
    },
    {
      mistake: "Picking old vs new regime without comparing your numbers",
      learnHref: "/learn/old-vs-new-regime",
      learnLabel: "Regime comparison",
    },
    {
      mistake: "Claiming 80C or HRA without matching proof",
      learnHref: "/learn/80c-deduction-guide",
      learnLabel: "80C deduction guide",
    },
    {
      mistake: "Choosing the wrong ITR form for your income mix",
      learnHref: "/learn/itr-1-salaried-guide",
      learnLabel: "ITR-1 eligibility",
    },
    {
      mistake: "Submitting on the portal but skipping e-verification",
      learnHref: "/learn/last-minute-filing",
      learnLabel: "Last-minute checklist",
    },
  ],
} as const;

export const NEED_CA = {
  eyebrow: "Honest scope",
  headline: "Do you really need a CA?",
  simpleCases: {
    title: "You can likely self-file with our guide",
    items: [
      "Single or dual Form 16 salaried income",
      "Bank FD interest and standard 80C / 80D",
      "One rented home or simple HRA claim",
      "No capital gains, F&O, or foreign income",
    ],
  },
  complexCases: {
    title: "A tax professional is usually worth it",
    items: [
      "Business books, audit, or presumptive beyond simple salary",
      "Capital gains, crypto, or F&O trading schedules",
      "Foreign income, assets, or director returns",
      "Income above ₹50 lakh or litigation history",
    ],
  },
  footnote:
    "CA Review is launching soon — optional human review before you file on incometax.gov.in. We never file or submit on your behalf.",
} as const;

export const SCENARIO_HOOKS = [
  {
    id: "job-change",
    title: "Changed jobs this year?",
    detail: "Combine both Form 16s and reconcile total TDS before you upload.",
    href: "/learn/two-form-16-job-change",
    cta: "Two Form 16s guide",
  },
  {
    id: "parents",
    title: "Filing for your parents?",
    detail: "Pension, FD interest, and 80D — simple walkthrough, proof-based claims only.",
      href: "/learn/senior-citizen-80ttb",
    cta: "Senior citizen guide",
  },
  {
    id: "refund",
    title: "Refund anxiety?",
    detail: "We estimate refund or tax due from your inputs — ITD decides the final amount. No guaranteed refund.",
      href: "/learn/itr-refund-status",
    cta: "Refund status guide",
  },
  {
    id: "ais-mismatch",
    title: "AIS and Form 16 don't match?",
    detail: "Fix TDS and income gaps before portal upload — not after a notice.",
    href: "/learn/ais-mismatch",
    cta: "AIS mismatch guide",
  },
] as const;

export const LAST_MINUTE_CHECKLIST = {
  eyebrow: "Deadline ready",
  headline: "Last-minute filing checklist",
  subhead: "Seven steps in order — completeness beats perfection when the clock is ticking.",
  items: [
    "Download Form 16 Part A + B from every employer",
    "Download AIS and circle lines not in your draft",
    "Compare old vs new regime with your actual numbers",
    "Pay any balance tax before submitting on the portal",
    "Pick the correct ITR form (ITR-1, ITR-2, or escalate)",
    "Copy verified figures to incometax.gov.in and submit",
    "E-verify within 30 days — unverified returns are invalid",
  ],
  cta: { label: "Start your checklist", href: "/file" },
} as const;

export const POST_PAYMENT = {
  eyebrow: "After payment",
  headline: "What happens after you pay",
  steps: [
    {
      title: "Portal guide unlocks",
      detail: "Your step-by-step incometax.gov.in companion opens with copy-ready field values.",
    },
    {
      title: "You stay on the government portal",
      detail: "We map each field — you paste, review, and click submit yourself.",
    },
    {
      title: "E-verify on incometax.gov.in",
      detail: "Aadhaar OTP, net banking, or other ITD options — within 30 days of filing.",
    },
    {
      title: "Refund or demand follows ITD rules",
      detail: "Figures are estimates until CPC processes your return. No guaranteed refund.",
    },
  ],
} as const;

export const PORTAL_FILING = {
  eyebrow: "On the portal",
  headline: "What happens on incometax.gov.in",
  subhead: "You control every click — we prepare the numbers and the order.",
  steps: [
    { step: "1", title: "Login & pick ITR form", detail: "ITR-1 for simple salary, ITR-2 for capital gains, and so on." },
    { step: "2", title: "Prefill & verify income", detail: "Cross-check AIS prefill against your Form 16 and bank interest." },
    { step: "3", title: "Deductions & regime", detail: "Enter only proof-backed claims; confirm old or new regime." },
    { step: "4", title: "Tax paid & bank details", detail: "Match TDS totals; add refund bank account if applicable." },
    { step: "5", title: "Submit & e-verify", detail: "Download acknowledgement (ITR-V) only if needed; e-verify to complete." },
  ],
} as const;

export const FORM16_QUICK = {
  headline: "Do you have Form 16?",
  subhead: "Your employer's salary certificate is the fastest starting point.",
  yes: {
    label: "Yes — upload Form 16",
    href: "/file/import/documents?source=form16",
    detail: "We parse Part A + B and pre-fill salary and TDS.",
  },
  no: {
    label: "No — enter income manually",
    href: "/file/income",
    detail: "Add gross salary, TDS, and other income line by line.",
  },
  regimeHint: "Not sure about old vs new? Compare regimes in the hero card above.",
  regimeAnchor: "#regime-compare",
} as const;

export const READINESS_CHECKLIST = {
  headline: "ITR readiness checklist",
  subhead: "Tick off what you have ready — client-side only, nothing is saved.",
  items: [
    { id: "pan", label: "PAN and Aadhaar linked for e-verify" },
    { id: "form16", label: "Form 16 from every employer this year" },
    { id: "ais", label: "AIS downloaded from incometax.gov.in" },
    { id: "bank", label: "Bank account for refund (if expecting one)" },
    { id: "deductions", label: "Proof for 80C, 80D, HRA (if claiming in old regime)" },
    { id: "regime", label: "Rough idea of old vs new regime preference" },
    { id: "balance", label: "Funds ready if tax is payable after TDS" },
  ],
} as const;

export const ITR_TYPE_QUIZ = {
  headline: "Find my ITR type",
  subhead: "Five quick questions — rule-based suggestion, not AI analysis.",
  questions: [
    {
      id: "income",
      prompt: "What income do you have?",
      options: [
        { value: "salary_only", label: "Salary only (+ bank interest)" },
        { value: "capital_gains", label: "Salary + capital gains / MF / shares" },
        { value: "business", label: "Business / professional income" },
        { value: "foreign", label: "Foreign income or assets abroad" },
      ],
    },
    {
      id: "employers",
      prompt: "How many employers this year?",
      options: [
        { value: "one", label: "One employer" },
        { value: "two", label: "Two (job change)" },
        { value: "three_plus", label: "Three or more" },
      ],
    },
    {
      id: "property",
      prompt: "House property situation?",
      options: [
        { value: "none", label: "No owned/rented property income" },
        { value: "one", label: "One self-occupied or let-out property" },
        { value: "multiple", label: "Multiple properties or complex let-out" },
      ],
    },
    {
      id: "income_level",
      prompt: "Total income roughly above ₹50 lakh?",
      options: [
        { value: "no", label: "No — under ₹50L" },
        { value: "yes", label: "Yes — above ₹50L" },
      ],
    },
    {
      id: "residency",
      prompt: "Residential status?",
      options: [
        { value: "resident", label: "Resident Indian" },
        { value: "nri", label: "NRI / RNOR" },
      ],
    },
  ],
  results: {
    itr1: {
      form: "ITR-1 (Sahaj)",
      summary: "Simple salaried return — salary, one house, and standard deductions.",
      href: "/file",
    },
    itr2: {
      form: "ITR-2",
      summary: "Capital gains, multiple properties, or income mix beyond Sahaj limits.",
      href: "/file",
    },
    talkToCa: {
      form: "Talk to a CA",
      summary: "Business income, foreign assets, very high income, or NRI status usually needs professional help.",
      href: "/file/onboarding/eligibility",
    },
  },
} as const;

export type ItrQuizAnswers = {
  income: string;
  employers: string;
  property: string;
  income_level: string;
  residency: string;
};

export function suggestItrType(answers: ItrQuizAnswers): "itr1" | "itr2" | "talkToCa" {
  if (
    answers.income === "business" ||
    answers.income === "foreign" ||
    answers.residency === "nri" ||
    answers.income_level === "yes" ||
    answers.property === "multiple"
  ) {
    return "talkToCa";
  }
  if (answers.income === "capital_gains") {
    return "itr2";
  }
  if (answers.employers === "three_plus") {
    return "itr2";
  }
  if (answers.property === "one" && answers.income === "salary_only") {
    return "itr1";
  }
  return "itr1";
}

export const LAST_MINUTE_BANNER = {
  beforeDeadline: "ITR due {deadline} for {assessmentYear} — start with Form 16 + AIS, then file on incometax.gov.in yourself.",
  onDeadlineDay: "Due today ({deadline}) — import documents, fix mismatches, and submit on the portal before midnight IST.",
  afterDeadline: "Original due date ({deadline}) has passed — belated filing may still be possible with late fee. Check official ITD notifications.",
  cta: { label: "Start filing prep", href: "/file" },
} as const;
