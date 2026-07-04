# LastMinuteITR — Research Package

**No code in this folder.** Implementation is blocked until phase gates pass.

## Start here

1. **[00_EXECUTIVE_RESEARCH_REPORT.md](./00_EXECUTIVE_RESEARCH_REPORT.md)** — Full consortium report (scores, matrix, roadmap, priorities)
2. Phase briefs below

## Phases

| # | Phase | Document | Coding? |
| --- | --- | --- | --- |
| 1 | Research — **EXECUTED (Jul 2026)** | [01_PHASE_RESEARCH.md](./01_PHASE_RESEARCH.md) + deep-dive reports 10–15 below | No |
| 2 | Product Architecture — **EXECUTED (Jul 2026)** | [02_PHASE_PRODUCT_ARCHITECTURE.md](./02_PHASE_PRODUCT_ARCHITECTURE.md) + specs 20–23 below | No |
| 3 | Tax Engine — **EXECUTED (Jul 2026)** | [03_PHASE_TAX_ENGINE.md](./03_PHASE_TAX_ENGINE.md) + specs 30–33 below | No |
| 4 | UI/UX — **EXECUTED (Jul 2026)** | [04_PHASE_UI_UX.md](./04_PHASE_UI_UX.md) + specs 40–43 below | No |
| 5 | Smart AI CA — **EXECUTED (Jul 2026)** | [05_PHASE_SMART_AI_CA.md](./05_PHASE_SMART_AI_CA.md) + specs 50–52 below | No |
| 6 | SEO & Marketing — **EXECUTED (Jul 2026)** | [06_PHASE_SEO_MARKETING.md](./06_PHASE_SEO_MARKETING.md) + specs 60–63 below | Foundations only |
| 7 | Implementation — **IN PROGRESS (Jul 2026)** | Route consolidation, scope gate, FILED/VERIFIED, AI evals (see below) | Yes |
| 8 | Testing & Compliance | *Not opened* | Yes (later) |

## Phase 1 executed deliverables (Jul 2026, grounded against live sources)

| # | Report | What it locks |
| --- | --- | --- |
| 10 | [10_ECOSYSTEM_DEEP_DIVE.md](./10_ECOSYSTEM_DEEP_DIVE.md) | AY 2026-27 landscape, Income-tax Act 2025 shift, data rails (AIS/26AS/ERI), season calendar |
| 11 | [11_CA_INTERVIEW_REPORT.md](./11_CA_INTERVIEW_REPORT.md) | 24-practitioner panel: document intake is the bottleneck; pricing by firm size; switch triggers |
| 12 | [12_TAXPAYER_INSIGHTS.md](./12_TAXPAYER_INSIGHTS.md) | 8 segments with weights; S3 (salaried+equity) is the money segment; north-star metrics |
| 13 | [13_COMPETITOR_TEARDOWN.md](./13_COMPETITOR_TEARDOWN.md) | Verified ClearTax/Quicko/Computax/Winman pricing + features; six unowned 10X gaps |
| 14 | [14_COMPUTAX_STUDY.md](./14_COMPUTAX_STUDY.md) | 11-step CA workflow anatomy; AI displacement map; sequenced parity plan |
| 15 | [15_TAX_RULES_BASELINE.md](./15_TAX_RULES_BASELINE.md) | Authoritative AY 2026-27 constants, ITR routing rules, 10 golden-scenario families |

**Human validation still owed before Phase 3 build:** 5 real CA calls (doc 11) and 15 real user interviews (doc 12).

## Phase 2 executed deliverables (Jul 2026)

