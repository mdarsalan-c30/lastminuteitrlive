# 33 — Reconcile Engine Specification (Phase 3, Executed)

> The crown-jewel capability per Phase 1 (CAs' paid skill — doc 11 Finding 2; the unowned consumer 10X gap — doc 13 §4.1). Defines matching, tolerances, issue taxonomy, and resolution semantics over the evidence graph (doc 20). No code.
> Grounding: existing `frontend/lib/filing/reconciliation.ts` and `reconcileAis26as.ts` become emitters of this spec's issue records.

## 1. Scope: the reconciliation triangle

Sources ranked by authority **per data class** (authority is class-specific, not global):

| Data class | Authoritative | Secondary | Tertiary |
|---|---|---|---|
| TDS credits | **26AS** (what CPC will allow) | Form 16 Part A | AIS |
| Salary amount | **Form 16 Part B** | AIS (SFT, often gross/duplicated) | user memory |
| Interest income | **AIS** (bank-reported) | bank certificate | user |
| Dividend | **AIS** | broker statement | user |
| What the user actually earned | **the user**, under attestation | — | — |

Principle: we never silently pick a winner. Authority ranking only decides the *default suggestion*; the user (or CA) resolves, and the resolution is an attested fact with provenance (doc 20 §2.4).

## 2. Matching algorithm (line-level, before comparing totals)

1. **Key construction:** per line, build match keys — TDS: `(TAN, section, quarter)`; interest: `(reporting entity FUZZY, info code)`; salary: `(employer TAN)`; dividend: `(company/ISIN)`.
2. **Entity fuzzy-match:** bank/employer names differ across sources ("SBI" vs "STATE BANK OF INDIA" vs branch names). Normalized token match ≥ 0.8 → same entity; below → `possible_duplicate_entity` issue rather than a wrong merge.
3. **Aggregation before diff:** AIS reports transaction-level; Form 16/26AS report totals. Sum AIS lines per key, then compare totals. Never diff a transaction against a total.
4. **Dedup within AIS:** identical `(entity, amount, date, info code)` lines → single logical line with `duplicate_in_source` note (AIS is known-noisy — doc 10 §4).

## 3. Tolerances & materiality (versioned in the ruleset)

| Tier | Condition (per compared line) | Result |
|---|---|---|
| Ignore | Δ ≤ ₹10 (rounding artifacts) | auto-align to authoritative, `I` note only |
| Minor | Δ ≤ max(₹1,000, 1% of line) | issue severity `info`, one-tap accept |
| Material | Δ > minor threshold | severity `warn`, must resolve before CONFIRM exit |
| Critical | affects TDS credit, or Δ changes tax by > ₹5,000, or income class entirely missing from user facts | severity `blocking` |

Special rule — **missing income beats missing tolerance:** any AIS income line with no corresponding user fact is at least `warn` regardless of amount (OTH-004; small omitted interest is the #1 real-world mismatch-notice cause — doc 10 §5.3).

## 4. Issue taxonomy (what the user sees as cards)

| Kind | Example card headline | Default suggestion |
|---|---|---|
| `value_mismatch` | "Form 16 shows salary ₹12,40,000 but AIS shows ₹12,90,000" | trust Form 16; explain AIS gross-vs-net quirk |
| `missing_in_user` | "AIS shows ₹42,000 dividend you haven't added" | add it (pre-filled) |
| `missing_in_source` | "You declared FD interest ₹18,000 that AIS doesn't show" | keep it (declaring more than AIS is safe); info only |
| `tds_credit_gap` | "Your employer deducted ₹95,000 TDS but 26AS shows ₹71,250" | claim only 26AS amount now; explain employer-deposit lag + how to follow up |
| `duplicate_source` | "HDFC interest appears twice in AIS" | merge; keep one |
| `possible_duplicate_entity` | "Are 'SBI Cardz' and 'SBI Cards & Payment Services' the same?" | ask user |
| `wrong_year` | "This Form 16 is for AY 2025-26" | quarantine (doc 20 guard) |

Card anatomy (feeds Phase 4 UX): both values **with provenance chips** (source doc, page), the ₹ delta, tax impact of each choice (computed via engine dry-run), one-sentence AI explanation citing the rule id, and 2–3 resolution buttons. Every resolution writes: new confirmed Fact + Attestation + CaseEvent.

## 5. Resolution semantics

- `accept_authoritative` / `accept_other`: winner becomes the confirmed fact; loser retained as evidence (not deleted) for the notice-defense pack.
- `user_override`: user types a third value → `manual_entry` provenance + mandatory attestation text; severity of downstream RISK entry escalates one tier (overrides are where audits find problems).
- `acknowledge_immaterial`: allowed only for `info` tier.
- Unresolved `blocking` issues freeze CONFIRM→COMPUTE (doc 21 exit guard).
- Bulk mode for CA partners: resolve-all-minor per client, but each still logs individually.

## 6. Outputs

1. **Reconcile summary fact-set:** `reconcile.issuesFound`, `.resolved`, `.overridden`, `.aisSkipped` — consumed by RISK state and by TDS-00x validations.
2. **Reconcile report (PDF/JSON):** the CA wedge artifact (doc 11 GTM step 1 — "free reconcile report for 20 clients"). Same engine, two skins: consumer cards vs CA table.
3. **Metrics:** reconcile coverage (north-star, doc 12), issue rate per source pair, override rate (quality alarm if > 10%).

## 7. Test plan (extends doc 32)

- Fixture pairs: (Form 16, AIS, 26AS) synthetic triples for each taxonomy row — 7 kinds × 3 tiers ≈ 21 fixtures.
- Property test: reconcile(A,B) findings == reconcile(B,A) findings (order-independence).
- Adversarial AIS: duplicates + name variants + paise-level rounding in one file.
- Zero-source degradation: only Form 16 present → no issues, `aisSkippedByUser` attestation path exercised (doc 21 §3.3).

## Acceptance criteria (Phase 3 gate, this doc)

- [ ] Authority-per-class table reviewed by a CA (esp. tds_credit_gap guidance)
- [ ] Tolerance tiers signed off (₹10/₹1,000/1%/₹5,000 numbers are proposals)
- [ ] Card anatomy handed to Phase 4 as a UX requirement
- [ ] CA reconcile-report skin confirmed as the partner GTM artifact
