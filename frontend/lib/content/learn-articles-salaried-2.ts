import type { LearnArticle } from "./learn-articles";

export const SALARIED_ARTICLES_2: LearnArticle[] = [
  {
    slug: "section-89-relief-salary-arrears",
    title: "How to Claim Section 89 Relief for Salary Arrears",
    description: "Received pending salary arrears this year? Don't pay higher taxes. Learn how to calculate and claim Section 89 relief to reduce your tax liability.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "salaried",
    tags: ["Section 89", "Arrears", "Form 10E"],
    relatedGlossarySlugs: ["form-16", "tds"],
    faqs: [
      {
        question: "What is Section 89 relief?",
        answer: "Section 89 provides tax relief if you receive salary arrears or advance salary in the current year, which pushes you into a higher tax slab than you would have been in if the salary was paid in the correct year."
      },
      {
        question: "Is it mandatory to file Form 10E to claim Section 89 relief?",
        answer: "Yes. You must file Form 10E on the income tax portal before filing your ITR. If you claim the relief in your ITR without filing Form 10E, the tax department will reject the claim."
      }
    ],
    body: `## The Problem with Late Payments

Imagine your company finally pays out the pending salary arrears from two years ago. You receive a lump sum of ₹3 lakhs this year. 

While the money is welcome, it creates a tax problem. Because income tax is calculated on the total salary received in the current financial year, this extra ₹3 lakhs might push you into a higher tax bracket (e.g., from 20% to 30%). 

You end up paying more tax simply because your employer paid you late. This is where **Section 89** comes to the rescue.

## How Section 89 Relief Works

Section 89 ensures you are not penalized for receiving past dues in the current year. It recalculates your taxes to see what you *would* have paid if the arrears were received in the year they actually belonged to.

If the tax calculated in the past year is lower than the extra tax you are paying in the current year, the difference is granted to you as "Relief under Section 89."

## The Calculation Process

Section 89 relief is simply the tax you overpaid because the arrears landed in one lump. The calculation involves these steps:
1. Calculate tax for the current year **including** the arrears.
2. Calculate tax for the current year **excluding** the arrears.
3. Find the difference (This is the extra tax you are paying this year).
4. Calculate tax for the past year(s) to which the arrears belong, **including** the arrears.
5. Calculate tax for the past year(s) **excluding** the arrears (This is what you actually paid back then).
6. Find the difference (This is the tax you *should* have paid back then).

If the amount in Step 3 is greater than the amount in Step 6, the difference is your Section 89 relief.

## The Golden Rule: Form 10E

You cannot just subtract the relief amount in your ITR and be done with it. **The Income Tax Department mandates that you must submit Form 10E online before filing your ITR.**

Form 10E is where you show the department the exact math (Steps 1-6) proving you deserve the relief. If you claim the relief in your ITR but forget to file Form 10E, your ITR will be processed with a tax demand notice.

**Section 89 relief is disallowed in full unless Form 10E is filed online before the ITR. Source: Income Tax Act Section 89 read with Rule 21A; CBDT mandatory e-filing of Form 10E since AY 2015-16.**

## What you should do

1. Get the year-wise break-up of the arrears from your employer
2. File Form 10E online on incometax.gov.in and note the acknowledgment number
3. Enter the relief figure in the Section 89 field of your ITR, matching Form 10E
4. File and e-verify only after Form 10E is submitted

## Common mistake

**Claiming the relief in the ITR but skipping Form 10E.** The portal then strips out the relief and raises a demand for the difference plus interest.

## Simplifying the Process

Calculating tax across multiple past years with different slab rates is incredibly tedious. 

If your employer has already calculated the Section 89 relief and included it in your Form 16, you can simply [upload your Form 16 to LastMinute ITR](/file/import/documents?source=form16). We will read the relief amount and place it correctly in your tax return. However, you must still log into the government portal and submit Form 10E manually before filing.`
  },
  {
    slug: "form-10e-filing-guide",
    title: "Form 10E: Step-by-Step Guide for Claiming Tax Relief",
    description: "Filing Form 10E is mandatory to claim Section 89 relief on salary arrears. Follow our simple guide to fill and submit Form 10E on the income tax portal.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "salaried",
    tags: ["Form 10E", "Section 89", "Arrears"],
    relatedGlossarySlugs: ["form-16", "tds"],
    faqs: [
      {
        question: "When should I file Form 10E?",
        answer: "You must file Form 10E before you submit your Income Tax Return (ITR) for the year in which you received the arrears."
      },
      {
        question: "Can I file Form 10E after getting a tax notice?",
        answer: "If you claimed Section 89 relief in your ITR but forgot Form 10E, you will get a notice. You can usually file Form 10E then and submit a rectification response, but it is better to do it beforehand."
      }
    ],
    body: `## The Prerequisite for Section 89 Relief

If you received salary arrears, advance salary, or a family pension in arrears, you are eligible for tax relief under Section 89. However, the income tax portal will reject your claim unless you submit **Form 10E** first.

Form 10E is a digital form where you provide the mathematical proof that receiving the arrears in the current year caused you to pay higher taxes than if you had received them on time.

## Step-by-Step Guide to Filing Form 10E

You must file this form directly on the government's e-filing portal.

### Step 1: Log In
Go to incometax.gov.in and log in using your PAN and password.

### Step 2: Navigate to Statutory Forms
From the top menu, click on **e-File** > **Income Tax Forms** > **File Income Tax Forms**.

### Step 3: Select Form 10E
Scroll down to the section titled "Persons not having any business/professional income" and click on **Form 10E**. 

### Step 4: Choose the Assessment Year
Select the Assessment Year (AY) for which you are filing the return (the year you *received* the arrears). For example, if you received arrears between April 2025 and March 2026, select AY 2026-27.

### Step 5: Fill in the Details
The form has several annexures. You only need to fill the one relevant to your situation:
- **Annexure I:** For salary arrears or advance salary.
- **Annexure II & IIA:** For gratuity payments.
- **Annexure III:** For compensation on termination.
- **Annexure IV:** For commutation of pension.

For standard salary arrears, select Annexure I. You will need to enter:
- Your total income for the current year (excluding arrears).
- The arrears received.
- Details of the past years to which the arrears belong (total income and tax paid in those years).

### Step 6: Submit and E-Verify
Once you have filled in the numbers, the form will calculate the relief amount. Save the draft, preview it, and click submit. You will need to e-verify the form using Aadhaar OTP or EVC, just like an ITR.

**Form 10E must be filed before the ITR for the year the arrears were received; relief claimed without it is automatically rejected. Source: Income Tax Act Section 89 read with Rule 21A.**

## What you should do

1. Keep your year-wise income and tax-paid figures for the arrear years handy
2. Use Annexure I for salary arrears or advance salary
3. E-verify Form 10E, then file your ITR with the same relief amount

## Common mistake

**Picking the wrong Assessment Year.** Always select the AY in which you received the arrears (for arrears received in FY 2025-26, choose AY 2026-27), not the year they originally belonged to.

## What Next?

After successfully submitting Form 10E, note down the acknowledgment number. You can now proceed to file your ITR. 

When you use [LastMinute ITR](/file), ensure you enter the exact relief amount calculated in your Form 10E into the Section 89 relief field to ensure your final tax computation matches the government's records.`
  },
  {
    slug: "pf-withdrawal-taxability",
    title: "Tax on PF Withdrawal: When Is It Taxable?",
    description: "Withdrawing your EPF balance before 5 years of continuous service? Understand the TDS rules, taxability, and how to report PF withdrawals in your ITR.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "salaried",
    tags: ["EPF", "Withdrawal", "TDS"],
    relatedGlossarySlugs: ["form-26as", "tds"],
    faqs: [
      {
        question: "Is PF withdrawal taxable after 5 years?",
        answer: "No. If you withdraw your EPF balance after completing 5 continuous years of service, the entire amount is tax-free."
      },
      {
        question: "How is the 5-year period calculated if I changed jobs?",
        answer: "If you transferred your EPF balance from your old employer to your new employer, the service period with the old employer is added to the new one to calculate the 5 continuous years."
      }
    ],
    body: `## The 5-Year Rule for EPF

The Employee Provident Fund (EPF) is a fantastic tax-saving tool, but it comes with strict lock-in rules. If you withdraw your EPF balance, the taxman's treatment of that money depends entirely on one factor: **Have you completed 5 continuous years of service?**

## Scenario 1: Withdrawal AFTER 5 Years (Tax-Free)

If you have been working continuously for 5 years or more (even across multiple employers, provided you transferred your PF balance), your withdrawal is completely **tax-free**. 

You do not need to pay any tax on the principal or the interest. You simply report it as exempt income in your ITR.

## Scenario 2: Withdrawal BEFORE 5 Years (Taxable)

If you withdraw your EPF before completing 5 years, the withdrawal loses its tax-exempt status. It becomes taxable in the year you withdraw it.

Here is how the different components are taxed:
1. **Employer's Contribution & Interest:** Fully taxable as "Income from Salary."
2. **Your Contribution:** If you claimed Section 80C deductions on your contributions in previous years, that amount now becomes taxable as "Income from Salary."
3. **Interest on Your Contribution:** Fully taxable as "Income from Other Sources."

### The TDS Catch

If you withdraw before 5 years and the amount is **₹50,000 or more**, the EPFO will deduct TDS at 10% (if you submit your PAN). If you don't submit your PAN, TDS is deducted at the maximum marginal rate (30% or higher).

*Note: If your total income for the year is below the taxable limit, you can submit Form 15G/15H to the EPFO to prevent them from deducting TDS.*

## Exceptions to the 5-Year Rule

Your withdrawal before 5 years remains tax-free ONLY in these specific situations:
- You were terminated due to ill health.
- Your employer's business was discontinued.
- Any other reason beyond your control.

## The 5-year line, at a glance

EPF is your retirement savings pool; both you and your employer pay in monthly. The taxman rewards patience.

| Withdrawal timing | Tax treatment | TDS |
| After 5 continuous years | Fully tax-free | None |
| Before 5 years, amount Rs 50,000 or more | Taxable | 10% with PAN |
| Before 5 years, no PAN given | Taxable | Maximum marginal rate |

**EPF withdrawn before five years and totalling Rs 50,000 or more attracts 10% TDS (much higher without PAN); EPFO credited 8.25% interest for FY 2024-25. Source: Income Tax Act Section 192A; EPFO interest notification FY 2024-25.**

## What you should do

1. Check whether transferred service across employers takes you past five years
2. If withdrawing before five years, submit your PAN to keep TDS at 10%
3. Split the taxable amount into salary and other-sources parts when reporting
4. Cross-check the EPFO TDS against your Form 26AS

## Common mistake

**Thinking the EPFO TDS settles your full liability.** The 10% TDS is only a part-payment; if you are in a higher slab you must pay the balance as self-assessment tax.

## How to Report Taxable PF in ITR

If your withdrawal was taxable, you must report it carefully. The EPFO will issue a TDS certificate, and the deducted tax will reflect in your Form 26AS.

You must manually add the employer's share to your salary income and the interest portion to your "Other Sources" income. Failing to report a taxable PF withdrawal when TDS is visible in your 26AS is a guaranteed way to receive a tax notice.

If you are unsure how to classify the amounts, consider consulting a tax expert. For standard salary filing, [LastMinute ITR](/file) helps you import your Form 16 and 26AS to ensure all reported TDS is accounted for.`
  },
  {
    slug: "report-perquisites-form-16-itr",
    title: "How to Report Perquisites from Form 16 in Your ITR",
    description: "Company car, rent-free accommodation, or ESOPs? Learn how to read the perquisites value in your Form 16 and report it correctly in your tax return.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "form-16",
    tags: ["Perquisites", "Form 16", "Salary"],
    relatedGlossarySlugs: ["form-16", "tds"],
    faqs: [
      {
        question: "What are perquisites in salary?",
        answer: "Perquisites (or 'perks') are non-cash benefits provided by your employer, such as a company car, rent-free accommodation, or ESOPs. Their monetary value is added to your taxable salary."
      },
      {
        question: "Do I have to pay tax on perquisites?",
        answer: "Yes. The Income Tax Act assigns a specific monetary value to these benefits, which is added to your gross salary and taxed according to your slab rate."
      }
    ],
    body: `## Taxing the "Fringe Benefits"

A good salary package often includes more than just cash. You might get a company-leased car, rent-free accommodation, interest-free loans, or stock options (ESOPs). 

The Income Tax Department calls these non-cash benefits **"Perquisites"** (or perks). Because they hold monetary value, the government taxes them just like your regular salary.

## Where to Find Perquisites in Form 16

Your employer is responsible for calculating the value of your perquisites according to strict rules laid out in the Income Tax Act. 

You don't have to do the math yourself. You will find the total value of your perquisites in **Part B of your Form 16**, specifically under the section detailing your Gross Salary. 

Look for a line item that says:
*Value of perquisites under section 17(2)*

Your employer will also provide an annexure (often called Form 12BA) that breaks down exactly how they calculated the value of each perk (e.g., ₹50,000 for a car, ₹2,00,000 for accommodation).

## How to Report Perquisites in Your ITR

When you file your ITR, you must enter the exact value of the perquisites as shown in your Form 16. 

On the income tax portal, when filling out the "Salary" schedule, you will see a specific field for "Value of perquisites as per section 17(2)". Enter the amount here. This amount will be added to your basic salary and allowances to form your Gross Salary.

## Common Mistake: ESOP Double Taxation Confusion

If you exercised ESOPs (Employee Stock Ownership Plans) during the year, the difference between the Fair Market Value (FMV) of the shares and the exercise price you paid is treated as a perquisite. 

Your employer will add this massive amount to your Form 16, resulting in a huge TDS deduction. Many employees panic, thinking they are being taxed twice when they eventually sell the shares. 

Remember: The perquisite tax is on the *allotment* of shares. When you later sell the shares, you will pay Capital Gains tax only on the profit made *above* the FMV that was already taxed as a perquisite.

**Every perquisite must be valued and reported under Section 17(2), and your employer must hand you a Form 12BA detailing each perk. Source: Income Tax Act Section 17(2); Rule 26A / Form 12BA.**

## What you should do

1. Read the Section 17(2) perquisite value and the Form 12BA break-up from your employer
2. Enter that exact value in the "perquisites u/s 17(2)" field of the salary schedule
3. For ESOPs, keep the FMV and exercise-price details for the eventual capital-gains stage
4. Confirm your gross salary in the ITR matches your Form 16

## Automate the Data Entry

Typing perquisite values and salary breakdowns manually is tedious. When you [upload your Form 16 to LastMinute ITR](/file/import/documents?source=form16), our system automatically reads the perquisite values under Section 17(2) and places them in the correct fields, ensuring your gross salary matches the government's records perfectly.`
  },
  {
    slug: "relocation-allowance-taxability",
    title: "Relocation Allowance Taxability: What Is Exempt?",
    description: "Moved to a new city for work? Understand which parts of your relocation allowance or reimbursement are tax-exempt and how to declare them in your ITR.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "salaried",
    tags: ["Allowances", "Relocation", "Exemptions"],
    relatedGlossarySlugs: ["form-16", "old-regime"],
    faqs: [
      {
        question: "Is relocation allowance fully taxable?",
        answer: "If given as a flat allowance without requiring bills, it is fully taxable. If given as a reimbursement against actual bills (travel, packing), the reimbursed amount is exempt from tax."
      },
      {
        question: "Can I claim exemption for hotel stays during relocation?",
        answer: "Yes, reasonable accommodation expenses for the initial days (usually up to 15 days) in the new city can be claimed as exempt if reimbursed against actual bills."
      }
    ],
    body: `## Moving for Work: The Tax Angle

When you accept a job in a new city, companies often provide financial assistance to help you move. This is usually called a Relocation Allowance or Transfer Allowance.

While the money helps cover the cost of packers and movers, flight tickets, and initial hotel stays, the tax treatment of this money depends entirely on **how** your employer pays it to you.

## Scenario 1: Flat Allowance (Fully Taxable)

If your employer simply adds a flat amount (e.g., ₹1,00,000) to your salary as a "Relocation Allowance" and does not ask you to submit any bills or receipts, the entire amount is **fully taxable**. 

It will be added to your gross salary, and you will pay tax on it according to your slab rate.

## Scenario 2: Reimbursement Against Bills (Tax Exempt)

If your employer reimburses your moving expenses based on actual bills submitted by you, the amount is **tax-exempt** under Section 10(14) of the Income Tax Act.

To qualify for this exemption, the expenses must be genuinely incurred for the purpose of transferring your employment. Eligible expenses typically include:
- Train or flight tickets for you and your family.
- Charges paid to packers and movers for transporting household goods.
- Car transportation charges.
- Initial hotel accommodation (usually up to 15 days) while you find a permanent house.

*Note: The exemption is limited to the actual amount spent. If the company gave you a limit of ₹1 lakh, but your bills were only ₹80,000, the remaining ₹20,000 paid to you will be taxable.*

## Flat allowance vs reimbursement

The tax outcome turns entirely on whether you submitted bills.

| How you were paid | Bills needed | Tax treatment |
| Flat relocation allowance | No | Fully taxable |
| Reimbursement against actual bills | Yes | Exempt u/s 10(14) |

**Relocation reimbursed against genuine moving bills is exempt under Section 10(14); a flat cash allowance is fully taxable. Source: Income Tax Act Section 10(14) read with Rule 2BB.**

## How to Claim the Exemption

You must submit the original bills, tickets, and receipts to your HR/Payroll department within the deadline they specify. 

If you submit the bills on time, your employer will exclude the reimbursed amount from your taxable salary. Your Form 16 will automatically reflect the correct taxable income, and you won't need to do any extra calculations while filing your ITR.

If you received a flat allowance and want to claim an exemption while filing your ITR, it is highly risky and likely to trigger a notice, as the employer has already reported it as taxable income.

## What you should do

1. Submit your moving bills (tickets, packers, initial hotel) to payroll before their deadline
2. Confirm the reimbursed amount is excluded from taxable salary in your Form 16
3. File from the Form 16 figure rather than carving out a fresh exemption yourself

## Common mistake

**Claiming exemption on a flat allowance with no bills.** The employer has already taxed it, so a self-made exemption clashes with the AIS and invites a notice.

For a hassle-free filing experience, [upload your Form 16 to LastMinute ITR](/file/import/documents?source=form16) to ensure your tax computation matches your employer's approved exemptions.`
  },
  {
    slug: "claim-80c-forgot-proofs-employer",
    title: "How to Claim 80C If You Forgot to Submit Proofs",
    description: "Missed the deadline to submit investment proofs to your employer? You can still claim Section 80C deductions while filing your ITR. Here is how to do it.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["80C", "Investments", "ITR Filing"],
    relatedGlossarySlugs: ["section-80c", "old-regime"],
    faqs: [
      {
        question: "Can I claim ELSS or PPF investments in ITR if they are not in my Form 16?",
        answer: "Yes. You can manually add any eligible Section 80C investments (up to ₹1.5 lakhs) while filing your ITR under the old tax regime, even if your employer didn't include them."
      },
      {
        question: "Will I get a refund if I claim 80C directly in my ITR?",
        answer: "Yes. If your employer deducted higher TDS because you didn't submit proofs, claiming the deduction in your ITR will lower your tax liability, resulting in a refund."
      }
    ],
    body: `## The January Proof Panic

Every year, between January and February, employers ask for proofs of your tax-saving investments (PPF receipts, ELSS statements, LIC premium receipts). 

If you missed this deadline, your employer assumed you didn't make any investments. They calculated your tax without the Section 80C benefit and deducted a huge chunk of TDS from your February and March salaries.

Don't worry—your money isn't lost. You can still claim these deductions directly from the Income Tax Department and get a refund.

*Note: Section 80C deductions are only available if you opt for the **Old Tax Regime**.*

## Step 1: Gather Your Investment Proofs
Even though you don't need to upload documents to the income tax portal, you must have the actual proofs in hand before claiming the deduction. Gather your:
- PPF deposit receipts.
- ELSS mutual fund statements.
- Life insurance premium receipts.
- Tuition fee receipts for children.
- Principal repayment certificate for your home loan.

## Step 2: Calculate Your Total 80C Amount
Add up all your eligible investments. Remember, the maximum deduction allowed under Section 80C is **₹1.5 lakhs**. Even if you invested ₹3 lakhs, you can only claim ₹1.5 lakhs.

*Don't forget to include your Employee Provident Fund (EPF) contribution, which is already listed in your payslips and Form 16.*

## Step 3: Enter the Amount in Your ITR
When you log in to the income tax portal to file your return:
1. Select the Old Tax Regime.
2. Navigate to the "Deductions" schedule (Chapter VI-A).
3. Find the field for "Section 80C".
4. Enter your total calculated amount (up to ₹1.5 lakhs).

The portal will automatically recalculate your total taxable income.

## Step 4: Claim Your Refund
Because your taxable income is now lower than what your employer calculated, your final tax liability will drop. Since the employer already deposited the higher TDS with the government (visible in your Form 26AS), the portal will show the difference as a **Refund Due**.

## What counts toward the Rs 1.5 lakh

Section 80C lets you subtract certain investments and payments from taxable income, up to a yearly ceiling.

| Common 80C item | Counts toward 80C |
| EPF employee share | Yes |
| PPF deposit | Yes |
| ELSS mutual fund | Yes |
| Life insurance premium | Yes |
| Home-loan principal repaid | Yes |

**The Section 80C deduction is capped at Rs 1,50,000 a year and is available only under the old regime. Source: Income Tax Act Section 80C.**

## Common mistake

**Forgetting EPF is already part of your 80C.** Your monthly EPF contribution counts toward the Rs 1,50,000, so add it before topping up with PPF or ELSS, or you may over-claim.

## Make It Effortless with LastMinute ITR
If you are unsure how to adjust your Form 16 numbers, let **LastMinute ITR** do the heavy lifting. 

[Upload your Form 16](/file/import/documents?source=form16), select the old regime, and simply type in your additional 80C investments. We will instantly recalculate your tax and show you your exact refund amount before you file.`
  },
  {
    slug: "report-esops-rsus-itr",
    title: "How to Report ESOPs and RSUs in Your ITR",
    description: "Received company shares? Understand the dual taxation of ESOPs and RSUs—as perquisites on allotment and capital gains on sale—and how to report them.",
    readMinutes: 7,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["ESOPs", "RSUs", "Capital Gains"],
    relatedGlossarySlugs: ["capital-gains-schedule", "form-16"],
    faqs: [
      {
        question: "Are ESOPs taxed when they are granted or vested?",
        answer: "Neither. ESOPs are taxed when you 'exercise' them (buy the shares). The difference between the Fair Market Value and your exercise price is taxed as a salary perquisite."
      },
      {
        question: "Which ITR form should I use if I sold ESOPs?",
        answer: "If you sold ESOPs or RSUs, you have generated Capital Gains. You must file ITR-2 (or ITR-3 if you have business income). ITR-1 cannot be used."
      }
    ],
    body: `## The Double Taxation of Employee Shares

Employee Stock Ownership Plans (ESOPs) and Restricted Stock Units (RSUs) are great wealth builders, but they complicate your tax filing. 

The most important thing to understand is that employee shares are taxed in **two distinct stages**: first as salary, and later as capital gains.

## Stage 1: Taxation on Exercise (The Perquisite)

When your shares vest and you decide to "exercise" your option (buy the shares), the taxman steps in. 

The Income Tax Department treats the discount you received as a perk of your job. 
- **Calculation:** Fair Market Value (FMV) of the shares on the exercise date *minus* the Exercise Price you paid.
- **Tax Treatment:** This difference is added to your Form 16 as a "Perquisite" under Section 17(2). It is taxed at your regular salary slab rate. Your employer will deduct TDS on this amount.

**How to report:** You don't have to do much. Just ensure the perquisite value in your ITR matches your Form 16.

*(Note: Eligible startups have special rules allowing them to defer this TDS, but the income must still be reported).*

## Stage 2: Taxation on Sale (Capital Gains)

When you eventually sell the shares on the stock market, the taxman returns.

- **Calculation:** Sale Price *minus* the FMV on the exercise date (the value you already paid tax on).
- **Tax Treatment:** This profit is taxed as Capital Gains. 

The rate depends on whether the shares are listed in India or abroad, and how long you held them:
- **Listed Indian Shares:** Short-Term Capital Gains (STCG) if held for < 1 year (taxed at 20%). Long-Term Capital Gains (LTCG) if held for > 1 year (taxed at 12.5% above ₹1.25 lakhs).
- **Foreign Shares (e.g., US RSUs):** Treated as unlisted shares in India. STCG if held for < 24 months (taxed at slab rates). LTCG if held for > 24 months (taxed at 12.5%).

## Choosing the Right ITR Form

Because selling shares generates capital gains, **you cannot use ITR-1**. You must upgrade to **ITR-2** (or ITR-3 if you have business income) and fill out the complex Schedule CG (Capital Gains).

If you hold RSUs of a foreign company (like Google or Amazon), you must also fill out **Schedule FA (Foreign Assets)**, even if you haven't sold the shares yet. Failing to report foreign assets carries severe penalties under the Black Money Act.

## Capital gains rates on sale

These rates apply to the second stage, when you sell the allotted shares. "STCG" is short-term gain, "LTCG" is long-term gain.

| Share type | Holding for long term | LTCG rate |
| Listed Indian shares | More than 12 months | 12.5% above Rs 1,25,000 |
| Foreign / unlisted shares | More than 24 months | 12.5% |

**For transfers on or after 23 July 2024, listed-share LTCG is 12.5% beyond a Rs 1,25,000 annual exemption and STCG is 20%. Source: Finance (No. 2) Act 2024; Income Tax Act Sections 111A and 112A.**

## What you should do

1. Match the Section 17(2) perquisite value at exercise with your Form 16
2. On sale, compute gains from the FMV already taxed, not from your exercise price
3. File ITR-2 (or ITR-3) and complete Schedule FA if you hold foreign shares
4. Track the holding period to know whether STCG or LTCG applies

## Common mistake

**Paying capital-gains tax on the whole sale value.** You already paid perquisite tax up to the FMV; only the gain above that FMV is taxed again on sale.

## Need Help with ITR-2?
Filing ITR-2 with foreign assets and capital gains is complicated. While LastMinute ITR helps you optimize your salary and regime choices, we recommend consulting a Chartered Accountant to ensure your Schedule FA and Capital Gains are reported flawlessly.`
  },
  {
    slug: "claim-lta-exemption-itr",
    title: "How to Claim LTA (Leave Travel Allowance) in Your ITR",
    description: "Learn the rules for claiming Leave Travel Allowance (LTA) exemption, the block year concept, and what to do if you couldn't submit travel proofs in time.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["LTA", "Travel", "Exemptions"],
    relatedGlossarySlugs: ["form-16", "old-regime"],
    faqs: [
      {
        question: "Can I claim LTA every year?",
        answer: "No. LTA exemption can only be claimed for two journeys in a block of four calendar years (e.g., 2022-2025)."
      },
      {
        question: "Does LTA cover hotel and food expenses?",
        answer: "No. LTA exemption is strictly limited to the actual travel cost (flight, train, or bus tickets) for you and your immediate family. Hotels, food, and sightseeing are not covered."
      }
    ],
    body: `## Traveling on the Taxman's Dime

Leave Travel Allowance (LTA) or Leave Travel Concession (LTC) is a common component of a salaried employee's CTC. It provides a tax exemption for travel expenses incurred while on leave.

However, LTA has some of the strictest and most confusing rules in the Income Tax Act. Here is what you need to know.

*Note: LTA exemption is only available if you opt for the **Old Tax Regime**.*

## The "Block Year" Rule

You cannot claim LTA every year. The government sets "blocks" of four calendar years. The current block is **2022 to 2025**. 

You can claim the LTA exemption for a maximum of **two journeys** during this four-year block. If you don't use your quota, you can carry forward one journey to the first year of the next block.

## What Expenses Are Covered?

LTA is not a blank check for a luxury vacation. The exemption is strictly limited to:
- **Travel costs only:** Flight, train, or bus tickets.
- **Domestic travel only:** International trips do not qualify.
- **Family limits:** Travel for yourself, your spouse, two children, and dependent parents/siblings.
- **Class limits:** Economy class airfare for the shortest route, or AC First Class train fare.

Hotels, food, cab rentals, and sightseeing expenses are **not** eligible for exemption.

**LTA exemption is limited to two journeys in a four-year block, and the current block runs 2022 to 2025. Source: Income Tax Act Section 10(5) read with Rule 2B.**

## How to Claim LTA

To get the tax benefit, you must actually take leave from work and travel. 

You must submit your boarding passes, train tickets, and travel invoices to your employer before their deadline. If approved, the employer will deduct the travel cost from your taxable salary, and it will reflect as an exemption under Section 10(5) in your Form 16.

## What If You Forgot to Submit Proofs?

If you traveled but missed your employer's deadline to submit the boarding passes, your employer will tax your entire LTA allowance.

**Can you claim it directly in your ITR?**
Unlike HRA or 80C, claiming LTA directly in the ITR without employer verification is a legal gray area. The Supreme Court has previously ruled that employers are obligated to collect proofs for LTA. 

While the ITR portal has a field for Section 10(5), claiming a large LTA exemption that isn't in your Form 16 is highly likely to trigger a scrutiny notice. If you choose to do this, ensure you have rock-solid proofs (approved leave records, boarding passes, payment receipts) and consult a CA.

## What you should do

1. Actually travel and take leave; LTA needs a real journey, not just the allowance
2. Submit tickets and boarding passes to your employer within their deadline
3. Claim only the travel fare for the shortest route, in the permitted class
4. Rely on the Section 10(5) exemption shown in your Form 16 while filing

## Common mistake

**Treating LTA like an annual holiday fund.** It covers only travel fare, only domestic trips, and only two journeys per four-year block, never hotels, food or sightseeing.

For a smooth filing experience, it is best to rely on the exemptions already verified and listed in your Form 16. You can [upload your Form 16 to LastMinute ITR](/file/import/documents?source=form16) to automatically import your approved LTA exemption.`
  },
  {
    slug: "form-16-tds-mismatch-26as",
    title: "What If Form 16 TDS Doesn't Match Form 26AS?",
    description: "A mismatch between your Form 16 and Form 26AS can lead to tax notices. Learn why discrepancies happen and how to resolve them before filing your ITR.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "form-16",
    tags: ["Form 16", "26AS", "TDS Mismatch"],
    relatedGlossarySlugs: ["form-26as", "tds-schedule"],
    faqs: [
      {
        question: "Which document should I trust if Form 16 and 26AS show different TDS amounts?",
        answer: "The Income Tax Department only recognizes the TDS reflected in your Form 26AS. You can only claim credit for the tax that actually appears in 26AS."
      },
      {
        question: "Why is my TDS missing from Form 26AS?",
        answer: "This usually happens if your employer delayed filing their quarterly TDS returns, made an error in your PAN, or failed to deposit the deducted tax with the government."
      }
    ],
    body: `## The Ultimate Source of Truth

When filing your taxes, you have two key documents showing your tax deductions:
1. **Form 16:** Issued by your employer, showing what they *say* they deducted.
2. **Form 26AS:** Issued by the government, showing what they *actually received* against your PAN.

In a perfect world, the TDS amount in Form 16 Part A matches Form 26AS exactly. But what happens when Form 16 shows ₹1,00,000 deducted, but 26AS only shows ₹80,000?

## Why Mismatches Happen

Discrepancies usually occur due to employer errors:
- **Late Filing:** The employer deposited the tax but hasn't filed their quarterly TDS return yet.
- **PAN Error:** The employer filed the return but made a typo in your PAN, so the credit went to someone else.
- **Default:** The employer deducted the money from your salary but never deposited it with the government.

## The Golden Rule of TDS

**You can only claim credit for the TDS that appears in your Form 26AS.**

If you claim ₹1,00,000 in your ITR based on your Form 16, but 26AS only shows ₹80,000, the income tax portal's automated system will immediately flag the mismatch. Your return will be processed with a tax demand notice for the missing ₹20,000 plus interest.

**TDS credit is allowed only to the extent it appears in Form 26AS; Form 26AS is the credit shown against your PAN. Source: Income Tax Act Section 199 read with Rule 37BA.**

## How to Fix the Mismatch

Do not file your ITR until the mismatch is resolved. Follow these steps:

1. **Contact Your Employer:** Immediately notify your HR or finance department. Provide them with your Form 26AS showing the missing credit.
2. **Request a Revised Return:** If they made a PAN error or missed a quarter, they must file a "Revised TDS Return" to correct the mistake.
3. **Wait for the Update:** Once the employer files the correction, it takes 7-10 days for the TRACES portal to update your Form 26AS.
4. **File Your ITR:** Only proceed with filing once the correct amount reflects in your 26AS.

## What If the Employer Refuses to Fix It?

If the employer has shut down or refuses to deposit the tax, you are in a tough spot. CBDT circulars state that the department cannot demand tax from the employee if the employer deducted it but failed to deposit it. 

However, proving this requires responding to notices with payslips and bank statements. You will need a Chartered Accountant to help you navigate this legal dispute.

## What you should do

1. Compare Form 16 Part A TDS with your Form 26AS line by line before filing
2. If amounts differ, ask payroll to file a revised TDS return to fix it
3. Wait for 26AS to update (usually 7 to 10 days) before submitting
4. Claim only the TDS that actually appears in 26AS

## Common mistake

**Claiming the Form 16 figure when 26AS shows less.** The portal trusts 26AS, so the gap becomes a demand with interest. Fix the source first, then file.

To avoid surprises, always verify your TDS early. [Upload your Form 16 to LastMinute ITR](/file/import/documents?source=form16) and cross-check the extracted TDS against your downloaded 26AS before proceeding.`
  },
  {
    slug: "moonlighting-tax-implications",
    title: "Tax Implications of Moonlighting Alongside a Full-Time Job",
    description: "Taking up freelance gigs while employed? Understand how to declare income from multiple sources, choose the right ITR form, and manage your tax liability.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["Moonlighting", "Freelance", "Multiple Incomes"],
    relatedGlossarySlugs: ["recommended-itr-form", "ais"],
    faqs: [
      {
        question: "Can the tax department find out about my freelance income?",
        answer: "Yes. If your freelance clients deduct TDS (usually under Section 194J), the income will automatically appear in your Form 26AS and AIS, making it visible to the tax department."
      },
      {
        question: "Which ITR form should I use if I have salary and freelance income?",
        answer: "You must use ITR-3 or ITR-4. You cannot use ITR-1 or ITR-2 if you have business or professional income alongside your salary."
      }
    ],
    body: `## The Tax Reality of the Side Hustle

"Moonlighting"—taking up freelance projects or a second job alongside full-time employment—has become increasingly common. While your employment contract might have clauses against it, the Income Tax Department only cares about one thing: **Are you paying tax on all your income?**

If you are earning from a side hustle, here is how you must handle your taxes to stay compliant.

## The Tax Department Knows

Many salaried employees assume that small freelance payments made directly to their bank accounts will go unnoticed. This is a dangerous assumption.

If your client is a registered business, they will likely deduct TDS at 10% under Section 194J (Fees for Professional or Technical Services) before paying you. The moment they file their TDS return, that income is permanently linked to your PAN. It will appear in your **Form 26AS** and **Annual Information Statement (AIS)**.

If you file your ITR declaring only your salary from Form 16 and ignore the freelance income shown in your AIS, you will receive a notice for under-reporting income.

## Choosing the Right ITR Form

This is the biggest change for moonlighters. 
As a salaried employee, you are used to filing **ITR-1 (Sahaj)**. 

However, freelance income is classified as "Income from Business or Profession." The moment you have this type of income, **you are disqualified from using ITR-1 or ITR-2.**

You must file:
- **ITR-4 (Sugam):** If you opt for the Presumptive Taxation Scheme (Section 44ADA), where you declare 50% of your freelance receipts as profit.
- **ITR-3:** If you want to claim actual business expenses (laptop, internet, software) against your freelance income.

## The Tax Slab Shock

Your freelance income is added to your salary income, and you are taxed on the total amount according to your slab rate.

Because your employer already factored in the basic exemption limit and standard deduction when calculating your salary TDS, your freelance income will be taxed at your **highest applicable slab rate**. 

For example, if your salary puts you in the 30% bracket, your freelance income will also be taxed at 30%. Since clients only deduct 10% TDS, you will have a significant **shortfall in tax paid**. You must pay this difference as Advance Tax or Self-Assessment Tax before filing your ITR.

## The TDS gap on side income

Professional fees are taxed at your slab, but clients deduct far less, so a shortfall is built in.

| Item | Rate / rule |
| TDS on professional fees u/s 194J | 10% |
| Presumptive profit u/s 44ADA | 50% of receipts |
| Top salary slab | Up to 30% |

**Clients deduct just 10% TDS under Section 194J while your side income is taxed at your slab (up to 30%), so the balance is your responsibility. Source: Income Tax Act Sections 194J and 44ADA.**

## What you should do

1. Download your AIS to see every payment reported under your PAN
2. Move to ITR-3 (actual expenses) or ITR-4 (44ADA presumptive) once you have professional income
3. Pay advance tax on the gap so interest under Sections 234B and 234C does not pile up
4. For complex business income, consider professional help

## Common mistake

**Filing ITR-1 with only your salary and ignoring freelance receipts.** Once you have professional income, ITR-1 and ITR-2 are off the table, and the omitted AIS income triggers an under-reporting notice.

## Check Your AIS Before Filing

Before you file, always download your AIS to check what third parties have reported against your PAN. 

While LastMinute ITR specializes in optimizing taxes for pure salary and capital gains, complex business income reporting in ITR-3 or ITR-4 often requires professional assistance. Ensure all income streams are accounted for to avoid penalties.`
  }
];
