# 03 — Current-State Gap Analysis: The Portal Confusion Problem

**Engagement:** LastMinute ITR
**Owner:** McKinsey Engagement Manager
**Date:** 10 June 2026
**Purpose:** An honest, evidence-based diagnosis of the single most important strategic risk — **users do not understand that LastMinute guides them to file on the government portal rather than filing for them.** This is the "portal confusion problem."
**Source evidence:** `app/file/companion/page.tsx`, `components/filing/companion/PortalGuideTable.tsx`, `data/portal_steps.json`, `docs/FILING_EXPERIENCE_REDESIGN.md`, `docs/NEXT_IMPLEMENTATION_ROADMAP.md`, `docs/FUNNEL_AUDIT_AND_SIMPLIFICATION.md`, `lib/filing/case-matrix.ts`.
**Classification:** Strategy only. No application code modified.

---

## 1. The Problem in One Sentence

LastMinute's core deliverable — a **companion cheat sheet** that tells the user exactly what to type on `incometax.gov.in` — is simultaneously its **strongest differentiator** and its **largest comprehension risk**, because the dominant market expectation (set by ClearTax/Quicko) is that a tax app *files for you*.

If a user reaches the paid companion still believing the app will submit their return, three things happen: they feel the product is **incomplete**, they **distrust** the values shown, and they **do not finish filing** on the portal — collapsing the very metric (companion step completion, M3) that proves the model works.

---

## 2. Why This Is the Right Problem to Diagnose First

| Reason | Evidence |
|--------|----------|
| It is the **monetization moment**. Payment unlocks the companion; if the companion confuses, the refund/value story breaks at the point of highest intent. | `FILING_EXPERIENCE_REDESIGN.md` §5: "Payment unlocks companion export"; companion gated in `app/file/companion/page.tsx:46`. |
| It is the **differentiation**. The companion is the feature "no competitor currently offers in this form." | `NEXT_IMPLEMENTATION_ROADMAP.md` Part 4 rationale. |
| It is **not yet resolved upstream**. The honest "we can't file for you" north-star line exists in the *redesign doc*, not in the lived funnel. | `FILING_EXPERIENCE_REDESIGN.md` copy hero line vs. live screens. |
| It **compounds with spend**. Every paid click that lands a confused user wastes acquisition budget and generates negative word-of-mouth at the worst possible moment. | Engagement thesis, `02_ENGAGEMENT_CHARTER.md` §1. |

---

## 3. What Actually Exists Today (honest read)

The companion is **technically good**. Being honest about what is *right* sharpens what is *wrong*.

**Strengths — real and shippable:**
- The companion page **does** gate correctly: unpaid users are redirected to plans (`app/file/companion/page.tsx:78`, `router.replace("/file/checkout/plans?reason=companion")`). No broken pre-pay state.
- The honest framing **is present on the companion screen itself**: the subtitle reads "Manual filing guide — you file on the portal," a badge says "Companion mode · Manual filing on ITD portal," and an info banner says "We do not submit your return for you" with a deep link to `incometax.gov.in` (`app/file/companion/page.tsx:113–141`).
- The data is real: **163 portal steps** across ITR-1/3/4 (`data/portal_steps.json`), each binding an engine value the user copies.
- Mismatch resolution blocks export (`mismatchBlock` logic, line 104) — the trust gating is wired.

**This is the crux of the gap:** the honesty exists **at the destination**, *after the user has paid*. The confusion is created **everywhere upstream** — landing, onboarding, plan selection — where the expectation of "file for me" is never explicitly corrected.

---

## 4. Where Confusion Originates — Touchpoint Walkthrough

Tracing the salaried path (`FUNNEL_AUDIT_AND_SIMPLIFICATION.md` Path A), here is where the user's mental model diverges from reality.

| Stage | What the user likely assumes | What the product does | Confusion delta |
|-------|------------------------------|-----------------------|-----------------|
| **Landing** | "This app files my ITR." | Markets filing assistance; CTA is "Start my return" | 🔴 Sets "file for me" expectation; no "we guide, you file" qualifier |
| **Onboarding / eligibility** | "It's collecting data to file." | Resolves recommended ITR form (`lib/filing/case-matrix.ts`) | 🟡 Reinforces "doing it for me" |
| **Import / parsing** | "It read my Form 16, so it'll file it." | Parses (Form 16 MVP), shows fields | 🟡 "AI does the work" — true for *prep*, not *submission* |
| **Regime / deductions / review** | "Almost done — it'll submit." | Computes, shows filing-ready % | 🟠 Peak false confidence in auto-file |
| **Plans / payment** | "I'm paying to file." | Sells plans; payment **unlocks the companion** | 🔴 **The fault line** — user pays expecting submission |
| **Companion (post-pay)** | "Where's my submitted return?" | "We do not submit. Copy these values into the portal." | 🔴 **Expectation collapse** — honesty arrives too late |

