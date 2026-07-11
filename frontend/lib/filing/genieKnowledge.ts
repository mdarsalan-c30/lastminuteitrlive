/**
 * Single source of truth for Genie field tips, step guidance, and instant Q&A.
 * Plain English + bullet points for non-finance users.
 */

export interface FieldGuidance {
  title: string;
  tip: string;
  impact: string;
  hasCalculator?: "hra" | "section80c" | "nps";
}

export const FIELD_GUIDANCE: Record<string, FieldGuidance> = {
  employer: {
    title: "Employer Name",
    tip: "Enter the legal name on your Form 16. It should match your employer's TAN in Form 26AS.",
    impact: "Wrong employer name can cause TDS mapping issues on the portal.",
  },
  gross_salary: {
    title: "Gross Salary (Section 17(1))",
    tip: "This is your total salary before exemptions — Box 17(1) on Form 16 Part B.",
    impact: "This is the base for almost all salary tax calculations.",
    hasCalculator: undefined,
  },
  tds: {
    title: "Tax Deducted (TDS)",
    tip: "Total tax already cut by your employer. Match Form 16 Part A and Form 26AS.",
    impact: "Higher TDS means lower tax to pay at filing; mismatches trigger notices.",
  },
  section80c: {
    title: "Section 80C",
    tip: "Combine EPF, PPF, ELSS, LIC, tuition fees, home loan principal — max ₹1.5 lakh.",
    impact: "Saves up to ~₹46,800 tax at 30% slab under Old Regime only.",
    hasCalculator: "section80c",
  },
  section80d: {
    title: "Section 80D (Health Insurance)",
    tip: "Premiums for self/family (up to ₹25k) and parents (₹25k/₹50k if senior). Pay by UPI/card, not cash.",
    impact: "Reduces taxable income under Old Regime.",
  },
  hra_received: {
    title: "HRA Received",
    tip: "Total House Rent Allowance from employer — usually Box 10(13A) on Form 16.",
    impact: "Used to calculate tax-free rent under Old Regime only.",
    hasCalculator: "hra",
  },
  actual_rent_paid: {
    title: "Rent You Paid",
    tip: "Total rent paid to landlord this year. Keep rent receipts safe.",
    impact: "Higher rent can increase HRA exemption under Old Regime.",
    hasCalculator: "hra",
  },
  fd_interest: {
    title: "Bank / FD Interest",
    tip: "All interest from savings and FDs is taxable. Savings gets ₹10k deduction (80TTA) for non-seniors.",
    impact: "Banks report this to ITD — declare it to avoid mismatch notices.",
  },
  home_loan_interest: {
    title: "Home Loan Interest (Section 24b)",
    tip: "Interest paid on housing loan. Max ₹2 lakh for self-occupied property.",
    impact: "Lowers taxable income under Old Regime.",
  },
  homeLoanInterest: {
    title: "Home Loan Interest (Section 24b)",
    tip: "Interest paid on housing loan. Max ₹2 lakh for self-occupied property.",
    impact: "Lowers taxable income under Old Regime.",
  },
  actual_rent_paid_80gg: {
    title: "Rent Without HRA (Section 80GG)",
    tip: "If employer does not pay HRA, you may claim rent paid under 80GG (Old Regime).",
    impact: "Capped at ₹5,000/month or 25% of income — whichever is lower.",
  },
  nps_extra: {
    title: "Extra NPS (Section 80CCD(1B))",
    tip: "Additional ₹50,000 in NPS Tier 1 — separate from the ₹1.5L 80C cap.",
    impact: "Extra tax saving in both Old and New regimes.",
    hasCalculator: "nps",
  },
  annualRent: {
    title: "Rental Income",
    tip: "Gross rent from letting out property. Portal deducts 30% standard deduction automatically.",
    impact: "Adds to total income; loan interest can offset it.",
  },
  municipalTax: {
    title: "Property Tax Paid",
    tip: "Municipal tax you actually paid this year on the let-out property.",
    impact: "Subtracted from rental income before tax.",
  },
  coOwnerPercent: {
    title: "Your Ownership Share",
    tip: "Your % share if property is jointly owned (e.g. 50% with spouse).",
    impact: "Only your share of rent and loan interest is taxed in your return.",
  },
  propertyType: {
    title: "Property Type",
    tip: "Self-occupied = you live there. Let-out = you rent it to someone.",
    impact: "Self-occupied loan interest capped at ₹2L; let-out has different rules.",
  },
  fno_turnover: {
    title: "F&O Turnover",
    tip: "Sum of absolute profits and losses from all F&O trades — from broker tax P&L.",
    impact: "Turnover above ₹10 crore may need a tax audit.",
  },
  fno_profit: {
    title: "F&O Profit / Loss",
    tip: "Net profit or loss from futures & options. Goes in business schedule (ITR-3), not capital gains.",
    impact: "Losses can be carried forward for 8 years against future business income.",
  },
  stcg_111a: {
    title: "Short-Term Capital Gains (Shares)",
    tip: "Listed equity sold within 12 months — taxed at 15% on net gain.",
    impact: "Enter on Schedule CG / 111A on the portal — not in salary.",
  },
  ltcg_112a: {
    title: "Long-Term Capital Gains (Shares)",
    tip: "Listed equity held 12+ months. First ₹1.25 lakh gain per year is tax-free.",
    impact: "Use Schedule 112A on portal — one row per stock/fund sold.",
  },
};

