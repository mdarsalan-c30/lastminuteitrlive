# UI Audit — LastMinute ITR (CEO Product Audit)

**Agent:** 6 — CEO Product Audit  
**Date:** June 2026  
**Method:** Code review of all `app/**/page.tsx` routes, live browse at `localhost:3000`, cross-read of `docs/UX_IMPROVEMENT_PLAN.md` and `docs/DESIGN_SYSTEM.md`  
**Scope:** Marketing, filing flow, companion, checkout — plus API routes as user-visible surfaces (errors, loading, mock data)

**Scoring rubric (1–10):**

| Dimension | 10 = | 4 = | 1 = |
|-----------|------|-----|-----|
| **UX** | Obvious next step, minimal cognitive load, mobile-safe | Workable but confusing branches | Dead ends, jargon-first, broken flows |
| **UI** | Premium fintech polish, unified system, intentional hierarchy | Functional shadcn starter | Amateur / template / inconsistent |
| **Trust** | Verifiable claims, honest state, security visible | Generic disclaimers | Misleading badges, fake completion |
| **Conversion** | Clear value before ask, one primary CTA, low friction to pay/companion | CTA present but weak | Paywall before value, high drop-off |

---

## Executive summary

LastMinute ITR has **strong product bones** (regime engine, mismatch center, portal companion, PlainEnglish fields) but still reads as a **prototype stitched from two design systems** (marketing shadcn vs filing slate/blue). The landing has improved (hero regime slider, dark QuickStart mock) yet **trust and conversion lag ClearTax/Quicko** because social proof is thin, onboarding is long before import, and several screens show **“Phase 2” / mock completion** that erodes credibility.

**Biggest drop-off risks:** (1) five onboarding screens before Form 16 upload, (2) fake sign-in/OTP, (3) pay/checkout screens simulating submission without real ERI, (4) companion paywall not wired to payment success.

---

## Funnel score summary

| Stage | Pages | UX | UI | Trust | Conversion |
|-------|-------|----|----|-------|------------|
| **Acquire** | `/`, `/learn`, `/learn/*`, `/glossary`, `/glossary/*`, `/reviews` | **6.1** | **6.2** | **5.8** | **4.2** |
| **Activate** | `/file`, onboarding ×4, `/file/import/documents` | **4.5** | **5.2** | **5.5** | **4.5** |
| **File** | Import (4), income workspace (6), `/file/cabrain`, `/file/review/risk` | **5.8** | **5.3** | **5.9** | **5.4** |
| **Pay** | `/file/review/presubmit`, checkout ×4 | **5.0** | **5.0** | **5.2** | **5.0** |
| **Companion** | `/file/companion`, `/file/support` | **6.0** | **5.5** | **5.0** | **5.0** |

**Cross-funnel averages:** UX **5.7** · UI **5.6** · Trust **5.6** · Conversion **4.9**

---

## Acquire — Marketing & education

### `/` — Landing

| Dimension | Score | Notes |
|-----------|-------|-------|
| UX | 6.5 | Clear hero + name CTA; regime slider in hero helps. Missing primary “Upload Form 16” path. |
| UI | 7.0 | Asymmetric hero, dark product band, dashboard mock — above prior “college site” baseline. Still Inter-heavy; mesh gradient softens premium feel. |
| Trust | 5.0 | Single-line TrustRow (no counts, badges, logos). Carousel reviews feel seeded. |
| Conversion | 6.0 | Name → signin works; pricing CTAs exist but compete with hero CTA. |

1. **Amateur:** Trust row is one muted sentence; reviews carousel shows one quote at a time; no “used by X filers” or security row.
2. **Confusion:** “AI personal CA” vs “no auto-submit” — users may expect full filing. Dual regime numbers in hero vs QuickStart mock (₹18,420 refund) without explaining they're demos.
3. **Drop-off:** Users who want Form 16 first must still name → signin → profile → matrix → path → documents (6+ screens).
4. **Friction:** No mobile nav menu (Learn/Glossary hidden on small screens). Pricing section uses text links on some breakpoints — acceptable but not urgent.
5. **Visual:** Hero mesh + gradient headline reads “startup template”; connector cards on landing lack institution marks.
6. **Missing:** Form 16 primary CTA, filer count, DPDP/encryption badge strip, static review grid, deadline urgency counter, companion screenshot in hero.

