import type { LearnArticle } from "./learn-articles";

export const SALARIED_ARTICLES_1: LearnArticle[] = [
  {
    slug: "multiple-form-16-job-switch",
    title: "How to File ITR with Multiple Form 16s After a Job Switch",
    description: "Changed jobs this year? Learn how to combine multiple Form 16s, recalculate your tax liability, and file your ITR correctly without paying penalties.",
    readMinutes: 7,
    publishedAt: "2026-06-15",
    cluster: "form-16",
    tags: ["Form 16", "Job Switch", "ITR Filing"],
    relatedGlossarySlugs: ["form-16", "tds-schedule"],
    faqs: [
      {
        question: "Can I just upload the Form 16 from my current employer?",
        answer: "No. You must report income from all employers during the financial year. Ignoring a previous employer's Form 16 will lead to a tax notice for under-reporting income."
      },
      {
        question: "Why is there extra tax payable when I combine my Form 16s?",
        answer: "Both employers likely gave you the benefit of the basic exemption limit and standard deduction. When you combine the incomes, these benefits can only be claimed once, pushing you into a higher tax slab."
      }
    ],
    body: `## The Job Switch Tax Trap

Congratulations on the new job! While a salary hike is great, switching jobs in the middle of the financial year often leads to a nasty surprise during tax season: **extra tax payable**.

If you worked for two employers between April 1 and March 31, you will have two Form 16s. Here is how to handle them without getting a notice from the Income Tax Department.

## Why You Owe Extra Tax

When you join a new company, they ask for your previous income details (usually via Form 12B). If you didn't provide this, your new employer calculated your TDS assuming they were your only source of income.

This means:
1. **Double basic exemption:** Both employers gave you the ₹3 lakh tax-free limit (new regime).
2. **Double standard deduction:** Both employers gave you the ₹75,000 standard deduction.
3. **Lower tax slabs:** Your income was split, keeping you in lower tax brackets for TDS purposes.

When you file your ITR, your total income is combined. The duplicate benefits are reversed, pushing you into a higher tax slab and creating a tax due.

## The numbers: what gets reversed when you combine

A "deduction" is simply an amount the law lets you subtract from salary before tax is charged. The standard deduction is a flat one. When two employers both apply it, you have claimed it twice — and the portal allows it only once.

| Benefit each employer applied | Per employer | Allowed for full year |
| Basic exemption (new regime) | Rs 3,00,000 | Rs 3,00,000 |
| Standard deduction u/s 16(ia) | Rs 75,000 | Rs 75,000 |

**The standard deduction is capped at Rs 75,000 (new regime) or Rs 50,000 (old regime) for the whole year, no matter how many employers you had. Source: Income Tax Act Section 16(ia), Finance Act 2024.**

## Step-by-Step Guide to Filing with Two Form 16s

### Step 1: Gather Your Documents
Download Part A and Part B of Form 16 from **both** employers. Also, download your AIS (Annual Information Statement) and Form 26AS from the income tax portal to ensure all TDS is reflected.

### Step 2: Combine Your Salary Income
Add the "Gross Salary" from both Form 16s. 
*Do not* add the standard deduction twice. You can only claim a maximum of ₹75,000 (new regime) or ₹50,000 (old regime) for the entire year, regardless of how many employers you had.

### Step 3: Combine Your Deductions (Old Regime)
If you are opting for the old tax regime, combine your Section 80C investments (EPF from both employers, PPF, ELSS, etc.). Remember, the maximum limit remains ₹1.5 lakh.

### Step 4: Calculate Total Tax and Deduct TDS
Calculate your total tax liability on the combined income. Then, subtract the total TDS deducted by *both* employers (as shown in your Form 26AS).

### Step 5: Pay the Balance Tax
If there is a shortfall, you must pay it as Self-Assessment Tax (the balance tax you clear yourself before filing) before submitting your ITR. Filing with tax payable will render your return defective.

## What you should do

1. Download Part A and Part B of Form 16 from every employer of the year
2. Add the gross salaries, then apply the standard deduction and basic exemption only once
3. Total the TDS from all employers and reconcile it with Form 26AS
4. Pay any balance as self-assessment tax, then file and e-verify on incometax.gov.in within 30 days

## Common mistake

**Filing with only your current employer's Form 16.** The earlier salary still sits in your AIS against your PAN, so leaving it out is under-reporting and the portal will flag the gap.

## The Easy Way: Use LastMinute ITR

Doing this manually on the government portal requires filling out multiple salary schedules and doing the math yourself. 

With **LastMinute ITR**, you can simply upload both your Form 16 PDFs. Our system automatically combines your incomes, applies the standard deduction only once, and calculates your exact tax liability. We even compare the old and new regimes on your combined income to ensure you don't pay a rupee more than necessary.

[Upload your Form 16s now](/file/import/documents?source=form16) to see your combined computation.`
  },
  {
    slug: "switch-tax-regime-at-itr-filing",
    title: "Can You Switch Tax Regimes While Filing Your ITR?",
    description: "Your employer deducted TDS under the new regime, but the old regime saves you more. Find out how to switch tax regimes at the time of filing your ITR.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "regime",
    tags: ["New Regime", "Old Regime", "TDS"],
    relatedGlossarySlugs: ["opt-out-of-new-tax-regime", "section-80c"],
    faqs: [
      {
        question: "My employer deducted TDS under the new regime. Am I stuck with it?",
        answer: "No. Salaried individuals can choose either the old or new tax regime at the time of filing their ITR, regardless of what they declared to their employer."
      },
      {
        question: "Do I need to submit proofs to the income tax department if I switch to the old regime?",
        answer: "No, you don't need to attach proofs to your ITR. However, you must keep the rent receipts and investment proofs safely with you in case the tax department asks for them later."
      }
    ],
    body: `## The April Declaration vs. The July Reality

At the start of the financial year, your HR department asked you to choose between the old and new tax regimes. Based on your choice, they deducted TDS every month. 

But what if you chose the new regime in April, and then made a last-minute PPF investment or started paying high rent? Can you switch to the old regime while filing your ITR in July?

**Yes, absolutely.**

## Salaried Employees Have the Freedom to Choose

For salaried individuals (with no business income), the choice made to the employer is **not final**. The Income Tax Act allows you to evaluate your actual income and investments at the end of the year and choose the regime that results in the lowest tax liability when filing your return.

### Scenario A: Employer used New Regime, you want Old Regime
If your employer deducted TDS under the new regime, they didn't consider your 80C investments or HRA. When you file your ITR under the old regime, you will manually enter these deductions. Your tax liability will drop, and you can claim a **refund** of the excess TDS deducted by your employer.

### Scenario B: Employer used Old Regime, you want New Regime
If you declared investments to your employer but failed to actually make them, the old regime might now cost you more. You can switch to the new regime while filing. Since the new regime has lower slab rates, you might still get a refund, or you might have to pay a little extra tax depending on your exact numbers.

## Why the regime matters: the two menus

The "regime" is just which set of tax rules you pick. New regime has lower slab rates and a bigger standard deduction but almost no other deductions. Old regime has higher slabs but lets you subtract 80C, HRA and home-loan interest.

| Feature | New regime | Old regime |
| Standard deduction | Rs 75,000 | Rs 50,000 |
| 80C, 80D, HRA | Not allowed | Allowed |
| 87A rebate covers income up to | Rs 12,00,000 | Rs 5,00,000 |

**Since AY 2024-25 the new regime is the default; the Income Tax Department reported the large majority of filers now choose it. Source: Income Tax Dept / CBDT filing statistics, AY 2024-25.**

## How to Make the Switch on the Portal

When filing on incometax.gov.in, the system defaults to the new tax regime. If you want to switch to the old regime, you must explicitly select the option to "Opt out of the new tax regime" in the personal information section.

*Note: If you have business or professional income (including freelance income under Section 44ADA), the rules for switching regimes are much stricter and require filing Form 10-IEA.*

## What you should do

1. List the deductions you actually have proof for (rent receipts, 80C, 80D), not what you planned to invest
2. Compute your tax under both regimes on your real numbers, including any AIS interest
3. If the old regime wins, select "Opt out of the new tax regime" before you submit
4. Keep rent and investment proofs safe for seven years

## Common mistake

**Assuming your employer's TDS regime is final.** Payroll may have deducted under the new regime, but your filing choice can differ. Just remember to pay any balance tax if the old regime leaves a shortfall.

## Let LastMinute ITR Do the Math

Figuring out which regime is better requires calculating your taxes twice. 

When you upload your Form 16 on **LastMinute ITR**, our system automatically runs your numbers through both the old and new regime tax slabs. We instantly show you which option saves you more money, taking the guesswork out of your filing.

[Compare your tax regimes automatically](/file/import/documents?source=form16) before you file.`
  },
  {
    slug: "how-to-read-form-16",
    title: "How to Read Form 16 Part A and Part B Like a Pro",
    description: "Decode your Form 16 easily. Understand what Part A and Part B contain, how to check your TDS details, and where to find your salary breakdown for ITR.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "form-16",
    tags: ["Form 16", "TDS", "Salary"],
    relatedGlossarySlugs: ["form-16", "tds"],
    faqs: [
      {
        question: "What is the difference between Part A and Part B of Form 16?",
        answer: "Part A shows the total tax deducted (TDS) and deposited with the government. Part B provides the detailed breakdown of your salary, allowances, and deductions."
      },
      {
        question: "Why does my Form 16 show zero tax deducted?",
        answer: "If your total income was below the taxable limit (e.g., under ₹12 lakhs in the new regime for AY 2026-27), your employer is not required to deduct TDS. You should still file your ITR."
      }
    ],
    body: `## Demystifying Your Tax Certificate

Your employer just emailed you a PDF with a lot of numbers and tables. This is your Form 16, the most important document for filing your Income Tax Return (ITR). 

While it looks intimidating, reading a Form 16 is simple once you know where to look. It is divided into two main sections: **Part A** and **Part B**.

## Part A: The TDS Summary

Part A is generated by the government's TRACES portal, not your employer's payroll software. It is proof that the tax deducted from your salary actually reached the government.

**Key things to check in Part A:**
1. **PAN and TAN:** Ensure your PAN is correct. Also, note your employer's TAN (Tax Deduction and Collection Account Number), which you'll need for your ITR.
2. **Assessment Year:** Make sure it's for the correct year (e.g., AY 2026-27 for income earned between April 2025 and March 2026).
3. **Summary of Tax Deducted:** This table shows how much TDS was deducted each quarter. The "Total Tax Deposited" amount should match the TDS credit shown in your Form 26AS.

## Part B: The Salary Breakdown

Part B is prepared by your employer. It details how they arrived at the TDS amount in Part A. This is the section you'll use to fill out your ITR.

**Key things to check in Part B:**
1. **Gross Salary:** This is your total earnings before any exemptions.
2. **Exempt Allowances (Section 10):** This lists allowances that are not taxed, such as HRA (House Rent Allowance) or LTA (Leave Travel Allowance).
3. **Standard Deduction:** A flat deduction (₹75,000 in the new regime or ₹50,000 in the old regime) subtracted from your salary.
4. **Deductions under Chapter VI-A:** If you opted for the old regime, this section lists your 80C (EPF, LIC), 80D (Health Insurance), and other investments.
5. **Net Tax Payable:** The final tax calculated on your income, which should match the total TDS deducted in Part A.

## What If You Find a Mistake?

If your PAN is wrong, or the TDS amount in Part A doesn't match your payslips, contact your HR or payroll department immediately. They will need to file a revised TDS return to correct the error.

## Part A vs Part B at a glance

| Section | Who prepares it | What it proves |
| Part A | TRACES (government) | TDS deducted and deposited each quarter |
| Part B | Your employer | Salary, exemptions and deduction breakdown |

**Employers must issue Form 16 by 15 June following the financial year, and the standard deduction baked into Part B is Rs 75,000 in the new regime. Source: Rule 31 of the Income Tax Rules; Finance Act 2024.**

## What you should do

1. Confirm your PAN, the employer TAN and the Assessment Year on Part A
2. Match the Part A "Total Tax Deposited" against your Form 26AS
3. Use Part B figures (gross salary, Section 10 exemptions, deductions) to fill your ITR
4. Flag any mismatch to payroll before you file

## Common mistake

**Assuming zero TDS means you need not file.** Form 16 can show nil tax when income is below the limit, but you still file to claim refunds or report other income such as FD interest.

## Skip the Manual Data Entry

Typing numbers from Part B into the income tax portal is tedious and prone to errors. 

With **LastMinute ITR**, you don't have to read Form 16 at all. Just [upload your Form 16 PDF](/file/import/documents?source=form16), and our system will extract your gross salary, exemptions, deductions, and employer details perfectly in seconds.`
  },
  {
    slug: "file-itr-without-form-16",
    title: "How to File Your ITR If You Don't Have Form 16",
    description: "Employer delayed or refused to give your Form 16? Don't miss the deadline. Learn how to file your ITR using salary slips, Form 26AS, and AIS data.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "form-16",
    tags: ["Form 16", "Salary Slips", "AIS"],
    relatedGlossarySlugs: ["ais", "form-26as"],
    faqs: [
      {
        question: "Can I file my ITR without Form 16?",
        answer: "Yes. Form 16 is a facilitating document, not a mandatory one. You can file your return using your salary slips and Form 26AS."
      },
      {
        question: "What if my employer deducted TDS but didn't issue Form 16?",
        answer: "Check your Form 26AS and AIS. If the TDS reflects there, you can safely claim it in your ITR using the employer's TAN from the 26AS statement."
      }
    ],
    body: `## Don't Let a Missing Form 16 Stop You

Employers are legally required to issue Form 16 by June 15th. However, startups, struggling companies, or former employers sometimes delay or fail to provide it. 

With the July 31st deadline approaching, waiting for Form 16 can lead to late filing penalties. The good news? **You don't actually need Form 16 to file your ITR.**

Here is how to file your return using alternative documents.

## Step 1: Collect Your Salary Slips
Gather all your payslips for the financial year (April to March). 
Add up your "Basic Salary," "HRA," "Special Allowance," and any other taxable components to calculate your **Gross Salary**.

## Step 2: Calculate Your Exemptions
If you are opting for the old tax regime, calculate your exempt allowances.
- **HRA:** Calculate the exempt portion based on your rent receipts.
- **LTA:** If you submitted travel bills, calculate the exempt amount.
Subtract these from your Gross Salary.

## Step 3: Claim the Standard Deduction
Subtract the standard deduction from your salary. For AY 2026-27, this is ₹75,000 under the new regime and ₹50,000 under the old regime.

## Step 4: Verify TDS with Form 26AS and AIS
This is the most crucial step. Log in to the income tax portal and download your **Form 26AS** and **AIS (Annual Information Statement)**.
- Look for the TDS deducted by your employer.
- Note down the employer's TAN (Tax Deduction Account Number) and name, which you will need to enter in your ITR.
- Ensure the total TDS in 26AS matches the tax deducted on your payslips.

## Step 5: Add Your Deductions (Old Regime)
If filing under the old regime, add up your EPF contributions from your payslips. Combine this with your PPF, LIC, and ELSS investments for your Section 80C claim. Add any health insurance premiums under Section 80D.

## Step 6: File Your ITR
Enter these calculated figures into the relevant salary schedules on the income tax portal. 

## Why you should not wait for Form 16

Missing the deadline is far costlier than filing without the certificate. A late return attracts a fee under Section 234F.

| Situation | Late fee u/s 234F |
| Total income up to Rs 5,00,000 | Rs 1,000 |
| Total income above Rs 5,00,000 | Rs 5,000 |

**Filing after the due date triggers a fee of up to Rs 5,000 under Section 234F, plus interest on any unpaid tax. Source: Income Tax Act Section 234F.**

## Common mistake

**Guessing your gross salary instead of reconciling it.** If your computed salary differs sharply from what your employer reported in your AIS, the portal can raise a query. Always tally payslips against Form 26AS and AIS first.

## A Word of Caution
Filing without Form 16 requires careful calculation. If your calculated gross salary differs significantly from what the employer reported to the tax department (visible in your AIS), you might receive a notice asking for clarification. Always keep your payslips and bank statements handy as proof.

If you have your Form 16, filing is much easier. You can simply [upload it to LastMinute ITR](/file/import/documents?source=form16) to automate the process.`
  },
  {
    slug: "claim-hra-forgot-proofs-employer",
    title: "How to Claim HRA If You Forgot to Submit Rent Proofs",
    description: "Missed the deadline to submit rent receipts to your employer? You can still claim your HRA exemption while filing your ITR. Here is a step-by-step guide.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["HRA", "Exemptions", "Rent"],
    relatedGlossarySlugs: ["hra", "old-regime"],
    faqs: [
      {
        question: "Can I claim HRA directly in my ITR if it's not in my Form 16?",
        answer: "Yes, you can claim the HRA exemption directly while filing your ITR under the old tax regime, even if your employer didn't factor it into your Form 16."
      },
      {
        question: "Do I need to upload rent receipts while filing ITR?",
        answer: "No, you don't upload documents while filing. However, you must keep the rent agreement, receipts, and landlord's PAN (if rent > ₹1 lakh/year) safe in case of a tax notice."
      }
    ],
    body: `## Missed the HR Deadline? Don't Panic

Every January, HR departments send frantic emails asking for investment proofs and rent receipts. If you missed the deadline, your employer calculated your TDS without giving you the House Rent Allowance (HRA) exemption. 

This means your Form 16 shows a higher taxable income, and you probably paid excess tax. 

The good news is that **you can still claim your HRA exemption directly while filing your ITR** and get that excess tax back as a refund. Here is how.

*Note: HRA exemption is only available if you opt for the **Old Tax Regime**.*

## Step 1: Calculate Your HRA Exemption
The income tax portal won't calculate this for you; you have to enter the exact exempt amount. The exemption is the **lowest** of these three:
1. Actual HRA received from your employer (check your payslips).
2. Actual rent paid minus 10% of your basic salary.
3. 50% of basic salary (if living in a metro city) or 40% of basic salary (non-metro).

## Step 2: Adjust Your Form 16 Numbers
When you start filing your ITR, the portal will pre-fill your salary details from your employer's data. 
- You will see your Gross Salary.
- Under the "Allowances exempt u/s 10" section, select "10(13A) - Allowance to meet expenditure incurred on house rent".
- Enter the exempt amount you calculated in Step 1.

The portal will automatically subtract this from your gross salary, lowering your taxable income.

## Step 3: Claim Your Refund
Because your taxable income is now lower than what your employer calculated, your total tax liability will decrease. Since your employer already deducted higher TDS, the difference will be shown as a **Refund Due** when you complete your ITR.

## Keep Your Proofs Ready
While you don't attach rent receipts to your ITR, claiming HRA directly often triggers a verification check by the tax department. Ensure you have:
- A valid rent agreement.
- Rent receipts or bank statements showing rent transfers.
- The landlord's PAN (mandatory if annual rent exceeds ₹1,00,000).

## The metro vs non-metro difference

The third cap in the HRA formula depends on where you live. HRA is the House Rent Allowance your employer pays toward rent; the exempt slice is the lowest of the three tests.

| City type | Salary-based cap on HRA | Examples |
| Metro | 50% of basic salary | Delhi, Mumbai, Kolkata, Chennai |
| Non-metro | 40% of basic salary | Pune, Bengaluru, Jaipur, all others |

**Landlord PAN is mandatory once annual rent crosses Rs 1,00,000, and only metro cities get the 50% cap. Source: Income Tax Act Section 10(13A) read with Rule 2A.**

## What you should do

1. Pick the lowest of the three HRA amounts as your exemption
2. Enter it under "10(13A)" in the exempt-allowances section while filing the old regime
3. Keep the rent agreement, receipts and landlord PAN ready in case of a query

## Common mistake

**Claiming HRA in the new regime.** The HRA exemption only exists under the old regime, so a new-regime filer who enters it gains nothing and risks a mismatch.

## Make It Easier with LastMinute ITR
Calculating HRA manually can be tricky. When you use **LastMinute ITR**, you can simply input your rent paid and city type. We will calculate the exact exemption according to the rules and show you how much refund you can expect under the old regime.

[Start your tax calculation](/file) to see your potential HRA refund.`
  },
  {
    slug: "standard-deduction-new-vs-old-regime",
    title: "Standard Deduction: New vs Old Tax Regime Rules",
    description: "Understand how the ₹75,000 standard deduction works in the new tax regime for AY 2026-27, and how it compares to the old regime's ₹50,000 deduction.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "regime",
    tags: ["Standard Deduction", "New Regime", "Salary"],
    relatedGlossarySlugs: ["standard-deduction-u-s-16-ia", "new-regime"],
    faqs: [
      {
        question: "Is the standard deduction available in the new tax regime?",
        answer: "Yes. For AY 2026-27, the standard deduction in the new tax regime has been increased to ₹75,000 for salaried employees and pensioners."
      },
      {
        question: "Do I need to submit any bills to claim the standard deduction?",
        answer: "No. It is a flat deduction applied automatically to your salary or pension income. No proofs, bills, or receipts are required."
      }
    ],
    body: `## The Easiest Tax Benefit You'll Ever Claim

The standard deduction is the simplest tax benefit available to salaried employees and pensioners. You don't need to make investments, submit rent receipts, or keep track of medical bills to claim it. It is a flat amount subtracted directly from your gross salary, reducing your taxable income.

However, the rules and amounts differ depending on which tax regime you choose for Assessment Year (AY) 2026-27.

## Standard Deduction in the New Tax Regime

To make the new tax regime more attractive, the government recently increased the standard deduction for those who opt for it.

- **Amount:** ₹75,000
- **Eligibility:** All salaried employees and pensioners opting for the new regime.
- **Impact:** If your salary is ₹10 lakhs, your taxable salary automatically becomes ₹9.25 lakhs before applying the tax slabs.

This increased deduction is a major reason why the new regime is now the default and often the better choice for taxpayers with fewer investments.

## Standard Deduction in the Old Tax Regime

If you stick with the old tax regime to claim benefits like 80C, HRA, and home loan interest, the standard deduction remains unchanged.

- **Amount:** ₹50,000
- **Eligibility:** All salaried employees and pensioners opting for the old regime.

## New vs old at a glance

The standard deduction is a flat amount cut from your salary with no bills required. The new regime gives a bigger one to make up for the deductions it removes.

| Regime | Standard deduction | Tax on Rs 10L salary base after it |
| New regime | Rs 75,000 | Applied to Rs 9,25,000 |
| Old regime | Rs 50,000 | Applied to Rs 9,50,000 |

**The new-regime standard deduction was raised to Rs 75,000 for AY 2026-27, while the old regime stays at Rs 50,000. Source: Finance Act 2024, Section 16(ia).**

## How to Claim It

You don't have to do much! 

If you receive a Form 16, your employer has already subtracted the standard deduction under Section 16(ia) in Part B. 

When you file your ITR on the government portal, the system automatically applies the correct standard deduction based on the regime you select. You just need to verify that it has been applied.

## A Quick Note on Multiple Employers
If you switched jobs and have salary income from two employers during the year, **you cannot claim the standard deduction twice**. The maximum deduction allowed for the entire financial year is ₹75,000 (new regime) or ₹50,000 (old regime), regardless of how many companies you worked for.

## What you should do

1. Confirm which regime you are filing under so you apply the right amount
2. Check that your Form 16 already shows the deduction under Section 16(ia)
3. If you had multiple employers, make sure the deduction appears only once in total

## Common mistake

**Adding the standard deduction to each employer's salary separately.** It is a once-a-year benefit, so a double claim inflates your refund and invites a correction notice.

When you [upload your Form 16s to LastMinute ITR](/file/import/documents?source=form16), our system automatically caps the standard deduction correctly, ensuring you don't make a calculation error that could lead to a tax notice.`
  },
  {
    slug: "notice-period-pay-taxability",
    title: "Notice Period Pay Taxability: Do You Pay Tax on It?",
    description: "Did your ex-employer deduct notice period pay from your full and final settlement? Learn how this affects your taxable income and ITR filing process.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "salaried",
    tags: ["Job Switch", "Notice Period", "Salary"],
    relatedGlossarySlugs: ["form-16", "tds"],
    faqs: [
      {
        question: "Can I claim a tax deduction for notice period pay recovered by my employer?",
        answer: "Under current income tax laws, there is no specific provision to deduct notice period pay from your taxable income. You are generally taxed on the gross salary due to you."
      },
      {
        question: "What if my new employer reimburses my notice period buyout?",
        answer: "If your new employer pays for your notice period buyout, that amount is considered part of your salary from the new employer and is fully taxable."
      }
    ],
    body: `## The Double Whammy of Leaving Early

When you resign from a job but can't serve the full notice period, your employer will usually recover "notice period pay" from your full and final (F&F) settlement. 

For example, if your monthly salary is ₹1 lakh and you leave a month early, the company deducts ₹1 lakh from your final payout.

But here is the painful question: **Do you still have to pay income tax on that ₹1 lakh, even though you never received it?**

Unfortunately, the answer under Indian tax law is usually **Yes**.

## Why You Are Taxed on Money You Didn't Get

The Income Tax Act taxes salary on a "due or receipt basis, whichever is earlier." 

When your employer generates your payslip, the salary becomes "due" to you. The deduction for the unserved notice period is treated as an internal settlement or a breach of contract penalty, not a reduction in your gross salary. 

Therefore, your Form 16 will likely show your gross salary *including* the notice period pay, and TDS will be deducted on that higher amount.

## The Legal Gray Area

This issue has been a point of contention. Some tax tribunals (like the Ahmedabad ITAT in the case of Nandinho Rebello) have ruled in favor of employees, stating that tax shouldn't be levied on income that never actually materialized. 

However, the Income Tax Department has not issued a blanket circular accepting this. Because the standard ITR forms do not have a specific column to deduct "notice period recovery," claiming this deduction manually is risky and highly likely to trigger a scrutiny notice.

**Salary is taxed on a "due or receipt, whichever is earlier" basis, so the gross amount is taxed even if the notice-period recovery never reached your bank. Source: Income Tax Act Section 15; Nandinho Rebello v. DCIT, Ahmedabad ITAT.**

## What Happens When Your New Employer Buys It Out?

Often, the company hiring you will offer to "buy out" your notice period by reimbursing you for the amount recovered by your old employer.

This creates a double taxation scenario:
1. **Old Employer:** Taxes you on the gross salary (including the recovered amount).
2. **New Employer:** Adds the buyout reimbursement to your new salary, taxing it again as a perquisite or bonus.

## How to Handle This While Filing ITR

For most salaried individuals, the safest approach to avoid tax notices is to file exactly as per the Form 16 issued by the old employer. 

If the amount is very large and you wish to rely on tribunal rulings to claim a deduction, you should consult a Chartered Accountant to help you file and prepare a legal response if a notice arrives.

## What you should do

1. Read Part B of your old employer's Form 16 to see whether the recovery was netted off
2. For a normal-sized recovery, file exactly as the Form 16 reports to stay matched with AIS
3. Only attempt a deduction with a CA's help and solid documentation if the amount is large

## Common mistake

**Quietly reducing your salary by the recovered amount in the ITR.** Your declared salary then falls below the employer's AIS figure, almost guaranteeing a mismatch query.

For standard filing, [uploading your Form 16s to LastMinute ITR](/file/import/documents?source=form16) will ensure your taxes are calculated exactly as reported by your employers, keeping you compliant with the portal's automated checks.`
  },
  {
    slug: "joining-bonus-recovery-tax",
    title: "Joining Bonus Recovery: How to Adjust Your Tax",
    description: "Left your job early and had to return your joining bonus? Find out how to handle the tax you already paid on it and report it correctly in your ITR.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "salaried",
    tags: ["Joining Bonus", "Job Switch", "Tax Refund"],
    relatedGlossarySlugs: ["form-16", "tds"],
    faqs: [
      {
        question: "If I return my joining bonus, will I get a refund of the TDS deducted on it?",
        answer: "If the recovery happens in the same financial year, the employer can adjust the TDS. If it happens in a subsequent year, you cannot directly claim a refund of the past TDS."
      },
      {
        question: "Can I reduce my current year's taxable income by the bonus amount I returned?",
        answer: "No. The Income Tax Act does not allow you to deduct a returned bonus from your current year's salary income."
      }
    ],
    body: `## The Joining Bonus Trap

Companies often offer a lucrative joining bonus to attract talent, but it usually comes with a catch: a lock-in period (typically 1 or 2 years). If you resign before this period ends, you have to return the bonus.

This creates a complex tax headache. When you received the bonus, your employer deducted heavy TDS on it. When you return it, you are returning the *gross* amount, meaning you are out of pocket for the tax you already paid.

How do you fix this in your ITR? It depends entirely on **when** you return the money.

## Scenario 1: Bonus Received and Returned in the SAME Financial Year

This is the easiest scenario. 
Let's say you joined in May 2025, received a ₹2 lakh bonus, and quit in December 2025. 

Since everything happened within the same financial year (April 2025 - March 2026), your employer will adjust your final Form 16. They will remove the ₹2 lakh from your gross salary. The excess TDS they deducted earlier in the year will simply result in a larger tax refund when you file your ITR in July 2026.

**Action:** Just file your ITR using the final Form 16 provided by the employer.

## Scenario 2: Bonus Received in Year 1, Returned in Year 2

This is where it gets painful.
You joined in January 2025 (FY 2024-25), got the bonus, and paid tax on it. You quit in August 2025 (FY 2025-26) and had to return the bonus.

- **Can you revise last year's ITR?** No, because the income *was* yours in FY 2024-25.
- **Can you deduct it from this year's salary?** No, the tax department doesn't allow you to reduce current salary for past recoveries.

**The Harsh Reality:** Under strict interpretation of tax laws, you suffer a loss. You paid tax on income you ultimately didn't keep.

## Is There Any Relief?

Some taxpayers rely on Section 15 (which taxes salary on a due/receipt basis) and argue that the returned bonus should be treated as a negative salary or loss. However, doing this manually in the ITR portal almost guarantees a mismatch notice, as your declared salary will be lower than what the employer reported in your AIS.

If the amount is substantial, you should consult a tax professional. They may advise claiming the deduction and preparing a legal defense based on tribunal rulings, though this is a complex and risky path.

**A bonus is taxed in the year it becomes due, and a same-year clawback can be adjusted by the employer; a clawback in a later year usually leaves the past tax stranded. Source: Income Tax Act Sections 15 and 192.**

## What you should do

1. Note whether the bonus was received and returned in the same financial year or a later one
2. Same year: just file from the revised Form 16, which already removes the bonus
3. Later year: keep the clawback letter and bank proof, and take a CA's view before claiming anything

## Common mistake

**Expecting an automatic refund of last year's TDS after a later-year clawback.** You cannot revise the earlier return for this, and you cannot subtract the returned bonus from this year's salary.

For most standard filings, it is safest to follow the Form 16 issued by the employer. You can [upload your Form 16s to LastMinute ITR](/file/import/documents?source=form16) to ensure your calculations match the government's records.`
  },
  {
    slug: "leave-encashment-tax-exemption",
    title: "Leave Encashment Exemption Rules for Salaried Employees",
    description: "Received cash for unused leaves? Learn about the taxability of leave encashment during employment versus at retirement or resignation, and exemption limits.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "salaried",
    tags: ["Leave Encashment", "Exemptions", "Retirement"],
    relatedGlossarySlugs: ["form-16", "old-regime"],
    faqs: [
      {
        question: "Is leave encashment received while still working taxable?",
        answer: "Yes. Any leave encashment received while you are still in service is fully taxable as salary, regardless of whether you are a government or private employee."
      },
      {
        question: "What is the maximum tax exemption for leave encashment on resignation?",
        answer: "For non-government employees, the maximum lifetime exemption limit for leave encashment received at the time of resignation or retirement is ₹25,000,000 (₹25 lakhs)."
      }
    ],
    body: `## Cashing In Your Leaves: The Tax Impact

Many companies allow employees to carry forward unused earned leaves and "encash" them—either during their employment or when they leave the company. 

While getting extra cash is great, the taxman treats this money differently depending on *when* you receive it and *who* you work for.

## 1. Encashment During Employment (Fully Taxable)

If you decide to encash your accumulated leaves while you are still actively working for the company, the entire amount is **fully taxable**. 

It is added to your gross salary and taxed according to your applicable slab rate. There are no exemptions available for this, whether you are a government or a private sector employee.

## 2. Encashment at Retirement or Resignation

The rules change favorably when you receive leave encashment at the time of leaving the company (resignation, retirement, or termination).

### For Government Employees
If you are a Central or State Government employee, the entire leave encashment amount received at retirement or resignation is **fully exempt** from tax under Section 10(10AA)(i).

### For Non-Government (Private) Employees
If you work in the private sector, the exemption is calculated as the **lowest** of the following four amounts:
1. The actual amount of leave encashment received.
2. The maximum limit set by the government (currently **₹25 lakhs** for retirements/resignations after April 1, 2023).
3. 10 months' average salary (based on the average salary of the last 10 months preceding retirement/resignation).
4. Cash equivalent of unavailed leaves (calculated based on a maximum of 30 days of leave per year of actual service).

*Note: The ₹25 lakh limit is a lifetime limit. If you claimed an exemption of ₹5 lakhs when leaving a previous job, you only have ₹20 lakhs of exemption limit remaining for future job changes.*

**The lifetime exemption for non-government leave encashment was raised eightfold, from Rs 3,00,000 to Rs 25,00,000, with effect from 1 April 2023. Source: CBDT Notification No. 31/2023; Income Tax Act Section 10(10AA).**

## How to Report it in Your ITR

If you received leave encashment upon resigning, your employer will usually calculate the exempt portion and report it in Part B of your Form 16 under "Allowances exempt u/s 10".

When filing your ITR:
- The fully taxable portion will be included in your Gross Salary.
- The exempt portion must be declared under the Section 10 exemptions list.

## What you should do

1. Check whether the encashment was during service (fully taxable) or on exit (partly exempt)
2. For private exits, take the lowest of the four tests as your exempt amount
3. Track how much of the Rs 25,00,000 lifetime cap you have already used across past jobs
4. Match the taxable and exempt split against your Form 16 before filing

## Common mistake

**Treating in-service encashment as exempt.** Only encashment at retirement or resignation qualifies; cashing leave while still employed is fully taxable salary.

If you are using **LastMinute ITR**, you don't need to worry about entering these details manually. Just [upload your Form 16](/file/import/documents?source=form16), and our system will automatically extract the exempt leave encashment and place it in the correct schedule for your tax return.`
  },
  {
    slug: "gratuity-tax-exemption-limit",
    title: "Gratuity Tax Exemption Limit and Calculation Explained",
    description: "Understand the tax rules for gratuity received after 5 years of service. Learn how to calculate your exempt amount and report it in your income tax return.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "salaried",
    tags: ["Gratuity", "Exemptions", "Retirement"],
    relatedGlossarySlugs: ["form-16", "old-regime"],
    faqs: [
      {
        question: "Is gratuity completely tax-free?",
        answer: "Not always. Gratuity is tax-free up to a certain limit (₹20 lakhs for private employees covered under the Gratuity Act). Any amount received above this limit is taxable."
      },
      {
        question: "Do I get gratuity if I resign after 4.5 years?",
        answer: "Generally, you must complete 5 continuous years of service to be eligible for gratuity. However, some court rulings have allowed it after 4 years and 240 days."
      }
    ],
    body: `## The 5-Year Reward

Gratuity is a lump sum payment made by an employer as a token of appreciation for your long-term service. You are legally entitled to it if you resign, retire, or are terminated after completing at least **5 continuous years** with the same company.

When that big check hits your bank account, the immediate question is: How much of this will the taxman take?

## Tax Exemption Rules for Gratuity

The taxability of gratuity depends on your employment type and whether your company is covered under the Payment of Gratuity Act, 1972.

### 1. Government Employees
For employees of the Central Government, State Government, or local authorities, the entire gratuity amount received is **fully exempt** from income tax under Section 10(10)(i).

### 2. Private Employees COVERED by the Gratuity Act
Most mid-to-large private companies fall here. The exempt amount is the **lowest** of the following three:
1. Actual gratuity received.
2. The statutory limit of **₹20 lakhs**.
3. 15 days' salary for every completed year of service (calculated as **Last drawn salary × 15/26 × Number of years of service**).

### 3. Private Employees NOT COVERED by the Gratuity Act
If your company is not covered by the Act, the exemption is the **lowest** of:
1. Actual gratuity received.
2. The statutory limit of **₹20 lakhs**.
3. Half month's average salary for every completed year of service (calculated as **10-month average salary × 1/2 × Number of years of service**).

*Note: The ₹20 lakh limit is a lifetime limit across all employers.*

## Example Calculation

You worked at a covered company for 8 years. Your last drawn salary (Basic + DA) was ₹1,00,000. You received ₹5,00,000 as gratuity.
- Statutory limit: ₹20,00,000
- Formula limit: ₹1,00,000 × 15/26 × 8 = ₹4,61,538
- Actual received: ₹5,00,000

The lowest is ₹4,61,538. This amount is tax-free. The remaining ₹38,462 (₹5L - ₹4.61L) will be added to your taxable salary.

## The exemption limits in one view

Gratuity is a thank-you payout for long service. How much escapes tax depends on your employer type.

| Employer type | Maximum tax-free gratuity |
| Government | Fully exempt |
| Private, covered by the Act | Lowest of actual, Rs 20,00,000, or the 15/26 formula |
| Private, not covered | Lowest of actual, Rs 20,00,000, or the half-month formula |

**The statutory tax-free ceiling for gratuity is Rs 20,00,000 and applies as a lifetime limit across employers. Source: Income Tax Act Section 10(10); Payment of Gratuity Act, 1972.**

## What you should do

1. Confirm you have completed five continuous years of service for eligibility
2. Compute the lowest of the three applicable tests as your exempt amount
3. Verify the taxable balance is added to gross salary in your Form 16
4. Remember the Rs 20,00,000 cap is shared across your whole career

## Common mistake

**Assuming all gratuity is tax-free.** Only the lowest-of-three amount is exempt for private employees; anything above the cap is taxed at your slab rate.

## Reporting Gratuity in ITR

Your employer will calculate the exempt and taxable portions and include them in your Form 16. 
- The taxable part is bundled into your Gross Salary.
- The exempt part is listed under Section 10(10) in Part B of Form 16.

When you [upload your Form 16 to LastMinute ITR](/file/import/documents?source=form16), we automatically map these figures to the correct fields in your tax return, ensuring you claim your rightful exemption without any manual math.`
  }
];
