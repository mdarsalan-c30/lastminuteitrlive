# Tax Accuracy Review — LastMinute ITR

**Date:** 2026-07-03  
**Overall tax trust score: 4/10 for end-to-end product** (engine core closer to **6/10**)

---

## Scope

- Python engine: `backend/engine/` (orchestrator, slabs, deductions, regime, salary, HP, risk, profiler)
- Frontend compute bridge: `/api/compute`
- Import path: Form 16 / AIS / 26AS / brokers
- UI claims on marketing and tools

---

## What the engine appears to do well

| Area | Evidence | Notes |
| --- | --- | --- |
| Old vs new regime compare | `regime_compare.py`, `tax_slabs.py` | Core value prop |
| Senior / super-senior flags | `profiler.py` age ≥60 / ≥80 | Needed for slabs & 80D/80TTB |
| 80C / 80D / 80TTA / 80TTB caps | `deductions.py` comments + caps | Structure looks intentional |
| Auto 80TTA/TTB from savings interest | `orchestrator._auto_fill_deduction_inputs` | Good UX if interest correct |
| NRI rejection | `profiler.py` residential_status | Honest at engine layer |
| Risk checker | `risk_checker.py` | Notice-oriented warnings |
| Disclaimers | Marketing + tools | Estimates, not advice |

---

## Critical tax product failures

### T-P0-1 — Demo income injected for AIS / 26AS / CAMS

| Field | Detail |
| --- | --- |
| **Severity** | P0 |
| **Location** | `frontend/app/api/documents/upload/route.ts` `MOCK_FIELDS` |
| **Why bad** | Fabricated salary/TDS/interest can flow into compute → wrong tax/refund → user notices. Marketing says Live. |
| **TurboTax** | Never invents third-party data. |
| **Fix** | Real parsers or hard-stop. |

### T-P0-2 — Form 16 `demo_fallback` mode

| Field | Detail |
| --- | --- |
| **Severity** | P0 |
| **Location** | Upload response `parseMode: "demo_fallback"` |
| **Why bad** | Partial/wrong extraction presented as success with weak warnings. |
| **Fix** | Block progression to regime/review until user confirms every field; no silent demo numbers. |

### T-P0-3 — NRI path offered in tools, rejected in engine

| Field | Detail |
| --- | --- |
| **Severity** | P0 |
| **Why bad** | Wrong residential status is a classic notice trigger. |
| **Fix** | Eligibility gate. |

### T-P1-1 — Capital gains / F&O claimed in pricing features

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | Plan features: "Capital Gain / F&O Calculation" |
| **Why bad** | Broker imports are stubs. CG schedules are complex (grandfathers, 112A, STT, F&O business income). Overclaim. |
| **Fix** | Remove claim or implement with broker-specific parsers + schedule mapping. |

### T-P1-2 — House property complexity

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | HP module exists; multi-property / co-ownership / municipal tax nuances |
| **Why bad** | Easy to understate income or overstate interest (24b). |
| **Fix** | Limit to simple self-occupied / one let-out in v1; escalate complex cases. |

### T-P1-3 — Regime recommendation language

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | Marketing + regime UI |
| **Why bad** | "Cheaper" depends on complete deductions. Missing 80C/HRA inputs flip recommendation. |
| **Fix** | Always show "based on data entered" and confidence score. |

### T-P1-4 — TDS / refund logic depends on complete 26AS

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Why bad** | Without real 26AS, refund/tax payable is guesswork. |
| **Fix** | Require 26AS or explicit "TDS unknown — refund estimate unavailable". |

### T-P1-5 — Advance tax / 234B/C

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | `/tools/advance-tax` **404** on this deploy; prior builds had `advance_tax.py` |
| **Why bad** | Freelancers mis-estimate interest. |
| **Fix** | Ship tool or remove claims. |

### T-P2-1 — ITR form selection quiz is rule-based (good) but must match engine profiler

| Field | Detail |
| --- | --- |
| **Severity** | P2 |
| **Location** | `/tools` quiz vs eligibility onboarding |
| **Fix** | Single eligibility module shared by tools and filing. |

### T-P2-2 — HRA calculator says "exact"

| Field | Detail |
| --- | --- |
| **Severity** | P2 |
| **Location** | Tools copy |
| **Why bad** | HRA needs metro flag, salary components, rent, landlord PAN thresholds. |
| **Fix** | Say "estimate". |

### T-P2-3 — AY labeling

| Field | Detail |
| --- | --- |
| **Severity** | P2 |
| **Evidence** | Tools: AY 2026-27 (FY 2025-26) |
| **Why bad** | Must match engine slab year constants exactly. |
| **Fix** | Single `ASSESSMENT_YEAR` constant shared FE/BE. |

---

## Persona coverage

| Persona | Supported? | Risk |
| --- | --- | --- |
| Simple salaried + interest | Best path | Form16 quality |
| Job change (multi Form 16) | Partial (multi upload cap 5) | Employer-wise TDS |
| Senior citizen | Engine yes | UI age capture |
| Super senior | Engine flag | Verify slabs |
| HP owner | Partial | Complexity |
| Capital gains investor | **Marketed, weak** | High notice risk |
| F&O trader | **Marketed, weak** | Business income vs CG |
| Business / professional | Partial | ITR-3/4 complexity |
| NRI / RNOR | **No** | Must block |
| Director / audit cases | Unclear | Should exclude |

---

## Legal / claims risk

| Claim on site | Risk |
| --- | --- |
| "AIS · Live" | **False** today |
| "Form 26AS · Live" | **False** today |
| "Real-time AI Calculations" | Overstated |
| "Your person CA" | Misleading (AI, not CA) |
| Illustrative reviews with specific ₹ savings | Misleading if read as testimonials |
| "exact" HRA | Overstated |

**Compliance note on site is good** — but cannot compensate for false Live badges.

---

## Golden test recommendation (pre-launch)

Minimum **50** scenarios with expected tax (old/new), including:

1. Salary only, new regime, no deductions  
2. Salary + 80C max, old regime cheaper  
3. Senior 80TTB  
4. HRA metro vs non-metro  
5. HP interest self-occupied  
6. Multi employer Form 16  
7. FD interest only mismatch case  
8. Reject NRI input  

Do not launch without CI green on these.
