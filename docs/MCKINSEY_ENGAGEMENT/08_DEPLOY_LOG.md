# Phase C — Deploy Log

**Date:** 2026-06-10  
**Agent:** Phase C — Deploy Agent  
**Target:** Vercel preview (project linked: `nikhil-anand-s-projects12/lastminute-itr`)

## Verification (pre-deploy)

| Check | Command | Result |
|-------|---------|--------|
| Lint | `npm run lint` | ✅ Pass |
| Typecheck | `npm run typecheck` | ✅ Pass |
| Build | `npm run build` | ✅ Pass (143 static pages) |
| Unit tests | `npm run test` | ✅ 39 passed, 1 skipped |
| E2E tests | `npm run test:e2e` | ✅ 6 passed |

No blocking fixes required.

## Deployment

| Field | Value |
|-------|-------|
| Command | `npx vercel --yes` |
| Deployment ID | `dpl_CCKzFGJ3CFDBQZSniP6dCQjKbK2c` |
| **Preview URL** | https://lastminute-26i0e7wbk-nikhil-anand-s-projects12.vercel.app |
| Inspector | https://vercel.com/nikhil-anand-s-projects12/lastminute-itr/CCKzFGJ3CFDBQZSniP6dCQjKbK2c |
| Status | READY |
| Production | Not promoted (`vercel deploy --prod` pending founder approval) |

## Smoke test (deployed preview)

| Route | HTTP status |
|-------|-------------|
| `/` | 200 |
| `/file/companion` | 200 |
| `/learn` | 200 |

## Founder commands

```bash
# Preview (repeat)
cd lastminute-itr && npx vercel --yes

# Production promotion
cd lastminute-itr && npx vercel deploy --prod
```

---

## Redeploy — Phase A (expandable content) + Phase B (AI CA UX)

**Date:** 2026-06-10  
**Agent:** Phase C — Deploy Agent  

### Verification (pre-deploy)

| Check | Command | Result |
|-------|---------|--------|
| Lint | `npm run lint` | ✅ Pass |
| Typecheck | `npm run typecheck` | ✅ Pass |
| Build | `npm run build` | ✅ Pass (143 static pages) |
| Unit tests | `npm run test` | ✅ 39 passed, 1 skipped |
| E2E tests | `npm run test:e2e` | ✅ 6 passed |

### Deployment

| Field | Value |
|-------|-------|
| Command | `npx vercel --yes` |
| Deployment ID | `dpl_Dgg8ZZHVC12radRLajQwtLqD6xR5` |
| **Preview URL** | https://lastminute-p32yuvx6v-nikhil-anand-s-projects12.vercel.app |
| Inspector | https://vercel.com/nikhil-anand-s-projects12/lastminute-itr/Dgg8ZZHVC12radRLajQwtLqD6xR5 |
| Status | READY |
| Notes | Includes Phase A expandable content and Phase B AI CA UX (if present in tree) |

### Smoke test (deployed preview)

| Route | HTTP status |
|-------|-------------|
| `/` | 200 |
| `/file/companion` | 200 |
| `/learn` | 200 |

---

## UX fixes redeploy — 2026-06-10

**Agent:** Phase C — Deploy Agent  

### Verification (pre-deploy)

| Check | Command | Result |
|-------|---------|--------|
| Lint | `npm run lint` | ✅ Pass |
| Build | `npm run build` | ✅ Pass (143 static pages) |
| Unit tests | `npm run test` | ✅ 43 passed, 1 skipped |
| E2E tests | `npm run test:e2e` | ✅ 8 passed |

**Fix before deploy:** `RegimeCompareCard` — wrap Zustand object selector with `useShallow` to stop landing-page client crash.

### Deployment

| Field | Value |
|-------|-------|
| Command | `npx vercel --yes` |
| Deployment ID | `dpl_FUfVQK1sP5CYFFeQTLtNJriYEJNj` |
| **Preview URL** | https://lastminute-g99c7w3ep-nikhil-anand-s-projects12.vercel.app |
| Inspector | https://vercel.com/nikhil-anand-s-projects12/lastminute-itr/FUfVQK1sP5CYFFeQTLtNJriYEJNj |
| Status | READY |
| Notes | Regime compare, import page, sign-in layout, header polish |


---

## Deploy — 2026-06-10 (typography, compliance, visual design)

| Check | Command | Result |
|-------|---------|--------|
| Lint | `npm run lint` | ✅ Pass |
| Build | `npm run build` | ✅ Pass (143 static pages) |
| Unit tests | `npm run test` | ✅ 43 passed, 1 skipped |
| E2E tests | `npm run test:e2e` | ✅ 8 passed |

**Fix before deploy:** E2E checkout paywall assertion aligned with disabled plan cards (paywall guard).

### Deployment

| Field | Value |
|-------|-------|
| Command | `npx vercel --yes` |
| Deployment ID | `dpl_ChRhWth8RYbVXUn2ru6th26RGG8f` |
| **Preview URL** | https://lastminute-uruu804fr-nikhil-anand-s-projects12.vercel.app |
| Inspector | https://vercel.com/nikhil-anand-s-projects12/lastminute-itr/ChRhWth8RYbVXUn2ru6th26RGG8f |
| Status | READY |
| Notes | Typography, compliance copy, visual design updates |


---

## Apple UI program deploy — 2026-06-10

| Check | Command | Result |
|-------|---------|--------|
| Lint | `npm run lint` | ✅ Pass (2 img warnings) |
| Build | `npm run build` | ✅ Pass (143 static pages) |
| Unit tests | `npm run test` | ✅ 43 passed, 1 skipped |
| E2E tests | `npm run test:e2e` | ✅ 8 passed |

### Deployment

| Field | Value |
|-------|-------|
| Command | `npx vercel --yes` |
| Deployment ID | `dpl_2Ur3VGbTbZXXVUvkdiRAJSK4ittY` |
| **Preview URL** | https://lastminute-3av06si0f-nikhil-anand-s-projects12.vercel.app |
| Inspector | https://vercel.com/nikhil-anand-s-projects12/lastminute-itr/2Ur3VGbTbZXXVUvkdiRAJSK4ittY |
| Status | READY |
| Notes | Apple UI program deploy |

