# ITR-3 Engine Plan — AY 2026-27

Status: architecture and implementation plan
Rules checked: 14 August 2026
Tax period: FY 2025-26 / AY 2026-27
Governing law: Income-tax Act, 1961, as applicable to FY 2025-26

## 1. Executive decision

Do not expand the existing flat `BusinessInput` into a large collection of loosely
related fields. Keep the working common tax-head calculators used by ITR-1 and ITR-2,
and add a separate, versioned ITR-3 schedule engine around them.

The engine should use this pipeline:

```text
source facts
  -> canonical ITR-3 facts
  -> scope and audit classification
  -> statutory schedule calculators
  -> current-year and brought-forward loss set-off
  -> total-income and tax computation
  -> CBDT Category A/B/D validations
  -> AY-specific official JSON mapper
  -> JSON Schema validation
```

The existing ITR-1 and ITR-2 calculators remain common dependencies. ITR-3 must
not fork or duplicate salary, house-property, capital-gains, other-income, deduction,
slab, surcharge, cess, or tax-credit logic.

## 2. Official baseline

The implementation must pin all of the following as versioned external artifacts:

| Artifact | AY 2026-27 version checked | Release |
|---|---:|---:|
| ITR-3 notified form | 2026 form | 2026 |
| CBDT JSON Schema | `ITR-3_2026_Main_V1.1.json` | 30 Jun 2026 |
| Schema change document | v1.1 | 30 Jun 2026 |
| Validation rules | v1.0 | 18 Jun 2026 |
| Excel utility | v1.2 | 17 Jul 2026 |

The 30 June schema update modifies the descriptions and enums for `TDSSection` in
`ScheduleTDS2` and `ScheduleTDS3`. The schema version must therefore be part of
the export contract and not a comment or display-only label.

Although the Income-tax Act, 2025 came into force on 1 April 2026, the official
transition guidance says the return for income earned in FY 2025-26 is filed as
AY 2026-27 under the Income-tax Act, 1961. A future Tax Year 2026-27 engine must
be a different rules package.

## 3. What exists today

### Reusable and tested

- ITR form routing to ITR-3 for regular-books business cases.
- Salary, house-property portfolio, other-income and capital-gains calculators.
- Old/new-regime tax calculation for AY 2026-27.
- Basic regular-books profit: receipts minus expenses and depreciation.
- WDV depreciation blocks and section 50 short-term-gain warning.
- Basic F&O non-speculative and intraday/speculative buckets.
- Brought-forward house-property, capital and ordinary business losses.
- Basic `CYLA`/`BFLA`-style set-off behavior.
- A paid ITR-3 export endpoint and entitlement check.
- Frontend draft-to-engine mapping.
- 150 ITR-3 routing combinations within a 540-test backend suite.

### Foundation-only and not filing-ready

- `BusinessInput` stores only aggregate receipts, expenses and F&O figures.
- `BusinessIncomeResult` does not expose statutory BP adjustments or schedule totals.
- The ITR-3 export extends a custom ITR-2 foundation payload; it does not emit the
  official `ITR.ITR3` JSON structure.
- The export label `AY2026_27_ITR3_FOUNDATION` correctly signals that it is not an
  Income Tax Department upload schema.
- Audit logic is currently reduced to an F&O turnover warning at ₹10 crore.
- No balance sheet, trading account, manufacturing account, detailed P&L,
  quantitative details, GST reconciliation, ICDS adjustments, or tax-audit mapping.
- No complete Part A general, Form 10-IEA, filing-section, due-date, audit-report,
  director, unlisted-share, partner-firm, or representative-assessee facts.
- No row-level TDS1/TDS2/TDS3, TCS or self-assessment/advance-tax schedules.
- No year-by-year CFL ledger for ordinary, speculative, specified-business and
  unabsorbed-depreciation losses.
- NRI and RNOR cases are rejected even though ITR-3 itself supports eligible
  non-resident individual cases.
- Current validation coverage is a small common-engine set, not the CBDT ITR-3
  Category A/B/D rules.

## 4. Critical corrections before expansion