/** Normalize question text for fuzzy local lookup. */
export function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .replace(/[?.,!'"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const LOCAL_TAX_ANSWERS: Array<{ keys: string[]; answer: string }> = [
  {
    keys: ["how to get form 16", "form 16", "get form 16"],
    answer:
      "• Form 16 is issued by your employer by 15 June each year\n• It shows salary earned and tax deducted (TDS)\n• Download from HR portal or ask your finance team\n• You need Part A (TDS) and Part B (salary breakup) for filing",
  },
  {
    keys: ["is my data safe", "data safe", "privacy"],
    answer:
      "• Your data is stored securely and processed in India\n• We do not sell your PAN or salary details\n• You file yourself on incometax.gov.in — we only guide you\n• You can clear saved data anytime from Refresh / Clear all",
  },
  {
    keys: ["section 17", "what is section 17", "gross salary"],
    answer:
      "• Section 17(1) = your total salary income before exemptions\n• Find it in Form 16 Part B, Box 17(1)\n• Includes basic, allowances, bonus — before standard deduction\n• Must match what you enter on the government portal",
  },
  {
    keys: ["standard deduction"],
    answer:
      "• Flat deduction from salary — no proof needed\n• ₹75,000 in New Regime (AY 2026-27)\n• Applied automatically when you have salary income\n• You do not upload bills for this",
  },
  {
    keys: ["80c", "what is 80c limit", "80c limit"],
    answer:
      "• Section 80C lets you reduce tax on investments up to ₹1.5 lakh\n• Includes EPF, PPF, ELSS, LIC, tuition fees, home loan principal\n• Old Regime only — not available in New Regime\n• Keep investment proofs for 6 years",
  },
  {
    keys: ["rent without receipt", "claim rent", "hra"],
    answer:
      "• You can declare HRA exemption without uploading receipts initially\n• Keep rent agreement and receipts — ITD may ask later\n• If annual rent > ₹1 lakh, landlord PAN is mandatory\n• HRA works only in Old Regime",
  },
  {
    keys: ["old vs new", "regime", "which regime"],
    answer:
      "• New Regime: lower tax rates, almost no deductions (80C, HRA, etc.)\n• Old Regime: higher rates but 80C, HRA, home loan interest allowed\n• We compare both and show which saves more for your numbers\n• Salaried people can switch every year",
  },
  {
    keys: ["mismatch", "ais mismatch", "26as"],
    answer:
      "• Mismatch means Form 16, AIS, or 26AS show different numbers\n• Fix before filing — ITD auto-matches TDS and income\n• Ask employer to correct TDS if Form 16 is wrong\n• Or file matching AIS to avoid a notice",
  },
  {
    keys: ["avoid notice", "how to avoid notice", "notice"],
    answer:
      "• Match salary to Form 16 and TDS to Form 26AS\n• Declare all bank interest and capital gains\n• Claim only deductions you can prove\n• File before 31 July to avoid late fee",
  },
  {
    keys: ["choose itr", "which itr", "itr form"],
    answer:
      "• ITR-1: salary + one house + small other income\n• ITR-2: capital gains, foreign income, multiple properties\n• ITR-3: business, F&O, professional income with books\n• ITR-4: small business/profession on presumptive scheme (44AD/44ADA)\n• We recommend the right form based on your answers",
  },
  {
    keys: ["file late", "can i file late", "late filing"],
    answer:
      "• You can file after 31 July but a late fee may apply (up to ₹5,000)\n• Loss carry-forward is lost if you file late\n• Pay any tax due with interest (Section 234)\n• File as soon as possible — earlier is always better",
  },
  {
    keys: ["surcharge", "what is surcharge"],
    answer:
      "• Extra tax on high incomes above ₹50 lakh / ₹1 crore\n• Calculated on top of normal income tax\n• Most salaried users below ₹50L do not pay surcharge\n• We show it in your tax summary if it applies",
  },
  {
    keys: ["capital gain", "ltcg", "stcg", "112a", "share sale"],
    answer:
      "• Short-term equity (held < 12 months): 15% tax on gain\n• Long-term equity (12+ months): 12.5% after ₹1.25L free limit\n• Use broker Tax P&L — not sale value alone\n• Enter on Schedule CG / 112A on incometax.gov.in",
  },
  {
    keys: ["loss carry", "carry forward", "bfla", "cfl", "fno loss"],
    answer:
      "• Losses from shares or F&O can reduce future taxes\n• Enter last year's losses in BFLA schedule on portal\n• Note CFL numbers after filing — you need them next year\n• F&O loss is business loss; equity STCL is capital loss",
  },
  {
    keys: ["file for someone", "family", "multiple people", "client"],
    answer:
      "• Go to People I file for in the sidebar\n• Add each person once — their draft saves separately\n• Switch person → continue filing → pay per person (or use wallet credits)\n• Same login works for up to 50 individuals",
  },
  {
    keys: ["companion", "portal guide", "incometax.gov"],
    answer:
      "• Open incometax.gov.in in a second tab\n• Our companion shows each portal field with your number\n• Copy our value → paste in the same box on the government site\n• E-verify with Aadhaar OTP within 30 days after submit",
  },
  {
    keys: ["payment", "unlock", "after payment"],
    answer:
      "• Payment unlocks copy-ready numbers for one person's return\n• After paying, go straight to Filing Companion\n• Use Refresh if numbers don't show after payment\n• Switch to another person from People I file for when done",
  },
  {
    keys: ["87a", "rebate"],
    answer:
      "• Section 87A gives tax rebate if income is below a threshold\n• New Regime: rebate up to ₹60,000 if income ≤ ₹12 lakh (check latest rules)\n• Old Regime has a lower threshold\n• We apply rebate automatically in your estimate",
  },
  {
    keys: ["e-verify", "everify", "verify return", "aadhaar otp"],
    answer:
      "• After submitting on incometax.gov.in, you must e-verify within 30 days\n• Easiest way: Aadhaar OTP on the portal\n• Without e-verify, your return is not valid\n• We show a countdown after you save your acknowledgement number",
  },
  {
    keys: ["form 26as", "26as", "ais", "annual information"],
    answer:
      "• Form 26AS shows all TDS and tax credits linked to your PAN\n• AIS (Annual Information Statement) shows income banks/employers reported\n• Download both free from incometax.gov.in → e-File → Income Tax Returns\n• Match these with Form 16 before filing",
  },
  {
    keys: ["tds", "tax deducted", "employer deducted"],
    answer:
      "• TDS is tax your employer or bank already paid to the government on your behalf\n• Find it in Form 16 Part A and Form 26AS\n• Enter the same total on the portal — mismatch causes notices\n• Higher TDS usually means lower tax due at filing",
  },
  {
    keys: ["home loan", "section 24", "housing loan interest"],
    answer:
      "• Home loan interest on self-occupied house: up to ₹2 lakh deduction (Old Regime)\n• Principal repayment counts under 80C (within ₹1.5L cap)\n• Let-out property has different rules — interest can offset rent\n• Keep interest certificate from bank",
  },
  {
    keys: ["hra exemption", "house rent allowance", "how hra works"],
    answer:
      "• HRA exemption = minimum of: actual HRA received, rent paid minus 10% salary, or 50%/40% of salary\n• Only works in Old Regime\n• Keep rent receipts and landlord PAN if rent > ₹1 lakh/year\n• Use our HRA calculator when you focus the HRA field",
  },
  {
    keys: ["presumptive", "44ad", "44ada", "44ae", "itr-4"],
    answer:
      "• Presumptive tax = pay tax on a fixed % of turnover, no full books needed\n• 44AD: small business (8% or 6% digital receipts)\n• 44ADA: professionals like doctors, lawyers (50% of receipts)\n• 44AE: goods carriage — per truck rules\n• Choose ITR-4 if presumptive applies to you",
  },
  {
    keys: ["tax audit", "audit required", "turnover limit"],
    answer:
      "• Tax audit needed if business turnover crosses limits (e.g. ₹1 crore, or ₹10 crore for digital)\n• F&O turnover above ₹10 crore may need audit\n• Late audit = penalty and loss carry-forward blocked\n• We flag audit risk on your review screen",
  },
  {
    keys: ["refund", "when refund", "how long refund"],
    answer:
      "• Refund happens when TDS paid is more than your final tax\n• ITD processes after e-verification — usually 2–8 weeks\n• Track status on incometax.gov.in → Refund Status\n• Ensure bank account is pre-validated on the portal",
  },
  {
    keys: ["advance tax", "234", "interest penalty"],
    answer:
      "• If tax due exceeds ₹10,000/year, pay advance tax in instalments\n• Missing advance tax adds interest under Section 234B/234C\n• Salaried people with only employer TDS often skip this\n• We show estimated tax due on your summary",
  },
  {
    keys: ["nps", "80ccd", "national pension"],
    answer:
      "• Employer NPS (80CCD(2)) — extra deduction, no cap if employer contributes\n• Your extra NPS (80CCD(1B)) — additional ₹50,000 beyond 80C\n• Works in both Old and New regime for 1B\n• Tier 1 NPS account only",
  },
  {
    keys: ["refresh", "clear all", "lost progress", "save progress"],
    answer:
      "• Refresh — reloads your saved draft from your account\n• Save now — writes current draft to the active person's profile\n• Clear all — wipes this person's draft and unlock (needs login)\n• We auto-save every ~8 seconds when you're logged in",
  },
  {
    keys: ["schedule 112a", "112a", "equity ltcg", "mutual fund gain"],
    answer:
      "• Schedule 112A is for long-term gains on listed shares and equity MFs\n• One row per sale — ISIN, sale date, buy date, quantities\n• First ₹1.25 lakh LTCG per year is tax-free\n• Use broker Tax P&L — our companion shows what to copy",
  },
  {
    keys: ["intraday", "fno", "futures options", "speculative"],
    answer:
      "• F&O profit is business income (ITR-3), not capital gains\n• Turnover = sum of absolute profits and losses from all trades\n• Losses can carry forward 8 years against future business income\n• Enter broker tax P&L figures on review screen",
  },
  {
    keys: ["senior citizen", "super senior", "age slab"],
    answer:
      "• Senior citizen = 60–79 years — higher basic exemption in Old Regime\n• Super senior = 80+ years — even higher exemption\n• 80D limit for parents increases if they are senior citizens\n• Pick correct age group at onboarding",
  },
];

export function lookupLocalAnswer(question: string): string | null {
  const n = normalizeQuestion(question);
  for (const entry of LOCAL_TAX_ANSWERS) {
    if (entry.keys.some((k) => n.includes(k) || k.includes(n))) {
      return entry.answer;
    }
  }
  return null;
}

export const STEP_GUIDANCE: Record<
  string,
  { banner: string; tips: string[] }
> = {
  onboarding: {
    banner: "Let's find the right ITR form for you. Answer a few simple questions.",
    tips: [
      "Select every income type you had this year (salary, FD, shares, business).",
      "Age affects tax slabs — pick the correct group.",
      "You can add more details later on the review screen.",
    ],
  },
  import: {
    banner: "Upload Form 16 or enter rough numbers. We'll build your draft.",
    tips: [
      "Form 16 password is usually your PAN in CAPITAL letters.",
      "Upload multiple Form 16s if you changed jobs.",
      "AIS and 26AS can be uploaded to catch mismatches early.",
    ],
  },
  income: {
    banner: "Check your income numbers. They should match Form 16 and bank statements.",
    tips: [
      "Gross salary = Form 16 Box 17(1).",
      "Declare all FD and savings interest — banks report it to ITD.",
      "F&O profit goes in business schedule, not capital gains.",
    ],
  },
  deductions: {
    banner: "Claim only deductions you can prove. Old Regime needed for most of these.",
    tips: [
      "80C max ₹1.5 lakh — EPF counts automatically from salary.",
      "80D needs non-cash payment for health insurance.",
      "Standard deduction applies to salary without any action from you.",
    ],
  },
  regime: {
    banner: "We compare Old vs New regime with your actual numbers.",
    tips: [
      "New Regime = simpler, fewer deductions.",
      "Old Regime wins if your deductions (80C + HRA + home loan) are large.",
      "You can switch every year if you have salary income.",
    ],
  },
  review: {
    banner: "Final check before payment. Green = good, amber = needs your attention.",
    tips: [
      "Fix any mismatch flags before paying.",
      "Check recommended ITR form matches your income types.",
      "Save progress — we auto-save when you're logged in.",
    ],
  },
  checkout: {
    banner: "Unlock the step-by-step portal guide for this person.",
    tips: [
      "Starter plan covers most salaried filers.",
      "AI Smart adds deeper checks and capital gains help.",
      "Use wallet credit if you bought a multi-filing pack.",
    ],
  },
  companion: {
    banner: "File on incometax.gov.in beside this screen. Copy each value across.",
    tips: [
      "Use Parallel view to see all sections at once.",
      "Capital gains and loss schedules need extra care — follow Smart CA tips.",
      "E-verify within 30 days after submitting on the portal.",
    ],
  },
  family: {
    banner: "Manage everyone you file for from one account.",
    tips: [
      "Each person has a separate draft and payment unlock.",
      "Switch person before starting their return.",
      "Use Clear all to reset one person and start fresh.",
    ],
  },
};

export function stepFromPathname(pathname: string): string {
  if (pathname.startsWith("/file/family")) return "family";
  if (pathname.startsWith("/file/onboarding") || pathname.startsWith("/file/start"))
    return "onboarding";
  if (pathname.startsWith("/file/import")) return "import";
  if (
    pathname.startsWith("/file/income") ||
    pathname.startsWith("/file/house-property") ||
    pathname.startsWith("/file/other")
  )
    return "income";
  if (pathname.startsWith("/file/deductions")) return "deductions";
  if (pathname.startsWith("/file/regime")) return "regime";
  if (pathname.startsWith("/file/review")) return "review";
  if (pathname.startsWith("/file/checkout")) return "checkout";
  if (pathname.startsWith("/file/companion")) return "companion";
  return "income";
}

export function buildWelcomeMessage(step: string, activeField: string | null): string {
  if (activeField && FIELD_GUIDANCE[activeField]) {
    const f = FIELD_GUIDANCE[activeField];
    return `You're on: ${f.title}\n\n• ${f.tip}\n\n• Tax impact: ${f.impact}`;
  }
  const guide = STEP_GUIDANCE[step];
  if (guide) {
    return `${guide.banner}\n\n${guide.tips.map((t) => `• ${t}`).join("\n")}`;
  }
  return "Ask me anything about ITR filing — I have 150+ guides on tax law, deductions, capital gains, notices, and portal steps. I'll answer in simple English with bullet points tailored to your return.";
}

export function suggestedQuestionsForStep(step: string): string[] {
  switch (step) {
    case "onboarding":
      return ["Which ITR form do I need?", "Can I file late?", "Do I need a CA?"];
    case "import":
      return ["Is my data safe?", "How to get Form 16?", "What is AIS vs 26AS?"];
    case "income":
      return ["What is Section 17(1)?", "Must I declare FD interest?", "F&O vs capital gains?"];
    case "deductions":
      return ["What is 80C limit?", "HRA in new regime?", "Can I claim rent without receipt?"];
    case "regime":
      return ["Old vs new regime for me?", "What is surcharge?", "What is Section 87A rebate?"];
    case "family":
      return ["File for someone else?", "How does payment work per person?", "What are wallet credits?"];
    case "companion":
      return ["How to use portal guide?", "Schedule 112A capital gains?", "How to e-verify?"];
    case "review":
    case "checkout":
      return ["How to fix AIS mismatch?", "How to avoid a notice?", "Get Expert CA Advice"];
    default:
      return ["Old vs new regime?", "Which ITR form?", "How to avoid notices?"];
  }
}
