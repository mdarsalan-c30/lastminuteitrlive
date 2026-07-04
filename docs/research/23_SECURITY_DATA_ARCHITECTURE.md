# 23 — Security & Data Architecture (Phase 2, Executed)

> The trust layer. Phase 1 found that fear beats price (doc 12) and CAs' first question is "where is my client data?" (doc 11 Finding 7) — so security here is a *sales document* as much as an engineering one. No code.
> Grounding: P0 security fixes already shipped (scrypt via `lib/auth/password.ts`, production-required session secrets via `lib/auth/sessionSecret.ts`, fail-closed Razorpay, no hardcoded admin bootstrap). This doc extends those into the target architecture.

## 1. Data classification (drives every control below)

| Class | Examples | Storage rule | Log rule | Retention |
|---|---|---|---|---|
| **C4 Prohibited** | Aadhaar number, ITD portal passwords | **never stored, never asked** | never | — |
| **C3 Critical** | PAN, DOB, full documents (Form 16/AIS/26AS), bank details | Encrypted at rest (per-case data key, envelope encryption); object storage only for docs | masked (`ABCDE****F`) | user-deletable; default purge offer after AY+1 |
| **C2 Sensitive** | Facts (income values), ComputationRuns, ReconcileIssues | Encrypted at rest (DB-level) | values never logged; factKeys OK | tied to case lifecycle |
| **C1 Internal** | CaseEvents, state, plan, timestamps | standard | OK | 7 years (notice-defense window ≈ ITR-U horizon, doc 15) |
| **C0 Public** | Marketing content, rule explainers | — | — | — |

The Fact registry (doc 20 §2.3) carries the sensitivity class per key, so masking/encryption is metadata-driven, not per-screen discipline.

## 2. DPDP Act 2023 posture

- **Consent artifact per case**: purpose ("prepare your ITR for AY 2026-27"), scope (doc classes), recorded as a CaseEvent with timestamp + text version. Re-consent on purpose change (e.g. opting into next-year reminders).
- **Delete-my-data**: one button → hard-deletes C3 objects, crypto-shreds the per-case data key, anonymizes C2, keeps C1 skeleton (legal/financial records). Ship it in V1 — it is both compliance and the trust feature the S1 segment asks about.
- **Data locality**: primary region India (Vercel/DB region selection is a Phase 7 checklist item); document storage in-region.
- **Processor inventory**: LLM provider, payment gateway, email/WhatsApp — each listed on a public sub-processor page. LLM calls send **only** fact values needed for the specific explanation (tool-scoped, doc 22 §4), never raw documents; provider must be zero-retention tier.

## 3. Identity & session (extends shipped P0 work)

| Concern | Target |
|---|---|
| Passwords | scrypt now (shipped); add argon2id as new-hash default when convenient; legacy-hash upgrade-on-login (shipped pattern) |
| Sessions | required env secrets in prod (shipped); add rotation support (dual-secret validity window) |
| B2C step-up | OTP (email/SMS) before viewing C3 documents or deleting data |
| CA partner roles | `owner / preparer / reviewer` per firm; a preparer cannot export or mark FILED — mirrors the article/partner review split (doc 11 Finding 3) |
| Family-filing mode | operator identity recorded on every attestation (doc 21 §3.6) — accountability without blocking the real S6 behavior |
| Admin | separate origin path, IP allowlist option, mandatory 2FA before GA |

## 4. Audit log — CaseEvents (the notice-defense asset)

Append-only, hash-chained per case (`eventHash = H(prevHash ‖ payload)`), covering: gate answers, uploads, extraction batches, fact confirmations/supersessions, reconcile resolutions, computation runs, entitlement changes, exports, FILED/VERIFIED marks, consents, deletions.

Products built on it (this is why it's an asset, not overhead):
- **User-facing "case history"** — transparency screen ("what LastMinuteITR knew and when").
- **Notice defense pack** — one-click PDF: facts + provenance + trace for the filed run (S7 segment; CA retention tool).
- **Partner audit view** — who touched which client return (medium-firm switch trigger, doc 11).

## 5. Threat model (top 8, STRIDE-lite)

| # | Threat | Mitigation |
|---|---|---|
| 1 | Wrong-person document upload (PAN mismatch) exposing a third party's data | PAN-match quarantine at EvidenceNode write (doc 20 §2.1); quarantined bytes purged in 24h |
| 2 | Case enumeration / IDOR across users | Case ids UUIDv4 + every query ownership-scoped at the Case Service; no sequential ids anywhere |
| 3 | Payment bypass (plan spoof) | Server-side plan catalog + amount binding in webhook (shipped); entitlement checks only server-side |
| 4 | Prompt injection via document content reaching the AI layer | AI never reads raw docs (tool fence, doc 22 §4); extraction values are typed scalars, not free text |
| 5 | Parser RCE / zip-bomb via malicious PDF | Parse in sandboxed workers, size caps (shipped MAX_FILE_BYTES), format allowlist, no macro formats |
| 6 | Season-peak DDoS on 30–31 July | Edge rate limits, queue-backed parsing, shed order per doc 22 §7; static status page off-infra |
| 7 | Insider/admin data browsing | Admin cannot view C3 doc bytes without break-glass event (logged, alerting); support works from masked views |
| 8 | Stale ITR schema → invalid filings at scale | Export pinned to schemaVersion; schema-drift monitor is a launch-blocking alert, not a bug ticket |

## 6. Public trust surface (turn the above into marketing)

Ship alongside V1: a `/security` page stating — encrypted at rest/in transit, India data residency, no Aadhaar ever, no ITD passwords ever, delete-my-data in one click, sub-processor list, and "every number traceable to your documents." This answers the CA fear inventory (doc 11 Finding 7) and the S1 parent-test ("would you let your father use it?").

## 7. Acceptance criteria (Phase 2 gate)

- [ ] Classification table reviewed; every Fact registry key assigned a class
- [ ] Delete-my-data flow scoped into V1
- [ ] LLM zero-retention tier confirmed with provider
- [ ] Hash-chained CaseEvent design accepted (and its three product uses)
- [ ] `/security` page copy drafted with legal review
