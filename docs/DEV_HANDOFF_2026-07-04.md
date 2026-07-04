# Developer handoff — LastMinute ITR (4 Jul 2026)

Share this file with anyone reviewing or redeploying the work from the research/audit pass and implementation waves on **3–4 Jul 2026**.

**Live production:** https://lastminute-itr.vercel.app  
**Vercel project:** `nikhil-anand-s-projects12/lastminute-itr`

---

## 1. Git — what to pull / review

| Item | Value |
| --- | --- |
| Remote used for push | `nikhiladmin` → `https://github.com/emailnikhil95-collab/NikhilAdmin.git` |
| Branch | `main` |
| Parent before this work | `8909d07` (approx.) |

### Commits (4 Jul 2026)

| Commit | Message |
| --- | --- |
| `34cc83b` | feat: ship ITR-2/3 breadth, Smart CA, Phase 6–7 filing spine |
| `b617215` | fix: resolve B2C/CA session secret from production env |

```bash
git fetch nikhiladmin
git checkout main
git pull nikhiladmin main

# Review range
git log 8909d07..b617215 --oneline
git diff 8909d07..b617215 --stat
git show --name-only 34cc83b
git show --name-only b617215
```

### Production env (already set on Vercel)

- `PAYMENT_SESSION_SECRET` — added 4 Jul (B2C/CA session signing)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — already present (payments + session fallback)
- `ADMIN_SESSION_SECRET`, `ADMIN_USERS`, etc. — pre-existing

B2C/CA auth resolves secrets from `PAYMENT_SESSION_SECRET`, then `RAZORPAY_KEY_SECRET`.

---

## 2. Plans (remaining work)

| Plan | Location |
| --- | --- |
| **Remaining audit gaps (execute next)** | `.cursor/plans/close_original_audit_+_remaining_research_gaps_1c18f00d.plan.md` (on the machine that ran Cursor; copy into repo if needed) |
| Context / older plans | `.cursor/plans/computax_parity_strategy_*.plan.md`, `ai_ca_platform_architecture_*.plan.md`, `lastminute_itr_platform_*.plan.md` |

The **close_original_audit** plan covers leftover work: Razorpay plan/amount binding on verify, connector Live/Soon registry, legacy password upgrade-on-login, admin API session enforcement, engine unknown-key strict mode, fixture regen, more goldens, placeholder CI lint.

---

## 3. Research + audit docs (read first)

### Index

- [docs/research/README.md](./research/README.md) — phase index + status

### Launch audit (original P0s, 3 Jul)

| Doc | Path |
| --- | --- |
| Launch blockers | [docs/P0_BUGS.md](./P0_BUGS.md) |
| Executive audit | [docs/PRODUCT_AUDIT.md](./PRODUCT_AUDIT.md) |
| Full bugs | [docs/BUG_REPORT.md](./BUG_REPORT.md) |
| Security | [docs/SECURITY.md](./SECURITY.md) |
| Conversion | [docs/CONVERSION.md](./CONVERSION.md) |
| Quick wins | [docs/QUICK_WINS.md](./QUICK_WINS.md) |
| P1 backlog | [docs/P1_IMPROVEMENTS.md](./P1_IMPROVEMENTS.md) |
| UI / UX | [docs/UI_REVIEW.md](./UI_REVIEW.md), [docs/UX_REVIEW.md](./UX_REVIEW.md) |
| Performance / tech debt | [docs/PERFORMANCE.md](./PERFORMANCE.md), [docs/TECH_DEBT.md](./TECH_DEBT.md) |

**Note:** Many P0 items in `P0_BUGS.md` are **already fixed in code** (plan IDs, pricing copy, AIS mock removal, scrypt passwords, blog upload redirect, NRI gate, session secret). Treat the checklist as historical unless you re-probe production. Prefer the remaining-work plan above for what is still open.

### Research package (`docs/research/`)

| Area | Files |
| --- | --- |
| Executive | `00_EXECUTIVE_RESEARCH_REPORT.md` |
| Phases 1–6 | `01_PHASE_RESEARCH.md` … `06_PHASE_SEO_MARKETING.md` |
| Deep dives | `10`–`15` (ecosystem, CA, taxpayers, competitors, Computax, tax rules) |
| Architecture | `20`–`23` (evidence graph, state machine, API, security) |
| Tax engine | `30`–`33` (gap audit, validation catalog, goldens, reconcile) |
| UI/UX | `40`–`43` |
| Smart AI CA | `50`–`52` |
| SEO/Marketing | `60`–`63` |
| Engine gaps status | `30_ENGINE_GAP_AUDIT.md` |

---

## 4. Code areas changed (grouped for review)

Full list is in commit `34cc83b` (~300 files). Priority review groups:

### Tax engine (highest priority)

```
backend/engine/rulesets.py              # NEW – per-AY rules
backend/engine/tax_slabs.py
backend/engine/regime_compare.py
backend/engine/orchestrator.py
backend/engine/models.py
backend/engine/capital_gains.py
backend/engine/business_income.py
backend/engine/depreciation.py          # NEW
backend/engine/carry_forward.py         # NEW
backend/engine/house_property.py
backend/engine/deductions.py
backend/engine/salary.py
backend/engine/profiler.py
backend/engine/recommendations.py
backend/api/compute.py
backend/scripts/compute_cli.py
backend/engine/tests/test_golden_ay2026_27.py
backend/engine/tests/test_golden_multiform.py
backend/engine/tests/test_golden_breadth.py
.github/workflows/engine-tests.yml
```

