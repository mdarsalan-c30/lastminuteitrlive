/**
 * Few-page portal filing walkthrough (Option B).
 * ITR-1 through ITR-4 use screenshot-backed step guides; ITR-2/3/4 reuse
 * ITR-1 portal images for shared screens until form-specific packs land.
 */

import type { ITRResult, PortalForm, UserInput } from "@/lib/engine/types";
import { resolveEngineValue } from "@/lib/engine/mergeValues";
import itr1Walkthrough from "@/data/portalWalkthrough/itr1.json";
import itr2Walkthrough from "@/data/portalWalkthrough/itr2.json";
import itr3Walkthrough from "@/data/portalWalkthrough/itr3.json";
import itr4Walkthrough from "@/data/portalWalkthrough/itr4.json";

export type WalkthroughStepAction =
  | "click"
  | "verify"
  | "skip"
  | "enter"
  | "note";

export interface WalkthroughStep {
  id: string;
  title: string;
  clickPath: string;
  plainEnglish: string;
  hindiShort?: string;
  action: WalkthroughStepAction;
  image?: string;
  ourValueKey?: string;
  tip?: string;
  warning?: string;
}

export interface WalkthroughChapter {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  heroImage?: string;
  portalPath: string;
  tips?: string[];
  warnings?: string[];
  steps: WalkthroughStep[];
}

export interface PortalWalkthrough {
  schemaVersion: string;
  form: PortalForm;
  assessmentYear: string;
  portalUrl: string;
  hasScreenshots: boolean;
  chapters: WalkthroughChapter[];
}

const BY_FORM: Record<PortalForm, PortalWalkthrough> = {
  "ITR-1": itr1Walkthrough as PortalWalkthrough,
  "ITR-2": itr2Walkthrough as PortalWalkthrough,
  "ITR-3": itr3Walkthrough as PortalWalkthrough,
  "ITR-4": itr4Walkthrough as PortalWalkthrough,
};

export const ITD_PORTAL_URL =
  "https://www.incometax.gov.in/iec/foportal/";

export function getPortalWalkthrough(form: PortalForm): PortalWalkthrough {
  return BY_FORM[form] ?? BY_FORM["ITR-1"];
}

export function walkthroughImageUrl(
  form: PortalForm,
  image?: string
): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("/")) return image;
  const dir =
    form === "ITR-1"
      ? "itr1"
      : form === "ITR-2"
        ? "itr2"
        : form === "ITR-3"
          ? "itr3"
          : "itr4";
  return `/portal/${dir}/${image}`;
}

export function resolveWalkthroughValue(
  ourValueKey: string | undefined,
  result: ITRResult | null | undefined,
  userInput?: UserInput
): string | number | null {
  if (!ourValueKey || !result) return null;
  return resolveEngineValue(result, userInput, ourValueKey);
}

