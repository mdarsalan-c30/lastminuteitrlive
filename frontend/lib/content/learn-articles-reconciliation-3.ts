import { LearnArticle } from "./learn-articles";

export const RECONCILIATION_ARTICLES_3: LearnArticle[] = [
  {
    slug: "penalty-for-late-itr-filing",
    title: "Penalties and Interest for Filing Your ITR Late in India",
    description: "Filing your ITR late costs money. Understand the Section 234F late fee of Rs 1,000 or Rs 5,000, the 234A interest on dues, and lost loss carry-forward rights.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "last-minute",
    tags: ["penalty", "section-234f", "late-filing", "interest"],
    relatedGlossarySlugs: ["tax-notice", "ais"],
    faqs: [
      {
        question: "Do I have to pay a penalty if my income is below the taxable limit?",
        answer: "If your gross total income does not exceed the basic exemption limit (₹2.5 Lakhs or ₹3 Lakhs depending on the regime), you do not have to pay the late filing fee under Section 234F."
      }
    ],
    body: `## The cost of procrastination

Filing after July 31 does not just cause stress, it costs real money. The department applies penalties and interest automatically.

## The penalties at a glance

| Charge | Rate |
| --- | --- |
| 234F late fee (income above Rs 5 lakh) | Rs 5,000 |
| 234F late fee (income up to Rs 5 lakh) | Rs 1,000 |
| 234F (income below exemption limit) | Rs 0 |
| 234A interest on unpaid tax | 1% per month |

**The Section 234F fee is a flat Rs 1,000 or Rs 5,000, and Section 234A adds 1% per month on outstanding tax from August 1 until you file (Source: Income Tax Act, Sections 234F and 234A).**

## Three ways late filing hurts

1. **Late fee (234F):** flat Rs 1,000 or Rs 5,000 depending on income.
2. **Interest (234A):** 1% per month (or part month) on tax due.
3. **Lost carry-forward:** capital and business losses cannot be carried forward (house-property loss is an exception).

## Where to pay (portal path)

1. Log in at incometax.gov.in.
2. Go to **e-File > e-Pay Tax**.
3. Pay tax plus the 234F fee, then file your return and e-verify.

## What you should do

If you are already late, file immediately, because every new month adds another 1% of interest under 234A.

## Common mistake

Assuming no tax due means no penalty. The 234F fee applies even on a nil-tax return once you cross the exemption limit.

## How LastMinute ITR helps

LastMinute ITR helps you consolidate documents and compute exact dues so you can file your belated return fast. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "revised-return-vs-belated-return",
    title: "Revised Return vs Belated Return: What's the Difference?",
    description: "Made a mistake or missed the deadline? Learn the key differences between a revised return and a belated return, their penalties, and the shared December cutoff.",
    readMinutes: 4,
    publishedAt: "2026-06-15",
    cluster: "last-minute",
    tags: ["revised-return", "belated-return", "itr-correction"],
    relatedGlossarySlugs: ["ais", "tax-notice"],
    faqs: [
      {
        question: "Can I revise a belated return?",
        answer: "Yes, thanks to recent changes in tax laws, if you file a belated return and later discover a mistake, you can file a revised return to correct it before the December 31st deadline."
      }
    ],
    body: `## Two different fixes

The portal offers different return types for different problems. The two most common are the **revised return** and the **belated return**, similar names but opposite purposes.

## Belated return: "I am late"

A belated return (**Section 139(4)**) is for people who missed the original July 31 deadline entirely. It carries a 234F fee, 234A interest, and the loss of most carry-forward rights.

## Revised return: "I made a mistake"

A revised return (**Section 139(5)**) is for people who filed on time but found an error, such as a missed bank account, an 80C claim, or an AIS share sale. There is **no 234F fee**, and your original filing date stands.

## Side by side

| Feature | Belated (139(4)) | Revised (139(5)) |
| --- | --- | --- |
| For | Missed deadline | Fixing an error |
| Late fee | Yes (Rs 1,000/Rs 5,000) | No |
| Carry-forward losses | Lost | Preserved |
| Final date | December 31 | December 31 |

**Both share the same final deadline of December 31 of the assessment year (Source: Income Tax Act, Sections 139(4) and 139(5)).**

## File either one (portal path)

1. Log in at incometax.gov.in and start a new return.
2. Choose **139(4)** for belated or **139(5)** for revised.
3. For a revised return, quote the original acknowledgement number.
4. Submit and e-verify.

## What you should do

If you filed on time, prefer a revised return; it is fee-free and protects your losses.

## Common mistake

Thinking a belated return cannot be revised. It can, as long as you act before December 31.

## How LastMinute ITR helps

LastMinute ITR helps you organise corrected figures before you resubmit on the portal. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "condonation-of-delay-in-itr",
    title: "Condonation of Delay for ITR: How to Request an Extension",
    description: "Missed even the belated return deadline but still owed a refund? Learn how to apply for condonation of delay under Section 119(2)(b) and the strict rules.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "last-minute",
    tags: ["condonation", "delay", "section-119", "refund"],
    relatedGlossarySlugs: ["refund", "tax-notice"],
    faqs: [
      {
        question: "Is condonation of delay always approved?",
        answer: "No. Condonation is granted at the discretion of the tax authorities and only in cases of genuine hardship (e.g., severe medical emergencies or natural disasters)."
      }
    ],
    body: `## What happens after December 31

You missed July 31, then missed the December 31 belated deadline, and now realise the department owes you a Rs 50,000 refund. Are you out of luck? Not always, because there is **condonation of delay**.

## What it is

**Under Section 119(2)(b), the department may allow a late return, usually to claim a refund or carry forward a loss, within six years from the end of the relevant assessment year (Source: Income Tax Act, Section 119(2)(b)).**

"Condonation" means the department forgives the delay. It is a request, not a right.

## The strict rules

| Rule | Detail |
| --- | --- |
| Genuine hardship | Medical emergency, bereavement, disaster |
| Time limit | Within 6 years of the AY end |
| Interest on refund | Usually not paid on the delayed refund |

A reason like "I forgot" is routinely rejected.

## How to apply (portal path)

1. Log in at incometax.gov.in.
2. Go to **Services > Condonation Request**.
3. Submit a formal application explaining the hardship, with evidence attached.

## What you should do

Gather strong proof of the hardship before applying, since the decision is discretionary and evidence-driven.

## Common mistake

Assuming approval is automatic. It is granted only in genuine cases, so a vague application usually fails.

## How LastMinute ITR helps

LastMinute ITR helps you prepare clean standard returns; for a condonation plea, we recommend a Chartered Accountant draft your application. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "advance-tax-payment-deadlines",
    title: "Advance Tax Payment Deadlines: Who Needs to Pay and When?",
    description: "Owe more than Rs 10,000 in tax after TDS? Learn who must pay advance tax, the four quarterly deadlines and percentages, and the 234B/234C interest you risk.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "last-minute",
    tags: ["advance-tax", "deadlines", "tax-payment"],
    relatedGlossarySlugs: ["ais", "tax-notice"],
    faqs: [
      {
        question: "Do salaried employees need to pay advance tax?",
        answer: "Usually no, because employers deduct TDS. However, if a salaried employee has significant other income (like rent or capital gains) pushing their net tax due above ₹10,000, they must pay advance tax."
      }
    ],
    body: `## Pay as you earn

The government does not want to wait until year-end for tax on big income. That is **advance tax**: paying in installments as you earn.

## Who must pay

**If your total tax for the year after TDS is Rs 10,000 or more, you must pay advance tax; resident seniors with no business income are exempt (Source: Income Tax Act, Sections 208 and 207).**

## The quarterly schedule

| Due date | Cumulative tax to pay |
| --- | --- |
| June 15 | 15% |
| September 15 | 45% |
| December 15 | 75% |
| March 15 | 100% |

## Pay it step by step (portal path)

1. Log in at incometax.gov.in.
2. Go to **e-File > e-Pay Tax**.
3. Choose **Advance Tax (100)** as the payment type.
4. Pay and save the challan for your records.

## What you should do

If you have rent or capital gains on top of salary, estimate the extra tax each quarter and pay so net dues stay under Rs 10,000.

## Common mistake

Skipping installments and paying it all in March. Shortfalls attract **234B and 234C** interest at about 1% per month.

## How LastMinute ITR helps

LastMinute ITR shows how missed advance tax becomes a self-assessment bill with interest, so you can plan ahead. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "which-itr-form-to-choose",
    title: "Which ITR Form Should I Choose? A Simple Guide",
    description: "Filing taxes but unsure which ITR form to use? Follow this simple guide to choose between ITR-1, ITR-2, ITR-3, and ITR-4 based on your income sources in India.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["choose-itr", "forms", "salary", "business"],
    relatedGlossarySlugs: ["ais", "tax-notice"],
    faqs: [
      {
        question: "What happens if I file my return using the wrong ITR form?",
        answer: "Filing with the wrong form will result in the income tax department sending you a Defective Return Notice under Section 139(9), forcing you to refile correctly."
      }
    ],
    body: `## The alphabet soup of tax forms

The department has several ITR forms, and the wrong one gets your return marked **defective** under Section 139(9). Here is a beginner-friendly map.

## Pick by income source

| Form | Best for |
| --- | --- |
| ITR-1 (Sahaj) | Salary, one house, interest; income up to Rs 50 lakh |
| ITR-2 | Capital gains, multiple houses, foreign assets |
| ITR-3 | Business / profession, intraday, F&O |
| ITR-4 (Sugam) | Presumptive business / profession up to Rs 50 lakh |

**Filing the wrong form is a leading cause of defective-return notices under Section 139(9) (Source: Income Tax Act, Section 139(9)).**

## Quick guide

1. **ITR-1:** resident, income up to Rs 50 lakh, salary/pension, one house, other sources, farm income up to Rs 5,000. Not for capital gains or business.
2. **ITR-2:** everything in ITR-1 with no Rs 50 lakh cap, plus capital gains, more than one house, foreign income/assets, unlisted shares.
3. **ITR-3:** ITR-2 plus business or professional income, including intraday and F&O.
4. **ITR-4:** presumptive income under 44AD/44ADA/44AE, where you declare a fixed percentage of receipts as profit.

## What you should do

List your income sources first, then match to the simplest form that legally fits. Check AIS for hidden capital gains before choosing.

## Common mistake

Defaulting to ITR-1 out of habit while AIS shows share sales. That mismatch triggers a defective-return notice.

## How LastMinute ITR helps

LastMinute ITR categorises your AIS and Form 16 data so you know which form to select on the portal. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "itr-1-vs-itr-2-differences",
    title: "ITR-1 vs ITR-2: Which Form is Right for Salaried Employees?",
    description: "Salaried but have capital gains or two houses? Learn the key differences between ITR-1 and ITR-2 so you pick the right form and avoid a defective return notice.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["itr-1", "itr-2", "salary", "capital-gains"],
    relatedGlossarySlugs: ["ais", "26as"],
    faqs: [
      {
        question: "Can I use ITR-1 if I sold mutual funds this year?",
        answer: "No. Selling mutual funds results in Capital Gains. You must use ITR-2 to report capital gains."
      }
    ],
    body: `## The great salaried dilemma

If you earn a salary, your instinct is **ITR-1 (Sahaj)**: fast and mostly pre-filled. But as you invest more, you may have quietly outgrown it and need **ITR-2**.

## When ITR-1 is perfect

- Total income under Rs 50 lakh.
- Salary or pension.
- Exactly one house property.
- Simple bank or post-office interest.

## When you must switch to ITR-2

| Trigger | Why ITR-1 fails |
| --- | --- |
| Sold shares / MF / property | Capital gains need Schedule CG |
| Two or more houses | ITR-1 allows only one |
| Income above Rs 50 lakh | ITR-1 cap exceeded |
| Foreign assets / RSUs | FA schedule required |
| Unlisted shares | Disclosure needed |

**Salaried investors are a fast-growing share of ITR-2 filers as equity participation rises across India (Source: Income Tax Department filing trends).**

## How to choose (portal path)

1. Log in at incometax.gov.in and open **Services > Annual Information Statement (AIS)**.
2. Check for any **Sale of Securities** lines.
3. If present, select **ITR-2** when you start the return.

## What you should do

Read your AIS before picking a form. One share-sale line means ITR-2, not ITR-1.

## Common mistake

Forcing capital gains into ITR-1. The automated system flags it and sends a defective-return notice.

## How LastMinute ITR helps

LastMinute ITR organises your capital gains so filling ITR-2 on the portal feels straightforward. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "correct-itr-for-freelancers",
    title: "Choosing the Right ITR Form for Freelancers in India",
    description: "Freelancer, consultant, or gig worker in India? Learn whether to file ITR-3 or ITR-4 and how presumptive taxation under Section 44ADA can save you real time.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["freelancers", "itr-3", "itr-4", "presumptive-tax"],
    relatedGlossarySlugs: ["ais", "tax-notice"],
    faqs: [
      {
        question: "Can a freelancer file ITR-1?",
        answer: "No. Freelance income is classified as 'Income from Business or Profession', which requires filing ITR-3 or ITR-4."
      }
    ],
    body: `## The gig-economy tax puzzle

Freelancer, consultant, creator, or gig worker? In the eyes of the department you run a business, so your income falls under **Profits and Gains from Business or Profession**. That rules out ITR-1 and ITR-2; you choose between **ITR-3** and **ITR-4**.

## Option 1: ITR-4 (the easy route)

ITR-4 (Sugam) suits the **presumptive scheme (Section 44ADA)**.

**Under Section 44ADA, eligible professionals declare 50% of gross receipts as profit, with a limit of Rs 50 lakh (Rs 75 lakh if 95% of receipts are digital) (Source: Income Tax Act, Section 44ADA).**

## Option 2: ITR-3 (the detailed route)

Use ITR-3 if you want to claim actual expenses, your receipts exceed the presumptive limits, or you also have capital gains (ITR-4 does not allow them).

## Side by side

| Feature | ITR-4 (44ADA) | ITR-3 |
| --- | --- | --- |
| Profit basis | 50% presumptive | Actual books |
| Receipts limit | Rs 50 / Rs 75 lakh | No cap |
| Capital gains | Not allowed | Allowed |
| Bookkeeping | Minimal | Detailed |

## How to decide (portal path)

1. Log in at incometax.gov.in and open **Services > Annual Information Statement (AIS)** to check for capital gains.
2. If none and receipts are within limits, choose **ITR-4**.
3. If you have gains or low margins, choose **ITR-3**.

## What you should do

Estimate your real profit margin. If it is well below 50% and you keep records, ITR-3 may save tax despite the extra work.

## Common mistake

Filing ITR-1 for freelance income. It is business income and will be flagged as a wrong form.

## How LastMinute ITR helps

LastMinute ITR organises your invoices and AIS data so the right path is clear. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "itr-form-for-capital-gains",
    title: "Which ITR Form to Use for Capital Gains from Stocks?",
    description: "Sold stocks or mutual funds this year? You cannot use ITR-1. Learn which ITR form to use for short-term and long-term capital gains, and the latest tax rates.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["capital-gains", "stocks", "itr-2", "itr-3"],
    relatedGlossarySlugs: ["ais", "26as"],
    faqs: [
      {
        question: "Do I need to report mutual fund sales if I didn't make a profit?",
        answer: "Yes. Even if you made a loss, you must report the sale. Reporting capital losses actually benefits you, as you can carry them forward to offset future gains."
      }
    ],
    body: `## The investor's tax burden

Selling stocks or mutual funds triggers a tax event called **capital gains** (or loss), and it disqualifies you from the simple ITR-1.

## Pick by how you trade

| Activity | Tax head | Form |
| --- | --- | --- |
| Delivery buy/sell (held days plus) | Capital gains | ITR-2 |
| Intraday / F&O | Business income | ITR-3 |

**For equity sold on or after 23 July 2024, STCG is 20% and LTCG above Rs 1.25 lakh a year is 12.5% without indexation (Source: Finance Act 2024).**

## Scenario 1: delivery trading (ITR-2)

Buy and hold, then sell, whether short-term (STCG) or long-term (LTCG). If this is your only market activity, file **ITR-2**.

## Scenario 2: intraday and F&O (ITR-3)

Same-day trades or Futures and Options count as **business income**, so you file the more detailed **ITR-3**.

## Do not ignore AIS (portal path)

1. Log in at incometax.gov.in and open **Services > Annual Information Statement (AIS)**.
2. Find **Sale of Securities and Units of Mutual Fund**.
3. If you see sales, file ITR-2 (or ITR-3), never ITR-1.

## What you should do

Report even loss-making sales. Booking a capital loss lets you carry it forward to offset future gains.

## Common mistake

Hiding share sales because "it was a loss". Unreported sales still create an AIS mismatch and a notice.

## How LastMinute ITR helps

LastMinute ITR helps you organise broker capital gains statements (Zerodha, Groww, Upstox) for ITR-2/ITR-3. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "presumptive-taxation-itr-4",
    title: "Understanding ITR-4 and Presumptive Taxation (Section 44AD)",
    description: "Run a small business or profession? Learn how ITR-4 and presumptive taxation under Sections 44AD and 44ADA let you declare a fixed profit and skip heavy books.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["itr-4", "section-44ad", "presumptive-tax", "business"],
    relatedGlossarySlugs: ["ais", "tax-notice"],
    faqs: [
      {
        question: "Who can use Section 44AD?",
        answer: "Resident individuals, HUFs, and partnership firms running eligible businesses with a turnover of up to ₹2 Crores (or ₹3 Crores if 95% of receipts are digital) can use Section 44AD."
      }
    ],
    body: `## Accounting made simple

Running a small business or practice is hard enough without complex ledgers. The **presumptive scheme** lets you file the simpler **ITR-4 (Sugam)** by declaring a fixed percentage of receipts as profit.

## How it works

**Section 44AD lets eligible businesses declare 8% of cash and 6% of digital receipts as profit (turnover up to Rs 2 crore, or Rs 3 crore if 95% digital); Section 44ADA lets professionals declare 50% (receipts up to Rs 50 lakh, Rs 75 lakh if 95% digital) (Source: Income Tax Act, Sections 44AD and 44ADA).**

| Scheme | Profit declared | Limit |
| --- | --- | --- |
| 44AD (business) | 8% cash / 6% digital | Rs 2 cr / Rs 3 cr |
| 44ADA (profession) | 50% | Rs 50 / Rs 75 lakh |

## The catch

If you opt in, you **cannot separately claim** business expenses like rent or laptop depreciation; the scheme assumes the rest covers them.

## When ITR-4 is not allowed

- Capital gains (sold stocks or property).
- More than one house property.
- Foreign assets or foreign income.

## File it (portal path)

1. Log in at incometax.gov.in and start ITR-4.
2. Enter turnover/receipts and the presumptive profit.
3. Pay any tax via e-Pay Tax, then submit and e-verify.

## What you should do

Compare your real margin to the presumptive rate. If your actual profit is much lower and you keep books, ITR-3 may be cheaper.

## Common mistake

Choosing 44AD then also claiming expenses. The scheme bundles expenses into the presumed profit.

## How LastMinute ITR helps

LastMinute ITR's checklist confirms your eligibility so your ITR-4 filing on the portal is clean. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "itr-for-multiple-houses",
    title: "Filing ITR When You Own Multiple House Properties",
    description: "Own more than one house in India? Learn how rental income, self-occupied limits, and deemed rent are taxed, and why you must file ITR-2 for multiple properties.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["house-property", "rent", "itr-2", "multiple-houses"],
    relatedGlossarySlugs: ["ais", "tax-notice"],
    faqs: [
      {
        question: "Do I have to pay tax on an empty house?",
        answer: "If you own more than two houses, any house beyond the first two is treated as 'deemed let out'. You have to calculate a notional rent and pay tax on it, even if the house is locked and empty."
      }
    ],
    body: `## Real estate and your tax return

Owning more than one home is a milestone, and the moment your name is on a second deed, the simple ITR-1 no longer fits. You move to **ITR-2** (or ITR-3 with business income).

## Why the form changes

ITR-1 allows income or loss from only **one** house property. Two or more, rented or empty, requires **ITR-2**.

## How multiple houses are taxed

| Property type | How it is taxed |
| --- | --- |
| Self-occupied (up to 2) | Rent treated as nil; claim loan interest |
| Rented out | Declare rent; 30% standard deduction |
| Deemed let out (3rd plus) | Pay tax on notional rent |

**On rented property you can claim a flat 30% standard deduction on net annual value under Section 24(a), plus home-loan interest (Source: Income Tax Act, Section 24).**

## The deemed-rent rule

You may treat up to **two** houses as self-occupied. A third (or more) is **deemed let out**: you compute a fair market rent and pay tax on that notional income, even if it sits empty.

## Where to look (portal path)

1. Log in at incometax.gov.in and open **Services > Annual Information Statement (AIS)**, where tenant TDS on rent may appear.
2. Start **ITR-2** and fill the House Property schedule for each property.

## What you should do

Gather every loan interest certificate and municipal tax receipt before you start the property schedules.

## Common mistake

Forgetting deemed rent on an empty third house. The department still expects tax on its notional rent.

## How LastMinute ITR helps

LastMinute ITR helps you assemble loan and rent details before you tackle the property schedules on the portal. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  }
];