---

### `/learn` — Article index

| Dimension | Score |
|-----------|-------|
| UX 6 · UI 6 · Trust 6 · Conversion 4 |

1. **Amateur:** Plain card list — blog template, not fintech content hub.
2. **Confusion:** No categorization (deadline / regime / mismatch / forms).
3. **Drop-off:** No inline CTA to start filing or upload Form 16 per article theme.
4. **Friction:** Only 4 articles — feels sparse for SEO/trust.
5. **Visual:** Identical card pattern to glossary; weak differentiation.
6. **Missing:** Featured article, author/trust byline, related product CTAs, read progress on index.

---

### `/learn/[slug]` — Article detail (4 articles)

| Dimension | Score |
|-----------|-------|
| UX 6 · UI 6 · Trust 6 · Conversion 4 |

1. **Amateur:** Minimal markdown renderer — tables/lists OK but no pull quotes, callouts, or step components.
2. **Confusion:** Articles reference product features (mismatch, companion) without deep links into app.
3. **Drop-off:** End of article has no “Apply this to my return” CTA.
4. **Friction:** No sidebar TOC on long articles (regime article).
5. **Visual:** Wall of muted paragraphs; no diagrams for regime slabs.
6. **Missing:** CTA block, glossary term links, “Check my AIS” entry.

---

### `/glossary` — Term index

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 6 · Trust 7 · Conversion 3 |

1. **Amateur:** **Disabled search** with “coming soon” — looks unfinished.
2. **Confusion:** 2-column grid on desktop OK; no A–Z jump on mobile.
3. **Drop-off:** Power users can't find terms quickly.
4. **Friction:** Search disabled is actively frustrating.
5. **Visual:** Clean but generic.
6. **Missing:** Working client-side search, link from filing PlainEnglish fields (bidirectional).

---

### `/glossary/[term]` — Term detail

| Dimension | Score |
|-----------|-------|
| UX 6 · UI 6 · Trust 7 · Conversion 3 |

1. **Amateur:** Single paragraph — no “where this appears in ITR” or portal screenshot.
2. **Confusion:** Technical ID badge (`entry.id`) exposed to users — feels internal.
3. **Drop-off:** Educational only; no return path to filing.
4. **Friction:** None severe.
5. **Visual:** Fine for MVP glossary.
6. **Missing:** Related terms, form section mapping, example values.

---

### `/reviews` — Social proof + feedback

| Dimension | Score |
|-----------|-------|
| UX 7 · UI 6 · Trust 5 · Conversion 5 |

1. **Amateur:** Testimonials lack photos, company logos, verifiable identifiers — reads seeded.
2. **Confusion:** Same quotes as landing carousel — redundant.
3. **Drop-off:** Feedback form succeeds silently — no incentive to complete.
4. **Friction:** Low.
5. **Visual:** Grid is better than carousel; still generic cards.
6. **Missing:** Aggregate rating, review count, plan breakdown chart, video testimonial, trust badges.

---

## Activate — Entry & onboarding

### `/file` — Welcome

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 5 · Trust 6 · Conversion 5 |

1. **Amateur:** Extra screen after landing; `hero-mesh` on filing shell feels marketing-copied.
2. **Confusion:** “Government portal companion” button on welcome bypasses entire flow — power users OK, novices lost.
3. **Drop-off:** Users with `?name=` auto-redirect to signin — welcome never seen (good) but inconsistent.
4. **Friction:** Two full-width buttons equal weight — should be one primary.
5. **Visual:** **Double chrome:** `app/file/layout.tsx` header + no FilingLayout stepper — orphan layout.
6. **Missing:** Skip to import, progress estimate, document checklist preview.

---

### `/file/onboarding/signin`

| Dimension | Score |
|-----------|-------|
| UX 4 · UI 6 · Trust 4 · Conversion 4 |

