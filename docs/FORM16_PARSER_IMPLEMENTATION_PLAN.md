# Form 16 Parser — Implementation Plan

**Status:** Planning only — parser not implemented  
**Last updated:** June 2026  
**Owner:** Engineering (Agent 3 / backend)  
**Related:** `app/api/documents/upload/route.ts`, `components/filing/connectors/ConnectorGrid.tsx`, `lib/store/draft.ts`

---

## 1. Current State

### What exists today

| Layer | Reality | Evidence |
|-------|---------|----------|
| Upload UI | Real file picker + POST to API | `ConnectorGrid.tsx` → `POST /api/documents/upload` |
| Parse route | **Mock only** — ignores PDF bytes | `app/api/documents/upload/route.ts` |
| Draft population | **Not wired** — mock fields returned but never merged into `useDraftStore` | Upload response discarded after `setConnectorConnected` |
| Confidence / engine | `has_form16` now tied to `connectedConnectors` (P1-2) | `lib/engine/draftToUserInput.ts` |
| Parsing review page | Static copy + default draft values | `app/file/import/parsing/page.tsx` shows `income.grossSalary` from store defaults (₹12L), not parsed output |
| User disclosure | Amber demo banner on upload grid | `ConnectorGrid.tsx` role="status" banner |

### Mock upload route (evidence)

```typescript
// app/api/documents/upload/route.ts — returns hardcoded fields per connectorId
const MOCK_FIELDS = {
  form16: {
    employer: "Acme Pvt Ltd",
    grossSalary: 1200000,
    tds: 85000,
    section80C: 150000,
  },
  // ...
};
// Response includes demo: true
```

**Implication:** A user can upload their real Form 16 PDF, see "Connected" status, and proceed through the funnel with Acme Pvt Ltd / ₹12L salary — unless they manually edit every field. This is the highest trust risk in the product after payment bypass (P0).

---

## 2. Goal

Replace mock parsing with a **real Form 16 PDF extractor** that:

1. Parses Part A (TDS certificate) and Part B (salary annexure) from employer-issued PDFs
2. Validates extracted fields against schema + sanity bounds
3. Maps validated fields into `useDraftStore` (`income`, `deductions`, `profile`)
4. Sets `connectedConnectors` including `form16` only after successful parse
5. Surfaces confidence per field (high / review / missing) on the parsing review screen
6. Never logs or persists raw PAN in application logs

---

## 3. Form 16 Fields to Extract

### Part A — TDS Certificate (Form 16 / Form 16A structure)

| Field | Maps to draft | Priority | Notes |
|-------|---------------|----------|-------|
| Employer name | `income.employer` | P0 | Match against AIS later |
| Employer TAN | audit metadata only | P1 | Not stored long-term in v1 |
| Employer PAN | validation only | P0 | **Never log**; hash for dedup if needed |
| Employee PAN | validation only | P0 | Compare to user-declared PAN at sign-in (future) |
| Assessment year | `profile.assessmentYear` | P0 | Must match AY 2025-26 |
| Period (from–to) | metadata | P2 | Multi-employer detection |
| Total TDS deducted | `income.tds` | P0 | Cross-check Form 26AS |
| Challan / deposit details | metadata | P2 | Audit trail |

### Part B — Salary Annexure (Annexure I)

| Field | Maps to draft / engine | Priority | Notes |
|-------|------------------------|----------|-------|
| Gross salary (17(1) + perquisites + profits in lieu) | `income.grossSalary` | P0 | Core income head |
| Basic salary | engine `salary.basic_salary` | P1 | HRA calc if Part B has breakup |
| HRA received | engine `salary.hra_received` | P1 | Needs rent + metro flag for exemption |
| Professional tax (16(iii)) | engine `salary.professional_tax` | P1 | |
| Standard deduction | verify only | P2 | Engine computes; use as sanity check |
| EPF / 80C components (Chapter VI-A table) | `deductions.section80C` | P0 | Sum of 80C line items, cap ₹1.5L |
| 80D (health insurance) | `deductions.section80D` | P1 | |
| 80CCD(1B) NPS | `deductions.npsExtra` | P1 | |
| Perquisites taxable | engine `salary.perquisites_taxable` | P2 | |
| LTA | engine `salary.lta_claimed` | P2 | |

### Derived / validation fields

