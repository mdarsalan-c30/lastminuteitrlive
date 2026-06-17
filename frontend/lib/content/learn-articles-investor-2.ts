import type { LearnArticle } from "./learn-articles";

export const INVESTOR_ARTICLES_2: LearnArticle[] = [
  {
    slug: "f-and-o-trading-tax-india",
    title: "F&O Trading Tax in India: A Complete Guide",
    description:
      "Are you trading in Futures and Options? Learn how F&O income is taxed in India, why it's considered business income, and which ITR form to use.",
    readMinutes: 7,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["F&O", "Trading", "Business Income"],
    relatedGlossarySlugs: ["itr-3", "ais"],
    faqs: [
      {
        question: "Is F&O trading considered capital gains or business income?",
        answer: "F&O trading is explicitly classified as non-speculative business income under the Income Tax Act.",
      }
    ],
    body: `## The Tax Reality of F&O Trading

Futures and Options (F&O) trading has exploded in popularity in India. However, many new traders assume their F&O profits will be taxed like regular stock investments (as capital gains). This is a costly misconception.

The Income Tax Department treats F&O trading as a **Business**.

**Quick stat: F&O is non-speculative business income; a tax audit is triggered only if your trading turnover crosses Rs 10 crore, given that virtually 100% of F&O trades are digital (Source: Sections 43(5) and 44AB, Income Tax Act).** Turnover here is a special figure (absolute profits plus absolute losses), not the contract value.

## Non-Speculative Business Income

Under Section 43(5) of the Income Tax Act, trading in derivatives (Futures and Options) on a recognized stock exchange is classified as **Non-Speculative Business Income**.

What does this mean for you?
1. **Tax Rate:** Your F&O profits are added to your other income (like salary) and taxed at your applicable slab rate. There is no special 15% or 12.5% rate for F&O.
2. **Claiming Expenses:** Since it's a business, you can deduct business expenses from your profits. This includes brokerage, STT, internet bills, trading software subscriptions, and even depreciation on your laptop.
3. **ITR Form:** You cannot use ITR-1 or ITR-2. You must file **ITR-3** (or ITR-4 in specific presumptive cases).

## Dealing with F&O Losses

The reality of F&O is that many traders make losses. The good news about it being a "non-speculative" business is how you can treat these losses:

- **Current Year Set-Off:** You can set off F&O losses against any other income in the same year, **except salary income**. You can set it off against bank interest, rental income, or capital gains.
- **Carry Forward:** If you still have unadjusted losses, you can carry them forward for the next **8 assessment years**. However, carried-forward business losses can *only* be set off against business income in future years.

*Crucial Rule:* To carry forward your F&O losses, you must file your ITR before the original due date (July 31st).

## Do you need a Tax Audit?

This is the biggest headache for F&O traders. You need a Chartered Accountant to audit your accounts if your "Trading Turnover" exceeds certain limits (usually ₹10 Crore, provided 95% of transactions are digital). 

Calculating F&O turnover is tricky (it's the sum of absolute profits and losses). 

### How LastMinute ITR helps
Don't guess your turnover. When you upload your broker's Tax P&L to LastMinute ITR, we help you understand your exact F&O turnover and profit/loss figures, so you know whether you need to consult a CA for an audit before you go to incometax.gov.in to file your ITR-3.

[Start with LastMinute ITR](/file) · [import your Tax P&L](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

1. Treat F&O as business income and move to ITR-3, not ITR-2.
2. Claim genuine expenses (brokerage, internet, software) against your trading profit.
3. Calculate absolute turnover to check if you are anywhere near the Rs 10 crore audit line.

## Common mistake

**Reporting F&O under capital gains.** F&O is business income, so it belongs in Schedule BP, not Schedule CG. Filing it as capital gains leads to a defective return.`,
  },
  {
    slug: "is-f-and-o-business-income",
    title: "Is F&O Trading Business Income or Capital Gains?",
    description:
      "The income tax department treats F&O trading as non-speculative business income, not capital gains. Discover what this means for your tax filing.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["F&O", "Business Income", "Capital Gains"],
    relatedGlossarySlugs: ["itr-3", "capital-gains"],
    faqs: [
      {
        question: "Why is F&O not considered speculative income?",
        answer: "Section 43(5) of the Income Tax Act specifically exempts derivative trading on recognized exchanges from being treated as speculative transactions.",
      }
    ],
    body: `## The Great Trading Confusion

If you buy Reliance shares today and sell them tomorrow, it's considered a speculative business. If you hold them for a month, it's short-term capital gains. But what if you trade Reliance Options?

The Income Tax Act has a very specific carve-out for derivatives.

## F&O is Non-Speculative Business

Trading in Futures and Options on recognized stock exchanges (like NSE or BSE) is legally defined as **Non-Speculative Business Income**.

This classification is actually highly beneficial for traders compared to "speculative" income (like intraday equity trading). Speculative income just means trades settled without delivery, like intraday equity, which the law treats more harshly.

**Quick stat: Speculative (intraday equity) losses can be carried forward only 4 years, while non-speculative F&O losses can be carried forward 8 years (Source: Sections 73 and 72, Income Tax Act).**

### Why it matters:
1. **Loss Set-Off:** Speculative losses (intraday equity) can *only* be set off against speculative profits. But non-speculative losses (F&O) can be set off against almost any other income (except salary) in the current year.
2. **Carry Forward:** Speculative losses can only be carried forward for 4 years. F&O losses can be carried forward for **8 years**.

## Capital Gains vs. F&O

You cannot report F&O trades under the Capital Gains schedule. 
- Capital gains apply to the delivery-based buying and selling of actual shares.
- F&O involves trading contracts, not taking delivery of the underlying asset.

Therefore, you must maintain a "Profit and Loss Account" and a "Balance Sheet" in your tax return, which is why you are required to file **ITR-3**.

If you are a salaried employee who dabbled in a few options trades, you are now legally running a business in the eyes of the tax department. You must shift from ITR-1 to ITR-3.

## How LastMinute ITR helps

We flag the moment your income mix needs ITR-3 and help you keep speculative (intraday) and non-speculative (F&O) figures separate, so set-off and carry-forward rules are applied correctly on incometax.gov.in.

[Start with LastMinute ITR](/file) · [import your broker statement](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

- Keep intraday equity (speculative) and F&O (non-speculative) buckets separate in your records.
- Maintain a basic P&L and balance sheet, which your broker tax report largely supplies.
- File ITR-3 even for a handful of options trades.

## Common mistake

**Mixing intraday and F&O losses.** Their set-off and carry-forward rules differ. Lumping them together can cost you a legitimate loss benefit or trigger a wrong set-off.`,
  },
  {
    slug: "how-to-file-itr-for-f-and-o-losses",
    title: "How to File ITR for F&O Losses",
    description:
      "Made losses in F&O trading? Don't skip filing! Learn how to report F&O losses in ITR-3 to set them off against other income and carry them forward.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["F&O Losses", "ITR-3", "Carry Forward"],
    relatedGlossarySlugs: ["itr-3", "ais"],
    faqs: [
      {
        question: "Can I set off F&O losses against my salary income?",
        answer: "No, business losses (including F&O) cannot be set off against salary income. They can be set off against capital gains, rental income, or other sources.",
      }
    ],
    body: `## Don't Waste Your Trading Losses

Many retail traders lose money in Futures and Options. A common reaction is to ignore these trades when filing taxes, thinking, "I didn't make a profit, so I don't owe tax."

This is a huge mistake. By not reporting your F&O losses, you are throwing away a valuable tax asset.

**Quick stat: F&O business losses can be carried forward for 8 assessment years, but only if you file your ITR on or before the original due date (Source: Section 72, Income Tax Act).**

## The Power of Carrying Forward

F&O trading is classified as a non-speculative business. If your business makes a loss, the government allows you to use that loss to reduce your taxable income.

1. **Current Year:** You can set off F&O losses against capital gains, house property income, or other sources (like FD interest) in the same year. *You cannot set it off against salary.*
2. **Future Years:** If you still have leftover losses, you can carry them forward for **8 assessment years**. In the future, if you make a profit in F&O (or any other business), you can use these old losses to make those future profits tax-free!

## The Catch: You Must File on Time

To carry forward your F&O losses, you **must** file your Income Tax Return before the original due date (usually July 31st). If you file a belated return, the losses expire.

## How to Report Losses in ITR-3

You must use **ITR-3**. You will need to:
1. Fill out the "Trading Account" and "P&L Account" schedules with your turnover, expenses, and net loss.
2. Fill out "Schedule BP" (Business and Profession).
3. Ensure the loss flows into "Schedule CYLA" (Current Year Loss Adjustment) and "Schedule CFL" (Carry Forward of Losses).

### Simplify with LastMinute ITR
Filing ITR-3 with a balance sheet and P&L just for a few options trades is intimidating. LastMinute ITR helps you decode your broker's Tax P&L statement, showing you exactly what your turnover and loss figures are, so you can confidently fill out the business schedules on incometax.gov.in and secure your right to carry forward those losses.

[Start with LastMinute ITR](/file) · [import your Tax P&L](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

1. File before the due date so the loss carries forward.
2. Report turnover, expenses, and net loss in the Trading and P&L schedules.
3. Confirm the loss flows into Schedule CYLA and Schedule CFL.

## Common mistake

**Skipping the return because there was no profit.** No profit does not mean no filing. Reporting the loss is exactly how you create a tax asset to offset future gains.`,
  },
  {
    slug: "tax-audit-applicability-f-and-o",
    title: "Tax Audit Rules for F&O Trading Explained",
    description:
      "Do you need a CA for a tax audit on your F&O trades? We break down the turnover limits and loss conditions that trigger a mandatory tax audit.",
    readMinutes: 7,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["Tax Audit", "F&O", "Turnover"],
    relatedGlossarySlugs: ["itr-3", "44ada"],
    faqs: [
      {
        question: "When is a tax audit mandatory for F&O trading?",
        answer: "A tax audit is generally mandatory if your trading turnover exceeds ₹10 Crore (assuming 95% of transactions are digital).",
      }
    ],
    body: `## The Dreaded Tax Audit

For F&O traders, the biggest fear at tax time isn't the tax itself—it's the Tax Audit. A tax audit under Section 44AB means a Chartered Accountant must examine your trading books, certify them, and file an audit report before you can file your ITR.

When do you actually need one?

**Quick stat: The base tax-audit turnover limit is Rs 1 crore, but it rises to Rs 10 crore when 95% or more of receipts and payments are digital, which covers nearly all F&O traders (Source: Section 44AB, Income Tax Act).**

## The ₹10 Crore Turnover Limit

The primary trigger for a tax audit is your **Trading Turnover**.
- The base limit for a tax audit is ₹1 Crore.
- However, if 95% or more of your business receipts and payments are digital (which is true for 100% of F&O trading), the audit limit is increased to **₹10 Crore**.

If your calculated F&O turnover is less than ₹10 Crore, you generally **do not** need a tax audit, even if you have incurred losses.

## The "Loss" Confusion (Section 44AD)

There is a lot of outdated information online saying "if you have F&O losses, you must get an audit." This is mostly false today.

This confusion stems from Section 44AD (presumptive taxation). If you opt into 44AD, declare profits at 6%, and then in a subsequent year declare less than 6% profit (or a loss), an audit is triggered. 

However, most tax experts agree that F&O trading is not suitable for Section 44AD. If you treat F&O as normal business income (maintaining a basic P&L), you only need an audit if your turnover crosses ₹10 Crore.

## How to Calculate F&O Turnover

Turnover in F&O is not the total value of the contracts you bought. It is calculated as:
**Turnover = Sum of Absolute Profits + Sum of Absolute Losses + Premium received on sale of options**

*Example:* You make a profit of ₹50,000 on one trade and a loss of ₹40,000 on another. Your net profit is ₹10,000, but your **turnover is ₹90,000**.

### Check your status with LastMinute ITR
Don't pay for an audit you don't need. Upload your broker statement to LastMinute ITR. We will help you calculate your exact absolute turnover based on ICAI guidelines, so you know for sure if you are under the ₹10 Crore safe limit before you file on the government portal.

[Start with LastMinute ITR](/file) · [import your broker statement](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

- Compute absolute turnover (absolute profit + absolute loss + option sale premium) first.
- Treat F&O as normal business income to avoid the 44AD audit trap.
- Only engage a CA for audit if turnover genuinely exceeds Rs 10 crore.

## Common mistake

**Believing every F&O loss needs an audit.** That myth comes from Section 44AD. If you report F&O as plain business income, a loss alone does not force an audit; turnover does.`,
  },
  {
    slug: "itr-3-or-itr-4-for-f-and-o",
    title: "ITR-3 or ITR-4: Which Form for F&O Traders?",
    description:
      "Choosing the right ITR form for trading can be confusing. Find out why ITR-3 is usually the correct choice for Futures and Options traders.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["ITR-3", "ITR-4", "F&O"],
    relatedGlossarySlugs: ["itr-3", "44ada"],
    faqs: [
      {
        question: "Can I use ITR-4 for F&O trading?",
        answer: "While technically possible under Section 44AD, it is highly unadvisable. ITR-3 is the correct and standard form for reporting F&O trading.",
      }
    ],
    body: `## The Form Dilemma

If you trade Futures and Options, you have business income. This immediately rules out ITR-1 and ITR-2. You are left with two choices: ITR-3 or ITR-4.

Which one should you pick? In 99% of cases, the answer is **ITR-3**.

**Quick stat: Once you opt into Section 44AD (the basis for ITR-4), you are locked in for 5 years; opting out earlier blocks the scheme for the next 5 years and can force an audit (Source: Section 44AD(4) and 44AD(5), Income Tax Act).** Presumptive taxation just means you declare a fixed percentage of turnover as profit instead of tracking actual expenses.

## Why ITR-4 is a Bad Idea for F&O

ITR-4 (Sugam) is designed for small businesses opting for the Presumptive Taxation Scheme under Section 44AD. Under 44AD, you don't maintain books of accounts; you simply declare a flat 6% of your digital turnover as profit.

Here is why this fails for F&O:
1. **Turnover Calculation:** F&O turnover is absolute profit + absolute loss. Declaring 6% of this artificial number as your actual profit rarely reflects reality.
2. **No Loss Carry Forward:** If you use ITR-4, you cannot declare a business loss. If you lost money in F&O (like most retail traders), using ITR-4 means you forfeit the right to carry forward those losses to save tax in the future.
3. **The Audit Trap:** If you use 44AD this year, and next year you want to declare a loss, you will be forced into a mandatory tax audit.

## Why ITR-3 is the Right Choice

ITR-3 is the standard form for individuals with income from a business or profession.

- It allows you to report your exact turnover, actual expenses (brokerage, internet), and your true net profit or loss.
- It includes the necessary schedules (CYLA, CFL) to properly set off and carry forward your trading losses.
- It requires a basic Balance Sheet and P&L account, which your broker's tax report essentially provides.

### Get it right the first time
Filing the wrong form leads to defective return notices. LastMinute ITR's profiler looks at your income sources and will correctly guide you to prepare data for ITR-3 if you have F&O trades, ensuring you don't make a costly formatting mistake on incometax.gov.in.

[Start with LastMinute ITR](/file) · [import your statements](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

1. Default to ITR-3 for any F&O activity.
2. Avoid ITR-4 / 44AD for F&O so you can carry forward losses.
3. Use ITR-3 schedules (CYLA, CFL) to preserve loss benefits.

## Common mistake

**Picking ITR-4 to keep filing simple.** It forfeits loss carry-forward and can drag you into a multi-year 44AD lock-in and audit trap. The short-term convenience is rarely worth it.`,
  },
  {
    slug: "how-to-calculate-turnover-f-and-o",
    title: "How to Calculate Trading Turnover for F&O",
    description:
      "Calculating F&O turnover is crucial for tax audit applicability. Learn the correct formula for calculating trading turnover for income tax purposes.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["F&O Turnover", "Tax Audit", "Trading"],
    relatedGlossarySlugs: ["itr-3", "tds"],
    faqs: [
      {
        question: "How is turnover calculated for Options trading?",
        answer: "Turnover = Absolute Profit + Absolute Loss + Premium received on sale of options.",
      }
    ],
    body: `## Why Turnover Matters

In the world of tax, "Turnover" usually means total sales. But in Futures and Options trading, you aren't selling goods. You are settling contracts. 

The Income Tax Department needs a way to measure the "size" of your trading business to determine if you need a Tax Audit (the limit is usually ₹10 Crore for digital transactions). 

To do this, the Institute of Chartered Accountants of India (ICAI) created a specific formula for F&O turnover.

**Quick stat: F&O turnover = absolute profit + absolute loss + premium on sale of options, and the resulting figure decides whether you cross the Rs 10 crore audit threshold (Source: ICAI Guidance Note on Tax Audit).** "Absolute" means you ignore the minus sign and add losses as positive numbers.

## The Absolute Turnover Formula

F&O turnover is calculated using **Absolute Values**. This means you ignore the negative signs on your losses and treat everything as a positive number.

**Turnover = (Sum of all Profits) + (Sum of all Losses) + (Premium received on sale of options)**

### Let's look at an example:
You made three trades this year:
1. Trade A: Profit of ₹50,000
2. Trade B: Loss of ₹30,000
3. Trade C: Profit of ₹10,000

Your Net Profit is ₹30,000 (50k - 30k + 10k).
But your **Turnover** is ₹90,000 (50k + 30k + 10k).

*Note: For options trading, the premium received when you write (sell) an option is also added to the turnover.*

## Why is it calculated this way?

The absolute method measures the total volume of your trading activity, regardless of whether you won or lost. It prevents a trader who made ₹5 Crore in profits and ₹5 Crore in losses from claiming they have a "zero" turnover business.

## Intraday Equity Turnover

If you also do intraday equity trading (speculative business), the turnover calculation is similar:
**Intraday Turnover = Absolute Profit + Absolute Loss**

### Stop doing manual math
Calculating absolute turnover line-by-line from a massive excel sheet is prone to errors. LastMinute ITR parses the Tax P&L statements from major brokers like Zerodha, Groww, and Upstox to instantly calculate your ICAI-compliant turnover. You can then take this exact figure to incometax.gov.in to file your ITR-3.

[Start with LastMinute ITR](/file) · [import your Tax P&L](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

1. Add absolute profits and absolute losses together (ignore minus signs).
2. Add the premium received on options you wrote (sold).
3. Compare the total against the Rs 10 crore digital-trade audit limit.

## Common mistake

**Using contract value as turnover.** Turnover is not the notional value of contracts traded. Using it can balloon your figure past the audit limit and trigger an audit you never needed.`,
  },
  {
    slug: "crypto-tax-india-2026",
    title: "Crypto Tax in India 2026: Rates & Rules",
    description:
      "A clear guide to cryptocurrency taxation in India for AY 2026-27. Understand the flat 30% tax rate, 1% TDS, and how to report VDAs in your ITR.",
    readMinutes: 7,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["Crypto Tax", "VDA", "Bitcoin"],
    relatedGlossarySlugs: ["tds", "ais"],
    faqs: [
      {
        question: "What is the tax rate on cryptocurrency in India?",
        answer: "Profits from the transfer of Virtual Digital Assets (crypto) are taxed at a flat rate of 30%, plus applicable surcharge and 4% cess.",
      }
    ],
    body: `## The Strict Rules of Crypto Taxation

The Indian government introduced a harsh tax regime for cryptocurrencies, officially termed Virtual Digital Assets (VDAs), under Section 115BBH of the Income Tax Act. 

If you trade Bitcoin, Ethereum, NFTs, or any other crypto, you need to understand these rules before filing your ITR. VDA is just the official term for crypto and similar digital assets.

**Quick stat: Crypto profits are taxed at a flat 30% (plus 4% cess) with a separate 1% TDS on sales, regardless of your income slab (Source: Sections 115BBH and 194S, Income Tax Act).** TDS means a small tax cut at the time of the transaction that you later adjust against your final bill.

## 1. The Flat 30% Tax Rate

Any profit you make from selling or swapping crypto is taxed at a flat **30%** (plus a 4% health and education cess, making the effective rate 31.2%).

- **No Slab Benefits:** It doesn't matter if your total income is below the basic exemption limit (₹3 Lakh). If you make ₹10,000 profit in crypto, you owe ₹3,120 in tax.
- **No Deductions:** You cannot deduct any expenses (like internet, electricity, or exchange subscription fees) from your crypto gains. The *only* deduction allowed is the actual cost of acquiring the crypto.

## 2. No Set-Off of Losses

This is the most painful rule for traders. 
- You **cannot** set off losses from one crypto against gains from another. 
  - *Example:* You make ₹50,000 profit on Bitcoin and ₹40,000 loss on Ethereum. You must pay 30% tax on the full ₹50,000 Bitcoin profit. The Ethereum loss is ignored.
- You **cannot** set off crypto losses against salary, business, or stock market gains.
- You **cannot** carry forward crypto losses to future years.

## 3. The 1% TDS (Section 194S)

To track crypto transactions, the government mandates a 1% Tax Deducted at Source (TDS) on the sale of crypto if your transactions exceed ₹50,000 in a year (₹10,000 in some cases).

Indian exchanges (like CoinDCX or WazirX) automatically deduct this 1% when you sell and deposit it against your PAN. You can claim this TDS as a credit when you file your ITR.

## Reporting in ITR

You must report crypto trades in a special schedule called **Schedule VDA**. You must provide the date of acquisition, date of transfer, cost, and sale consideration for your trades.

### Reconcile with AIS
Your crypto exchange reports your 1% TDS to the government, which means every sale you make appears in your **Form 26AS and AIS**. If you fail to report your crypto trades in Schedule VDA, the tax department's automated systems will immediately flag the mismatch and send you a notice. Use LastMinute ITR to ensure your reported figures align with your AIS before submitting on the portal.

[Start with LastMinute ITR](/file) · [import your exchange report](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

1. Report only the actual cost of acquisition; no other expenses are deductible.
2. List each profitable trade in Schedule VDA and claim your 1% TDS credit.
3. Pay the 30% tax even if your total income is below the basic exemption limit.

## Common mistake

**Assuming no slab benefit applies.** Even a Rs 10,000 crypto profit is taxed at 30% (Rs 3,120 with cess) regardless of your slab. Treating it like normal income under-reports your liability.`,
  },
  {
    slug: "how-to-report-crypto-in-itr",
    title: "How to Report Crypto Transactions in ITR",
    description:
      "Step-by-step guide to declaring your cryptocurrency trades in Schedule VDA of your Income Tax Return. Stay compliant and avoid tax notices.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["Schedule VDA", "Crypto", "ITR"],
    relatedGlossarySlugs: ["itr-3", "ais"],
    faqs: [
      {
        question: "Which ITR form should I use for crypto?",
        answer: "You must use ITR-2 or ITR-3 to report crypto transactions, as ITR-1 and ITR-4 do not have the required Schedule VDA.",
      }
    ],
    body: `## The Mandatory Schedule VDA

If you bought, sold, or swapped cryptocurrency during the financial year, you cannot use the simple ITR-1 form. You must file **ITR-2** or **ITR-3** and fill out a specific section called **Schedule VDA** (Virtual Digital Assets).

Here is how to report your crypto trades correctly to avoid notices.

**Quick stat: Schedule VDA applies the flat 30% tax on each profitable trade and ignores losses; the 1% TDS already deducted (Section 194S) is claimed back as credit (Source: Sections 115BBH and 194S, Income Tax Act).**

## Step 1: Gather Your Data

You cannot just enter a single "Net Profit" number. The tax portal requires transaction-level or aggregated details. You need a tax report from your crypto exchange that includes:
- Date of Acquisition (Purchase)
- Date of Transfer (Sale)
- Head under which income is to be taxed (Usually Capital Gains or Business Income)
- Cost of Acquisition
- Consideration Received (Sale Value)

## Step 2: Fill Schedule VDA

In the ITR utility on incometax.gov.in, navigate to Schedule VDA. You must add rows for your transactions.

**The Golden Rule:** You must report profitable trades and loss-making trades separately. 
Because losses cannot be set off against gains, the portal's calculator will sum up the profits from your winning rows and apply the 30% tax, while ignoring the losses from your losing rows.

## Step 3: Claim Your TDS

Indian exchanges deduct 1% TDS on your sales under Section 194S. 
1. Check your **Form 26AS** or **AIS** to verify the total TDS deposited by the exchange.
2. Ensure this amount is reflected in the **TDS Schedule** of your ITR.
3. This TDS acts as advance tax paid. It will be subtracted from your final 30% tax liability.

## What about Foreign Exchanges?

If you trade on Binance, KuCoin, or decentralized wallets (MetaMask), no TDS is deducted. However, you are still legally required to calculate your profits, convert the USD values to INR, and report them in Schedule VDA. 

Furthermore, if you hold crypto in a foreign exchange, you must also declare those holdings in **Schedule FA (Foreign Assets)**.

### Check your AIS
The most common mistake crypto traders make is forgetting that Indian exchanges report every single sale to the government. If your AIS shows ₹5 Lakh in crypto sales (due to the 1% TDS), and you report nothing in Schedule VDA, you will receive a defective return notice. LastMinute ITR helps you cross-check your AIS to ensure you don't miss these mandatory disclosures before you file.

[Start with LastMinute ITR](/file) · [import your exchange report](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

1. Pull a transaction-level tax report from your exchange (CoinDCX, WazirX, ZebPay).
2. Enter profitable and loss-making trades on separate rows in Schedule VDA.
3. Match your 1% TDS in Form 26AS / AIS and claim it in the TDS schedule.

## Common mistake

**Netting all trades into one figure.** Losses cannot offset gains in crypto, so a single netted row hides taxable profit. List trades separately so the portal taxes gross profits correctly.`,
  },
  {
    slug: "set-off-crypto-losses-india",
    title: "Can You Set Off Crypto Losses in India?",
    description:
      "The income tax rules for cryptocurrency are strict. Learn why you cannot set off crypto losses against gains from other cryptos or other income.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["Crypto Losses", "Set Off", "VDA"],
    relatedGlossarySlugs: ["capital-gains", "itr-3"],
    faqs: [
      {
        question: "Can I set off a loss in Bitcoin against a profit in Ethereum?",
        answer: "No. Section 115BBH explicitly prohibits setting off losses from one Virtual Digital Asset against gains from another.",
      }
    ],
    body: `## The Harshest Rule in Indian Tax

In traditional investing, the government shares your pain. If you make a profit on Reliance shares and a loss on Tata shares, you can set off the loss against the profit and only pay tax on the net gain.

For cryptocurrency, the government takes a different approach: **Heads I win, tails you lose.**

**Quick stat: Under Section 115BBH(2), a loss from one VDA cannot be set off against gains from another VDA or any other income, and crypto losses cannot be carried forward at all (Source: Income Tax Act, Section 115BBH).**

## The "No Set-Off" Rule

Under Section 115BBH of the Income Tax Act, the rules for Virtual Digital Assets (VDAs) are brutally clear:

1. **No Inter-Crypto Set-Off:** You cannot set off a loss from one crypto token against a profit from another. 
   - If you make ₹1,00,000 profit on Bitcoin and lose ₹80,000 on Dogecoin, your taxable income is ₹1,00,000. You will pay ₹30,000 in tax (30%), even though your actual net profit is only ₹20,000.
2. **No Cross-Income Set-Off:** You cannot set off crypto losses against your salary, business income, or stock market capital gains.
3. **No Carry Forward:** If you end the year with a massive net loss in crypto, you cannot carry that loss forward to reduce your taxes in future years. The loss simply vanishes for tax purposes.

## Why did the government do this?

The government introduced these punitive rules to actively discourage retail speculation in highly volatile crypto assets. By refusing to subsidize losses, they ensure that only those willing to bear the full brunt of the downside participate in the market.

## How to Report This in ITR

When you fill out **Schedule VDA** in ITR-2 or ITR-3, you must list your trades. The utility on incometax.gov.in is programmed with these rules. It will automatically sum up the "Income" column (the profitable trades) and apply the 30% tax, while completely ignoring the rows where the outcome is a loss.

### Don't try to net it out yourself
A common mistake is manually calculating your net profit across all trades and entering a single row in Schedule VDA. If the tax department audits you and finds you netted losses against gains, you will face severe penalties for tax evasion. Always report the gross profits accurately.

## How LastMinute ITR helps

We separate your profitable and loss-making VDA trades so the gross profit is taxed correctly, and we reconcile the totals against your AIS before you file on incometax.gov.in.

[Start with LastMinute ITR](/file) · [import your exchange report](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

- Accept that each profitable trade is taxed at 30% on its own, with no offset.
- Do not bank on carrying crypto losses forward; they expire each year.
- Report gross profits trade-by-trade in Schedule VDA.

## Common mistake

**Offsetting a Dogecoin loss against a Bitcoin gain.** The law forbids inter-crypto set-off. You pay 30% on the full winning trade even if your overall portfolio is down.`,
  },
  {
    slug: "1-percent-tds-on-crypto-vda",
    title: "Understanding 1% TDS on Crypto Transactions",
    description:
      "What is the 1% TDS on Virtual Digital Assets (VDA)? Learn how it impacts your crypto trades and how to claim the TDS credit when filing your ITR.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["TDS", "Crypto", "VDA"],
    relatedGlossarySlugs: ["tds", "ais"],
    faqs: [
      {
        question: "Why is 1% deducted when I sell crypto?",
        answer: "Section 194S mandates a 1% Tax Deducted at Source (TDS) on the transfer of Virtual Digital Assets to track crypto transactions.",
      }
    ],
    body: `## The Government's Tracking Mechanism

Before 2022, the Income Tax Department had very little visibility into who was trading cryptocurrency. To fix this, they introduced Section 194S: a **1% Tax Deducted at Source (TDS)** on the transfer of Virtual Digital Assets (VDAs).

The primary goal of this TDS is not to collect revenue, but to leave a paper trail of every crypto transaction tied to your PAN.

**Quick stat: The 1% TDS under Section 194S kicks in once your crypto sales cross Rs 50,000 in a year (Rs 10,000 for specified persons) and applies to gross sale value, not profit (Source: Income Tax Act, Section 194S).**

## How the 1% TDS Works

Whenever you sell a crypto asset or swap one crypto for another on an Indian exchange (like CoinDCX, WazirX, or ZebPay), the exchange is legally required to deduct 1% of the **transaction value** and deposit it with the government.

- **Threshold:** The TDS applies if your total crypto sale transactions exceed ₹50,000 in a financial year (or ₹10,000 for certain specified persons).
- **It applies to the gross value:** If you sell Bitcoin worth ₹1,00,000, the exchange deducts ₹1,000 as TDS, regardless of whether you made a profit or a loss on the trade.

## Swapping Crypto (Crypto-to-Crypto trades)

The rules are especially harsh for swapping (e.g., trading Bitcoin for Ethereum). A swap is considered two transactions: selling Bitcoin and buying Ethereum. 
Therefore, 1% TDS is deducted on *both* sides of the transaction.

## Claiming the TDS Credit

The 1% deducted is not lost money. It is tax paid in advance on your behalf.

1. **Check Form 26AS / AIS:** The exchange deposits the TDS against your PAN. It will appear in your Form 26AS and AIS under Section 194S.
2. **File your ITR:** When you file ITR-2 or ITR-3 and report your 30% tax liability on crypto profits, the 1% TDS you already paid will be subtracted from your final tax bill.
3. **Refunds:** If you made overall losses in crypto (meaning your tax liability is zero), you can claim the 1% TDS back as a tax refund when you file your ITR.

### The AIS Trap
Because of the 1% TDS, the Income Tax Department knows exactly how much crypto you sold. If your AIS shows ₹10 Lakh in crypto sales, and you file ITR-1 or fail to fill out Schedule VDA, you are practically guaranteeing a tax notice. Use LastMinute ITR to review your AIS and ensure you are filing the correct forms on incometax.gov.in.

[Start with LastMinute ITR](/file) · [import your exchange report](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

1. Check Form 26AS / AIS for the total 194S TDS deposited by your exchange.
2. Claim that TDS in your ITR and, if you made overall losses, get it back as a refund.
3. Remember a crypto-to-crypto swap is two transfers, so 1% TDS hits both legs.

## Common mistake

**Treating the 1% TDS as a final tax.** It is only advance tax. You must still file, report profits at 30%, and adjust the TDS. Skipping the return can mean losing a refund you are owed.`,
  }
];
