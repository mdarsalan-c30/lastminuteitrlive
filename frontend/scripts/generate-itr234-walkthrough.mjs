/**
 * Generate ITR-2 / ITR-3 / ITR-4 portal walkthrough JSON from the ITR-1
 * screenshot-complete template + form-specific income chapters.
 *
 * Shared portal screens (login, AY, regime, deductions, e-verify) reuse ITR-1
 * images — see docs/sop/ITR234_WALKTHROUGH_STATUS.md.
 *
 * Run: node frontend/scripts/generate-itr234-walkthrough.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../data/portalWalkthrough");
const itr1 = JSON.parse(readFileSync(join(DATA_DIR, "itr1.json"), "utf8"));

const PORTAL_URL = "https://www.incometax.gov.in/iec/foportal/";
const SCHEMA = "AY2026-27.walkthrough.v1";

/** Deep-clone a chapter and re-assign order. */
function chapter(base, order, patch = {}) {
  return {
    ...structuredClone(base),
    order,
    ...patch,
    steps: patch.steps ?? structuredClone(base.steps),
    tips: patch.tips ?? base.tips,
    warnings: patch.warnings ?? base.warnings,
  };
}

function step(patch) {
  return patch;
}

function byId(id) {
  const ch = itr1.chapters.find((c) => c.id === id);
  if (!ch) throw new Error(`Missing ITR-1 chapter: ${id}`);
  return ch;
}

function pickFormChapter(form) {
  const start = byId("start-filing");
  return chapter(start, 2, {
    title: `Start filing ${form}`,
    subtitle: `Pick AY 2026-27, Online mode, and ${form}.`,
    steps: start.steps.map((s) => {
      if (s.id === "pick-itr1") {
        const num = form.replace("ITR-", "");
        return {
          ...s,
          id: `pick-${form.toLowerCase()}`,
          title: `Select ${form}`,
          clickPath: `${form} → Proceed With ${form} → Let's Get Started`,
          plainEnglish: `Select ${form}, Proceed With ${form}, then Let's Get Started.`,
          image: s.image,
        };
      }
      return { ...s };
    }),
  });
}

function beforeYouStart(form, subtitle, tips, warnings) {
  const base = byId("before-you-start");
  return chapter(base, 0, {
    title: `Before you start (${form})`,
    subtitle,
    tips,
    warnings,
  });
}

// ── ITR-2 form-specific chapters ─────────────────────────────────────

