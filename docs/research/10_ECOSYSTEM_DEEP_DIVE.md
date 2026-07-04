# 10 — Indian Tax Filing Ecosystem: Deep Dive (Executed Research)

> Phase 1, Deliverable 1. Grounded against live sources as of July 2026 (AY 2026-27 season).
> Sources: incometax.gov.in AY 2026-27 help pages, CBDT Notification No. 45/2026 (30 Mar 2026), Income-tax Act 2025 (in force 1 Apr 2026), ClearTax/TaxGuru/1Finance AY 2026-27 guides.

---

## 1. The legal baseline just changed underneath everyone

This is the single most important ecosystem fact for this AY:

- The **Income-tax Act, 2025** received assent on 21 Aug 2025 and **commenced 1 April 2026**. AY 2026-27 is the first season filed under the new Act.
- Section numbers have moved (e.g., rebate provisions now live in Chapter IX, Sec 216–220; TDS sections re-mapped to new "Section 393 codes").
- Every incumbent (Computax, Winman, ClearTax) is racing to re-map old → new section codes. **Their content and help text is full of stale section references.** A product that speaks the new Act natively, with an old→new section mapping table, has a real trust wedge this season.

## 2. Who files, and how (market structure)

| Channel | Est. share of individual ITRs | Who uses it | Pain |
|---|---|---|---|
| ITD portal directly (self) | ~45–50% | Salaried with simple ITR-1, price-sensitive | Confusing UI, fear of mistakes, no guidance |
| Local CA / tax practitioner | ~30–35% | Business income, capital gains, anyone scared | ₹500–₹5,000 fees, opaque, seasonal queues, WhatsApp-photo document chaos |
| Online platforms (ClearTax, Tax2Win, TaxBuddy, Quicko) | ~10–15% | Urban salaried, investors | Upsell pressure, form dead-ends, "assisted" = human bottleneck |
| Employer/bank tie-ups | ~5% | Large-company employees | One-size-fits-all |

Roughly **8+ crore ITRs** are filed per year; ITR-1 + ITR-4 dominate volume (~70%). The under-served middle: **first-time filers, small-city salaried, gig workers, small landlords, retail equity investors just over the ITR-1 line.**

## 3. Form landscape for AY 2026-27 (what changed)

### ITR-1 (Sahaj) — expanded this year
Eligible: resident (not RNOR) individual, total income ≤ ₹50L, from:
- Salary/pension
- **Up to TWO house properties** (was one — new for AY 2026-27)
- Other sources (interest, family pension)
- **LTCG u/s 112A up to ₹1.25 lakh** (listed equity/equity MF), **only if no capital losses to set off or carry forward** — new for AY 2026-27
- Agricultural income ≤ ₹5,000

Hard exclusions (any one → not ITR-1): director in a company; unlisted equity shares; TDS u/s 194N; ESOP tax deferral; foreign assets/signing authority; treaty relief (90/90A/91); VDA/crypto income; STCG of any amount; LTCG > ₹1.25L; business/professional income; >2 house properties; NRI/RNOR.

**Product implication:** the "am I ITR-1?" decision now has ~14 gates. Filing ITR-1 when ineligible → defective return notice u/s 139(9), 15-day cure window, refund freeze. This is exactly the routing engine we must get right and where competitors silently let users fail.

### ITR-2 / ITR-3 / ITR-4
- ITR-2: capital gains beyond the 112A carve-out, >2 properties, foreign assets, NRI.
- ITR-3: business/professional income (books).
- ITR-4 (Sugam): presumptive 44AD/44ADA/44AE, resident, ≤ ₹50L. Same director/unlisted/foreign exclusions.

### Key dates this season (AY 2026-27)
| Event | Date |
|---|---|
| Online filing opened | 15 May 2026 |
| Due date (non-audit) | **31 July 2026** ← we are 4 weeks out |
| Belated return | 31 Dec 2026 |
| Revised return | 31 Mar 2027 |
| ITR-U window | up to 31 Mar 2031 |
| E-verification | 30 days from submission |

