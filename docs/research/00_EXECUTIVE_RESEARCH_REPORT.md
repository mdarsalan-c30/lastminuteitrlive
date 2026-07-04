# LastMinuteITR — Master Research Report

**Mission:** Redesign LastMinuteITR into India’s smartest AI Tax Filing platform  
**Mode:** Research only — **no code, no implementation**  
**Date:** 2026-07-03  
**Consortium lens:** McKinsey · BCG · Deloitte/EY Tax · PwC Tech · IDEO · Stripe · OpenAI/Anthropic product · Top Indian CAs · IT officers · Zerodha/Groww/ClearTax/Winman PMs  

**Related prior work:** `docs/PRODUCT_AUDIT.md`, `docs/P0_BUGS.md`, `docs/SECURITY.md`, `docs/TAX_REVIEW.md` (engineering audit of current deploy)

---

## How to use this document

| Phase | Doc | Status |
| --- | --- | --- |
| 1. Research | This report + `01_PHASE_RESEARCH.md` | **Active deliverable** |
| 2. Product Architecture | `02_PHASE_PRODUCT_ARCHITECTURE.md` | Blueprint only |
| 3. Tax Engine | `03_PHASE_TAX_ENGINE.md` | Blueprint only |
| 4. UI/UX | `04_PHASE_UI_UX.md` | Blueprint only |
| 5. Smart AI CA | `05_PHASE_SMART_AI_CA.md` | Blueprint only |
| 6. SEO & Marketing | `06_PHASE_SEO_MARKETING.md` | Blueprint only |
| 7. Implementation | *Not started — wait for phase gates* | Blocked |
| 8. Testing & Compliance | *Not started* | Blocked |

**Rule:** No implementation until Research → Architecture → Engine → UX → AI CA are signed off.

---

# 1. Executive Summary

LastMinuteITR’s **positioning is correct**: companion-first prep for ordinary Indians who file on `incometax.gov.in`, not an unauthorized e-return portal. That is a defensible wedge against ClearTax (mass e-file) and Computax/Winman (CA desktop).

The **current product is not a $1B company**. It is an early MVP with:

- Broken or incomplete commerce (Razorpay must be configured; plan catalog was recently repaired)
- Over-claimed “Live” connectors (AIS/26AS still not production-grade)
- A tax engine that is **directionally real** for simple salaried cases but **not** Computax-grade for CG, F&O, business, NRI, FA, AL
- Trust and security below fintech bar (improving, not done)
- No true “AI CA” — chat and prompts exist; **judgment, evidence, and audit trail do not**

**The $1B path is not “another ClearTax.”** It is:

1. **B2C:** Fastest, most trustworthy *prep + portal companion* for resident salaried + simple interest/HP (Year 1–2)  
2. **B2B:** AI co-pilot inside CA firms that removes 60–80% of data entry and mismatch work (Year 2–4) — this is where Computax/Winman money sits  
3. **Platform:** Document intelligence + auditable tax brain + notice prevention as the moat (Year 3–5)

**North star metric (product):** *Time from first document upload to “portal-ready, notice-safe draft”* — not “questions answered.”

**North star metric (business):** *Paid companion unlocks + CA seats with active clients* — not vanity traffic.

---

# 2. Current Product Score: **34 / 100**

| Dimension | Score | Weight | Weighted |
| --- | --- | --- | --- |
| UI | 48 | 10% | 4.8 |
| UX | 38 | 15% | 5.7 |
| Engine | 42 | 20% | 8.4 |
| Tax accuracy (E2E) | 35 | 20% | 7.0 |
| Trust | 28 | 15% | 4.2 |
| Security | 30 | 10% | 3.0 |
| Growth (SEO/conv) | 32 | 10% | 3.2 |
| **Total** | | | **~34** |

**Interpretation:** Interesting prototype. Not launch-ready for 1M users. Not CA-office ready. Fix P0s, then build the AI CA + document brain before scaling spend.

---

# 3. UI Score: **48 / 100**

