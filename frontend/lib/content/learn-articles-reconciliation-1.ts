import { LearnArticle } from "./learn-articles";

export const RECONCILIATION_ARTICLES_1: LearnArticle[] = [
  {
    slug: "ais-vs-26as-differences",
    title: "AIS vs Form 26AS: What's the Difference and Which to Use?",
    description: "Confused between AIS and Form 26AS before filing your ITR? Learn the key differences, what each document shows, and exactly which one to check on the portal.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "ais",
    tags: ["ais", "26as", "itr-filing", "tax-documents"],
    relatedGlossarySlugs: ["ais", "26as"],
    faqs: [
      {
        question: "Is AIS the same as Form 26AS?",
        answer: "No. Form 26AS primarily shows tax credits like TDS and TCS, while AIS (Annual Information Statement) shows a much broader range of financial transactions including savings interest, mutual fund sales, and more."
      }
    ],
    body: `## Do not mix up your two tax documents

When you log in to incometax.gov.in, you will see two big documents: **Form 26AS** and the **AIS (Annual Information Statement)**. Beginners often treat them as the same thing. They are not, and knowing the difference is the first step to a clean, notice-free return.

## Form 26AS in plain words

Think of **Form 26AS** as your tax-credit passbook. It mainly records tax that has already been paid against your PAN:
- **TDS (Tax Deducted at Source):** tax your employer or bank cut before paying you.
- **TCS (Tax Collected at Source):** tax collected on certain spends, like a foreign tour package or a car.
- **Advance / self-assessment tax:** tax you paid yourself during the year.

Rule of thumb: if you want to *claim* a tax credit in your ITR, it must show up in Form 26AS.

## AIS in plain words

**AIS** is a much wider net. It includes the tax credits in 26AS, plus third-party reports about your money: savings interest, FD interest, mutual fund and share sales, dividends, rent received, and big-ticket purchases. A related screen, the **TIS (Taxpayer Information Summary)**, simply totals AIS data category-wise for pre-filling your return.

## How they compare

| What it tracks | Form 26AS | AIS |
| --- | --- | --- |
| TDS / TCS credits | Yes | Yes |
| Advance / self-assessment tax | Yes | Yes |
| Savings and FD interest | No | Yes |
| Mutual fund / share sales | No | Yes |
| High-value purchases (SFT) | No | Yes |

**Stat to know: India recorded over 7.28 crore ITRs filed for AY 2024-25 by 31 July 2024 (Source: Income Tax Department / CBDT press release).** At that scale, the department leans heavily on AIS data-matching to catch unreported income.

## How to view both (exact portal path)

1. Log in at incometax.gov.in with your PAN and password.
2. For AIS: go to **Services > Annual Information Statement (AIS)** and open the **AIS** tile.
3. For 26AS: go to **e-File > Income Tax Returns > View Form 26AS** and proceed to the TRACES screen.
4. Download both as PDF (the password is your PAN in lowercase plus date of birth as DDMMYYYY).

## What you should do

Use **both**: Form 26AS to confirm the tax credits you will claim, and AIS to make sure you are not silently missing income such as a small savings-interest line.

## Common mistake

Filing only from Form 16 and ignoring AIS. Your employer never sees your bank interest, so a clean Form 16 does not mean a complete return.

## How LastMinute ITR helps

LastMinute ITR reconciles your Form 16 against both AIS and 26AS and flags gaps before you file. Start at [/file](/file), pull documents via [/file/import/documents](/file/import/documents), and review gaps at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "form-16-and-ais-mismatch",
    title: "Form 16 and AIS Mismatch: How to Fix It Before Filing ITR",
    description: "Does your Form 16 not match your AIS on the tax portal? Learn why mismatches happen and the simple steps to fix them before you file and avoid a tax notice.",
    readMinutes: 7,
    publishedAt: "2026-06-15",
    cluster: "ais",
    tags: ["form-16", "ais", "mismatch", "tax-notice"],
    relatedGlossarySlugs: ["ais", "tax-notice"],
    faqs: [
      {
        question: "What should I do if my AIS shows more income than my Form 16?",
        answer: "If the AIS data is correct (e.g., bank interest you forgot to tell your employer about), you must include it in your ITR. If the AIS data is incorrect, submit feedback on the portal."
      }
    ],
    body: `## The classic filing headache

You get your **Form 16** from HR, download your **AIS (Annual Information Statement)** from incometax.gov.in, compare the two, and the numbers do not match. Take a breath. For salaried Indians this is one of the most common situations, and it is completely fixable.

## Why the gap happens

Your employer builds Form 16 from only the salary they paid and the proofs you gave them. AIS gathers data from everyone:
- **Banks** report savings and FD interest.
- **Mutual fund registrars and brokers** report SIP redemptions and share sales.
- **A previous employer** reports salary you earned before switching jobs.

So AIS usually shows *more* income than Form 16.

## The number that matters

**An unreconciled mismatch can trigger a Section 143(1) adjustment or a notice, and filing late afterwards adds a Section 234F fee of Rs 1,000 (income up to Rs 5 lakh) or Rs 5,000 (above Rs 5 lakh) (Source: Income Tax Act, Section 234F).** Fixing the gap before you file is far cheaper than fixing it after.

| Form 16 says | AIS also shows | Action |
| --- | --- | --- |
| Salary only | FD interest Rs 38,000 | Add under Other Sources |
| Current job salary | Old employer salary plus TDS | Merge both |
| Nothing on investments | Share / MF sale value | Check capital gains, maybe ITR-2 |

## Fix it in three steps (portal path)

1. **Download AIS:** log in to incometax.gov.in, go to **Services > Annual Information Statement (AIS)**, open the AIS tile, and download.
2. **Accept correct additions:** real income you missed (say HDFC savings interest) goes under **Income from Other Sources**, and you pay any extra self-assessment tax before submitting.
3. **Dispute wrong entries:** if a line is duplicated or not yours, open it in AIS and submit feedback such as "Information is not fully correct" or "Information relates to other PAN".

## What you should do

Build a quick three-column list: AIS line, amount, already in my draft? For every "no", add the income or raise feedback. Never leave an AIS line unexplained.

## Common mistake

Assuming Form 16 is the full story. It never includes bank interest, so a clean Form 16 with a fatter AIS is exactly how mismatch notices begin.

## How LastMinute ITR helps

LastMinute ITR reconciles Form 16 against AIS and 26AS automatically and shows the exact gaps. Begin at [/file](/file), import at [/file/import/documents](/file/import/documents), and review flags at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "how-to-submit-ais-feedback",
    title: "How to Submit Feedback on AIS for Incorrect Transactions",
    description: "Found a transaction in your AIS that is not yours or is duplicated? Follow these portal steps to submit AIS feedback and correct your data before filing ITR.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "ais",
    tags: ["ais", "feedback", "tax-portal", "errors"],
    relatedGlossarySlugs: ["ais", "26as"],
    faqs: [
      {
        question: "Can I correct my AIS data if it's wrong?",
        answer: "Yes, the income tax portal allows you to submit feedback on any transaction in your AIS that you believe is incorrect, duplicated, or belongs to someone else."
      }
    ],
    body: `## When the data about you is wrong

Your **AIS (Annual Information Statement)** is powerful, but not perfect. Banks and brokers sometimes report a transaction twice, or tag someone else's deal to your PAN. If you file without correcting it, you could end up declaring income that was never yours.

The good news: the portal lets you push back with **AIS feedback**, and your **TIS (Taxpayer Information Summary)** updates automatically.

## The feedback options you can pick

| Feedback option | Use it when |
| --- | --- |
| Information is correct | The entry is accurate |
| Information is not fully correct | Amount or detail is partly wrong |
| Information relates to other PAN/year | Not yours, or wrong year |
| Information is duplicate | Same transaction counted twice |
| Information is denied | The transaction never happened |

**Stat to know: AIS was rolled out in November 2021 and now feeds the pre-filled ITR for crores of taxpayers (Source: CBDT / Income Tax Department).** Your feedback directly changes that pre-fill.

## Step-by-step on incometax.gov.in

1. **Log in** at incometax.gov.in with your PAN and password.
2. Go to **Services > Annual Information Statement (AIS)**.
3. Open the **AIS** tile (you will see Part A and Part B).
4. Click the category with the error (for example, SFT Information), then click the specific transaction.
5. Click the **Optional / feedback** button on the transaction.
6. Choose the right option from the list above and enter the correct value if asked.
7. **Submit** and save the acknowledgement.

## What you should do

Give yourself 10 minutes to scan AIS a few days before filing. Even if everything is correct, you will file with confidence. If something is wrong, fix it now, not after a notice.

## Common mistake

Submitting feedback and then forgetting to refresh your figures. Always re-check TIS after feedback so your return uses the corrected, processed value.

## How LastMinute ITR helps

LastMinute ITR highlights AIS lines that look duplicated or inconsistent so you know exactly what to dispute. Start at [/file](/file), import documents at [/file/import/documents](/file/import/documents), and check flagged items at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "what-is-tis-in-income-tax",
    title: "What is TIS in Income Tax? Taxpayer Information Summary",
    description: "Understand the Taxpayer Information Summary (TIS), how it differs from AIS, and why this summarised pre-fill data matters for accurate ITR e-filing in India.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "ais",
    tags: ["tis", "ais", "tax-summary", "e-filing"],
    relatedGlossarySlugs: ["ais", "26as"],
    faqs: [
      {
        question: "What is the difference between AIS and TIS?",
        answer: "AIS provides a detailed, line-by-line breakdown of every financial transaction reported to the tax department. TIS is a consolidated summary of that AIS data, grouped by income category, ready to be pre-filled into your ITR."
      }
    ],
    body: `## The summary sheet for your taxes

Open the AIS section on incometax.gov.in and you actually get two things: **AIS** and **TIS**. AIS gets all the attention, but **TIS (Taxpayer Information Summary)** is what the portal uses to pre-fill your return.

## AIS vs TIS in one line

If **AIS** is the detailed receipt listing every item, **TIS** is the final bill showing category totals: salary, savings interest, deposit interest, dividends, and so on.

## The two values TIS shows

| Value in TIS | What it means |
| --- | --- |
| Reported Value | What banks / brokers originally reported |
| Processed Value | The corrected figure after your AIS feedback |

**Stat to know: TIS aggregates the AIS data that powers the pre-filled ITR, and over 7.28 crore returns were filed for AY 2024-25 largely using this pre-fill (Source: Income Tax Department / CBDT).** When you submit feedback in AIS (say, marking a duplicate FD entry), the Processed Value in TIS recalculates instantly.

## How to view your TIS (portal path)

1. Log in at incometax.gov.in.
2. Go to **Services > Annual Information Statement (AIS)**.
3. Open the **TIS** tile next to AIS.
4. Note the Processed Value in each category, because that is what flows into your return.

## What you should do

Always review the detailed AIS first. If every line is correct, your TIS is ready. Use the Processed Values to cross-check your own computation before filing.

## Common mistake

Trusting the Reported Value when you have already disputed an entry. Use the **Processed Value**, since it reflects your feedback.

## How LastMinute ITR helps

LastMinute ITR cross-checks your TIS totals against your Form 16 and draft computation so nothing is double-counted or missed. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "fixed-deposit-interest-in-ais",
    title: "How FD Interest is Reported in AIS: A Guide for Taxpayers",
    description: "Banks report your fixed deposit interest to the tax department even with no TDS. Learn how FD interest appears in AIS and how to report it correctly in ITR.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "ais",
    tags: ["fd-interest", "ais", "banking", "tax-reporting"],
    relatedGlossarySlugs: ["ais", "tax-notice"],
    faqs: [
      {
        question: "Do I have to pay tax on FD interest if TDS was already deducted?",
        answer: "Yes. TDS is usually 10%, but if you fall in the 20% or 30% tax bracket, you must report the interest and pay the remaining tax as Self-Assessment Tax."
      }
    ],
    body: `## The most commonly missed income

For years, many salaried Indians ignored their **fixed deposit (FD) interest** at tax time. They assumed that because the bank cut TDS, the job was done. The **AIS (Annual Information Statement)** has ended that assumption.

## How your bank reports it

Every bank reports the interest you earn against your PAN, and it lands in AIS under **Interest from Deposit**. Even if you filed Form 15G/15H to stop TDS, the bank still reports the interest. **No TDS does not mean no tax.**

## The numbers that bite

**Banks deduct TDS at 10% once FD interest crosses Rs 40,000 in a year (Rs 50,000 for senior citizens) under Section 194A (Source: Income Tax Act, Section 194A).** But TDS is only a part-payment; you owe tax at your slab rate.

| Your slab | Bank TDS | Extra you still owe |
| --- | --- | --- |
| 5% | 10% | Nothing (may get a refund) |
| 20% | 10% | About 10% more |
| 30% | 10% | About 20% more |

## What to do, step by step

1. **Download AIS** at incometax.gov.in via **Services > Annual Information Statement (AIS)**.
2. Read the total under **Interest from Deposit**.
3. Add it to your return under **Income from Other Sources**.
4. **Claim the TDS** credit (cross-check it in Form 26AS).
5. Pay any shortfall as **self-assessment tax** before you submit.

## What you should do

Report the exact AIS figure, not a rounded guess. If the bank deducted TDS, claim it so you are not taxed twice.

## Common mistake

Treating "TDS already deducted" as "fully taxed". A 30% slab taxpayer with only 10% TDS still owes the balance, and skipping it invites an automated mismatch notice.

## How LastMinute ITR helps

LastMinute ITR pulls every interest line together and matches TDS to 26AS so you do not miss a rupee. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and check gaps at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "mutual-fund-transactions-in-ais",
    title: "Tracking Mutual Fund and Stock Transactions in Your AIS",
    description: "Wondering how the tax department sees your trades? Learn how mutual fund and share sales appear in AIS, why gross value is not your gain, and which ITR to use.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "ais",
    tags: ["mutual-funds", "stocks", "ais", "capital-gains"],
    relatedGlossarySlugs: ["ais", "26as"],
    faqs: [
      {
        question: "If AIS shows my mutual fund sale, do I pay tax on the whole amount?",
        answer: "No. The AIS usually shows the 'Gross Sale Consideration' (total sale value). You only pay tax on your Capital Gains (Sale value minus Purchase cost)."
      }
    ],
    body: `## Your portfolio is on the portal

Sold shares or redeemed mutual funds? Those trades sit right inside your **AIS (Annual Information Statement)**. The department now gets detailed data from depositories (CDSL/NSDL), mutual fund registrars (CAMS/KFintech), and brokers.

## What shows up

- **Sale of securities and units of mutual funds:** the total money you received.
- **Dividends:** payouts credited to your bank.
- **Purchase of securities:** sometimes large buys are reported too.

## The "gross value" trap

Your AIS may show a mutual fund sale of Rs 5,00,000. **Do not add Rs 5,00,000 to your income.** AIS reports the *gross sale value*; you are taxed only on the **capital gain** (sale value minus purchase cost). A buy cost of Rs 4,80,000 means a taxable gain of just Rs 20,000.

## The tax rates to know

**For sales on or after 23 July 2024, equity STCG is taxed at 20% and equity LTCG above Rs 1.25 lakh per year at 12.5% without indexation (Source: Finance Act 2024 / Union Budget 2024).**

| Holding | Equity rate | Form |
| --- | --- | --- |
| Short-term (under 12 months) | 20% | ITR-2 |
| Long-term (12 months plus) | 12.5% over Rs 1.25 lakh | ITR-2 |
| Intraday / F&O | Slab (business income) | ITR-3 |

## Which form, and where to look (portal path)

1. Log in at incometax.gov.in and open **Services > Annual Information Statement (AIS)**.
2. Find **Sale of Securities and Units of Mutual Fund**.
3. If you see any sales, you cannot use ITR-1; move to **ITR-2** (or **ITR-3** for intraday/F&O).

## What you should do

Download the capital gains statement from your broker (Zerodha, Groww, Upstox) for the exact STCG/LTCG split, and report gains, not gross value.

## Common mistake

Filing ITR-1 while AIS shows share sales. The system flags it and you get a defective-return notice under Section 139(9).

## How LastMinute ITR helps

LastMinute ITR helps you organise capital gains data and points you to the correct form before you fill Schedule CG on the portal. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "section-143-1-intimation-explained",
    title: "Section 143(1) Intimation Explained: Is It a Tax Notice?",
    description: "Received an intimation under Section 143(1) after filing your ITR? Learn what it means, how to read the comparison columns, and when you must act on a demand.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "mistakes",
    tags: ["section-143-1", "intimation", "tax-notice"],
    relatedGlossarySlugs: ["tax-notice", "refund"],
    faqs: [
      {
        question: "Do I need to reply to a Section 143(1) intimation?",
        answer: "Only if the intimation shows a tax demand (tax payable). If it shows a refund or zero demand, no action is required."
      }
    ],
    body: `## The email that scares everyone

A few weeks after filing, a password-protected PDF lands in your inbox: **"Intimation under Section 143(1)"**. Your stomach drops. Relax, an **intimation** is not a scrutiny notice. It is an automated result from the Centralised Processing Centre (CPC).

## What it actually is

When you file, CPC checks arithmetic, verifies your TDS against Form 26AS, and compares income. The 143(1) intimation reports the outcome.

| Outcome | What it means | Action |
| --- | --- | --- |
| No difference | Your figures match CPC | None |
| Refund determined | You paid extra tax | None, await refund |
| Demand raised | CPC found a shortfall | Respond within 30 days |

**Timing to know: a Section 143(1) intimation can be issued up to 9 months from the end of the financial year in which the return is filed (Source: Income Tax Act, Section 143(1)).** No intimation in that window usually means the return is accepted as filed.

## How to read it

The PDF has two columns: **As provided by taxpayer** and **As computed under 143(1)**. Compare them line by line to spot exactly where CPC differs (often a missed TDS credit or a disallowed deduction).

## If there is a demand (portal path)

1. Log in at incometax.gov.in.
2. Go to **Pending Actions > Response to Outstanding Demand** (or **e-Proceedings**).
3. Choose **Agree** and pay via e-Pay Tax, or **Disagree** and file a rectification under Section 154 with your reason.

## What you should do

Open the PDF (password is PAN in lowercase plus date of birth as DDMMYYYY), read both columns, and act only if the right column shows higher tax.

## Common mistake

Panicking and ignoring it. A "no demand" intimation needs nothing; a demand ignored for 30 days starts attracting interest.

## How LastMinute ITR helps

LastMinute ITR cross-checks your numbers against AIS and 26AS before you file, so your 143(1) is far more likely to bring a refund than a demand. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "defective-return-notice-139-9",
    title: "Got a Defective Return Notice Under Section 139(9)? Fix It",
    description: "Got a defective return notice under Section 139(9)? Learn the common reasons it is issued and follow our step-by-step guide to correct and resubmit your ITR.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "mistakes",
    tags: ["section-139-9", "defective-return", "notice"],
    relatedGlossarySlugs: ["tax-notice", "ais"],
    faqs: [
      {
        question: "How many days do I have to reply to a defective return notice?",
        answer: "You typically have 15 days from the date of receiving the notice under Section 139(9) to correct the defects and resubmit your return."
      }
    ],
    body: `## What makes a return "defective"

You thought you were done, then a notice under **Section 139(9)** says your return is "defective". This is not a legal problem; it means information is missing or inconsistent, and CPC cannot process the return until you fix it.

## Common triggers

| Reason | Example |
| --- | --- |
| TDS claimed, income not offered | Claimed FD TDS but skipped the interest |
| Wrong ITR form | Filed ITR-1 with capital gains in AIS |
| Missing audit / balance-sheet details | ITR-3/ITR-4 left mandatory fields blank |
| Self-assessment tax unpaid | Filed without paying the tax due |

**Deadline to know: you usually get 15 days from the date of the Section 139(9) notice to respond (Source: Income Tax Act, Section 139(9)).** Miss it and your original return can be treated as invalid, as if you never filed.

## Fix it step by step (portal path)

1. Log in at incometax.gov.in.
2. Go to **Pending Actions > e-Proceedings**.
3. Open the notice and read the exact error code and description.
4. Choose **Agree** or **Disagree** with the defect.
5. If you agree, prepare a corrected return (JSON) and upload it in response.

## What you should do

Respond well inside 15 days. If you need more time, you can request it on the portal, but do not let the clock run out.

## Common mistake

Ignoring the notice because "the return is already filed". Silence here can invalidate the whole return and trigger late-filing penalties.

## How LastMinute ITR helps

LastMinute ITR helps you pick the right form and report all AIS income the first time, so a 139(9) notice is far less likely. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "outstanding-tax-demand-notice",
    title: "How to Handle an Outstanding Income Tax Demand Notice",
    description: "Received an outstanding tax demand notice? Learn how to verify the demand on the portal, agree or disagree, and pay your dues safely without costly mistakes.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "mistakes",
    tags: ["tax-demand", "notice", "tax-payment", "portal"],
    relatedGlossarySlugs: ["tax-notice", "refund"],
    faqs: [
      {
        question: "What happens if I ignore an outstanding tax demand?",
        answer: "If ignored, the tax department can charge penal interest under Section 220(2), adjust the demand against your future tax refunds, or even initiate recovery proceedings."
      }
    ],
    body: `## The dreaded tax demand

An **Outstanding Tax Demand** notice means the department believes you owe more tax for a given assessment year, perhaps a TDS mismatch, a disallowed deduction, or a calculation gap. It is best handled quickly, but calmly.

## Verify before you pay (portal path)

1. Log in at incometax.gov.in.
2. Go to **Pending Actions > Response to Outstanding Demand**.
3. Check the **Assessment Year** and amount.
4. Download the intimation order to see *why* the demand was raised.

## The cost of waiting

**Unpaid demands attract interest at 1% per month under Section 220(2), and the department can adjust the demand against future refunds under Section 245 (Source: Income Tax Act, Sections 220 and 245).**

## Your response options

| Option | When to choose it |
| --- | --- |
| Demand is correct | You agree and will pay |
| Demand is partially correct | You agree with part only |
| Disagree with demand | You have proof of an error |

## What you should do

If correct, pay via e-Pay Tax and keep the challan. If wrong (say a TDS certificate was ignored), choose **Disagree**, give a clear reason such as "TDS credit mismatched" or "Demand already paid", and attach proof.

## Common mistake

Paying a demand that is actually wrong, just to make it disappear. Always download the intimation order and check the reason first.

## How LastMinute ITR helps

LastMinute ITR reconciles Form 16, AIS, and 26AS before you file, which is the simplest way to avoid surprise demands. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "how-to-reply-to-tax-notice",
    title: "How to Reply to an Income Tax Notice Online: Simple Guide",
    description: "Got an income tax notice and not sure what to do? Follow this jargon-free guide to read, understand, and reply to any tax notice on the e-filing portal.",
    readMinutes: 7,
    publishedAt: "2026-06-15",
    cluster: "mistakes",
    tags: ["tax-notice", "e-filing", "compliance", "reply"],
    relatedGlossarySlugs: ["tax-notice", "ais"],
    faqs: [
      {
        question: "Can I reply to an income tax notice online?",
        answer: "Yes, almost all income tax notices must be replied to online through the 'e-Proceedings' tab on the incometax.gov.in portal. You do not need to visit a tax office."
      }
    ],
    body: `## The golden rule: never ignore a notice

Ignoring an income tax notice can lead to penalties, withheld refunds, or worse. The good news: responding is now a fully digital, **faceless** process, so you do not visit any tax office.

## First, identify the notice

| Section | What it means |
| --- | --- |
| 143(1) | Intimation: processing result or math adjustment |
| 139(9) | Defective return: fix and resubmit |
| 143(2) | Scrutiny: detailed review of your return |
| 148 | Income escaping assessment: suspected unreported income |
| 245 | Refund being adjusted against an old demand |

**Most notices are time-bound: a 139(9) typically allows 15 days and a 143(1) demand 30 days to respond (Source: Income Tax Act).** Always check the deadline printed on the notice.

## Reply step by step (portal path)

1. Log in at incometax.gov.in.
2. Go to **Pending Actions > e-Proceedings**.
3. Click the notice you want to answer.
4. Agree or disagree as asked, and upload clean, clearly named PDFs (rent receipts, bank statements, TDS certificates).
5. Submit and save the acknowledgement.

## What you should do

Read the section first, note the deadline, and keep responses short, factual, and backed by documents.

## Common mistake

Treating every notice as a scrutiny. A 143(1) about a small math difference is routine; a 143(2) or 148 is serious and usually deserves a Chartered Accountant.

## How LastMinute ITR helps

LastMinute ITR helps you file correctly the first time by reconciling your documents, the surest way to avoid notices. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  }
];
