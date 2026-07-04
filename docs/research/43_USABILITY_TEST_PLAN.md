# 43 — Prototype & Usability Test Plan (Phase 4, Executed)

> The blueprint (doc 04 §8) mandates 8 mobile usability tests before code. This is the protocol. Phase 1's human-validation debt (5 CA calls, 15 user interviews — doc 11/12) can share recruitment with this study.

## 1. Prototype scope (Figma, clickable, mobile frame 390×844)

| Flow | Screens | Data condition |
|---|---|---|
| P1 Happy path | GATE → COLLECT → EXTRACT → RECONCILE(2 cards) → CONFIRM → COMPUTE → RISK → ENTITLE → COMPANION(3 steps) | S2 persona, ₹12.65L salary, ₹80k TDS, refund case — the AY 2026-27 nil-tax wow |
| P2 Conflict-heavy | RECONCILE with 1 blocking + 3 warn cards | S3-lite: dividend + interest mismatches |
| P3 Blocked exit | GATE → BLOCKED (STCG answer) | S3 equity seller |
| P4 Parse failure | EXTRACT failure → manual-entry sheet | scanned/photographed Form 16 |
| P5 Payable case | COMPUTE showing "tax to pay ₹1,640" | tests the neutral-not-red framing |

Prototype uses **real canonical strings from doc 42** — this study tests copy as much as layout. Realistic numbers only (goldens from doc 32 are the source), never lorem-ipsum rupees.

## 2. Participants (n=8, moderated, 45 min, remote or Tier-2 in-person)

| Slots | Profile (doc 12) | Recruit filter |
|---|---|---|
| 2 | S1 first-timer | employed < 2 yrs, never filed themselves |
| 3 | S2 repeat simple | filed before (self or via CA), salary-only |
| 1 | S3 salaried + equity | Zerodha/Groww user (tests P3 honesty) |
| 1 | S6 operator | has filed for a parent |
| 1 | S7 belated | filed late or received any notice |

At least 5/8 primarily phone users; at least 3/8 outside metro tier-1; mixed regime awareness. Incentive ₹1,000–1,500 voucher. Exclusions: finance professionals, designers, anyone who's used our current app.

## 3. Session protocol

1. **Warm-up (5 min):** how did you file last year; what's the scariest part of taxes (calibrates the fear baseline per participant).
2. **Task block (30 min), think-aloud:**
   - T1 "You just got this app from a friend. File your return." (P1 end-to-end)
   - T2 at RECONCILE: "What is this screen telling you? What would you tap and why?"
   - T3 at COMPUTE: "Explain to me, like I'm your friend, what this screen says about your money." — the **regime-comprehension probe** (doc 12 truth #2)
   - T4 at ENTITLE: "What do you get if you pay? Would you?" (value clarity before conversion)
   - T5 for the S3 slot: P3 blocked flow — "How does this make you feel about the app?" (honesty perception)
   - T6 for the S7 slot: P5 + RISK belated cards — fear reduced or amplified?
3. **Wrap (10 min):** SEQ per task (1–7), trust question ("Would you enter your PAN here? Why/why not?"), one-thing-to-change.

Moderator rules: never explain a screen; the prototype either communicates or fails. Log every hesitation > 3s as a friction event with screen + element.

## 4. Metrics & pass thresholds (gate to Phase 7 UI build)

| Metric | Target | Maps to |
|---|---|---|
| GATE completion, unaided | 8/8 under 90s | doc 40 GATE metric |
| RECONCILE card comprehension | ≥ 6/8 correctly paraphrase a conflict card before tapping | the moat works |
| Regime verdict comprehension (T3) | ≥ 6/8 correctly say which regime and roughly why | truth #2 |
| "Estimate" awareness | ≥ 6/8 recall the number is an estimate when asked | honesty invariant landing |
| ENTITLE value clarity | ≥ 6/8 state what paying unlocks without help | conversion precondition |
| Blocked-flow trust (T5) | qualitative: honesty raises trust, not frustration-quit | doc 40 BLOCKED |
| Task SEQ | median ≥ 5.5/7 across T1–T4 | overall |
| Fatal frictions | 0 (participant stuck > 60s or gives up) | ship/no-ship |

**Decision rule:** any failed threshold → fix in Figma + retest the failed task with 3 fresh participants (targeted, not full-panel). Copy iterates only after tests (blueprint §8: "iterate copy only after tests").

## 5. What we are deliberately NOT testing yet

- Visual-brand preference (aesthetic A/Bs waste moderated minutes)
- Marketing pages, price sensitivity (separate unmoderated study; conversion doc)
- Hindi copy (V2)
- Actual document upload/parsing (prototype fakes EXTRACT outcomes with golden data)

## 6. Logistics & artifacts

- 2 pilot sessions (colleagues' non-tech relatives) to debug the protocol before the panel of 8.
- Recordings + consent per DPDP posture (doc 23): consent form, PII-free clips, delete raw recordings after 90 days.
- Output artifacts: friction log (screen × severity), comprehension scorecard, verbatim quotes per screen, prioritized Figma change list → these are the Phase 4 exit evidence.

## 7. Acceptance checklist (Phase 4 gate, this doc)

- [ ] P1–P5 prototypes built with doc 41 primitives + doc 42 strings
- [ ] 2 pilots run, protocol adjusted
- [ ] 8 sessions complete, scorecard filled
- [ ] All thresholds passed (or retest loop closed)
- [ ] Change list merged back into docs 40–42 — then Phase 4 exits
