import type { LearnArticle } from "./learn-articles";

export const INVESTOR_ARTICLES_1: LearnArticle[] = [
  {
    slug: "short-term-capital-gains-tax-shares",
    title: "STCG Tax on Shares in India: Rates & Rules",
    description:
      "Learn how Short-Term Capital Gains (STCG) tax is calculated on shares in India. Understand holding periods, tax rates, and how to report it in your ITR.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["STCG", "Shares", "Capital Gains", "ITR"],
    relatedGlossarySlugs: ["capital-gains", "itr-3"],
    faqs: [
      {
        question: "What is the holding period for short-term capital gains on shares?",
        answer: "For listed equity shares, a holding period of less than 12 months is considered short-term.",
      },
      {
        question: "What is the STCG tax rate on shares?",
        answer: "Under Section 111A, STCG on listed equity shares is taxed at a flat rate of 20% (plus applicable surcharge and cess) for transactions where STT is paid.",
      }
    ],
    body: `## What is Short-Term Capital Gains (STCG) Tax?

If you buy listed equity shares and sell them within 12 months, any profit you make is considered a Short-Term Capital Gain (STCG). The income tax department taxes these quick profits differently than your regular salary.

In plain English: STCG just means a "quick profit" the taxman treats separately from your salary. For listed equity shares and equity-oriented mutual funds (where Securities Transaction Tax, or STT, is paid), the STCG tax rate is a flat **20%** (plus health and education cess at 4%).

**Quick stat: STCG under Section 111A rose from 15% to 20% for shares sold on or after 23 July 2024 (Source: Finance (No. 2) Act, 2024).**

| Listed equity STCG | Tax rate |
| Sold before 23 Jul 2024 | 15% + 4% cess |
| Sold on or after 23 Jul 2024 | 20% + 4% cess |

## How to Calculate STCG

Calculating STCG is straightforward:
**STCG = Sale Value - (Purchase Price + Transfer Expenses)**

*Transfer expenses* include brokerage charges, but you **cannot** deduct STT (Securities Transaction Tax) from your capital gains.

**Example:**
- You bought 100 shares of XYZ Ltd. at ₹1,000 each (Total: ₹1,00,000).
- You sold them 6 months later at ₹1,200 each (Total: ₹1,20,000).
- Brokerage paid on sale: ₹200.
- Your STCG = ₹1,20,000 - (₹1,00,000 + ₹200) = ₹19,800.
- Tax payable = 20% of ₹19,800 = ₹3,960 (plus 4% cess).

## Reporting STCG in your ITR

When you have capital gains from selling shares, you cannot use the simple ITR-1 form. You must file **ITR-2** (or ITR-3 if you also have business income).

You need to report these gains in the **Schedule CG** (Capital Gains) of your ITR. 

### How LastMinute ITR helps
Manually entering every single trade into the tax portal is a nightmare. With LastMinute ITR, you can simply upload your broker's Tax P&L statement. We automatically calculate your STCG, separate it from your long-term gains, and prepare the exact figures you need to enter on incometax.gov.in.

## Can you set off Short-Term Capital Losses?

Yes! If you made a loss on some shares sold within 12 months, you can use that Short-Term Capital Loss (STCL) to reduce your tax burden. 
- STCL can be set off against both Short-Term Capital Gains (STCG) and Long-Term Capital Gains (LTCG).
- If you can't set off the entire loss this year, you can carry it forward for the next 8 assessment years, provided you file your ITR before the deadline.

## What you should do

- Download your broker Tax P&L (Zerodha Console, Groww reports) and your AIS in the same sitting.
- Confirm whether each sale is before or after 23 Jul 2024, since the rate changed mid-year.
- Switch to ITR-2 early if you sold any shares, then enter Schedule CG figures.

## Common mistake

**Deducting STT from your gains.** STT paid on the trade is not an allowed deduction for STCG. Only your buy cost and brokerage reduce the gain. Many filers shave off STT and under-report tax.

## How LastMinute ITR helps

Upload your broker statement and we split STCG from LTCG, flag pre/post 23 Jul 2024 trades, and prepare clean Schedule CG figures for incometax.gov.in.

[Start with LastMinute ITR](/file) · [import your broker statement](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

**Remember:** Always reconcile your broker's statement with your AIS (Annual Information Statement) before filing to avoid tax notices.`,
  },
  {
    slug: "ltcg-tax-mutual-funds-india",
    title: "LTCG Tax on Mutual Funds in India Explained",
    description:
      "A simple guide to Long-Term Capital Gains (LTCG) tax on equity and debt mutual funds in India. Learn about the ₹1.25 lakh exemption and how to file.",
    readMinutes: 7,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["LTCG", "Mutual Funds", "Capital Gains", "ITR"],
    relatedGlossarySlugs: ["capital-gains", "ais"],
    faqs: [
      {
        question: "What is the LTCG tax rate on equity mutual funds?",
        answer: "LTCG on equity mutual funds is taxed at 12.5% on gains exceeding ₹1.25 lakh in a financial year.",
      },
      {
        question: "How are debt mutual funds taxed?",
        answer: "For debt mutual funds bought after April 1, 2023, gains are added to your total income and taxed at your applicable slab rate, regardless of the holding period.",
      }
    ],
    body: `## Understanding LTCG on Mutual Funds

When you hold mutual funds for a long period and sell them at a profit, you trigger Long-Term Capital Gains (LTCG) tax. LTCG simply means a profit on something you held for the "long term" (more than 12 months for equity funds). The rules depend heavily on whether you invested in an **equity** fund or a **debt** fund.

**Quick stat: Equity LTCG is taxed at 12.5% and the annual exemption was raised from Rs 1 lakh to Rs 1.25 lakh per financial year (Source: Budget, July 2024).**

## Equity Mutual Funds

An equity mutual fund invests at least 65% of its assets in domestic equity shares. 
- **Holding Period:** More than 12 months.
- **Tax Rate:** 12.5% (plus cess).
- **The Exemption:** The best part about equity LTCG is the exemption limit. The first **₹1.25 lakh** of your combined long-term capital gains (from equity shares and equity mutual funds) in a financial year is completely tax-free. You only pay 12.5% tax on the gains *above* ₹1.25 lakh.

**Example:**
You made a long-term profit of ₹2,00,000 from selling equity mutual funds.
- Tax-free amount: ₹1,25,000
- Taxable amount: ₹75,000
- Tax payable: 12.5% of ₹75,000 = ₹9,375 (plus cess).

## Debt Mutual Funds

The rules for debt mutual funds changed significantly recently.
- **Bought before April 1, 2023:** If held for more than 36 months, LTCG is taxed at 20% with indexation benefits.
- **Bought on or after April 1, 2023:** The concept of LTCG and indexation has been removed. All gains, regardless of how long you hold the fund, are added to your total income and taxed at your slab rate (like a fixed deposit).

## Filing your ITR

Selling mutual funds means you must file **ITR-2** or **ITR-3**. You cannot use ITR-1.

When reporting equity LTCG, you must provide details of each fund sold, including the ISIN, purchase date, sale date, and values. This is required to calculate the grandfathering benefits (if applicable) and the ₹1.25 lakh exemption.

### Make it easy with LastMinute ITR
Don't stress over ISINs and grandfathering calculations. LastMinute ITR allows you to upload your CAMS or KFintech capital gains statement. We parse the data, apply the ₹1.25 lakh exemption correctly, and give you a clean summary to plug into incometax.gov.in.

## What you should do

- Download your CAMS or KFintech consolidated capital gains statement, not just an account summary.
- Pool all equity LTCG across funds, then apply the single Rs 1.25 lakh exemption once for the year.
- Check the buy date for every debt fund to know if old indexation rules or slab-rate taxation applies.

## Common mistake

**Claiming the Rs 1.25 lakh exemption per fund.** It is a single combined limit across all equity shares and equity funds for the whole financial year, not per scheme or per folio.

[Start with LastMinute ITR](/file) · [import your capital gains statement](/file/import/documents) · [reconcile AIS gaps](/file/import/mismatch).

Always check your AIS to ensure the mutual fund sales reported by the AMC match your calculations!`,
  },
  {
    slug: "how-to-calculate-capital-gains-tax",
    title: "How to Calculate Capital Gains Tax in India",
    description:
      "Confused by capital gains? Follow our step-by-step guide to calculating short-term and long-term capital gains tax on shares, funds, and property.",
    readMinutes: 8,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["Capital Gains", "Tax Calculation", "ITR"],
    relatedGlossarySlugs: ["capital-gains", "tds"],
    faqs: [
      {
        question: "What is the formula for calculating capital gains?",
        answer: "Capital Gains = Full Value of Consideration (Sale Price) - (Cost of Acquisition + Cost of Improvement + Expenses on Transfer).",
      }
    ],
    body: `## The Basics of Capital Gains

Whenever you sell a "capital asset" (like shares, mutual funds, gold, or property) for more than you paid for it, the profit is called a Capital Gain. The income tax department taxes this profit, but the rate depends on what you sold and how long you held it.

Here is a step-by-step guide to calculating your capital gains tax.

**Quick reference (rates apply to sales on or after 23 July 2024; Source: Finance (No. 2) Act, 2024):**

| Asset | Long-term after | LTCG rate | STCG rate |
| Listed equity / equity funds | 12 months | 12.5% over Rs 1.25 lakh | 20% |
| Property / land | 24 months | 12.5% (or 20% with indexation, resident option) | Slab rate |
| Debt funds bought after 1 Apr 2023 | No LTCG | Slab rate | Slab rate |

## Step 1: Determine the Asset Type and Holding Period

The tax rate changes based on whether the gain is Short-Term (STCG) or Long-Term (LTCG).

- **Listed Equity Shares & Equity Mutual Funds:** 
  - Short-Term: Less than 12 months.
  - Long-Term: More than 12 months.
- **Real Estate (Land/Property):**
  - Short-Term: Less than 24 months.
  - Long-Term: More than 24 months.
- **Debt Mutual Funds (bought after April 1, 2023):**
  - Always taxed at slab rates, regardless of holding period.

## Step 2: Apply the Formula

The basic formula for capital gains is:
**Capital Gain = Sale Price - (Purchase Price + Transfer Expenses)**

*Transfer expenses* include brokerage, stamp duty, or legal fees directly related to the sale.

### For Short-Term Capital Gains (STCG):
Simply use the formula above. 
- STCG on listed equity is taxed at 20%.
- STCG on property is added to your income and taxed at your slab rate.

### For Long-Term Capital Gains (LTCG):
- **Equity:** Use the basic formula. The first ₹1.25 lakh of total equity LTCG in a year is tax-free. The rest is taxed at 12.5%.
- **Property:** You get the benefit of **Indexation**. This means you adjust your purchase price for inflation using the Cost Inflation Index (CII) provided by the government. 
  - *Indexed Cost = Purchase Price × (CII of Sale Year / CII of Purchase Year)*
  - *LTCG = Sale Price - Indexed Cost*
  - LTCG on property is typically taxed at 20% (with indexation) or 12.5% (without indexation, under new rules).

## Step 3: Check for Exemptions and Set-Offs

Before paying tax, check if you can reduce your liability:
1. **Set off past losses:** Do you have carried-forward capital losses from previous years? You can use them to reduce this year's gains.
2. **Claim exemptions:** If you sold a property, can you claim Section 54 by buying a new house?

## Step 4: Report in ITR

Capital gains must be reported in **ITR-2** or **ITR-3** under **Schedule CG**.

### How LastMinute ITR helps
Calculating indexation and matching trades can take hours. LastMinute ITR simplifies this. Upload your broker statements, and we will calculate your STCG and LTCG, apply the ₹1.25 lakh equity exemption, and format the data exactly as the incometax.gov.in portal expects it.

[Start with LastMinute ITR](/file) · [import your statements](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

1. Classify each asset as short-term or long-term using the holding-period table above.
2. Apply the right formula (plain cost for equity, indexed cost only where the old property rules apply).
3. Set off any carried-forward losses before computing tax.
4. Report everything in Schedule CG of ITR-2 or ITR-3.

## Common mistake

**Taxing gross sale value instead of the gain.** Your AIS shows the full sale proceeds, but tax is only on the profit (sale value minus cost and transfer expenses). Never enter the sale value as your taxable income.`,
  },
  {
    slug: "tax-on-sale-of-property-india",
    title: "Tax on Sale of Property in India: STCG & LTCG",
    description:
      "Selling a house or land? Understand how capital gains tax applies to real estate in India, including indexation benefits and how to report it in ITR-2.",
    readMinutes: 7,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["Property Sale", "Real Estate", "Capital Gains"],
    relatedGlossarySlugs: ["capital-gains", "ais"],
    faqs: [
      {
        question: "How long do I need to hold a property for it to be considered long-term?",
        answer: "For real estate (land or building), a holding period of more than 24 months is considered long-term.",
      }
    ],
    body: `## Selling Property: The Tax Implications

Selling a house, apartment, or plot of land usually involves large sums of money, which means the tax implications can be significant. When you sell real estate at a profit, you must pay Capital Gains Tax.

**Quick stat: For property held over 24 months, you can now pay LTCG at 12.5% without indexation, or stick with 20% with indexation if the property was bought before 23 July 2024 (Source: Finance (No. 2) Act, 2024). Indexation just means adjusting your purchase price upward for inflation so your taxable profit shrinks.**

## Short-Term vs. Long-Term

The tax you pay depends on how long you owned the property:

1. **Short-Term Capital Gains (STCG):** If you sell the property within **24 months** of buying it.
   - **Tax Rate:** The gain is added to your total income for the year and taxed according to your applicable income tax slab rate.

2. **Long-Term Capital Gains (LTCG):** If you sell the property after holding it for **more than 24 months**.
   - **Tax Rate:** Historically, this was 20% with indexation benefits. Recent budget changes have introduced a 12.5% rate without indexation. You must calculate under the applicable rules for the year of sale.

## The Power of Indexation (For older properties)

Indexation is a method to adjust the purchase price of your property to account for inflation over the years you held it. The government releases a Cost Inflation Index (CII) every year.

**Indexed Cost of Acquisition = Purchase Price × (CII of year of sale / CII of year of purchase)**

By increasing your purchase price on paper, indexation significantly reduces your taxable profit. 
*Note: Check the latest budget rules for your assessment year, as indexation benefits have been modified recently.*

## Stamp Duty Value (Section 50C)

When you sell a property, the sale price you declare cannot be less than the Stamp Duty Value (circle rate) assessed by the state government. If you sell it for less, the income tax department will assume the Stamp Duty Value as your sale price for calculating capital gains.

## Saving Tax on Property Sale

You don't always have to pay a huge tax bill. The government offers exemptions:
- **Section 54:** If you sell a residential house and use the LTCG to buy or construct another residential house.
- **Section 54EC:** If you invest the LTCG in specified infrastructure bonds (like NHAI or REC) within 6 months of the sale (up to ₹50 lakh).

## Filing your ITR

You must use **ITR-2** or **ITR-3** to report the sale of property. You will need the buyer's PAN, the property address, the sale value, and the stamp duty value.

### A tip from LastMinute ITR
Property sales are high-value transactions that are always reported to the tax department by the registrar. This will definitely show up in your **AIS (Annual Information Statement)**. Ensure the sale value you report in your ITR matches the AIS exactly to avoid a notice from the tax department.

[Start with LastMinute ITR](/file) · [import your sale documents](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

- Compare your sale deed value against the stamp duty (circle rate) value before computing the gain.
- For a pre-23 Jul 2024 property, calculate tax both ways (12.5% flat vs 20% with indexation) and pick the lower.
- Keep purchase deed, registry receipts, and improvement bills ready for Schedule CG.

## Common mistake

**Declaring a sale price below the circle rate.** Under Section 50C, if your deed value is lower than the stamp duty value, the department uses the higher circle rate as your sale price, inflating your taxable gain.`,
  },
  {
    slug: "set-off-capital-losses-against-gains",
    title: "How to Set Off Capital Losses Against Gains",
    description:
      "Don't let market losses go to waste. Learn the income tax rules for setting off and carrying forward short-term and long-term capital losses in your ITR.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["Capital Loss", "Set Off", "Carry Forward"],
    relatedGlossarySlugs: ["capital-gains", "itr-3"],
    faqs: [
      {
        question: "Can I set off short-term capital loss against long-term capital gains?",
        answer: "Yes, Short-Term Capital Loss (STCL) can be set off against both Short-Term Capital Gains (STCG) and Long-Term Capital Gains (LTCG).",
      },
      {
        question: "Can I set off long-term capital loss against short-term capital gains?",
        answer: "No, Long-Term Capital Loss (LTCL) can only be set off against Long-Term Capital Gains (LTCG).",
      }
    ],
    body: `## Making the Most of Your Market Losses

Nobody likes losing money in the stock market or on a property sale. However, the Income Tax Act allows you to use these losses to your advantage by "setting them off" against your gains. Set-off simply means using a loss to cancel out a gain so you pay tax only on the net amount.

**Quick stat: Capital losses can be carried forward for up to 8 assessment years, but only if you file your ITR by the due date (Source: Sections 70, 74 and 80, Income Tax Act).**

## The Rules of Setting Off Capital Losses

You cannot randomly mix and match losses. The income tax department has strict rules:

1. **Short-Term Capital Loss (STCL):** 
   - A short-term loss is flexible. You can set it off against **both** Short-Term Capital Gains (STCG) and Long-Term Capital Gains (LTCG) in the same year.
   
2. **Long-Term Capital Loss (LTCL):**
   - A long-term loss is restricted. You can **only** set it off against Long-Term Capital Gains (LTCG). You cannot use an LTCL to reduce your short-term gains or salary income.

**Important:** Capital losses (whether short-term or long-term) can *only* be set off against capital gains. You cannot use stock market losses to reduce your tax on salary, business income, or house rent.

## Carrying Forward Losses

What if your losses are bigger than your gains this year? Or what if you only have losses and no gains?

You can **carry forward** the remaining loss to future years! 
- Both STCL and LTCL can be carried forward for **8 consecutive assessment years**.
- In future years, the same set-off rules apply (STCL against both; LTCL only against LTCG).

### The Golden Rule for Carrying Forward
To carry forward your capital losses, you **must file your ITR before the original due date** (usually July 31st). If you file a belated return, you lose the right to carry forward current year losses (though you can still set off losses from previous years).

## Reporting in ITR

You need to use **ITR-2** or **ITR-3** and fill out the "Schedule CYLA" (Current Year Loss Adjustment) and "Schedule CFL" (Carry Forward of Losses).

### How LastMinute ITR helps
Tracking which losses can be set off against which gains can be a headache. When you use LastMinute ITR to review your broker statements, we automatically identify your eligible losses and structure them so you know exactly what to claim on incometax.gov.in, ensuring you don't pay more tax than necessary.

[Start with LastMinute ITR](/file) · [import your broker statements](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

- Remember the rule: short-term loss offsets both STCG and LTCG; long-term loss offsets only LTCG.
- File before the due date if you have any loss you want to carry forward.
- Fill Schedule CYLA and Schedule CFL so the loss flows into future years.

## Common mistake

**Filing late and losing the carry-forward.** A belated return lets you set off this year's losses, but you forfeit the right to carry forward unused current-year capital losses to the next 8 years.`,
  },
  {
    slug: "grandfathering-clause-ltcg-explained",
    title: "Grandfathering Clause for LTCG on Shares",
    description:
      "What is the grandfathering clause for Long-Term Capital Gains? We explain how it protects your gains made before January 31, 2018, from being taxed.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["LTCG", "Grandfathering", "Shares"],
    relatedGlossarySlugs: ["capital-gains", "ais"],
    faqs: [
      {
        question: "What is the grandfathering date for LTCG on shares?",
        answer: "The grandfathering date is January 31, 2018. Gains made on listed equity shares up to this date are exempt from tax.",
      }
    ],
    body: `## The Return of LTCG Tax

Before 2018, Long-Term Capital Gains (LTCG) on listed equity shares were completely tax-free in India. However, the Union Budget of 2018 reintroduced LTCG tax at 10% (now 12.5%) for gains exceeding ₹1 lakh (now ₹1.25 lakh) in a year.

To protect investors who had bought shares years ago expecting them to be tax-free, the government introduced the **Grandfathering Clause**. "Grandfathering" simply means old gains made under the earlier tax-free rules are protected even after the rule changed.

**Quick stat: Gains accrued up to 31 January 2018 are grandfathered (protected) using that day's Fair Market Value; only gains after this date are taxable (Source: Section 112A, Finance Act 2018).**

## What is Grandfathering?

The grandfathering clause ensures that any notional profit you made on your shares up to **January 31, 2018**, remains tax-free. You only pay tax on the gains made *after* this date.

## How it Works: The FMV

To calculate your grandfathered cost, you need to know the Fair Market Value (FMV) of your shares on January 31, 2018. This is usually the highest price the share traded at on the stock exchange on that specific day.

The income tax rules provide a specific formula to determine your "Cost of Acquisition" for calculating LTCG:

Your revised Cost of Acquisition will be the **higher** of:
1. Your actual purchase price.
2. The **lower** of:
   - The FMV on January 31, 2018.
   - The actual Sale Price.

### Let's look at an example:
- You bought Reliance shares in 2015 for **₹500**.
- The FMV on Jan 31, 2018, was **₹900**.
- You sold the shares in 2025 for **₹1,500**.

Without grandfathering, your gain would be ₹1,000 (1500 - 500).
With grandfathering, your revised cost is ₹900 (the FMV). 
Your taxable LTCG is only **₹600** (1500 - 900). The ₹400 gain made between 2015 and 2018 is protected!

## Reporting in ITR

To claim this benefit, you must file **ITR-2** or **ITR-3**. In Schedule 112A, you must provide trade-wise details for shares bought before Jan 31, 2018, including the ISIN, purchase price, sale price, and the FMV on the grandfathering date.

### Simplify it with LastMinute ITR
Finding the exact FMV for dozens of shares from 2018 is tedious. When you upload your broker's Tax P&L to LastMinute ITR, we help you parse the grandfathered costs automatically provided by your broker, giving you a clean summary to enter on the tax portal.

[Start with LastMinute ITR](/file) · [import your Tax P&L](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

- Use the FMV on 31 Jan 2018 only for shares you bought on or before that date.
- Apply the higher-of / lower-of formula carefully, or rely on your broker's grandfathered cost column.
- Report trade-wise details in Schedule 112A of ITR-2 or ITR-3.

## Common mistake

**Using purchase price for old shares and overpaying.** If you ignore the higher 31 Jan 2018 FMV, you tax gains that are legally protected. Always check whether the FMV gives you a higher cost base.`,
  },
  {
    slug: "section-54-tax-exemption-property",
    title: "Section 54: Save Tax on Sale of House Property",
    description:
      "Learn how to claim Section 54 exemption to save capital gains tax when you sell a residential property and reinvest the money in a new house.",
    readMinutes: 7,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["Section 54", "Property Sale", "Tax Exemption"],
    relatedGlossarySlugs: ["capital-gains", "ais"],
    faqs: [
      {
        question: "What is Section 54 of the Income Tax Act?",
        answer: "Section 54 provides an exemption from Long-Term Capital Gains tax if you sell a residential house and reinvest the capital gains into buying or constructing another residential house.",
      }
    ],
    body: `## Don't Pay Tax on Your New Home

Selling a house often results in a massive Long-Term Capital Gain (LTCG), which can lead to a hefty tax bill. However, the government wants to encourage homeownership. If you are selling a house to buy another one, you can use **Section 54** to wipe out your capital gains tax entirely.

**Quick stat: Section 54 reinvestment exemption is capped at Rs 10 crore of capital gains per transaction, effective AY 2024-25 (Source: Finance Act, 2023).**

## Who can claim Section 54?

To claim this exemption, you must meet these conditions:
1. You must be an Individual or a HUF.
2. The asset you sold must be a **residential house property**.
3. It must be a **long-term** asset (held for more than 24 months).
4. You must purchase or construct a **new residential house property in India**.

## The Reinvestment Rules

You don't have to reinvest the entire sale amount; you only need to reinvest the **Capital Gains** amount to get full exemption.

**Timelines are critical:**
- **Purchase:** You must buy the new house either 1 year *before* the sale or within 2 years *after* the sale.
- **Construction:** If you are building a house, construction must be completed within 3 years *after* the sale.

*Note: The exemption is capped at ₹10 crore. Any capital gains above ₹10 crore cannot be exempted under Section 54.*

## What is the Capital Gains Account Scheme (CGAS)?

If you haven't bought or built the new house by the time you need to file your ITR (usually July 31st), you cannot just keep the money in your savings account and claim the exemption.

You must deposit the unutilized capital gains into a special **Capital Gains Account Scheme (CGAS)** with an authorized bank before the ITR filing deadline. You can then withdraw from this account to pay for your new house within the specified 2 or 3-year timeline.

## How to claim it in your ITR

You must file **ITR-2** or **ITR-3**. In the Capital Gains schedule, you will first calculate your total LTCG from the property sale. Then, there is a specific row to claim the deduction under Section 54. You will need to provide details of the new property purchased or the amount deposited in the CGAS.

### A word of caution
If you sell the *new* house within 3 years of buying it, the Section 54 exemption you claimed will be reversed, and you will have to pay tax on those gains. Always ensure the property sale details in your ITR match the high-value transaction records in your **AIS**.

## How LastMinute ITR helps

We help you reconcile the property sale shown in your AIS against your records and pick the right ITR form so your Section 54 claim is entered cleanly before you file on incometax.gov.in.

[Start with LastMinute ITR](/file) · [import your documents](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

1. Reinvest only the capital gains amount (not the whole sale value) to get full exemption.
2. If the new house is not bought before the ITR due date, park the gains in a Capital Gains Account Scheme deposit.
3. Track the 2-year purchase / 3-year construction windows carefully.

## Common mistake

**Keeping unutilised gains in a normal savings account.** To claim the exemption at filing time, unspent gains must sit in a CGAS account by the due date, not your regular bank balance.`,
  },
  {
    slug: "capital-gains-on-espp-rsu",
    title: "Tax on RSUs and ESPPs for Tech Employees",
    description:
      "A complete guide to the taxation of Restricted Stock Units (RSUs) and Employee Stock Purchase Plans (ESPPs) in India, from vesting to sale.",
    readMinutes: 8,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["RSU", "ESPP", "Foreign Stocks", "ITR-2"],
    relatedGlossarySlugs: ["capital-gains", "tds"],
    faqs: [
      {
        question: "Are RSUs taxed when they vest or when they are sold?",
        answer: "RSUs are taxed twice: first as salary income (perquisite) when they vest, and later as capital gains when you sell them.",
      }
    ],
    body: `## The Double Taxation of Company Stock

If you work for a multinational tech company in India (like Google, Amazon, or Microsoft), you likely receive part of your compensation in company shares through Restricted Stock Units (RSUs) or an Employee Stock Purchase Plan (ESPP).

Many employees are surprised to learn that these shares are taxed at two different stages: when you get them, and when you sell them.

**Quick stat: Foreign company shares are treated as unlisted, so the long-term holding period is 24 months and LTCG is taxed at 12.5% with no Rs 1.25 lakh exemption (Source: Finance (No. 2) Act, 2024).**

## Stage 1: Vesting (Taxed as Salary)

When your RSUs vest (i.e., the shares are actually deposited into your brokerage account), they are considered a "perquisite" or a benefit provided by your employer.

- **Taxable Value:** The Fair Market Value (FMV) of the shares on the vesting date.
- **Tax Rate:** Taxed at your normal income tax slab rate.
- **How it's paid:** Your employer will automatically deduct TDS on this amount. Often, they do a "sell-to-cover," meaning they immediately sell a portion of your vested shares to pay the TDS to the Indian government.
- **Where it shows up:** This value is included in your Form 16 under "Perquisites."

*(For ESPPs, the discount you receive on the purchase price is taxed as a perquisite).*

## Stage 2: Selling (Taxed as Capital Gains)

When you eventually sell the shares, any profit you make *above* the vesting FMV is taxed as Capital Gains.

- **Purchase Price:** The FMV on the vesting date (not zero!).
- **Holding Period:** Calculated from the vesting date to the sale date. Since these are usually foreign (unlisted in India) shares, the holding period for Long-Term Capital Gains is **24 months**.
- **Short-Term Capital Gains (STCG):** If sold within 24 months, taxed at your slab rate.
- **Long-Term Capital Gains (LTCG):** If sold after 24 months, taxed at 12.5% (under recent rules) or 20% with indexation, depending on the applicable finance act.

## Reporting Foreign Assets (Schedule FA)

This is the most critical compliance step. If you hold shares in a foreign company (even just one share of Amazon or Google), you **must** declare them in **Schedule FA (Foreign Assets)** of your ITR. 

Failing to report foreign assets can lead to severe penalties under the Black Money Act, even if you have paid all your taxes.

### How LastMinute ITR helps
Filing ITR-2 with foreign stocks is complex. You have to convert USD to INR using specific SBI TT Buying Rates for different dates. LastMinute ITR guides you on what data you need from your E*TRADE or Charles Schwab statements so you can confidently fill out Schedule CG and Schedule FA on the tax portal.

[Start with LastMinute ITR](/file) · [import your broker statements](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

- Use the vesting-date FMV (already taxed as salary) as your cost when computing capital gains on sale.
- Declare every foreign holding in Schedule FA, even shares you never sold.
- Keep your Form 16 perquisite breakup and broker statements together.

## Common mistake

**Treating cost as zero on sale.** The shares were already taxed as salary at vesting. Using zero cost double-taxes you. Your cost is the vesting-date FMV, not nil.`,
  },
  {
    slug: "tax-on-foreign-stocks-india",
    title: "How to Pay Tax on Foreign Stocks in India",
    description:
      "Investing in US stocks? Understand the tax rules for capital gains and dividends from foreign stocks, and how to report them in Schedule FA of your ITR.",
    readMinutes: 7,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["Foreign Stocks", "US Stocks", "Schedule FA"],
    relatedGlossarySlugs: ["capital-gains", "itr-3"],
    faqs: [
      {
        question: "What is the holding period for long-term capital gains on US stocks?",
        answer: "Foreign stocks are treated as unlisted shares in India. You must hold them for more than 24 months for the gains to be considered long-term.",
      }
    ],
    body: `## Investing Beyond Borders

Platforms like INDmoney and Vested have made it easy for Indians to invest directly in US stocks like Apple, Tesla, and Microsoft. However, the income tax rules for foreign stocks are completely different from Indian stocks.

Here is what you need to know about taxing foreign investments.

**Quick stat: The US withholds a flat 25% tax on dividends paid to Indian investors under the India-US DTAA; you can recover it as a Foreign Tax Credit by filing Form 67 before your ITR (Source: India-US DTAA Article 10 and Rule 128).** A DTAA is just a treaty that stops the same income being fully taxed in both countries.

## 1. Capital Gains on Foreign Stocks

Foreign stocks are not listed on recognized Indian stock exchanges (BSE/NSE). Therefore, the income tax department treats them as **unlisted shares**.

- **Short-Term Capital Gains (STCG):** If you sell the shares within **24 months**.
  - **Tax Rate:** Added to your total income and taxed at your applicable slab rate.
- **Long-Term Capital Gains (LTCG):** If you hold the shares for **more than 24 months**.
  - **Tax Rate:** Taxed at 12.5% (or 20% with indexation, depending on the specific rules for the assessment year). You do *not* get the ₹1.25 lakh exemption that applies to Indian equity.

## 2. Tax on Foreign Dividends

When US companies pay dividends, the US government deducts a flat 25% withholding tax (thanks to the India-US Double Taxation Avoidance Agreement or DTAA).

In India, this dividend is fully taxable at your slab rate under "Income from Other Sources." 

**Do I pay tax twice?**
No. You can claim a **Foreign Tax Credit (FTC)** in your Indian ITR for the 25% tax already withheld in the US. You must file Form 67 *before* filing your ITR to claim this credit.

## 3. The Mandatory Schedule FA

If you own even a fraction of a US stock, or have money lying in a foreign brokerage account at any time during the year, you **must** declare it in **Schedule FA (Foreign Assets)** of your ITR.

You must report:
- The name of the company.
- The peak value of the investment during the year.
- The closing value.
- Any income derived from it.

You must use the State Bank of India (SBI) Telegraphic Transfer (TT) Buying Rate on specific dates to convert USD values to INR for reporting.

### Filing your ITR
You must use **ITR-2** or **ITR-3**. ITR-1 cannot be used if you have foreign assets. 

The penalties for hiding foreign assets under the Black Money Act are draconian (up to ₹10 lakh penalty). Always declare your US brokerage accounts in Schedule FA, even if you made no trades during the year. Use LastMinute ITR's checklists to ensure you have all your foreign broker statements ready before heading to incometax.gov.in.

[Start with LastMinute ITR](/file) · [import your statements](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

1. File Form 67 before your ITR to claim the Foreign Tax Credit on US dividends.
2. Report peak value, closing value, and income for each holding in Schedule FA.
3. Use the SBI TT Buying Rate for the relevant dates to convert USD to INR.

## Common mistake

**Skipping Schedule FA in a no-trade year.** Even if you only held INDmoney or Vested US stocks and never sold, the foreign asset disclosure is still mandatory. Omitting it triggers Black Money Act exposure.`,
  },
  {
    slug: "schedule-al-high-income-itr",
    title: "Schedule AL: Reporting Assets for High Income",
    description:
      "If your income exceeds ₹50 Lakh, you must fill Schedule AL in your ITR. Learn what assets and liabilities to declare and how to avoid penalties.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "general",
    tags: ["Schedule AL", "High Income", "ITR-2", "ITR-3"],
    relatedGlossarySlugs: ["itr-3", "ais"],
    faqs: [
      {
        question: "Who needs to fill Schedule AL in their ITR?",
        answer: "Any individual or HUF whose total income (after deductions) exceeds ₹50 Lakh in a financial year must fill Schedule AL.",
      }
    ],
    body: `## The ₹50 Lakh Threshold

Earning a high income comes with extra compliance. If your total taxable income (after claiming all deductions like 80C, HRA, etc.) crosses **₹50 Lakh** in a financial year, the Income Tax Department wants to know your net worth.

You are required to fill out **Schedule AL (Assets and Liabilities)** in your ITR-2 or ITR-3.

**Quick stat: Schedule AL becomes mandatory once your total income (after deductions) crosses Rs 50 lakh in a financial year, and assets must be reported at cost, not market value (Source: CBDT ITR-2 / ITR-3 instructions).**

## What is Schedule AL?

Schedule AL is essentially a personal balance sheet. You must declare the value of specific assets you own and any liabilities (loans) related to those assets as of March 31st of the financial year.

## What Assets Must Be Declared?

You need to report assets at their **cost price** (what you paid for them), not their current market value.

**1. Immovable Assets:**
- Land and buildings (house property, commercial property).

**2. Movable Assets:**
- Financial assets: Shares, mutual funds, bank balances (including FDs), insurance policies, and loans given to others.
- Valuables: Jewelry, bullion, archaeological collections, art.
- Vehicles: Cars, yachts, boats, aircraft.

## What Liabilities Must Be Declared?

You only need to declare liabilities that are directly related to the assets you are reporting.
- For example, if you declare a house property worth ₹1 Crore, and you have an outstanding home loan of ₹60 Lakh on it, you report the ₹60 Lakh as a liability.
- Personal loans or credit card debt not tied to a specific declared asset generally do not need to be reported here.

## Common Mistakes in Schedule AL

1. **Reporting Market Value:** Do not report the current value of your mutual funds or house. Report the exact cost of acquisition.
2. **Ignoring Bank Balances:** You must report the total balance across all your savings and current accounts as of March 31st.
3. **Forgetting Jewelry:** An estimate of the cost of inherited or purchased jewelry must be included.

## Why does the IT Department want this?

The government uses Schedule AL to track wealth accumulation. If your assets grow by ₹2 Crore in a year, but your declared income is only ₹60 Lakh, it raises a red flag for potential tax evasion.

### Be Prepared
Gathering the cost data for all your assets can take days. Don't leave Schedule AL for the last 48 hours before the deadline. Use LastMinute ITR's readiness checklists to gather your bank statements, demat holding statements, and property deeds well in advance, so you can smoothly fill out your ITR-2 on the government portal.

[Start with LastMinute ITR](/file) · [import your documents](/file/import/documents) · [fix an AIS mismatch](/file/import/mismatch).

## What you should do

- Confirm whether your post-deduction income actually crosses Rs 50 lakh before worrying about Schedule AL.
- List assets at cost of acquisition, including bank balances as on 31 March.
- Report only loans directly tied to the assets you declare.

## Common mistake

**Reporting market value instead of cost.** Schedule AL asks for cost of acquisition. Entering current market value of shares, funds, or your house inflates the schedule and invites questions.`,
  }
];
