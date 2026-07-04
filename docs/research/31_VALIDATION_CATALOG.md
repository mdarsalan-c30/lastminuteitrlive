# 31 — Validation Catalog (Phase 3, Executed)

> The named-check registry. Every check gets a stable ID, severity, state-machine home, and AY-2026-27 legal anchor. This doc defines the ID scheme, enumerates the V1 (ITR-1) checks in full, and sizes the V2/V3 groups. Implementation expands each row into one test + one runtime validator sharing the same ID.

## 1. ID scheme & severities

`{AREA}-{NNN}` — e.g. `SAL-014`. Severity: **B** (blocking — cannot export), **W** (warn — must acknowledge in RISK state), **I** (info). Each check declares: `factKeys[]` it reads, the state where it first fires (doc 21), and the citation (Act 2025 section / rule / schema field). Checks live in the ruleset package and are versioned with it — a check can change severity or threshold between AYs without code churn.

## 2. GAT — Gate & routing (28 checks, all V1)

| ID | Check | Sev |
|---|---|---|
| GAT-001 | Residential status = resident (not RNOR) else BLOCK | B |
| GAT-002 | Total income ≤ ₹50,00,000 for ITR-1 | B |
| GAT-003 | No business/professional income | B |
| GAT-004 | House property count ≤ 2 | B |
| GAT-005 | No STCG of any amount (₹1 ejects to ITR-2) | B |
| GAT-006 | LTCG 112A ≤ ₹1,25,000 | B |
| GAT-007 | No non-112A capital gains (property/gold/debt) | B |
| GAT-008 | No capital losses to set off or carry forward | B |
| GAT-009 | Not a company director | B |
| GAT-010 | No unlisted equity shares held any time in FY | B |
| GAT-011 | No foreign assets / account signing authority | B |
| GAT-012 | No 90/90A/91 treaty relief claim | B |
| GAT-013 | No VDA/crypto income | B |
| GAT-014 | No TDS u/s 194N | B |
| GAT-015 | No deferred ESOP tax | B |
| GAT-016 | Agricultural income ≤ ₹5,000 | B |
| GAT-017 | Regime election valid: business income + old regime requires Form 10-IEA | B |
| GAT-018–028 | Consistency re-checks after every fact change (each gate fact watched; change → verdict recompute + downstream stale-mark) | B |

## 3. IDN — Identity & profile (12): PAN format+checksum (IDN-001 B), PAN↔case match on every doc (IDN-002 B), DOB vs age band (IDN-003 B), AY consistency across docs (IDN-004 B), employer TAN format (IDN-005 W), bank account IFSC+format for refund (IDN-006 B), name mismatch doc-vs-profile fuzzy (IDN-007 W), duplicate employer TAN (IDN-008 W), + 4 more.

## 4. SAL — Salary (22)

Key rows: SAL-001 gross = Σ components per Form 16 Part B (B); SAL-002 standard deduction = min(salary, ₹75,000 new / ₹50,000 old) **per regime, not per employer** (B); SAL-003 multi-employer: standard deduction applied once (B); SAL-004 professional tax cap ₹2,500 old regime only (W); SAL-005 Form 16 Part A TDS = Part B TDS (W); SAL-006 salary in AIS vs Σ Form 16s within tolerance (→ reconcile, W); SAL-007 HRA exemption only old regime (B); SAL-008 employer count matches Form 16 count (W); SAL-009 salary < TDS sanity (B); + 13 more (perquisites flags, arrears/10E detection → escalate, negative values, pension coded as salary).

## 5. HP — House property (16)

HP-001 ≤2 properties (B, mirrors GAT-004); HP-002 self-occupied annual value = 0 (B); HP-003 let-out: rent declared > 0 (W); HP-004 municipal tax ≤ rent (B); HP-005 30% standard deduction computed on NAV not rent (B); HP-006 24(b) self-occupied cap ₹2,00,000 old regime; **disallowed for self-occupied under new regime** (B); HP-007 let-out interest uncapped but loss set-off vs other heads capped ₹2,00,000 (B); HP-008 both properties self-occupied allowed (max 2) (I); HP-009 co-ownership share ≤ 100% (B); + 7 more.