1. **Audit classification must not use F&O turnover alone.** Under section 44AB,
   business audit ordinarily applies above ₹1 crore, with the ₹10 crore threshold
   available only when both cash receipts and cash payments do not exceed 5%.
   Profession audit ordinarily applies when gross receipts exceed ₹50 lakh.
2. **Exactly ₹10 crore is not “above ₹10 crore.”** Frontend and backend comparisons
   currently differ (`>` versus `>=`) and must be replaced by one rules function.
3. **F&O and intraday losses are different ledgers.** Non-speculative business loss,
   speculative loss and specified-business loss need separate set-off and carry-forward
   rules and expiry metadata.
4. **Books profit is not taxable BP income.** Taxable business income requires additions,
   deductions and disallowances from the P&L result, including depreciation and applicable
   sections 30–43B adjustments.
5. **Business old-regime election needs Form 10-IEA state.** It cannot be inferred from
   the selected regime alone.
6. **No-books cases are not empty books cases.** The official schema has distinct
   no-account-case fields and conditional balance-sheet/P&L requirements.
7. **Official export must fail closed.** A custom summary must never be served with an
   official-looking filename or described as portal-uploadable.

## 5. Product scope

### Launch scope (self-serve with hard validations)

- Resident individual sole proprietor or professional.
- One or more ordinary business/professional activities under regular books.
- Non-audit cases with complete balance sheet and P&L facts.
- F&O as non-speculative business and intraday equity as speculative business.
- Salary, house property, capital gains and other sources through existing engines.
- Ordinary business loss, speculative loss and unabsorbed depreciation ledgers.
- Depreciation schedules for supported asset blocks.
- AIS/26AS/TDS/TCS and advance/self-assessment tax reconciliation.
- Old/new regime with Form 10-IEA eligibility and acknowledgement facts.
- Official AY 2026-27 JSON generation only after all Category-A and schema checks pass.

### Guided or CA-required scope

- Tax-audit cases and Form 3CA/3CB-3CD reconciliation.
- Partnership-firm share, interest, salary, bonus, commission or remuneration.
- Multiple businesses with different accounting bases.
- HUF, NRI/RNOR, foreign assets/income, DTAA or foreign-tax credit.
- Manufacturing and inventory-heavy quantitative-detail cases.
- ICDS adjustments, section 43B/MSME disallowances, MAT/AMT credit, specified business,
  international transactions, transfer pricing, 10AA and profit-linked deductions.
- 44AE, 44BB, 44BBA, 44BBB, 44BBC and 44BBD special presumptive businesses.
- VDA treated as business income, patent income, carbon credits, unexplained income,
  pass-through income, Portuguese Civil Code, representative assessee and updated returns.

These cases should receive a precise scope result and handoff checklist, not a guessed
calculation or a dead end.

## 6. Canonical domain model

Create an ITR-3-specific aggregate alongside the existing common `UserInput`:

```text
Itr3ReturnFacts
├── identity_and_filing
├── regime_election
├── businesses[]
│   ├── activity/profile/business code
│   ├── books and accounting method
│   ├── trading/manufacturing/P&L ledger
│   ├── balance sheet
│   ├── tax adjustments
│   ├── depreciation blocks
│   ├── inventory/quantitative details
│   └── GST turnover reconciliation
├── trading
│   ├── fno_non_speculative
│   └── intraday_speculative
├── partnership_interests[]
├── common_income_heads
├── loss_ledger[]
├── deductions_and_special_income
├── tax_credits[]
├── audit_profile
├── documents_and_provenance
└── verification
```

Every monetary fact needs provenance (`manual`, broker statement, P&L, balance sheet,
AIS, 26AS, Form 16A, GST return), confidence, and an explicit “not applicable” state.
Zero must never mean “not collected.”

### Required new model groups

- `BusinessActivity`: business code, nature, trade name, commencement date, GSTINs.
- `AccountingProfile`: books maintained, cash/mercantile, audit applicability and reports.
- `ProfitAndLoss`: revenue and expense lines, not one aggregate expense number.
- `BalanceSheet`: proprietor funds, loans, fixed assets, investments, current assets,
  liabilities, provisions and balancing totals.
- `BusinessTaxAdjustments`: inadmissible expenses, deemed income, allowable deductions,
  sections 40/40A/43B and other Schedule OI/BP adjustments.
