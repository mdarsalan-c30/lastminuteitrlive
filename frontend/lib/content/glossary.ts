/** Glossary terms extracted from itr-filing-wireframes/sources/engine/plain_english.py */
import { GLOSSARY_EXTENDED, type GlossaryExtendedFields } from "./glossary-extended";

export interface GlossaryTerm {
  id: string;
  slug: string;
  label: string;
  explanation: string;
  extendedBody?: string;
  relatedSlugs?: string[];
  learnSlug?: string;
  category?: string;
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const ENTRIES: Record<string, [string, string]> = {
  A1: ["PAN", "Your 10-character Permanent Account Number from your PAN card."],
  A4: [
    "Date of birth",
    "Used to determine senior-citizen slab benefits and 80TTB eligibility.",
  ],
  A20: [
    "Opt out of new tax regime",
    "Choose old regime only if your Chapter VI-A deductions (80C, 80D, HRA, etc.) save more tax than the new regime's lower slabs.",
  ],
  B1: [
    "Salary income",
    "Taxable salary after standard deduction, HRA/LTA exemptions, and professional tax.",
  ],
  B1_ia: ["Basic salary", "Core salary component — used to calculate HRA exemption."],
  B1_ii: [
    "Exempt allowances u/s 10",
    "HRA, LTA, and other allowances exempt under Section 10.",
  ],
  B1_iva: [
    "Standard deduction u/s 16(ia)",
    "Flat deduction from salary — ₹50,000 (old) or ₹75,000 (new regime).",
  ],
  B1_ivc: [
    "Professional tax u/s 16(iii)",
    "State professional tax deducted from salary — fully deductible.",
  ],
  B2: [
    "House property income",
    "Income or loss from owned property — rent minus 30% repairs minus home-loan interest.",
  ],
  B2_1h: [
    "Home loan interest u/s 24(b)",
    "Interest paid on home loan — capped at ₹2 lakh for self-occupied property (old regime).",
  ],
  B3: [
    "Other sources income",
    "Bank FD interest, savings interest, dividends, and family pension.",
  ],
  B4: ["Gross total income", "Sum of all income heads before Chapter VI-A deductions."],
  C1: [
    "Total Chapter VI-A deductions",
    "Investments and expenses that reduce taxable income (old regime).",
  ],
  "80C": [
    "Section 80C",
    "EPF, PPF, ELSS, LIC, tuition fees, home-loan principal — combined cap ₹1.5 lakh.",
  ],
  "80CCD_1B": [
    "Section 80CCD(1B)",
    "Additional NPS contribution by you — extra ₹50,000 over and above 80C cap.",
  ],
  "80CCD_2": [
    "Section 80CCD(2)",
    "Employer's NPS contribution — allowed in both old and new regime (up to 10% of basic).",
  ],
  "80D": [
    "Section 80D",
    "Health insurance premium for self/family and parents — limits vary by age.",
  ],
  "80TTA": [
    "Section 80TTA",
    "Deduction on savings account interest — up to ₹10,000 (below 60 years).",
  ],
  "80TTB": [
    "Section 80TTB",
    "Deduction on all interest income for senior citizens — up to ₹50,000.",
  ],
  "80GG": [
    "Section 80GG",
    "Rent paid when HRA is not received — only if you don't own a house in the city.",
  ],
  "80U": [
    "Section 80U",
    "Deduction for taxpayer with disability — ₹75,000 or ₹1.25 lakh if severe.",
  ],
  C2: ["Total income", "Gross total income minus deductions — your taxable income base."],
  D1: [
    "Tax on total income",
    "Tax calculated on slab rates plus special-rate capital gains.",
  ],
  D2: [
    "Rebate u/s 87A",
    "Tax rebate for lower incomes — up to ₹12,500 (old) or full rebate up to ₹12L (new).",
  ],
  D4: ["Health & education cess", "4% surcharge on income tax and surcharge."],
  D12: [
    "Total taxes paid",
    "TDS from Form 16/26AS plus advance tax and self-assessment tax.",
  ],
  D13: ["Tax payable", "Amount you still owe after TDS credits."],
  D14: ["Refund", "Excess TDS/advance tax — money returned by the department."],
  Schedule_TDS: [
    "TDS schedule",
    "Tax already deducted by employer, bank, or broker — matched against 26AS.",
  ],
  Schedule_IT: [
    "Advance/self-assessment tax",
    "Tax you paid directly via challan before filing.",
  ],
  Schedule_BP: [
    "Business/profession schedule",
    "Profit from business or profession — presumptive (44AD/44ADA) or regular books.",
  ],
  Schedule_CG: [
    "Capital gains schedule",
    "Gains/losses from shares, mutual funds, property, and other assets.",
  ],
  E2_44AD: [
    "Presumptive business income u/s 44AD",
    "8% of turnover (6% if digital) when turnover ≤ ₹2 crore — no books required.",
  ],
  E3_44ADA: [
    "Presumptive profession income u/s 44ADA",
    "50% of gross receipts when receipts ≤ ₹50 lakh — for doctors, lawyers, consultants, etc.",
  ],
  regime_old: [
    "Old tax regime",
    "Higher slabs but full Chapter VI-A deductions and HRA exemption.",
  ],
  regime_new: [
    "New tax regime",
    "Lower slabs and higher standard deduction — most VI-A deductions not allowed.",
  ],
  confidence_score: [
    "Filing confidence",
    "How complete your documents and inputs are — 100% means filing-ready in exact mode.",
  ],
  itr_form: [
    "Recommended ITR form",
    "The correct return form based on your income mix and business type.",
  ],
};

function mergeExtended(slug: string): Partial<GlossaryExtendedFields> {
  return GLOSSARY_EXTENDED[slug] ?? {};
}

export const GLOSSARY_TERMS: GlossaryTerm[] = Object.entries(ENTRIES).map(
  ([id, [label, explanation]]) => {
    const slug = slugify(label);
    const extended = mergeExtended(slug);
    return {
      id,
      slug,
      label,
      explanation,
      ...extended,
    };
  }
);

export function glossaryWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isGlossaryTermIndexable(term: GlossaryTerm): boolean {
  if (!term.extendedBody) return false;
  return glossaryWordCount(term.extendedBody) >= 300;
}

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.slug === slug || t.id === slug);
}

export function getGlossarySlugs(): string[] {
  return GLOSSARY_TERMS.map((t) => t.slug);
}

export function getIndexableGlossarySlugs(): string[] {
  return GLOSSARY_TERMS.filter(isGlossaryTermIndexable).map((t) => t.slug);
}
