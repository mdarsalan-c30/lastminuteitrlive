# ClearTax Filing Journal — June 2026

**Audit method:** Homepage browser snapshot + uploaded landing markdown. Filing subdomain unreachable in browser.

---

## Screens reached

| Step | URL | Headline / state | Notes |
|------|-----|------------------|-------|
| CT-01 | cleartax.in/ | "File ITR in minutes with 100% Accuracy" | 8M users, refund ₹5346 Cr claims |
| CT-02 | cleartax.in/s/efile-income-tax-return | 404 Not found | Old deep link dead |
| CT-03 | my.cleartax.in/ | Browser error (chromewebdata) | App host blocked / DNS |

---

## Marketing funnel observed

| Element | Copy | CTA |
|---------|------|-----|
| Hero dual card | Self ITR vs Expert 24hr | Start Filing / Hire Expert |
| Persona strip | Salaried, Freelancer, Investor, NRI | Start Filing per card |
| Why choose us | Refund, 24x7, 100% accuracy | Implicit trust |
| Feature list | Zero manual entry, 80+ brokers | Start Filing |
| FAQ block | 50+ questions on homepage | SEO + reduce support |

---

## Screens not reached (auth / infra wall)

| Step | Expected | Blocker |
|------|----------|---------|
| CT-LOGIN | Mobile OTP login | App URL not reachable |
| CT-PAN | PAN + ITD OTP pre-fill | Auth required |
| CT-F16 | Form 16 drag-drop upload | Post-login primary CTA |
| CT-SUMMARY | Refund/payable tax summary rail | Post-upload |
| CT-PAY | Pay at File Now | Freemium gate |
| CT-EFILE | Platform e-file + e-verify | Post-pay |

---

## Inferred in-app flow (prior research validated on landing)

1. Login → PAN OTP → "95% auto-filled" reveal  
2. Form 16 upload (or continue without)  
3. Tabbed dashboard + left summary rail (refund sticky)  
4. Multi Form 16 loop for job changes  
5. Tax summary visualization before pay  
6. Coupon at checkout  
7. E-verify immediately post-file  

---

## LastMinute equivalents

| ClearTax screen | Our route | Gap status |
|-----------------|-----------|------------|
| Form 16 upload login | `/file/import/documents?source=form16` | Partial — now default |
| Summary rail | `FilingSummaryRail` on import/review/regime | **Implementing** |
| Section nav dots | `FilingLayout` income rail | **Implementing** |
| Tax summary | `/file/regime` + review | Exists |
| Pay gate | `/file/checkout/plans` | Exists (after value) |
| E-verify urgency | `/file/checkout/everify` | Exists — enhancing copy |

---

## OTP blocked?

**Yes** — filing app host failed to load; no test PAN used. User PAN + mobile needed for full depth per plan.

---

## Confirmed screen-by-screen flow (ClearTax product docs, June 2026)

Sourced and re-articulated from ClearTax's own help center and e-filing guides ([docs.cleartax.in file-itr-on-cleartax](https://docs.cleartax.in/product-help-and-support/for-individuals/file-itr/file-itr-on-cleartax), [cleartax.in/s/e-filing-with-multiple-form-16](https://cleartax.in/s/e-filing-with-multiple-form-16), [cleartax.in/s/how-to-e-file-your-income-tax-return](https://cleartax.in/s/how-to-e-file-your-income-tax-return)). This is the canonical journey our build mirrors (companion-safe).

| Screen ID | ClearTax screen | What they show | LastMinute route | Companion re-articulation |
|-----------|-----------------|----------------|------------------|---------------------------|
| CT-S1-login | Login / Get started | Account login; "Upload Form 16 PDF" vs "Continue Here" | `/file` → documents | Same first choice: import Form 16, or continue manually. No account wall up front. |
| CT-S2-pan-otp | PAN link + ITD OTP | PAN + DOB + mobile OTP, then a second OTP to pre-fill from ITD; "95% auto-filled" | (companion) link to ITD pre-fill on portal | We never store ITD credentials. We tell the user the portal already pre-fills ~95%; we reconcile it. |
| CT-S3-prefill-reveal | Pre-fill reveal | "95% of your information auto-filled" — name, income; editable | `ImportRevealPanel` (Phase 2C) | After Form 16 parse, show "Imported: employer, gross salary, TDS, standard deduction" + what still needs AIS. |
| CT-S4-form16-upload | Upload Form 16 | Drag-drop; "Upload another Form-16" for job changes; summary after | documents page multi-upload | "Add another Form 16 (job change)" with per-employer cards + TDS aggregation (Phase 2A). |
| CT-S5-personal | Personal Info tab | Name as per PAN, DOB, father's name, address, bank | review → Personal (Phase 3) | Factual fields only; bank for refund credit on portal. |
| CT-S6-income | Income Sources tab | Salary + TDS auto from Form 16; add other income; upload more Form 16 here too | review → Income | Salary/other-sources with AIS mismatch flags. |
| CT-S7-deductions | Tax Saving tab | 80C (LIC, PPF), 80D, other Chapter VI-A | review → Deductions | Claimed / needs-proof / not-applicable labels; no advice. |
| CT-S8-taxes-paid | Taxes Paid | Non-salary TDS, 26AS upload, self-assessment/advance tax | review → Taxes | TDS, advance tax, interest exposure (234A/B/C awareness). |
| CT-S9-summary | Tax Summary | Auto-selected ITR form, auto-suggested best regime, compare + switch, downloadable tax report | review → Summary + `/file/regime` | Regime compare with honest disclaimer; show ITR form suggestion + refund/payable. |
| CT-S10-file | File Now | Coupon code + payment (freemium gate) | `/file/checkout/plans` | Pay only after value (reconcile + summary), never before. |
| CT-S11-everify | E-verify Now | "E-verify now" button; instant on platform; acknowledgment number | `/file/checkout/everify` + companion | We hand off to the portal e-verify; reinforce 30-day deadline urgency. |

**Key takeaways for our build:**

- **Four-tab spine** (Personal · Income · Deductions · Summary) is the dashboard pattern → Phase 3 `/file/review` tabs.
- **Pre-fill reveal** is a distinct trust moment → Phase 2C `ImportRevealPanel`.
- **Multi Form 16** is first-class (salary section accepts more uploads) → Phase 2A aggregation.
- **Regime auto-suggest + compare/switch** on Summary → reuse our engine on the Summary tab.
- **Pay at File Now** (after summary) — we keep pay after value, no guarantee language.