- `TradingActivity`: turnover method, broker P&L, charges and separate speculative status.
- `LossLedgerEntry`: AY, filing date/on-time status, category, opening, utilized, closing,
  expiry AY and evidence.
- `TaxCreditEntry`: section, deductor/collector identifiers, deduction year, gross income,
  credit claimed now and carried forward.
- `RegimeElection`: 10-IEA history, current action, acknowledgement and filing date.
- `AuditProfile`: receipt and payment cash ratios, threshold rule, audit section, auditor,
  report type, report date and acknowledgement.

## 7. Schedule engine

Implement schedules as pure calculators with typed inputs and outputs. Use a dependency
graph; do not let the JSON mapper perform computations.

### Stage A — business books

- Part A General 1/2 and scope classification.
- Part A Balance Sheet.
- Manufacturing Account where supported.
- Trading Account, including separate intraday and F&O turnover/income fields.
- Part A P&L.
- Part A Other Information and Quantitative Details.
- Schedule DPM, DOA, DEP and DCG.
- Schedule ICDS and GST reconciliation where in scope.

### Stage B — taxable business income

- Schedule BP: P&L profit to taxable ordinary business income.
- Separate speculative, specified-business and special-rate business buckets.
- Partner-firm adjustments when that scope is enabled.
- Current-year depreciation and unabsorbed-depreciation utilization.

### Stage C — cross-head aggregation

- Schedule CYLA.
- Schedule BFLA.
- Schedule CFL with AY-specific rows and expiry rules.
- Schedule UD.
- Schedule SI and special-rate exclusions from rebate.
- Part B-TI.
- Part B-TTI, including 234A/B/C, 234F and applicable relief/AMT paths.

### Stage D — credits and submission

- Schedule IT, TDS1, TDS2, TDS3 and TCS.
- Verification and representative details.
- Official-schema mapper.
- JSON Schema validation and CBDT Category A/B/D validation report.

## 8. Validation architecture

Use three layers:

1. **Domain invariants** — balanced books, positive-only fields, valid dates, percentages,
   ledger roll-forwards and cross-schedule equations.
2. **CBDT validation rules** — versioned rule IDs with Category A/B/D severity, source
   citation, required facts and affected schedule paths.
3. **Official JSON Schema** — final structural/type/enum validation against the pinned
   AY 2026-27 schema.

Behavior must match the official meanings:

- Category A: block export/upload.
- Category B: allow generation but show possible defective-return risk under section 139(9).
- Category D: allow generation but warn that a claim may not be allowed without the
  required form or particulars.

The existing validation registry can be generalized, but ITR-1 checks and ITR-3 checks
must live in separate AY/form rule packs.

## 9. Repository design

Recommended structure:

```text
backend/engine/
├── common/                         # extracted gradually; existing behavior preserved
├── itr3/
│   ├── models.py
│   ├── scope.py
│   ├── audit.py
│   ├── books.py
│   ├── business_profit.py
│   ├── trading.py
│   ├── losses.py
│   ├── schedules/
│   ├── validations/
│   └── orchestrator.py
└── rules/ay2026_27/itr3/
    ├── constants.py
    ├── schema.json
    ├── schema.sha256
    ├── metadata.json
    └── validation_manifest.json

frontend/lib/itr3/
├── types.ts
├── draftAdapter.ts
├── scheduleViewModels.ts
├── readiness.ts
└── officialJsonMapper.ts
```

The backend should own tax computation. TypeScript may validate and render results but
must not independently reproduce tax rules.

## 10. Implementation sequence

### Phase 0 — freeze and fixtures

- Preserve the current 540 passing backend tests.
- Add explicit regression fixtures for ITR-1 and ITR-2 before shared refactors.
- Rename user-facing foundation exports so they cannot be confused with official JSON.

### Phase 1 — source pinning and contract

- Vendor the official v1.1 schema with URL, release date and SHA-256.
- Create an AY/form artifact registry and change watcher.
- Generate TypeScript/Python schema types where practical; do not hand-copy 24k lines.
- Add schema-version rejection for unknown or stale artifacts.

### Phase 2 — canonical facts and scope

