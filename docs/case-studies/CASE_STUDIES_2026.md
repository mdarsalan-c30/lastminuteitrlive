# Case Studies 2026 — Persona Walkthroughs & Dummy Inputs

**Date:** June 2026
**Purpose:** Eight concrete taxpayer personas, grounded in recurring qna.tax threads and the ITR landscape, used to (1) pressure-test our screens end-to-end and (2) verify each user pain point is actually addressed on-screen.

All data is fabricated test data. No real PAN/identity is used. We are a companion product — these personas file on `incometax.gov.in` themselves; we never auto-submit.

**Machine-usable fixtures:** [e2e/fixtures/personas.ts](../../e2e/fixtures/personas.ts) (typed `DraftSlice` objects consumed by the tax engine, simulation, and QA). Validated by [lib/filing/__tests__/personas.test.ts](../../lib/filing/__tests__/personas.test.ts).

**Pain-point map:** [../research/USER_PAINPOINTS_2026.md](../research/USER_PAINPOINTS_2026.md)

---

## How each case study is structured

- **Profile & dummy inputs** — masked persona, documents (Form 16 / AIS lines), key figures.
- **Expected journey** — the A–F route the user should take.
- **What the screen must show** — the on-screen proof the pain point is handled.
- **QA result** — filled during the end-to-end run (see [../qa/E2E_RUN_2026.md](../qa/E2E_RUN_2026.md)).

Journey legend (from `lib/filing/journey.ts`): A Get started · B Import · C Reconcile · D Compute & compare · E Review & pay · F File on portal.

---

## CS-1 — Aarav Sharma · Salaried, single Form 16 (happy path)

- **Inputs:** Form 16 from Infotech Solutions — gross ₹12,00,000, TDS ₹85,000. HRA ₹2,40,000, rent ₹3,00,000 (metro). 80C ₹1,50,000, 80D ₹25,000. AIS adds ₹8,000 savings interest.
- **Fixture:** `salaried-single-form16` → ITR-1.
- **Expected journey:** `/file` → documents (upload Form 16) → parsing reveal → review (income/deductions/taxes/summary) → regime → review/risk → checkout → companion.
- **Screen must show:** parsed salary/TDS with confidence; HRA exemption in old regime; regime recommendation with honest estimate disclaimer; refund/payable; companion copy-ready values.
- **Pain point:** Theme 9 (which ITR) + Theme 4 (regime). Baseline that everything renders correctly.

## CS-2 — Priya Nair · Job change, two Form 16s

- **Inputs:** Acme Analytics ₹7,00,000 / TDS ₹45,000 + Globex Software ₹6,00,000 / TDS ₹52,000. Aggregate gross ₹13,00,000, TDS ₹97,000. 80C ₹1,50,000, 80D ₹22,000.
- **Fixture:** `job-change-multi-form16` → ITR-1.
- **Expected journey:** documents → parsing → "Add another Form 16 (job change)" → re-parse → review shows "Combined across 2 employers".
- **Screen must show:** per-employer breakdown, aggregated gross/TDS, and the **payable surprise** (both employers gave the basic exemption separately, so combined TDS is short). This is the multi-employer aggregation in `lib/filing/employers.ts`.
- **Pain point:** Multi-employer + Theme 1 (TDS reconciliation).

## CS-3 — Rohan Mehta · AIS vs Form 16 mismatch (the #1 pain point)

- **Inputs:** Form 16 Meridian Consulting — gross ₹15,00,000, TDS ₹1,20,000. AIS additionally shows FD interest ₹45,000 and dividend ₹12,000 NOT in Form 16. 80C ₹1,50,000, 80D ₹30,000.
- **Fixture:** `salaried-ais-mismatch` → ITR-1.
- **Expected journey:** documents → parsing → mismatch center → review taxes/reconcile tab.
- **Screen must show:** AIS-only lines flagged **needs attention**; the three-doc model (Form 16 = salary, AIS = broad cross-check, 26AS = tax credits); honest guidance that the user can file with correct figures and log AIS feedback rather than waiting indefinitely. **This is the primary driver of the Phase 2 reconcile dashboard.**
- **Pain point:** Theme 1.

## CS-4 — Sneha Iyer · Freelancer 44ADA, foreign clients

- **Inputs:** Professional receipts ₹18,00,000 (foreign + domestic), FD interest ₹20,000. 80C ₹90,000, 80D ₹18,000. No salary.
- **Fixture:** `freelancer-44ada` (presumptive profession routing).
- **Expected journey:** onboarding eligibility (freelance + foreign chips) → income/other → regime → review.
- **Screen must show:** presumptive 44ADA position explained; **honest escalation** for foreign income / GST nuance ("we estimate; consider expert"). No over-claiming of GST handling.
- **Pain point:** Theme 3.

## CS-5 — Vikram Reddy · Salaried + capital gains / F&O

- **Inputs:** Form 16 Nimbus Retail — gross ₹9,00,000, TDS ₹30,000. Equity capital gains + intraday/F&O activity. 80C ₹1,20,000, 80D ₹20,000.
- **Fixture:** `trader-capital-gains` (routes ITR-2/3).
- **Expected journey:** documents → onboarding (capital gains chip) → review → regime.
- **Screen must show:** capital gains as a first-class income head; correct form routing (ITR-2/3); honest "complex case → consider expert" nudge for F&O turnover/audit.
- **Pain point:** Theme 2.

## CS-6 — Karthik Menon · Rent without HRA (80GG) + regime decision

- **Inputs:** Form 16 Cobalt Systems — gross ₹10,00,000, TDS ₹60,000. No HRA in salary; claims 80GG ₹60,000. 80C ₹1,20,000, 80D ₹22,000.
- **Fixture:** `rent-no-hra-80gg` → ITR-1.
- **Expected journey:** documents → review → regime compare.
- **Screen must show:** 80GG only benefits the old regime; regime recommendation with the "why" (deductions lost in new, breakeven).
- **Pain point:** Theme 4 + 80GG.

## CS-7 — Daniel Thomas (NRI) · Let-out property + home-loan interest

- **Inputs:** NRI. Let-out flat rent ₹3,60,000, home-loan interest ₹2,00,000, municipal tax ₹12,000, TDS on rent ₹36,000.
- **Fixture:** `nri-let-out-property` → ITR-2.
- **Expected journey:** onboarding (NRI status, house property) → house-property → review.
- **Screen must show:** non-resident → ITR-2 routing; house-property loss set-off; honest NRI escalation.
- **Pain point:** Theme 6.

## CS-8 — Lakshmi Rao (senior) · Pensioner + FD interest (80TTB)

- **Inputs:** Senior. Pension ₹8,00,000, TDS ₹40,000, FD interest ₹80,000. 80C ₹1,00,000, 80D ₹30,000.
- **Fixture:** `senior-pensioner-80ttb` → ITR-1.
- **Expected journey:** documents → review → regime.
- **Screen must show:** 80TTB up to ₹50,000 on interest (old regime); senior-friendly clarity.
- **Pain point:** Theme 1 + senior 80TTB.

---

## Coverage summary

- ITR-1: CS-1, CS-2, CS-3, CS-6, CS-8
- ITR-2: CS-5 (or ITR-3), CS-7
- Presumptive: CS-4
- Pain-point themes touched: 1, 2, 3, 4, 6, 9 + multi-employer + senior 80TTB.

These eight personas are exercised screen-by-screen in [../qa/E2E_RUN_2026.md](../qa/E2E_RUN_2026.md).