**Product implication:** LastMinuteITR's entire brand ("last minute") peaks in the next 4 weeks and again in December (belated). Seasonal load planning and messaging calendars follow from this table.

## 4. The data rails: AIS / TIS / 26AS / Form 16 / prefill

- **Form 26AS**: TDS/TCS ledger. Authoritative for tax credits.
- **AIS (Annual Information Statement)**: SFT-reported financial footprint — interest, dividends, securities trades, property, foreign remittances. Noisy, has duplicates, values can be at gross/trade level.
- **TIS**: taxpayer-summary derived from AIS; the value the ITD expects you to reconcile against.
- **ITD prefill JSON**: downloadable per PAN, feeds portal + all CA software.
- **Form 16 (Part A + B)**: employer statement; the anchor document for salaried.

The **reconciliation triangle** (Form 16 ↔ AIS/TIS ↔ 26AS ↔ what user claims) is where notices are born and where CAs spend most of their time. Computax/Winman win because they import all three and diff them. Any consumer product that doesn't do the triangle is a toy.

**Ecosystem constraint:** there is **no public API** for AIS/26AS. Access paths are: (a) user downloads PDF/JSON from portal and uploads, (b) ERI (e-Return Intermediary) registration with ITD — the serious, licensed route ClearTax uses, (c) credential-based scraping — compliance risk, do not build. Roadmap: start with (a), pursue ERI registration as company milestone.

## 5. Money mechanics filers actually get wrong

Ranked by notice/defect frequency (synthesized from CA commentary + audit of our own funnel questions):

1. **Regime choice mishandled** — new regime is default; opting out needs Form 10-IEA for business income; salaried can flip year-to-year at filing. Most filers don't compare.
2. **87A rebate misunderstanding** — rebate (max ₹60k, income ≤ ₹12L) applies only to slab-rate income; **not against 112A LTCG**. Marginal relief just above ₹12L is widely miscalculated.
3. **Interest income omitted** — savings/FD interest visible in AIS but not declared → mismatch notice.
4. **Capital gains mis-bucketing** — STCG in ITR-1 (invalid), grandfathering errors, loss carry-forward missed by belated filers (losses can't be carried forward on late returns).
5. **HRA/80C claims without proof** under old regime — post-filing verification wave in recent years.
6. **Wrong ITR form** → 139(9) defective notice → refund stuck.
7. **E-verification missed** (30 days) → return treated as not filed.

Each of these maps 1:1 to a validation in our engine catalog (doc 03) and a "Smart AI CA" intervention (doc 05).

## 6. Regulatory surface for the product itself

- **ERI licensing** — required to file on behalf of users programmatically. Until then we are a *preparation + guidance* tool that produces the portal-ready JSON and walks the user through the portal. Must be stated honestly (this was P0 bug territory before; keep it fixed).
- **DPDP Act 2023** — PAN, Aadhaar-linked data, income data are personal data at maximum sensitivity. Consent records, purpose limitation, deletion rights are table stakes; a "delete my data" button is both compliance and a trust feature.
- **No tax advice licensure barrier** for software-generated computation, but *representation* before ITD requires authorized representatives (CA/advocate). Smart AI CA must self-describe as computation + explanation, and escalate representation matters to human CAs.

## 7. Ecosystem conclusion → what the product must be

1. **A routing engine first.** The ITR-1 boundary is now intricate enough (112A carve-out, 2-property rule) that correct form selection is itself a headline feature.
2. **A reconciliation engine second.** Form 16 ↔ AIS ↔ 26AS diffing is the CA-displacing capability.
3. **New-Act-native content.** Speak Income-tax Act 2025 sections with an old→new map; incumbents are mid-migration and sloppy.
4. **Honest about the ERI gap.** Prepare + validate + portal-walkthrough now; ERI filing later.
5. **Season-shaped.** July peak, December belated wave, March revised wave — product, pricing and marketing calendars all key off this.
