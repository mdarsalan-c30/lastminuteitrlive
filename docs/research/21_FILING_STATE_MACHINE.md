# 21 — Filing State Machine (Phase 2, Executed)

> The single UX spine. Every screen, API call, and AI intervention hangs off a state. No code; this is the contract.
> Grounding: current routes under `frontend/app/(app)/file/*` (onboarding/eligibility, checkout/plans), `lib/filing/journey.ts`, `lib/filing/routes.ts`, `lib/filing/navStatus.ts`.

## 1. States

```
GATE ──▶ COLLECT ──▶ EXTRACT ──▶ RECONCILE ──▶ CONFIRM ──▶ COMPUTE ──▶ RISK ──▶ ENTITLE ──▶ COMPANION ──▶ FILED ──▶ VERIFIED
  │                     │                                                                        │
  ▼                     ▼                                                                        ▼
BLOCKED             PARSE_FAILED (per-doc, non-terminal)                                    LAPSED (30-day e-verify missed)
```

Terminal: `BLOCKED`, `VERIFIED`, `ABANDONED` (implicit, via inactivity). Everything else is resumable — a case is a save file, not a session.

## 2. State contract table

| State | User sees | Entry guard | Exit guard (→ next) | AI CA role (doc 05) |
|---|---|---|---|---|
| **GATE** | 5–8 persona questions (the quiz is the front door — doc 12) | none | All 14 ITR-1 gates answered; verdict `supported` → COLLECT, `unsupported` (NRI/RNOR, VDA, business w/ books, STCG…) → BLOCKED with honest routing | Explains *why* a question is asked, one sentence |
| **BLOCKED** | "We can't file this correctly yet" + portal/CA routing + email capture | any hard gate hit | none (re-enter GATE if answers change) | Explains which fact blocked and what form they actually need |
| **COLLECT** | Doc checklist personalized from GATE answers; upload zone | persona supported | Minimum docset present: Form 16 (salaried) — AIS/26AS optional-but-nudged | Generates the checklist; nudge copy |
| **EXTRACT** | Per-doc progress + confidence chips; **no parsing theater** — real progress only | ≥1 doc | All uploaded docs `parsed` or `failed`; failed docs offer manual-entry fallback (creates `manual_entry` EvidenceNode) | Never invents values; summarizes what was found |
| **RECONCILE** | Mismatch cards, one decision each ("AIS shows ₹42,000 dividend — add it / I dispute") | ≥2 sources OR AIS present | Zero `blocking` ReconcileIssues open; `warn` issues acknowledgeable | Drafts the plain-language explanation per card; **decision is the user's** |
| **CONFIRM** | Prefill review; only low-confidence (<0.85) fields demand touch | all issues resolved | All engine-required facts `confirmed` | Answers "why is this number here?" with provenance citation |
| **COMPUTE** | Regime comparison verdict card, refund/tax number with run id | confirmed factset | ComputationRun success | Explains the regime verdict + 87A/marginal-relief in plain language, citing the run |
| **RISK** | Notice-risk checklist (AIS gaps acknowledged, loss-carry-forward warnings, belated-filing consequences) | run exists | User acknowledges each `warn`; no `blocking` validation open | Explains each risk, cites the validation rule |
| **ENTITLE** | Plan ladder with trigger transparency ("Your equity LTCG activates AI Smart — here's why") | risk acked | Paid, or within free limits | none (no AI in the paywall — trust rule) |
| **COMPANION** | Portal walkthrough: step-by-step ITD screens with our values side-by-side; ITR-1 JSON download | entitled | User marks "submitted on portal" + uploads/enters acknowledgement no. | Reads the portal step aloud, answers "where do I click" |
| **FILED** | E-verify countdown (30 days), refund tracking expectations | ack no. | e-verify confirmed → VERIFIED; 30 days elapse → LAPSED alert | Explains e-verify options (Aadhaar OTP/EVC) |
| **VERIFIED** | Celebration + refund tracker + next-year reminder opt-in | | | Season-close summary; referral moment (S1 delight, doc 12) |

## 3. Transition rules that encode Phase 1 findings

1. **GATE re-entry invalidates downstream.** Changing a gate answer (e.g. "actually I sold stocks") retracts the verdict and re-routes; existing Facts survive but ComputationRuns are stale-marked. Prevents the wrong-form 139(9) failure (doc 10 §5).
2. **EXTRACT can never fabricate.** `PARSE_FAILED` is a per-document sub-state offering manual entry — the state machine structurally cannot produce a demo value (Invariant from doc 20).
3. **RECONCILE is skippable only by attestation.** If user uploads no AIS, exiting COLLECT requires the attestation fact `gate.aisSkippedByUser = true` — recorded, shown in RISK as elevated notice-risk. Honesty is preserved; friction is opt-out not silent.
4. **ENTITLE sits after value, before output.** Refund number is visible in COMPUTE (free); the paywall gates COMPANION/JSON — mirrors ClearTax's "pay later" but with fixed, trigger-explained pricing (doc 13 §2, §5).
5. **Belated-season variant:** after 31 Jul 2026, RISK injects mandatory 234F fee disclosure + loss-carry-forward-denial warning before ENTITLE (doc 15 §6–7).
6. **Family-filing mode** (S6): the case carries `operator != taxpayer`; COMPANION and FILED notifications go to the operator; attestations record who attested.

## 4. Mapping to current routes (migration, not rewrite)

| Current route | State it becomes |
|---|---|
| `/file/onboarding/eligibility` (incl. NRI hard block — already shipped) | GATE / BLOCKED |
| Document upload flow + `api/documents/upload` | COLLECT / EXTRACT |
| `lib/filing/reconciliation.ts` surfaces | RECONCILE (new dedicated screen) |
| Draft review pages | CONFIRM (consolidate duplicates — kill list from 02 doc) |
| Engine result pages (`useDraftTaxCompute`) | COMPUTE |
| Risk checker output (`backend/engine/risk_checker.py`) | RISK (gets its own state instead of a sidebar) |
| `/file/checkout/plans` | ENTITLE |
| Portal SOP (`lib/filing/portalSop.ts`, portal guide engine) | COMPANION |
| — (missing today) | FILED / VERIFIED / LAPSED — **net-new; this is the retention loop** |

**Biggest structural gap in the current app:** the journey ends at export. FILED → VERIFIED → refund tracking is where retention, referral, and next-season re-engagement live (doc 12 north-star "safe-filing rate" ends at VERIFIED, not at JSON download).

## 5. Persistence & resumability

- State + factset persisted server-side per case; a user returning after 10 days lands exactly where they left (S7 panic-users often start, gather documents, return).
- Every transition appends a CaseEvent (doc 23) — the audit replay for notice defense.
- Deep links per state (`/case/:id/reconcile`) for nudge emails/WhatsApp ("2 mismatches waiting for you").

## 6. Acceptance criteria (Phase 2 gate)

- [ ] All 8 taxpayer segments (doc 12) walk the machine on paper without dead ends
- [ ] Belated + revised-return variants sketched (post-July states)
- [ ] Kill-list of current duplicate screens enumerated against CONFIRM consolidation
- [ ] FILED/VERIFIED scope agreed (V1: manual ack entry + e-verify reminder; no portal scraping)