1. **Amateur:** PAN/OTP fields **not bound to store** — cosmetic form.
2. **Confusion:** “Aadhaar linked” green badge with no verification step.
3. **Drop-off:** Tax users expect real ITD login — fake OTP destroys trust immediately.
4. **Friction:** Consent checkbox blocks Continue — good — but no link to privacy policy.
5. **Visual:** PlainEnglish fields are strong; otherwise standard.
6. **Missing:** Defer auth until pay/export, privacy policy link, “why we need PAN” explainer.

---

### `/file/onboarding/profile`

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 5 · Trust 6 · Conversion 4 |

1. **Amateur:** Assessment year dropdown with **single option** — pointless control.
2. **Confusion:** Age collected here AND again in case-matrix (different band labels).
3. **Drop-off:** Screen 2 of 5 before any value demonstration.
4. **Friction:** RNOR option without explanation.
5. **Visual:** No FilingLayout mirror on this screen.
6. **Missing:** Infer age from Form 16 later; merge with eligibility screen.

---

### `/file/onboarding/case-matrix`

| Dimension | Score |
|-----------|-------|
| UX 3 · UI 5 · Trust 5 · Conversion 3 |

1. **Amateur:** “Band 1–5”, “Case ID”, matrix coordinates — **internal jargon exposed**.
2. **Confusion:** Income band vs business type vs income chips — three overlapping concepts.
3. **Drop-off:** Highest activate-stage abandonment risk for salaried ITR-1 users.
4. **Friction:** Three dropdowns + 8 chips before upload.
5. **Visual:** Dense admin UI, not TurboTax interview.
6. **Missing:** Salaried default path, “I'm only salaried” shortcut, infer from Form 16.

---

### `/file/onboarding/itr-path`

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 6 · Trust 7 · Conversion 5 |

1. **Amateur:** Case ID in UI (`Case ID: {caseId}`) — debug info.
2. **Confusion:** Checkbox “I understand — use ITR-X” — legal tone scares users.
3. **Drop-off:** Expert/BLOCK paths add decision fatigue.
4. **Friction:** Must confirm checkbox before continue — good for trust, bad for speed.
5. **Visual:** Recommended card pattern is clear.
6. **Missing:** Merge with case-matrix; plainer copy; skip for ITR-1 salaried default.

---

### `/file/import/documents`

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 4 · Trust 5 · Conversion 6 |

1. **Amateur:** **Double header** (file layout + FilingLayout). Teal upload buttons in ConnectorGrid clash with brand blue. Seven connectors with four “Phase 2” — wall of partial features.
2. **Confusion:** Mode cards (Form 16 / ITD / Manual) duplicate ConnectorGrid purpose.
3. **Drop-off:** Overwhelming grid before first upload success.
4. **Friction:** Continue works without uploading — undermines import-first message.
5. **Visual:** No bank/broker logos; utilitarian grid.
6. **Missing:** Collapsed “advanced connectors”, upload progress, checklist with required vs optional, single primary upload zone.

---

## File — Import, workspace, review

### `/file/import/parsing`

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 5 · Trust 5 · Conversion 5 |

1. **Amateur:** Hardcoded “18 fields / 3 fields” copy; Edit inline button does nothing visible.
2. **Confusion:** Two warning banners stacked — alarm fatigue.
3. **Drop-off:** Re-upload loops to self (`href="/file/import/parsing"`).
4. **Friction:** No field-level diff UI.
5. **Visual:** Plain text summary, not a review table.
6. **Missing:** Confidence scores per field, inline edit, side-by-side Form 16 excerpt.

---

### `/file/import/bank`

| Dimension | Score |
|-----------|-------|
| UX 6 · UI 5 · Trust 6 · Conversion 5 |

1. **Amateur:** Pre-filled fake account `XXXX1234` — looks like real data.
2. **Confusion:** “Pre-filled from PAN” without upload path shown.
3. **Drop-off:** Low — short screen.
4. **Friction:** Fields read-only appearance — unclear if editable.
5. **Visual:** Standard PlainEnglish — OK.
6. **Missing:** IFSC lookup validation UI, refund timeline note.

---

### `/file/import/mismatch`

| Dimension | Score |
|-----------|-------|
| UX 7 · UI 6 · Trust 6 · Conversion 6 |

