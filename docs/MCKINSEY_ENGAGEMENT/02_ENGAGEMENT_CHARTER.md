# 02 — Engagement Charter

**Engagement:** LastMinute ITR — Companion-Led Filing Platform
**Owner:** McKinsey Engagement Manager (EM)
**Client sponsor:** Founder / CEO
**Date:** 10 June 2026
**Classification:** Internal — strategy only. No application code is modified by this document.
**Source evidence:** `docs/PRODUCTION_READINESS_AUDIT.md`, `docs/NEXT_IMPLEMENTATION_ROADMAP.md`, `docs/TEAM_STATUS_REPORT.md`, `docs/FILING_EXPERIENCE_REDESIGN.md`, `docs/FUNNEL_AUDIT_AND_SIMPLIFICATION.md`, companion code (`app/file/companion/page.tsx`, `components/filing/companion/PortalGuideTable.tsx`), forms mapping (`lib/filing/case-matrix.ts`), `data/portal_steps.json`.

---

## 1. Situation — Complication — Resolution

### Situation
LastMinute ITR is a tax-filing **companion** for Indian salaried taxpayers. Its defensible IP is real and unusual for a v1 fintech:

- A production-grade **Python L1 tax engine** — 450 pytest + 47 integration tests passing, real old-vs-new regime comparison with binary-search breakeven, all income heads, surcharge, and §87A rebate handled (`NEXT_IMPLEMENTATION_ROADMAP.md` scores engine 8.5/10).
- A **companion "cheat sheet"** — 163 real portal steps across ITR-1/3/4 (`data/portal_steps.json`), each row binding an engine value to a field on `incometax.gov.in`, gated behind payment and a server-validated session (`app/file/companion/page.tsx`, scored 8.0/10).
- Phases 0 and 1 of the CEO roadmap are reported **complete** (10/10 and 14/14), CI is green locally, and the public preview now returns HTTP 200 (`TEAM_STATUS_REPORT.md`).

The product is **soft-launch GO**.

### Complication
The pieces are individually strong but the **experience does not yet deliver the CEO vision**, and three structural gaps block scale:

1. **Positioning confusion (the "portal problem").** LastMinute does not file for the user — they must complete the return themselves on `incometax.gov.in`. Competitors (ClearTax, Quicko) imply end-to-end filing. The companion is the differentiator *and* the source of confusion: users may expect auto-file and feel the product is incomplete. This is unresolved in the live funnel.
2. **The engine is invisible in production.** `/api/compute` returns `503 ENGINE_UNAVAILABLE` on Vercel because `python3` is not on the serverless PATH (`TEAM_STATUS_REPORT.md`). The single most valuable asset silently does not run for real users; the UI falls back to estimates.
3. **The funnel contradicts the "AI does the work" promise.** The standard path is still **20 screens** (target 11), the document parser is a Form 16 MVP with AIS/26AS/CAMS still mocked, and payment hardening depends on founder-set secrets not yet present on preview.

### Resolution
A **time-boxed, MECE engagement** that converts proven IP into a trustworthy, scalable experience, sequenced by phase gates. The thesis:

> **Make the engine real in production, make the companion's "we guide, you file" promise unmistakable, and compress the funnel to the import-first 11-screen path — in that order.** Trust and positioning are the wedge; the engine and companion are the payload.

The engagement does **not** rebuild the product. It de-risks the launch path, closes the CEO-vision gaps, and installs the metrics to prove conversion before any paid spend.

---

## 2. MECE Workstreams & Ownership

Five mutually exclusive, collectively exhaustive workstreams. McKinsey owns **diagnosis, sequencing, and decision quality**; the Client Product Owner (PO) and engineering lanes own **build and ship**. No workstream overlaps another's surface area.

| # | Workstream | Scope (MECE boundary) | Client PO lane | McKinsey lane |
|---|-----------|------------------------|----------------|----------------|
| **WS1** | **Engine-in-Production** | Runtime for `/api/compute`; python3-on-Vercel vs hosted compute decision; no-silent-fallback behavior | Tax Engine / Deploy (Agent 3) | Decision framework for runtime option; acceptance criteria; risk sign-off |
| **WS2** | **Companion & Positioning** | "We guide, you file" messaging; companion as post-pay hero; portal deep-link; gov→plain English map | UI/UX + Companion lanes (Agents 1, Phase 3) | Positioning thesis; copy north-star; trust-moat framing |
| **WS3** | **Funnel Compression** | 20→11 screen reduction; import-first routing; escape hatches; merges (income→parsing, risk→presubmit) | Funnel (Agent 2) | Screen-elimination MECE map; gate logic; happy-path spec |
| **WS4** | **Trust, Compliance & Payments** | Social-proof honesty; CA-plan "coming soon"; Razorpay/secrets; server-side access; disclaimers | Security/Payments + Compliance (Agent 5) | Compliance gate; payment-security acceptance; launch go/no-go |
| **WS5** | **Growth Readiness & Instrumentation** | Analytics wiring (PostHog), funnel events, SEO depth, CI test coverage | SEO (Agent 4) + QA/CI (Agent 6) | Metric definitions; baseline + target setting; instrumentation acceptance |