| Derived | Rule |
|---------|------|
| `has_form16` | `true` only after Part A + Part B minimum fields pass validation |
| Multi-employer flag | `salary.multiple_employers` if >1 Form 16 in session |
| Parse confidence | Per-field score based on extraction method + OCR confidence |

---

## 4. Parser Technology Options

| Option | Pros | Cons | Fit for LastMinute ITR |
|--------|------|------|------------------------|
| **pdf-parse** (Node) | Fast, no external API, works on text-based PDFs | Fails on scanned/image PDFs; layout-fragile | Good **Phase 1** for digitally-generated Form 16s (~70% of salaried) |
| **Tabula** (Java CLI / tabula-js) | Strong table extraction for Part B VI-A grid | JVM dependency; awkward on Vercel serverless | Better as **batch/offline** or dedicated parse worker |
| **AWS Textract** | OCR + tables, handles scans, pay-per-page | Cost, latency, AWS account, data leaves VPC | **Production-grade** for mixed PDF quality |
| **Google Document AI** | Form parser models, good table accuracy | GCP setup, cost, vendor lock-in | Alternative to Textract; evaluate on golden fixtures |
| **Custom regex + layout heuristics** | Zero marginal cost, full control | High maintenance per employer template; brittle | Combine with pdf-parse as **fallback layer** |
| **LLM vision (GPT-4o / Claude)** | Handles messy layouts | Cost, hallucination risk, compliance concerns | **Not recommended** for v1 production; OK for dev bootstrap only |

### Recommended approach (phased)

1. **Beta:** `pdf-parse` + regex/heuristics for known TRACES Part A/B labels (English)
2. **Production:** AWS Textract `AnalyzeDocument` (TABLES + FORMS) behind a feature flag for low-confidence or image-only PDFs
3. **Long-term:** Fine-tuned Document AI processor trained on Indian Form 16 corpus

---

## 5. Architecture

```
┌─────────────┐     POST multipart      ┌──────────────────────────┐
│ ConnectorGrid│ ──────────────────────► │ /api/documents/upload     │
│ (client)    │                         │  (route handler)          │
└─────────────┘                         └────────────┬─────────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │ parseForm16Action (internal) │
                                    │  - validate MIME/size        │
                                    │  - extract text/tables       │
                                    │  - map → Form16ParseResult   │
                                    └──────────────┬──────────────┘
                                                   │
                         ┌─────────────────────────┼─────────────────────────┐
                         ▼                         ▼                         ▼
                 ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
                 │ Zod schema    │        │ Draft mapper  │        │ Audit log     │
                 │ validation    │        │ mergeFields() │        │ (no PAN)      │
                 └───────────────┘        └───────┬───────┘        └───────────────┘
                                                  │
                                                  ▼
                                         ┌───────────────┐
                                         │ useDraftStore │
                                         │ + parsing UI  │
                                         └───────────────┘
```

### Proposed file layout

```
lib/parsers/
  form16/
    types.ts              # Form16ParseResult, FieldConfidence
    schema.ts             # Zod validators
    extractPdfText.ts     # pdf-parse wrapper
    extractTables.ts      # Textract adapter (feature-flagged)
    mapToDraft.ts         # Form16ParseResult → Partial<DraftState>
    labels.ts             # TRACES label constants (Part A/B)
app/api/documents/upload/route.ts   # orchestrates parse + respond
app/api/documents/parse/route.ts    # optional: async re-parse
```

### API response shape (target)

```typescript
interface UploadParseResponse {
  success: boolean;
  connectorId: "form16";
  filename: string;
  demo: boolean;                    // false when real parser active
  fields: Record<string, number | string>;
  fieldConfidence: Record<string, "high" | "review" | "missing">;
  warnings: string[];               // e.g. "HRA not found — enter manually"
  parsedAt: string;
}
```

### Draft store mapping

On successful parse, client calls new `mergeParsedFields(connectorId, fields)`:

| Parsed key | Draft path |
|------------|------------|
| `grossSalary` | `income.grossSalary` |
| `tds` | `income.tds` |
| `employer` | `income.employer` |
| `section80C` | `deductions.section80C` |
| `section80D` | `deductions.section80D` |
| `npsExtra` | `deductions.npsExtra` |

Then `setConnectorConnected("form16")` — already implemented (P1-2).

---