1. **Amateur:** Good concept; layout is list of colored boxes not a “command center”.
2. **Confusion:** Summary counts don't update live from store in all cases.
3. **Drop-off:** Blocked continue is correct — may frustrate without guidance.
4. **Friction:** Three buttons per row (Fix / Proof / Guide) — choice overload.
5. **Visual:** Should be hero differentiator — needs stronger visual hierarchy (ClearTax-style).
6. **Missing:** Filing-ready %, portal impact preview, AIS feedback wizard embed.

---

### `/file/import/mismatch/[id]`

| Dimension | Score |
|-----------|-------|
| UX 6 · UI 5 · Trust 6 · Conversion 5 |

1. **Amateur:** `rule_id: MISMATCH_SALARY_001` — developer leak.
2. **Confusion:** “Mark resolved with proof” doesn't require proof upload.
3. **Drop-off:** Low if user committed to fix.
4. **Friction:** One-click resolve undermines mismatch seriousness.
5. **Visual:** Adequate.
6. **Missing:** Proof upload, source picker (Form 16 vs AIS), audit log entry.

---

### `/file/import/tds`

| Dimension | Score |
|-----------|-------|
| UX 6 · UI 5 · Trust 6 · Conversion 6 |

1. **Amateur:** `tdsMismatch` hardcoded `false` — mismatch path never shown in demo.
2. **Confusion:** Jumps to `/file/income` skipping mismatch gate order.
3. **Drop-off:** Low.
4. **Friction:** Raw number inputs without ₹ formatting.
5. **Visual:** Success banner good when match.
6. **Missing:** 26AS import requirement, employer action CTA when mismatch.

---

### `/file/income`

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 5 · Trust 5 · Conversion 5 |

1. **Amateur:** Thin — one employer card; “Add another Form 16” inert.
2. **Confusion:** Nav rail shows completion dots **hardcoded** in FilingLayout — misleading.
3. **Drop-off:** Users may think they're done after one card.
4. **Friction:** House property next for salaried path — should be skippable.
5. **Visual:** Engine progress bar helps; content sparse.
6. **Missing:** Section completeness from draft state, multi-employer flow.

---

### `/file/house-property`

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 5 · Trust 6 · Conversion 4 |

1. **Amateur:** Modal for HRA is basic; Schedule HP label still intimidating.
2. **Confusion:** Shown in default path for salaried users who don't need it.
3. **Drop-off:** Unnecessary screen for ITR-1 happy path.
4. **Friction:** Manual number inputs.
5. **Visual:** Mirror drawer helps on xl only.
6. **Missing:** “I don't own property” skip, smart default hidden.

---

### `/file/other`

| Dimension | Score |
|-----------|-------|
| UX 6 · UI 5 · Trust 5 · Conversion 5 |

1. **Amateur:** FD interest field formatting hack (`formatINR` in value).
2. **Confusion:** Linked from mismatch warning — good; sparse otherwise.
3. **Drop-off:** Low.
4. **Friction:** Low.
5. **Visual:** OK.
6. **Missing:** AIS-suggested values with accept/reject.

---

### `/file/deductions`

| Dimension | Score |
|-----------|-------|
| UX 6 · UI 5 · Trust 7 · Conversion 6 |

1. **Amateur:** “Invented expense pattern” row — clever demo but alarming label.
2. **Confusion:** L1/L2/RAG badges need glossary.
3. **Drop-off:** Proof upload buttons inert.
4. **Friction:** Many rows for simple salaried case.
5. **Visual:** Risk badges good semantic color.
6. **Missing:** Collapse standard 80C when fully from Form 16; proof upload flow.

---

### `/file/regime`

| Dimension | Score |
|-----------|-------|
| UX 7 · UI 7 · Trust 7 · Conversion 7 |

1. **Amateur:** “Running Python L1 engine” in subtitle — technical.
2. **Confusion:** Continue routes to `/file/cabrain` not review — unexpected order.
3. **Drop-off:** Low — strong value moment.
4. **Friction:** Engine load state needs skeleton (has loading copy).
5. **Visual:** **Best filing screen** — regime cards, count-up, clear winner.
6. **Missing:** Slider recap from landing salary; export/share comparison.

---

### `/file/cabrain`

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 5 · Trust 5 · Conversion 4 |