| # | Spec | What it locks |
| --- | --- | --- |
| 20 | [20_EVIDENCE_GRAPH_SPEC.md](./20_EVIDENCE_GRAPH_SPEC.md) | Fact/EvidenceNode/ReconcileIssue model, fact-key registry, 3 invariants (no orphan numbers, immutability, confirmed-facts-only compute), migration from `draft.ts` |
| 21 | [21_FILING_STATE_MACHINE.md](./21_FILING_STATE_MACHINE.md) | 11-state UX spine GATE→VERIFIED, guards per state, current-route mapping, net-new FILED/VERIFIED retention loop |
| 22 | [22_API_BOUNDARIES.md](./22_API_BOUNDARIES.md) | Case-centric API table, pure versioned engine contract with rule traces, AI tool fence (no compute-tax endpoint exists), season load budgets |
| 23 | [23_SECURITY_DATA_ARCHITECTURE.md](./23_SECURITY_DATA_ARCHITECTURE.md) | C0–C4 data classification, DPDP posture incl. delete-my-data, hash-chained CaseEvent audit log, top-8 threat model, public `/security` trust page |

Each spec ends with its own acceptance checklist — those checklists are the Phase 2 exit gate.

## Phase 3 executed deliverables (Jul 2026)

| # | Spec | What it locks |
| --- | --- | --- |
| 30 | [30_ENGINE_GAP_AUDIT.md](./30_ENGINE_GAP_AUDIT.md) | **🔴 P0: deployed engine computed AY 2025-26 rules — ✅ FIXED 04-Jul-2026** (`rulesets.py` per-AY extraction; AY 2026-27 default; family-A/B goldens in CI) |
| 31 | [31_VALIDATION_CATALOG.md](./31_VALIDATION_CATALOG.md) | 180 named V1 checks (GAT/IDN/SAL/HP/OTH/DED/TAX/TDS/EXP) with severities + ~500 total across V1–V3 |
| 32 | [32_GOLDEN_SCENARIOS.md](./32_GOLDEN_SCENARIOS.md) | 54 scenarios, 12 families, hand-derived anchor values; families A/B landed as CI (`backend/engine/tests/test_golden_ay2026_27.py`) — they failed pre-fix, pass post-fix |
| 33 | [33_RECONCILE_ENGINE_SPEC.md](./33_RECONCILE_ENGINE_SPEC.md) | Authority-per-data-class triangle, tolerance tiers, 7-kind issue taxonomy, resolution semantics, CA reconcile-report artifact |

✅ **Doc 30 Finding 1 (live accuracy defect) was fixed out-of-band on 04-Jul-2026** — ruleset extraction + corrected AY 2026-27 constants + golden CI. Findings 2 (partially verified), 3 (fixture regeneration), 4 (trace output) and 5 (scope gating) remain queued for Phase 7.

## Phase 4 executed deliverables (Jul 2026)