## 6. Security & Privacy

| Requirement | Implementation |
|-------------|----------------|
| No PAN in logs | Strip/mask PAN fields before `console.error`; use structured logging with allowlist |
| No PAN in analytics | `form16_upload` event sends filename hash only, not content |
| Transient file handling | Buffer in memory; do not write PDF to disk on Vercel; delete after parse |
| PII retention | Do not store raw PDF in DB v1; store only extracted numbers + employer name |
| Transport | HTTPS only; max upload size 5 MB; `application/pdf` only |
| Rate limiting | Per-IP upload cap (e.g. 10/hour) before parser GA |

---

## 7. Phased Rollout

| Phase | Flag | Behaviour |
|-------|------|-----------|
| **Demo (current)** | `PARSER_MODE=demo` (default) | Mock fields + `demo: true` in response; banners remain |
| **Beta parser** | `PARSER_MODE=beta` | Real pdf-parse; fallback to mock with `demo: true` + warning if parse fails |
| **Production** | `PARSER_MODE=production` | Real parse required; failed parse blocks "Continue" on parsing page |
| **Textract assist** | `PARSER_TEXTRACT=true` | Escalate low-confidence PDFs to Textract |

### Feature flag wiring

```bash
# .env.local
PARSER_MODE=beta          # demo | beta | production
PARSER_TEXTRACT=false
AWS_TEXTRACT_REGION=ap-south-1
```

Gate exact-mode filing (`filingMode: "exact"`) on `PARSER_MODE !== demo`.

---

## 8. Acceptance Criteria

### Beta (MVP)

- [ ] Upload of a **text-based TRACES Form 16** (AY 2025-26) extracts gross salary, TDS, employer name, 80C total within ±₹100 of manual verification
- [ ] Parsing page shows per-field confidence badges; low-confidence fields require explicit user confirm
- [ ] `demo: false` in API response when real parse succeeds
- [ ] `has_form16` in engine input is `true` only after successful parse (already wired via `connectedConnectors`)
- [ ] Failed parse shows actionable error ("Scanned PDF — try downloading from TRACES portal as PDF, not photo")
- [ ] No PAN appears in server logs (verified by log audit test)

### Production

- [ ] ≥90% field accuracy on golden fixture set (20 PDFs, 5 employers)
- [ ] Scanned PDFs handled via Textract with <30s p95 latency
- [ ] Multi-employer: second Form 16 sets `multiple_employers` flag
- [ ] Mismatch detection triggers when parsed TDS ≠ Form 26AS (after 26AS parser)
- [ ] `npm run build && npm run lint` pass; parser unit tests ≥80% branch coverage on `mapToDraft`

---

## 9. Test Strategy

### Golden PDF fixtures

Store in `engine/fixtures/form16/` (git-LFS or CI artifact):

| Fixture ID | Description | Expected gross | Expected TDS |
|------------|-------------|----------------|--------------|
| `f16_text_traces_v1` | Standard TRACES digital PDF | 12,00,000 | 85,000 |
| `f16_hra_breakup` | Part B with HRA line items | varies | varies |
| `f16_scan_lowqual` | Phone photo PDF | — | Textract path |
| `f16_multipage` | 8-page Part B | — | — |
| `f16_ay_mismatch` | Wrong assessment year | — | should reject |

### Test layers

1. **Unit (Vitest):** `mapToDraft`, Zod schema, label regex on extracted text snippets
2. **Integration:** `POST /api/documents/upload` with fixture PDF → response shape + field values
3. **E2E (Playwright):** Upload fixture → parsing page shows correct gross salary (not ₹12L default unless fixture says so)
4. **Regression:** Snapshot of `draftToUserInput` output after parse merge

### CI

- Add `npm run test:parsers` script
- Parser tests run without AWS credentials (skip Textract fixtures)
- Nightly job with Textract credentials on golden scans

---

## 10. Effort Estimate

| Workstream | Size | Notes |
|------------|------|-------|
| pdf-parse + regex extractor (Part A/B core fields) | **M** | 3–5 days |
| Zod validation + draft merge + API response | **S** | 1–2 days |
| Parsing UI (confidence badges, confirm flow) | **M** | 2–3 days |
| AWS Textract integration | **M** | 3–4 days + infra |
| Golden fixtures + test suite | **S** | 2 days |
| Security review (PAN masking, retention) | **S** | 1 day |
| **Total to production** | **L** | ~2–3 weeks one engineer |

