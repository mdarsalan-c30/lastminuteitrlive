# 15 — Tax Rules Baseline for the Engine (FY 2025-26 / AY 2026-27)

> Phase 1, Deliverable 6. This is the authoritative rules snapshot the engine's golden scenarios must encode. Grounded July 2026 against incometax.gov.in AY 2026-27 pages, CBDT Notification 45/2026, and the Income-tax Act 2025 (in force 1 Apr 2026, amended by Finance Act 2026).
> Rule of use: **every constant below becomes a named, versioned constant in the engine** (e.g. `REBATE_87A_NEW_CAP = 60_000 # AY2026-27`), never an inline literal.

## 1. New regime (default, u/s 115BAC-equivalent under the 2025 Act)

Slabs (all individuals, no age variation):

| Taxable income | Rate |
|---|---|
| Up to ₹4,00,000 | 0% |
| ₹4,00,001 – ₹8,00,000 | 5% |
| ₹8,00,001 – ₹12,00,000 | 10% |
| ₹12,00,001 – ₹16,00,000 | 15% |
| ₹16,00,001 – ₹20,00,000 | 20% |
| ₹20,00,001 – ₹24,00,000 | 25% |
| Above ₹24,00,000 | 30% |

- Standard deduction (salaried/pension): **₹75,000**.
- Allowed deductions: 80CCD(2) employer NPS, standard deduction; almost everything else (80C, 80D, HRA, 24(b) self-occupied) disallowed.
- **87A rebate: up to ₹60,000 when total income ≤ ₹12,00,000.** Resident individuals only.
- **Marginal relief just above ₹12L:** total tax may not exceed the income in excess of ₹12,00,000 (bites until ≈ ₹12.75L).
- **Rebate applies ONLY to slab-rate income.** Not against 112A LTCG, not against special-rate income (lottery, online gaming, VDA). This is the #1 engine trap — encode as an explicit golden scenario family.
- Effective nil-tax gross salary: ₹12,75,000 (12L + 75k standard deduction).

## 2. Old regime (opt-in)

- Basic exemption: ₹2.5L (<60), ₹3L (60–79), ₹5L (80+). Slabs 5%/20%/30%.
- Standard deduction ₹50,000.
- Full deduction menu: 80C (1.5L), 80D, 80CCD(1B) 50k, HRA, 24(b) up to 2L self-occupied, 80G, 80TTA/TTB, etc.
- 87A: max **₹12,500**, income ≤ ₹5,00,000.
- Opt-out mechanics: salaried can choose at filing each year; business income requires **Form 10-IEA** with one-switch-back lifetime limit. Engine must gate on income type.

## 3. Surcharge & cess (both regimes)

- Cess: 4% health & education on tax + surcharge.
- Surcharge: 10% > 50L, 15% > 1Cr, 25% > 2Cr; old regime adds 37% > 5Cr (new regime caps at 25%). Marginal relief at each threshold.
- Surcharge on 112A/111A capital gains capped at 15% regardless of income.

## 4. Capital gains (post-July-2024 rates apply all of FY 2025-26)

| Asset | Short-term | Long-term | LTCG threshold |
|---|---|---|---|
| Listed equity/equity MF (STT) | 111A: **20%** | 112A: **12.5%** above **₹1.25L/yr exemption** | >12 months |
| Other assets (property, gold, debt-classified) | Slab | 12.5% no indexation (property acquired pre-23-Jul-2024: taxpayer may pick lower of 12.5% no-index vs 20% with indexation) | >24 months |
| Specified debt MFs (post-Apr-2023 purchases) | Slab (deemed STCG) | — | — |

- Grandfathering (31-Jan-2018 FMV) still applies to pre-2018 equity.
- Loss rules: STCL sets off against STCG+LTCG; LTCL only against LTCG; 8-year carry-forward **only if return filed by due date** — belated filers lose it (encode as a hard warning).

## 5. ITR routing rules (encode verbatim — AY 2026-27)

**ITR-1 allowed iff ALL:** resident (not RNOR); total income ≤ ₹50L; income only from {salary/pension, ≤ 2 house properties, other sources, 112A LTCG ≤ ₹1.25L with zero capital losses to set off/carry, agri ≤ ₹5,000}.
**ITR-1 blocked if ANY:** director; unlisted shares; 194N TDS; deferred ESOP tax; foreign assets/account authority; 90/90A/91 relief; VDA income; any STCG; LTCG > 1.25L or non-112A gains; business/professional income; >2 properties; agri > 5,000; NRI/RNOR.

**ITR-4 (Sugam):** resident individual/HUF/firm(non-LLP), ≤ ₹50L, presumptive 44AD (turnover ≤ 2Cr, or 3Cr if ≤5% cash) / 44ADA (gross receipts ≤ 50L, or 75L if ≤5% cash) / 44AE; same director/unlisted/foreign blocks.

**ITR-2:** individuals/HUF, no business income, everything ITR-1 can't take.
**ITR-3:** business/professional income with books.

Wrong-form consequence: 139(9) defective notice, 15-day cure, refund freeze — this is the failure mode our routing engine exists to prevent.

## 6. Other engine-relevant constants (AY 2026-27)

- 234F late fee: ₹5,000 (₹1,000 if total income ≤ ₹5L). 234A/B/C interest 1%/month rules unchanged.
- 80TTA ₹10k / 80TTB ₹50k (old regime only).
- TDS thresholds (FY 2025-26 revisions): 194A bank interest ₹50k (₹1L seniors); salary TDS per regime election with employer.
- Advance tax: liability ≥ ₹10k; 15/45/75/100% by Jun/Sep/Dec/Mar 15; presumptive filers single 100% installment by Mar 15.
- E-verification window: 30 days; belated 31-Dec-2026; revised 31-Mar-2027; ITR-U to 31-Mar-2031 (with additional tax slabs by year).

## 7. Golden-scenario families this baseline mandates (min 50 total, doc 03)

1. 87A edge ladder: 11.9L / 12.0L / 12.1L / 12.5L / 12.75L / 13L — with and without ₹1L 112A LTCG on top (rebate must NOT absorb LTCG tax).
2. Marginal relief exactness at 12,00,001 and at surcharge thresholds.
3. ITR-1 boundary: 1.24L vs 1.26L LTCG; 2 vs 3 properties; one ₹1 STCG trade (must eject to ITR-2).
4. Regime comparison flips: high-80C old-regime winner vs default new-regime winner; Form 10-IEA gating for business income.
5. Grandfathered equity + post-2024 rate mix in one FY.
6. Presumptive: 44ADA at 49L/51L/74L/76L receipts with cash-ratio toggles.
7. Belated filing: loss carry-forward denial + 234F fee tiers.
8. Senior citizen old-regime exemption tiers + 80TTB.
9. Marginal relief + cess interaction (cess computed after relief).
10. Salary + 2 properties + interest + 1.2L LTCG — the "maximal legal ITR-1" scenario, must route to ITR-1, not ITR-2.

## 8. Change-watch list (assign an owner, check monthly)

- Finance Act 2026 amendments and CBDT circulars re-mapping 2025-Act sections (rebate now Sec 216–220; TDS "Section 393 codes").
- Any due-date extension notifications (July 2026 season).
- New ITR schema versions on the e-filing portal (JSON schema drift breaks our export — pin schema version per release).