function itr2IncomeChapters() {
  return [
    chapter(
      {
        id: "salary-if-any",
        title: "Salary (if you had a job)",
        subtitle: "Skip this whole chapter if you had no employer salary.",
        heroImage: "image17.jpg",
        portalPath: "Gross Total Income → Income from Salary/Pension",
        tips: ["Use Form 16 Part B figures — not your bank credits."],
        warnings: [
          "Capital-gains-only filers should skip every salary row.",
        ],
        steps: [
          step({
            id: "open-salary",
            title: "Open salary schedule",
            clickPath: "Gross Total Income → Income from Salary/Pension → Edit",
            plainEnglish:
              "Open the salary section only if Form 16 exists. Otherwise skip to Capital Gains.",
            action: "click",
            image: "image17.jpg",
          }),
          step({
            id: "gross-salary",
            title: "Gross salary u/s 17(1)",
            clickPath: "Salary → Gross salary",
            plainEnglish: "Copy our gross salary into the matching portal field.",
            action: "enter",
            image: "image18.jpg",
            ourValueKey: "income_heads.gross_salary",
          }),
          step({
            id: "std-ded",
            title: "Standard deduction u/s 16(ia)",
            clickPath: "Salary → Standard deduction",
            plainEnglish: "Enter the standard deduction amount we computed.",
            action: "enter",
            image: "image18.jpg",
            ourValueKey: "income_heads.standard_deduction",
          }),
          step({
            id: "net-salary",
            title: "Net salary income",
            clickPath: "Salary → Save",
            plainEnglish: "Save and confirm net salary matches our summary.",
            action: "verify",
            image: "image18.jpg",
            ourValueKey: "income_heads.net_salary_income",
          }),
        ],
      },
      4
    ),
    chapter(
      {
        id: "capital-gains",
        title: "Capital gains schedule",
        subtitle: "Schedule CG — STCG and LTCG at special rates.",
        heroImage: "image19.jpg",
        portalPath: "Income Sources → Capital Gains → Schedule CG",
        tips: [
          "Use broker tax P&L — enter net gains, not sale proceeds.",
          "LTCG u/s 112A: enter gross LTCG before the ₹1.25L exemption.",
        ],
        warnings: [
          "Wrong schedule (ITR-1) if you have STCG or LTCG above exemption limits.",
        ],
        steps: [
          step({
            id: "open-cg",
            title: "Open Schedule CG",
            clickPath: "Gross Total Income → Capital Gains → Schedule CG",
            plainEnglish:
              "Open the capital gains schedule from Income Sources.",
            action: "click",
            image: "image19.jpg",
          }),
          step({
            id: "stcg-111a",
            title: "STCG u/s 111A (listed equity/MF)",
            clickPath: "Schedule CG → STCG 111A",
            plainEnglish:
              "Listed equity short-term gains — net after loss set-off, taxed at 15%.",
            action: "enter",
            image: "image20.jpg",
            ourValueKey: "income_heads.stcg_111a_net",
          }),
          step({
            id: "stcg-other",
            title: "STCG on other assets (slab rate)",
            clickPath: "Schedule CG → STCG other",
            plainEnglish:
              "Short-term gains on property, gold, debt funds — taxed at your slab.",
            action: "enter",
            image: "image20.jpg",
            ourValueKey: "income_heads.stcg_other_slab",
          }),
          step({
            id: "ltcg-112a",
            title: "LTCG u/s 112A (listed equity/MF)",
            clickPath: "Schedule CG → LTCG 112A",
            plainEnglish:
              "Net LTCG on listed equity before ₹1.25L exemption — portal applies exemption.",
            action: "enter",
            image: "image21.jpg",
            ourValueKey: "income_heads.ltcg_112a_net",
          }),
          step({
            id: "ltcg-other",
            title: "LTCG on other assets",
            clickPath: "Schedule CG → LTCG other",
            plainEnglish: "Property, gold, unlisted shares — at 12.5% or 20%.",
            action: "enter",
            image: "image21.jpg",
            ourValueKey: "income_heads.ltcg_other_net",
          }),
        ],
      },
      5
    ),
    chapter(
      {
        id: "schedule-112a",
        title: "Schedule 112A — scrip-wise equity sales",
        subtitle: "One row per stock or equity MF sold (delivery only).",
        heroImage: "image22.jpg",
        portalPath: "Schedule CG → Schedule 112A",
        tips: [
          "Import broker Tax P&L CSV if the portal allows.",
          "For pre-2018 purchases, use 31 Jan 2018 FMV as cost.",
        ],
        warnings: ["F&O profit does not go in 112A — use ITR-3 if you traded derivatives."],
        steps: [
          step({
            id: "open-112a",
            title: "Open Schedule 112A",
            clickPath: "Capital Gains → Schedule 112A → Add",
            plainEnglish: "Add one row per scrip (stock/fund) you sold this year.",
            action: "click",
            image: "image22.jpg",
          }),
          step({
            id: "112a-total",
            title: "Verify 112A summary total",
            clickPath: "Schedule 112A → summary",
            plainEnglish:
              "After all scrip rows, the summary should match our LTCG 112A figure.",
            action: "verify",
            image: "image22.jpg",
            ourValueKey: "income_heads.ltcg_112a_net",
          }),
        ],
      },
      6
    ),
    chapter(
      {
        id: "other-sources",
        title: "Other sources (interest & dividends)",
        subtitle: "Schedule OS — match AIS before you save.",
        heroImage: "image20.jpg",
        portalPath: "Income Sources → Other Sources → Schedule OS",
        tips: ["Enter gross savings interest; 80TTA/80TTB is in deductions."],
        warnings: ["Dividends are taxable even when TDS was deducted."],
        steps: [
          step({
            id: "open-os",
            title: "Open Schedule OS",
            clickPath: "Gross Total Income → Other Sources → Schedule OS",
            plainEnglish: "Open interest and dividend schedules.",
            action: "click",
            image: "image20.jpg",
          }),
          step({
            id: "fd-interest",
            title: "FD / term deposit interest",
            clickPath: "Schedule OS → Interest from deposits",
            plainEnglish: "Fully taxable — cross-check with 26AS TDS.",
            action: "enter",
            image: "image20.jpg",
            ourValueKey: "income_heads.fd_interest",
          }),
          step({
            id: "savings-interest",
            title: "Savings account interest",
            clickPath: "Schedule OS → Savings interest",
            plainEnglish: "Enter gross interest from AIS / bank statements.",
            action: "enter",
            image: "image20.jpg",
            ourValueKey: "income_heads.savings_interest_gross",
          }),
          step({
            id: "dividends",
            title: "Dividend income",
            clickPath: "Schedule OS → Dividends",
            plainEnglish: "Enter dividends reported in AIS.",
            action: "enter",
            image: "image20.jpg",
            ourValueKey: "income_heads.dividend_income",
          }),
        ],
      },
      7
    ),
    chapter(
      {
        id: "loss-carry-forward",
        title: "Losses — CYLA, BFLA, CFL",
        subtitle: "Set off this year's losses, then note CFL for next July.",
        heroImage: "image23.jpg",
        portalPath: "Tax Computation → CYLA → BFLA → CFL",
        tips: [
          "Fill all income schedules first — CYLA is mostly automatic.",
          "Save CFL numbers from last year's acknowledgement for BFLA.",
        ],
        warnings: [
          "Losses cannot carry forward if the prior year return was filed late.",
        ],
        steps: [
          step({
            id: "cyla",
            title: "Verify Schedule CYLA",
            clickPath: "Tax Computation → Schedule CYLA",
            plainEnglish:
              "Check how this year's losses reduced income — mostly auto-calculated.",
            action: "verify",
            image: "image23.jpg",
            ourValueKey: "income_heads.carry_forward_loss_set_off",
          }),
          step({
            id: "bfla",
            title: "Enter prior-year losses (BFLA)",
            clickPath: "Tax Computation → Schedule BFLA",
            plainEnglish:
              "Copy STCL/LTCL/HP loss figures from last year's CFL schedule.",
            action: "verify",
            image: "image23.jpg",
            ourValueKey: "income_heads.bf_loss_set_off_total",
          }),
          step({
            id: "cfl",
            title: "Note CFL for next year",
            clickPath: "Tax Computation → Schedule CFL",
            plainEnglish:
              "Write down unused STCL/LTCL — you'll need these numbers next July.",
            action: "note",
            image: "image24.jpg",
          }),
        ],
      },
      8
    ),
  ];
}

