# User Pain Points 2026 — qna.tax + Landscape Synthesis

**Date:** June 2026
**Sources:** qna.tax (Quicko's public Tax Q&A / Discourse forum — Income Tax 1961: 196 topics, Business Compliances: 82, TDS/TCS 1961: 60, GST: 51, plus new Income Tax Act 2025 categories), competitor product docs, and public ITR landscape coverage (Economic Times, TaxBuddy, etc.).
**Product constraint:** Companion-first. We guide the taxpayer to file on `incometax.gov.in` themselves. No auto-submit, no guaranteed refund, no ERI/ITD-affiliation claims.

This document distills what real Indian taxpayers actually struggle with, maps each theme to our current routes/features, and records an explicit "do we address this today?" gap note. The gap notes feed the Phase 1 QA backlog and scope Phase 2 UI work.

---

## How to read the severity column

- **P0** — Core to our wedge; a gap here loses the user or risks a wrong filing.
- **P1** — High-value clarity/navigation improvement.
- **P2** — Nice-to-have / SEO / long-tail.

---

## Theme 1 — AIS vs Form 16 vs 26AS reconciliation (the biggest theme)

**What taxpayers say / ask:**
- "Form 16 salary is correct, but AIS shows extra interest/dividend income — what do I do?"
- "TDS appears in Form 16 but not fully in 26AS."
- "Will a mismatch trigger a 143(1) notice or delay my refund?"
- "Should I wait for an AIS correction before filing?"

**Why it hurts:** The CPC automated system compares the filed ITR against AIS. Any notable mismatch can trigger a Section 143(1)(a) intimation and delay refunds. Most DIY filers do not know AIS exists, or trust it blindly without reconciling against their own records.

**Our route/feature today:** Mismatch Center (`/file/import/mismatch`, `/file/import/mismatch/[id]`), `lib/filing/reconciliation.ts`, `/file/review` taxes tab.

**Gap note:** We have a mismatch flow, but the three-document mental model (Form 16 = salary, AIS = broad income cross-check, 26AS = tax-credit verification) is not shown side-by-side anywhere as a single "reconcile" view. **P0** — Phase 2 `/file/review` reconcile dashboard should make AIS vs Form 16 vs 26AS legible with matched / needs-attention states, and explicitly tell users they can file with their correct figures while logging AIS feedback (do not wait indefinitely).

---

## Theme 2 — Capital gains, intraday & F&O

**What taxpayers ask:**
- "How are intraday and F&O profits taxed?" (business income vs speculative)
- "F&O turnover calculation and audit threshold."
- "What asset type to choose in capital gains for Gold ETF / SGB?"
- "Shares buyback — capital gains or business income?"
- "STCG/LTCG calculation discrepancy and rebate eligibility under the new regime."

**Why it hurts:** Form selection (ITR-2 vs ITR-3), turnover math, and special-rate taxation (111A/112A) are genuinely hard. This is where competitors charge the most and where users most fear notices.

**Our route/feature today:** Quiz/profiler routes ITR-2/ITR-3; `/file/regime`; CA-Brain path (`/file/cabrain`); engine handles 111A/112A.

**Gap note:** We route the form correctly, but capital gains data entry is estimate-placeholder only. **P1** — make the review screen clearly state "capital gains detected → ITR-2/3, here's what the portal needs," and surface the honest "complex case → consider expert" escalation. Not a Phase 2 redesign blocker, but the reconcile dashboard should show CG as a first-class income head.

---

## Theme 3 — Freelancer / business income (presumptive 44ADA, foreign clients)

**What taxpayers ask:**
- "Can I claim home-office expenses as a freelancer?"
- "Freelancer with foreign clients — how to report, is GST registration needed?"
- "Can freelancers earn high income with low tax under presumptive 44ADA?"

**Why it hurts:** Presumptive scheme eligibility, the 50% deemed profit, advance tax, and GST thresholds are confusing. Foreign-client receipts add FEMA/GST nuance.

**Our route/feature today:** Profiler routes presumptive (business code `w`, `presumptive_profession`); `/file/other`, `/file/cabrain`.

**Gap note:** Path exists but is thin on guidance. **P1** — clear presumptive explainer + "we estimate; for foreign income/GST consider expert" honesty. Content (Phase 1 learn/help) covers most of this; no Phase 2 blocker.

---

## Theme 4 — New regime rebate interaction (FY 2025-26)

**What taxpayers ask:**
- "New Regime FY 2025-26: calculation discrepancy on STCG/LTCG tax & 87A rebate eligibility."
- "Old vs new — which is better for me?"

**Why it hurts:** The 87A rebate does not apply to special-rate income (111A/112A) and the interaction surprises people. Regime choice is the single highest-leverage decision for most salaried filers.

**Our route/feature today:** `/file/regime` regime compare; `RegimeCompareCard` on landing; engine computes both regimes with rebate logic.

**Gap note:** Strong here. **P0 (keep)** — ensure the reconcile dashboard surfaces the regime recommendation inline with an honest "estimate" disclaimer and shows why (deductions lost in new, breakeven).

---

## Theme 5 — Gifts, HUF, and "do I report this?"

**What taxpayers ask:**
- "Is a gift > ₹50,000 from wife's parents tax-free in my HUF?"
- "Do I need to report gifts received from parents in ITR?"
- "How are gifted shares / gold / property taxed?"

**Why it hurts:** Relative-vs-non-relative exemption, HUF treatment, and reporting obligations are murky. Under-reporting risk is real.

**Our route/feature today:** `/file/other`; glossary; learn articles.

**Gap note:** Mostly a content/education gap. **P2** — covered via Phase 1 learn/help + glossary. No Phase 2 UI blocker.

---

## Theme 6 — NRI & property TDS

**What taxpayers ask:**
- "TDS on property purchased from an NRI seller (Sec 195 vs 194-IA)."
- "NRI reporting of Indian let-out property and interest."

**Why it hurts:** Higher TDS rates, Form 27Q, and residential-status rules. High stakes, low confidence.

**Our route/feature today:** Profiler supports `non_resident` residential status → ITR-2; `/file/house-property`.

**Gap note:** Supported but advanced. **P2** — honest escalation messaging; content coverage. No Phase 2 blocker.

---

## Theme 7 — The official portal itself is painful (validates our wedge)

**What taxpayers say:**
- "Stuck on 'Please Wait' loading loop / session timeout when downloading Form 16C on TRACES."
- "After spending half a day on the official ITD website, I used [a tool] and connected my broker — done."

**Why it matters:** This is the strongest validation of companion mode. Users do not hate filing; they hate the portal's friction and not knowing what to enter where. Our differentiator is a calm, copy-ready walkthrough that mirrors the portal's exact section order.

**Our route/feature today:** `/file/companion` Portal Footprint Wizard; `lib/engine/portalSections.ts`; copy-ready field values.

**Gap note:** This is our moat. **P0 (keep & deepen)** — the Phase 2 guided "Path" bar and the review→companion hand-off should make "you are X steps from filing on the portal" obvious at all times.

---

## Theme 8 — Pricing transparency & trust

**What taxpayers say (landscape):**
- Users reward "upload Form 16 + connect broker → done in minutes."
- Users punish add-on cost surprises and slow support during the July peak.
- The official portal is free; paid tools must justify the fee with clarity, not lock-in.

**Our route/feature today:** `/file/checkout/plans`, value-before-pay gate (pay after review), `PricingSection`.

**Gap note:** Our value-before-pay model is correct. **P1** — keep pricing legible and honest (companion walkthrough unlock, not government submission). Reinforce in Phase 2 trust polish.

---

## Theme 9 — "Which ITR form do I file?"

**What taxpayers ask:** "Know your ITR" is one of Quicko's most-used tools; choosing ITR-1/2/3/4 is a recurring blocker.

**Our route/feature today:** ITR-type quiz on landing + `/tools`; profiler in onboarding.

**Gap note:** Covered. **P1** — ensure the quiz and profiler outcomes are visible and reassuring in the funnel.

---

## Priority rollup for Phase 2 (UI)

1. **P0** — `/file/review` reconcile dashboard: AIS vs Form 16 vs 26AS side-by-side + refund/payable hero + regime recommendation (Themes 1, 4).
2. **P0** — Guided "Path" bar that always shows "you are N steps from filing on the portal" (Themes 7, 9).
3. **P1** — Unified premium navigation so the funnel feels as calm and trustworthy as the marketing site (Theme 8).
4. **P1** — First-class income heads (salary, interest/dividend, capital gains, business) on the dashboard (Themes 2, 3).
5. **P2** — Content/education for gifts, NRI, freelancer nuance (Themes 3, 5, 6) — handled via learn/help, not UI redesign.

See also: [SIMILAR_PLATFORMS.md](SIMILAR_PLATFORMS.md), [../competitor-audit/GAP_MATRIX_2026.md](../competitor-audit/GAP_MATRIX_2026.md), and the persona fixtures in [e2e/fixtures/personas.ts](../../e2e/fixtures/personas.ts).
