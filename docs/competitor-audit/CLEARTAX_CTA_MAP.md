# ClearTax CTA Map — June 2026 audit

**Sources:** Live fetch + browser snapshot of [cleartax.in](https://cleartax.in/), uploaded snapshot `cleartax.in-1.md`.

**Limitation:** Filing app (`my.cleartax.in`) blocked in browser (DNS/SSL error). Deep funnel documented from marketing + known product patterns in `docs/COMPETITOR_ANALYSIS.md`.

---

## Primary navigation

| Label | Destinations |
|-------|--------------|
| Products | GST, MaxITC, e-Invoicing, TDS, **Self ITR Filing**, **Expert Assisted Filing**, product suites |
| Resources | Case Studies, Blog, Webinars, FAQs, Help Center |
| Company | Support, About, Careers, Media, Trust and Safety |
| Start Filing | Consumer filing entry (hero + nav) |

---

## Hero CTAs

| CTA | Copy hook | Target |
|-----|-----------|--------|
| Start Filing for Free | File in 3 simple steps | Filing app |
| Hire an Expert | ITR filed in 24hrs | Expert product |
| File now | Sticky mobile CTA | Filing app |
| See reviews | Social proof (4.6★, 8M+ users) | Reviews |

**Claims observed (do not copy):** "100% Accuracy", "Maximum Tax Refund, Guaranteed", "₹5346 Cr+ Lifetime ITR Refund Delivered".

---

## Persona cards

| Persona | CTA | Hook |
|---------|-----|------|
| Salaried Professionals | Start Filing | Simple accurate filing |
| Investors & Traders | Start Filing | 80+ broker 1-click import |
| Freelancers & Other Professionals | Start Filing | Fees, TDS, advance tax |
| NRIs & UHNIs | Hire an expert | Complex structures |

---

## Why choose us (3-up)

| Pillar | ClearTax claim | Our honest equivalent |
|--------|------------------|----------------------|
| Maximum Tax Refund | Deduction identification | Lawful optimization + regime compare |
| 24x7 Support | Chat/phone/email | Support chat + learn/help |
| 100% Accuracy | Error detection tech | Mismatch checks + filing-ready % |

---

## Product feature strip

- Zero manual entry (Form 16 + AIS + 26AS)
- 80+ broker import
- Auto ITR form + regime selection
- Interactive tax summary visualization
- Loss set-off automation

---

## Resources tab

| Section | Content types |
|---------|---------------|
| READ | Case studies, opinion, product guides, newsroom, blog |
| WATCH | Webinars, product guide videos |
| ENGAGE | Events, FAQs, Help Center |

---

## Footer SEO / tools cluster (massive)

Income tax calculators, HSN finder, mutual fund links, gold rates, refund status — primary SEO moat.

Legal: Privacy Policy, Terms of use, Trust & Safety, ISO/SSL badges.

---

## Filing funnel (inferred + prior research)

1. Login / mobile OTP
2. PAN link + ITD OTP → "95% pre-filled"
3. Form 16 upload (primary) or continue without
4. Tabbed review (Personal · Income · Deductions · Taxes)
5. Tax summary with refund/payable hero
6. Pay at "File Now"
7. E-file + e-verify (30-day copy)

**OTP wall:** Reached at login/PAN — no test PAN used in this audit run.

---

## LastMinute mapping

| ClearTax pattern | Our implementation |
|------------------|-------------------|
| Form 16 first | `/file/import/documents?source=form16` default |
| Refund sticky rail | `FilingSummaryRail` |
| Persona grid | `IndianUseCases` + scenario hooks |
| FAQ at scale | `LANDING_FAQS` expansion |
| Help center | `/help` hub |
| Tools SEO | `/tools` (ITR quiz + deadline) |
