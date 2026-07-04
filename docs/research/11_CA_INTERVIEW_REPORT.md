# 11 — CA Interview Report (Simulated Panel, 24 Practitioners)

> Phase 1, Deliverable 2. Method: persona-simulated structured interviews grounded in real CA-software feature sets (Computax, Winman CA-ERP, EasyOffice, KDK, Saral), public CA community discussion themes, and our own partner-dashboard usage patterns. Treat quotes as synthesized composites, not verbatim humans. Validate top-5 findings with 5 real CA calls before Phase 3 build.

## Panel composition

| Segment | Count | Profile |
|---|---|---|
| Solo / small practice (1 CA + 1–3 staff) | 10 | Tier-2/3 cities (Indore, Nashik, Patna, Coimbatore), 150–600 ITRs/season, Computax or KDK on one desktop |
| Medium firm (2–5 partners, 10–25 staff) | 8 | Tier-1/2 (Pune, Jaipur, Ahmedabad, Lucknow), 1,000–4,000 ITRs, Winman/Computax + Excel trackers |
| Large firm (5+ partners, 30+ staff) | 6 | Metro (Mumbai, Delhi, Bengaluru), 5,000+ ITRs + audit practice, Winman ERP / CompuOffice, dedicated article pipeline |

---

## Finding 1 — The bottleneck is documents, not computation

Unanimous across all 24. Computation takes minutes in Computax/Winman ("computations taking just 5 minutes on an average" is literally Winman's pitch, and CAs agree). What eats the season:

- Chasing clients on WhatsApp for Form 16, bank interest certificates, broker P&L.
- Receiving photos of documents, password-protected PDFs, wrong-year documents.
- Re-requesting because the client sent Part A but not Part B.

> Solo, Nashik: "My articles spend 70% of July following up. The software is fine. The client is the problem."

**Product implication:** a client-facing *document collection agent* (checklist per client profile, auto-classify uploads, auto-detect wrong AY, nudge sequences) is worth more to CAs than a better calculator. This is the #1 partner-dashboard feature.

## Finding 2 — The reconciliation triangle is the paid skill

Medium/large firms describe their real value-add as diffing AIS/TIS vs 26AS vs client claims and deciding what to declare. Errors here cause notices; notices cause unpaid rework.

> Partner, Pune: "Anyone can enter Form 16. Knowing that AIS shows ₹42,000 dividend the client forgot — that's why they pay me."

**Product implication:** our reconcile engine (doc 03 §Reconcile) is the crown jewel for both B2C trust and B2B displacement. Must show *side-by-side sourced numbers with an explain*, not a silent merge.

## Finding 3 — Nobody trusts cloud, everybody resents desktop

- Small firms: fear cloud (client data, ITD credentials) but hate that Computax lives on one PC ("if that machine dies in July, I die").
- Medium firms: want multi-user, role-based access for articles; Winman multi-user licensing is expensive.
- Large firms: already hybrid; want audit trails of who touched which return.

**Product implication:** cloud with an explicit security story (encryption, role-based access, audit log per return, no ITD credential storage) can flip small/medium firms. The audit log is a sales feature, not just compliance.

## Finding 4 — Pricing psychology by segment

| Segment | Pays today | Willingness | Model that works |
|---|---|---|---|
| Solo | ₹5–12k/yr (Computax ~₹4.5–9k, Winman from ~₹9.85k) | ₹8–15k/yr IF it includes client-collection agent | Flat annual, unlimited returns |
| Medium | ₹25–60k/yr across modules | ₹40–80k IF multi-user + workflow | Per-seat annual |
| Large | ₹1L+ suites | Hard to displace; sell coexistence (import/export JSON with Winman) | Land with document agent + reconcile, expand later |

Per-return pricing was rejected by 22/24 — "I don't want a meter running during July."

## Finding 5 — The new Act migration is a live wound (July 2026)

All firms are mid-migration to Income-tax Act 2025 section codes. Staff trained on old sections; clients ask questions in old-section language ("my 80C…").

> Partner, Mumbai: "Every intern now needs the old-to-new mapping taped to the monitor."

**Product implication:** ship an old→new section translator (search "80C" → get the 2025-Act equivalent + explanation) inside both the B2C product and partner dashboard. Cheap to build, unusually high goodwill, SEO magnet.

## Finding 6 — What would make them switch (stack-ranked)

1. Client document collection + auto-classification (10/10 solo, 8/8 medium ranked top-3)
2. AIS/26AS/Form 16 reconcile with explanations
3. Bulk status dashboard (filed / verified / refund / notice) across clients
4. JSON import from Winman/Computax (zero-risk trial: "let me run 20 clients in parallel")
5. Old→new Act mapping and updated validations
6. WhatsApp-first client communication built in

What would NOT make them switch: AI chat ("I don't need a chatbot, I need my articles to stop making data-entry errors"), fancy UI, per-return analytics.

## Finding 7 — Fear inventory (objections to pre-empt)

- "Where is my client data stored? Who can see it?" → need a security one-pager.
- "What happens on 31 July if your server is down?" → uptime SLA + offline JSON export escape hatch.
- "Will you steal my clients?" (B2C+B2B conflict) → explicit no-poach policy; partner clients never see B2C upsells.
- "Is the computation certified? Who is liable for a wrong return?" → golden-scenario test suite published + clear liability terms.

## Go-to-market sequence recommended by the panel's economics

1. **Wedge:** free document-collection agent + reconcile report for 20 clients (solo firms, Tier-2). No filing displacement — coexists with Computax.
2. **Convert:** flat ₹9,999/yr unlimited when they ask for bulk dashboard + export.
3. **Expand:** medium firms via multi-user seats once audit log + roles exist.
4. **Coexist with Winman at large firms** — be the client-facing front-end that exports JSON into their existing back office.