1. **Amateur:** Single NPS question — thin RAG demo; “Layer 2 · RAG” badge scary.
2. **Confusion:** Inserted between regime and review — breaks mental model.
3. **Drop-off:** Skip exists — good.
4. **Friction:** Profession picker for salaried already known.
5. **Visual:** Mode cards recycled.
6. **Missing:** Real RAG streaming, deduction suggestions with citations.

---

### `/file/review/risk`

| Dimension | Score |
|-----------|-------|
| UX 6 · UI 6 · Trust 7 · Conversion 7 |

1. **Amateur:** Fixed 92%/72% scores — not always tied to engine.
2. **Confusion:** “Expected refund ₹17,000” hardcoded — may disagree with regime screen.
3. **Drop-off:** Low — good pre-pay value.
4. **Friction:** PDF download button inert.
5. **Visual:** Confidence bar is effective.
6. **Missing:** Live engine binding, proof checklist PDF, share with CA.

---

## Pay — Checkout & post-submit

### `/file/review/presubmit`

| Dimension | Score |
|-----------|-------|
| UX 6 · UI 5 · Trust 7 · Conversion 6 |

1. **Amateur:** Checklist uses ✓/○ text — not icon system from design spec.
2. **Confusion:** “Open filing guide” before pay — companion should be post-pay unlock.
3. **Drop-off:** `allGreen` gate good; bankValidated may never flip in demo.
4. **Friction:** E-verify selection duplicated later in checkout.
5. **Visual:** Functional list.
6. **Missing:** Filing-ready ring chart, paywall clarity on what unlocks.

---

### `/file/checkout/plans`

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 5 · Trust 5 · Conversion 4 |

1. **Amateur:** Bullet lists with `·` not checkmarks; differs from landing pricing.
2. **Confusion:** Can reach from landing `?plan=` **before** review — violates pay-after-value.
3. **Drop-off:** Plan comparison without feature matrix.
4. **Friction:** No “recommended for your case” highlight from engine.
5. **Visual:** Plain bordered buttons — OK.
6. **Missing:** Engine-driven plan recommendation, companion unlock callout, money-back/trust line.

---

### `/file/checkout/payment`

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 5 · Trust 6 · Conversion 6 |

1. **Amateur:** Razorpay button styled with raw Tailwind — inconsistent with filing Button.
2. **Confusion:** Refund ₹17,000 repeated — may not match user draft.
3. **Drop-off:** Payment failure handling exists (`onError`) — good.
4. **Friction:** Phase 2 ERI note — honest but reduces completion confidence.
5. **Visual:** Banners stack heavily.
6. **Missing:** Order summary line items, invoice preview, UPI trust marks.

---

### `/file/checkout/everify`

| Dimension | Score |
|-----------|-------|
| UX 4 · UI 5 · Trust 4 · Conversion 5 |

1. **Amateur:** **“Your return is submitted”** — misleading in MVP (no ERI submit).
2. **Confusion:** Tracker shows Submit done — user thinks filing complete on gov portal.
3. **Drop-off:** Trust break if user discovers nothing was filed.
4. **Friction:** Duplicate e-verify method vs presubmit.
5. **Visual:** TrackerSteps component OK.
6. **Missing:** Honest copy: “Payment complete — use companion to file on portal”; no fake submit state.

---

### `/file/checkout/tracker`

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 5 · Trust 4 · Conversion 4 |

1. **Amateur:** Fake ACK `ACK1234567890`, TXN ids — demo data presented as real.
2. **Confusion:** “E-verify now” button doesn't connect to ITD.
3. **Drop-off:** Users leave thinking they're done; gov portal still pending.
4. **Friction:** Low interactivity.
5. **Visual:** OK tracker pattern.
6. **Missing:** Real status from payment webhook, companion CTA as primary next step, email/SMS reminder.

---

## Companion — Post-pay value

### `/file/companion`

| Dimension | Score |
|-----------|-------|
| UX 7 · UI 6 · Trust 5 · Conversion 6 |

1. **Amateur:** **“Phase 2 · Companion mode”** badge on core differentiator — undermines paid value.
2. **Confusion:** Macro stepper shows step 1 while user may be post-pay; form selector includes ITR-3/4 without guard.
3. **Drop-off:** Guide load failure shows dashed empty state — critical feature failure.
4. **Friction:** Export blocked on mismatches — correct; needs clearer unlock rules after pay.
5. **Visual:** PortalGuideTable is strong when loaded — search, copy, progress.
6. **Missing:** Pay-gated unlock, PDF export polish, step completion persistence, mobile-friendly table.