**Strengths:** Modern teal system; marketing sections exist; tools page is clean; compliance disclaimers present.

**Gaps:** Placeholder-era residue (recently fixed in catalog); filing density feels admin-tool; FloatingGenie risk; no design-system tokens; brand assets incomplete; mobile QA incomplete.

**IDEO bar:** Every screen must answer “what do I do next?” in under 3 seconds.

---

# 4. UX Score: **38 / 100**

**Strengths:** Companion thesis; name-first personalization; regime compare as “aha.”

**Gaps:** Too many steps; jargon early (AIS/26AS); paywall before value is fully felt; connectors over-promised; B2C vs CA entry muddled; NRI offered then blocked.

**Stripe bar:** Never let users complete work the system cannot fulfill.

---

# 5. Engine Score: **42 / 100**

**Strengths:** Python orchestrator with slabs, deductions, regime compare, senior flags, risk hooks; golden-test direction exists in prior builds.

**Gaps:** Not schedule-complete; CG/112A/F&O/business/NRI/FA/AL incomplete or absent; advance tax path uneven; no full ITD JSON parity for all forms; no cross-engine certification program.

**Winman/Computax bar:** Deterministic, versioned rules, full schedule coverage, audit trail per field.

---

# 6. Tax Accuracy Score: **35 / 100** (end-to-end)

Engine core for simple salary may be ~55–60; **product accuracy is lower** because:

- Document import invents or blocks inconsistently historically  
- UI may not pass age/residency/deductions completely  
- Refund/TDS without real 26AS is guesswork  
- Marketing claims exceed capability  

**Deloitte/EY bar:** Every number has a source (document, user attestation, or calculation with citation).

---

# 7. Trust Score: **28 / 100**

**Strengths:** “We don’t auto-file”; ITD non-affiliation; estimate disclaimers.

**Gaps:** Illustrative reviews; “Live” badges; AI-as-CA language; thin company identity; support SLA unclear; security history.

**Mercury bar:** Legal entity, address, support hours, status page, clear liability language.

---

# 8. Security Score: **30 / 100**

Improving (scrypt, fail-closed payments, no hardcoded ZeroGPT key, blog upload gated). Still missing: payment webhooks, rate limits at edge, HTML sanitization, pen test, DPDP proof, encryption-at-rest for documents, admin session hardness in production config.

**Stripe bar:** Threat model for PAN/Form16; secrets vault; webhook-verified money path.

---

# 9. Competitor Comparison Matrix

| Capability | ITD Portal | ClearTax | Tax2win / EZTax | Computax | Winman | Gen IT | LastMinuteITR (today) | 10X target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Free e-file | ★★★★★ | ★★★★ | ★★★ | — | — | — | ★ (guide only) | Stay companion |
| Salaried simplicity | ★★ | ★★★★ | ★★★★ | ★★ | ★★ | ★★ | ★★★ | ★★★★★ |
| CA bulk workflow | ★ | ★★ | ★ | ★★★★★ | ★★★★★ | ★★★★ | ★ | ★★★★★ |
| AIS/26AS reconcile | ★★★★★ | ★★★★ | ★★★ | ★★★★ | ★★★★ | ★★★ | ★ | ★★★★★ |
| CG / 112A | ★★★★ | ★★★★ | ★★★ | ★★★★★ | ★★★★★ | ★★★★ | ★ | ★★★★ |
| F&O | ★★★ | ★★★ | ★★ | ★★★★★ | ★★★★★ | ★★★★ | ★ | ★★★★ |
| AI judgment | ★ | ★★ | ★ | ★ | ★ | ★ | ★★ | ★★★★★ |
| Notice prevention | ★★ | ★★★ | ★★ | ★★★★ | ★★★★ | ★★★ | ★★ | ★★★★★ |
| Trust / brand | ★★★★★ | ★★★★ | ★★★ | ★★★★ (CA) | ★★★★ | ★★★ | ★★ | ★★★★ |
| Mobile UX | ★★ | ★★★★ | ★★★ | ★ | ★ | ★ | ★★★ | ★★★★★ |
| Price transparency | ★★★★★ | ★★★ | ★★★ | License | License | License | ★★★ | ★★★★★ |
| Audit trail | ★★★★ | ★★ | ★★ | ★★★★★ | ★★★★★ | ★★★★ | ★ | ★★★★★ |