### Filing UX / state machine

```
frontend/lib/filing/stateMachine.ts
frontend/lib/filing/scopeGate.ts
frontend/lib/filing/journey.ts
frontend/lib/filing/routes.ts
frontend/lib/filing/importModes.ts
frontend/components/filing/GateScreen.tsx
frontend/app/(app)/file/start/page.tsx      # GATE
frontend/app/(app)/file/not-yet/page.tsx    # BLOCKED
frontend/app/(app)/file/done/page.tsx       # FILED / VERIFIED / LAPSED
frontend/app/(app)/file/review/page.tsx
frontend/app/(app)/file/companion/page.tsx
```

Many old routes are **redirects** (income, deductions, parsing, bank, tds, advisor, cabrain, comprehensive, onboarding/eligibility → start).

### Smart CA / savings / explanations

```
frontend/lib/engine/deductionDiscovery.ts
frontend/lib/engine/questionEngine.ts
frontend/lib/engine/draftToUserInput.ts
frontend/components/filing/SmartSavingsFinder.tsx
frontend/components/filing/TaxTraceExplainer.tsx
frontend/lib/ai/explainTrace.ts
frontend/lib/ai/killSwitch.ts
frontend/lib/ai/evals/
frontend/lib/store/draft.ts
```

### Auth / sessions (login fix)

```
frontend/lib/auth/b2c.ts
frontend/lib/auth/ca.ts
frontend/lib/auth/password.ts
frontend/lib/auth/sessionSecret.ts
frontend/app/auth/login/page.tsx
frontend/app/api/auth/b2c/
```

### Payments / plans

```
frontend/lib/payments/plans.ts
frontend/app/api/payments/create-order/route.ts
frontend/app/api/payments/verify/route.ts
frontend/lib/payments/session.ts
```

### SEO / marketing foundations

```
frontend/lib/seo/contentCalendar.ts
frontend/lib/seo/marketingDisclaimers.ts
frontend/lib/seo/referralEconomics.ts
frontend/app/robots.ts
frontend/app/sitemap.ts
frontend/app/layout.tsx
```

### Design system / copy

```
frontend/components/ds/
frontend/lib/copy/strings.ts
```

---

## 5. Already live vs still open

### Live on production (as of deploy `b617215`)

- AY 2026-27 tax rulesets + accuracy fixes (Findings 1, 6, 8–12)
- ITR-2/3 breadth: carry-forward losses, multi-property, depreciation
- GATE / BLOCKED / FILED–VERIFIED routes
- SmartSavingsFinder + deduction discovery
- Session secret fix (B2C login)
- Research + audit docs in repo

### Still open (do next — see remaining-work plan)

| Item | Notes |
| --- | --- |
| Razorpay `planId` + amount binding on verify | Order notes + fetch order; prevent entitlement fraud |
| Connector Live/Soon single registry | Upload API + marketing badges + QuickStart |
| Legacy SHA-256 → scrypt upgrade on login | Silent re-hash |
| Admin API session enforcement | Defense in depth on `/api/admin/*` |
| Engine unknown-key strict mode | Finding 7 — CLI/API |
| Fixture regen + more goldens | Finding 3; senior/std-deduction cases |
| Placeholder CI lint | Fail on `Price 1` / `Item 3` patterns |
| Human / compliance | CA interviews, usability study, ITD cross-check, pen-test — not code |

---

## 6. How to verify before / after deploy

```bash
# Engine
cd backend/engine && python3 -m pytest -q

# Frontend (core)
cd frontend && npm run typecheck && npx vitest run lib/filing lib/ai lib/seo lib/engine lib/auth

# Production smoke
curl -sI https://lastminute-itr.vercel.app/
curl -sI https://lastminute-itr.vercel.app/file/start
curl -sI https://lastminute-itr.vercel.app/file/done
# Login UI: https://lastminute-itr.vercel.app/auth/login
```

Payment probe (expect real Razorpay order when keys configured, not `order_mock_`):

```bash
curl -s -X POST https://lastminute-itr.vercel.app/api/payments/create-order \
  -H 'Content-Type: application/json' \
  -d '{"planId":"normal"}'
```

AIS upload must **not** invent income (expect 422 `comingSoon`):

```bash
# multipart upload with connectorId=ais — should fail closed
```

Redeploy (from repo root, linked Vercel project):

```bash
npx vercel --prod --yes
```

---

## 7. Suggested message to paste to a developer

> Pull `main` from NikhilAdmin through commit `b617215`. Review `34cc83b` and `b617215`. Start with `docs/DEV_HANDOFF_2026-07-04.md`, then `docs/research/README.md` and `docs/P0_BUGS.md`. Engine changes are under `backend/engine/`; filing UX under `frontend/lib/filing/` and `frontend/app/(app)/file/`. Remaining work is in the Cursor plan `close_original_audit_+_remaining_research_gaps`. Production is already at https://lastminute-itr.vercel.app — verify login and `/file/start` before redeploying.

---

## 8. Out of scope for this handoff (human / process)

- 5 real CA interviews / 15 user interviews (docs 11–12)
- Doc 43 Figma + 8-user usability study
- Official ITD calculator cross-check for AY 2026-27
- CA sign-off on marginal-relief interpretation
- Full Phase 8 pen-test / DPDP legal pack