---

### `/file/support`

| Dimension | Score |
|-----------|-------|
| UX 5 · UI 5 · Trust 5 · Conversion 4 |

1. **Amateur:** Static audit trail text; support buttons inert.
2. **Confusion:** Shows “Return submitted” and “E-verify completed” — contradicts MVP scope.
3. **Drop-off:** Low — utility page.
4. **Friction:** WhatsApp/Email buttons don't link out.
5. **Visual:** Single card — sparse.
6. **Missing:** Real event log from store/API, chat widget, ticket ID, companion deep link prominence.

---

## API routes — User-visible surfaces

These are not pages but shape UX through loading, errors, and mock responses.

### `POST /api/compute`

| Dimension | Score |
|-----------|-------|
| UX 6 · UI N/A · Trust 6 · Conversion 7 |

- **Amateur:** Errors surface as “Engine error: …” on regime screen — raw.
- **Confusion:** Demo fallback on landing when API fails — OK if labeled (is labeled “Demo”).
- **Drop-off:** Regime page blocked when compute fails.
- **Missing:** Retry button, offline demo mode toggle, latency indicator.

### `POST /api/documents/upload`

| Dimension | Score |
|-----------|-------|
| UX 6 · UI N/A · Trust 5 · Conversion 7 |

- **Amateur:** Always returns **mock fields** regardless of file — breaks trust when user uploads real Form 16.
- **Confusion:** Success UI shows parsed fields that may not match user's document.
- **Missing:** Real parser integration or honest “demo parser” banner.

### `GET /api/portal-guide/[form]`

| Dimension | Score |
|-----------|-------|
| UX 7 · UI N/A · Trust 6 · Conversion 8 |

- Powers companion — high conversion value when working.
- **Missing:** Error states with retry; cache indicator.

### `POST /api/payments/create-order` & `verify`

| Dimension | Score |
|-----------|-------|
| UX 6 · UI N/A · Trust 7 · Conversion 7 |

- Razorpay integration path — good trust if keys configured.
- **Missing:** Visible test-mode indicator in dev; receipt email trigger.

### `POST /api/feedback`

| Dimension | Score |
|-----------|-------|
| UX 7 · UI N/A · Trust 6 · Conversion 5 |

- Works on `/reviews` — adequate.
- **Missing:** Rate limiting message, thank-you with referral CTA.

---

## Cross-cutting issues (all pages)

| Issue | Severity | Affected stages |
|-------|----------|-----------------|
| Dual design systems (marketing shadcn vs `filing/ui.tsx`) | P0 | All |
| `app/file/layout.tsx` wraps FilingLayout → double header | P0 | Activate, File |
| Fake auth, fake submit, fake ACK numbers | P0 | Activate, Pay, Companion |
| Onboarding before import (5 screens) | P0 | Activate |
| “Phase 2” badges on user-facing features | P1 | Import, Companion |
| Hardcoded demo numbers (₹17k refund, AIS amounts) | P1 | File, Pay |
| Nav rail completion dots not from draft state | P1 | File |
| Mobile: macro stepper compact OK; product nav hidden md+ only partially | P2 | File |
| Glossary search disabled | P2 | Acquire |

---

## Priority heatmap (CEO view)

```
HIGH VALUE + HIGH GAP
├── Mismatch center (needs hero treatment, live data)
├── Companion (remove Phase 2 badge, pay-gate, polish export)
├── Landing trust + Form 16 CTA
└── Onboarding collapse for salaried

HIGH RISK (TRUST)
├── Fake OTP / Aadhaar linked badge
├── “Return submitted” copy in checkout
└── Mock parser presenting as real

QUICK UI WINS
├── Remove double header in /file/*
├── Connector teal → brand blue + logos
├── Unify pricing/plan cards with landing
└── Enable glossary search
```

---

*This audit is input to `docs/IMPLEMENTATION_ROADMAP.md`. Do not implement code until roadmap is approved.*