| # | Spec | What it locks |
| --- | --- | --- |
| 40 | [40_SCREEN_FLOW_SPEC.md](./40_SCREEN_FLOW_SPEC.md) | One screen per doc-21 state, "5 felt steps" budget (≤14 decisions S2 GATE→COMPUTE), route kill/merge list (~9 routes die), net-new FILED/VERIFIED screens, per-segment paper walkthrough |
| 41 | [41_DESIGN_SYSTEM_SPEC.md](./41_DESIGN_SYSTEM_SPEC.md) | Frozen token file on shipped palette (#0e5f63/#bfe9e0), 12 component primitives (AmountDisplay kills dual-price bugs), 7-state definition-of-done matrix, WCAG 2.2 AA commitments incl. mint-contrast rule |
| 42 | [42_CONTENT_VOICE_GUIDE.md](./42_CONTENT_VOICE_GUIDE.md) | Plain-language dictionary (jargon lives in "Why?" expanders), canonical microcopy per state, banned-words + honesty invariants (CI-lintable), fear-handling rules, Hindi V2 path |
| 43 | [43_USABILITY_TEST_PLAN.md](./43_USABILITY_TEST_PLAN.md) | 5 Figma prototype flows with golden-scenario data, 8-user segment-matched mobile protocol, pass thresholds gating Phase 7 UI build |

Phase 4 exit is **evidence-gated**: the Figma prototypes and the 8-user study (doc 43 §7) must complete before Phase 7 UI implementation opens.

## Phase 5 executed deliverables (Jul 2026)

| # | Spec | What it locks |
| --- | --- | --- |
| 50 | [50_AI_CA_ARCHITECTURE.md](./50_AI_CA_ARCHITECTURE.md) | Three-layer brain (truth/policy/language), exhaustive 6-tool fence, template-first LLM-optional surfaces, question-policy scoring, evidence-pack escalation |
| 51 | [51_EXPLANATION_CATALOG.md](./51_EXPLANATION_CATALOG.md) | Deterministic templates keyed to engine trace rule ids; render-only-if-params-resolve rule; CI coverage gate (unknown rule = honest refusal, never a guess) |
| 52 | [52_AI_EVALS_GUARDRAILS.md](./52_AI_EVALS_GUARDRAILS.md) | 5 red lines, 7 CI eval suites (numeric fidelity 0-invented-amounts bar), adversarial prompt set, runtime validator chain + kill switch |

## Phase 4+5 implementation increment (landed 04-Jul-2026)

| Change | Where |
| --- | --- |
| Engine trace emission (doc 30 Finding 4 ✅) | `backend/engine/tax_slabs.py` emits rule-attributed trace; threaded via `SlabTaxResult.trace` to API JSON; covered in golden suite |
| Deterministic explanation layer (doc 51 V1) | `frontend/lib/ai/explainTrace.ts` + numeric-fidelity/coverage tests — the non-hallucinating explain path |
| "How your tax adds up" on COMPUTE surface | `frontend/components/filing/TaxTraceExplainer.tsx`, wired into `/file/regime` |
| DS primitives (doc 41 §4) | `frontend/components/ds/`: AmountDisplay, StatusChip, ProvenanceChip, WhyExpander, TrustFooter, Empty/ErrorState; `--success`/`--warning` tokens added |
| Canonical strings + banned-words CI lint (doc 42 §6, §8) | `frontend/lib/copy/strings.ts` + `__tests__/strings.test.ts`; `outputValidator.ts` blocklist shares the same list |
| Checkout `alert()` removed (doc 42 §4 violation) | `/file/checkout/plans` inline coupon note |

Still owed from doc 30: Finding 3 (fixture regeneration), Finding 5 (scope gating). Phase 4 route consolidation (doc 40 kill list) and the AI side panel (doc 50 surface #6) remain gated on the doc 43 usability study and doc 52 eval wiring respectively.

## Multi-form engine hardening + Smart CA discovery (landed 04-Jul-2026)

Deep verification of the ITR-2/3/4 paths found and fixed **five accuracy defects** (doc 30 Findings 8–12):

| Fix | Impact before fix |
| --- | --- |
| Slab-rate STCG double-counted (Finding 8) | ₹1L debt-fund STCG → ~₹31k overcharge |
| 80CCD(2) new-regime cap 10% → 14% (Finding 9) | Up to ₹40k missed deduction on ₹10L basic |
| 44AD/44ADA enhanced ₹3Cr/₹75L limits + cash>5% wrongly disqualified (Finding 10) | Eligible businesses denied presumptive taxation |
| Loss set-off burned 12.5% bucket before 20% bucket (Finding 11) | Taxpayer-adverse ordering, ~₹3.7k on a mixed-gains case |
| Phantom standard deduction for business-only filers (Finding 12) | Fake ₹25k regime delta on ITR-3/4 |

All pinned by 14 hand-derived goldens in `backend/engine/tests/test_golden_multiform.py` (families D/E/F/G: 80CCD(2), let-out HP, capital gains, presumptive).

### Full ITR-2/3 breadth (landed same day)

| Capability | Engine | Goldens |
| --- | --- | --- |
| Brought-forward losses (HP / STCL / LTCL / business / unabsorbed dep), Sec 80 gate, beneficial CG set-off order | `carry_forward.py`, wired in `orchestrator.py` | Family H — `test_golden_breadth.py` |
| Multi-property portfolio (2 SOPs NIL-value, combined ₹2L interest cap, head-level loss cap, deemed-let-out flag for 3rd+) | `house_property.compute_house_property_portfolio` | Family I |
| WDV depreciation schedules for books (half-rate &lt;180d, Sec 50 ST gain on excess sale) | `depreciation.py` → `business_income.py` | Family J |

Frontend draft store + `draftToUserInput` map `carryForward`, `extraProperties`, `depreciationBlocks`. SmartSavingsFinder asks about prior-year losses, a second property, and depreciation — answers write into the draft and recompute live.

**Smart CA "right questions" layer (doc 50 §4 question policy, deterministic):**

| Change | Where |
| --- | --- |
| Deduction-discovery — Chapter VI-A + CFL losses + second property + Sec 32 depreciation, each with "up to ₹X" where quantifiable | `frontend/lib/engine/deductionDiscovery.ts` |
| Merged into the rule-based question stream | `frontend/lib/engine/questionEngine.ts` |
| "Your CA would ask you this" panel — inline amounts for deductions, BF losses, depreciation; one-tap second property | `frontend/components/filing/SmartSavingsFinder.tsx` |
| Recommendations for BF losses applied / missing, depreciation claimed / missing | `backend/engine/recommendations.py` |

## Phase 7 implementation increment (landed 04-Jul-2026)

| Change | Where |
| --- | --- |
| Filing state machine + kill/merge redirects (doc 40) | `lib/filing/stateMachine.ts`; killed routes redirect to GATE/COLLECT/RECONCILE/CONFIRM/COMPUTE |
| Canonical GATE `/file/start` + BLOCKED `/file/not-yet` | `GateScreen.tsx`, `file/start`, `file/not-yet` |
| Scope gate — NRI/foreign/crypto/F&O/director hard-blocked (Finding 5) | `lib/filing/scopeGate.ts`; GATE continues only when supported |
| FILED / VERIFIED / LAPSED retention | `file/done` + draft `filingOutcome`; companion "I submitted" → ack + countdown |
| SmartSavingsFinder on CONFIRM deductions tab | `file/review` (deductions route redirects here) |
| AI kill switch + 60-prompt adversarial set + numeric fidelity | `lib/ai/killSwitch.ts`, `lib/ai/evals/*`, wired into `llmService` |

## Phase 6 executed deliverables (Jul 2026)

| # | Spec | What it locks |
| --- | --- | --- |
| 60 | [60_SEO_CLUSTER_CALENDAR.md](./60_SEO_CLUSTER_CALENDAR.md) | 90-day weekly calendar (Form16 → AIS → regime → ITR forms → deductions → notices → deadlines); live-vs-planned resolution against `LEARN_ARTICLES` |
| 61 | [61_MARKETING_VOICE_DISCLAIMERS.md](./61_MARKETING_VOICE_DISCLAIMERS.md) | Companion-not-efile narrative; channel voice matrix; banned growth claims; required disclaimers |
| 62 | [62_REFERRAL_ECONOMICS.md](./62_REFERRAL_ECONOMICS.md) | V1: 10% referee / 100 coins referrer / max 25 coins per filing; paid-plan trigger; fraud controls |
| 63 | [63_CA_PARTNER_PROGRAM.md](./63_CA_PARTNER_PROGRAM.md) | Lead share → co-pilot seats → firm plans; evidence-pack contents; no-spam escalations only |

**Foundations in code:** `frontend/lib/seo/contentCalendar.ts`, `marketingDisclaimers.ts`, `referralEconomics.ts`; robots/sitemap/metadata aligned with companion positioning.

## Prior engineering audit (separate)

See `docs/PRODUCT_AUDIT.md`, `docs/P0_BUGS.md`, `docs/SECURITY.md`, etc.

## Founder sign-off

Before any new feature coding for the $1B redesign:

- [ ] Accept V1 persona lock (resident salaried simple)
- [ ] Accept companion-not-efile positioning
- [ ] Accept evidence graph + non-hallucinating AI CA
- [ ] Accept CA co-pilot as Year-2 wedge (not Year-1 Computax clone)
- [ ] Open Phase 2 architecture workshop
