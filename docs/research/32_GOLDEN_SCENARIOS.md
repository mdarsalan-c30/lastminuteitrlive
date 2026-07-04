# 32 — Golden Scenario Suite (Phase 3, Executed)

> 54 scenarios across 12 families. Expected values below are **hand-derived from the AY 2026-27 rules (doc 15), independent of the engine** — several intentionally FAIL against today's code (doc 30 Finding 1). That failure is the proof the suite tests the law. Before CI landing, each anchor value must be cross-checked once against the ITD portal calculator.
> Conventions: age <60, resident, new regime, salaried (std. deduction ₹75,000 new / ₹50,000 old) unless stated. "Tax" = final liability incl. 4% cess, rounded per 288B.

## Family A — 87A rebate ladder (the doc-30 defect detectors)

| ID | Input (gross salary) | Taxable | Slab tax | Rebate/relief | **Expected tax** |
|---|---|---|---|---|---|
| A-01 | 8,00,000 | 7,25,000 | 16,250 | rebate 16,250 | **0** |
| A-02 | 12,65,000 | 11,90,000 | 59,000 | rebate 59,000 | **0** |
| A-03 | 12,75,000 | 12,00,000 (boundary) | 60,000 | rebate 60,000 | **0** |
| A-04 | 12,85,000 | 12,10,000 | 61,500 | no rebate; marginal relief caps at 10,000 | **10,400** (10,000 + cess) |
| A-05 | 13,50,000 | 12,75,000 | 71,250 | relief doesn't bite (71,250 ≤ 75,000) | **74,100** |
| A-06 | 13,75,000 | 13,00,000 | 75,000 | none | **78,000** |

Crossover check A-07: relief stops binding at taxable ≈ ₹12,70,588 (`60,000 + 0.15x = x`); assert monotonic tax around it (no cliff).

## Family B — Rebate × 112A interaction (the subtle one)

Total income for the ≤₹12L rebate test includes **post-exemption** LTCG; rebate never offsets 112A tax (TAX-002/003).

| ID | Slab income | Raw LTCG 112A | Taxable LTCG | Total income | **Expected tax** | Route |
|---|---|---|---|---|---|---|
| B-01 | 11,00,000 | 1,00,000 | 0 (≤1.25L exempt) | 11,00,000 | **0** (slab 50,000 fully rebated) | ITR-1 |
| B-02 | 11,00,000 | 1,20,000 | 0 | 11,00,000 | **0** | ITR-1 |
| B-03 | 11,00,000 | 2,00,000 | 75,000 | 11,75,000 ≤ 12L → rebate on slab only | **9,750** (LTCG 9,375 + cess; slab rebated) | **ITR-2** (raw LTCG > 1.25L) |
| B-04 | 11,80,000 | 2,00,000 | 75,000 | 12,55,000 > 12L → **no rebate**; marginal relief caps slab tax at (total income − 12L) = 55,000 | (55,000 + 9,375) × 1.04 = **66,950** | ITR-2 |
| B-05 | 11,00,000 | 1,26,000 | 1,000 | 11,01,000 | rebate on slab; LTCG 1,000 × 12.5% = 125 → **130** with cess | **ITR-2** (>1.25L raw) |

> B-04 interpretation (implemented in `rulesets.py` / `tax_slabs.py`): both the ₹12L eligibility test and the marginal-relief cap use **total income** (incl. post-exemption LTCG); relief applies to slab tax only and never reduces 112A tax. Flagged for CA sign-off in the acceptance checklist — if the CA rules that relief needs slab-only income, only `_apply_87a_marginal_relief_new_regime` and this row change.

B-05 is the nastiest routing trap in the product: ₹1,000 of extra LTCG ejects the user from ITR-1 while their tax stays ~zero.

## Family C — Routing boundary (GAT checks as fixtures)

C-01 LTCG 1,24,999 + no losses → ITR-1. C-02 LTCG 1,25,001 → ITR-2. C-03 STCG ₹1 → ITR-2. C-04 LTCG 1,00,000 **with** ₹5,000 carried-forward loss → ITR-2 (GAT-008). C-05 two self-occupied properties → ITR-1 (new rule). C-06 three properties → ITR-2. C-07 director flag → not ITR-1. C-08 agri income 5,001 → not ITR-1. C-09 total income 50,00,001 → not ITR-1. C-10 the "maximal legal ITR-1": salary 30L + 2 HP + interest + LTCG 1.2L + agri 4,000 → **ITR-1**.

## Family D — Regime comparison flips

