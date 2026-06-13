# Trust & Conversion Optimization — LastMinute ITR

**Phase 6 · Agent 5 (Growth + CRO)**  
**Date:** June 2026  
**Scope:** Documentation only — no code changes in this phase.

This spec maps trust surfaces, conversion psychology, and component contracts to the shipped product (`app/page.tsx`, `app/reviews`, checkout flow, `lib/payments/access.ts`, `engine/confidence.py`). It is the build guide for turning “college-site” social proof into ClearTax/Quicko-tier fintech trust.

---

## 1. Current state (baseline)

| Surface | Shipped | Trust gap |
|---------|---------|-----------|
| Hero | `TrustRow` — single muted line | No icons beyond Shield; no numeric proof; no encryption badge |
| Reviews | `ReviewsCarousel` — 1 quote, auto-rotate | No avatars, no verifiable cues, no video slots |
| `/reviews` | 2-col card grid + feedback form | Static seeded data; no filing context (plan, outcome) |
| Import | `ConnectorGrid` / mismatch gate | Mismatch moat exists but no trust strip on import |
| Regime | Engine banner shows `completeness_score` | Score buried in success banner, not a persistent panel |
| Review | `risk/page.tsx` — hardcoded 92%/72% | Not wired to `ConfidenceResult` from Python engine |
| Pre-submit | Checklist only | No `ConfidencePanel`; pay CTA before value stack |
| Checkout | Plan cards → payment | Price shown first; no `PaywallValueStack`; refund copy generic |
| Senior | Age band in case-matrix only | No enlarged reassurance or phone CTA |

**Principle:** Show **earned value before price**. Block pay until mismatches are resolved and filing confidence is visible (ClearTax pattern). Never promise “maximum refund” or auto-submit to ITD.

---

## 2. Reviews section redesign spec

### 2.1 Landing (`ReviewsCarousel` → `ReviewsSection`)

**Layout**

- **Desktop:** Featured quote (left 55%) + static grid of 3 mini-cards (right 45%).
- **Mobile:** Featured quote full-width; horizontal scroll of mini-cards below (snap, no autoplay-only social proof).
- **Section header:** Eyebrow “Reviews” · H2 “Trusted by last-minute filers” · subline with aggregate: **“4.8/5 from 6 verified filers · AY 2025-26”** (update when real data exists).

**Avatar treatment**

- Circular avatar 40px (featured) / 32px (grid).
- **Initials fallback** on muted gradient (`primary/10`) when no photo.
- Optional real photos for CA-verified testimonials only; never stock faces without disclosure.

**Verifiable cues (per testimonial card)**

| Cue | Display | Purpose |
|-----|---------|---------|
| Plan badge | `DIY` · `AI Smart` · `CA` | Anchors price tier credibility |
| Outcome chip | “Regime saved ₹18k” · “AIS mismatch caught” | Specific, auditable claim |
| City + role | Existing fields | Local relevance |
| Filing month | “Filed Jul 2025” | Seasonal trust |
| Verified filer | Checkmark + tooltip “Verified purchase · AY 2025-26” | Distinguish from marketing copy |
| Link | “Read all reviews →” to `/reviews` | Depth for skeptics |

**Avoid:** Anonymous 5-star walls; “Guaranteed refund”; unverifiable “10,000+ users” until backed by analytics.

### 2.2 Full reviews page (`app/reviews/page.tsx`)

**Layout**

- Hero stats bar: average rating, count, breakdown histogram (5★–1★).
- **Filter chips:** All · Salaried · Senior · CA tier · Mismatch saved.
- **Grid:** 2 columns desktop, 1 mobile; card height auto (no truncated quotes).
- **Featured row:** 1 “CA endorsement” card (wider) for professional reviewer (e.g. Rahul Mehta, CA).
- **Video testimonial slots:** 2 placeholder slots above grid.

**Video slot spec (Phase 2 content)**