---

## 11. Dependencies

| Dependency | Blocker? | Notes |
|------------|----------|-------|
| `pdf-parse` npm package | No | Add to `package.json`; Node runtime on upload route |
| AWS Textract IAM role | For scans | Vercel OIDC → AWS or dedicated parse worker |
| Golden Form 16 PDFs | Yes for QA | Need 10–20 real (redacted) samples from beta users |
| `connectedConnectors` in draft store | **Done** (P1-2) | `setConnectorConnected` on upload |
| Engine field mapping | **Done** (P1-3) | 80TTB via `savings_interest_deduction` for seniors |
| Blob storage (optional) | No for v1 | In-memory parse sufficient initially |

---

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Employer-specific PDF layouts break regex | High | Wrong salary entered | Confidence scoring + mandatory user review on Part B totals |
| Scanned PDFs dominate user uploads | Medium | Parser appears broken | Textract fallback + clear error UX |
| Vercel function timeout (10s) on large PDFs | Medium | Failed uploads | Stream parse; async job + polling for >3MB |
| PAN leakage in error logs | Low | Compliance | Log scrubber middleware; security test |
| User trusts demo numbers | High (today) | Filing errors | Keep demo banners until `PARSER_MODE=production` |
| Multi-employer not detected | Medium | Under-reported salary | Count Form 16 uploads per session |

---

## 13. Out of Scope (v1)

- AIS / Form 26AS parsing (separate plans)
- Hindi/regional-language Form 16 variants
- Auto-submit to ITD ERI
- Persistent document vault / re-download

### Multi-part + password-protected Form 16 (implemented)

Employers often issue Form 16 as separate password-protected PDFs (Part A, Part B, Annexure 12BA). Implementation:

- **UI:** `Form16UploadZone` accepts 1–5 PDFs plus optional password (POST only; never persisted in Zustand/localStorage).
- **API:** `POST /api/documents/upload` accepts multiple `files` parts and optional `password`; merges per-part extraction.
- **Parser:** `parseForm16MultiPart()` merges Part A (TDS/employer), Part B (salary/80C), Annexure (perquisites) with `pdf-parse` v2 `password` option.
- **Review:** Parsing page lists uploaded filenames only.
- **Tests:** Unit merge tests + optional integration when `FORM16_TEST_PASSWORD` env is set (never commit PDFs or PAN). As of June 2026: integration test in `lib/parsers/__tests__/form16.test.ts` reads user-supplied BS50095 Part A/B/Annex PDFs from Downloads when env is set; without it, only filename detection and text-merge paths are covered — not live PDF decryption E2E in CI.

### EY / TRACES layout notes (June 2026)

Employer portals (e.g. EY) often differ from classic TRACES labels:

| Field | EY / TRACES label or location | Parser note |
|-------|------------------------------|-------------|
| Employer | `Name and address of the Employer/Specified Bank` (not only `/Deductor`) | First line after label |
| TDS (Part A) | `Total (Rs.)` summary row; certification `sum of Rs. … has been deducted` | Reject amounts &lt; ₹100 |
| Gross salary (Part B) | `Salary as per provisions contained in section 17(1) (a)`; `(d) Total`; `Total amount of salary received from current employer` | Do **not** match `17` from `section 17(1)` — min gross ₹10,000 |
| 80C | `Deduction in respect of life insurance premia… under section 80C`; `Aggregate of deductible amount under Chapter VI-A` | Skip annexure/Part A for 80C |
| Merge | Part A → employer + TDS; Part B → gross + 80C | `demo_fallback` parts with `missing` confidence never merge into final result |

---

## 14. Next Steps (when implementation starts)

1. Add `lib/parsers/form16/` scaffold with types + Zod schema
2. Replace mock branch in `upload/route.ts` with `parseForm16(buffer)` behind `PARSER_MODE`
3. Wire `ConnectorGrid` `onUploadComplete` → `mergeParsedFields` in draft store
4. Update `app/file/import/parsing/page.tsx` to read parse result + confidence from store
5. Collect 5 beta-user Form 16 PDFs (redacted) → build golden fixture set
6. Ship beta with `PARSER_MODE=beta` on staging; measure parse success rate before production flag