## 6. OTH — Other income (14): savings vs FD interest split (80TTA applies only to savings) (OTH-001 B); dividend total vs AIS (OTH-002 W); family pension deduction min(⅓, ₹25,000 new / ₹15,000 old) (OTH-003 B); interest in AIS absent from facts (OTH-004 W→reconcile); gift > ₹50,000 flag (OTH-005 W); + 9 more.

## 7. DED — Deductions (26)

DED-001 80C ≤ ₹1,50,000 (B); DED-002 new regime: 80C/80D/80G/80TTA/80TTB/HRA all disallowed — silently zeroed with explanation, not error (B); DED-003 80D self ≤ ₹25,000 (₹50,000 if senior), parents separately (B); DED-004 80CCD(1B) ≤ ₹50,000 and outside 80C cap (B); DED-005 80CCD(2) allowed both regimes, cap 10%/14% of basic (B); DED-006 80TTA (₹10,000, <60) XOR 80TTB (₹50,000, senior) (B); DED-007 80G requires donee details + mode (B); DED-008 deduction claims without evidence facts → W with attestation path; DED-009 Σ deductions ≤ GTI (B); + 17 more.

## 8. TAX — Computation (24, the doc-30 defect class)

TAX-001 new-regime slabs are the 4/8/12/16/20/24L table (B); TAX-002 87A new = min(slab tax, ₹60,000) iff income ≤ ₹12,00,000 (B); TAX-003 87A never offsets 111A/112A tax (B); TAX-004 marginal relief above ₹12L: tax ≤ income − 12,00,000 (B); TAX-005 87A old = min(tax, ₹12,500) iff ≤ ₹5,00,000 (B); TAX-006 cess 4% after rebate/relief/surcharge (B); TAX-007 surcharge bands + 25% new-regime cap + 15% special-rate cap (B); TAX-008 surcharge marginal relief at each threshold (B); TAX-009 rounding u/s 288A/288B to nearest ₹10 (B); TAX-010 regime comparison ran and verdict recorded (B); TAX-011 senior/super-senior old slabs age-gated (B); TAX-012 112A exemption ₹1,25,000 applied before rate (B); + 12 more (234A/B/C interest when payable, 234F fee post-due-date tiers by income, advance-tax shortfall flag).

## 9. TDS — Credits & taxes paid (18): Σ TDS claimed ≤ Σ 26AS (TDS-001 B); Form 16 TDS present in 26AS (TDS-002 W); TDS claimed on income not declared (TDS-003 B — classic notice trigger); challan format for self-assessment/advance tax (TDS-004 B); refund = max(0, prepaid − liability) (TDS-005 B); high refund ratio (>25% of gross tax) risk flag (TDS-006 W); + 12 more.

## 10. EXP — Export / schema (20): every mandatory ITR-1 JSON field mapped from a confirmed fact (EXP-001 B); schedule totals = Σ line items (EXP-002 B); schema version pinned & validated (EXP-003 B); bank account for refund present (EXP-004 B); verification section populated (EXP-005 B); + 15 generated from the ITD schema field list.

## 11. Totals & sizing

| Group | V1 (ITR-1) | V2 (ITR-2: full CG, 2+ HP, foreign) | V3 (ITR-3/4: business, presumptive) |
|---|---|---|---|
| GAT 28 · IDN 12 · SAL 22 · HP 16 · OTH 14 · DED 26 · TAX 24 · TDS 18 · EXP 20 | **180 named** | +≈170 (CG matrix, grandfathering, loss set-off ordering, FA schedules) | +≈150 (44AD/ADA gates, books, GST cross-checks) |

Path to the 500-check target is V1+V2+V3 = ~500. V1's 180 are fully named above and are the Phase 7 implementation contract: **one runtime validator + one CI test per ID, same source of truth.**

## 12. Acceptance criteria (Phase 3 gate, this doc)

- [ ] Every V1 check ID reviewed against a legal citation (doc 15 or Act 2025 text)
- [ ] Severity assignments reviewed (esp. what blocks export vs warns)
- [ ] Fact registry (doc 20) covers every factKey referenced here — no dangling reads
- [ ] TAX group cross-checked against doc 30 Finding 1 remediation