- 16:9 thumbnail, play overlay, duration badge (≤90s).
- Captions required; transcript toggle for accessibility.
- Topics: (1) AIS mismatch caught, (2) companion guide on gov portal.
- Label: “Customer story · not paid actor” until production videos exist.

**Feedback form**

- Keep POST to `/api/feedback`; add optional “What did we help you catch?” dropdown (mismatch / regime / deduction / companion).
- Post-submit: “We may contact you to verify for public review” — sets expectation for verifiable cues later.

### 2.3 Content model extension (`Testimonial`)

Extend seeded data (future) with:

```ts
{
  avatarUrl?: string;
  filedMonth?: string;        // "2025-07"
  outcomeTag?: string;        // "Regime saved ₹18k"
  verifiedPurchase?: boolean;
  videoUrl?: string;
  incomeBand?: string;        // optional anonymized band
}
```

---

## 3. Security badges (`SecurityStrip`)

Persistent strip (not footnote text) repeating on landing hero, import, pre-submit, checkout.

| Badge | Icon | Copy | Tooltip / expand |
|-------|------|------|------------------|
| DPDP | ShieldCheck | DPDP Act compliant | “Data processed in India; consent-based collection; delete on request.” |
| Encryption | Lock | AES-256 in transit & at rest | “TLS 1.3 to our servers; encrypted storage for uploaded Form 16/AIS.” |
| No auto-submit | Hand | We never file to ITD for you | “You copy values into incometax.gov.in. No ERI auto-submit in this release.” |
| Payments | CreditCard | Razorpay-secured checkout | “We never store card/UPI details.” |

**Visual:** Horizontal pill row on light backgrounds; compact icon+label on dark (`QuickStart` band). Muted border, not neon “trust seals” — fintech sober.

**Placement:** Replace/augment single-line `TrustRow` with `SecurityStrip` (see component spec §12).

---

## 4. Compliance indicators (lawful optimization)

**Messaging pillars** (from `TRUST_ITEMS`, hero copy, `TrustRow`):

1. **Lawful optimization only** — deductions and regime choice within IT Act; no refund “hacks” or fake expenses.
2. **User-controlled filing** — companion mode maps to gov portal; user submits and e-verifies.
3. **Evidence-first** — recommendations show `proof_required` (engine `Recommendation` type).
4. **Estimate vs exact** — estimate mode never labeled filing-ready (`confidence.is_estimate_mode`).

**UI patterns**

- **Compliance chip** on deduction suggestions: “Section 80C · proof: PF/ELSS receipt”.
- **Blocked state** when recommendation `blocked: true` — explain why, not hidden.
- **Footer disclaimer:** “Not affiliated with Income Tax Department” (already in `SiteFooter`) + link to Learn article on lawful optimization.
- **Mismatch gate copy:** “Submit stays disabled until critical mismatches are resolved” — frames paywall as integrity, not upsell.

**Banned copy:** “Maximum refund”, “Refund guaranteed”, “Beat the department”, “Hidden deductions ITD doesn’t want you to know”.

---

## 5. Refund confidence messaging (`RefundEstimateCard`)

Refund is emotionally charged — treat as **estimate with provenance**, not hype.

### Honest framing

| Context | Headline | Body |
|---------|----------|------|
| Regime screen | “Estimated refund under {regime} regime” | “Based on Form 16 + AIS in exact mode. Final amount confirmed only after ITD processes your return.” |
| Risk review | “Expected refund (pre-submit)” | “₹17,000 · new regime · TDS {formatINR} credited” |
| Checkout | “If ITD accepts your return as filed” | “Refund typically credits in 4–8 weeks to your **pre-validated** bank account.” |

### Required disclaimers (always visible, ≥12px)

- Refund is **not guaranteed** until return is processed and intimated by CPC.
- Tax **due** shown with equal prominence when payable (amber, not hidden).
- “We don’t hold or advance your refund” — product is preparation, not lending.

### Visual

- Green amount only when `net_tax < 0`; amber/red for payable.
- Source line: “Computed by Layer 1 tax engine · {ASSESSMENT_YEAR}”.
- Link: “How refund timing works →” (Learn article).