// ── ITR-3 form-specific chapters ─────────────────────────────────────

function itr3IncomeChapters() {
  return [
    chapter(
      {
        id: "business-pl",
        title: "Business P&L (Schedule BP)",
        subtitle: "Books of account — turnover, expenses, net profit.",
        heroImage: "image17.jpg",
        portalPath: "Income Sources → Business & Profession → Schedule BP",
        tips: ["F&O turnover and profit go here as business income."],
        warnings: [
          "Do not use presumptive 44AD/44ADA percentages on ITR-3 — enter actual books.",
        ],
        steps: [
          step({
            id: "open-bp",
            title: "Open Schedule BP",
            clickPath: "Gross Total Income → Business & Profession → Schedule BP",
            plainEnglish: "Open Part A P&L for business or profession income.",
            action: "click",
            image: "image17.jpg",
          }),
          step({
            id: "turnover",
            title: "Gross receipts / turnover",
            clickPath: "Schedule BP → Gross receipts",
            plainEnglish: "Total revenue per your P&L or broker turnover statement.",
            action: "enter",
            image: "image18.jpg",
            ourValueKey: "business.actual_gross_receipts",
          }),
          step({
            id: "expenses",
            title: "Business expenses",
            clickPath: "Schedule BP → Expenses",
            plainEnglish: "Allowable expenses from books — must support net profit.",
            action: "enter",
            image: "image18.jpg",
            ourValueKey: "business.actual_expenses",
          }),
          step({
            id: "net-business",
            title: "Net business income",
            clickPath: "Schedule BP → Save",
            plainEnglish: "Verify net profit matches our business income total.",
            action: "verify",
            image: "image18.jpg",
            ourValueKey: "business_income.net_business_income",
          }),
        ],
      },
      4
    ),
    chapter(
      {
        id: "capital-gains",
        title: "Capital gains (if any delivery equity)",
        subtitle: "Skip entirely if you only traded F&O with no delivery sales.",
        heroImage: "image19.jpg",
        portalPath: "Schedule CG",
        tips: ["F&O P&L belongs in Schedule BP, not here."],
        warnings: ["Skip all CG rows when our summary shows zero across STCG/LTCG."],
        steps: [
          step({
            id: "open-cg",
            title: "Open Schedule CG",
            clickPath: "Income Sources → Capital Gains",
            plainEnglish: "Only for delivery equity/property sales — not F&O.",
            action: "click",
            image: "image19.jpg",
          }),
          step({
            id: "stcg-111a",
            title: "STCG u/s 111A",
            clickPath: "Schedule CG → STCG 111A",
            plainEnglish: "Delivery equity held under 12 months.",
            action: "enter",
            image: "image20.jpg",
            ourValueKey: "income_heads.stcg_111a_net",
          }),
          step({
            id: "ltcg-112a",
            title: "LTCG u/s 112A",
            clickPath: "Schedule CG → LTCG 112A",
            plainEnglish: "Delivery equity LTCG before ₹1.25L exemption.",
            action: "enter",
            image: "image21.jpg",
            ourValueKey: "income_heads.ltcg_112a_net",
          }),
        ],
      },
      5
    ),
    chapter(
      {
        id: "schedule-112a",
        title: "Schedule 112A (delivery equity only)",
        subtitle: "Scrip-wise rows — skip if no delivery equity sales.",
        heroImage: "image22.jpg",
        portalPath: "Schedule CG → Schedule 112A",
        tips: ["Use broker Tax P&L export for scrip-wise entries."],
        warnings: [],
        steps: [
          step({
            id: "open-112a",
            title: "Open Schedule 112A",
            clickPath: "Capital Gains → Schedule 112A",
            plainEnglish: "Add rows per stock/MF sold. Skip if F&O-only trader.",
            action: "click",
            image: "image22.jpg",
          }),
          step({
            id: "112a-verify",
            title: "Verify 112A total",
            clickPath: "Schedule 112A → summary",
            plainEnglish: "Summary should match our LTCG 112A figure.",
            action: "verify",
            image: "image22.jpg",
            ourValueKey: "income_heads.ltcg_112a_net",
          }),
        ],
      },
      6
    ),
    chapter(
      {
        id: "salary-if-any",
        title: "Salary (if mixed income)",
        subtitle: "Side employment while running a business.",
        heroImage: "image18.jpg",
        portalPath: "Income from Salary/Pension",
        tips: [],
        warnings: ["Business-only filers skip this entire chapter."],
        steps: [
          step({
            id: "gross-salary",
            title: "Gross salary",
            clickPath: "Salary schedule → Gross salary",
            plainEnglish: "From Form 16 when you also had a job.",
            action: "enter",
            image: "image18.jpg",
            ourValueKey: "income_heads.gross_salary",
          }),
          step({
            id: "net-salary",
            title: "Net salary",
            clickPath: "Salary schedule → Save",
            plainEnglish: "Verify net salary matches our computation.",
            action: "verify",
            image: "image18.jpg",
            ourValueKey: "income_heads.net_salary_income",
          }),
        ],
      },
      7
    ),
    chapter(
      {
        id: "other-sources",
        title: "Other sources",
        subtitle: "Interest and dividends outside business.",
        heroImage: "image20.jpg",
        portalPath: "Schedule OS",
        tips: [],
        warnings: [],
        steps: [
          step({
            id: "fd-interest",
            title: "FD interest",
            clickPath: "Schedule OS → Interest",
            plainEnglish: "Taxable interest from deposits.",
            action: "enter",
            image: "image20.jpg",
            ourValueKey: "income_heads.fd_interest",
          }),
          step({
            id: "total-os",
            title: "Total other sources",
            clickPath: "Schedule OS → Save",
            plainEnglish: "Verify OS total matches our summary.",
            action: "verify",
            image: "image20.jpg",
            ourValueKey: "income_heads.total_other_income",
          }),
        ],
      },
      8
    ),
    chapter(
      {
        id: "loss-carry-forward",
        title: "Losses — CYLA, BFLA, CFL",
        subtitle: "Critical for F&O traders with prior-year business losses.",
        heroImage: "image23.jpg",
        portalPath: "Tax Computation → CYLA / BFLA / CFL",
        tips: [
          "F&O losses are non-speculative business losses.",
          "Intraday equity losses are speculative — limited set-off.",
        ],
        warnings: [],
        steps: [
          step({
            id: "cyla",
            title: "Verify CYLA",
            clickPath: "Schedule CYLA",
            plainEnglish: "Auto after income and BP schedules are complete.",
            action: "verify",
            image: "image23.jpg",
            ourValueKey: "income_heads.carry_forward_loss_set_off",
          }),
          step({
            id: "bfla",
            title: "Prior-year losses (BFLA)",
            clickPath: "Schedule BFLA",
            plainEnglish: "Enter last year's CFL figures.",
            action: "verify",
            image: "image23.jpg",
            ourValueKey: "income_heads.bf_loss_set_off_total",
          }),
          step({
            id: "cfl",
            title: "CFL for next year",
            clickPath: "Schedule CFL",
            plainEnglish: "Note business and capital losses carried forward.",
            action: "note",
            image: "image24.jpg",
          }),
        ],
      },
      9
    ),
    chapter(
      {
        id: "balance-sheet",
        title: "Balance sheet (Part A-BS)",
        subtitle: "Required when audited — we don't compute these figures yet.",
        heroImage: "image16.jpg",
        portalPath: "Part A-BS → Assets and Liabilities",
        tips: ["Use your CA's audited balance sheet if applicable."],
        warnings: [
          "Do not invent asset values — consult your CA for ITR-3 audit cases.",
        ],
        steps: [
          step({
            id: "bs-note",
            title: "Balance sheet disclosure",
            clickPath: "Part A-BS",
            plainEnglish:
              "Enter figures from your books or skip if the portal marks it optional for your case.",
            action: "skip",
            image: "image16.jpg",
          }),
          step({
            id: "schedule-al",
            title: "Schedule AL (if income > ₹50L)",
            clickPath: "Schedule AL",
            plainEnglish: "Asset-liability disclosure when threshold applies.",
            action: "skip",
            image: "image16.jpg",
          }),
        ],
      },
      10
    ),
  ];
}

