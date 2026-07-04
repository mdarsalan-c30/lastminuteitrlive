# Phase 2 — Product Architecture (Blueprint Only)

**Status:** Research blueprint — **no implementation**  
**Depends on:** Phase 1 sign-off

---

## 1. Product architecture principles

1. **Evidence graph is the source of truth** — not chat memory, not random form fields  
2. **Deterministic tax engine is sovereign** — AI explains and routes; engine calculates  
3. **Persona gates before depth** — refuse early  
4. **Portal companion is a first-class output** — equal to ITR JSON  
5. **Every number has provenance:** `document | user_attested | computed | imported`

---

## 2. Domain model (conceptual)

```
TaxpayerCase
  ├── PersonaGate (resident, income heads, complexity flags)
  ├── EvidenceNodes[] (docs, extractions, confidences)
  ├── Facts[] (canonical tax facts with provenance)
  ├── ReconcileIssues[] (AIS vs Form16 vs 26AS vs user)
  ├── Computation (engine result, regime, risk)
  ├── ItrDraft (form-specific schedules)
  ├── CompanionGuide (portal steps + field values)
  └── Entitlement (plan, payment, expiry)
```

### Evidence node

| Field | Purpose |
| --- | --- |
| sourceType | form16, ais, form26as, broker_cas, manual |
| rawRef | storage pointer (encrypted) |
| extractions[] | field, value, confidence, locator |
| parseMode | live \| failed — never demo |

### Fact

| Field | Purpose |
| --- | --- |
| factKey | e.g. `salary.gross.employer[0]` |
| value | number/string |
| provenance | evidenceId or attestationId |
| status | confirmed \| disputed \| missing |

---

## 3. Filing state machine (UX spine)

```
GATE → COLLECT_DOCS → EXTRACT → RECONCILE → CONFIRM_FACTS
  → COMPUTE → REVIEW_RISK → ENTITLE → COMPANION → DONE
```

| State | User sees | Exit criteria |
| --- | --- | --- |
| GATE | 5–8 questions max | Persona supported |
| COLLECT_DOCS | Upload Form16 (+ AIS/26AS) | Min docs for persona |
| EXTRACT | Progress + confidence | No demo values |
| RECONCILE | Mismatch cards | All material issues resolved/attested |
| CONFIRM_FACTS | Prefill review | User confirms low-confidence fields |
| COMPUTE | Regime + tax | Engine success |
| REVIEW_RISK | Notice risks | Acknowledge |
| ENTITLE | Paywall | Paid or free limits |
| COMPANION | Portal steps | User completes ITD |

**Kill list:** Redundant intermediate screens (parsing theater, duplicate review pages).

---

## 4. System architecture (target)

```
[Web/Mobile]
    │
    ├─ BFF (Next.js API)
    │     ├─ Auth / entitlements
    │     ├─ Document service
    │     ├─ Case service (facts, reconcile)
    │     ├─ Companion service
    │     └─ AI orchestrator (tools only)
    │
    ├─ Tax Engine (Python, versioned rules)
    │
    ├─ Object storage (encrypted docs, short TTL)
    ├─ Postgres (Prisma) — cases, payments, audit
    ├─ Redis (rate limits, queues)
    └─ Workers (OCR, parse, webhooks)
```

### API design principles

- Case-centric: `/cases/:id/...`  
- Idempotent payments webhooks  
- Engine: pure function `UserInput → ITRResult` with schema version  
- AI: `/ai/next-question`, `/ai/explain` — never `/ai/compute-tax`

---

## 5. Document upload engine (spec)

### Supported inputs (roadmap)

| Input | V1 | V2 | V3 |
| --- | --- | --- | --- |
| Form16 PDF (multi) | Yes | Yes | Yes |
| AIS JSON/PDF | Yes | Yes | Yes |
| 26AS | Yes | Yes | Yes |
| Groww/Zerodha/Angel/Upstox | No | Yes | Yes |
| Bank interest certs | Manual | Semi | Semi |
| Rent receipts | Tool only | Optional | Optional |

### Pipeline

1. Drag-drop / multi-file  
2. Auto-classify (Form16 Part A/B, AIS, 26AS, CAS, unknown)  
3. Extract with confidence  
4. Normalize to facts  
5. Conflict resolution UI  
6. User confirm < threshold (e.g. 0.85)

### Conflict types

- Form16 salary ≠ AIS salary  
- TDS in 26AS ≠ Form16 TDS  
- Interest in AIS not in user entry  
- Duplicate employers  

---

## 6. Security architecture (target)

| Control | Requirement |
| --- | --- |
| Secrets | Vault/env only; boot fail if missing |
| Passwords | scrypt/argon2 |
| Docs | Encrypt at rest; TTL delete post-AY option |
| PAN | Mask in UI/logs |
| Aadhaar | Avoid storage; never log |
| Payments | Webhook + signature + amount bind |
| Rate limits | Edge + Redis |
| Audit | Append-only event log for case changes |

---

## 7. Scalability notes

- Tax season spike: queue OCR/parse  
- Engine: horizontal workers; cache rule tables not user data  
- Companion: versioned step definitions (ITD UI changes yearly)

---

## 8. Folder structure (target recommendation)

```
/apps/web                 # Next.js
/packages/tax-engine      # Python or WASM bindings
/packages/rules-ay-2026-27
/packages/evidence
/packages/companion-itd
/packages/ai-orchestrator
/packages/ui
/infra
```

Monorepo optional; boundaries mandatory.

---

## Phase 2 exit checklist

- [ ] Evidence graph accepted  
- [ ] State machine accepted  
- [ ] Parser “never invent” policy accepted  
- [ ] System diagram accepted  
- [ ] Proceed to Tax Engine phase  