**Avoid:** Hero-sized refund numbers on landing without “estimate” label; comparing refund to plan price (“Pay ₹899, get ₹17k back”) — use **value stack** instead (§10).

---

## 6. Filing confidence score UI (`ConfidencePanel`)

Wire to `engine/confidence.py` → `ConfidenceResult` (already exposed on `ITRResult.confidence` in `lib/engine/types.ts`).

### Engine fields → UI mapping

| Field | UI element |
|-------|----------------|
| `completeness_score` | Circular or linear progress (0–100%) |
| `filing_ready` | Badge: green “Filing-ready” / amber “Not filing-ready” |
| `missing_documents[]` | Checklist with upload CTAs |
| `ca_escalation_recommended` | Amber banner + reasons list |
| `ca_escalation_reasons[]` | Bulleted; CTA “Upgrade to CA Review” when true |
| `is_estimate_mode` | Sticky warning: “Estimate mode — not filing-ready” |

### Document weights (for “why 73%?” explainer)

| Document | Weight |
|----------|--------|
| Form 16 | 35% |
| AIS | 20% |
| Form 26AS | 20% |
| Bank interest cert | 10% (if interest income) |
| Home loan cert | 10% (if home loan) |
| CG statement | 5% (if capital gains) |

Show expandable “Score breakdown” listing earned vs missing weights (transparency builds trust).

### Placement

| Screen | Behavior |
|--------|----------|
| `/file/regime` | Compact panel under regime cards (replace one-line banner) |
| `/file/review/risk` | **Primary** — full `ConfidencePanel`; replace hardcoded 92/72 |
| `/file/review/presubmit` | Summary row + block “Choose plan” if `!filing_ready` |
| `/file/import/*` | Mini panel after parse: “Upload AIS to reach ~55% → 100%” |
| Marketing `DashboardMock` | Demo 87% — label “Example dashboard” |

### States

```
≥90% + filing_ready     → green, unlock pre-submit pay path
70–89%                  → amber, list missing docs
<70% or estimate mode   → amber/red, block pay CTA
ca_escalation_recommended → show CA upsell (non-blocking for DIY)
```

---

## 7. AI verification score UI spec

Separate from **document completeness** — measures how well AI + user have **verified parsed field values** and resolved risk flags.

### Score composition (proposed)

| Signal | Weight | Source |
|--------|--------|--------|
| Import parse confidence | 40% | Parser confidence per field (Form 16/AIS) |
| User confirmations | 30% | “Low-confidence fields confirmed” (support audit trail) |
| Mismatch resolution | 20% | Critical = 0 open, warnings acknowledged |
| Risk flags cleared | 10% | `risk_flags` severity != critical remaining |

Display as **“AI verification: {n}%”** with sublabel “Field-level checks · not a guarantee of ITD acceptance”.

### UI

- **Ring gauge** (distinct color from filing confidence — e.g. violet vs blue) to avoid conflating two scores.
- Expandable list: “3 fields need your confirmation” → links to field screens.
- After 100%: “All imported fields verified by you” + timestamp in audit trail.

### Placement

| Screen | Component |
|--------|-----------|
| Post-import parsing confirm | First exposure |
| Mismatch resolution | Updates when critical cleared |
| CA Brain (`/file/cabrain`) | Shows before/after RAG questions |
| Pre-submit checklist | Row: “AI verification ≥95%” as gate (optional P1) |

### Copy

- **Do:** “We flagged 3 fields — please confirm before filing.”
- **Don’t:** “AI certified accurate return” or “Zero error guarantee.”

---

## 8. Social proof placements across funnel