- Add ITR-3 models, provenance and missing/not-applicable semantics.
- Implement `supported`, `guided`, `ca_required`, `blocked` scope verdicts.
- Implement the complete audit classifier and Form 10-IEA state machine.

### Phase 3 — books and business computation

- Build P&L, balance sheet, trading account and depreciation schedules.
- Implement P&L-to-Schedule-BP tax adjustments.
- Keep F&O non-speculative and intraday speculative calculations separate.

### Phase 4 — losses, tax and credits

- Build typed CYLA/BFLA/CFL/UD ledgers.
- Integrate common income heads and the existing tax engine.
- Add advance-tax interest and row-level TDS/TCS credit allocation.

### Phase 5 — validation and official export

- Implement launch-scope Category-A rules first, then B and D.
- Map computed schedule outputs to `ITR.ITR3` v1.1.
- Validate against the official JSON Schema.
- Compare generated returns with the official utility using anonymized golden cases.

### Phase 6 — product integration

- Add business-profile, books, trading, audit and reconciliation steps behind an ITR-3
  feature flag.
- Reuse the existing family/profile, document, payment and review journeys.
- Show schedule readiness and evidence, not raw schema field names.
- Keep unsupported cases on a guided/CA handoff path.

### Phase 7 — controlled rollout

- Internal fixtures, then staff-only flag, then limited non-audit sole-proprietor cases.
- No official JSON download until schema, Category-A, cross-schedule and differential
  test gates all pass.
- Monitor portal schema releases and disable export automatically on unknown drift.

## 11. Test gates

### Computation

- Unit tests for every schedule subtotal and tax adjustment.
- Golden cases for ordinary business, profession, F&O profit/loss, intraday loss,
  depreciation, multiple businesses and combined income heads.
- Property-based tests for balance-sheet equality, loss conservation, monotonic tax,
  no negative credits and no cross-bucket speculative set-off.

### Audit and filing choices

- ₹1 crore and ₹10 crore boundary ladders with both cash-receipt and cash-payment ratios.
- ₹50 lakh professional-receipt boundary.
- Lower-than-presumptive-income and Form 10-IEA scenarios.
- Original, revised, belated, defective-response and updated-return filing states.

### Compliance

- Every launch-scope Category-A rule has pass/fail fixtures.
- Category B/D messages preserve the official consequence without overstating it.
- Official schema accepts every “export ready” golden return.
- Differential totals match the CBDT utility for anonymized reference cases.

### Regression

- ITR-1 and ITR-2 outputs and routing remain byte-for-byte or semantically unchanged
  for frozen fixtures.
- API, payment entitlement, active taxpayer profile and VPS deployment contracts remain
  unchanged.

## 12. Definition of done

ITR-3 is “working” only when a supported case:

1. is routed correctly;
2. has complete source facts and provenance;
3. produces balanced statutory schedules;
4. computes business income, losses, regime and tax correctly;
5. passes all applicable Category-A validations;
6. reports Category-B/D warnings clearly;
7. validates against the pinned official JSON schema;
8. matches the official utility on golden cases;
9. survives refresh/profile switching/payment entitlement; and
10. does not alter frozen ITR-1 or ITR-2 results.

## 13. Primary references

- Income Tax Department AY 2026-27 downloads:
  https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns
- ITR-3 JSON Schema v1.1:
  https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-07/ITR-3_2026_Main_V1.1.json
- ITR-3 schema change document v1.1:
  https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-07/ITR%203_Schema%20change%20document_AY2026-27_V1.1_0.pdf
- ITR-3 validation rules v1.0:
  https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-06/CBDT_e-filing_ITR-3_Validation%20Rules_V1.0_AY%2026-27.pdf
- Notified ITR-3 form:
  https://www.incometaxindia.gov.in/documents/d/guest/itr-3-2026-eng-pdf
- Official business/profession guidance for AY 2026-27:
  https://www.incometax.gov.in/iec/foportal/help/individual-business-profession
- Official Income-tax Act transition FAQ:
  https://www.incometaxindia.gov.in/documents/81799/11848482/Updated-FQAs-on-Interplay%26Transitions.pdf/e10ad2b6-9495-de90-58d3-20606d8954ae
- Section 44AB text:
  https://www.incometaxindia.gov.in/w/section-44ab-40