### Where LastMinuteITR can be 10X better

1. **Evidence-linked AI CA** — every suggestion cites section + source field (ClearTax chat cannot)  
2. **Portal companion as product** — not a side feature (ITD is hard; we make ITD usable)  
3. **Mismatch-first UX** — start from AIS/26AS/Form16 deltas, not 150 questions  
4. **CA co-pilot** — cloud, collaborative, not desktop license lock-in  
5. **Speed to portal-ready** — under 15 minutes for simple salaried  
6. **Honest scope** — refuse NRI/crypto/FA early (trust > coverage theater)

---

# 10. Missing Features (prioritized inventory)

### Must-have for credible B2C (V1)

- Real Form16 multi-employer parse with confidence  
- Real AIS + 26AS parse + reconcile  
- ITR-1 complete path with pre-file validation  
- Regime compare with confidence + “based on entered data”  
- Portal companion field map for ITR-1  
- Working payments + entitlements  
- Notice-risk checklist (plain language)  
- DPDP erasure + session security  

### Should-have (V2)

- ITR-2 salary+CG (112A, equity MF)  
- Broker CAS/P&L (Groww, Zerodha)  
- HP (one self-occupied / one let-out)  
- Advance tax / 234B/C estimator  
- CA dashboard: client pipeline, bulk JSON  

### Good-to-have (V3)

- ITR-3/4 presumptive + simple PGBP  
- F&O turnover & audit flags  
- HUF basic  
- Multi-language (Hindi)  

### Moonshot (V4–V5)

- Notice reply assistant (with CA review)  
- Continuous tax health (year-round)  
- Employer HR bulk Form16 distribution  
- GST–ITR cross checks for small business  
- Fully auditable open tax ruleset certification  

---

# 11. Biggest Risks

| Risk | Type | Severity | Mitigation |
| --- | --- | --- | --- |
| Wrong tax numbers → notices | Legal/trust | Critical | Evidence graph; block demo data; golden tests |
| Overclaiming AI/CA | Regulatory | Critical | “Assisted prep, not CA advice” + refuse complex cases |
| Payment/entitlement fraud | Revenue | High | Webhooks; amount bind; no mock in prod |
| PII breach (PAN, Form16) | Security | Critical | Encryption, minimal retention, pen test |
| Scope creep to all ITR forms | Strategy | High | Ruthless V1 persona lock |
| Computax-grade CA expectations too early | Product | High | CA co-pilot for data entry first, not full replacement |
| SEO content that is tax-wrong | Brand | High | CA review on money pages |
| Hallucinating AI | Trust | Critical | Retrieval + rules engine only; no free-form tax law |

---

# 12. Quick Wins

| Recommendation | Why | User benefit | Business benefit | Complexity | Time | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| Configure Razorpay + session secrets | Unblocks revenue | Can pay | Cashflow | Low | 1 day ops | P0 |
| Honest connector badges only | Trust | No false hope | Fewer refunds/complaints | Low | Done/ongoing | P0 |
| Single price CTA language | Conversion | Clarity | Higher checkout | Low | Done | P0 |
| Block NRI/crypto early with CA referral | Accuracy | Safety | Lower notice risk | Low | Done/ongoing | P0 |
| Regime compare as hero of filing | Value moment | “Aha” | Conversion | Med | 1–2 wk | P1 |
| Companion preview before paywall | Conversion | Know what they buy | Higher WTP | Med | 1 wk | P1 |
| Real reviews or “example scenarios” label | Trust | Honesty | Brand | Low | 3 days | P1 |
| Field-level confidence UI | Trust | Know what to check | Fewer support tickets | Med | 1–2 wk | P1 |

---

# 13. High Impact Features