| Funnel stage | Route | Social proof element | Format |
|--------------|-------|----------------------|--------|
| **Landing** | `/` | Hero `TrustBar` + `SecurityStrip` | Pills + filer count |
| **Landing** | `/` | `ReviewsSection` | Featured + grid |
| **Landing** | `/` | `QuickStart` mock | Confidence 87% example |
| **Import** | `/file/import/documents` | “Most filers start with Form 16” | Stat + connector logos |
| **Import** | `/file/import/mismatch` | “1 in 4 filers see an AIS mismatch” | Normalize anxiety |
| **Reconcile** | `/file/regime` | “₹18k avg regime savings (AI Smart filers)” | Outcome stat — verify before publishing |
| **Optimize** | `/file/cabrain` | “Doctors often miss 80D top-up” | Profession-specific micro-proof |
| **Review** | `/file/review/risk` | `ConfidencePanel` + testimonial snippet | Inline quote matching mismatch/regime |
| **Pre-submit** | `/file/review/presubmit` | Checklist + security strip | Compliance |
| **Paywall** | `/file/checkout/plans` | `PaywallValueStack` + mini review | Value before ₹499/₹899 |
| **Payment** | `/file/checkout/payment` | Razorpay trust + refund disclaimer | Payment security |
| **Post-pay** | `/file/companion` | “Join 6 filers who filed with companion this week” | Light urgency |

**Rule:** Match proof to **last completed action** (post-mismatch → mismatch testimonial; post-regime → regime savings story).

---

## 9. Paywall psychology — value before ₹499 / ₹899

### Tier value mapping (`lib/payments/access.ts`)

| Unlock | Free | DIY ₹499 | AI Smart ₹899 | CA ₹2,499 |
|--------|------|----------|---------------|-----------|
| Guided filing | — | ✓ | ✓ | ✓ |
| Companion export | — | ✓ | ✓ | ✓ |
| Mismatch engine | — | — | ✓ | ✓ |
| Regime optimizer | — | — | ✓ | ✓ |
| CA escalation path | — | — | — | ✓ |

### `PaywallValueStack` order (always before price)

1. **Regime savings** — “You save **{formatINR(savings)}** vs the other regime” (personalized from draft).
2. **Mismatch caught** — “**{n} critical mismatches** resolved — would have risked notice” (0 → hide section).
3. **Companion PDF** — “**{stepCount}-step** gov portal guide with your numbers pre-filled”.
4. **Filing confidence** — “**{completeness_score}%** filing-ready · {missing count} docs left”.
5. **Then price** — “Unlock for **₹899** · less than one hour with a CA”.

### Anchoring

- Show CA tier (₹2,499) first in comparison table, then AI Smart as “Popular”.
- DIY ₹499 framed as “Guided filing only — no mismatch engine” when mismatches exist (soft nudge to AI Smart).

### Friction guards

- Disable plan selection until `mismatchResolved && filing_ready` (or show banner explaining why).
- Payment page subtitle: replace vague “eligible for refund” with **value stack recap** + refund disclaimer.

**Psychology:** User has already invested time in import/reconcile — paywall is **continuation**, not cold sale. TurboTax pattern: confidence score → pay.

---

## 10. Senior-citizen trust

Detect `ageBand`: `senior` (60–64) or `super_senior` (80+) from case-matrix / profile.

### UI adaptations

| Element | Spec |
|---------|------|
| Typography | Body +1 step (`text-base` → `text-lg`) on reassurance blocks |
| Contrast | WCAG AA minimum; avoid zinc-400 on white for critical copy |
| Phone CTA | Sticky “Call us: 1800-XXX-XXXX · 9am–9pm IST” on filing layout when senior |
| Copy | “We’ll walk you through the gov portal step by step — no auto-submit.” |
| 80TTB / 80D | Highlight in regime/deduction cards when applicable |
| Paywall | Emphasize CA tier + phone support; de-emphasize “AI” jargon → “Expert-checked return” |
| e-verify | Larger buttons for Aadhaar OTP path; warn on ITR-V postal delay |

**Placement:** `FilingLayout` banner (conditional) + enlarged block on pre-submit + checkout for senior bands only.

---

## 11. Component specifications

### 11.1 `TrustBar`

**Purpose:** Numeric + policy social proof in hero and filing header.

**Props**

