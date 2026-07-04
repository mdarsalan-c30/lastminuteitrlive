# 14 — Computax / Winman Study: Workflow Anatomy & AI Displacement Map

> Phase 1, Deliverable 5. Grounded on published feature sets of Computax Professional / CompuOffice and Winman CA-ERP (July 2026), plus the CA panel findings (doc 11). Purpose: understand exactly what CA desktop software does, step by step, and mark which steps AI displaces vs augments vs must not touch.

## 1. The canonical CA-software workflow (one client, one return)

| # | Step | How Computax/Winman do it | Time (typical) |
|---|---|---|---|
| 1 | Client master setup | Manual entry / bulk import from Excel/Tally/previous-year files | Once |
| 2 | Document intake | **Outside the software** — WhatsApp/email/paper | Hours–days (the real cost) |
| 3 | Data pull | 26AS/AIS/TIS import via portal login; Form 16 PDF import; broker/Tally import | Minutes |
| 4 | Computation | Single-window entry; auto ceilings, set-off, carry-forward; current-vs-previous-year figures on screen | ~5 min (Winman's own claim, CA-confirmed) |
| 5 | Regime comparison | Auto old-vs-new per client, flags beneficial one | Seconds |
| 6 | Form selection | Auto-selects ITR form from income type/turnover/audit applicability | Seconds |
| 7 | Internal review | Senior reviews computation sheet printout / PDF | 10–30 min |
| 8 | Client approval | PDF over WhatsApp/email; verbal OK | Hours–days |
| 9 | E-file | One-click JSON generation → upload → e-verify (Aadhaar OTP/EVC) → ITR-V auto-download | Minutes |
| 10 | Post-filing ops | Bulk refund status, intimation auto-pull from email, demand response, rectification, legal-heir filing, 10E relief | Ongoing |
| 11 | Practice ops | MIS: filed/not-filed reports, deadline tracker (ITR, advance tax, GSTR, TDS), bulk password generation, DSC registry | Ongoing |

**Key insight:** steps 3–6 and 9 are already fast and automated. The slow, human, error-prone steps are **2 (intake), 7 (review), 8 (approval), 10 (post-filing)** — and those are exactly where an AI + client-facing layer wins.

## 2. Parity checklist (what we must match before CAs take us seriously)

From Computax/Winman published features — the "table stakes" list:

- [x] Regime comparison (engine has it)
- [x] ITR-1 JSON generation per e-filing schema (built)
- [ ] 26AS/AIS/TIS import (upload-parse route; honest "soon" today)
- [x] Form 16 PDF import (live)
- [ ] Auto ITR form selection across ITR-1→4 with turnover/audit gates (partial: quiz + blocks)
- [ ] Previous-year figure display + year-on-year carry (partner dashboard has rollover; needs surfacing)
- [ ] Set-off & carry-forward of losses engine
- [ ] Advance tax estimation (built) + mass advance-tax planner (not built)
- [ ] Bulk client MIS: filed/not-filed, refund status, intimation tracking
- [ ] 10E / 89(1) relief, legal-heir filing (defer — low volume, high complexity)
- [ ] Deadline tracker across compliances (ITR-only first)

## 3. AI displacement map

| Workflow step | AI role | Verdict |
|---|---|---|
| Document intake | **Displace**: collection agent — per-client checklist generation, WhatsApp nudges, auto-classification of uploads (Form 16 vs AIS vs bank statement), wrong-AY detection, password-PDF handling | Biggest win; unowned by incumbents |
| Data extraction | **Displace**: parse PDFs/CSVs into evidence-linked fields with confidence scores; human confirms low-confidence fields only | Core engine work |
| Reconciliation | **Augment**: AI drafts the diff explanation ("AIS shows ₹42,000 dividend not in your entries"), human/user decides | The trust product |
| Computation | **Do not AI.** Deterministic engine only. AI never computes tax; it explains what the engine computed, with citations | Non-negotiable (non-hallucination contract, doc 05) |
| Regime/form selection | Deterministic rules engine; AI explains the *why* | Same contract |
| Internal review | **Augment**: anomaly flags vs previous year ("income dropped 40%", "80C claim without evidence"), review checklist auto-generated | Converts step 7 from 30 min to 5 |
| Client approval | **Displace**: plain-language computation summary auto-generated per client (Hindi/English), one-tap approve link | Kills days of latency |
| Notice handling | **Augment**: notice PDF → classification (139(9)/143(1)/demand) → plain meaning → response checklist; human CA files the response | S7 segment + CA retention |
| Practice MIS | Deterministic dashboards; AI does weekly digest ("14 clients unfiled, 3 refunds stuck > 60 days") | Cheap delight |

## 4. What NOT to copy from Computax/Winman

- Their data-entry-first UX (we are evidence-first: upload → extract → confirm).
- Storing client ITD portal credentials for bulk pulls (compliance risk; ERI is the legitimate path).
- Per-PC licensing and season-locked pricing.
- Their silence toward the end client — the client never sees anything until a final PDF. Our client-visible status page is a feature *for the CA*.

## 5. Sequenced parity plan (feeds Phase 3 roadmap)

1. **Now (July season):** Form 16 live parse, ITR-1 JSON, regime verdict, eligibility routing — already shipped; harden with golden scenarios.
2. **Aug–Oct 2026:** AIS/26AS upload-parse + reconcile diff view; loss set-off/carry-forward engine; ITR-2 routing + JSON.
3. **Nov 2026–Jan 2027:** Partner document-collection agent; bulk MIS; ITR-4 presumptive; advance-tax planner (Q4 estimate wave).
4. **Feb–May 2027:** ERI registration pursuit; ITR-3; notice decoder GA; multi-user roles + audit log for medium firms.
