import { LearnArticle } from "./learn-articles";

export const RECONCILIATION_ARTICLES_2: LearnArticle[] = [
  {
    slug: "notice-for-high-value-transactions",
    title: "Income Tax Notice for High-Value Transactions: What to Do",
    description: "Got a notice for big cash deposits, property, or investments? Learn how SFT reporting tracks high-value transactions and how to respond on the tax portal.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "mistakes",
    tags: ["high-value-transactions", "notice", "sft"],
    relatedGlossarySlugs: ["ais", "tax-notice"],
    faqs: [
      {
        question: "How does the tax department know about my high-value transactions?",
        answer: "Banks, mutual fund houses, and registrars are required to file a Statement of Financial Transactions (SFT) reporting large cash deposits, property purchases, and major investments linked to your PAN."
      }
    ],
    body: `## The eyes of the tax department

Trying to hide a big cash deposit or a property buy is nearly impossible today. The department uses the **SFT (Statement of Financial Transactions)**, reports filed by banks, registrars, and others, to track high-value activity against your PAN.

## What can trigger it

**SFT reporting thresholds include Rs 10 lakh or more in cash deposits, Rs 10 lakh or more in shares/MF/bonds, Rs 1 lakh or more in credit card bills paid in cash, and property of Rs 30 lakh or more (Source: Income Tax Rule 114E).**

| Transaction | Reporting threshold |
| --- | --- |
| Cash deposit in savings | Rs 10 lakh or more in a year |
| Mutual funds / shares / bonds | Rs 10 lakh or more in a year |
| Credit card bill (cash) | Rs 1 lakh or more |
| Property purchase / sale | Rs 30 lakh or more |

If your ITR shows Rs 5 lakh income but SFT shows a Rs 40 lakh flat purchase, the system asks you to explain the source.

## How to respond (portal path)

1. Log in at incometax.gov.in and open the **Compliance Portal** (via **Pending Actions > Compliance Portal / e-Campaign**).
2. Review the exact SFT entry being questioned.
3. Submit a response: "Information is correct", "Information is not fully correct", or "Information relates to other PAN".
4. If correct, explain the source: past savings, a loan, sale of another asset, or a gift.

## What you should do

Check your AIS for SFT lines before filing, and keep proof of the source of big-ticket funds (sale deed, loan sanction, bank statements).

## Common mistake

Assuming a high-value transaction is taxable by itself. It is not income, but an *unexplained* source is what creates trouble.

## How LastMinute ITR helps

LastMinute ITR surfaces SFT and high-value lines from your AIS so nothing is overlooked before you file. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "tds-mismatch-notice-resolution",
    title: "Resolving TDS Mismatch Notices from the Tax Department",
    description: "Facing a TDS mismatch notice or rejected TDS claim? Learn how to reconcile your claimed TDS with Form 26AS and fix the issue with a rectification request.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "mistakes",
    tags: ["tds", "mismatch", "notice", "26as"],
    relatedGlossarySlugs: ["26as", "tax-notice"],
    faqs: [
      {
        question: "Why did my TDS claim get rejected in the 143(1) intimation?",
        answer: "TDS claims are usually rejected if the amount you claimed in your ITR does not exactly match the TDS credit available in your Form 26AS at the time of processing."
      }
    ],
    body: `## The frustration of uncredited TDS

Your employer or bank deducted TDS, gave you Form 16/16A, you claimed it, and then a Section 143(1) intimation rejects the claim and raises a demand. Welcome to the **TDS mismatch**.

## Why it happens

CPC follows one rule: **if the TDS is not in your Form 26AS, you do not get credit.**

| Cause | What went wrong |
| --- | --- |
| Deductor has not filed TDS return | Credit not yet uploaded |
| Wrong PAN in deductor's filing | Credit went elsewhere |
| Wrong TAN claimed in your ITR | Mismatch on lookup |
| TDS claimed in wrong year | Period mismatch |

**Stat to know: TDS contributes a large share of direct tax collections, and CPC matches every claim line against 26AS before granting credit (Source: Income Tax Department / CBDT).** That is why even a small PAN typo can block your credit.

## How to fix it (portal path)

1. Log in at incometax.gov.in and open **e-File > Income Tax Returns > View Form 26AS** to confirm whether the TDS appears.
2. If it is missing, contact the deductor and ask them to revise their TDS return with your correct PAN.
3. Once 26AS shows the TDS, go to **Services > Rectification** and file a **Section 154** rectification to reprocess your return.

## What you should do

Match every TDS line in Form 16/16A to 26AS before filing, and claim only what 26AS shows on filing day.

## Common mistake

Expecting the department to fix a missing entry. Only the deductor can correct their return, so chase them, not CPC.

## How LastMinute ITR helps

LastMinute ITR verifies your Form 16 against 26AS so mismatches show up before you file, not after. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "how-to-check-itr-refund-status",
    title: "How to Check Your Income Tax Refund Status Online Easily",
    description: "Waiting for your income tax refund? Learn the easiest ways to track your refund status online using your PAN, what each status means, and when to worry.",
    readMinutes: 4,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["refund-status", "pan", "e-filing", "tax-refund"],
    relatedGlossarySlugs: ["refund", "ais"],
    faqs: [
      {
        question: "Where can I check my income tax refund status?",
        answer: "You can check your refund status by logging into the incometax.gov.in portal or by visiting the NSDL-TIN refund tracking website."
      }
    ],
    body: `## Where is my money?

You filed, e-verified, and the computation shows a refund. Now the wait begins, and you can track it online instead of guessing.

## The speed today

**CBDT has said average refund processing time dropped sharply, with many refunds for AY 2024-25 issued in around 10 days of verification (Source: CBDT / Ministry of Finance).** Most simple ITR-1 refunds still land within 20 to 45 days.

## Method 1: the e-Filing portal (most detailed)

1. Log in at incometax.gov.in.
2. Go to **e-File > Income Tax Returns > View Filed Returns**.
3. Open the relevant Assessment Year.
4. See the timeline: Return Filed, Verified, Processing, Processing Completed.
5. If issued, the refund date and amount appear here.

## Method 2: the NSDL/TIN check (quick)

1. Visit the TIN refund-tracking page.
2. Enter your **PAN** and the **Assessment Year**.
3. Enter the captcha and submit.

## What the statuses mean

| Status | Meaning |
| --- | --- |
| Refund Determined | Approved, sent to SBI |
| Refund Paid | Credited to your bank |
| Refund Failed | Bank issue (IFSC, validation) |

## What you should do

Make sure your bank account is **pre-validated** and nominated for refund before you expect any credit.

## Common mistake

Tracking status before e-verifying. The clock does not start until the return is e-verified within 30 days of filing.

## How LastMinute ITR helps

LastMinute ITR reminds you to e-verify and pre-validate your bank account so the refund flows smoothly. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "reasons-for-refund-failure",
    title: "Why Did My Income Tax Refund Fail? Common Reasons",
    description: "Tax refund failed instead of paid? Discover the most common reasons, from unvalidated bank accounts to wrong IFSC codes, and the quickest ways to fix them.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["refund-failure", "bank-validation", "errors"],
    relatedGlossarySlugs: ["refund", "tax-notice"],
    faqs: [
      {
        question: "Will I lose my tax refund if it fails?",
        answer: "No, you won't lose your money. You simply need to correct the bank account issue and raise a 'Refund Reissue Request' on the e-filing portal."
      }
    ],
    body: `## The heartbreak of a failed refund

You wait for weeks, the status updates, and instead of "Paid" it says **"Refund Failed"**. Do not panic, the money is not lost. The State Bank of India (which routes refunds) simply could not transfer it.

## Top reasons it fails

| Reason | Fix |
| --- | --- |
| Bank account not pre-validated | Pre-validate on the portal |
| Name mismatch (PAN vs bank) | Correct name with bank / PAN |
| Invalid or old IFSC after a merger | Update IFSC, re-validate |
| Account closed or dormant | Add a new active account |

**Stat to know: a non-pre-validated bank account is the single most common cause of refund failure, since all refunds are issued only to PAN-linked, pre-validated accounts (Source: Income Tax Department refund guidance).**

## How to fix it (portal path)

1. Log in at incometax.gov.in.
2. Go to **My Profile > My Bank Accounts**.
3. Check the status of each account.
4. Pre-validate a healthy account (or add a new one) and turn on **Nominate for Refund**.
5. Raise a **Refund Reissue Request** once a validated account is ready.

## What you should do

Before filing, confirm one active, pre-validated, nominated bank account so the refund has somewhere to land.

## Common mistake

Re-requesting a refund to the same broken account. It will just fail again, so fix the bank detail first.

## How LastMinute ITR helps

LastMinute ITR reminds you to double-check bank details during preparation, before you submit on the portal. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "how-to-raise-refund-reissue",
    title: "How to Raise a Refund Reissue Request on the Tax Portal",
    description: "If your income tax refund failed, you can ask for it again. Follow our step-by-step guide to raise a refund reissue request on the e-filing tax portal.",
    readMinutes: 4,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["refund-reissue", "tax-portal", "failed-refund"],
    relatedGlossarySlugs: ["refund", "ais"],
    faqs: [
      {
        question: "How long does a refund reissue take?",
        answer: "Once you successfully raise a refund reissue request with a pre-validated bank account, it typically takes 15 to 30 days for the money to be credited."
      }
    ],
    body: `## Trying again

If your refund failed on a bank issue, the department will not retry on its own. You must ask, through a **Refund Reissue Request**.

## One prerequisite

You **must** have at least one active, **pre-validated** bank account linked to your profile. Requesting reissue to the same faulty account just fails again.

## Step-by-step (portal path)

1. Log in at incometax.gov.in with your PAN and password.
2. Go to **Services > Refund Reissue**.
3. Click **Create Refund Reissue Request**.
4. Select the Assessment Year where the refund failed and continue.
5. Choose a **pre-validated** bank account.
6. **E-verify** with Aadhaar OTP or net banking.
7. Submit and note the Transaction ID.

## How long it takes

**Once a valid reissue is raised, the credit usually arrives within about 15 to 30 days (Source: Income Tax Department refund guidance).**

| Step | Typical time |
| --- | --- |
| Bank pre-validation | 24 to 48 hours |
| Reissue processing | 15 to 30 days |

## What you should do

Validate and nominate the account first, then raise the reissue and e-verify it, because an unverified request will not move.

## Common mistake

Forgetting to e-verify the reissue request. Without verification, the portal does not act on it.

## How LastMinute ITR helps

LastMinute ITR nudges you to confirm bank validation before you ever reach this stage. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "refund-adjusted-against-demand",
    title: "Why Was My Tax Refund Adjusted Against a Past Demand?",
    description: "Did the tax department cut your refund? Learn about Section 245, why your refund was adjusted against an old demand, and how to respond if it is wrong.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["section-245", "tax-demand", "refund-adjustment"],
    relatedGlossarySlugs: ["refund", "tax-notice"],
    faqs: [
      {
        question: "Can the tax department legally take my refund to pay old dues?",
        answer: "Yes. Under Section 245 of the Income Tax Act, the department has the power to set off any outstanding tax demands against a current year's refund."
      }
    ],
    body: `## When your refund gets trimmed

You expected Rs 20,000 but only Rs 5,000 arrives, with a note saying the rest was "adjusted against an outstanding demand". Here is what happened.

## Section 245 explained

**Under Section 245, the department can set off your current refund against tax you owe from earlier years, but only after sending you an intimation and giving you about 30 days to respond (Source: Income Tax Act, Section 245).**

So the adjustment is legal, yet you get a chance to object first.

## Your options when you get the notice

| Situation | What to do |
| --- | --- |
| Old demand is genuine | Do nothing; it is settled |
| You already paid it | Disagree, attach the old challan |
| Demand is a mismatch error | Disagree, give the reason |

## Respond step by step (portal path)

1. Log in at incometax.gov.in.
2. Go to **Pending Actions > Response to Outstanding Demand**.
3. Open the demand linked to the Section 245 intimation.
4. Choose Agree or Disagree, with proof if you disagree.
5. Submit within the deadline on the notice.

## What you should do

Check the old demand year and amount immediately. If you already paid, upload that challan before the adjustment is finalised.

## Common mistake

Ignoring the Section 245 intimation. Silence is treated as agreement, and the refund is adjusted automatically.

## How LastMinute ITR helps

LastMinute ITR helps you file clean returns so old, error-driven demands do not pile up. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "timeline-for-income-tax-refund",
    title: "How Long Does It Take to Get Your Income Tax Refund?",
    description: "Wondering how long an income tax refund takes? Learn the typical processing timeline, what speeds it up, and the factors that can delay your money this year.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["refund-timeline", "processing", "e-filing"],
    relatedGlossarySlugs: ["refund", "ais"],
    faqs: [
      {
        question: "Is there a fixed time limit for issuing a tax refund?",
        answer: "No, there is no strict legal time limit. However, most electronically filed and verified ITRs are processed within 20 to 45 days."
      }
    ],
    body: `## The waiting game

"I filed two days ago, where is my refund?" The CPC 2.0 system is fast, but refunds are not instant.

## The standard timeline

| Stage | Typical time |
| --- | --- |
| E-verification | Clock starts here |
| Processing | 10 to 30 days |
| Refund issuance (via SBI) | 5 to 15 days |

**On average, e-verified ITR-1 refunds arrive in 20 to 45 days, and CBDT reports average processing fell to around 10 days for AY 2024-25 (Source: CBDT / Ministry of Finance).**

## Why some take longer

- **Complex returns:** ITR-2/ITR-3 (capital gains, business) need deeper checks.
- **Mismatches:** TDS not matching 26AS halts processing.
- **Bank issues:** an approved refund fails on a non-validated account.
- **Pending verification:** you filed but never e-verified.

## Track it (portal path)

1. Log in at incometax.gov.in.
2. Go to **e-File > Income Tax Returns > View Filed Returns**.
3. Open the year and read the status timeline.

## What you should do

E-verify immediately after filing and keep your bank account pre-validated; those two steps remove most delays.

## Common mistake

Expecting a refund without e-verifying. An unverified return is treated as not filed, so nothing processes.

## How LastMinute ITR helps

LastMinute ITR helps you resolve AIS and TDS mismatches early so processing is not stalled. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "pre-validate-bank-for-refund",
    title: "How to Pre-Validate Your Bank Account for Tax Refunds",
    description: "No refund without a pre-validated bank account. Learn what pre-validation means, how to do it on the e-filing portal, and how to set the nominated account.",
    readMinutes: 4,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["bank-validation", "refund", "e-filing", "portal"],
    relatedGlossarySlugs: ["refund", "ais"],
    faqs: [
      {
        question: "Why do I need to pre-validate my bank account?",
        answer: "The income tax department only issues electronic refunds to bank accounts where the PAN matches the bank's records. Pre-validation confirms this match."
      }
    ],
    body: `## The golden ticket to your refund

You can file a flawless return, but with no **pre-validated** bank account you will not get the refund. Since the department stopped paper cheques, every refund goes electronically to a PAN-linked account.

## What pre-validation means

It is a digital handshake: the portal asks your bank, "does the PAN on this account match ours?" If yes, the account is validated.

## Do it in a few steps (portal path)

1. Log in at incometax.gov.in.
2. Go to **My Profile > My Bank Accounts**.
3. If an account shows "Validation failed", check the details.
4. If not listed, click **Add Bank Account** and enter the account number, type, and IFSC.
5. Click **Validate**, then turn on **Nominate for Refund**.

## How long it takes

| Status | Meaning |
| --- | --- |
| Validation in progress | Usually 24 to 48 hours |
| Validated | Ready to receive refund |
| Validation failed | Check IFSC / PAN / name |

**Stat to know: refunds are issued only to validated, nominated accounts, and validation typically completes within 24 to 48 hours (Source: Income Tax Department refund guidance).**

## What you should do

Validate and nominate your account **before** filing, not after the refund fails.

## Common mistake

Using an old IFSC after a bank merger. Update it and re-validate, or the refund will bounce.

## How LastMinute ITR helps

LastMinute ITR prompts you to confirm bank validation during preparation so there is no post-filing scramble. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "last-date-to-file-itr",
    title: "Income Tax Return (ITR) Filing Deadlines You Cannot Miss",
    description: "Do not miss your ITR deadline. Get a clear list of due dates for salaried filers, audit cases, belated and revised returns, plus the penalties for filing late.",
    readMinutes: 4,
    publishedAt: "2026-06-15",
    cluster: "last-minute",
    tags: ["deadlines", "due-dates", "itr-filing"],
    relatedGlossarySlugs: ["ais", "tax-notice"],
    faqs: [
      {
        question: "What is the last date to file ITR for salaried employees?",
        answer: "For individual taxpayers and salaried employees whose accounts do not require a tax audit, the due date is usually July 31st of the assessment year."
      }
    ],
    body: `## The clock is ticking

In tax, timing is everything. A missed deadline can cost late fees, extra interest, and the right to carry forward losses. Here are the dates that matter (for AY 2026-27; always confirm on incometax.gov.in).

## The key deadlines

| Return type | Usual due date |
| --- | --- |
| Salaried / non-audit | July 31 |
| Audit cases | October 31 |
| Belated return | December 31 |
| Revised return | December 31 |

**The Section 234F late fee applies the moment July 31 passes: Rs 1,000 if income is up to Rs 5 lakh, Rs 5,000 above that (Source: Income Tax Act, Section 234F).**

## What each date means

1. **July 31:** original deadline for most salaried filers, freelancers, and small businesses with no audit.
2. **October 31:** for taxpayers whose accounts need a tax audit.
3. **December 31:** last day to file a belated return (with fee) or to revise a filed return.

## What you should do

Do not aim for July 31; the portal lags in the final days. Prepare your AIS reconciliation in early July and file with room to spare.

## Common mistake

Assuming December 31 is a relaxed extension. It is the *final* gate, and missing it usually means you cannot file voluntarily for that year.

## How LastMinute ITR helps

LastMinute ITR helps you prep and reconcile early so you file well before the rush. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  },
  {
    slug: "how-to-file-belated-return",
    title: "Missed the ITR Deadline? How to File a Belated Return",
    description: "Missed the July 31 ITR deadline? Learn how to file a belated return under Section 139(4), the late fees and interest involved, and the final December cutoff.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "last-minute",
    tags: ["belated-return", "missed-deadline", "penalty"],
    relatedGlossarySlugs: ["tax-notice", "ais"],
    faqs: [
      {
        question: "Can I claim a refund if I file a belated return?",
        answer: "Yes, you can still claim your tax refund when filing a belated return, but you may lose out on some of the interest the government pays on delayed refunds."
      }
    ],
    body: `## So you missed July 31

If it is August and you have not filed, do not panic. The law gives a second chance: a **belated return** under **Section 139(4)**.

## How it differs from a normal return

Same forms, same portal, but with consequences.

**A belated return carries a Section 234F fee (Rs 1,000 up to Rs 5 lakh income, Rs 5,000 above) plus 1% per month interest under Section 234A on any unpaid tax (Source: Income Tax Act, Sections 234F and 234A).**

| Consequence | Detail |
| --- | --- |
| Late fee (234F) | Rs 1,000 / Rs 5,000 |
| Interest (234A) | 1% per month on dues |
| Lost benefit | Cannot carry forward most losses |

## File it step by step (portal path)

1. Calculate income using Form 16 and AIS.
2. Add the Section 234F late fee to your computation.
3. Pay total tax plus fee via **e-Pay Tax**.
4. While filing, select **Section 139(4) - Belated**.
5. Submit and **e-verify** within 30 days.

## The final cutoff

The absolute last day for a belated return is **December 31** of the assessment year. Miss it and you generally lose the voluntary filing window.

## What you should do

File as soon as you can, because interest under 234A keeps adding up every month you wait.

## Common mistake

Filing belated but skipping e-verification. An unverified return is treated as never filed, fee paid or not.

## How LastMinute ITR helps

LastMinute ITR helps you organise belated-filing data and calculate the fee so your portal submission is error-free. Start at [/file](/file), import at [/file/import/documents](/file/import/documents), and reconcile at [/file/import/mismatch](/file/import/mismatch).

*LastMinute ITR is a companion tool, not affiliated with the Income Tax Department. You file and e-verify your return yourself on incometax.gov.in.*`
  }
];
