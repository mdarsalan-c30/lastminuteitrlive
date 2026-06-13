# Manual test matrix (34 scenarios)

Use this checklist before promoting a build to production. Check each box after verifying on a **staging/preview** deployment with realistic data.

**Legend:** ✅ pass · ⚠️ known limitation · ❌ blocker

---

## Core filing paths

- [ ] **1. Salaried only (ITR-1)** — Form 16 fast path → eligibility (salary only) → regime compare → checkout → companion shows ITR-1 steps with salary values.
- [ ] **2. Old regime selected** — Deductions (80C, 80D) applied in compute; old regime card shows lower tax when deductions are high; companion skips new-regime-only hints appropriately.
- [ ] **3. New regime selected** — Chapter VI-A deductions not counted in tax; regime page recommends new when deductions are low; companion reflects new regime overlay.
- [ ] **4. Deductions screen** — Enter 80C/80D/NPS; recompute updates regime cards; why-we-ask copy visible; no crash on zero amounts.

## Income complexity & escalation

- [ ] **5. FD interest only (no salary)** — Income chips route to correct form recommendation; regime compute runs without salary connector.
- [ ] **6. Business / freelance chip** — Eligibility recommends ITR-4; complex-case banner appears where designed; escalation CTA does not block self-file path.
- [ ] **7. Complex income escalation** — Director / foreign / high-income signals show CA escalation copy (`COMPLEX_CASE_ESCALATION_*`); user can still continue self-file if eligible.
- [ ] **8. House property (let-out)** — House property inputs flow to compute; companion includes relevant house-property steps when applicable.

## Import & reconciliation

- [ ] **9. Form 16 upload (demo parser)** — Parsing screen shows extracted/demo fields; user can continue to mismatch or regime.
- [ ] **10. Import documents — estimates path** — Rough salary entry → regime compare without upload; no paywall before value shown.
- [ ] **11. Salary mismatch unresolved** — Checkout/plans blocks with mismatch guard; CTA routes to `/file/import/mismatch`.
- [ ] **12. Mismatch resolved / proceed** — User can proceed with explanation; checkout unlocks when other gates pass.

## Engine & AI fallbacks

- [ ] **13. Engine unavailable** — Regime/review shows `EngineComputeFallback`; user can continue with last snapshot where allowed; no infinite spinner.
- [ ] **14. AI not configured** — `/api/ai/questions` and `/api/ai/explain` return rule-based fallback (`fallback: true`); UI still shows helpful copy.
- [ ] **15. Portal guide API** — GET `/api/portal-guide/ITR-1` returns steps; POST without session returns 402; POST with verified session returns personalized steps.

## Payments & companion access

- [ ] **16. Companion locked (no payment)** — Visiting `/file/companion` redirects to plans with `reason=companion`; export/copy actions disabled.
- [ ] **17. Mock payment unlock (non-prod)** — `order_mock_*` verify sets session cookie; companion loads walkthrough with unlocked banner (`?unlocked=1`).
- [ ] **18. Production Razorpay path** — With keys configured, real order + signature verify succeeds; mock orders rejected in production without keys.

## Competitor-parity (June 2026 audit)

- [ ] **19. Form16-first routing** — `/file` redirects to `/file/import/documents?source=form16`; hero primary CTA is Upload Form 16.
- [ ] **20. Summary rail** — On import/regime/review, sticky bar shows est. refund/payable + filing-ready % with honest disclaimer.
- [ ] **21. Nav status dots** — Income rail shows green/amber/grey from draft state (salary, house, deductions, regime).
- [ ] **22. Help & tools hubs** — `/help` search + pillar filters work; `/tools` ITR quiz + deadline calendar link to `/file`.
- [ ] **23. Resources nav** — Header Resources dropdown links Learn, Help, Tools, Glossary, Blogs; sitemap includes `/help` and `/tools`.

## Reconcile dashboard (Phase 3 — `/file/review`)

- [ ] **24. Tabbed review hub** — `/file/review` loads with Import / Income / Deductions / Taxes / Summary tabs; `?tab=` deep-links restore the correct tab; invalid tab falls back to Import; tab status dots reflect draft state (complete/partial/missing).
- [ ] **25. Deduction checklist** — Deductions tab labels each item `claimed` / `needs-proof` / `not-applicable` factually (Standard Deduction, 80C, 80D, 80GG, home-loan interest); new-regime drafts mark Chapter VI-A items not-applicable; no advisory language.
- [ ] **26. AIS-vs-Form16 flags** — Import tab shows reconciliation flags (ok/info/warning): missing-AIS info when only Form 16 connected, TDS-delta warning when Form 16 and AIS TDS differ, multi-employer note when >1 employer; resolving mismatch clears the open warning.
- [ ] **27. Inline regime compare** — Summary tab computes old vs new via the live tax engine; shows the cheaper regime + delta and current selection; estimate disclaimer present (no "guaranteed"); "Review regime choice" links to `/file/regime`.
- [ ] **28. Review states** — Each tab renders empty state (no documents/income), engine loading spinner, and `EngineComputeFallback` on engine error; sticky `FilingSummaryRail` shows refund/payable + progress on `/file/review`.

## Tools (Phase 4 — `/tools`)

- [ ] **29. Income tax estimator** — Estimator computes old vs new via the live engine without payment; shows cheaper regime + tax for each; "Save figures to draft" writes only optional fields; results match engine fixtures within rounding.
- [ ] **30. HRA calculator** — `lib/calculators/hra.ts` returns exemption = least of three limbs; metro vs non-metro factor applied; UI shows binding limb; "Save rent details to draft" persists to income.

## Content (Phase 5 — `/help/[slug]`, `/learn/[slug]`)

- [ ] **31. Native help articles** — `/help` cards for native articles link to `/help/<slug>`; each native help page renders problem → steps on incometax.gov.in → how LastMinute assists, with `BlogCTA` and in-pillar related links; deep-link cards (ITR quiz, companion) still jump to `/tools#itr-quiz` and `/file/companion`.
- [ ] **32. New learn articles + cross-links** — The 10 Phase-5 learn slugs (80D, 80GG, 24(b), NPS 80CCD, LTA, professional tax, family pension, 15G/15H, AIS feedback, TDS-not-in-26AS) render with `BlogCTA`, working internal `/learn` links, and resolving `/glossary/<slug>` links; sitemap includes `/help/<slug>` and `/learn/<slug>` entries.

## Companion depth (Phase 6 — `/file/companion`)

- [ ] **33. Section roadmap + ITD order** — Companion shows a navigable section roadmap mirroring the ITD ITR-1 flow (Personal → Income → Deductions → Taxes paid → Tax liability → Verify); the chip for the current screen's section is highlighted; clicking a roadmap chip jumps to the first screen of that section; each screen checklist lists "What to paste" (enter fields) and "What to verify" separately.
- [ ] **34. Deep-link from Summary tab** — On `/file/review` Summary tab, the "Jump to a portal section" chips link to `/file/companion?section=<id>`; opening that URL starts the wizard on the first screen of the matching ITD section; an unknown/empty `?section=` falls back to the first screen without error.

---

## Sign-off

| Role | Name | Date | Build / commit |
|------|------|------|----------------|
| QA | | | |
| Product | | | |
| Engineering | | | |

**Notes / defects:**

```
(add blockers here)
```
