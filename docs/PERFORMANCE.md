# Performance Review — LastMinute ITR

**Date:** 2026-07-03 · **Live:** https://lastminute-itr.vercel.app  
**Overall performance score: 5/10** (build healthy; runtime not fully measured)

---

## What we know from production build

Successful Vercel production build (Next.js **15.5.19**):

- Shared First Load JS ≈ **103 kB** (framework baseline — acceptable)
- Heaviest routes from build output:
  - `/learn` — **163 kB** page + **291 kB** first load (content-heavy)
  - `/file/advisor` — **39.3 kB** page + **206 kB** first load
  - `/file/companion` — **13.3 kB** + **187 kB**
  - `/` landing — **18.3 kB** + **146 kB**
- **315** static pages generated (learn/glossary/help SSG — good for SEO, watch build time)
- Middleware ~**34 kB**

Python backend installs via Pipfile on Vercel experimental services — cold start risk for `/api/compute` path.

---

## Risks (not fully Lighthouse-measured)

| Risk | Severity | Location / signal | Why bad | Fix |
| --- | --- | --- | --- | --- |
| Large client components | P1 | `review/page.tsx` (935 lines), `FloatingGenie.tsx` (644), `PortalFootprintWizard.tsx` (616), `FilingLayout.tsx` (570) | Hydration cost, re-renders | Split server/client; memoize; virtualize |
| Content modules as TS | P1 | `lib/content/learn-articles-*.ts` up to **1445** lines | Risk of client bundle inclusion | Keep server-only imports; MDX/DB |
| No measured LCP/CLS | P1 | Marketing hero | Unknown Core Web Vitals | Run Lighthouse CI |
| Compute cold start | P1 | Python engine on Vercel | Slow first tax calc | Keep-warm, or edge-friendly subset |
| In-memory rate limit maps | P2 | `llmService.ts` | Memory growth per instance | External limiter |
| Upload loads full PDF into memory | P2 | `documents/upload` | Large PDFs → timeouts | Size caps, streaming |
| Prisma on every request | P2 | `lib/db/store.ts` | Connection churn serverless | Accelerate / pooler |
| Default images in public | P3 | `public/*.svg` | Minor | Remove unused |

---

## Bundle / chunking recommendations

1. **Dynamic import** advisor, companion wizard, admin editors, markdown editor (`@uiw/react-md-editor`, tiptap).
2. **Route-based splitting** already via App Router — ensure heavy filing widgets are `next/dynamic` with `ssr: false` only when needed.
3. **Do not import** learn article TS into client components.
4. Audit `posthog-js` — load after idle/consent.

---

## Caching

| Layer | Status | Recommendation |
| --- | --- | --- |
| Marketing SSG | Good | Keep |
| Pricing | DB-backed | Cache published pricing in memory with short TTL |
| Compute | Should be uncached | Correct — tax is user-specific |
| Portal guide | Paid | Cache per session entitlement |
| CDN | Vercel default | Add `Cache-Control` on public assets |

---

## Rendering model

- Mix of server and client components — appropriate for Next 15.
- Filing flow is heavily client/state (`draft` store) — expected, but increases JS.
- Prefer server components for marketing, legal, learn.

---

## Performance budget (launch)

| Metric | Budget |
| --- | --- |
| LCP `/` mobile | < 2.5s |
| CLS `/` | < 0.1 |
| INP filing forms | < 200ms |
| `/api/compute` p95 warm | < 800ms |
| `/api/compute` p95 cold | < 3s |
| Upload Form 16 p95 | < 5s |

---

## How Vercel/Linear would operate

- Lighthouse CI on PRs for `/`, `/file`, `/file/checkout/plans`
- Bundle analyzer on CI with max chunk warnings
- Synthetic monitoring for compute latency
- No launch without RUM (PostHog/Vercel Analytics) dashboards
