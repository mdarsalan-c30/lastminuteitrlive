# 20 — Evidence Graph Specification (Phase 2, Executed)

> Turns Phase 1 findings into the canonical domain model. No code; this is the contract that Phase 3 (engine) and Phase 4 (UX) implement against.
> Grounding: current `frontend/lib/store/draft.ts` (client draft with `ParseMode = "extracted" | "demo_fallback"`), `backend/engine/orchestrator.py` (`compute_itr(user) -> ITRResult`, already pure), `frontend/lib/db/` (Postgres store).

## 1. Why a graph, not a form

Phase 1 locked three requirements the current flat draft cannot satisfy:

1. **Reconcile with explanations** (docs 11, 13): we must show "AIS says ₹42,000, you said ₹0, Form 26AS confirms TDS" — that requires every number to know *where it came from*.
2. **Never show a number we didn't derive from evidence** (doc 12 funnel truth): provenance must be structural, not a convention.
3. **Notice defense** (doc 10 §5): when a user gets a 143(1) mismatch, we must replay exactly what we knew and why we filed what we filed — an audit trail per fact.

## 2. Core entities

```
TaxpayerCase (one per PAN per AY)
 ├── PersonaGate            — routing answers, supported/blocked verdict
 ├── EvidenceNode[]         — uploaded/imported artifacts + extractions
 ├── Fact[]                 — canonical tax facts (THE graph nodes)
 ├── ReconcileIssue[]       — derived conflicts between facts
 ├── Attestation[]          — user statements ("I confirm no other income")
 ├── ComputationRun[]       — immutable engine outputs, versioned
 ├── ItrDraft               — form-specific schedule projection
 ├── CompanionSession       — portal walkthrough progress
 ├── Entitlement            — plan, payment ref, expiry
 └── CaseEvent[]            — append-only audit log (see doc 23)
```

### 2.1 EvidenceNode

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| caseId | fk | |
| sourceType | enum | `form16`, `ais`, `form26as`, `broker_cas`, `bank_cert`, `rent_receipt`, `manual_entry`, `prior_year_import`, `itd_prefill_json` |
| classification | struct | auto-classifier output: docType, detectedAY, detectedPAN, confidence |
| rawRef | string | encrypted object-storage pointer; **never inline bytes in DB** |
| parseMode | enum | `extracted` \| `failed`. **`demo_fallback` is deleted from the type system** — a failed parse produces zero facts, never placeholder facts |
| extractions[] | list | `{ fieldPath, value, confidence [0..1], locator (page/bbox/row), parserVersion }` |
| status | enum | `pending`, `parsed`, `failed`, `superseded` (re-upload), `deleted` |

Guards enforced at write time:
- `detectedAY != case.ay` → node quarantined, user warned ("this Form 16 is for last year") — CA panel's #1 intake error (doc 11).
- `detectedPAN != case.pan` → hard block + privacy alert (possible wrong-person upload).

### 2.2 Fact — the atomic unit

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| caseId | fk | |
| factKey | string | namespaced path, catalog below |
| value | json scalar | number/string/bool/date |
| unit | enum | `inr`, `count`, `ratio`, `date`, `text` |
| provenance | struct | `{ kind: evidence \| attestation \| computed \| prior_year, refId, extractionRef? }` — **required, non-null** |
| confidence | float | inherited from extraction; `1.0` for attested/computed |
| status | enum | `proposed` (parser wrote it), `confirmed` (user or high-confidence auto), `disputed` (reconcile conflict open), `retracted` |
| supersedes | fk? | prior fact id — facts are immutable; corrections create new facts |

**Invariant 1 (no orphan numbers):** every value rendered in UI or fed to the engine resolves to a Fact with provenance. No component may display an ad-hoc number.
**Invariant 2 (immutability):** facts are never updated in place; `supersedes` chains give the audit replay.
**Invariant 3 (engine input = confirmed facts only):** `proposed`/`disputed` facts never enter a ComputationRun. This is what makes "we checked everything" an honest claim.

