# 01 — Client Brief

> **CLIENT SIDE — Product Owner**
> Authored by the LastMinute ITR founder side (CEO's vision). This is the source-of-truth brief that the McKinsey engagement works against. It is intentionally opinionated about *what we are* and *what we will not become*.

**Date:** June 2026
**Owner:** Client Product Owner (founder side)
**Audience:** McKinsey engagement team (strategy + delivery workstreams)
**Status:** Brief only — no code changes implied by this document.

---

## 1. North star

**LastMinute ITR is a personal AI CA friend.** Not a form-filler, not a portal clone — a trusted companion that does two things in order:

1. **Maximize the user's lawful refund first.** Before anything else, the engine computes the largest *legitimate* refund / lowest *legitimate* tax — old vs new regime, every eligible deduction, no fabrication.
2. **Then walk the user screen-by-screen through `incometax.gov.in`** so they file it themselves with total confidence — every field labelled, every value ready to copy, every trap flagged.

> **Hard constraint:** The user always files on the government portal themselves. **We never auto-submit.** Our promise is *"We can't file for you — but we'll tell you exactly what to type on the government portal."*

The feeling we are selling: **"An AI CA friend sat next to me, found me the biggest honest refund, and held my hand through the government website."**

---

## 2. Core business problem (in the CEO's words)

> "The math isn't the problem. We can already calculate the refund. The problem is the **government portal has too many fields**. Real people sit in front of `incometax.gov.in`, see dozens of boxes, schedules, and toggles, and they freeze. They put numbers in the **wrong fields**. They don't know which fields to **skip**, **leave blank**, or **deselect**. They lose confidence and either overpay, file wrong, or abandon and run to an agent who overcharges them."

Restated as the gap we must close:

- ✅ **What works today:** the calculation engine (`engine/`) produces correct income, deductions, regime comparison, and tax/refund numbers.
- ❌ **What's broken for the user:** translating those correct numbers into *correct actions on a confusing portal*.

The product's reason to exist is **closing the last mile between a correct computation and a correctly-filed return on a portal that wasn't designed for ordinary people.**

---

## 3. Must-have outcomes (acceptance criteria)

These are the conditions the engagement's primary deliverable must satisfy. The anchor is the **companion guide** (`app/file/companion/`, `data/portal_steps.json`, `PortalGuideTable`).

### 3.1 A complete digital footprint of each ITR form, in filing order
- For **every supported form** (ITR-1 today; ITR-3, ITR-4 already stubbed in the companion), produce an ordered, end-to-end map of the **actual portal journey** — login → form select → each schedule → tax paid → preview → submit — in the **exact sequence the user encounters on `incometax.gov.in`**.
- "Footprint" = no gaps. If the portal shows a screen, our guide accounts for it (even if the instruction is "skip this").

### 3.2 For each portal screen, every row must answer four questions
| Must specify | Meaning |
|---|---|
| **Exact field label** | The literal text the user sees on the portal (`fieldLabel`), so they can find it without guessing. |
| **Where to paste our computed value** | Which engine output maps to this field (`engineField` → L1 compute), shown as a copy-ready value. |
| **What to SKIP / leave blank / deselect** | Explicit instruction for fields the user should *not* touch, *not* fill, or *deselect* — this is the CEO's #1 pain point and is currently under-served. |
| **Plain-English "why"** | A human sentence (`plainEnglish`) explaining what the field is and why we're filling/skipping it — builds the confidence that's being lost today. |

### 3.3 "Skip / deselect" is a first-class output, not an afterthought
- Today `portal_steps.json` rows are mostly *fill* instructions. The acceptance bar requires **explicit negative guidance**: e.g. "Leave Schedule CG blank — you have no capital gains," "Deselect 'I have income from business,'" "Do not edit the auto-populated TDS — it already matches."
- A screen with confusing optional fields is **not "done"** until the skip/deselect guidance exists.

### 3.4 Values are bound to real computation, never hardcoded demo data
- Every value the user copies must come from the live engine output for *their* return, not a sample. (Mismatch-blocked exports already enforce part of this; extend the rigor to all values.)

### 3.5 Confidence is measurable
- The guide should leave the user able to file without opening a second tab to Google a field. Acceptance = "a non-expert salaried user completes ITR-1 on the portal using only our guide."

---

## 4. Non-goals (what we will NOT do)

| Non-goal | Why |
|---|---|
| **No fake metrics** | No invented "₹X saved on average," no fabricated user counts, no demo numbers presented as real. Trust is the moat; one fake stat breaks it. |
| **No ERI / auto-file until legal clearance** | We will **not** integrate as an e-Return Intermediary or auto-submit to the portal until it is legally and contractually cleared. Until then, the user files themselves — full stop. |
| **No guaranteed-refund claims** | We never promise a refund or a specific amount. We compute the **maximum lawful** outcome and clearly label it as an estimate subject to ITD acceptance. |
| **No tax evasion / aggressive fabrication** | "Max refund" means *max lawful* — blocked/red recommendations stay blocked. We optimize, we don't cheat. |
| **No replacing the government portal** | We are a companion *to* `incometax.gov.in`, not a parallel filing surface. We guide; the portal remains the system of record. |

---

## 5. Priority stack (McKinsey workstreams)

The engagement should sequence effort against the north star — companion correctness first, refund maximization second, growth third.

### P0 — Companion mapping (the last mile)
**The product is only as good as this.** Complete, ordered, correct digital footprint of each ITR form with fill / **skip-deselect** / plain-English guidance, bound to engine values.
- Anchors: `app/file/companion/`, `data/portal_steps.json`, `PortalGuideTable`, `lib/engine` value binding.
- Definition of done: Section 3 acceptance criteria fully met for ITR-1, then ITR-4, then ITR-3.
- **Highest priority because** it is the differentiator vs ClearTax/Quicko and the direct fix for the CEO's stated problem.

### P1 — Engine max-refund (the promise behind the last mile)
Ensure the computation genuinely surfaces the **maximum lawful refund** before the companion hands off.
- Anchors: `engine/orchestrator.py`, `regime_compare.py`, `deductions.py`, `recommendations.py`.
- Scope: regime optimization, full Chapter VI-A coverage, lawful deduction discovery (L2), no blocked claims leaking through.
- **Second priority because** a perfect companion to a sub-optimal number still shortchanges the user — but a great number with a confusing handoff fails the core problem first.

### P2 — Marketing / growth
Positioning, funnel, SEO, conversion — built **on top of** a credible product, never ahead of it.
- Anchors: landing/regime teaser, plan ladder, `docs/SEO_GROWTH_PLAN.md`, `docs/TRUST_CONVERSION.md`.
- Constraint: bound by the §4 non-goals (no fake metrics, no guaranteed-refund copy).
- **Lowest priority because** marketing a product that mis-fills the portal would amplify the exact failure we're trying to fix.

---

## 6. Context the engagement should read first

| Source | What it gives the team |
|---|---|
| `docs/FILING_EXPERIENCE_REDESIGN.md` | Full 26-route teardown, salaried happy-path proposal, companion-as-hero framing, gov→plain-English master map. |
| `data/portal_steps.json` | Current portal step schema: `step`, `portalPage`, `fieldLabel`, `action`, `engineField`, `plainEnglish`, `proofRequired`, `govSection`. The skip/deselect gap lives here. |
| `app/file/companion/page.tsx` + `PortalGuideTable` | How the guide renders and gates (payment + mismatch). |
| `engine/orchestrator.py` (`compute_itr`, `build_layer2_handoff`) | The L1 outputs available to bind to portal fields (`income_heads`, `deductions`, `regime_comparison`, `confidence`). |
| `lib/filing/routes.ts` | Import-first (`?source=form16`) routing assumptions. |

---

## 7. One-line mandate for the engagement

> Turn a correct tax calculation into a **fearless self-filing experience** on `incometax.gov.in` — every field labelled, every value copy-ready, every skip/deselect spelled out, every "why" in plain English — while maximizing the user's lawful refund and never auto-submitting.

---

*Client-side brief. Product Owner (founder side). No engineering work authorized by this document — it defines intent and acceptance criteria for the McKinsey workstreams.*
