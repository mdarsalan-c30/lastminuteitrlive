# SOP: ITR-1 Portal Filing — Screen by Screen (AY 2026-27)

## Goal

Help a salaried resident filer file **ITR-1** on `incometax.gov.in` with LastMinute ITR open beside the portal. This is **Option B** (filing assistance). **Option A** (JSON download) is optional and paid.

## Product surface

In-app: `/file/companion` → **Screen-by-screen** (9 pages / chapters).  
Source content: intern Word guide + portal screenshots under `frontend/public/portal/itr1/`.

## Before you start (Chapter 0)

- Open LastMinute ITR companion and the Income Tax portal in parallel.
- Confirm LastMinute routed you to **ITR-1**. If not, switch form or stop.
- Keep ready: Form 16, Form 26AS, AIS, bank statements, investment proofs.
- **ITR-1 only if:** resident; income mainly salary / ≤2 HP / other sources; **112A LTCG ≤ ₹1.25 lakh**; no business, foreign assets, STCG, or other CG.

## Chapter map (few pages)

| Page | Chapter | What you do on the portal |
|------|---------|---------------------------|
| 1 | Login · 26AS · AIS | Login; download Form 26AS for **AY 2026-27**; download AIS for **FY 2025-26**; match TDS / salary / interest |
| 2 | Start filing ITR-1 | File Now → AY 2026-27 → Online → Start New → Individual → ITR-1 → Let’s Get Started |
| 3 | Personal · Regime · Bank | Personal Information; Nature of Employment (Others for private); Filed u/s **139(1)** or **139(4)**; regime **Yes=Old / No=New**; link bank |
| 4 | Gross total income | B1 Salary, B2 HP, B3 Other sources, C3 Exempt, C3(a) 112A if ≤ ₹1.25L |
| 5 | Deductions · Tax paid | Total Deductions (proof only); Tax Paid vs Form 16 + 26AS |
| 6 | Tax liability · Confirm | Verify liability; check D11; Confirm; Proceed to Verification |
| 7 | Pay / Refund · Preview | Refund path or Pay Later/Now (wait for challan if Pay Now); Preview → Validation |
| 8 | E-verify · Receipt | E-Verify with **Aadhaar OTP**; Download Receipt; paste ack in `/file/done` |

## AY 2026-27 callouts

- Assessment year on portal: **AY 2026-27**.
- Regime question: **Yes = Old**, **No = New** — match LastMinute recommendation.
- New-regime rebate tip (estimate only): up to ₹60,000 when total income within ₹12 lakh (slab tax only) — not a guarantee.
- After Pay Now: challan must appear in Tax Paid before submit.

## Free vs paid

- **Free:** full click path + screenshots.
- **Paid:** exact copy-ready numbers + ITR-1 JSON download (Option A).

## What good looks like

- Salary and TDS match Form 16 / 26AS.
- Deductions only with proof.
- Portal refund/payable close to LastMinute estimate.
- Acknowledgement saved; e-verified within 30 days.

## Stop and escalate

- Foreign assets, NRI, crypto, F&O, unlisted shares, business books → not ITR-1.
- Portal totals differ after re-check → return to mismatch / CA help.
