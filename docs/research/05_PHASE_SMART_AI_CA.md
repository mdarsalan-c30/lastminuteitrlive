# Phase 5 — Smart AI CA (Blueprint Only)

**Status:** ✅ **EXECUTED (Jul 2026)** — see specs [50_AI_CA_ARCHITECTURE](./50_AI_CA_ARCHITECTURE.md), [51_EXPLANATION_CATALOG](./51_EXPLANATION_CATALOG.md), [52_AI_EVALS_GUARDRAILS](./52_AI_EVALS_GUARDRAILS.md). First implementation increment (trace emission + deterministic explanation layer) landed 04-Jul-2026.  
**Depends on:** Phases 2–4  

**Critical:** This is **not a chatbot product**. Chat may exist as a skin; intelligence is a **case manager**.

---

## 1. Definition

**Smart AI CA** = an evidence-linked decision system that:

1. Maintains case state  
2. Asks only high-information-gain questions  
3. Reads documents into facts with confidence  
4. Runs deterministic tax engine  
5. Explains results with citations  
6. Surfaces notice risk  
7. Produces portal companion steps  
8. Escalates to human CA when out of scope  

---

## 2. Non-hallucination contract

| Allowed | Forbidden |
| --- | --- |
| Explain engine outputs | Invent tax amounts |
| Suggest deductions from rules | Claim ineligible deductions |
| Cite sections from rules DB | Cite case law not in DB |
| Ask clarifying questions | Assert facts not in evidence |
| Summarize mismatches | Hide low confidence |

**Implementation pattern:** LLM with **tools only**: `get_case`, `get_engine_result`, `list_issues`, `propose_next_question`, `explain(fact_id)`.

---

## 3. Dynamic questionnaire policy

```
while case incomplete:
  candidates = questions that unlock missing facts
  score = information_gain * urgency * user_cost
  ask top candidate
  update facts
  if persona blocked: stop and escalate
  if engine runnable and risks acceptable: offer compute
```

### Question types

| Type | Example |
| --- | --- |
| Gate | Residential status |
| Document | “Upload second Form16?” |
| Confirm | “AIS shows FD interest ₹18,400 — include?” |
| Attest | “Any other income not in AIS?” |
| Preference | “Prefer maximize refund or minimize notice risk?” (careful) |

**User feeling target:** “How did it already know that?” — because documents prefilled facts.

---

## 4. Capabilities map

| Capability | Engine | Rules | LLM | Docs |
| --- | --- | --- | --- | --- |
| Tax compute | ✓ | ✓ | explain | — |
| Regime recommend | ✓ | ✓ | explain | — |
| Deduction suggest | propose | ✓ | explain | optional |
| Mismatch detect | reconcile | — | narrate | ✓ |
| Notice risk | risk module | ✓ | explain | ✓ |
| Next question | policy | ✓ | rank copy | ✓ |
| Portal guide | companion JSON | — | optional tips | — |

---

## 5. Conversation UX (if any)

- Side panel, not full-page chat  
- Always show **current numbers card** (tax, refund, confidence)  
- Every AI message has **Sources** chips  
- “Take me to the field” deep links  

---

## 6. Human CA escalation

Triggers:

- Persona out of scope  
- Confidence < threshold on material fields  
- User requests human  
- Risk score high  

Output: **Evidence pack** (PDF/JSON) for CA — not a vague chat transcript.

---

## 7. Evaluation (Anthropic-style)

Before launch of AI features:

| Eval | Pass bar |
| --- | --- |
| Numeric fidelity | 0% LLM-invented amounts in 1000 cases |
| Citation validity | 100% sections exist in rules DB |
| Refusal quality | 100% out-of-scope correctly refused |
| Question efficiency | Median ≤ 12 questions for V1 persona with Form16 |

---

## Phase 5 exit checklist

- [ ] Non-hallucination contract approved  
- [ ] Question policy approved  
- [ ] Tool interface list approved  
- [ ] Eval plan approved  
- [ ] SEO/Marketing phase can run in parallel; Implementation only after this gate  
