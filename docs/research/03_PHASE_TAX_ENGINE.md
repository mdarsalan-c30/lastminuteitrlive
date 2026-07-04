# Phase 3 — Tax Engine (Blueprint Only)

**Status:** Research blueprint — **no implementation**  
**Depends on:** Phase 2 architecture sign-off

---

## 1. Engine philosophy

- **Deterministic, versioned, testable**  
- One rules package per Assessment Year  
- Outputs must be explainable field-by-field  
- AI never writes tax numbers into the result  

---

## 2. V1 scope (locked with Research)

**In scope**

- Resident individual  
- ITR-1 eligible cases only (strict gates)  
- Salary (multi-employer)  
- Interest (savings/FD) with 80TTA/80TTB  
- Simple HP: none or one self-occupied (interest cap)  
- Deductions allowed in chosen regime  
- Old vs new regime compare  
- 87A as applicable for AY  
- TDS credit from 26AS/Form16 (when present)  
- Basic risk flags (mismatch, missing TDS, high refund ratio)

**Out of scope (hard refuse)**

- NRI/RNOR, FA, foreign income  
- CG (except none), F&O, business, presumptive  
- Crypto, director, HUF, firm, company  
- Schedule AL/FA triggers  
- More than one let-out HP  

---

## 3. ITR routing rules (V1)

| Condition | Route |
| --- | --- |
| NRI/RNOR | BLOCK |
| Foreign income/assets | BLOCK |
| Capital gains / ESOP sale | BLOCK → V2 ITR-2 |
| Business / profession / F&O | BLOCK → V3 |
| Crypto | BLOCK |
| >1 house property income | BLOCK |
| Agricultural > limit (if applicable) | BLOCK |
| Else salary+interest(+simple HP) | ITR-1 |

**Note:** Exact monetary thresholds and AY-specific conditions must be filled from Finance Act / CBDT for the active AY in implementation — this doc defines *structure*, not a substitute for legal text.

---

## 4. Validation catalog (target: 500+ checks)

Checks are grouped. Implementation phase expands each into atomic tests.

### 4.1 Identity & profile (40+)

PAN format, age vs DOB, residential status consistency, AY selection, employer TAN format, etc.

### 4.2 Eligibility / routing (60+)

All ITR-1 disqualifiers; form recommendation consistency; regime election consistency with 10IEA rules for AY.

### 4.3 Salary (50+)

Gross vs exemptions; standard deduction; professional tax; multi-employer sum; perquisites flags; Form16 Part B vs AIS.

### 4.4 HP (40+)

Annual value; municipal tax; 30% standard; interest cap self-occupied; co-ownership share; let-out vs self-occupied exclusivity for ITR-1.

### 4.5 Other income (30+)

Interest aggregation; dividend (if in scope later); gift flags.

### 4.6 Deductions (80+)

80C cap; 80D self/parents senior limits; 80TTA vs 80TTB mutual exclusivity; HRA conditions; 80GG without HRA; regime-disallowed deductions.

### 4.7 TDS / 26AS / AIS (80+)

TDS ≤ income reasonableness; employer-wise TDS; AIS salary vs Form16; interest in AIS not declared; tax payments (advance, self-assessment).

### 4.8 Tax computation (50+)

Slabs old/new; 87A; cess; rebate interactions; rounding; surcharge thresholds (even if V1 users below).

### 4.9 Refund / payable (20+)

Refund = max(0, prepaid − liability); payable path; interest 234A/B/C (V2).

### 4.10 Pre-file / ITD-like (50+)

Mandatory fields; schedule totals; JSON schema; cross-form consistency.

### Already identified gaps (carry forward)

- Section 87A edge cases  
- Schedule 112A (V2)  
- AIS reconciliation completeness  
- ITR-1 HP restrictions  
- Business regime warnings (V3)  

**Engine phase deliverable:** spreadsheet/checklist of 500 named validations with AY reference — before coding.

---

## 5. Golden scenarios (minimum 50 for V1 CI)

Categories:

1. Salary only, new regime, no 80C  
2. Salary + max 80C, old cheaper  
3. Senior 80TTB  
4. Super senior slabs  
5. Multi-employer Form16  
6. HRA metro / non-metro  
7. HP interest self-occupied at cap  
8. AIS interest mismatch resolved by user accept  
9. TDS fully covers liability → refund  
10. TDS short → payable  
11. 87A boundary incomes  
12. Standard deduction application  
13. Regime flip when 80D added  
14. Zero salary + interest only (edge)  
15. Refuse NRI input  

Each scenario: input fixture → expected tax old/new → expected form → expected risks.

---

## 6. Reconcile engine

```
For each income/TDS line:
  sources = {form16, ais, form26as, user}
  if disagree beyond tolerance → ReconcileIssue
  resolution = accept_source | user_override | ignore_immaterial
```

Materiality: configurable (e.g. ₹100 / ₹1,000 tiers).

---

## 7. Computax parity (long-term)

| Computax area | Our approach |
| --- | --- |
| Full schedules | Phased by persona |
| Bulk | CA workspace V4 |
| Reports | Evidence pack PDF/JSON |
| Desktop | Cloud-first |
| Validation | Pre-file engine + golden tests |

---

## Phase 3 exit checklist

- [ ] V1 validation catalog drafted (500 named checks)  
- [ ] 50 golden scenarios specified with expected outputs  
- [ ] AY ruleset versioning scheme approved  
- [ ] Reconcile tolerances approved  
- [ ] Proceed to UI/UX phase  
