# 12 — Taxpayer Insights (1,000-Filer Simulation)

> Phase 1, Deliverable 3. Method: segment-weighted persona simulation calibrated to ITD filing-mix data (ITR-1/4 ≈ 70% of volume), platform funnel analytics from our own deployed audit, and public taxpayer complaint themes. Composite personas; validate with 15 real user interviews + funnel instrumentation before locking UX (Phase 4).

## Segment map (weights ≈ share of addressable filers)

| # | Segment | Weight | Archetype |
|---|---|---|---|
| S1 | First-time salaried filer | 22% | 23-yr-old, first job, employer says "file your ITR", terrified |
| S2 | Repeat salaried, simple | 28% | Files ITR-1 yearly, wants 15 minutes and out |
| S3 | Salaried + equity investor | 16% | Zerodha/Groww user; STCG/LTCG confusion; ITR-1→ITR-2 boundary victim |
| S4 | Gig/freelancer | 10% | 44ADA presumptive candidate, doesn't know it; TDS u/s 194J scattered |
| S5 | Small landlord / two properties | 7% | New 2-property ITR-1 rule beneficiary; rent + salary |
| S6 | Senior citizen / pensioner | 8% | Pension + FD interest; child files on their behalf |
| S7 | Refund-chaser (belated/notice) | 5% | Missed deadline or got 139(9)/143(1) notice; panicking |
| S8 | NRI/RNOR & crypto | 4% | We currently BLOCK these (correct); route to CA |

## The five universal emotional truths

1. **Fear beats price.** "Will I get a notice?" outranks "is it ₹199 or ₹499?" in every segment. The product's core promise must be *safety* ("we checked everything, here's proof"), not speed.
2. **Nobody knows what regime they're in.** S1–S6 all assume someone chose for them. A visible regime comparison with a one-line verdict ("New regime saves you ₹18,400") is the single most shareable output.
3. **The refund IS the product.** Filers experience the refund as the outcome. Refund estimate early, refund tracking after — both drive retention and referral.
4. **They don't want to learn tax.** Explanations must be *just-in-time and dismissible*, never a course. "Why are you asking this?" links, one sentence, plain Hindi-English.
5. **Trust is transferred, not earned.** S1 asks a friend/parent; S6 relies on children. Referral mechanics and a "file for a family member" mode mirror real behavior.

## Segment cards (top pains → product answers)

### S1 First-timer (22%)
- Pain: doesn't know what Form 16 is; fears doing it wrong; abandons at first jargon.
- Moment of delight: "You owe ₹0. You'll get ₹3,240 back."
- Must-have: Form 16 upload → prefilled everything → plain-language confirmation. Zero-tax celebration screen.
- Kills conversion: asking for AIS/26AS before showing any value.

### S2 Repeat simple (28%)
- Pain: re-entering the same data yearly; forgets portal password.
- Must-have: last-year import + "what changed since last year" diff. 10-minute path.
- Monetization: lowest willingness (₹0–299); volume + referral engine, upsell only on life events (new job, first stock sale).

### S3 Salaried + equity (16%) — **the money segment**
- Pain: broker P&L ↔ AIS mismatch; doesn't know if ₹1.25L 112A carve-out keeps them in ITR-1; grandfathering; loss carry-forward.
- Must-have: broker statement upload (Zerodha/Groww/Upstox CSV) → auto capital-gains schedule → automatic ITR-1 vs ITR-2 routing with explanation.
- Willingness: ₹499–1,499. This is where "AI Smart" plan earns its price.
- Danger: get this wrong → invalid return → brand-destroying. Golden scenarios must over-index here.

### S4 Gig/freelancer (10%)
- Pain: has 6 TDS entries u/s 194J across clients, no books; doesn't know presumptive taxation exists.
- Delight: "Under 44ADA you declare 50% and your tax drops to ₹X — legally."
- Must-have: 26AS-driven income discovery + presumptive calculator + ITR-4 routing.

### S5 Two-property (7%)
- New ITR-1 eligibility this AY is a fresh SEO/acquisition hook: "Own 2 houses? You can now file the simple form."
- Must-have: rent/interest-on-loan wizard per property; 24(b) handling per regime.

### S6 Senior/pensioner (8%)
- Filed *by proxy* — design for the adult child operating it. Large text mode, "filing for my parent" flow, dual-language summaries.
- Interest income reconciliation with AIS is the notice-avoider here.

### S7 Refund-chaser / notice (5%)
- Highest urgency + willingness (₹999–2,999). Lands from Google search "139(9) notice what to do".
- Must-have: notice decoder (upload notice PDF → plain-language meaning → next steps), belated/revised return support with loss carry-forward warnings.
- This is also the best content/SEO wedge (see doc 06).

### S8 NRI/crypto (4%)
- Keep the current hard block + honest routing to CA/portal. Capture email for "we'll support this next season" — a free demand-sizing instrument.

## Funnel truths from our own deployed audit (P0 work)

- The pre-fix product lost trust exactly where mock data appeared (AIS "parsed" with fake numbers). Post-fix honesty ("coming soon") must be preserved forever: **never show a number we didn't compute from evidence.**
- Pricing confusion (multiple plan vocabularies) directly created checkout abandonment. One plan catalog, one vocabulary — now fixed; UX must keep price visible from the first screen.
- The eligibility quiz is the real front door; more users touch it than the homepage CTA. Invest in the quiz as a product, not a lead form.

## North-star metric definitions (proposed)

- **Safe-filing rate**: % of started filings that reach a validated, portal-ready JSON with zero unresolved warnings.
- **Time-to-refund-estimate**: median seconds from first upload to seeing a refund number (target < 90s).
- **Reconcile coverage**: % of filings where AIS/26AS were actually diffed vs skipped.
- **Notice rate** (lagging, the ultimate one): notices per 1,000 filings vs national base rate.
