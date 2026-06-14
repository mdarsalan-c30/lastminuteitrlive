export interface FaqItem {
  question: string;
  answer: string;
}

export const LANDING_FAQS: FaqItem[] = [
  {
    question: "Do you file my return for me?",
    answer:
      "No. We prepare your numbers and guide you screen-by-screen on incometax.gov.in. You review, submit, and e-verify yourself.",
  },
  {
    question: "Is this safe and lawful?",
    answer:
      "Yes — we only suggest eligible deductions and lawful tax saving based on what you enter and upload. Inflated claims are not allowed.",
  },
  {
    question: "What documents do I need?",
    answer:
      "At minimum Form 16 for salaried income. AIS / Form 26AS help catch TDS mismatches before you file. Add broker statements if you have capital gains.",
  },
  {
    question: "Old regime or new — which is better?",
    answer:
      "It depends on your deductions and income mix. We compare both using your draft and recommend one — you choose before filing.",
  },
  {
    question: "What do I pay for?",
    answer:
      "Free tier gives estimates and checklists. Paid plans unlock your personalized incometax.gov.in filing guide with copy-ready values.",
  },
  {
    question: "Are you affiliated with the Income Tax Department?",
    answer:
      "No. LastMinute ITR is independently operated. We are not a government partner or official ITD service.",
  },
  {
    question: "Will I get a guaranteed refund?",
    answer:
      "No one can guarantee a refund. We estimate tax and refund based on your inputs — ITD confirms the final amount after processing.",
  },
  {
    question: "What happens after I pay?",
    answer:
      "Your portal companion unlocks with step-by-step fields mapped to incometax.gov.in. Copy each value, review, and submit on the portal yourself.",
  },
  {
    question: "What is AIS and why does it matter?",
    answer:
      "The Annual Information Statement lists income and TDS reported to the ITD. If AIS shows bank interest or TDS your Form 16 missed, fix it before filing or you may get a notice.",
  },
  {
    question: "Can I file with two Form 16s after changing jobs?",
    answer:
      "Yes — combine salary and TDS from every employer. Upload each Form 16 or enter totals manually, then reconcile against AIS.",
  },
  {
    question: "Do you support capital gains or F&O trading?",
    answer:
      "We flag when you likely need ITR-2 or professional help. Broker import is limited today — complex trading schedules need a CA.",
  },
  {
    question: "How long does e-verification take?",
    answer:
      "Aadhaar OTP on incometax.gov.in is usually instant. You must e-verify within 30 days of submitting — otherwise the return is invalid.",
  },
  {
    question: "Is my PAN stored on your servers?",
    answer:
      "We minimize sensitive data. Documents you upload are used for prep only — you enter PAN on the government portal yourself when filing.",
  },
  {
    question: "What if I miss the July deadline?",
    answer:
      "Belated returns may be allowed with late fees per ITD rules. Check official notifications on incometax.gov.in for the current AY.",
  },
  {
    question: "Can you import from Zerodha or Groww?",
    answer:
      "Groww and broker connectors are on our roadmap. Today, upload capital-gains statements manually or use a CA for trading returns.",
  },
  {
    question: "What's the difference between estimate and exact mode?",
    answer:
      "Estimate mode gives quick numbers with partial documents. Exact mode requires full docs and resolved mismatches before we mark you filing-ready.",
  },
  {
    question: "Do you help with GST or TDS returns?",
    answer:
      "No — LastMinute ITR focuses on individual income tax prep for portal filing. GST and TDS compliance need separate tools.",
  },
  {
    question: "Where can I get step-by-step help?",
    answer:
      "Browse our Help center at /help for Prep, Reconcile, Regime, and E-verify articles, or use the in-app companion after payment.",
  },
  {
    question: "Which ITR form should I use?",
    answer:
      "Most salaried employees with simple interest use ITR-1. Capital gains, multiple properties, or foreign income usually need ITR-2 or expert help — try our free quiz at /tools.",
  },
];

export const HELP_FAQS: FaqItem[] = [
  {
    question: "How is the Help center organized?",
    answer:
      "Articles follow your companion journey: Prep (documents), Reconcile (AIS/Form 16), Regime, File on portal, and E-verify — not an e-file Save/Pay/File taxonomy.",
  },
  {
    question: "Can LastMinute file my return?",
    answer:
      "No. Help articles explain how to file on incometax.gov.in yourself. We prepare numbers and guide each screen.",
  },
  {
    question: "Where is the ITR form quiz?",
    answer:
      "Visit /tools for a rule-based ITR-1 vs ITR-2 suggestion. It is not a substitute for professional advice on complex cases.",
  },
];

export const HERO_FAQS: FaqItem[] = LANDING_FAQS.slice(0, 4);