| ID | Input | Old-regime tax | New-regime tax | **Verdict** |
|---|---|---|---|---|
| D-01 | Salary 10,00,000; 80C 1.5L; 80D 25,000 | taxable 7,75,000 → 67,500 + cess = **70,200** | taxable 9,25,000 → slab 32,500, rebated → **0** | New saves 70,200 |
| D-02 | Salary 6,00,000; 80C 1.5L | taxable 4,00,000 → 7,500, rebate 7,500 → **0** | taxable 5,25,000 → 6,250, rebated → **0** | Tie → default new |
| D-03 | Salary 25,00,000; 80C 1.5L; 80D 75k; HRA exempt 3L; 24(b) 2L; 80CCD(1B) 50k | old taxable 17,25,000 → 3,30,000 + cess = **3,43,200** | new taxable 24,25,000 → 60,000+60,000+80,000+1,00,000+7,500 = 3,07,500... compute: 4-8:20,000; 8-12:40,000; 12-16:60,000; 16-20:80,000; 20-24:1,00,000; 24-24.25:7,500 → 3,07,500 + cess = **3,19,800** | New wins by 23,400 — even a deduction-maximalist loses old regime here; verdict card must explain why |
| D-04 | D-03 but HRA exempt 6L | old taxable 14,25,000 → 2,40,000 + cess = **2,49,600** | new **3,19,800** | **Old wins** — the flip case |
| D-05 | Business income + old regime without 10-IEA fact | — | — | GAT-017 block fires |

## Family E — Old regime & seniors
E-01 salary 6L, 80C 1.5L, old → 0 (87A ₹7,500). E-02 senior (65), pension 8L + FD interest 60k, old, 80TTB 50k → taxable 8,10,000... pension std deduction 50k: 8,60,000−50,000−50,000 = 7,60,000 → tax 12,500+52,000 = 64,500... check: 3–5L @5% =10,000; 5–7.6L @20% =52,000 → 62,000 + cess = **64,480** (288B round). E-03 super-senior (82) exemption 5L slabs. E-04 80TTA claimed by senior → DED-006 blocks, suggests 80TTB. E-05 80TTB on savings+FD both allowed (vs 80TTA savings-only).

## Family F — Multi-employer
F-01 two Form 16s, std deduction applied once (SAL-003). F-02 both employers gave full 87A-era basic exemption → TDS shortfall → payable + 234B/C flags (V1: flag only). F-03 duplicate employer TAN → IDN-008.

## Family G — TDS & refund
G-01 TDS 80,000, liability 0 (A-02 profile) → **refund 80,000**. G-02 TDS < liability → payable path + challan fields. G-03 TDS claimed, income not declared → TDS-003 block. G-04 refund ratio >25% → TDS-006 warn.

## Family H — House property
H-01 self-occupied, 24(b) 1,80,000, old regime → allowed. H-02 same, new regime → deduction zeroed with explanation (HP-006). H-03 let-out: rent 3,00,000, municipal 20,000, NAV 2,80,000, 30% std 84,000, interest 2,50,000 → HP income −54,000; set-off vs salary allowed (≤2L cap check). H-04 HP loss 2,50,000 → set-off capped at 2,00,000, remainder carry-forward → **not ITR-1** (GAT-008).

## Family I — Belated season (asOfDate > 31-Jul-2026)
I-01 income 4,80,000 → 234F fee ₹1,000. I-02 income 8,00,000 → fee ₹5,000. I-03 belated + capital loss → carry-forward denial warning (hard). I-04 234A interest accrual from 1-Aug.

## Family J — Rounding & cess exactness
J-01 taxable 12,34,567 → 288A rounding of income, 288B of tax; assert exact rupee. J-02 cess computed after marginal relief (A-04 derivative): cess base 10,000 not 61,500.

## Family K — Parser-to-fact integrity
K-01 Form 16 with Part A only → salary facts proposed, TDS confirmed, SAL-005 unresolvable → warn. K-02 wrong-AY Form 16 → quarantine, zero facts. K-03 PAN-mismatch doc → block.

## Family L — Refusals (the honesty suite)
L-01 NRI → BLOCKED with portal/CA routing. L-02 crypto → BLOCKED. L-03 F&O → BLOCKED (V1). L-04 RNOR → BLOCKED. Each asserts: no computation run is created, no number is ever shown.

## Count: 6+7(A incl. crossover)+5+10+5+5+3+4+4+4+2+3+4 = **54 scenarios.**

## CI contract

- Fixture format: `{factset, asOfDate, rulesetId} → {expectedTaxOld?, expectedTaxNew?, expectedForm, expectedFlags[], expectedRefund?}`.
- Suite runs on every engine/ruleset change; **any diff in an anchor value requires a ruleset version bump + changelog line.**
- Families A, B, J must fail against current `tax_slabs.py` (7L-era rebate) — record the failing run as evidence before fixing (doc 30 §6.2).

## Acceptance criteria (Phase 3 gate, this doc)

- [ ] Anchor values re-derived independently by a second person / ITD calculator
- [ ] B-family interpretation (post-exemption LTCG in the 12L test) confirmed with a practicing CA — this is the one point of legal ambiguity worth a phone call
- [ ] Fixture schema agreed with whoever owns `backend/engine/tests/`
