# Wave 4 Validation Plan: Users + CAs

## Why

The platform is only useful if normal Indian salaried users can file without tax vocabulary and if CAs trust the calculations, proof prompts, and routing decisions.

## Usability Study

Recruit 8 users:

- 4 salaried first-time or low-confidence filers.
- 2 job-change users with two Form 16s.
- 1 investor with mutual funds.
- 1 senior citizen or family member filing for a senior.

Tasks:

1. Upload or manually enter Form 16 data.
2. Understand the Savings Coach questions.
3. Compare old vs new regime.
4. Use the free companion guide with the Income Tax portal open.
5. Explain, in their own words, what value they will enter on one portal screen.
6. Find where to e-verify after submission.

Success metrics:

- 7/8 users can explain the refund/payable estimate is not guaranteed.
- 7/8 users can find the correct portal field with the companion.
- 6/8 users can identify at least one deduction proof requirement.
- No user believes LastMinute ITR submits the return automatically.

## CA Interview Script

Recruit 5 CAs:

- 2 salaried-return specialists.
- 1 capital-gains-heavy practitioner.
- 1 small-business/44AD/44ADA practitioner.
- 1 reviewer for notices and mismatches.

Questions:

1. Which Savings Coach questions feel like what you ask clients?
2. Which questions are risky or too suggestive?
3. What proof must the user keep for each major deduction?
4. Which ITR-2/3 cases must be escalated to a human?
5. Does the portal companion screen order match how you file?
6. What would make you trust the JSON export?

## Output

- Update the Savings Coach question bank.
- Update SOPs under `docs/sop/`.
- Add failing fixtures before engine changes.
- Mark any unsafe AI extraction path as disabled until reviewed.
