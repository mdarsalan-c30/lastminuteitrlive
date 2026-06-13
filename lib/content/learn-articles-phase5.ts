/**
 * Phase 5 backlog learn articles — first 10 titles from the "Next 50 backlog"
 * in docs/SEO_BLOG_ROADMAP.md. Companion lens only: we help you prepare and
 * reconcile, you file on incometax.gov.in. No guaranteed-refund / auto-file claims.
 */
export const PHASE5_LEARN_ARTICLES = [
  {
    slug: "section-80d-health-insurance",
    title: "Section 80D: health insurance deduction explained",
    description:
      "How much health insurance premium you can deduct under 80D for self, family, and parents — limits, preventive check-ups, and what proof to keep.",
    readMinutes: 6,
    publishedAt: "2026-06-12",
    cluster: "deductions",
    tags: ["80D", "health insurance", "deductions", "old regime"],
    relatedGlossarySlugs: ["section-80d", "section-80c"],
    faqs: [
      {
        question: "Is 80D available in the new regime?",
        answer:
          "No. Section 80D health insurance deduction is an old-regime benefit. If you opt for the new regime, you cannot claim it, so compare both regimes on your numbers first.",
      },
    ],
    body: `## What Section 80D covers

[Section 80D](/glossary/section-80d) lets you deduct health insurance premiums (and limited preventive check-up and senior medical costs) from taxable income — but only under the **old regime**.

This is not tax advice — confirm current limits for AY 2026-27 on incometax.gov.in.

## The limits in plain numbers

| Who is insured | Maximum deduction |
| Self + spouse + children (all under 60) | ₹25,000 |
| Add parents (under 60) | + ₹25,000 |
| Add parents (senior, 60+) | + ₹50,000 |

Within these caps, **preventive health check-ups** are allowed up to ₹5,000. For senior citizens without a policy, certain medical expenditure can also qualify.

## What you should do

1. List premiums actually paid in the financial year — not the policy value
2. Separate **your family** premium from **parents'** premium (different caps)
3. Keep payment proof and the insurer certificate
4. Remember 80D adds to your old-regime case — run [old vs new regime](/learn/old-vs-new-regime) before claiming
5. Enter it in the deductions step in [LastMinute ITR](/file/import/documents?source=form16), then verify before the portal

## Common mistake

**Paying the parents' premium in cash.** Cash premiums are not eligible under 80D (preventive check-ups are the narrow exception). Pay digitally so the deduction holds.

Another: **claiming 80D in the new regime** — it gives zero benefit and just wastes review time.

## Related guides

- [80C deduction guide](/learn/80c-deduction-guide)
- [Old vs new regime](/learn/old-vs-new-regime)
- [How to file ITR without a CA](/learn/file-itr-without-ca)

[Check your deductions with LastMinute](/file) — then file on incometax.gov.in.`,
  },
  {
    slug: "section-80gg-rent-without-hra",
    title: "Section 80GG: claim rent when you get no HRA",
    description:
      "No HRA in your salary but you pay rent? Section 80GG may help. Here are the conditions, the formula, and Form 10BA you must file on the portal.",
    readMinutes: 6,
    publishedAt: "2026-06-12",
    cluster: "deductions",
    tags: ["80GG", "rent", "HRA", "deductions"],
    relatedGlossarySlugs: ["section-80gg", "standard-deduction-u-s-16-ia"],
    faqs: [
      {
        question: "Can I claim both HRA and 80GG?",
        answer:
          "No. Section 80GG is only for people who do not receive HRA. If your salary includes HRA, claim the HRA exemption instead and not 80GG.",
      },
    ],
    body: `## When 80GG applies

[Section 80GG](/glossary/section-80gg) is for taxpayers who **pay rent but receive no [HRA](/learn/hra-exemption-itr)** — common for freelancers, business owners, or salaried staff whose package has no HRA component. It is an **old-regime** deduction.

## The conditions

- You (or your spouse/minor child) do **not** own a house in the city where you live and work
- You actually pay rent for accommodation you occupy
- You file **Form 10BA** (a declaration) on incometax.gov.in

## The deduction formula — least of three

1. ₹5,000 per month (₹60,000 a year)
2. 25% of total income (before this deduction)
3. Rent paid minus 10% of total income

You get the **smallest** of these three.

## What you should do

1. Confirm your salary has **no HRA** (check Form 16 Part B) — if it does, use [HRA exemption](/learn/hra-exemption-itr) instead
2. Total your annual rent paid with proof
3. File **Form 10BA** on the portal before claiming
4. Run [old vs new regime](/learn/old-vs-new-regime) — 80GG only helps in old regime
5. Use [LastMinute ITR](/file/import/documents?source=form16) to draft the figures, then verify

## Common mistake

**Forgetting Form 10BA.** The deduction can be disallowed if the declaration is not filed. Submit it on incometax.gov.in in the same session.

## Related guides

- [HRA exemption in ITR](/learn/hra-exemption-itr)
- [80C deduction guide](/learn/80c-deduction-guide)
- [Old vs new regime](/learn/old-vs-new-regime)

[Estimate your tax with LastMinute](/file) — you file the final return on incometax.gov.in.`,
  },
  {
    slug: "home-loan-interest-section-24b",
    title: "Home loan interest under Section 24(b)",
    description:
      "Deduct home loan interest up to ₹2 lakh on a self-occupied house under the old regime. Self-occupied vs let-out rules, and how it interacts with 80C principal.",
    readMinutes: 6,
    publishedAt: "2026-06-12",
    cluster: "deductions",
    tags: ["24b", "home loan", "house property", "deductions"],
    relatedGlossarySlugs: ["home-loan-interest-u-s-24-b", "section-80c"],
    faqs: [
      {
        question: "Is home loan interest allowed in the new regime?",
        answer:
          "For a self-occupied house, the Section 24(b) interest set-off is an old-regime benefit. For a let-out property the treatment differs — compare regimes before deciding.",
      },
    ],
    body: `## Two parts of a home loan EMI

Your EMI has **principal** and **interest**. They are claimed under different sections:

- **Interest** → [Section 24(b)](/glossary/home-loan-interest-u-s-24-b)
- **Principal** → [Section 80C](/glossary/section-80c) (within the ₹1.5 lakh bundle)

## Section 24(b) limits

| Property type | Interest cap |
| Self-occupied | ₹2,00,000 per year |
| Let-out | Actual interest (loss set-off capped at ₹2L against other heads) |

This sits in the **house property** head. For a self-occupied home it is an **old-regime** benefit.

## What you should do

1. Get the **interest certificate** from your lender (splits principal vs interest)
2. Put interest under house property [Section 24(b)](/glossary/home-loan-interest-u-s-24-b); principal under [80C](/glossary/section-80c)
3. If the house is let out, also report rent — see [let-out vs self-occupied basics](/learn/itr-1-vs-itr-2)
4. Compare [old vs new regime](/learn/old-vs-new-regime) — heavy interest often favours old regime
5. Draft it in [LastMinute ITR](/file/import/documents?source=form16) and verify before the portal

## Common mistake

**Claiming the full EMI as interest.** Only the interest component qualifies under 24(b); principal goes to 80C and shares the ₹1.5L cap with other investments.

## Related guides

- [80C deduction guide](/learn/80c-deduction-guide)
- [Old vs new regime](/learn/old-vs-new-regime)
- [ITR-1 vs ITR-2](/learn/itr-1-vs-itr-2)

[Check your housing deductions with LastMinute](/file) — file on incometax.gov.in.`,
  },
  {
    slug: "nps-80ccd-1b-vs-80ccd-2",
    title: "NPS deductions: 80CCD(1B) vs employer 80CCD(2)",
    description:
      "The extra ₹50,000 NPS deduction under 80CCD(1B) and the employer NPS deduction under 80CCD(2) — what differs, and which survives in the new regime.",
    readMinutes: 6,
    publishedAt: "2026-06-12",
    cluster: "deductions",
    tags: ["NPS", "80CCD", "deductions", "new regime"],
    relatedGlossarySlugs: ["section-80ccd-2", "section-80c"],
    faqs: [
      {
        question: "Does NPS work in the new regime?",
        answer:
          "The employer contribution under 80CCD(2) is generally allowed in both regimes within limits. The self contribution under 80CCD(1B) is an old-regime benefit. Confirm current limits before claiming.",
      },
    ],
    body: `## Three NPS buckets, three rules

- **80CCD(1)** — your own NPS within the ₹1.5 lakh [80C](/glossary/section-80c) pool (old regime)
- **80CCD(1B)** — an **extra ₹50,000** for self NPS, over and above 80C (old regime)
- **[80CCD(2)](/glossary/section-80ccd-2)** — your **employer's** NPS contribution, deductible in **both regimes** within limits

## Why this matters in the new regime

Most Chapter VI-A deductions vanish in the new regime — but **employer NPS under 80CCD(2)** usually survives. If your employer offers NPS, this is one of the few deductions that still helps new-regime filers.

## What you should do

1. Check your salary structure for an **employer NPS** component — that is 80CCD(2)
2. Add personal NPS to [80C](/glossary/section-80c) first; use 80CCD(1B) for the extra ₹50,000 (old regime)
3. Keep NPS transaction statements as proof
4. Run [old vs new regime](/learn/old-vs-new-regime) — 80CCD(2) can tilt new regime further in your favour
5. Draft figures in [LastMinute ITR](/file/import/documents?source=form16) and verify

## Common mistake

**Double-counting NPS.** The same contribution cannot sit in both 80C and 80CCD(1B). Use 80CCD(1B) only for amounts beyond the ₹1.5 lakh 80C cap.

## Related guides

- [80C deduction guide](/learn/80c-deduction-guide)
- [Old vs new regime](/learn/old-vs-new-regime)
- [New regime slabs 2026](/learn/new-regime-slabs-2026)

[Compare regimes with LastMinute](/file) — then file on incometax.gov.in.`,
  },
  {
    slug: "lta-exemption-blocked-years",
    title: "LTA exemption and the block-year rule",
    description:
      "Leave Travel Allowance is exempt only for travel within India, twice in a four-year block, with proof. Here is how the block years and carry-over work.",
    readMinutes: 5,
    publishedAt: "2026-06-12",
    cluster: "deductions",
    tags: ["LTA", "exemption", "salary", "old regime"],
    relatedGlossarySlugs: ["exempt-allowances-u-s-10", "standard-deduction-u-s-16-ia"],
    body: `## What LTA actually exempts

Leave Travel Allowance (LTA) exempts the **travel cost** of a domestic trip — not your whole allowance, not hotels or food. It is an [allowance exempt under Section 10](/glossary/exempt-allowances-u-s-10) and applies in the **old regime**.

## The block-year rule

- You can claim LTA exemption for **two journeys** in a block of **four calendar years**
- If you miss a claim in a block, **one** journey can be carried to the first year of the next block
- Only **actual travel within India** counts, with tickets as proof

## What you should do

1. Confirm your employer paid LTA and you actually travelled in India
2. Keep tickets/boarding passes as proof
3. Claim only the eligible travel cost, not the full allowance
4. Remember LTA exemption is **old regime only** — compare with [old vs new regime](/learn/old-vs-new-regime)
5. Reconcile your salary breakup using [Form 16 guide](/learn/form-16-guide)

## Common mistake

**Claiming LTA without travel.** If you did not travel, the LTA received is fully taxable salary. Do not exempt it just because it appears in your package.

## Related guides

- [Form 16 guide](/learn/form-16-guide)
- [HRA exemption in ITR](/learn/hra-exemption-itr)
- [Old vs new regime](/learn/old-vs-new-regime)

[Check your salary exemptions with LastMinute](/file) — file on incometax.gov.in.`,
  },
  {
    slug: "professional-tax-section-16iii",
    title: "Professional tax under Section 16(iii)",
    description:
      "Professional tax deducted by your state is fully deductible from salary under Section 16(iii) — in both regimes. How to find it on Form 16 and claim it.",
    readMinutes: 4,
    publishedAt: "2026-06-12",
    cluster: "deductions",
    tags: ["professional tax", "16iii", "salary", "deductions"],
    relatedGlossarySlugs: ["professional-tax-u-s-16-iii", "standard-deduction-u-s-16-ia"],
    body: `## A small deduction most people miss

[Professional tax under Section 16(iii)](/glossary/professional-tax-u-s-16-iii) is the state tax your employer deducts from salary (states like Maharashtra, Karnataka, West Bengal, Tamil Nadu levy it). It is **fully deductible** from salary income — and unlike most deductions, it applies in **both** the old and new regimes.

State caps are modest (often around ₹2,500 a year), but it is a legitimate, easy deduction.

## What you should do

1. Find the professional tax figure on **Form 16 Part B** or your payslips
2. Enter it under the salary head — it reduces taxable salary directly
3. Because it works in both regimes, claim it regardless of your [regime choice](/learn/old-vs-new-regime)
4. Reconcile the amount with your payslip totals
5. Let [LastMinute ITR](/file/import/documents?source=form16) carry it from your Form 16 draft, then verify

## Common mistake

**Leaving it out because it is small.** It is one of the few deductions that survives in the new regime — there is no reason to skip it.

## Related guides

- [Form 16 guide](/learn/form-16-guide)
- [Old vs new regime](/learn/old-vs-new-regime)
- [How to file ITR without a CA](/learn/file-itr-without-ca)

[Reconcile your salary with LastMinute](/file) — file on incometax.gov.in.`,
  },
  {
    slug: "family-pension-vs-salary-pension",
    title: "Family pension vs salary pension: how each is taxed",
    description:
      "Pension you receive after retirement is salary; pension a family member receives after the pensioner's death is other-source income with a separate deduction.",
    readMinutes: 5,
    publishedAt: "2026-06-12",
    cluster: "salaried",
    tags: ["pension", "family pension", "salary", "other sources"],
    relatedGlossarySlugs: ["other-sources-income", "standard-deduction-u-s-16-ia"],
    body: `## They are taxed under different heads

- **Pension to the retiree** → taxed as **salary**, with the salary [standard deduction](/glossary/standard-deduction-u-s-16-ia) available
- **Family pension** (received by a dependant after the pensioner dies) → taxed under [other sources](/glossary/other-sources-income), with its own deduction (one-third of the pension, subject to a cap)

Getting the head wrong is a common cause of mismatch notices.

## What you should do

1. Identify whether you are the **pensioner** or a **family member** receiving family pension
2. For your own pension, report under salary and take the standard deduction
3. For **family pension**, report under other sources and claim the family-pension deduction
4. Cross-check the amounts against your **AIS** — see [AIS mismatch guide](/learn/ais-mismatch)
5. Draft both correctly in [LastMinute ITR](/file/import/documents?source=form16)

## Common mistake

**Treating family pension as salary** (or vice versa). The deduction and head differ — misclassifying changes your tax and can trigger AIS reconciliation.

## Related guides

- [Senior citizen 80TTB guide](/learn/senior-citizen-80ttb)
- [AIS mismatch](/learn/ais-mismatch)
- [ITR-1 vs ITR-2](/learn/itr-1-vs-itr-2)

[Check your pension entries with LastMinute](/file) — file on incometax.gov.in.`,
  },
  {
    slug: "form-15g-15h-seniors",
    title: "Form 15G and 15H: avoiding TDS on interest",
    description:
      "When you can submit Form 15G (under 60) or 15H (senior) to your bank so it does not deduct TDS on interest — and why you still must report the interest.",
    readMinutes: 5,
    publishedAt: "2026-06-12",
    cluster: "senior",
    tags: ["15G", "15H", "TDS", "senior citizen", "FD interest"],
    relatedGlossarySlugs: ["tds-schedule", "other-sources-income"],
    faqs: [
      {
        question: "If I submitted 15G/15H, do I still report the interest?",
        answer:
          "Yes. Form 15G/15H only stops the bank deducting TDS. The interest is still income — you must report it in your return and pay tax if your slab requires it.",
      },
    ],
    body: `## What 15G and 15H do

If your total income is below the taxable limit, you can ask your bank **not to deduct [TDS](/glossary/tds-schedule)** on interest by submitting:

- **Form 15H** — if you are a **senior citizen** (60+)
- **Form 15G** — if you are **under 60** and eligible

These are self-declarations that your income is below the taxable threshold.

## The catch most people miss

15G/15H stop the **deduction** — they do **not** make the interest tax-free. The interest still appears in your **AIS** and must be reported under [other sources](/glossary/other-sources-income).

## What you should do

1. Submit 15G/15H **only if** your total income is genuinely below the limit
2. Still report all interest in your return — check it against [AIS](/learn/ais-mismatch)
3. Seniors: also look at the [80TTB deduction](/learn/senior-citizen-80ttb) on interest
4. If TDS was wrongly deducted, claim it via the [TDS schedule](/glossary/tds-schedule)
5. Reconcile everything in [LastMinute ITR](/file/import/documents?source=form16) before the portal

## Common mistake

**Submitting 15G/15H when income is actually taxable.** A wrong declaration can attract penalties. Only use it when you are sure income is below the limit.

## Related guides

- [Senior citizen 80TTB guide](/learn/senior-citizen-80ttb)
- [AIS mismatch](/learn/ais-mismatch)
- [Bank FD interest in AIS](/learn/bank-fd-interest-ais)

[Reconcile interest income with LastMinute](/file) — file on incometax.gov.in.`,
  },
  {
    slug: "ais-feedback-step-by-step",
    title: "AIS feedback: how to flag wrong entries step-by-step",
    description:
      "Your AIS shows income that is duplicated, not yours, or wrong? Here is how to submit AIS feedback on incometax.gov.in — and why you still file correct figures.",
    readMinutes: 6,
    publishedAt: "2026-06-12",
    cluster: "ais",
    tags: ["AIS", "feedback", "reconciliation", "26AS"],
    relatedGlossarySlugs: ["other-sources-income", "tds-schedule"],
    body: `## When to give AIS feedback

The [AIS](/learn/ais-mismatch) sometimes shows entries that are **duplicated**, **belong to someone else**, or are **wrongly valued** (for example, gross sale value treated as income). The portal lets you submit **feedback** on each line.

This is not legal advice — verify the current AIS workflow on incometax.gov.in.

## On incometax.gov.in

1. Log in and open **Services → Annual Information Statement (AIS)**
2. Open the **AIS** tile and find the transaction
3. Click the entry and choose **Optional → feedback**, e.g. "Information is duplicate", "Not my information", or "Income is not taxable"
4. Submit and note the **acknowledgement** — keep a screenshot
5. The "modified value" updates, but the **reported** value also stays visible to the department

## What you should do

1. Submit feedback for genuinely wrong lines — keep screenshots
2. **Still file with the correct figures** you can prove; feedback alone does not change your return
3. For shares, report the **gain**, not gross proceeds — see [AIS vs 26AS](/learn/ais-vs-26as)
4. Match TDS lines to your [TDS schedule](/glossary/tds-schedule)
5. Reconcile your draft in [LastMinute ITR](/file/import/documents?source=form16) first

## Common mistake

**Assuming feedback fixes your return.** Feedback corrects the AIS record over time, but your ITR must independently report correct income. Do both.

## Related guides

- [AIS mismatch](/learn/ais-mismatch)
- [AIS vs Form 26AS](/learn/ais-vs-26as)
- [Download AIS](/learn/download-ais)

[Reconcile AIS with LastMinute](/file) — file on incometax.gov.in.`,
  },
  {
    slug: "tds-not-in-26as-employer-fix",
    title: "TDS not showing in 26AS? How to get it fixed",
    description:
      "Your employer or bank deducted TDS but it is missing from Form 26AS. Why this happens, how to get the deductor to correct it, and what to do before filing.",
    readMinutes: 6,
    publishedAt: "2026-06-12",
    cluster: "ais",
    tags: ["26AS", "TDS", "reconciliation", "employer"],
    relatedGlossarySlugs: ["tds-schedule", "other-sources-income"],
    faqs: [
      {
        question: "Can I claim TDS that is not in 26AS?",
        answer:
          "Claiming TDS credit that does not appear in Form 26AS often leads to a mismatch and delayed processing. Get the deductor to correct their TDS return first, then claim the credit.",
      },
    ],
    body: `## Why TDS goes missing from 26AS

[Form 26AS](/learn/ais-vs-26as) shows tax credits only after the **deductor** (employer/bank) files their **TDS return** correctly with your PAN. TDS can be missing because:

- The deductor has not filed the TDS return yet
- They quoted the **wrong PAN**
- They deposited tax but mismatched the challan

## On incometax.gov.in

1. Open **Services → Form 26AS / AIS** and confirm the missing credit
2. Compare with your **Form 16 Part A** or bank TDS certificate
3. If it is missing, the fix sits with the **deductor**, not the portal

## What you should do

1. Contact the **employer/bank** and ask them to revise their TDS return with your correct PAN
2. Keep your **Form 16 Part A** / TDS certificate as evidence
3. Avoid claiming credit not yet in 26AS — it usually causes a [TDS schedule](/glossary/tds-schedule) mismatch and slow processing
4. If the deadline is close, you may file and **revise** later once 26AS updates
5. Track the gap with the reconciliation view in [LastMinute ITR](/file/import/documents?source=form16)

## Common mistake

**Claiming TDS credit before the deductor corrects it.** The department matches your claim to 26AS — an unmatched claim can delay any refund. Fix the source first.

## Related guides

- [AIS vs Form 26AS](/learn/ais-vs-26as)
- [AIS feedback step-by-step](/learn/ais-feedback-step-by-step)
- [Two Form 16s after job change](/learn/two-form-16-job-change)

[Reconcile TDS with LastMinute](/file) — file on incometax.gov.in.`,
  },
];