| Feature | Why | User benefit | Business benefit | Complexity | Time | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| AIS↔26AS↔Form16 reconcile engine | Core notice prevention | Avoid notices | Differentiation | High | 6–10 wk | P0 product |
| Evidence-linked Smart CA (not chatbot) | Moat | Feels like CA | Premium pricing | Very high | 3–6 mo | P0 strategy |
| ITR-1 portal companion completeness | Paid value | File successfully | Revenue | High | 4–8 wk | P0 |
| Multi-Form16 merge | Common salaried case | Job changers | Segment capture | Med-high | 3–5 wk | P1 |
| Broker import (Groww/Zerodha) → 112A | Investor segment | CG accuracy | ARPU | High | 8–12 wk | P1 |
| CA firm workspace | B2B revenue | Speed for CAs | Seat licenses | Very high | 4–9 mo | P1 strategy |
| Pre-file validation = ITD-like errors | Fewer rejects | Confidence | Trust | High | 6–10 wk | P1 |
| Notice risk score with explanations | Fear reduction | Peace of mind | Conversion | Med-high | 4–6 wk | P1 |

---

# 14. AI Opportunities (non-hallucinating)

AI must sit **on top of** deterministic engine + documents — never replace them.

| Opportunity | Pattern | Guardrail |
| --- | --- | --- |
| Dynamic questionnaire | Decision tree + ML ranking of next question | Only ask if information gain > threshold |
| Document classification | Vision/OCR + rules | Human confirm low confidence |
| Field extraction | OCR + schema validators | Confidence score; never silent fill |
| Deduction suggestions | Rules engine proposes; LLM explains | Cite section; user must confirm |
| Mismatch narrative | Template + LLM polish | Numbers from reconcile engine only |
| Regime explanation | Engine computes; LLM explains delta | No new numbers from LLM |
| Portal step guidance | Structured companion JSON | Versioned to ITD UI changes |
| CA review summary | Summarize evidence pack | CA must approve |

**Anthropic/OpenAI product principle:** Prefer *tools + retrieval + structured outputs* over chat.

---

# 15. Roadmap (Versions)

### Version 1 — “Portal-ready salaried” (0–4 months)

**Persona:** Resident, age <60 or senior simple, salary + interest, ≤1 HP self-occupied, no CG/F&O/foreign/crypto/NRI  

**Must:** Form16, AIS, 26AS, reconcile, ITR-1, regime, companion, payments, security baseline, golden tests (50+)  

### Version 2 — “Investor lite + CA pilot” (4–10 months)

**Add:** Equity/MF CG (112A), broker imports, ITR-2 subset, CA multi-client beta, advance tax tool  

### Version 3 — “Small business & F&O flags” (10–18 months)

**Add:** ITR-3/4 presumptive, F&O turnover warnings, audit flags, Hindi  

### Version 4 — “CA operating system” (18–30 months)

**Add:** Bulk pipeline, AY rollover, notice pack, firm roles, billing, Winman/Computax import bridges  

### Version 5 — “Tax health platform” (30–48 months)

**Add:** Year-round tracking, employer partnerships, continuous AIS monitoring, advisory marketplace  

---

# 16. Technical Debt (strategic)

| Debt | Impact | Paydown phase |
| --- | --- | --- |
| Plan ID / entitlement fragmentation | Revenue bugs | Implementation P0 |
| Incomplete parsers | Accuracy | Tax Engine + Upload |
| Client-heavy filing pages | Perf/UX | UI/UX phase |
| No payment webhooks | Entitlements | Implementation |
| In-memory rate limits | Abuse | Implementation |
| Content as giant TS modules | Bundle | Architecture |
| Missing observability | Ops | Implementation |
| No formal rules versioning | Accuracy | Tax Engine |
| Dual B2C/CA auth models | Security | Architecture |

---

# 17. Business Opportunities

1. **Category creation:** “Portal companion” — not e-file, not desktop CA software  
2. **Trust arbitrage:** Honest scope beats fake “file anything”  
3. **CA displacement of data entry, not judgment** — sell co-pilot seats  
4. **Seasonal cash + off-season content/tools** (HRA, rent receipt, regime)  
5. **Employer Form16 distribution** (HR SaaS wedge)  