// ── ITR-4 form-specific chapters ─────────────────────────────────────

function itr4IncomeChapters() {
  return [
    chapter(
      {
        id: "presumptive-business",
        title: "Presumptive income (44AD / 44ADA)",
        subtitle: "Enter turnover or receipts — portal applies the flat rate.",
        heroImage: "image17.jpg",
        portalPath: "Schedule BP → Presumptive Income",
        tips: [
          "44AD: 6% digital / 8% cash turnover for traders and small business.",
          "44ADA: 50% of professional receipts for freelancers.",
        ],
        warnings: [
          "Turnover above ₹2Cr (business) or receipts above ₹50L (profession) needs ITR-3.",
        ],
        steps: [
          step({
            id: "open-bp",
            title: "Open presumptive schedule",
            clickPath: "Gross Total Income → Business & Profession → Presumptive",
            plainEnglish: "Open Schedule BP presumptive section.",
            action: "click",
            image: "image17.jpg",
          }),
          step({
            id: "turnover",
            title: "Turnover / gross receipts",
            clickPath: "Schedule BP → Turnover",
            plainEnglish: "Total receipts for the year — match bank summary.",
            action: "enter",
            image: "image18.jpg",
            ourValueKey: "business.turnover",
          }),
          step({
            id: "44ad",
            title: "Presumptive income u/s 44AD",
            clickPath: "Schedule BP → 44AD",
            plainEnglish: "6% or 8% of turnover — our computed business profit.",
            action: "enter",
            image: "image18.jpg",
            ourValueKey: "business_income.presumptive_44ad",
          }),
          step({
            id: "44ada-receipts",
            title: "Professional receipts (44ADA)",
            clickPath: "Schedule BP → 44ADA receipts",
            plainEnglish: "Gross professional receipts when you are a freelancer.",
            action: "enter",
            image: "image19.jpg",
            ourValueKey: "business.gross_professional_receipts",
          }),
          step({
            id: "44ada-income",
            title: "Presumptive income u/s 44ADA",
            clickPath: "Schedule BP → 44ADA income",
            plainEnglish: "50% of professional receipts.",
            action: "enter",
            image: "image19.jpg",
            ourValueKey: "business_income.presumptive_44ada",
          }),
          step({
            id: "net-business",
            title: "Net business income",
            clickPath: "Schedule BP → Save",
            plainEnglish: "Final business head — verify against our summary.",
            action: "verify",
            image: "image19.jpg",
            ourValueKey: "business_income.net_business_income",
          }),
        ],
      },
      4
    ),
    chapter(
      {
        id: "presumptive-44ae",
        title: "Goods carriage (44AE) — optional",
        subtitle: "Only for truck/tempo owners. Skip for shop or freelance income.",
        heroImage: "image20.jpg",
        portalPath: "Schedule BP → 44AE",
        tips: ["Cannot combine 44AD and 44AE for the same business."],
        warnings: [
          "LastMinute does not compute 44AE yet — use portal calculator or your CA.",
        ],
        steps: [
          step({
            id: "44ae-vehicles",
            title: "Add goods carriages",
            clickPath: "Schedule BP → 44AE → Add vehicle",
            plainEnglish: "One row per truck/tempo owned during the year.",
            action: "enter",
            image: "image20.jpg",
          }),
          step({
            id: "44ae-skip",
            title: "Skip 44AE",
            clickPath: "Schedule BP",
            plainEnglish: "Skip this chapter if you file under 44AD or 44ADA only.",
            action: "skip",
            image: "image20.jpg",
          }),
        ],
      },
      5
    ),
    chapter(
      {
        id: "salary-if-any",
        title: "Salary (if salaried + business)",
        subtitle: "ITR-4 allows salary alongside presumptive business.",
        heroImage: "image18.jpg",
        portalPath: "Income from Salary/Pension",
        tips: [],
        warnings: ["Do not skip salary when employer TDS appears in 26AS."],
        steps: [
          step({
            id: "gross-salary",
            title: "Gross salary",
            clickPath: "Salary schedule",
            plainEnglish: "From Form 16 when you also had employment income.",
            action: "enter",
            image: "image18.jpg",
            ourValueKey: "income_heads.gross_salary",
          }),
          step({
            id: "net-salary",
            title: "Net salary",
            clickPath: "Salary → Save",
            plainEnglish: "Verify net salary matches our figure.",
            action: "verify",
            image: "image18.jpg",
            ourValueKey: "income_heads.net_salary_income",
          }),
        ],
      },
      6
    ),
    chapter(
      {
        id: "other-sources",
        title: "Other sources (interest only)",
        subtitle: "ITR-4 cannot report capital gains — switch to ITR-2 if you sold shares.",
        heroImage: "image20.jpg",
        portalPath: "Schedule OS",
        tips: [],
        warnings: [
          "Capital gains require ITR-2 — ITR-4 is not valid for share/property sales.",
        ],
        steps: [
          step({
            id: "fd-interest",
            title: "FD / savings interest",
            clickPath: "Schedule OS → Interest",
            plainEnglish: "Interest income from AIS / bank statements.",
            action: "enter",
            image: "image20.jpg",
            ourValueKey: "income_heads.fd_interest",
          }),
          step({
            id: "total-os",
            title: "Total other sources",
            clickPath: "Schedule OS → Save",
            plainEnglish: "Verify total matches our summary.",
            action: "verify",
            image: "image20.jpg",
            ourValueKey: "income_heads.total_other_income",
          }),
        ],
      },
      7
    ),
  ];
}

