# 13 — Competitor Teardown (Grounded, July 2026)

> Phase 1, Deliverable 4. Pricing/features verified against live pages July 2026: cleartax.in pricing + partner pages, computax.in, winmansoftware.com, softwaresuggest listings.

## 1. The field

| Player | Model | Verified pricing (Jul 2026) | Core strength | Core weakness |
|---|---|---|---|---|
| **ClearTax** | B2C DIY + CA-assisted + LIVE video filing; ERI | DIY from ₹198–499 (ITR-1/4 ₹299–499; ITR-2/3 ₹699–999); assisted salaried ₹1,299–2,499; capital gains/self-employed from ₹3,999; crypto ₹2,999; NRI ₹5,999–9,999; "Elite/Year-round" up to ₹14,999 | Prefill via ERI, brand, breadth, WhatsApp/AI chat filing | Aggressive upsell ladders; dynamic pricing feels bait-y; assisted = human queue; complexity punished with price jumps |
| **Tax2Win / TaxBuddy / TaxSpanner** | Assisted-first | ₹499–4,000 typical | Cheap human-assisted | Thin software; human bottleneck; weak reconcile UX |
| **Quicko** | B2C DIY, investor-focused | Freemium + paid tiers | Broker integrations (Zerodha etc.), clean UX | Narrower income coverage; assisted thin (per ClearTax's own comparison, which is biased but directionally right) |
| **Computax (CompuOffice)** | CA desktop/hybrid suite | Custom; historically ~₹4.5–9k/yr solo | ITR+GST+TDS unified, bulk filing, AIS/TIS pull, deadline tracker | Desktop-era UX; no client-facing layer; per-PC licensing pain |
| **Winman CA-ERP** | CA desktop | From ~₹9,850 + GST | "5-minute computation", Excel-like single window, 26AS/AIS/Form-16 PDF import, one-click e-file/e-verify, bulk MIS | Same: zero client-facing surface; document collection unsolved |
| **ITD portal + free utility** | Free | ₹0 | Authoritative, prefill | No guidance, no reconcile explain, fear-inducing |

## 2. What ClearTax's own funnel teaches (reverse-engineered)

1. **"Start filing now, pay later"** — pay-at-checkout after value is shown. We should copy this: never gate the refund estimate behind payment.
2. **Auto-plan-selection** — "we'll auto select your plan based on your ITR info". Smart, but users experience it as a price ambush when equity income silently bumps them from ₹499 to ₹3,999. **Our counter: price transparency up front — show the plan ladder and what triggers each tier before they enter data.**
3. **Coupon-code theater** (CTEMP40 etc.) — manufactured discounts. Works but erodes trust. Our brand is honesty; use one clean launch price instead.
4. **Assisted plans are anchored on refund size** ("Maximum Tax Refunds ~₹30,990") — refund-as-hero confirmed (matches our S-segment research).
5. **LIVE video filing tier** (₹2,499–9,999) — the "human on demand" ceiling. Our Smart AI CA sits *under* this price with *more* availability; human-CA escalation partners sit at it.

## 3. Feature matrix vs LastMinuteITR (current, post-P0)

| Capability | ClearTax | Quicko | Computax/Winman (CA) | **LMITR today** | **LMITR target** |
|---|---|---|---|---|---|
| Form 16 parse | Yes | Yes | Yes (PDF import) | **Yes (live)** | Yes |
| AIS/26AS import | Yes (ERI prefill) | Partial | Yes | **Honestly "soon"** | Upload-parse first, ERI later |
| ITR routing engine (form auto-select) | Yes | Yes | Yes | Partial (quiz + eligibility block) | **Best-in-class w/ explanations** |
| Reconcile w/ explanations | Silent merge | Partial | Diff, expert-facing | No | **Consumer-grade diff view — differentiator** |
| Regime comparison | Yes | Yes | Yes | Yes (engine) | Yes + shareable verdict card |
| Capital gains from broker files | Via integrations | **Strong** | Manual/import | No | Phase 3 (S3 segment) |
| Portal-ready JSON export | ERI files directly | ERI | Yes | **Yes (ITR-1)** | ITR-1→4 |
| Notice decoding | Paid service | No | Expert tool | No | **SEO + product wedge** |
| CA partner dashboard | Separate product | No | Core | **Yes (basic)** | Document-collection agent on top |
| AI explanation layer | Chatbot | No | No | Partial | **Evidence-linked Smart AI CA — differentiator** |

## 4. The 10X gaps nobody owns (our openings)

1. **Explainable reconcile.** Everyone either hides the AIS/26AS diff (B2C) or shows it raw to experts (CA tools). A consumer-readable "here are 3 mismatches, here's what each means, tap to resolve" view does not exist in the market.
2. **Price honesty.** ClearTax's dynamic plan-bumping is the most complained-about pattern. Fixed, visible, trigger-explained pricing is a positioning weapon, not just ethics.
3. **The new-Act translation layer.** First season under Income-tax Act 2025; every player's content is mid-migration. Old→new section search + explanations = SEO land-grab window of ~12 months.
4. **Document collection for CAs.** Computax/Winman start after documents arrive. The WhatsApp-chaos before that is unowned (see doc 11, Finding 1).
5. **Notice-response flow.** High-intent, high-fear, high-willingness (S7). ClearTax sells it as an opaque human service; a guided decoder is buildable and rankable.
6. **Filing-for-family mode.** Real behavior (children file for parents); no product acknowledges it.

## 5. Pricing strategy conclusion

- Keep two B2C tiers (Starter / AI Smart) — validated against ClearTax's ₹499 / ₹1,299–2,499 anchors; we undercut assisted while out-featuring DIY.
- Never dynamic-bump. If data triggers a higher tier, show *why* before asking.
- CA partner: flat annual ≥ ₹9,999 unlimited (undercuts Winman's entry, includes the collection agent they can't get anywhere).
- Free tier must include: refund estimate, regime verdict, eligibility routing. (All are shareable trust artifacts that feed acquisition.)