**TAM sketch (directional, not diligence-grade):**

- ~7–8 Cr+ ITR filers; digital share growing  
- CA software market (Computax/Winman-class) is high-ARPU, sticky  
- B2C ARPU ₹300–₹2,500; CA seat ₹5k–₹50k/year potential  

---

# 18. Revenue Opportunities

| Stream | Model | When |
| --- | --- | --- |
| B2C Starter / AI Smart | One-time per AY | V1 |
| CA Review add-on | High ticket | V1–V2 |
| CA seats + client credits | Subscription + usage | V2–V4 |
| Employer Form16 portal | B2B annual | V3–V4 |
| API for fintechs (broker tax packs) | Usage | V4–V5 |
| Affiliate (insurance/tax-saving products) | Careful, compliance-heavy | Later only |

**Pricing principle (Stripe):** Price the *outcome* (portal-ready, notice-safe), not “AI chat.”

---

# 19. CA Opportunities

### Small CA (1–5 people) — Tier 2/3 heavy

- Pain: Excel, WhatsApp clients, Computax license cost, seasonal overload  
- Sell: Mobile client collection + auto-reconcile + export to their software  
- Dream: “Clients upload; I only review exceptions”

### Medium CA (5–25)

- Pain: Staff training, inconsistent quality, review bottlenecks  
- Sell: Firm workspace, role-based review, exception queues  
- Dream: Junior staff productivity 3× without quality drop

### Large CA / networks

- Pain: Standardization, audit trail, multi-office  
- Sell: SSO, audit logs, policy packs, API  
- Dream: Firm-wide control tower for AY status

**Do not promise “replace CA.”** Promise “remove data entry and mismatch hunting.”

---

# 20. SEO Opportunities

### Priority clusters (topical authority)

1. **Form 16** — how to read, multiple Form16, password, Part A/B  
2. **AIS / TIS / 26AS** — mismatch, how to download, reconcile  
3. **Old vs new regime** — calculators, 10IEA, switch rules  
4. **ITR-1 vs ITR-2** — eligibility, mistakes  
5. **Capital gains / 112A** — equity, MF, grandfathers  
6. **Notices** — 143(1), AIS mismatch, defective return  
7. **Deadlines / e-verify** — seasonal spikes  
8. **Deductions** — 80C, 80D, 80TTB, HRA, 80GG  

### Programmatic SEO

- `/glossary/[term]` (exists — expand)  
- `/learn/[slug]` (exists — accuracy QA)  
- City-agnostic “how to file ITR for [persona]”  
- “AIS shows X but Form16 shows Y” mismatch library  

### 500 blog ideas

See `06_PHASE_SEO_MARKETING.md` (cluster lists totaling 500+ titles).

---

# 21. Marketing Opportunities

| Channel | Play |
| --- | --- |
| YouTube/Shorts | “Form16 in 60 seconds”, mismatch stories |
| Instagram/Reels | Myth-busting, regime tips (compliance-safe) |
| LinkedIn | CA co-pilot narrative, founder tax-season diaries |
| Twitter/X | Real-time deadline + portal outage utility |
| Referral | Give ₹X credit / unlock feature for both sides |
| CA partner | White-label companion + lead share |
| College ambassadors | Campus tax literacy (brand, not hard sell) |
| Corporate HR | Form16 distribution + employee filing weeks |
| Influencers | Finance creators with script approval + disclaimers |

**Trust-first creative:** Never guarantee refunds. Always “estimates; you file on ITD.”

---

# 22. Product Recommendations (top 10)

1. Lock V1 persona ruthlessly (resident salaried simple)  
2. Build **evidence graph** (document → field → schedule → ITR JSON)  
3. Replace chatbot ambition with **Smart CA decision engine**  
4. Make **mismatch-first** the default filing spine  
5. Ship **portal companion** as the paid core, not a PDF dump  
6. Instrument funnel: upload → reconcile → regime → pay → companion  
7. CA beta as co-pilot, not full Computax clone in Year 1  
8. Hindi + plain language as product, not afterthought  
9. Refuse unsupported cases with warm CA referral  
10. Public trust center: security, DPDP, methodology  

