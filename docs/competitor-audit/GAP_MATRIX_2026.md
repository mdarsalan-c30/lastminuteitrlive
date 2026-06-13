# Gap Matrix 2026 — LastMinute ITR vs Quicko & ClearTax

**Date:** June 2026 · **Product constraint:** Companion-first (no auto-submit, no guaranteed refund, no ERI claims)

| Area | Competitor | LastMinute today | Severity | Decision | Our version | Target files |
|------|------------|------------------|----------|----------|-------------|--------------|
| **Marketing** | Quicko refund widget hero | Regime compare card | P2 | Defer | Estimated tax card only | `app/page.tsx` |
| **Marketing** | Quicko persona carousel | Scenario hooks (4 cards) | P1 | Implement | 5 personas + product UI hints | `hooks.ts`, `IndianUseCases.tsx` |
| **Marketing** | ClearTax 8M / ₹5346 Cr proof | Beta testimonial count | P2 | Skip | "Early access" honesty | `constants.ts` |
| **Marketing** | ClearTax why-us 3-up | Pain points + AI checks | P1 | Implement | Mismatch · Regime · Portal guide | `competitorInspired.ts`, new section |
| **Marketing** | ClearTax zero manual entry | Connector grid | P1 | Implement | Form16+AIS copy; ITD roadmap badge | `QuickStart.tsx`, copy |
| **Onboarding** | ClearTax Form16 before profile | `?source=form16` partial | P0 | Implement | Default `/file` → documents | `app/file/page.tsx`, `marketing.ts` |
| **Onboarding** | Mercury two-phase PAN defer | Signin before import | P1 | Partial | Form16 path skips welcome | existing fast path |
| **Import** | ClearTax multi Form 16 | Single parse | P1 | Implement | "Add another Form 16" | `parsing/page.tsx` |
| **Import** | ClearTax upload anything | Connector grid | P2 | Defer | Form16/AIS/26AS scope OK | — |
| **Reconcile** | Our wedge vs both | Mismatch Center | P0 | Keep | Hero mismatch block | existing |
| **Reconcile** | Quicko nav incomplete badges | Static nav dots | P1 | Implement | Dynamic red/amber/green | `FilingLayout.tsx`, `navStatus.ts` |
| **Regime** | Both compare moment | `/file/regime` | P0 | Keep | Honest estimate disclaimer | existing |
| **Review** | TurboTax filing-ready % | ConfidencePanel | P0 | Implement | Wire to summary rail + checkout | `FilingSummaryRail.tsx` |
| **Review** | ClearTax tax summary viz | Regime page cards | P1 | Keep | Extend rail on import/review | `FilingLayout` |
| **Checkout** | ClearTax pay at File Now | Pay after review | P0 | Keep | Value-before-pay | existing gate |
| **Post-pay** | Quicko e-verify 30-day | everify page | P1 | Implement | Stronger urgency banner | `everify/page.tsx` |
| **Companion** | N/A (differentiator) | Portal guide | P0 | Keep | Copy-ready fields | existing |
| **Content/SEO** | Quicko Learn hub | `/learn` ~25 articles | P1 | Implement | Prep · Reconcile · Portal pillars | `app/learn/page.tsx` |
| **Content/SEO** | Quicko Help KB | None | P0 | Implement | `/help` searchable hub | `app/help/page.tsx` |
| **Content/SEO** | Both tools pages | Quiz on landing only | P1 | Implement | `/tools` | `app/tools/page.tsx` |
| **Content/SEO** | ClearTax FAQ scale | 8 FAQs | P1 | Implement | +12 FAQs + JSON-LD | `faqs.ts` |
| **Content/SEO** | Thin glossary | 38 terms | P2 | Implement | 5 terms thickened | `glossary-extended.ts` |
| **Help/Legal** | Both privacy/security depth | terms/privacy/disclaimer | P2 | Defer | No lawyer rewrite this sprint | — |
| **Nav** | Both Resources menu | Flat nav + More | P1 | Implement | Resources dropdown | `SiteHeader.tsx` |
| **SEO** | Sitemap tools/help | Missing routes | P1 | Implement | Add to sitemap | `sitemap.ts` |

### Screen-level mapping (Phase 1 re-audit, June 2026)

Confirmed from competitor product docs (see `CLEARTAX_FILING_JOURNAL.md` / `QUICKO_FILING_JOURNAL.md`). Each row drives a build phase.

| Competitor screen | LastMinute route | Logic needed | Build phase |
|-------------------|------------------|--------------|-------------|
| CT-S3 pre-fill reveal | documents → `ImportRevealPanel` | Summarize parsed Form 16 + gaps | Phase 2C |
| CT-S4 / QK-S3 multi Form 16 | documents multi-upload | `employers[]` schema + TDS/salary aggregation | Phase 2A |
| CT-S5–S9 four-tab dashboard | `/file/review` tabs | Tabbed IA + deduction checklist + mismatch | Phase 3 |
| CT-S9 / QK-S4 regime compare | review Summary + `/file/regime` | Reuse tax engine inline | Phase 3 |
| QK-S5 tools | `/tools` | Engine-backed estimator, regime, HRA | Phase 4 |
| CT help center / QK learn | `/help/[slug]`, `/learn` | Native articles | Phase 5 |
| CT-S11 / QK-S7 e-verify | companion + everify | Portal hand-off + deadline urgency | Phase 6 |

**Remaining live-OTP audit:** in-app pixel details (exact field labels, validation copy, chart styles) still require a logged-in session with test PAN. Captured the canonical journey from official docs; pixel polish can be refined when an OTP session is run interactively. No blocker for Phases 2-6.

### See also — June 2026 insight pass (qna.tax + landscape)

The qna.tax forum + landscape re-read produced a taxpayer-pain-point synthesis and persona case studies that drive the next UI pass:

- [../research/USER_PAINPOINTS_2026.md](../research/USER_PAINPOINTS_2026.md) — 9 ranked pain points (AIS-vs-Form16-vs-26AS reconciliation is the #1 theme; portal friction validates companion mode).
- [../research/SIMILAR_PLATFORMS.md](../research/SIMILAR_PLATFORMS.md) — what to borrow vs avoid from Quicko/ClearTax/TaxBuddy/etc. and premium UI references.
- [../case-studies/CASE_STUDIES_2026.md](../case-studies/CASE_STUDIES_2026.md) — 8 personas with dummy inputs, backed by typed fixtures in `e2e/fixtures/personas.ts`.

Net-new UI priorities from this pass: (1) `/file/review` reconcile dashboard (AIS vs Form 16 vs 26AS), (2) guided "Path" bar showing distance-to-portal-filing, (3) unified premium navigation.

### Top 10 P0/P1 for this ship

1. Form16-first default routing (P0)
2. `/help` hub (P0)
3. Summary rail + filing-ready % (P0)
4. Learn pillar taxonomy (P1)
5. `/tools` page (P1)
6. FAQ expansion + schema (P1)
7. Nav status dots (P1)
8. Why-us + persona improvements (P1)
9. Multi Form 16 CTA (P1)
10. Resources nav + sitemap (P1)
