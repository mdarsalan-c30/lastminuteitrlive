import type { LearnArticle } from "./learn-articles";

export const DEDUCTIONS_ARTICLES_2: LearnArticle[] = [
  {
    slug: "claim-80d-not-in-form-16",
    title: "How to claim Section 80D deductions if not in Form 16",
    description: "Forgot to give your health insurance proof to HR, so Form 16 shows no 80D? You can still claim it directly in your ITR. Here is the step-by-step way to do it.",
    readMinutes: 4,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["80D", "Form 16", "ITR filing", "health insurance"],
    relatedGlossarySlugs: ["80d", "80c"],
    body: `## Missed the HR deadline? No problem.

Every January, employers ask for investment proofs. If you missed submitting your health insurance receipt, payroll cut higher TDS and your **Form 16** (the salary-and-tax certificate from your employer) shows no Section 80D deduction.

You have not lost the money. **80D is your right to claim, not your employer's to grant** — you can add it yourself while filing your Income Tax Return.

Quick reminder of the number: **80D allows ₹25,000 (below 60) or ₹50,000 (senior citizen involved) for health insurance premiums (Source: Section 80D, Income Tax Act).**

## How to claim it yourself: step by step

1. **Keep your proof ready:** the premium receipt from the insurer, clearly showing it is health insurance.
2. **Check the payment mode:** the premium must have been paid digitally or by cheque — cash premiums do not qualify.
3. **File under the Old Regime:** 80D works only if you opt for the old regime.
4. **Open the deductions schedule:** on incometax.gov.in, go to Schedule VI-A, find Section 80D, and enter the premium amount.
5. **Review the new tax figure:** your liability drops, usually creating a refund.

## What happens next

Because your employer taxed you as if you had no 80D, claiming it now lowers your final liability. This typically produces a **refund**, which the department credits to your bank account after processing.

| Form 16 80D | What you do | Likely result |
| Shows ₹0 | Claim it in ITR | Refund of excess TDS |

## What you should do

1. Do not assume Form 16 is the final word — it only reflects what HR knew.
2. Re-check every health policy renewed during the year, including parents' cover.
3. Match the amount to your premium receipts before entering it.

## Common mistake

**Believing you cannot claim what Form 16 omitted.** Many people overpay tax for years on this myth. The ITR, not Form 16, is your final declaration.

## How LastMinute ITR helps

If Form 16 lacks your 80D, it is easy to forget. [LastMinute ITR](/file) asks directly whether you bought health insurance this year, regardless of Form 16, slots it into your [deductions](/file/deductions), and [checks old vs new regime](/file/regime) so the claim actually helps. You then file and e-verify on incometax.gov.in.`,
  },
  {
    slug: "80d-vs-80ddb-medical-deductions",
    title: "Section 80D vs 80DDB: Understanding medical tax deductions",
    description: "Mixing up 80D and 80DDB is a common filing error. Learn the simple difference between health insurance premiums and specified critical illness expenses.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["80D", "80DDB", "medical", "critical illness"],
    relatedGlossarySlugs: ["80d", "senior-citizen"],
    body: `## Decoding the medical tax codes

The Old Regime has several medical sections, and mixing them up is a classic error. The two most confused are 80D and 80DDB. The easy rule: **80D is for prevention and general health (insurance, check-ups), while 80DDB is for treating specific, severe named diseases.**

## Side by side

| Feature | 80D | 80DDB |
| Covers | Insurance premiums, check-ups, senior bills | Treatment of specified critical diseases |
| Who | Self, spouse, children, parents | Self, spouse, children, parents, dependent siblings |
| Limit | ₹25,000 / ₹50,000 (senior) | ₹40,000 / ₹1,00,000 (senior) |

**80DDB allows up to ₹40,000, rising to ₹1,00,000 if the patient is a senior citizen (Source: Section 80DDB, Income Tax Act).**

## Section 80D: health insurance

- **Covers:** mediclaim premiums, preventive check-ups, and for uninsured seniors, routine medical bills.
- **Limit:** ₹25,000 for those below 60; ₹50,000 where a senior is insured.

## Section 80DDB: critical illness

- **Covers:** actual treatment cost of specified diseases — cancer, chronic renal failure, Parkinson's, severe neurological disorders, and similar.
- **Limit:** up to ₹40,000, or ₹1,00,000 if the patient is a senior citizen.
- **Proof:** you need a prescription or certificate from a specialist (such as an oncologist or neurologist).

## Can you claim both?

Yes. If you paid health insurance premiums (80D) **and** spent on a dependent's specified illness (80DDB), you may claim both, provided each condition is met.

Note: if insurance reimburses part of the illness cost, subtract that reimbursed amount from your 80DDB claim.

## What you should do

1. Decide which spend is "general/insurance" (80D) and which is "named critical illness treatment" (80DDB).
2. Get the specialist certificate before claiming 80DDB.
3. Net off any insurance reimbursement from the 80DDB figure.

## Common mistake

**Claiming an illness treatment under 80D, or claiming 80DDB without the specialist certificate.** Both invite a notice. Keep the documents matched to the right section.

## How LastMinute ITR helps

Entering the wrong amount in the wrong section is a frequent slip. [LastMinute ITR](/file) asks plain-English questions about your medical spend and routes each rupee to 80D or 80DDB inside your [deductions](/file/deductions), while [checking the old regime is worth it](/file/regime). You file and e-verify on incometax.gov.in.`,
  },
  {
    slug: "hra-exemption-calculator-rules",
    title: "HRA exemption calculator: Find your exact tax-free rent",
    description: "Your full rent is not tax-free. Learn the HRA least-of-three formula and the 50% metro vs 40% non-metro rule with a clear rupee example to find your exemption.",
    readMinutes: 6,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["HRA", "rent", "salary", "exemption"],
    relatedGlossarySlugs: ["hra", "80c"],
    body: `## It is not just the rent you pay

If you rent a home and receive **House Rent Allowance (HRA)** in your salary, you can shield part of it from tax under the Old Regime. The myth to bust: your entire rent is **not** tax-free. The law uses a **least-of-three rule** — your exemption is the smallest of three amounts.

## The metro vs non-metro number

**HRA exemption uses 50% of basic salary for metros and 40% for non-metros as one of the three caps (Source: Section 10(13A) and Rule 2A, Income Tax Rules).**

| City type | Cities | Salary % cap |
| Metro | Delhi, Mumbai, Chennai, Kolkata | 50% of basic |
| Non-metro | Bengaluru, Pune, Hyderabad, others | 40% of basic |

## The least-of-three rule

Your tax-free HRA is the **lowest** of:

1. **Actual HRA received** from your employer.
2. **Rent paid minus 10% of basic salary** (basic + DA).
3. **50% of basic** (metro) or **40% of basic** (non-metro).

## A worked example

- Basic salary: ₹50,000/month (₹6,00,000/year)
- HRA received: ₹20,000/month (₹2,40,000/year)
- Rent in Bengaluru (non-metro): ₹15,000/month (₹1,80,000/year)

Applying the rule:

1. Actual HRA: ₹2,40,000
2. Rent minus 10% of basic: ₹1,80,000 − ₹60,000 = **₹1,20,000**
3. 40% of basic: ₹2,40,000

The lowest is **₹1,20,000** — that is your tax-free HRA. The remaining ₹1,20,000 of HRA becomes taxable salary.

## Metro vs non-metro, clearly

Only Delhi, Mumbai, Chennai, and Kolkata are "metros" for HRA. Even with high rent in Bengaluru or Gurgaon, you use the 40% figure.

## What you should do

1. Note your basic (and DA) from Form 16 — HRA maths uses basic, not gross.
2. Run all three figures and pick the smallest.
3. Keep rent receipts and proof of payment.

## Common mistake

**Assuming your whole rent or whole HRA is exempt.** The least-of-three rule almost always exempts less, and over-claiming can trigger scrutiny.

## How LastMinute ITR helps

The maths gets messy if rent or salary changed mid-year. [LastMinute ITR](/file) runs the least-of-three formula instantly, shows the exempt figure in your [deductions](/file/deductions), and [compares old vs new regime](/file/regime), since HRA only helps in the old regime. You file and e-verify on incometax.gov.in.`,
  },
  {
    slug: "claim-hra-not-in-form-16",
    title: "How to claim HRA in ITR if not in your Form 16",
    description: "Missed giving rent receipts to HR, so Form 16 shows no HRA? You can still claim the exemption directly in your ITR. Here is the exact step-by-step process.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["HRA", "Form 16", "rent", "ITR filing"],
    relatedGlossarySlugs: ["hra", "80c"],
    body: `## Bypass the HR deadline

If you did not give your rent agreement and receipts to your employer in time, payroll treated your HRA as fully taxable, so your **Form 16** shows zero HRA exemption.

Do not panic. Under the Old Regime, you can claim the HRA exemption directly in your ITR, using the **least-of-three rule** (the lowest of: actual HRA, rent minus 10% of basic, or 50%/40% of basic).

A quick anchor: **the metro cap is 50% of basic and the non-metro cap is 40% (Source: Section 10(13A), Income Tax Act).**

## Step-by-step guide

1. **Calculate your exemption** using the least-of-three rule.
2. **Open the salary schedule** in the ITR form on incometax.gov.in.
3. **Find "Allowances exempt u/s 10".**
4. **Select HRA** — "Sec 10(13A): allowance to meet house rent".
5. **Enter the exempt amount** you calculated.
6. **Confirm tax drops** — the portal removes it from taxable salary, usually creating a refund.

## Keep your proofs ready

You do not upload rent receipts to the portal, but you must store them. If a notice arrives, you will need:

- Rent agreement
- Rent receipts or bank statements showing transfers
- Landlord's PAN if annual rent exceeds ₹1 lakh

| Form 16 HRA | What you do | Likely result |
| Shows ₹0 | Claim via Sec 10(13A) | Refund of excess TDS |

## What you should do

1. Compute the exemption before touching the form, so you enter one clean figure.
2. Pay rent by bank transfer going forward to build proof.
3. Collect the landlord PAN early if rent crosses ₹1 lakh a year.

## Common mistake

**Entering the full rent or full HRA in the exemption box.** Only the least-of-three figure is allowed; a round, inflated number is a red flag.

## How LastMinute ITR helps

Adjusting salary figures by hand is nerve-wracking. [LastMinute ITR](/file) takes your rent details, runs the least-of-three formula, and tells you exactly which box to fill in your [deductions](/file/deductions), while [comparing both regimes](/file/regime). You file and e-verify on incometax.gov.in.`,
  },
  {
    slug: "paying-rent-to-parents-hra",
    title: "Paying rent to parents: Legal rules to claim HRA",
    description: "You can legally claim HRA by paying rent to parents who own the home. Learn the documentation, bank-transfer rules, and the tax impact on your parents first.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["HRA", "parents", "rent", "tax planning"],
    relatedGlossarySlugs: ["hra", "80c"],
    body: `## Keep it in the family (legally)

If you live with your parents in a house they own and you receive **HRA** in your salary, you can pay them rent and claim the HRA exemption under the Old Regime. It is legal — but the department watches these claims closely, so do it by the book.

## The number on the parents' side

**Your parents can claim a flat 30% standard deduction on the rent they receive as house property income (Source: Section 24(a), Income Tax Act).**

| Rent you pay to parent | 30% standard deduction | Taxable in parent's hands |
| ₹2,40,000/year | ₹72,000 | ₹1,68,000 (before other set-offs) |

## The golden rules

1. **They must own the home:** you cannot pay rent to a parent who is themselves renting it.
2. **You cannot be a co-owner:** if your name is on the deed, you cannot pay rent to yourself.
3. **Pay by bank transfer:** monthly NEFT/UPI with a "Rent for [month]" note builds an undeniable trail. No cash.
4. **Sign a rent agreement:** a formal agreement between you and your parent(s).
5. **Collect rent receipts:** ask your parents to sign monthly receipts.

## The tax impact on parents

This is the part people skip: **the rent becomes your parents' taxable income.** They report it under "Income from House Property", claim the 30% standard deduction plus any property tax, and pay tax on the rest.

If your parents are in a lower bracket (or have little other income), the family saves overall. If a parent is already in the 30% bracket, the strategy can increase the family's total tax — so check first.

## What you should do

1. Confirm the home is legally in your parent's name and you are not a co-owner.
2. Set up an automatic monthly bank transfer with a clear remark.
3. Compare your tax saving against the extra tax your parent pays.

## Common mistake

**Paying "rent" in cash with no agreement.** Without a bank trail and paperwork, the claim collapses under scrutiny and can be reversed with interest.

## How LastMinute ITR helps

Before committing, you need to know if the HRA exemption is even worth it. [LastMinute ITR](/file) calculates your exact HRA exemption from your salary structure, shows it in your [deductions](/file/deductions), and [compares regimes](/file/regime). You then file and e-verify on incometax.gov.in.`,
  },
  {
    slug: "hra-and-home-loan-together",
    title: "Can I claim HRA and Home Loan benefits at the same time?",
    description: "Yes, you can claim HRA and home loan deductions together under specific conditions. Learn the four common scenarios and how to claim both benefits legally.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["HRA", "home loan", "tax planning", "real estate"],
    relatedGlossarySlugs: ["hra", "home-loan"],
    body: `## The double tax benefit

A very common question: "I pay a home loan EMI but live in a rented flat. Can I claim both the home loan deduction and HRA?"

**Yes — both are allowed together under the Old Regime,** if you genuinely meet the conditions. Quick jargon: **HRA** shields part of your rent; **Section 24b** is the deduction for the interest portion of your home loan.

## The two big numbers

**HRA uses the least-of-three rule, while Section 24b allows up to ₹2 lakh interest on a self-occupied home (Source: Sections 10(13A) and 24(b), Income Tax Act).**

| Benefit | Cap |
| HRA exemption | Least of three amounts |
| Home loan interest (24b) | ₹2,00,000 (self-occupied) |
| Home loan principal (80C) | Within ₹1.5 lakh basket |

## Scenario 1: different cities

You own a house in Pune (paying EMI) but work and rent in Bengaluru. Claim HRA for Bengaluru rent and 24b/80C for the Pune loan. The most clear-cut case.

## Scenario 2: same city, different location

You own a flat in Mumbai but rent another closer to work or large enough for your family. Allowed — keep a valid reason (distance, size) ready in case of a query.

## Scenario 3: under-construction property

You pay EMI on an under-construction home and rent elsewhere. Claim HRA now; you **cannot** claim 24b interest until possession (you can claim principal under 80C).

## Scenario 4: you rented out your own house

You own a house, let it out, and rent another to live in. Claim HRA for your rent; declare the rental income, and deduct the full home loan interest against it.

## What you should do

1. Match each benefit to your actual living and ownership situation.
2. Keep both the rent paperwork and the loan interest certificate.
3. Note a genuine reason if you rent in the same city as your own house.

## Common mistake

**Claiming 24b on an under-construction flat.** Interest before possession is not allowed in the current year — it becomes pre-construction interest, claimable later in five instalments.

## How LastMinute ITR helps

Claiming both is legal but often triggers automated scrutiny. [LastMinute ITR](/file) structures your HRA and house property entries cleanly in your [deductions](/file/deductions) and [compares old vs new regime](/file/regime), since both benefits need the old regime. You file and e-verify on incometax.gov.in.`,
  },
  {
    slug: "landlord-pan-refusal-hra",
    title: "What happens if my landlord refuses to share PAN for HRA?",
    description: "Paying over Rs 1 lakh annual rent but your landlord will not give their PAN? Learn your options for claiming HRA and the real risk of skipping the PAN.",
    readMinutes: 4,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["HRA", "PAN", "landlord", "rent"],
    relatedGlossarySlugs: ["hra", "80c"],
    body: `## The PAN card standoff

To claim **HRA** exemption, there is a strict reporting rule about your landlord's PAN — the permanent account number every taxpayer has.

**If your annual rent exceeds ₹1,00,000 (about ₹8,333 a month), you must report your landlord's PAN to your employer (Source: CBDT Circular on HRA, Section 10(13A)).**

| Annual rent | Landlord PAN needed? |
| Up to ₹1,00,000 | No |
| Above ₹1,00,000 | Yes |

But what if the landlord refuses — usually to avoid declaring rental income?

## Option 1: the declaration route

If the landlord genuinely has no PAN, ask them to sign a formal declaration to that effect, which you give your employer with the rent receipts.

Reality check: most landlords who refuse actually have a PAN and simply will not share it — they are unlikely to sign a false declaration.

## Option 2: claim it directly in your ITR

If you cannot give the PAN to your employer, payroll taxes your HRA fully. You can still claim the exemption yourself in the ITR — **but this is risky**. If the department reviews a large HRA claim with no landlord PAN, it may demand proof. Fail to provide it and the claim is rejected, with tax plus interest payable.

## The best approach

Always ask for the PAN **before** signing the lease. A refusal is a red flag worth noting early.

## What you should do

1. Request the landlord PAN in writing at the start of the tenancy.
2. Keep the rent agreement, receipts, and bank transfers as backup.
3. Be cautious claiming above ₹1 lakh rent without a PAN — weigh the notice risk.

## Common mistake

**Inflating rent just below or above ₹1 lakh to dodge the PAN rule.** The bank trail tells the real story, and mismatches invite exactly the notice you were avoiding.

## How LastMinute ITR helps

Missing documents are stressful. [LastMinute ITR](/file) tells you precisely which proofs your HRA amount needs, shows the exemption in your [deductions](/file/deductions), and [compares both regimes](/file/regime) so you do not over-rely on a shaky claim. You file and e-verify on incometax.gov.in.`,
  },
  {
    slug: "section-80gg-rent-deduction-no-hra",
    title: "Section 80GG: Claiming rent deduction without HRA in salary",
    description: "Self-employed or no HRA in your salary? Section 80GG still gives a rent deduction. Learn the conditions, the Form 10BA step, and why the cap limits the benefit.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["80GG", "rent", "HRA", "deductions"],
    relatedGlossarySlugs: ["hra", "80c"],
    body: `## Rent relief for the rest of us

HRA is great, but what if you are a freelancer, business owner, or a salaried person whose package has no HRA component? You can still get a rent deduction under **Section 80GG** of the Old Regime.

## The cap that defines 80GG

**Section 80GG is capped at ₹5,000 per month, i.e. ₹60,000 a year (Source: Section 80GG, Income Tax Act).** That ceiling is why 80GG saves far less than HRA can.

| 80GG test | Value |
| Monthly cap | ₹5,000 (₹60,000/year) |
| Income test | 25% of total income |
| Rent test | Rent minus 10% of total income |

## The conditions

To claim 80GG, you must meet all of these:

1. You do **not** receive HRA from any employer.
2. You, your spouse, or minor child do not own a home in the city where you live and work.
3. If you own a house elsewhere, it cannot be treated as self-occupied while you claim 80GG.
4. You file **Form 10BA** (a short online declaration) before filing your ITR.

## The deduction is the lowest of three

1. ₹5,000 per month (₹60,000/year)
2. 25% of total income (after other deductions like 80C, 80D)
3. Actual rent paid minus 10% of total income

## Example

Total income ₹8 lakh, rent ₹15,000/month:

1. Cap: ₹60,000
2. 25% of income: ₹2,00,000
3. Rent minus 10% of income: ₹1,80,000 − ₹80,000 = ₹1,00,000

**Your deduction is ₹60,000** (the lowest).

## What you should do

1. Confirm you receive no HRA before choosing 80GG.
2. File Form 10BA on the portal first — skipping it disqualifies the claim.
3. Keep rent receipts and bank proof.

## Common mistake

**Forgetting Form 10BA.** The deduction is routinely disallowed when the declaration is not filed before the return, even if every other condition is met.

## How LastMinute ITR helps

80GG is easy to overlook if you are self-employed. [LastMinute ITR](/file) asks whether you pay rent, and if you have no HRA, it calculates your 80GG eligibility within your [deductions](/file/deductions) and [compares regimes](/file/regime). You file Form 10BA and the return, then e-verify, on incometax.gov.in.`,
  },
  {
    slug: "section-24b-home-loan-interest",
    title: "Section 24b: Claiming ₹2 lakh interest on your home loan",
    description: "Section 24b lets you deduct up to Rs 2 lakh of home loan interest on a self-occupied house. Learn the conditions, the 5-year rule, and how let-out homes differ.",
    readMinutes: 5,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["home loan", "Section 24b", "interest", "real estate"],
    relatedGlossarySlugs: ["home-loan", "80c"],
    body: `## The biggest tax break for homeowners

A home loan EMI has two parts: principal (the amount borrowed) and interest (the cost of borrowing). Under the Old Regime, the principal goes into your **80C basket**, while the **interest** is claimed separately under **Section 24(b)**, under the head "Income from House Property".

## The ₹2 lakh number

**Section 24(b) allows up to ₹2,00,000 of home loan interest a year on a self-occupied house (Source: Section 24(b), Income Tax Act).**

| Property type | Interest cap |
| Self-occupied | ₹2,00,000 |
| Self-occupied, fails 5-year/repairs rule | ₹30,000 |
| Let-out | No upper limit (loss set-off capped) |

## Conditions for the full ₹2 lakh

1. The loan was taken to **buy or build** a house.
2. The loan was taken on or after 1 April 1999.
3. Construction or purchase completes within **5 years** from the end of the year the loan was taken.

Fail the 5-year rule, or borrow for repairs, and the cap drops to just ₹30,000.

## If the house is let out

Declare the rental income, but there is **no upper limit** on interest you can deduct against it. However, if this creates a loss under "House Property", only ₹2 lakh of that loss can be set off against salary/other income this year; the rest carries forward.

## What you should do

1. Get your bank's interest certificate showing principal and interest split.
2. Put principal in 80C, interest in Section 24b.
3. Check the 5-year completion rule if it is a newer purchase.

## Common mistake

**Claiming the full EMI under one section.** Only the interest goes under 24b and only the principal under 80C; lumping them together overstates the deduction.

## How LastMinute ITR helps

Home loan interest gets tricky with pre-construction amounts. [LastMinute ITR](/file) reads your interest certificate and tells you exactly what goes into Section 24b versus the [80C basket](/file/deductions), while [comparing old vs new regime](/file/regime), since 24b needs the old regime. You file and e-verify on incometax.gov.in.`,
  },
  {
    slug: "joint-home-loan-tax-benefit",
    title: "Joint home loan tax benefits: Double your deductions",
    description: "Co-borrowing a home loan with your spouse? Both co-owners can claim separate interest and principal deductions, potentially doubling the family tax benefit.",
    readMinutes: 4,
    publishedAt: "2026-06-15",
    cluster: "deductions",
    tags: ["home loan", "joint loan", "tax planning", "real estate"],
    relatedGlossarySlugs: ["home-loan", "80c"],
    body: `## Teamwork pays off in taxes

Buying in a metro often needs a joint home loan, usually with a spouse. The Old Regime rewards this: **both co-borrowers can claim deductions on the same loan** — if they are also co-owners.

## The doubling, in numbers

**Each co-owner can claim up to ₹2 lakh interest (Section 24b) and up to ₹1.5 lakh principal (Section 80C) (Source: Sections 24(b) and 80C, Income Tax Act).**

| Benefit | Per person | Family (two co-owners) |
| Interest (24b) | ₹2,00,000 | ₹4,00,000 |
| Principal (80C) | ₹1,50,000 | ₹3,00,000 |

## The golden rule: co-ownership is mandatory

You must be a **co-owner** of the property, not merely a co-borrower or guarantor. If the house is registered only in your spouse's name but you pay the EMI, you cannot claim anything.

## How to split the claim

Deductions split by your **ownership share**:

- A 50:50 deed means a 50:50 split of principal and interest.
- If total interest is ₹3,00,000, each claims ₹1,50,000.

You can never claim more than the actual amount paid to the bank.

## What you should do

1. Confirm both names are on the property deed, not just the loan.
2. Decide the ownership ratio and split principal and interest accordingly.
3. Keep a clear record so both returns match.

## Common mistake

**Both spouses claiming the full interest.** Claiming overlapping amounts beyond your share is a fast route to matching notices for both of you.

## How LastMinute ITR helps

When spouses file separately, the split is easy to botch. [LastMinute ITR](/file) helps you define your share of the joint loan inside your [deductions](/file/deductions) and [compares regimes](/file/regime) so both of you claim correctly. Each of you files and e-verifies on incometax.gov.in.`,
  }
];