**Boundary rules (to keep MECE):**
- Document-parser accuracy lives in **WS1** (data integrity feeds the engine), not WS3. WS3 owns *flow*, not *field quality*.
- Companion *gating* (payment unlock) is **WS4** (access control); companion *content and positioning* is **WS2**.
- Anything touching real money or a public claim routes through **WS4** as a gate, regardless of which lane builds it.

---

## 3. Phase Gates

Linear gates with explicit entry/exit criteria. **No phase opens until the prior phase's exit gate is signed by the EM and Client PO.**

```
Discover (W0) ──▶ Design ──▶ Build ──▶ Validate ──▶ Deploy
   gate G0        gate G1     gate G2     gate G3       gate G4
```

| Gate | Phase | Entry criteria | Exit criteria (signed) | Primary WS |
|------|-------|----------------|------------------------|------------|
| **G0** | **Discover** (Week 0) | Charter approved; access to repo + audits | Current-state diagnostic ratified (see §4 + `03_CURRENT_STATE_GAP.md`); baselines captured for all §6 metrics; Sprint 0 backlog locked | All |
| **G1** | **Design** | G0 signed | Runtime option chosen (WS1); 11-screen happy-path spec approved (WS3); companion positioning copy approved (WS2); compliance checklist drafted (WS4) | WS1–4 |
| **G2** | **Build** | G1 signed | Engine returns real compute in a deployed env; import-first path live behind flag; honesty/compliance fixes merged; analytics events firing in staging | WS1–5 |
| **G3** | **Validate** | G2 signed | All four E2E paths green; engine parity check (UI vs engine) within tolerance; payment bypass closed with keys set; funnel events verified end-to-end | WS4, WS5 |
| **G4** | **Deploy** | G3 signed | Production env vars set (Razorpay, session secret, PostHog, app URL); public 200s on mobile; rollback plan; **paid-acquisition go/no-go decision** | WS4, WS5 |

**Current position:** The product sits **between G0 and G1**. Phase 0–1 engineering is done, but the runtime decision (WS1), positioning (WS2), and funnel compression (WS3) are unresolved — these are Design-gate deliverables, not yet started.

---

## 4. Current-State Diagnostic — What Exists vs CEO Vision Gap

Scored against the four CEO pillars. "Exists" cites live evidence; "Gap" is the delta to vision; "Severity" drives Sprint 0 priority.

| Pillar | What exists today (evidence) | CEO vision | Gap | Severity |
|--------|------------------------------|------------|-----|----------|
| **Companion** | 163 portal steps across ITR-1/3/4 (`data/portal_steps.json`); gated behind payment + server session; redirects unpaid users to plans (`app/file/companion/page.tsx:78`); engine values merge into rows | The *reason* users choose LastMinute — "we tell you exactly what to type on the portal" as the hero payoff | Companion is technically correct but **not positioned as the hero**; "we guide, you file" is not unmistakable upstream; no confetti/deep-link post-pay moment wired to vision spec | 🟠 High |
| **Engine** | 450 pytest + 47 integration tests pass locally; real regime compare, breakeven, all heads (`engine/`) | Authoritative, real-number tax brain powering every screen | **`/api/compute` = 503 on Vercel** (`python3` not on serverless PATH); production silently uses estimates; `has_form16` inflation fixed but parser still Form 16-only (AIS/26AS mock) | 🔴 Critical |
| **Funnel** | Standard path = **20 screens** (`FUNNEL_AUDIT…md`); import-first fast path exists; escape hatches added (P1-4) | Import-first, ~11-screen "AI does the work" journey | P2-5 funnel reduction is **FAIL — path unchanged**; merges (income→parsing, risk→presubmit) not executed; still 9 screens over target | 🟠 High |
| **Trust** | Fake social proof relabeled to "beta" (P0-2 done); CA plan flagged `comingSoon`; demo disclaimers on parsing; payment mock bypass code-fixed (P0-1) | Trust as the competitive moat — honesty competitors lack | Payment mock path **still verifies on preview** (Razorpay keys unset); access still partly localStorage-based; mismatch-center "trust moat" not yet the prominent post-import gate | 🟠 High |

**Diagnostic headline:** The engine gap is the only **Critical** item — it nullifies the product's core value in production. The other three pillars are "strong-but-misframed": built, but not yet arranged to deliver the vision or survive paid traffic.

---

## 5. Work Plan — Sprint 0 (2 Weeks)

Sprint 0 is a **Discover→Design** sprint. Goal: ratify the diagnostic, make the three blocking decisions, and lock the 11-screen spec — so Build (G2) can start with zero ambiguity. **No large feature builds in Sprint 0**; only the engine-runtime fix is permitted to begin implementation because it is the critical blocker.

### Sprint 0 priorities (ranked)