**The single highest-leverage fix:** move the "we guide, you file" truth **forward** — to landing and to plan selection — so the companion is received as the *promised payoff*, not a *surprise limitation*.

---

## 5. Root-Cause Analysis

Not a copy bug — a **sequencing and positioning** failure.

1. **Honesty is placed at the destination, not the entry.** The correct disclosure (`app/file/companion/page.tsx`) is genuine but terminal. Users form their model on the landing page and never get corrected until after payment.
2. **The category default is "auto-file."** ClearTax/Quicko trained the market to expect end-to-end submission. Silence on this point defaults the user to the wrong model.
3. **The differentiator is framed as a constraint.** "We can't file for you" reads as a *limitation* unless reframed as the *advantage* it is: legal clarity, user control, no ERI risk, and a verifiable paper trail.
4. **Payment is positioned as "pay to file" not "pay to unlock your guide."** The redesign doc already prescribes the fix ("Pay & unlock your portal guide") but it is not the lived plan-selection copy.

---

## 6. Quantified Impact (hypotheses to validate in Sprint 0)

Because production analytics were a no-op until recently, these are **hypotheses with baselines to capture**, not measured facts. Stating them honestly is the point.

| Hypothesis | Predicted signal | How to validate (Sprint 0, WS5) |
|------------|------------------|----------------------------------|
| Confusion concentrates at the pay→companion handoff | Elevated drop-off / refund requests immediately post-payment | Funnel event delta between `payment_success` and first companion step marked done |
| Confused users don't complete portal filing | Low companion step-completion (M3) | Track `companion_step_complete` ÷ unlocked users |
| Upstream framing changes the model | Higher step completion when "you file" appears pre-pay | A/B landing + plans copy once instrumented |

**Honest caveat:** with zero paid traffic and recent analytics wiring, we currently **cannot quantify** the loss. Sprint 0 must establish the baseline before any spend — guessing the magnitude would be intellectually dishonest.

---

## 7. The Gap, Stated Plainly

| Dimension | CEO vision | Current reality | Gap |
|-----------|-----------|------------------|-----|
| **Mental model** | User knows from second one: "AI preps it, I file on the portal in minutes." | User assumes auto-file until the post-pay companion corrects them. | Disclosure is **terminal**, should be **upfront** |
| **Positioning** | "We can't file for you — but we'll tell you exactly what to type." (a *strength*) | Implicit "file for me" never corrected; honesty reads as limitation. | Differentiator framed as **constraint** |
| **Payment framing** | "Pay & unlock your portal guide." | "Pay to file" implication at plan selection. | Value prop **misnamed** at the buy moment |
| **Companion role** | The **hero payoff**. | A correct-but-surprising final screen. | Hero arrives as **anticlimax** |

---

## 8. Recommended Resolution Path (no code in this doc)

Sequenced; owned by WS2 (Companion & Positioning) per `02_ENGAGEMENT_CHARTER.md`. These are **specifications for the client engineering lanes**, not changes made here.

| Priority | Move | Where | Rationale |
|----------|------|-------|-----------|
| **1** | Put "we guide, you file" on the **landing hero** | Marketing landing | Corrects the model before it forms |
| **2** | Rename the buy moment: "**Pay & unlock your portal guide**" | `/file/checkout/plans`, `/file/checkout/payment` | Aligns payment with actual deliverable (redesign doc §21) |
| **3** | Reframe the companion as **payoff, not limitation** — "Your incometax.gov.in cheat sheet is ready" with confetti + portal deep-link | Post-payment success → companion | Turns the fault line into the celebration moment |
| **4** | Add a one-line "**How LastMinute works**" model (Prep with AI → You file in minutes → We guide every field) on landing + plans | Landing, plans | Repeated reinforcement of the correct model |
| **5** | Position the **mismatch center as the trust moat** before pay | `/file/import/mismatch` | "We won't let you pay until critical mismatches are resolved" earns the guide's credibility (redesign doc §4) |

**Success test:** companion step completion (M3) and post-payment retention rise once the "you file" truth is delivered **before** payment rather than after. Validate via the Sprint 0 instrumentation baseline.

---

## 9. What This Gap Is *Not*

To stay honest and avoid scope creep:

- It is **not** a companion-quality problem. The 163 steps and engine binding are sound.
- It is **not** a gating bug. Payment gating and redirects work (`app/file/companion/page.tsx`).
- It is **not** a compliance failure on *this* axis — the app correctly avoids "we file for you" / "guaranteed refund" claims (`NEXT_IMPLEMENTATION_ROADMAP.md` Compliance 6.5/10). The issue is the **absence of an affirmative, upfront model**, not the presence of a false one.

It **is** a positioning and sequencing problem: the right message, delivered too late in the journey. Cheap to fix in copy and flow; expensive to ignore once paid traffic begins.

---

*Strategy artifact. No application source modified. Resolution specifications above are owned by the client engineering lanes (WS2) and gated through WS4 for any public claim.*