```ts
interface TrustBarProps {
  variant?: "light" | "dark" | "compact";
  showFilerCount?: boolean;  // "2,400+ returns prepared" when verified
  showRating?: boolean;      // "4.8/5"
}
```

**Content slots:** Lawful optimization · DPDP · No auto-submit · optional filer count.

**Locations:** `app/page.tsx` hero (below `HeroNameForm`), `app/file/layout.tsx` slim bar.

---

### 11.2 `ConfidencePanel`

**Purpose:** Primary filing confidence UI wired to `ConfidenceResult`.

**Props**

```ts
interface ConfidencePanelProps {
  confidence: ConfidenceResult;
  variant?: "full" | "compact" | "marketing-demo";
  onUploadDoc?: (docKey: string) => void;
  onUpgradeCA?: () => void;
}
```

**Sections:** Score ring/bar · filing-ready badge · missing docs checklist · CA escalation · estimate mode warning · expandable weight breakdown.

**Locations:** regime, risk review, presubmit, import post-parse.

---

### 11.3 `SecurityStrip`

**Purpose:** Icon row for DPDP, encryption, no auto-submit, Razorpay.

**Props**

```ts
interface SecurityStripProps {
  variant?: "inline" | "stacked";
  showTooltips?: boolean;
}
```

**Locations:** hero, import documents footer, presubmit, checkout payment.

---

### 11.4 `RefundEstimateCard`

**Purpose:** Honest refund/payable display with disclaimers.

**Props**

```ts
interface RefundEstimateCardProps {
  netTax: number;           // negative = refund
  regime: "old" | "new";
  tdsCredited?: number;
  assessmentYear?: string;
  variant?: "summary" | "checkout";
}
```

**Always shows:** amount · regime · disclaimer · bank pre-validation note when refund.

**Locations:** regime page, risk review, checkout payment (replace hardcoded ₹17,000 card).

---

### 11.5 `PaywallValueStack`

**Purpose:** Personalized value bullets before plan price.

**Props**

```ts
interface PaywallValueStackProps {
  regimeSavings: number;
  mismatchesResolved: number;
  companionStepCount: number;
  completenessScore: number;
  recommendedPlan: PlanId;
}
```

**Layout:** Checklist with ₹ amounts where applicable → divider → “Your unlock” → plan cards.

**Location:** `/file/checkout/plans` above plan grid; collapsed recap on `/file/checkout/payment`.

---

## 12. Conversion funnel metrics to track

### Acquisition (landing)

| Metric | Definition | Target (initial) |
|--------|------------|------------------|
| `landing_cta_click_rate` | Hero form submit / Upload Form 16 | ≥8% |
| `trust_strip_expand_rate` | Security tooltip opens | Baseline |
| `reviews_depth_rate` | `/reviews` visits from landing | ≥3% |
| `pricing_scroll_rate` | `#pricing` in viewport | ≥25% |

### Activation (import)

| Metric | Definition |
|--------|------------|
| `form16_upload_rate` | Sessions with Form 16 parsed |
| `ais_upload_rate` | Sessions with AIS |
| `import_to_mismatch_rate` | Reached mismatch screen |
| `mismatch_resolution_rate` | Critical → resolved |
| `time_to_first_confidence` | Upload → first `completeness_score` > 0 |

### Engagement (optimize + review)

| Metric | Definition |
|--------|------------|
| `regime_compare_completion` | Saw both regimes + selected one |
| `regime_savings_shown` | `|old - new|` displayed |
| `confidence_90_rate` | Sessions reaching ≥90% + filing_ready |
| `ai_verification_100_rate` | All low-confidence fields confirmed |
| `presubmit_checklist_green` | All checklist items pass |

### Monetization (paywall)

| Metric | Definition | Target |
|--------|------------|--------|
| `paywall_view_to_plan_select` | Plans page → plan selected | ≥60% |
| `plan_select_to_payment` | Payment page reached | ≥75% |
| `payment_success_rate` | Razorpay verify OK | ≥95% |
| `value_stack_impression` | PaywallValueStack in viewport | 100% of plans page |
| `diy_vs_ai_smart_mix` | Plan distribution | Track nudge efficacy |
| `ca_escalation_upgrade_rate` | CA recommended → CA purchased | Baseline |