---

# 23. Code Refactoring Recommendations (for Implementation phase only)

| Area | Recommendation | Why | Complexity | Priority |
| --- | --- | --- | --- | --- |
| Tax rules | Versioned rules package + golden scenarios CI | Accuracy | High | P0 |
| Documents | Parser interface + confidence + no demo path | Trust | Med | P0 |
| State | Single filing state machine | UX bugs | High | P1 |
| Payments | Webhooks + order-plan binding | Revenue | Med | P0 |
| Auth | Shared session/password modules (started) | Security | Med | P0 |
| API | OpenAPI + rate limits (Upstash) | Scale | Med | P1 |
| Frontend | Split god pages; server components for content | Perf | Med | P1 |
| Observability | Sentry + structured logs + payment alerts | Ops | Med | P1 |
| Content | Move learn articles out of client bundles | Perf | Low | P2 |

**No code in this phase.**

---

# 24. Final Priority Matrix (Impact vs Effort)

```
                    HIGH IMPACT
                         │
     P0 NOW              │         P0 STRATEGY
     • Razorpay live     │         • Evidence graph
     • AIS/26AS real     │         • Smart CA engine
     • ITR-1 companion   │         • CA co-pilot beta
     • Golden tests      │
                         │
 LOW EFFORT ─────────────┼───────────── HIGH EFFORT
                         │
     P2 QUICK            │         P2 LATER
     • Copy/trust UI     │         • Full ITR-3/4
     • Review honesty    │         • F&O complete
     • Hindi strings     │         • Notice marketplace
                         │
                    LOW IMPACT
```

### Priority stack (next 90 days — still research-gated)

1. **Ops:** Razorpay + secrets live (ops, not code research)  
2. **Research sign-off** on V1 persona + evidence model (this doc)  
3. **Architecture phase** — evidence graph, state machine, parser interfaces  
4. **Tax engine phase** — ITR-1 completeness + reconcile specs  
5. **UX phase** — mismatch-first flows  
6. **Smart AI CA phase** — question policy + explanation layer  
7. **Only then Implementation**

---

# Interview Simulation — CA Firms (condensed)

*Synthetic research based on known market patterns (not literal interviews). Treat as directional.*

## Small CA (n≈500 simulated)

| Theme | Insight |
| --- | --- |
| Biggest pain | Client data collection via WhatsApp; incomplete docs |
| Slowest workflow | AIS vs books vs Form16 reconcile |
| Manual work | Excel bridges into Computax/Winman |
| Excel dependency | Extreme — “master file” per client |
| Client mistakes | Wrong regime, missed interest, wrong HP |
| Notices | AIS mismatch, defective returns, TDS credit |
| Wish list | Client app that forces complete uploads |
| Dream | Exception-only review queue |

## Medium CA (n≈200)

| Theme | Insight |
| --- | --- |
| Pain | Junior quality variance |
| Slowest | Review of staff-prepared returns |
| Missing software | Collaboration + audit trail in cloud |
| Wish list | Policy packs (“our firm never claims X”) |
| Dream | Real-time AY dashboard across staff |

## Large CA (n≈50)

| Theme | Insight |
| --- | --- |
| Pain | Standardization across offices |
| Slowest | Partner review cycles |
| Wish list | SSO, permissions, immutable logs |
| Dream | Firm-wide risk heat map |

**Time waste estimate (industry pattern):** 40–70% of tax-season hours on data entry and reconcile — prime AI co-pilot target.

---

# Interview Simulation — Taxpayers (condensed)

*Synthetic, directional.*