/** Plain-English CA guidance for the current walkthrough chapter. */
export function getChapterCaGuidance(
  chapterId: string,
  form: PortalForm
): string {
  const byChapter: Record<string, string> = {
    "before-you-start": `Keep incometax.gov.in open in a second tab. On ${form}, only enter numbers we show — never guess.`,
    "prep-26as-ais":
      "Download Form 26AS and AIS for FY 2025-26 before you start the return. Match TDS lines with Form 16 and our summary.",
    "start-filing": `Pick AY 2026-27, Online mode, then select ${form} — same path as ITR-1 but choose the correct form.`,
    "personal-regime-bank":
      "Fix personal details, pick old or new regime (match our recommendation), and link a bank account for refunds.",
    "login-start": "Log in with PAN, pick AY 2026-27, Online mode, then select the same ITR form shown here.",
    personal_info:
      "Start with personal details — name, PAN, and address should already match your profile. Fix mismatches before income schedules.",
    "salary-if-any":
      "Open salary only if Form 16 exists. Capital-gains-only or business-only filers can skip this whole chapter.",
    salary:
      "Open Income from Salary on the portal. Copy each figure from our list into the matching row. Skip the whole section if you had no job income.",
    "capital-gains":
      "Capital gains use special tax rates. Enter net gains (after brokerage), not sale value. LTCG on shares: enter gross before the ₹1.25L exemption.",
    schedule_112a:
      "Schedule 112A is scrip-by-scrip for delivery equity sales. Use your broker Tax P&L. F&O profit goes in business schedule, not here.",
    "schedule-112a":
      "Schedule 112A is scrip-by-scrip for delivery equity sales. Use your broker Tax P&L. F&O profit goes in business schedule, not here.",
    loss_carry_forward:
      "This is the hardest part — take your time. Fill income first, then check CYLA. Enter last year's CFL numbers in BFLA. Note new CFL totals for next year.",
    "loss-carry-forward":
      "Fill all income schedules first, then verify CYLA. Enter last year's CFL in BFLA and note new CFL numbers for next July.",
    business_pl:
      "Enter your business P&L from books or our F&O summary. Expenses belong here, not in 80C deductions.",
    "business-pl":
      "Enter turnover and expenses from your books or broker statement. Net profit should match our business income total.",
    presumptive_business:
      "Enter turnover/receipts first — portal calculates 6% or 8% (44AD) or 50% (44ADA). Do not add a separate expense schedule.",
    "presumptive-business":
      "Enter turnover or professional receipts — the portal applies the presumptive rate. No expense breakup needed on ITR-4.",
    presumptive_44ae:
      "44AE is only for goods carriages. If you run a shop or freelance, skip this and use 44AD/44ADA above.",
    "presumptive-44ae":
      "Only for truck/tempo owners. Skip entirely if you file under 44AD or 44ADA.",
    other_income:
      "Interest and dividends go in Other Sources. Enter gross interest; savings deduction comes later in Chapter VI-A.",
    "other-sources":
      "Interest and dividends go in Schedule OS. Enter gross amounts — 80TTA/80TTB is claimed under deductions.",
    deductions:
      "Chapter VI-A is mostly old-regime only. Do not put business expenses here — those go in Schedule BP.",
    "deductions-tax-paid":
      "Claim only deductions you can prove. Then verify TDS in Tax Paid matches Form 16 and 26AS.",
    "liability-confirm":
      "Compare Part D with our tax summary. Special-rate CG tax is added separately — check the full liability, not salary alone.",
    "pay-preview-submit":
      "If tax is due, pay now or later — but confirm the challan appears before you submit. Preview every page.",
    balance_sheet:
      "ITR-3 needs a balance sheet if audited. We don't compute this yet — use your CA's figures or skip if not applicable.",
    "balance-sheet":
      "Use your CA's audited balance sheet when required. Do not invent asset values.",
    tax_computation:
      "Compare Part D line by line with our summary. Tax payable and refund should match within a few rupees.",
    "everify-receipt":
      "After submit, e-verify within 30 days using Aadhaar OTP. Save the acknowledgement number back here.",
    everify:
      "After submit, e-verify within 30 days using Aadhaar OTP. Save the acknowledgement number back here.",
  };
  return (
    byChapter[chapterId] ??
    `On the portal, open "${chapterId.replace(/_/g, " ")}" and mirror each step below. Ask us if a field name doesn't match.`
  );
}

/** CA guidance for parallel mirror / footprint screen ids. */
export function getScreenCaGuidance(screenId: string): string {
  const byScreen: Record<string, string> = {
    schedule_112a:
      "Open Schedule 112A on the portal. Add one row per stock or fund sold. Copy our LTCG/STCG totals into the summary rows.",
    loss_carry_forward:
      "Go to Tax Computation → CYLA, then BFLA (last year's losses), then CFL (losses for next year). Save CFL numbers — you'll need them next July.",
    capital_gains:
      "Enter net capital gains, not sale proceeds. STCG on listed shares is 15%; LTCG u/s 112A is 12.5% after exemption.",
    presumptive_business:
      "Enter turnover or professional receipts. Portal applies presumptive percentage — verify it matches our computed profit.",
    business_pl:
      "F&O and business income go in Schedule BP. Net profit here should match our business income total.",
  };
  return (
    byScreen[screenId] ??
    "Expand this section on the portal, find each field listed below, and paste our value in the same box."
  );
}
