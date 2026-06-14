/** Phase 3 SEO articles (#13–#25 from SEO_GROWTH_PLAN.md) */
export const PHASE3_LEARN_ARTICLES = [
  {
    slug: "two-form-16-job-change",
    title: "Two Form 16s after a job change: combine salary and TDS correctly",
    description:
      "Switched jobs mid-year? Each employer deducted TDS separately — combined income often creates tax payable even when both certificates show zero balance.",
    readMinutes: 9,
    publishedAt: "2026-06-09",
    cluster: "form-16",
    tags: ["ITR", "Form 16", "job change", "TDS"],
    relatedGlossarySlugs: ["salary-income", "tds-schedule"],
    faqs: [
      {
        question: "Why do I owe tax when both Form 16s show nil balance?",
        answer:
          "Each employer calculated TDS as if they were your only income source. Combined salary can sit in a higher slab — the shortfall appears at annual filing, not on either Form 16 alone.",
      },
    ],
    body: `## The job-change tax surprise — explained simply

Imagine two employers each think you earn ₹6 lakh. They deduct TDS in lower slabs. Your **real** income is ₹12 lakh. Neither Form 16 warns you about the gap — but AIS usually shows **both** employers, and your annual return must combine them.

This is normal economics, not payroll fraud. It catches thousands of filers every July.

## What you should do

### 1. Collect both Form 16s (Part A + B)

- **Previous employer** — period before you left
- **Current employer** — rest of the year

Lost a copy? AIS Part A often lists both salary/TDS deductors — [download AIS](/learn/download-ais).

### 2. Add both salaries in ITR Schedule S

Enter **gross/taxable salary** from each Part B. Do not double-count overlapping months. Totals should match AIS salary lines for FY 2025-26.

### 3. Claim TDS from both TANs

Each Form 16 Part A maps to a row in [Form 26AS / TDS schedule](/glossary/tds-schedule). Verify **both** deductor PANs appear with matching amounts.

### 4. Compare regime on combined income

HRA and 80C apply on **total** salary — [old vs new regime](/learn/old-vs-new-regime) after both employers included.

### 5. Pay balance tax before e-verify

If computation shows [tax payable](/glossary/tax-payable), pay self-assessment challan on incometax.gov.in before filing.

## Common mistake

**Filing with only the current employer Form 16.** AIS exposes previous employer TDS — under-reporting salary triggers mismatch notices.

Second mistake: **expecting refund because each Form 16 shows refund** — combined liability may exceed total TDS.

## Reconciliation table

| Check | Source |
| Both salaries in return | Form 16 Part B × 2 |
| Both TDS credits | Part A + 26AS |
| AIS salary lines | Match combined total |
| Joining bonus / ESOP | Often only on one Form 16 |

See [AIS mismatch guide](/learn/ais-mismatch) before submit.

## Product tip

Upload current Form 16, then add previous employer from old PDF or AIS. [LastMinute ITR](/file/import/documents?source=form16) flags TDS gaps — you still file on incometax.gov.in.

## Related

- [File ITR without a CA](/learn/file-itr-without-ca)
- [Form 16 read guide](/learn/form-16-guide)
- [Last-minute checklist](/learn/last-minute-filing)`,
  },
  {
    slug: "bank-fd-interest-ais",
    title: "Bank FD interest in AIS: how to report and avoid notices",
    description:
      "Banks report FD interest to ITD even when TDS is zero. Missing it in your ITR is a top scrutiny trigger.",
    readMinutes: 7,
    publishedAt: "2026-06-09",
    relatedGlossarySlugs: ["other-sources-income", "tds-schedule"],
    body: `## AIS shows interest you forgot

**Annual Information Statement (AIS)** includes **interest on deposits** reported by banks and post offices. Form 16 does **not** include FD interest — many salaried filers only discover it in AIS.

Ignoring AIS interest lines causes **mismatch notices** even when tax is zero after TDS.

## Where FD interest goes in ITR

Report under **[other sources income](/glossary/other-sources-income)** (Schedule OS in ITR-2). ITR-1 allows simple other sources if eligibility rules met.

Include:

- Fixed deposit interest (cumulative and payout)
- Recurring deposit interest
- Savings account interest (if not already elsewhere)

## TDS on FD interest

Banks deduct **10% TDS** when interest exceeds thresholds (unless Form 15G/15H submitted). Claim TDS in [TDS schedule](/glossary/tds-schedule) only if Form 26AS matches.

**Seniors:** Claim **[Section 80TTB](/glossary/section-80ttb)** up to ₹50,000 — still **report full interest** first, then deduction.

## Reconciliation checklist

1. Download AIS JSON/PDF from incometax.gov.in
2. List every "Interest from deposit" line
3. Match bank statements / interest certificates
4. Add to return before regime comparison
5. Pay extra tax if TDS insufficient

## Form 15G/15H trap

Zero TDS does **not** mean zero tax. If interest is taxable after slabs, you owe **[tax payable](/glossary/tax-payable)** via challan.

## Related guides

- [Download AIS](/learn/download-ais)
- [AIS vs 26AS](/learn/ais-vs-26as)
- [AIS mismatch](/learn/ais-mismatch)

Import AIS alongside Form 16 — we flag interest lines not yet in your draft.`,
  },
  {
    slug: "e-verify-itr-guide",
    title: "How to e-verify your ITR: every method explained",
    description:
      "Filing is not complete until e-verification. Here is how Aadhaar OTP, net banking, DSC, and other options work.",
    readMinutes: 9,
    publishedAt: "2026-06-08",
    relatedGlossarySlugs: ["refund", "tax-payable"],
    body: `## Filing ≠ finished

After submitting ITR on incometax.gov.in, you must **e-verify within 30 days** (confirm current rule on portal). Unverified returns are treated as **invalid** — refunds stall and compliance clock does not start.

## E-verify methods (typical)

| Method | Who it suits |
| Aadhaar OTP | Most individuals with linked Aadhaar |
| Net banking | Account holders at eligible banks |
| DSC | Professionals, companies, high-volume filers |
| ATM EVC | Legacy; limited banks |
| Demat account | Some portals offer via NSDL/CDSL |

**Aadhaar OTP** is the fastest for most salaried filers — mobile number linked to Aadhaar receives OTP on portal.

## Step-by-step (Aadhaar OTP)

1. Log in to incometax.gov.in
2. Go to **e-File → Income Tax Returns → e-Verify Return**
3. Select return pending verification
4. Choose **Aadhaar OTP**
5. Enter OTP on mobile
6. Download acknowledgment

## If e-verify fails

- Aadhaar not linked → link at portal first
- Mobile not updated → update Aadhaar/mobile
- Bank net banking greyed out → use Aadhaar or another bank account

## After verification

- **Refund** processing begins (if applicable) — see [refund status guide](/learn/itr-refund-status)
- Keep **ITR-V** and computation PDF for seven years
- Companion guide from LastMinute ITR still helps for portal field entry — you file manually on ITD

## Belated and revised returns

Belated returns also need e-verify. Revised returns replace original after verification rules — check portal for same 30-day window.

## Pay before verify?

If **[tax payable](/glossary/tax-payable)** > 0, pay via challan **before or while filing** — e-verify does not collect tax automatically.`,
  },
  {
    slug: "itr-refund-status",
    title: "ITR refund status: how to check and what delays mean",
    description:
      "Track your refund on the IT portal, understand CPC processing stages, and fix bank validation failures.",
    readMinutes: 7,
    publishedAt: "2026-06-08",
    relatedGlossarySlugs: ["refund", "tds-schedule"],
    body: `## When you get a refund

A **[refund](/glossary/refund)** means TDS and advance tax exceeded final tax liability after e-verified ITR processing. Common for salaried employees with high Form 16 TDS and extra 80C at filing.

**Refund is not guaranteed** until CPC processes your return — ITD may adjust against outstanding demands.

## How to check status

1. Log in to incometax.gov.in
2. **e-File → Income Tax Returns → View Filed Returns** or **Refund Status**
3. Note processing stage: received → processed → refund issued

Refund amount and interest u/s 244A (if applicable) appear after processing.

## Typical timeline

| Stage | Indicative time |
| E-verify complete | Day 0 |
| CPC processing | 2–4 weeks (varies by season) |
| Refund to bank | Additional 1–2 weeks after processing |

Peak season (July–August) adds delay — not a product bug.

## Why refunds delay

- **TDS mismatch** — claimed credit not in 26AS
- **Bank account not pre-validated** — update IFSC/account on portal
- **Outstanding demand** — refund offset
- **Defective return notice** — respond before refund

## Negative payable vs refund

If computation shows **payable**, no refund until you pay and file correctly. Do not confuse AIS-added income with refund eligibility.

## Match TDS first

Reconcile [TDS schedule](/glossary/tds-schedule) with Form 26AS before expecting refund — largest cause of "refund pending" holds.

LastMinute ITR shows estimated refund from your draft — final amount is always ITD's processed figure.`,
  },
  {
    slug: "schedule-cg-explained",
    title: "Schedule CG explained for equity and mutual fund investors",
    description:
      "Capital gains schedule fields, STCG vs LTCG rates, and why AIS broker lines push you to ITR-2.",
    readMinutes: 10,
    publishedAt: "2026-06-07",
    relatedGlossarySlugs: ["capital-gains-schedule", "recommended-itr-form"],
    body: `## When Schedule CG applies

**Schedule CG** captures **[capital gains](/glossary/capital-gains-schedule)** — profit or loss from selling shares, mutual funds, property, gold, etc.

If you sold listed equity or MF units in the financial year, you generally need **ITR-2** (not ITR-1). See [ITR-1 vs ITR-2](/learn/itr-1-vs-itr-2).

## STCG vs LTCG (equity-oriented, indicative)

Rates and holding periods change with budget law — verify for AY 2026-27:

| Type | Typical holding | Tax treatment (check current law) |
| Short-term (STCG) | ≤ 12 months listed equity | Special rate |
| Long-term (LTCG) | > 12 months | Exemption limit + rate on balance |

Debt mutual funds and property follow **different** rules — do not reuse equity rates.

## Data sources

- Broker **tax P&L** (Zerodha, Groww, etc.)
- AIS **securities transactions**
- Form 16A TDS on sale (if any)

Broker P&L is a helper — you remain responsible for correct schedule entry on portal.

## Loss set-off and carry forward

Capital losses can offset gains within rules. Unused losses may **carry forward** for set-off in future years — filing is required to preserve carry-forward in many cases.

## Common mistakes

1. Filing ITR-1 with equity sales
2. Ignoring AIS broker lines
3. Wrong cost of acquisition for ESOP/allotted shares
4. Missing STT-relevant categories

## Related

- [Zerodha tax P&L guide](/learn/zerodha-tax-pnl-itr)
- [Capital gains glossary](/glossary/capital-gains-schedule)

Broker import is on our roadmap — today, use broker CSV/P&L and verify every line against AIS.`,
  },
  {
    slug: "zerodha-tax-pnl-itr",
    title: "Zerodha tax P&L: how to use it for ITR filing",
    description:
      "Download Console tax P&L, map figures to Schedule CG, and reconcile with AIS before filing ITR-2.",
    readMinutes: 8,
    publishedAt: "2026-06-07",
    relatedGlossarySlugs: ["capital-gains-schedule", "tds-schedule"],
    body: `## What Zerodha tax P&L is

Zerodha **Console → Reports → Tax P&L** summarises trades for the financial year — equity, F&O, commodities segments may appear separately.

It is a **starting point** for [Schedule CG](/glossary/capital-gains-schedule) and business schedules if you traded F&O.

## Download steps

1. Log in to console.zerodha.com
2. Reports → Tax P&L → select financial year
3. Download Excel/PDF
4. Split **equity delivery** vs **intraday** vs **F&O** — tax treatment differs

## Map to ITR

| P&L section | ITR area |
| Equity delivery gains/losses | Schedule CG |
| Intraday / F&O | Business income (ITR-3) often |

Misclassifying F&O as simple capital gains is a common error — see [F&O turnover guide](/learn/fn-o-turnover-itr3) if you traded derivatives.

## Reconcile with AIS

AIS shows **sale consideration** and sometimes TDS. Compare:

- Total sales per AIS vs broker P&L
- TDS credits → [TDS schedule](/glossary/tds-schedule)

## Groww and other brokers

Same workflow — export tax report, map to schedules, verify AIS. Groww import is **coming soon** in LastMinute ITR; manual entry remains required today.

## CTA

Capital gains push you to ITR-2 — confirm [recommended ITR form](/glossary/recommended-itr-form) before starting portal entry.`,
  },
  {
    slug: "80c-deduction-guide",
    title: "Section 80C deductions: full guide for salaried filers",
    description:
      "EPF, PPF, ELSS, LIC, tuition fees, and the ₹1.5 lakh cap — only in old tax regime for most filers.",
    readMinutes: 9,
    publishedAt: "2026-06-06",
    relatedGlossarySlugs: ["section-80c", "opt-out-of-new-tax-regime"],
    body: `## The ₹1.5 lakh cap

**[Section 80C](/glossary/section-80c)** bundles many investments into one **combined limit of ₹1.5 lakh** reducing taxable income in the **[old tax regime](/glossary/old-tax-regime)**.

New regime filers generally **cannot** claim 80C (except planning around employer NPS 80CCD(2)).

## What qualifies

- EPF (employee contribution)
- PPF, NSC, ELSS, tax-saving FD (5-year)
- LIC premiums
- Children's tuition fees (not hostel)
- Home loan **principal** repayment
- Sukanya Samriddhi, SCSS (within limits)

## Stacking with 80D

80C + **[80D](/glossary/section-80d)** health insurance often exceeds ₹2 lakh total deductions — key reason to [opt out of new regime](/glossary/opt-out-of-new-tax-regime) when rent/HRA also applies.

## Form 16 interaction

Employer may show 80C in Part B TDS calculation. Verify you do not **double-claim** when entering gross vs net salary in ITR.

## 80CCD(1B) extra

NPS **₹50,000** additional deduction is **separate** from 80C cap — do not count it inside ₹1.5L.

## Regime check

Before maximizing ELSS in March, run [old vs new comparison](/learn/old-vs-new-regime) — 80C only helps if you file old regime.

## Deep glossary

Read [Section 80C glossary](/glossary/section-80c) for examples, mistakes, and ITR field mapping.`,
  },
  {
    slug: "hra-exemption-itr",
    title: "HRA exemption in ITR: rent proofs, metro limits, and old regime rules",
    description:
      "Paying rent in Mumbai or Bangalore? HRA can cut taxable salary — but only in old regime, with receipts, and with landlord PAN when rent exceeds ₹1 lakh per year.",
    readMinutes: 9,
    publishedAt: "2026-06-06",
    cluster: "deductions",
    tags: ["ITR", "HRA", "old regime", "rent"],
    relatedGlossarySlugs: ["exempt-allowances-u-s-10", "salary-income"],
    faqs: [
      {
        question: "Can I claim HRA in the new tax regime?",
        answer:
          "Generally not for typical salaried employees opting into new regime. HRA exemption sits in exempt allowances u/s 10 — compare regimes before assuming rent saves tax.",
      },
    ],
    body: `## HRA is not an 80C deduction

**House Rent Allowance (HRA)** reduces [salary income](/glossary/salary-income) as an exempt [allowance u/s 10](/glossary/exempt-allowances-u-s-10) — not a Chapter VI-A line like 80C. Your Form 16 Part B may already show "HRA exemption" if payroll approved your rent declaration.

If you paid rent but got **no HRA component**, look at [Section 80GG](/glossary/section-80gg) instead (different rules — you cannot own a house in the city).

## How exemption is calculated (minimum of three)

1. Actual HRA received from employer
2. Rent paid minus 10% of salary (salary definition usually basic + DA for HRA)
3. **50%** of salary in metro (Delhi, Mumbai, Kolkata, Chennai) or **40%** elsewhere

Employers compute this in Form 16 when you submit rent receipts during the year.

## What you should do

- Collect **rent receipts** or registered agreement for FY 2025-26
- Get **landlord PAN** if annual rent **exceeds ₹1 lakh**
- Match Form 16 HRA exempt amount to your proofs before ITR entry
- Choose [old tax regime](/learn/old-vs-new-regime) if HRA is your biggest tax saver
- Run regime compare with rent — [LastMinute ITR](/file/import/documents?source=form16) highlights when Part B HRA suggests old regime edge

## Common mistake

**Claiming HRA while filing new regime.** Exemption will not apply — you lose expected savings and may owe balance tax.

Another: **Metro vs non-metro rate wrong** after moving cities mid-year — exemption depends on rent actually paid and city rules; stale payroll data causes Form 16 vs reality gaps.

**No HRA on Form 16 but claiming large HRA in ITR** without 80GG eligibility — scrutiny risk.

## ITR entry notes

Enter gross salary and allowance breakup per portal schedules — exemption flows from computation, not a standalone "HRA deduction" row like 80C.

## Related

- [Old vs new regime](/learn/old-vs-new-regime)
- [ITR-1 salaried guide](/learn/itr-1-salaried-guide)
- [Section 80C guide](/learn/80c-deduction-guide)

[Check your ITR with LastMinute](/file) before filing on incometax.gov.in.`,
  },
  {
    slug: "freelancer-44ada",
    title: "Section 44ADA for freelancers and consultants",
    description:
      "50% presumptive income when gross receipts ≤ ₹50 lakh — doctors, lawyers, designers, and consultants.",
    readMinutes: 9,
    publishedAt: "2026-06-05",
    relatedGlossarySlugs: ["presumptive-profession-income-u-s-44ada", "recommended-itr-form"],
    body: `## Presumptive tax for professionals

**Section 44ADA** lets specified professionals declare **50% of gross receipts** as taxable income when **gross receipts ≤ ₹50 lakh** (verify current threshold).

No full books required if eligible — file **ITR-4 (Sugam)** typically.

## Who qualifies

Doctors, lawyers, accountants, engineers, architects, consultants, and other notified professions — see current ITD list.

## Receipts vs cash

**Gross receipts** include all professional income — not just bank credits. AIS may show **194J TDS** from clients — reconcile.

## When 44ADA does not fit

- Receipts above threshold
- Opting out of presumptive scheme
- Mixed business (not profession) — may need 44AD or regular books

## Advance tax

Even on presumptive income, **[advance tax](/glossary/advance-self-assessment-tax)** may apply if liability exceeds ₹10,000 — pay instalments or self-assessment before filing.

## Salaried + freelance

Side consulting with salary → often **ITR-3 or ITR-4** depending on structure — not ITR-1. See [ITR form guide](/learn/itr-1-vs-itr-2).

## Glossary

[Presumptive profession income u/s 44ADA](/glossary/presumptive-profession-income-u-s-44ada) — engine field label explained.`,
  },
  {
    slug: "senior-citizen-80ttb",
    title: "ITR guide for senior citizens: slabs, 80TTB, pension, and AIS interest",
    description:
      "Age 60+? This guide covers pension vs family pension, FD interest in AIS, Section 80TTB up to ₹50,000, regime choice, and filing on incometax.gov.in without panic.",
    readMinutes: 10,
    publishedAt: "2026-06-05",
    cluster: "senior",
    tags: ["ITR", "senior citizen", "80TTB", "pension"],
    relatedGlossarySlugs: ["section-80ttb", "section-80tta"],
    faqs: [
      {
        question: "Do senior citizens get a higher basic exemption?",
        answer:
          "Under old regime, senior (60–79) and super senior (80+) filers have higher basic exemption thresholds than younger residents. New regime has adjusted slabs too — compare both on your pension and interest.",
      },
      {
        question: "Does Form 15H mean I skip reporting FD interest?",
        answer:
          "No. Form 15H stops TDS — you still report full interest in your return and claim 80TTB where eligible.",
      },
    ],
    body: `## Filing after 60 — what is different?

If you are **60 or older**, tax filing is still mostly ITR-1 or ITR-2 for pension-plus-interest cases — but the **details** differ: pension is taxed as salary, bank FD interest floods AIS, and **[Section 80TTB](/glossary/section-80ttb)** gives up to **₹50,000** deduction on deposit interest (vs ₹10,000 [80TTA](/glossary/section-80tta) for younger filers on savings only).

Super senior citizens (80+) get higher slab benefits under old regime. Set correct age in your profile — LastMinute ITR enables senior mode from your age band.

We are not a government service — you file and e-verify on **incometax.gov.in**.

## Pension vs family pension

| Type | Tax treatment (typical) |
| Pension from employer | Salary schedule — Form 16 or pension certificate |
| Family pension | Other sources — special deduction rules (one-third or ₹15,000, per current law) |

Do not mix them — misclassification triggers correction notices.

## FD interest and AIS — the senior filer trap

Banks report **every rupee** of FD interest in AIS even when TDS is zero (Form 15H on file). [Form 16](/learn/form-16-guide) will not list this — see [bank FD in AIS](/learn/bank-fd-interest-ais) and [AIS mismatch](/learn/ais-mismatch).

## Section 80TTB — report first, deduct second

1. Add **full** FD/savings interest to [other sources income](/glossary/other-sources-income)
2. Claim **80TTB** up to ₹50,000 in Schedule VI-A (confirm year’s law for regime)
3. Claim TDS in [TDS schedule](/glossary/tds-schedule) only if in Form 26AS

**80TTB generally helps in both old and new regimes** for eligible seniors — but slab comparison still matters for net tax.

## Regime choice for retirees

Heavy medical insurance (80D), SCSS/PPF interest strategy, and home-loan interest may favour **old regime**. Moderate pension with high 80TTB-eligible interest and low deductions may favour **new regime** with [87A rebate](/learn/87a-rebate-new-regime) — run numbers, do not guess. [Old vs new regime](/learn/old-vs-new-regime).

## What you should do

- Download AIS even if you "only have pension" — FD lines appear reliably
- Use [ITR-1 salaried guide](/learn/itr-1-salaried-guide) for simple pension + interest cases
- Plan e-verification — Aadhaar OTP needs linked mobile; arrange family help if needed ([e-verify guide](/learn/e-verify-itr-guide))
- [Import documents](/file/import/documents?source=form16) for estimate — file yourself on gov portal

## Common mistake

**Skipping ITR because TDS covered tax.** Refund claims, clean compliance for loans/visa, and loss carry-forward still need filing.

**Form 15H = no return needed** — wrong. Reporting obligation remains.

**Ignoring previous employer pension TDS** after partial-year work before retirement — AIS may show extra TDS lines.

## Related glossary

- [Section 80TTB](/glossary/section-80ttb) — examples and TDS interaction
- [Section 80D](/glossary/section-80d) — senior medical insurance caps

[Check your ITR with LastMinute](/file) · [File without CA guide](/learn/file-itr-without-ca)`,
  },
  {
    slug: "common-itr-mistakes",
    title: "10 ITR mistakes that cause notices, delays, and tax demands",
    description:
      "Wrong form, missing AIS interest, regime errors, and TDS mismatches — fix these before e-verify on incometax.gov.in.",
    readMinutes: 10,
    publishedAt: "2026-06-04",
    cluster: "mistakes",
    tags: ["ITR", "mistakes", "AIS", "notices"],
    relatedGlossarySlugs: ["recommended-itr-form", "tds-schedule"],
    faqs: [
      {
        question: "What is the #1 last-minute mistake?",
        answer:
          "Filing with Form 16 only while AIS shows bank interest or a previous employer. Always download AIS before submit.",
      },
    ],
    body: `## Notices cost more time than a careful hour

These ten mistakes show up repeatedly in July mismatch processing and refund holds. None require a CA to **avoid** — they require AIS review and honest numbers before you click submit on incometax.gov.in.

Pair this with [last-minute filing checklist](/learn/last-minute-filing) if the clock is ticking.

### 1. Wrong ITR form

ITR-1 with equity sales → defective return. Use [ITR-1 vs ITR-2](/learn/itr-1-vs-itr-2).

### 2. Missing bank FD interest

AIS shows ₹35,000 interest; return shows zero → scrutiny. [FD in AIS guide](/learn/bank-fd-interest-ais).

### 3. Previous employer skipped

Only current [Form 16](/learn/form-16-guide) entered → under-reporting. [Two Form 16s](/learn/two-form-16-job-change).

### 4. Wrong tax regime

80C or [HRA](/learn/hra-exemption-itr) claimed in new regime → no benefit. Compare [old vs new](/learn/old-vs-new-regime).

### 5. TDS not in 26AS

Claiming credit employer has not deposited → refund stuck. Match [TDS schedule](/glossary/tds-schedule).

### 6. No advance/self-assessment tax when due

Large capital gains or freelance income → interest u/s 234B/C. Pay before filing.

### 7. Skipping AIS entirely

[AIS mismatch](/learn/ais-mismatch) lines ignored → automated variance.

### 8. House property category wrong

Let-out vs self-occupied → wrong 24(b) interest cap.

### 9. Capital gains in wrong schedule

Broker P&L not mapped to [Schedule CG](/glossary/capital-gains-schedule).

### 10. No e-verify within 30 days

Return invalid — [e-verify guide](/learn/e-verify-itr-guide).

## What you should do

Import Form 16 + review AIS → regime compare → resolve mismatches → pay if payable → file → e-verify. [LastMinute pre-submit checks](/file) target items 1–7 when data is imported.

## Common mistake (meta)

**Rushing at 11:59 pm without AIS refresh.** May AIS misses June employer TDS updates — download again 48 hours before submit.

## Related

- [File ITR without CA](/learn/file-itr-without-ca)
- [AIS vs 26AS](/learn/ais-vs-26as)

[Check your ITR with LastMinute](/file)`,
  },
  {
    slug: "fn-o-turnover-itr3",
    title: "F&O turnover and when you need ITR-3",
    description:
      "Derivative trading is usually business income — turnover rules, tax audit thresholds, and ITR-3 vs ITR-4.",
    readMinutes: 10,
    publishedAt: "2026-06-04",
    relatedGlossarySlugs: ["business-profession-schedule", "recommended-itr-form"],
    body: `## F&O is not simple capital gains

**Futures & options** income is typically **business income** (non-speculative or speculative per rules) — reported in **[Schedule BP](/glossary/business-profession-schedule)**, not Schedule CG.

Most active F&O traders file **ITR-3**.

## Turnover calculation

Turnover for F&O is **not** contract value alone — ITD guidance uses sum of absolute profits and losses in many audit contexts. Broker tax P&L helps but consult current audit thresholds.

## Tax audit u/s 44AB

High turnover or losses may trigger **audit requirement** — verify AY 2026-27 limits with a qualified professional if you traded heavily.

## ITR-4 usually not for F&O

Presumptive **44AD** is for eligible businesses — F&O traders generally **cannot** use ITR-4 Sugam for derivative income.

## Salary + F&O

Dual income → combine salary from Form 16 with F&O P&L → often ITR-3 with both salary and BP schedules.

## AIS broker lines

Reconcile broker AIS with Zerodha/other P&L — see [Zerodha tax P&L](/learn/zerodha-tax-pnl-itr).

## Advance tax

Active traders often owe **[advance tax](/glossary/advance-self-assessment-tax)** quarterly — missing instalments adds interest at filing.

F&O companion steps are on our roadmap — today use broker reports and qualified advice for audit cases.`,
  },
  {
    slug: "belated-return-penalty",
    title: "Belated ITR: penalties, late fee u/s 234F, and interest",
    description:
      "File after 31 July — late fee, interest u/s 234A, and what you lose by missing the original due date.",
    readMinutes: 8,
    publishedAt: "2026-06-03",
    relatedGlossarySlugs: ["advance-self-assessment-tax", "tax-payable"],
    body: `## Missing 31 July is not the end

Most individuals can still file a **belated return** after the original due date — but **late fee u/s 234F**, **interest**, and some **loss carry-forward** restrictions may apply (verify current law for AY 2026-27).

See also [ITR deadline guide](/learn/itr-deadline-2026).

## Late fee u/s 234F (indicative)

| Return filed | Typical late fee |
| Before 31 Dec of assessment year | Lower tier (e.g. ₹5,000) |
| After 31 Dec | Higher tier (e.g. ₹10,000) |

Exact amounts follow Finance Act — confirm on portal for your AY.

## Interest charges

- **234A** — on unpaid tax from original due date
- **234B/C** — advance tax shortfall if applicable

Pay **[tax payable](/glossary/tax-payable)** via challan when filing belated return.

## What you may lose

- Some **loss carry-forward** benefits (except house property loss in many cases)
- Time for revised return window — still bounded

## Still worth filing

Even with penalty:

- Claim **[refund](/glossary/refund)** of excess TDS
- Report AIS income to avoid bigger notices
- Clean compliance record

## Belated + e-verify

Same [e-verify rules](/learn/e-verify-itr-guide) apply — 30 days from filing.

## Last-minute path

If you are past deadline, start with Form 16 + AIS import — pay late fee and balance tax in same filing session on portal.

LastMinute ITR helps compute payable before you reach incometax.gov.in — penalties are assessed by ITD on final processing.`,
  },
];