| Segment | Confuses them | Why delay | Why hire CA | Switch trigger |
| --- | --- | --- | --- | --- |
| Salaried eng | AIS vs Form16 | Fear of mistake | Peace of mind | 15-min Form16 flow |
| Job changer | Two Form16s | Complexity | Merge employers | Auto-merge |
| MF investor | 112A / grandfathers | Spreadsheets | CG schedules | Broker import |
| F&O | Turnover vs profit | Audit fear | Specialist CA | Clear audit flag |
| Senior | 80TTB / regime | Portal UX | Family help | Large type + Hindi |
| NRI | Residency tests | Deadlines | Specialist | Honest “not us” + referral |
| Freelancer | Advance tax | Cashflow | Compliance | Quarterly nudges |
| Crypto | Reporting | Uncertainty | Specialist | Refuse + educate |

**Fear stack:** Notice > paying extra tax > data theft > missing refund.

**Trust killers:** Fake reviews, guaranteed refunds, “AI CA” without evidence, auto-file claims.

---

# Computax — What to learn (not copy UI)

| Computax strength | AI removal of manual effort |
| --- | --- |
| Rigid input sequence | Dynamic only-ask-what’s-needed |
| Schedule completeness | Auto-map from documents |
| Validation errors | Pre-file ITD-like checks |
| Bulk client list | Cloud pipeline + status |
| Reports | One-click evidence pack |
| Audit trail | Field-level provenance |

**AI should remove:** typing, schedule hunting, mismatch eyeballing, regime spreadsheet.  
**AI should not remove:** professional judgment on ambiguous facts, representation before ITD (without license).

---

# Tax Rules — Research stance (not a substitute for a rules engine)

V1 rules must be **explicitly versioned** to AY (e.g. AY 2026-27 / FY 2025-26) and include:

- Slab rates old/new; 87A; cess  
- Standard deduction; employer TDS  
- 80C/80D/80TTA/80TTB/HRA/80GG as applicable by regime  
- HP: annual value, 30%, interest caps  
- ITR-1 eligibility gates (no CG, no foreign, etc.)  
- Regime / 10IEA constraints as applicable for AY  
- AIS/TIS/26AS credit logic  

**Known gap classes to catalog in Tax Engine phase (target 500 checks):**  
eligibility routing, schedule presence, cross-schedule totals, TDS vs income, CG special rates, loss carryforward, depreciation, director/HUF/NRI exclusions, crypto, FA/AL triggers, presumptive limits, audit thresholds, etc.

Full checklist lives in `03_PHASE_TAX_ENGINE.md`.

---

# Smart AI CA — Design principles

1. **Not a chatbot** — a case manager with state  
2. **Evidence or attestation required** for every number  
3. **Dynamic questions** from information-gain policy  
4. **Explanations cite law + field**  
5. **Notice risk is first-class**  
6. **Refuse unsupported personas**  
7. **Human CA escalation path**  

Details: `05_PHASE_SMART_AI_CA.md`

---

# Document Upload Engine — Design principles

- Multi-file, multi-employer, multi-broker  
- Auto-classify → extract → confidence → conflict UI  
- Never invent values  
- Conflict resolution is a product surface, not a log line  

Details: `02_PHASE_PRODUCT_ARCHITECTURE.md` + `05_PHASE_SMART_AI_CA.md`

---

# Phase Gates (mandatory)

| Gate | Exit criteria |
| --- | --- |
| Research | This report accepted by founders |
| Architecture | Evidence graph + state machine + API boundaries approved |
| Tax Engine | V1 rule catalog + 50 golden scenarios defined |
| UI/UX | Mismatch-first flows prototyped (design only) |
| Smart AI CA | Question policy + non-hallucination rules approved |
| SEO/Marketing | Cluster plan + brand voice approved |
| Implementation | Only after above |
| Testing & Compliance | Pen test + tax golden + DPDP checklist |

---

## Final recommendation

**Build a narrow, obsessively accurate, evidence-linked AI companion for resident salaried India — then expand into CA co-pilot.**  

That is the Computax-beating, ClearTax-differentiating, $1B-shaped path. Everything else is distraction until V1 is boringly correct.

**No code should be written until Phase 1 is signed off and Phase 2 architecture is approved.**