| Rank | Item | Workstream | Owner | Gate output | Why first |
|------|------|------------|-------|-------------|-----------|
| **P0** | **Engine runtime decision + spike** — choose (a) Vercel Python runtime, (b) hosted compute microservice, or (c) port L1 to TS; prove real compute in a deployed env | WS1 | Client Tax/Deploy + EM | G1 decision memo; working `/api/compute` in staging | Critical pillar; everything downstream assumes real numbers |
| **P1** | **Companion positioning copy lock** — approve "we guide, you file" north-star; map upstream touchpoints where confusion originates | WS2 | Client UI + EM | Approved copy spec; portal deep-link behavior | Resolves the portal-confusion problem (see `03_CURRENT_STATE_GAP.md`) |
| **P2** | **11-screen happy-path spec** — ratify the import-first salaried journey; finalize merges and escape hatches | WS3 | Client Funnel + EM | Signed screen map + gate logic | Unblocks Build; converts FAILED P2-5 into a scoped plan |
| **P3** | **Payment-security closeout plan** — sequence Razorpay/secret provisioning; define server-side access target | WS4 | Client Security + Founder | Compliance + go/no-go checklist | Soft-launch is GO only with secrets; required for any spend |
| **P4** | **Instrumentation baseline** — wire PostHog; define + capture baselines for the §6 metrics | WS5 | Client SEO/QA + EM | Events firing in staging; baseline dashboard | Cannot prove conversion or set targets without it |

### Two-week cadence

| Days | Activity | Deliverable |
|------|----------|-------------|
| **1–2** | Diagnostic ratification workshop; baseline capture kickoff | G0 sign-off; metric baselines started |
| **3–5** | Engine runtime spike (WS1); positioning copy draft (WS2) | Runtime proof-of-concept; copy v1 |
| **6–8** | 11-screen spec workshop (WS3); payment-security sequencing (WS4) | Happy-path spec v1; security checklist |
| **9–10** | Instrumentation live in staging (WS5); baseline dashboard | Funnel events verified; baselines locked |
| **11–12** | Decision memos finalized; risk review | All G1 decisions documented |
| **13–14** | **G1 Design-gate review** with Founder | Signed G1; Build backlog scoped |

**Sprint 0 exit = G1 signed.** If the engine spike fails to prove real compute in a deployed env, the EM escalates: the runtime decision becomes the only open Build item and paid-acquisition planning freezes.

---

## 6. Success Metrics

Six outcome metrics, each with a baseline owner and a target gate. **Baselines must be captured in Sprint 0 (P4)** — several are currently unmeasurable because analytics defaulted to a no-op provider until P1-8.

| # | Metric | Definition | Baseline status | Target (by) | Owner |
|---|--------|------------|-----------------|-------------|-------|
| **M1** | **Time-to-file** | Median minutes from `form16_upload` to companion unlock (payment success) | Unmeasured (no analytics in prod pre-P1-8) | ≤ 15 min for salaried ITR-1 happy path (by G4) | WS3 / WS5 |
| **M2** | **Field-error rate** | % of companion field values the user edits/overrides vs engine-provided value (proxy for engine + parser accuracy) | Unmeasured; parser is Form 16 MVP | < 5% on Form 16-only returns (by G3) | WS1 |
| **M3** | **Companion step completion** | % of unlocked users who mark ≥ 90% of portal steps done (proxy that "we guide, you file" actually lands) | Unmeasured | ≥ 60% of paid users reach ≥ 90% steps (by G4) | WS2 |
| **M4** | **Refund delta vs baseline** | Engine-computed refund/optimization vs naïve single-regime self-file estimate (the "AI did the math" payoff) | Engine produces it locally; not surfaced as a tracked metric | Demonstrable positive median delta, shown pre-pay (by G2) | WS1 / WS2 |
| **M5** | **Funnel screen count** | Screens on the default salaried path | **20** (`FUNNEL_AUDIT…md`) | **11** (by G2) | WS3 |
| **M6** | **Trust integrity** | Count of unverified public claims + open payment-bypass vectors | Bypass code-fixed but live on preview; social proof relabeled | **Zero** open bypass vectors + zero unsubstantiated claims (by G4) | WS4 |

**Leading indicators (watch in Sprint 0):** engine availability (`/api/compute` 200 rate), import-first entry rate, and mismatch-gate drop-off — these predict M1–M3 before paid traffic exists.

---

## 7. Governance & Operating Rhythm

| Forum | Cadence | Attendees | Purpose |
|-------|---------|-----------|---------|
| Daily standup (per lane) | Daily | Lane owners | Blockers, handoffs |
| WS sync | 2×/week | WS owners + EM | Cross-workstream dependencies |
| Phase-gate review | Per gate | Founder + EM + WS owners | Sign G0–G4 |
| Risk review | Weekly | EM + WS1/WS4 | Engine runtime + payment security |

**Escalation triggers (to Founder):** engine cannot run real compute in a deployed env by end of Sprint 0; any open payment-bypass vector at G3; any public claim that cannot be substantiated.

---

*This is a strategy artifact. It modifies no application source. Implementation is owned by the client engineering lanes per the workstream table above.*
