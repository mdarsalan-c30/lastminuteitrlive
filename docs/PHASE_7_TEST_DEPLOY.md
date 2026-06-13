# Phase 7 — Testing, CI & deploy gate

Phase 7 adds automated coverage, E2E smoke, CI for Node + Python engine, a manual QA matrix, and a predeploy gate. It does **not** deploy to production by itself.

---

## Automated tests

### Unit / integration (Vitest)

```bash
npm run test
```

Coverage highlights:

| Area | Test file |
|------|-----------|
| Payment verify mock path | `lib/payments/__tests__/verifyRoute.test.ts` |
| Portal guide API | `lib/api/__tests__/portalGuideRoute.test.ts` |
| AI routes fallback (no keys) | `lib/api/__tests__/aiRoutes.test.ts` |
| Journey step derivation | `lib/filing/__tests__/journey.test.ts` |
| Copy / trust constants | `lib/copy/__tests__/trust.test.ts` |

### E2E (Playwright)

```bash
# First time: install browser
npx playwright install chromium

# Option A — CI-style (dev server; required for mock payment E2E)
CI=1 npm run test:e2e

# Option B — local dev server already running on :3000
npm run dev   # separate terminal
npm run test:e2e
```

Playwright config (`playwright.config.ts`):

- Boots `npm run dev` (non-production) so `order_mock_` payment verify works in E2E.
- **Local:** reuses an existing dev server on port 3000 if present.
- **CI:** sets `CI=true`, always starts a fresh dev server.
- Run `npm run build` separately in predeploy/CI — E2E does not use `next start`.

Key specs:

| Spec | What it covers |
|------|----------------|
| `e2e/smoke.spec.ts` | Landing, import paths, regime, eligibility, chat |
| `e2e/payment-companion.spec.ts` | Payment page → mock verify → companion walkthrough |

**Mock payment bypass (E2E & dev only):**

- Non-production `NODE_ENV`
- No `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
- Order id prefix `order_mock_` (see `app/api/payments/verify/route.ts`)

Production with missing keys returns **503** — mock path is never used in production.

---

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

| Job | Steps |
|-----|--------|
| `node` | `npm ci` → lint → typecheck → test → build → Playwright E2E |
| `engine` | Python 3.12 → `pip install pytest` → `pytest tests/ -q` → `python tests.py` |

Path-filtered workflow `.github/workflows/engine-tests.yml` still runs on `engine/**` changes for faster feedback on engine-only PRs.

### Python CI skip conditions

Python tests are **skipped** locally in `predeploy` when:

- `python3` is not installed, or
- `pytest` is not installed (`pip install pytest`)

They always run in GitHub Actions `engine` job (no secrets required — pure stdlib + local engine modules).

---

## Predeploy gate

Run before promoting to production:

```bash
npm run predeploy
```

This executes `scripts/predeploy-check.sh`:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build`
5. Python engine tests (optional if pytest available locally)

---

## Production deploy checklist

Do **not** deploy until all items below are complete.

### Automated (required)

- [ ] `npm run predeploy` passes locally or in CI
- [ ] GitHub Actions `CI` workflow green on the target commit (`node` + `engine` jobs)
- [ ] E2E smoke passes (`npm run test:e2e` after build)

### Configuration (required for live payments)

- [ ] `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` set in production env
- [ ] `PAYMENT_SESSION_SECRET` (or `RAZORPAY_KEY_SECRET`) set for signed payment cookies
- [ ] `NODE_ENV=production` on the hosting platform
- [ ] AI keys (`AI_API_KEY` / `GEMINI_API_KEY`) set if LLM features are desired — app degrades to rules without them

### Manual QA (required)

- [ ] Complete [`MANUAL_TEST_MATRIX.md`](./MANUAL_TEST_MATRIX.md) (18 scenarios) on staging/preview
- [ ] Verify real Razorpay test payment on staging (not `order_mock_`)
- [ ] Spot-check companion export/copy after live verify

### Deploy (when credentials exist)

Use your platform’s normal deploy path (e.g. Vercel/Netlify). This repo does not auto-deploy from Phase 7.

```bash
# Example: verify gate, then deploy via your host CLI
npm run predeploy
# vercel deploy --prod   # only when env vars and QA are done
```

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| E2E payment test fails | Dev server not built; run `npm run build` first, or set `CI=1` |
| `verify` returns 503 in dev | `NODE_ENV=production` without Razorpay keys |
| Companion redirects to plans | Payment session cookie missing or plan is `free` |
| Engine CI fails | Python syntax/test regression under `engine/tests/` |
| Playwright timeout on regime | Engine subprocess slow — increase timeout or seed snapshot in test |

---

## Related docs

- [`MANUAL_TEST_MATRIX.md`](./MANUAL_TEST_MATRIX.md) — 18-scenario QA checklist
- [`PHASE_6_COPY_TRUST.md`](./PHASE_6_COPY_TRUST.md) — trust copy constants under test
- [`PHASE_4_COMPANION_SOP.md`](./PHASE_4_COMPANION_SOP.md) — companion behavior