### Trust quality

| Metric | Definition |
|--------|------------|
| `refund_disclaimer_view` | Disclaimer visible on checkout |
| `senior_phone_cta_click` | Phone CTA (senior band) |
| `support_contact_rate` | Chat / WhatsApp from filing |
| `post_pay_companion_open` | Companion opened within 24h |

### Segment slices

Always break down by: `plan`, `ageBand`, `filingMode` (exact vs estimate), `mismatchResolved`, traffic source.

**North-star:** `filing_ready_pay_conversion` = paid checkout / sessions reaching `filing_ready === true`.

---

## 13. Top 8 trust components to build (priority order)

| # | Component | Why first | Primary placement |
|---|-----------|-----------|-------------------|
| 1 | **`PaywallValueStack`** | Biggest revenue lift — shows regime savings + mismatch value before ₹499/₹899 | `/file/checkout/plans` |
| 2 | **`ConfidencePanel`** | Replaces fake 92%/72%; wires real engine trust | `/file/review/risk`, presubmit |
| 3 | **`SecurityStrip`** | Upgrades weakest hero trust (single text line) | Landing hero, checkout |
| 4 | **`RefundEstimateCard`** | Stops refund hype liability; honest checkout | Regime, risk, payment |
| 5 | **`ReviewsSection`** (redesign) | Landing social proof too thin (carousel-only) | `/`, `/reviews` |
| 6 | **`TrustBar`** | Numeric proof + policy pills | Hero, filing header |
| 7 | **AI verification score UI** | Differentiates AI Smart tier credibly | Post-import, presubmit |
| 8 | **Senior reassurance block** | Underserved segment; phone CTA conversion | `FilingLayout` conditional |

---

## 14. Paywall placement recommendation

### Recommended flow (enforce in nav guards)

```
Import → Mismatch (resolve) → Regime → Risk review [ConfidencePanel]
  → Pre-submit checklist [all green]
  → Checkout plans [PaywallValueStack + plan cards]
  → Payment [RefundEstimateCard + SecurityStrip]
  → Companion (post-pay deliverable)
```

### Do

- Place paywall at **macro step 6 (File & Track)** only after **macro step 5 (Review)** is complete.
- Show **`PaywallValueStack` above plan cards** on `/file/checkout/plans` — never price-first.
- On payment page, **repeat 3 value bullets** (regime savings, mismatches resolved, companion steps) then price.
- Gate **`Choose plan & submit`** on presubmit until `filing_ready && mismatchResolved` (already partially implemented — extend with engine confidence).
- Default-select **AI Smart (₹899)** when `canUseMismatchEngine` features were used in session (mismatch screen visited or regime optimizer viewed).

### Don’t

- Paywall before mismatch resolution (breaks “block before pay” wedge).
- Show ₹899 on landing as primary CTA without value context.
- Tie refund estimate to “you’ll earn back the fee 20×” — use lawful value stack instead.

### A/B tests (post-launch)

1. Value stack **with ₹ amounts** vs qualitative bullets only.
2. Plans page: **AI Smart pre-selected** vs no selection.
3. Checkout: **confidence % in paywall header** vs value stack only.

---

## 15. Implementation notes (for engineering handoff)

- **Data:** Pass `result.confidence` from engine API through draft store or review page fetch — remove hardcoded scores in `app/file/review/risk/page.tsx`.
- **Access gating:** Align UI locks with `lib/payments/access.ts` (`canUseMismatchEngine`, `canExportCompanion`, etc.).
- **Copy source of truth:** `TRUST_ITEMS` in `lib/constants.ts` — extend, don’t duplicate strings.
- **Analytics:** Fire events at value stack impression, confidence threshold crossings (70/90/100), and paywall gate blocks.

---

*End of Phase 6 trust & conversion spec.*