### 2.3 Fact key catalog (V1, ITR-1 scope + S3 boundary detection)

```
identity.pan, identity.dob, identity.residentialStatus
salary.employer[i].gross, .standardDeduction, .professionalTax, .tdsPerForm16
salary.employer[i].employerTan
houseProperty[i].type (self|letout), .rentReceived, .municipalTax, .interest24b
otherIncome.savingsInterest, .fdInterest, .dividend.total, .familyPension
capitalGains.equity.ltcg112a, .stcg111a          # presence of stcg111a > 0 → ITR-2 eject
capitalGains.lossesCarriedForward                 # > 0 → ITR-1 blocked
deductions.80c, .80d.self, .80d.parents, .80ccd1b, .80ccd2, .80g, .80tta, .80ttb
tds.salary.total, tds.nonSalary[i].{section, deductor, amount}   # from 26AS
taxesPaid.advanceTax[i], .selfAssessment[i]
gate.isDirector, gate.hasUnlistedShares, gate.hasForeignAssets, gate.hasVdaIncome,
gate.tds194n, gate.esopDeferral, gate.agriIncome
regime.election, regime.form10ieaFiled
```

Each key carries metadata in a static registry: display label (EN/HI), which ITR schedules consume it, which validations reference it, sensitivity class (doc 23). The registry is the single vocabulary shared by parsers, engine, reconcile, UI and the AI layer — the AI may only reference facts by key (non-hallucination contract, doc 05).

### 2.4 ReconcileIssue

Derived, never hand-created:

| Field | Notes |
|---|---|
| kind | `value_mismatch`, `missing_in_user` (AIS has it, user doesn't), `missing_in_ais`, `duplicate_source`, `tds_credit_gap` |
| factKeys[] | the conflicting facts (each side with provenance) |
| materiality | ₹ delta + severity (`info`/`warn`/`blocking`); thresholds from validation catalog (doc 03) |
| resolution | `accepted_source_a`, `accepted_source_b`, `user_attested_other`, `merged` — resolution writes a new confirmed Fact + Attestation |

### 2.5 ComputationRun

Immutable record per engine invocation: `{ inputFactsetHash, engineVersion, rulesetVersion (e.g. "AY2026-27.r3"), result (regimes, tax, refund), warnings[], createdAt }`. The UI's "your refund" always cites a run id. Re-running after a fact change creates a new run; the diff between runs powers "what changed" UX (S2 segment, doc 12).

## 3. Migration from today's code (mapping, not code)

| Today | Target |
|---|---|
| `IncomeDraft` flat fields in `lib/store/draft.ts` (client state) | Client keeps a *projection* of Facts for editing; server-side Fact table is truth |
| `ParseMode = "extracted" \| "demo_fallback"` | Type retired; `demo_fallback` deleted (P0 fix made it unreachable; Phase 2 removes it from the type) |
| `LastParseResult` per upload | Absorbed into EvidenceNode.extractions |
| `lib/filing/reconciliation.ts` ad-hoc comparisons | Emits ReconcileIssue records against Facts |
| Engine `UserInput` built from draft | Built by a single `factsToUserInput()` projector — the only bridge, exhaustively tested |
| Prior-year rollover (partner dashboard JSON blob) | `prior_year` provenance kind on imported Facts |

## 4. Acceptance criteria (Phase 2 gate for this spec)

- [ ] Fact registry v1 enumerated and reviewed against ITR-1 schema fields (every schema field maps to ≥1 factKey)
- [ ] Every Phase 1 golden-scenario family (doc 15 §7) expressible as a factset
- [ ] Reconcile triangle (Form 16 ↔ AIS ↔ 26AS) representable with zero schema changes
- [ ] `demo_fallback` removal signed off
- [ ] AI layer confirmed read-only over Facts (writes only Attestations via user confirmation)