function sharedTail(startOrder) {
  const deductions = chapter(byId("deductions-tax-paid"), startOrder);
  const liability = chapter(byId("liability-confirm"), startOrder + 1);
  const pay = chapter(byId("pay-preview-submit"), startOrder + 2);
  const everify = chapter(byId("everify-receipt"), startOrder + 3);
  return [deductions, liability, pay, everify];
}

function buildWalkthrough(form, beforeTips, beforeWarnings, incomeChapters) {
  const tailStart = incomeChapters.at(-1).order + 1;
  const chapters = [
    beforeYouStart(
      form,
      `Confirm ${form} fits you, and keep documents ready.`,
      beforeTips,
      beforeWarnings
    ),
    chapter(byId("prep-26as-ais"), 1),
    pickFormChapter(form),
    chapter(byId("personal-regime-bank"), 3),
    ...incomeChapters,
    ...sharedTail(tailStart),
  ];
  return {
    schemaVersion: SCHEMA,
    form,
    assessmentYear: "AY 2026-27",
    portalUrl: PORTAL_URL,
    hasScreenshots: true,
    chapters,
  };
}

const walkthroughs = {
  "ITR-2": buildWalkthrough(
    "ITR-2",
    [
      "ITR-2 is for capital gains, foreign income, or total income above ₹50 lakh.",
      "Keep broker Tax P&L, Form 16 (if salaried), AIS, and 26AS open.",
    ],
    [
      "If you only have salary with no capital gains — ITR-1 may be enough.",
      "Do not invent numbers — copy from LastMinute when unlocked.",
    ],
    itr2IncomeChapters()
  ),
  "ITR-3": buildWalkthrough(
    "ITR-3",
    [
      "ITR-3 is for business/profession with books of account, or F&O traders.",
      "Keep P&L, broker statements, Form 16 (if any), AIS, and 26AS ready.",
    ],
    [
      "Freelancers under 44ADA with receipts under ₹50L may use ITR-4 instead.",
      "Balance sheet may be required if your accounts are audited.",
    ],
    itr3IncomeChapters()
  ),
  "ITR-4": buildWalkthrough(
    "ITR-4",
    [
      "ITR-4 is presumptive tax for small business (44AD) or professionals (44ADA).",
      "Keep bank receipts summary, Form 16 (if salaried), AIS, and 26AS ready.",
    ],
    [
      "Capital gains or foreign income require ITR-2/3 — not ITR-4.",
      "Cash receipts above 5% of turnover can disqualify presumptive scheme.",
    ],
    itr4IncomeChapters()
  ),
};

for (const [form, data] of Object.entries(walkthroughs)) {
  const slug = form.replace("-", "").toLowerCase(); // ITR-2 → itr2
  const out = join(DATA_DIR, `${slug}.json`);
  writeFileSync(out, `${JSON.stringify(data, null, 2)}\n`);
  console.log(
    `Wrote ${form}: ${data.chapters.length} chapters, ${data.chapters.reduce((n, c) => n + c.steps.length, 0)} steps → ${out}`
  );
}
