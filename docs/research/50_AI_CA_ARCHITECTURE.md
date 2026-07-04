# 50 — Smart AI CA Architecture (Phase 5, Executed)

> The AI CA is a **case manager with a language skin**, not a chatbot. Everything numeric is deterministic; the LLM narrates, asks, and routes. Grounding: doc 05 blueprint, doc 22 §4 tool fence, current AI code (`frontend/lib/ai/*` — llmService, outputValidator, explainFallback already point the right way).

## 1. The three-layer brain

```
┌──────────────────────────────────────────────────────┐
│ L3  LANGUAGE (LLM)      narrate · ask · route        │  may be down; product still works
├──────────────────────────────────────────────────────┤
│ L2  POLICY (code)       next-question ranking,       │  deterministic TS/Python
│                         escalation triggers,          │
│                         explanation template fill     │
├──────────────────────────────────────────────────────┤
│ L1  TRUTH (engine+facts) rulesets, trace, validations,│  the only source of numbers
│                          evidence graph, reconcile    │
└──────────────────────────────────────────────────────┘
```

**Load-bearing rule:** L3 can only present strings produced or approved by L2 from L1 data. If the LLM is unavailable, L2's template output ships verbatim — the AI CA degrades to a *slightly less warm* CA, never to a dumber or wronger one. (`explainFallback.ts` is the seed of this pattern; it becomes the primary path, not the fallback.)

## 2. Tool fence (exhaustive — anything not listed is denied)

| Tool | Returns | Never |
|---|---|---|
| `get_case(caseId)` | state, factset w/ confidence + provenance | raw documents |
| `get_engine_result(caseId, runId)` | ComputationRun + **trace lines** | recompute or adjust |
| `list_issues(caseId)` | ReconcileIssues + open validations (doc 31 ids) | resolve them |
| `explain(ruleId | factKey)` | L2-rendered explanation template (doc 51) | free-form tax advice |
| `propose_next_question(caseId)` | top-ranked question from L2 policy | invent questions |
| `draft_escalation_pack(caseId)` | evidence-pack summary for human CA | send it (user confirms) |

Contract invariants (doc 22 §4, restated as build rules):
1. **No numeric generation.** Every ₹-amount in an AI message is interpolated by the orchestrator from a Fact or trace line. The LLM output schema uses placeholders (`{{fact:salary.gross}}`) that L2 resolves; unresolvable placeholder = message rejected.
2. **Citations mandatory.** Every message persists `{factKeys[], ruleIds[]}`; empty citation set on a factual claim = rejected by validator.
3. **Case-scoped, entitlement-aware.** AI Smart features gate on `pro`; no AI on ENTITLE screen (trust rule).
4. `outputValidator.ts` blocklist extends with doc 42 banned words; validation failure falls back to the L2 template, never to a retry-loop that begs the model.

## 3. Surfaces (where the AI CA lives — from doc 40)

| Surface | State | L3 role |
|---|---|---|
| `WhyExpander` | every screen | one-sentence "why we ask / why this number", template-first |
| Conflict card narration | RECONCILE | plain-language headline per issue kind (doc 33 taxonomy) |
| Trace explainer | COMPUTE | regime verdict + 87A/relief lines in doc 42 language |
| Risk cards | RISK | consequence copy per validation id |
| Portal step help | COMPANION | "where do I click", reads step aloud |
| Side panel (Pro) | CONFIRM→COMPANION | conversational skin over the same tools; always shows the numbers card; every message has Sources chips |

**Killed:** FloatingGenie as a global overlay; full-page chat as a destination (`advisor`, `cabrain` routes — doc 40 kill list). Chat is a skin on a case, opened from a case.

## 4. Dynamic questionnaire policy (L2, deterministic)

Score each candidate question: `info_gain × urgency ÷ user_cost`.
- `info_gain`: how many engine-required facts it unlocks (from the missing-facts set) + whether it can flip the GATE verdict (gate questions always outrank).
- `urgency`: blocking validation > warn > optimization; belated-season deadlines boost 234F-related questions.
- `user_cost`: attest (low) < confirm (low) < type-a-number (med) < find-a-document (high).

Stop conditions: engine runnable + no blocking issues → offer COMPUTE; persona blocked → escalate; 3 consecutive skips → pause and show progress ("You can compute now with what we have — 2 things remain estimated").
Target (doc 05 eval): median ≤ 12 questions for V1 persona with Form 16 — measured, not aspired.

## 5. Escalation to human CA

Triggers: persona out of scope · material fact confidence < 0.85 after confirm attempt · user asks for a human · risk score ≥ threshold · reconcile dispute the user marks "this is wrong" twice.
Output: **evidence pack** — case summary, factset with provenance, trace of last run, open issues — a PDF/JSON a CA can bill against (doc 11: intake is the CA bottleneck; the pack IS the CA-funnel product seed), never a chat transcript.

## 6. Model tiering & cost

| Job | Tier |
|---|---|
| Template fill + placeholder resolution | no LLM (L2) |
| Warmth pass on templates, conflict narration | small/fast model |
| Side-panel conversation (Pro) | mid model, tool-calling |
| Anything writing to case state | **no model** — users and code write facts, models never do |

Season load (doc 22 §5): AI sheds first under load; compute/export never shed. Template-first design means shedding is invisible for 90% of surfaces.

## 7. Acceptance checklist (Phase 5 gate)

- [ ] Tool list above accepted as exhaustive
- [ ] Template-first (LLM-optional) confirmed for all six surfaces
- [ ] Question-policy scoring reviewed against the 8 doc-12 segments on paper
- [ ] Evidence-pack contents signed off by 1 practicing CA
- [ ] Eval plan (doc 52) approved before any LLM feature ships
