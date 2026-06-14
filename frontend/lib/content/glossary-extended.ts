/** Enriched glossary content for top commercial-intent terms (P2-2). */
export interface GlossaryExtendedFields {
  extendedBody: string;
  relatedSlugs: string[];
  learnSlug?: string;
  category: string;
}

export const GLOSSARY_EXTENDED: Record<string, GlossaryExtendedFields> = {
  "section-80c": {
    category: "deductions",
    learnSlug: "80c-deduction-guide",
    relatedSlugs: ["section-80ccd-2", "opt-out-of-new-tax-regime", "old-tax-regime"],
    extendedBody: `## What Section 80C covers

Section 80C lets you reduce **taxable income** (not tax directly) by up to **₹1.5 lakh** in the **old tax regime**. Common qualifying payments and investments include:

- Employee Provident Fund (EPF) — employer + employee contribution shown in Form 16
- Public Provident Fund (PPF), ELSS mutual funds, NSC, tax-saving FDs (5-year lock-in)
- Life insurance premiums (LIC) for self, spouse, children
- Tuition fees for up to two children
- Principal repayment on home loan (not interest — that is separate under 24(b))
- Sukanya Samriddhi, SCSS for seniors within limits

The **₹1.5 lakh cap is combined** across all 80C avenues. You cannot claim ₹1.5L on ELSS and another ₹1.5L on PPF — the total deduction is capped.

## Who benefits most

Salaried employees with steady EPF contributions often have ₹50,000–₹1 lakh "automatic" 80C before they buy any ELSS. Add PPF or ELSS to reach the cap if you are in the **old regime** and rent/HRA or 80D also apply — old regime often beats new regime when total Chapter VI-A exceeds roughly ₹1.5–2 lakh.

**New tax regime filers:** 80C is generally **not available** (except limited cases like employer NPS under 80CCD(2)). Do not enter 80C amounts expecting tax savings if you filed under new regime.

## How it appears in ITR

In ITR-1/2, Schedule VI-A captures 80C. Form 16 Part B may show "Chapter VI-A" deductions your employer considered for TDS — verify against your actual investments. AIS does not replace proof — keep receipts, statements, and certificates for seven years.

## Common mistakes

1. **Claiming expired or non-qualifying products** — regular mutual funds (non-ELSS) do not qualify.
2. **Double counting EPF** — if Form 16 already reduced taxable salary via EPF, do not claim the same amount again in VI-A unless the return schedule expects gross salary entry (follow form instructions).
3. **Choosing old regime only for 80C** without running numbers — if 80C + 80D + HRA total is small, new regime with higher standard deduction and 87A rebate may still win.
4. **Ignoring 80CCD(1B)** — an extra ₹50,000 NPS deduction is separate from the 80C cap.

## Worked example (old regime, simplified)

Taxable salary after standard deduction: ₹9,00,000. 80C claimed: ₹1,50,000 (full cap). Taxable income drops to ₹7,50,000 — slab savings depend on marginal rate (often 20% band for mid-income salaried).

Compare with new regime on the same gross numbers before locking regime — use a side-by-side calculator rather than assuming 80C always wins.`,
  },
  "rebate-u-s-87a": {
    category: "regime",
    learnSlug: "87a-rebate-new-regime",
    relatedSlugs: ["new-tax-regime", "tax-on-total-income", "health-education-cess"],
    extendedBody: `## Rebate vs deduction

**Section 87A** reduces your **income tax liability** after slabs are applied — it is a **rebate on tax**, not a reduction of taxable income. That differs from [Section 80C](/glossary/section-80c), which shrinks taxable income before slabs run.

For **AY 2026-27**, enhanced rebate rules under the **new tax regime** have made zero-tax outcomes common for middle-income salaried filers when **taxable income** stays within notified limits (widely cited up to **₹12 lakh** taxable income under recent budget cycles — always confirm the year's Finance Act).

## Old vs new regime rebate

| Regime | Typical rebate story (check current law) |
| Old | Up to ₹12,500 rebate when taxable income ≤ ₹5 lakh (legacy threshold) |
| New | Enhanced rebate — can zero out tax for higher taxable incomes than old 87A |

Rebate does **not** apply to surcharge in all cases — read the year's section text. **Health and education cess** (4%) applies on tax after rebate in the normal computation chain.

## Who should understand 87A

Every salaried employee comparing **old vs new regime** should model 87A in both columns. A filer with ₹11 lakh taxable income in new regime might pay **zero tax** after rebate, while old regime with modest 80C could still show payable tax — or vice versa if deductions are large.

## How it flows in your return

1. Compute **total income** (all heads minus deductions allowed in chosen regime)
2. Apply slab rates → **tax on total income**
3. Subtract **rebate u/s 87A** (if eligible)
4. Add surcharge if applicable
5. Add **4% cess** on tax + surcharge
6. Subtract TDS and advance tax → payable or refund

## Common mistakes

1. **Confusing taxable income with gross salary** — rebate thresholds use taxable income after standard deduction and permitted deductions.
2. **Assuming rebate means no filing** — you may still need to file to claim TDS refund or report AIS income even when net tax is zero.
3. **Ignoring other income** — FD interest or capital gains can push taxable income above rebate limits.
4. **Forgetting cess** — rebate reduces tax before cess; cess is still calculated on the post-rebate tax amount.

## Practical tip

Run regime comparison with your actual Form 16 Part B, rent proofs, and AIS interest lines. Rebates change with Union Budget — do not reuse last year's Excel without updating thresholds.`,
  },
  "old-tax-regime": {
    category: "regime",
    learnSlug: "old-vs-new-regime",
    relatedSlugs: ["new-tax-regime", "section-80c", "opt-out-of-new-tax-regime"],
    extendedBody: `## What the old tax regime is

The **old tax regime** uses higher nominal slab rates but allows most **Chapter VI-A deductions** and **exemptions** that the new regime removed or restricted. For many salaried renters with large 80C, 80D, and HRA benefit, old regime still produces lower **net tax payable**.

You must **actively choose** old regime in recent years because **new regime is the default** for many individuals unless you opt out (via employer for TDS or at filing).

## Key features for salaried employees

- **[Standard deduction](/glossary/standard-deduction-u-s-16-ia)** on salary: ₹50,000 (AY 2026-27 per current law)
- **HRA exemption** under Section 10(13A) when rent paid and proofs submitted
- **LTA, professional tax** u/s 16(iii), leave encashment rules as applicable
- Full **80C, 80D, 80G, 80CCD(1B)**, home loan interest (24(b)) within caps
- **[Rebate u/s 87A](/glossary/rebate-u-s-87a)** at older thresholds

## Who typically wins on old regime

| Profile | Why old regime helps |
| Rent + HRA proofs | Exemption can be ₹1–2 lakh+ annually |
| High 80C + 80D | Combined VI-A above ₹2 lakh |
| Home loan interest (self-occupied) | Up to ₹2 lakh u/s 24(b) in old regime |
| Senior with high 80D for parents | Parent health premiums at higher limits |

## How to opt in

1. **During year:** Inform employer for correct TDS (if they support regime choice)
2. **At filing:** Select old regime in ITR if not already opted via employer — see [opt out of new tax regime](/glossary/opt-out-of-new-tax-regime) (choosing old is the opt-out of default new)

Mismatch between employer TDS regime and filing regime can cause payable/refund surprises — reconcile before e-verify.

## Common mistakes

1. Picking old regime by habit without calculation
2. Claiming HRA without landlord PAN when rent > ₹1 lakh/year
3. Missing **standard deduction** already embedded in Form 16 vs gross entry errors
4. Forgetting new regime may be better when deductions are small and salary is under rebate limits

## Decision rule

If total old-regime benefits (HRA + 80C + 80D + 24(b) + others) exceed roughly **₹1.5–2 lakh** in tax saved vs new regime slabs, old regime is often worth it — but **always compute both sides** with your numbers.`,
  },
  "new-tax-regime": {
    category: "regime",
    learnSlug: "new-regime-slabs-2026",
    relatedSlugs: ["old-tax-regime", "rebate-u-s-87a", "standard-deduction-u-s-16-ia"],
    extendedBody: `## Default regime for many filers

From FY 2023-24 onward, **new tax regime** is the **default** for many individuals unless they opt out. For **AY 2026-27**, it features **lower slab rates**, higher **[standard deduction on salary](/glossary/standard-deduction-u-s-16-ia) (₹75,000)**, and limited deductions — plus an enhanced **[rebate u/s 87A](/glossary/rebate-u-s-87a)** for middle incomes.

## Slab philosophy

New regime trades **deductions for lower rates**. Most Chapter VI-A items (80C, 80D, HRA exemption) are **not available**. Exceptions exist — e.g. **[employer NPS 80CCD(2)](/glossary/section-80ccd-2)** may still help within limits.

## Who benefits without heavy deductions

- Salaried employees with **no rent/HRA** claims
- Filers with **low 80C** (EPF only, no extra investments)
- Middle incomes where **87A rebate zeros tax** in new regime
- Pensioners with simple income and no large VI-A

## Standard deduction advantage

Salaried employees and pensioners get **₹75,000 standard deduction** under new regime vs ₹50,000 in old — a ₹25,000 extra reduction before slabs, which matters at the 20% marginal band.

## Common mistakes

1. **Assuming new regime is always better** because of marketing around 87A
2. **Entering 80C in return** while on new regime — ignored or causes confusion
3. **Employer TDS on old regime** while filing new — large payable at filing
4. **Ignoring AIS interest** — rebate does not remove reporting obligation

## Switching regimes

You can generally choose each year (subject to business income rules). Communicate to employer for TDS alignment. See [opt out of new tax regime](/glossary/opt-out-of-new-tax-regime) when old regime saves more.

## Compare before commit

Use side-by-side **net payable** from the same gross salary, FD interest, and capital gains. LastMinute ITR compares regimes from your imported Form 16 and AIS before you lock filing choices.

## Pension and family pension

Pension from employer is taxed as **salary** in most cases. **Family pension** received by dependents follows different rules — deduction is ₹15,000 or one-third of pension (per current law), not the salary standard deduction. Misclassifying family pension as salary causes wrong slab and deduction treatment.

## Perquisites and ESOP

Form 16 Part B may include **perquisites** (car, accommodation, ESOP taxable value). These are part of gross salary even if not visible in monthly bank credits. AIS may show additional perquisite lines — reconcile before filing.

## Year-end bonus and arrears

Bonus paid in March or **arrear salary** may appear only on one Form 16. Include in salary schedule for the year received. Relief u/s 89 may apply for arrears — separate calculation on portal for large arrear years.`,
  },
  "standard-deduction-u-s-16-ia": {
    category: "income",
    learnSlug: "form-16-guide",
    relatedSlugs: ["salary-income", "old-tax-regime", "new-tax-regime"],
    extendedBody: `## Flat deduction on salary

**Standard deduction u/s 16(ia)** is a **flat reduction from salary income** before tax — you do not need receipts. It replaced the older transport allowance + medical reimbursement structure for most salaried employees.

## Amount by regime (AY 2026-27)

| Regime | Standard deduction on salary |
| Old | ₹50,000 |
| New | ₹75,000 |

Pensioners receiving family pension have a **different** deduction (₹15,000 or one-third of pension) — do not confuse with salary standard deduction.

## Where you see it

- **Form 16 Part B** — often embedded in "Taxable salary" after exemptions
- **ITR salary schedule** — enter gross components, then deduction u/s 16(ia) per form
- **AIS** — may not show standard deduction explicitly; reconcile with Form 16

## Interaction with other u/s 16 deductions

Section 16 also covers:

- **Entertainment allowance** (government employees, limited)
- **[Professional tax](/glossary/professional-tax-u-s-16-iii)** — state tax on employment, fully deductible

Standard deduction is **separate** from HRA exemption (which sits in Section 10, not 16).

## Common mistakes

1. **Double subtracting** — if Form 16 already shows net taxable salary, do not subtract ₹50k/₹75k again in ITR unless the form requires gross entry
2. **Wrong regime amount** — ₹75k only in **new** regime; old uses ₹50k
3. **Claiming on business income** — standard deduction u/s 16(ia) is for **salary**, not professional fees
4. **Missing in regime comparison** — comparing regimes without updating standard deduction amount biases results

## Why it matters for regime choice

The **₹25,000 extra** standard deduction in new regime (vs old) is worth up to **₹5,000–₹7,500** tax saved at 20–30% marginal rates — often tipping filers with **no HRA** toward new regime even before 87A rebate.

## Form 16 vs ITR entry modes

Some filers enter **gross salary** in ITR and apply u/s 16 manually; others enter figures exactly as Form 16 Part B "Income chargeable under salaries". Pick one consistent method — mixing gross from payslips with net from Form 16 double-counts or under-reports.

## Multiple employers

Each employer applies standard deduction in their TDS logic independently. In ITR you report **combined** salary once — standard deduction is applied on the consolidated salary schedule, not twice per Form 16.

## Audit and proof

No receipt is required for standard deduction itself. Keep Form 16 and salary slips for gross component verification if ITD asks during scrutiny.`,
  },
  "salary-income": {
    category: "income",
    learnSlug: "itr-1-salaried-guide",
    relatedSlugs: ["tds-schedule", "exempt-allowances-u-s-10", "standard-deduction-u-s-16-ia"],
    extendedBody: `## What counts as salary income

**Salary income** in ITR includes wages, pension (as salary), bonuses, commissions, perquisites, and taxable allowances — minus exemptions under Section 10 and deductions u/s 16.

Form 16 Part B is the primary source for salaried employees. AIS salary/TDS lines should **match** Part A quarterly TDS.

## Building taxable salary

Typical flow:

1. **Gross salary** — basic + allowances + perquisites
2. Minus **exempt allowances u/s 10** — HRA, LTA (if exempt), others
3. Minus **deductions u/s 16** — [standard deduction](/glossary/standard-deduction-u-s-16-ia), professional tax
4. Result = **income chargeable under salaries**

## Multiple employers

If you changed jobs, combine **both Form 16s**. Each employer taxed you independently — combined income may push you into higher slab, creating **[tax payable](/glossary/tax-payable)** even when each Form 16 shows zero balance.

## Common components

| Component | Usually |
| Basic salary | Taxable; base for HRA and 80CCD(2) limits |
| HRA | Exempt portion in old regime if proofs OK |
| Special allowance | Often taxable unless specifically exempt |
| Employer PF | May appear in 80C, reduces taxable salary in Form 16 |

## AIS and mismatches

AIS Part A shows **TDS on salary** by deductor. If previous employer TDS appears in AIS but not current Form 16, you still must report that salary — see [two Form 16 job change guide](/learn/two-form-16-job-change).

## Common mistakes

1. Reporting only net salary from bank credits (misses perquisites)
2. Ignoring **standard deduction** regime difference
3. Forgetting **arrear salary** or bonus in a different year
4. Wrong form — salary + large capital gains needs ITR-2, not ITR-1

## Filing tip

Import Form 16 first, then reconcile AIS salary lines before regime comparison. Salary is the anchor for TDS credits in [TDS schedule](/glossary/tds-schedule).

## Director salary and RSUs

If you are a **director** or receive **RSUs/ESOP**, Form 16 and AIS may show additional perquisite lines. These belong in salary until exempted under specific rules — capital gains on sale of allotted shares is separate on Schedule CG.`,
  },
  "tds-schedule": {
    category: "schedules",
    learnSlug: "ais-vs-26as",
    relatedSlugs: ["advance-self-assessment-tax", "refund", "salary-income"],
    extendedBody: `## What the TDS schedule does

The **TDS schedule** in your ITR lists **tax already deducted at source** — by employer (Form 16), banks (Form 16A), tenants, brokers, and clients. Credits here reduce your final **[tax payable](/glossary/tax-payable)** or create a **[refund](/glossary/refund)**.

ITD matches your claimed TDS against **Form 26AS** / AIS. Mismatches delay refunds or trigger notices.

## Sources of TDS credits

| Deductor | Document | ITR field |
| Employer | Form 16 Part A | Salary TDS |
| Bank | Form 16A / AIS | Interest TDS |
| Broker | AIS / 16A | Securities TDS |
| Tenant | Form 16C / AIS | Rent TDS |

## 26AS vs what you claim

**Form 26AS** is the consolidated tax credit statement. Every rupee of TDS you claim should appear in 26AS with matching **amount** and **deductor PAN**. If Form 16 shows TDS but 26AS does not:

1. Ask deductor to file corrected TDS return
2. Do not claim credit until reflected (or file with mismatch explanation if rules allow)

AIS may show additional TDS lines not on Form 16 — still verify before claiming.

## Advance tax vs TDS

TDS is deducted by others. **[Advance/self-assessment tax](/glossary/advance-self-assessment-tax)** is tax you paid directly via challan — captured in Schedule IT, not mixed into TDS schedule.

## Common mistakes

1. **Claiming TDS not in 26AS** — refund rejection
2. **Wrong deductor PAN** — credit mismatch
3. **Double counting** — same TDS in salary schedule and TDS schedule incorrectly
4. **Ignoring TDS on FD** when interest is exempt for seniors (80TTB) — TDS still claimed as credit

## Reconciliation workflow

1. Download Form 26AS for the financial year
2. Match Form 16 Part A quarterly totals
3. Match AIS Part A TDS entries
4. Enter only verified credits before e-verify

LastMinute ITR flags AIS vs Form 16 TDS gaps before you reach the government portal.`,
  },
  "section-80d": {
    category: "deductions",
    learnSlug: "80c-deduction-guide",
    relatedSlugs: ["section-80c", "old-tax-regime", "section-80u"],
    extendedBody: `## Health insurance deduction

**Section 80D** allows deduction for **health insurance premiums** and certain medical expenditures. Limits depend on **who is covered** and **age** (self/family vs parents, senior parents).

Available in **old tax regime** for most filers — **not** in new regime (except specific cases per current law).

## Typical limits (verify annually)

| Scenario | Indicative cap |
| Self + family (non-senior) | Up to ₹25,000 |
| Parents (non-senior) | Additional up to ₹25,000 |
| Senior citizen (self or parents) | Higher limits (₹50,000 bands) |

Preventive health check-up: small sub-limit (₹5,000) within overall 80D caps.

## What qualifies

- Medical insurance premium paid for self, spouse, children, parents
- Central Government Health Scheme contributions where applicable
- Expenditure on senior citizen health when no insurance (subject to conditions)

**Life insurance** is **80C**, not 80D.

## Proof and ITR

Keep premium receipts and policy copies. Enter in Schedule VI-A. Employer may not know your parent policy — you claim at filing even if not in Form 16.

## Common mistakes

1. Claiming 80D in **new regime** expecting savings
2. Exceeding combined caps across multiple policies
3. Confusing **80D** with **80DD/80U** (disability deductions)
4. Cash payments where not allowed — check current rules for payment mode

## Pairing with 80C

High earners with rent often stack **80C + 80D + HRA** — this combination is why old regime wins for many families. Model both regimes when parent premiums are ₹30,000+ annually.

## Senior parents

When parents are **senior citizens**, higher 80D sub-limits apply for their policy premiums. You can claim for parents even if they are not dependents in your household — payment from your account is typical proof.

## Medical expenditure path

For very senior parents without health insurance, expenditure route may apply within caps (subject to conditions in the year's law). Insurance premium route is cleaner when policies are active.

## New regime reminder

80D does not reduce tax in **new regime** for typical salaried filers. Buying family floater policies in December only helps if you file **old regime** and premiums are paid in the financial year.`,
  },
  "section-80ttb": {
    category: "deductions",
    learnSlug: "senior-citizen-80ttb",
    relatedSlugs: ["section-80tta", "other-sources-income", "old-tax-regime"],
    extendedBody: `## Interest deduction for seniors

**Section 80TTB** allows **resident senior citizens** (age 60+) a deduction on **interest income** from deposits — savings, FD, recurring deposits — up to **₹50,000** per year.

Younger filers use **[Section 80TTA](/glossary/section-80tta)** (savings interest only, ₹10,000 cap) instead.

## What income counts

- Bank savings interest
- Fixed deposit interest
- Post office interest
- Cooperative bank interest

**Dividends** and **capital gains** are **not** 80TTB — they go to other schedules.

## Old vs new regime

80TTB is generally available in **both** old and new regimes for eligible seniors (confirm year's law). Still valuable when FD interest is ₹2–4 lakh and TDS was deducted at 10%.

## Interaction with TDS

Banks deduct TDS on FD interest even when you submit Form 15H. You:

1. Report full interest in **[other sources](/glossary/other-sources-income)**
2. Claim 80TTB deduction up to cap
3. Claim TDS credit in **[TDS schedule](/glossary/tds-schedule)**

## Common mistakes

1. **Not reporting FD interest** because TDS was zero (15G/15H)
2. Confusing 80TTB with 80TTA (wrong age band)
3. Missing interest in **AIS** — notice risk even with deduction
4. Super senior (80+) still needs correct age in profile for slab + 80TTB

## Senior filing tip

Download AIS and match every interest line. Enter 80TTB in VI-A. LastMinute ITR senior mode highlights 80TTB when age band is senior or super senior.

## Co-operative bank and post office

Interest from **post office deposits** and cooperative banks counts toward 80TTB — not only commercial bank FDs. Include all certificates in your folder.

## Joint accounts

Interest credited to joint account is taxed in the hands of owners per IT rules — report your share correctly. AIS may show full interest against one PAN; align with bank interest certificate.

## 80TTB vs 80TTA

You cannot claim both 80TTA and 80TTB on the same interest line. Seniors use **80TTB only** (broader coverage, higher cap). Younger family members on joint FD may use 80TTA on their share if applicable.`,
  },
  "opt-out-of-new-tax-regime": {
    category: "regime",
    learnSlug: "old-vs-new-regime",
    relatedSlugs: ["old-tax-regime", "new-tax-regime", "section-80c"],
    extendedBody: `## Choosing old regime (opting out of default new)

**New tax regime is the default** for many individuals. **Opting out** means you choose the **old tax regime** with higher slabs but full deductions (80C, 80D, HRA, etc.).

The label "opt out of new tax regime" in engine maps means: **I want old regime benefits**.

## When to opt out

Opt out (choose old) when:

- HRA exemption saves more than new regime slab advantage
- Combined 80C + 80D + home loan interest exceeds ~₹1.5–2 lakh in tax value
- You already paid TDS under old regime via employer

Stay in new regime when:

- Little or no rent/HRA
- Minimal 80C beyond mandatory EPF
- Taxable income qualifies for full **[87A rebate](/glossary/rebate-u-s-87a)** in new regime

## Employer vs filing

| Timing | Action |
| During FY | Tell employer for correct monthly TDS |
| At filing | Select regime in ITR if business rules allow switch |

Mismatch creates payable or refund surprises at filing — reconcile Form 16 with chosen regime.

## Business income caveat

Individuals with business/profession income may face **one-time or locked** regime choices under current law — salaried-only filers usually have annual flexibility. Verify if you have Schedule BP income.

## Common mistakes

1. Opting out without calculating — losing new regime 87A benefit
2. Employer still deducting TDS on new regime while you file old
3. Claiming HRA in return while on new regime
4. Assuming opt-out is permanent for all future years

## Practical workflow

1. Import Form 16 and AIS
2. Run **old vs new** comparison on same income
3. If old wins, opt out (employer + ITR)
4. Re-run computation before payment and e-verify

## Documentation habit

Save a one-page **regime comparison** PDF each year — slabs and rebate rules change in Budget. Your opt-out decision should be traceable if employer TDS and filing regime differ.

## When new regime wins despite 80C

    If EPF already gives ₹1 lakh 80C and you have **no rent**, new regime with ₹75k standard deduction plus **87A rebate** may still produce lower tax on ₹8–12 lakh taxable income — run numbers before automatically opting out.`,
  },
  pan: {
    category: "identity",
    learnSlug: "last-minute-filing",
    relatedSlugs: ["date-of-birth", "tds-schedule"],
    extendedBody: `## What PAN is used for in ITR

Your **Permanent Account Number (PAN)** links every tax document — Form 16, AIS, 26AS, and bank TDS — to one identity on incometax.gov.in. LastMinute ITR does not need your PAN to show estimates, but the **government portal requires PAN login** before you submit.

## When you enter PAN

We defer PAN collection until export/payment where possible. You always enter PAN yourself on **incometax.gov.in** for filing and e-verify — we never auto-submit returns.

## Common mistakes

1. **PAN typo** — mismatched AIS and refund delays
2. **Not linking Aadhaar** — e-verify via Aadhaar OTP needs linkage
3. **Using spouse PAN on joint FD interest** — interest is taxed in the earner's return

Keep PAN card handy with Form 16 Part A (TAN and employer PAN appear there too).`,
  },
  "gross-total-income": {
    category: "income",
    learnSlug: "itr-1-salaried-guide",
    relatedSlugs: ["salary-income", "other-sources-income"],
    extendedBody: `## Definition

**Gross total income (GTI)** is the sum of income under all heads **before** Chapter VI-A deductions and before loss set-off limits. It drives slab placement, surcharge thresholds, and rebate eligibility.

## Heads that feed GTI

| Head | Typical salaried source |
| Salary | Form 16 taxable salary after exemptions |
| House property | Rent minus standard deduction or self-occupied loss |
| Other sources | Bank FD interest, family pension |
| Capital gains | Separate schedules if applicable (ITR-2+) |

## Why it matters for last-minute filers

Underestimating GTI by skipping AIS interest lines is a top notice trigger. Overestimating by double-counting Form 16 gross vs taxable salary breaks TDS reconciliation.

After GTI, old-regime filers subtract 80C/80D etc. to reach **total income** for slab rates.`,
  },
  "professional-tax-u-s-16-iii": {
    category: "salary",
    learnSlug: "form-16-guide",
    relatedSlugs: ["salary-income", "standard-deduction-u-s-16-ia"],
    extendedBody: `## What it is

**Professional tax** is a state-level tax on employment income, deducted by employers in states like Maharashtra, Karnataka, and West Bengal. Section **16(iii)** allows it as a deduction from **salary income** when computing taxable salary.

## Where you see it

Form 16 Part B often lists professional tax as a deduction from gross salary. Amounts vary by state (commonly ₹200–₹2,500 per year for salaried employees).

## Filing tip

Do not claim professional tax again in Chapter VI-A — it is already netted in salary computation. If Form 16 omits it but your payslip shows deduction, enter taxable salary consistent with Part B totals.

## Common mistakes

1. Adding professional tax to 80C bucket
2. Ignoring it when reconstructing salary from payslips without Form 16
3. Claiming for states where you were not liable`,
  },
  "filing-confidence": {
    category: "process",
    learnSlug: "last-minute-filing",
    relatedSlugs: ["pan", "tds-schedule"],
    extendedBody: `## Filing-readiness vs refund estimate

**Filing-readiness** means your documents, income heads, and mismatches are complete enough to copy figures to incometax.gov.in with confidence. It is **not** a guarantee of refund or zero tax.

LastMinute ITR shows a **completeness percentage** based on uploaded docs (Form 16, AIS, 26AS) and resolved mismatches. Estimate mode caps readiness until you switch to exact mode with full documents.

## Typical readiness checklist

- Form 16 from every employer
- AIS downloaded and reconciled
- Regime chosen with comparison saved
- Payable tax paid if computation shows due
- Bank account validated for refunds

Aim for filing-ready status **before** paying to unlock the portal companion — not the other way around.`,
  },
};
