# Quicko Filing Journal — June 2026

**Audit method:** Public marketing + auth boundary probe. No test PAN/mobile provided.

---

## Screens reached

| Step | URL | Headline / state | Notes |
|------|-----|------------------|-------|
| QK-01 | quicko.com/ | "File your taxes in 15 minutes" | Refund widget, persona carousel |
| QK-02 | quicko.com/signin | 404 — "We can find every credit… just not this page" | Auth not at this path |
| QK-03 | learn.quicko.com/ | Learn hub search hero | Bytes/Blog/Tools/Help cards |
| QK-04 | help.quicko.com/ | Help Center landing | Save/Pay/File KB (fetch title only) |

---

## Screens not reached (auth wall)

| Step | Expected screen | Blocker |
|------|-----------------|---------|
| QK-AUTH | Login / OTP | No public signin URL; app/glyde auth |
| QK-PAN | ITD import / PAN OTP | Requires account |
| QK-IMPORT | Autofill from ITD | Post-login |
| QK-REVIEW | Section nav with badges | In-app only |
| QK-PAY | Plan selection ₹799/999 | Post-login |
| QK-EFILE | E-file + e-verify | Post-pay |

---

## Inferred funnel (from COMPETITOR_ANALYSIS + partner pages)

1. **Autofill** — ITD OAuth / credential import first
2. **Review** — Expandable income nav (Salary, HP, CG, Deductions) with incomplete badges
3. **E-file** — Pay gate on submit; Aadhaar OTP e-verify with 30-day deadline copy

---

## Competitor UX patterns to mirror (companion-safe)

| Pattern | LastMinute target |
|---------|-------------------|
| 3-step macro (Autofill → Review → File) | `ProductProcessFlow` |
| Section nav red/amber/green | `FilingLayout` nav dots |
| Refund/payable sticky | `FilingSummaryRail` |
| Form 16 scan hero | Form16-first routing |
| E-verify 30-day urgency | `/file/checkout/everify` |

---

## OTP blocked?

**Yes** — could not enter filing app without account. Deeper audit requires test PAN + mobile at competitor OTP screen.

---

## Confirmed flow (Quicko public docs + product walkthrough, June 2026)

Sourced and re-articulated from [quicko.com](https://quicko.com/), [it.quicko.com](https://it.quicko.com), Quicko's filing FAQs, [quicko.com/tools/know-your-itr-form](https://quicko.com/tools/know-your-itr-form), and [quicko.com/pricing](https://quicko.com/pricing).

| Screen ID | Quicko screen | What they show | LastMinute route | Companion re-articulation |
|-----------|---------------|----------------|------------------|---------------------------|
| QK-S1-start | Start filing | "Autofill and file from start to finish"; app connections (broker/salary) | `/file` → documents | Import Form 16 / AIS; connectors are roadmap, not over-claimed. |
| QK-S2-prepare | Prepare ITR (it.quicko.com) | Add income sources; ITR form auto-determined (ITR-1→2→3 as you add CG / B&P) | review tabs (Phase 3) | We surface recommended ITR form from entered sources; honest about scope. |
| QK-S3-salary-form16 | Salary section | "Add salary" → "Upload Form 16"; verify; "Add" again for each employer | documents multi-upload (Phase 2A) | Same multi-employer pattern; aggregate gross + TDS. |
| QK-S4-regime | Tax computation / Regime analyzer | Side-by-side old vs new; switch in additional details | `/file/regime` + Summary tab | Reuse our regime engine; honest estimate disclaimer. |
| QK-S5-tools | Tools (Know your ITR form, calculators) | Standalone calculators feeding the funnel | `/tools` (Phase 4) | Engine-backed estimator + regime compare + HRA, with "Save to draft". |
| QK-S6-pricing | Plans ₹0 / ₹499 / ₹999 | Free for simple; paid by income/sources | `/file/checkout/plans` | Value-before-pay; transparent on what each tier covers. |
| QK-S7-efile | File + e-verify | Submit when ITD utility live; Aadhaar OTP e-verify; 30-day deadline | companion + `/file/checkout/everify` | We hand off to portal; reinforce e-verify deadline. |

**Key takeaways:** dynamic ITR-form determination from income sources; regime analyzer as a discrete compare moment; tools as top-of-funnel; multi Form 16 via "add salary" repetition.
