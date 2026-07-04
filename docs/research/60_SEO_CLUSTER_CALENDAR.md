# 60 — SEO Cluster Calendar (Phase 6)

> 90-day editorial calendar for topical authority. Money pages need CA review before publish. AY must be labeled on every tax-number page.

**Status:** ✅ EXECUTED (Jul 2026)  
**Implements:** Phase 6 exit item — cluster calendar for 90 days  
**Code mirror:** `frontend/lib/seo/contentCalendar.ts`

---

## 1. Goals (season-aware)

| Goal | Metric | 90-day target |
| --- | --- | --- |
| Own Form16 + AIS intent | Non-brand organic sessions on `/learn/*` | +40% vs baseline |
| Feed product funnel | Learn → `/file` CTR | ≥8% on pillar pages |
| Trust, not spam | Support tickets from content claims | 0 refund-guarantee tickets |
| Topical authority | Cluster heads in top-20 (IN) | Form16, AIS mismatch, old vs new |

**Paid search stays off** until upload → reconcile → pay conversion clears the Phase 6 measurement bar (doc 06 §4).

---

## 2. Pillar → cluster map

```
Pillar: /learn/itr-filing-guide (or strongest existing salaried guide)
  ├─ Form16 cluster     → /file/import/documents
  ├─ AIS/26AS cluster   → /file/import/mismatch
  ├─ Regime cluster     → /file/regime + /tools/tax-calculator
  ├─ Deductions cluster → /file/deductions
  ├─ Notice cluster     → /help + companion
  └─ Persona cluster    → /file (eligibility gate)
```

Internal linking rules:

1. Every learn article links to **one** glossary term and **one** product CTA.
2. Tools pages link back to the matching explainer (calculator → regime article).
3. No orphan glossary terms — each indexable term appears in ≥1 learn footer.

---

## 3. Priority clusters (first 90 days)

Publish order optimizes **intent × product readiness × competition**:

| Priority | Cluster | Why first | Product CTA |
| --- | --- | --- | --- |
| P0 | Form16 | Highest upload intent; we parse it | Upload Form 16 |
| P0 | AIS / mismatch | Unowned gap vs ClearTax narrative | Reconcile AIS |
| P0 | Regime | High traffic; we have live compare | Compare regimes |
| P1 | ITR-1 vs 2/3/4 | Routes users correctly (engine ready) | Start eligibility |
| P1 | Deductions (80C/80D/HRA) | SmartSavingsFinder live | Deductions screen |
| P1 | Deadlines / late fee | Seasonal urgency | Start filing |
| P2 | Notices (143(1), 139(9)) | Trust + retention | Risk review |
| P2 | Portal how-tos | Companion positioning | Companion unlock |
| P3 | Capital gains / freelancers | ITR-2/3/4 engine ready; publish carefully | CA path if needed |

---

## 4. 90-day calendar (weekly)

**Season window:** Week of 7 Jul 2026 → week of 29 Sep 2026 (pre-deadline authority build).  
**Cadence:** 3 articles/week (2 refresh-or-promote live pages + 1 net-new when gap exists).  
**CA review:** any page with a rupee amount, slab, or rebate claim.

| Week | Focus | Ship (titles) | Primary CTA |
| --- | --- | --- | --- |
| W1 | Form16 basics | How to read Form16 Part B; Form16 password; Two Form16 job change | Upload Form 16 |
| W2 | Form16 mistakes | Form16 vs payslip vs AIS; Wrong TDS on Form16; Standard deduction on Form16 | Upload Form 16 |
| W3 | AIS core | What is AIS; AIS vs 26AS; Download AIS step-by-step | Import AIS |
| W4 | AIS mismatch | AIS shows FD interest; AIS dividend not in Form16; How to submit AIS feedback | Reconcile |
| W5 | Regime | Old vs new regime calculator explainer; 87A rebate new regime; When old regime wins | Compare regimes |
| W6 | Regime edge | Home loan + regime; HRA metro vs new regime; Senior citizen regime | Compare regimes |
| W7 | ITR forms | ITR-1 vs ITR-2; Who cannot file ITR-1; ITR-4 presumptive guide | Eligibility |
| W8 | ITR forms | Job change which ITR; Capital gains need ITR-2; Defective return 139(9) | Eligibility |
| W9 | Deductions | 80C limit guide; 80D self and parents; 80CCD(1B) NPS extra | Deductions |
| W10 | Deductions | HRA exemption; 80GG no HRA; 80TTA / 80TTB savings interest | Deductions |
| W11 | Notices & trust | 143(1) intimation meaning; Outstanding demand; Why we don't auto-file | Risk / Companion |
| W12 | Deadlines & portal | ITR deadline AY 2026-27; Late fee 234F; E-verify Aadhaar OTP | Start filing |
| W13 | Buffer / refresh | Update top-10 pages with AY labels; fix internal links; promote winners | Funnel CTAs |

Live inventory is resolved in code (`contentCalendar.ts`): if a slug already exists in `LEARN_ARTICLES`, the week entry is **promote/refresh**; otherwise **planned**.

---

## 5. Programmatic SEO (V1 scope)

| Pattern | V1 | V2 |
| --- | --- | --- |
| `/glossary/[term]` | Expand only terms linked from live learn pages | 200+ terms |
| `/learn/[slug]` | Editorial articles only | Persona templates |
| SEO landing pages | Keep 3 high-intent landings (`itr-deadline-2026`, `old-vs-new-regime`, `form-16-filing`) | Add AIS mismatch landing |
| Comparison pages | Avoid naming competitors in titles | Careful feature matrices only |

---

## 6. Editorial QA gate (CI-friendly)

Before a money page ships:

- [ ] AY labeled in title or first paragraph (`AY 2026-27`)
- [ ] No banned words (doc 42 / `marketingDisclaimers.ts`)
- [ ] Every ₹ amount has a source (statute, engine, or "example")
- [ ] CTA is companion/prep — never "we file for you"
- [ ] CA review checkbox for pages with tax arithmetic

---

## Phase 6 exit — this doc

- [x] Cluster calendar for 90 days defined
- [x] Priority order locked to product readiness
- [x] Code mirror for live-vs-planned resolution
