# Phase 5 — Performance & resilience

Phase 5 removes heavy client bundles, consolidates debounced compute, lazy-loads the companion wizard, improves engine failure UX, and adds lightweight monitoring hooks.

## 1. Portal steps bundle split

**Before:** `lib/filing/confidence.ts` statically imported `data/portal_steps.json` (~79 KB) for step counts on checkout pages.

**After:**

- `lib/filing/portalStepCounts.ts` — tiny static map (50/53/57/56 steps per form).
- `lib/engine/portalStepsData.server.ts` — server-only JSON loader used by `/api/portal-guide/[form]`.
- Client code fetches personalized guides via `fetchPortalGuide()` / `getPortalGuide()` (GET fallback).

**Verify:** `lib/filing/__tests__/portalStepCounts.test.ts` greps `app/`, `components/`, and `lib/hooks/` for `portal_steps.json` imports.

## 2. Debounced compute

- `lib/engine/recomputeService.ts` — `createDebounced()` + `RECOMPUTE_DEBOUNCE_MS = 300`.
- `lib/hooks/useDraftTaxCompute.ts` — uses shared debounce helper (no inline `setTimeout`).
- Rapid income/deduction edits coalesce into one `/api/compute` call per 300 ms window.

## 3. Lazy-loaded companion wizard

- `app/file/companion/page.tsx` — `next/dynamic` import of `PortalFootprintWizard` with skeleton fallback (`ssr: false`).
- Payment unlock gate unchanged (`usePaymentSession` + redirect to plans).

## 4. Engine fallback UX

- `components/filing/EngineComputeFallback.tsx` — retry + “continue with last calculated figures”.
- `lib/hooks/useTaxCompute.ts` — tracks `lastSnapshot` from last successful compute.
- Wired on: regime, review/risk, payment, companion pages.

When `/api/compute` returns `ENGINE_UNAVAILABLE`, users see a clear message instead of silent ₹0 figures.

## 5. Monitoring hooks

`lib/monitoring/events.ts`:

| Function | Event | Where used |
|----------|-------|------------|
| `trackEngineEvent` | `compute_failure`, `portal_guide_failure` | Client hooks, API routes |
| `trackComputeLatency` | `compute_latency` | `/api/compute` |
| `trackCompanionLoad` | `companion_load` | Companion page |

- **Server:** structured JSON logs via `console.error` / `console.log` with `[monitoring]` prefix.
- **Client (dev):** `console.log` for the same payloads.
- **Production analytics:** hook points ready for PostHog or another provider — no external SDK required in this phase.

## Companion static fallback

If personalized POST to `/api/portal-guide/[form]` fails, companion page falls back to GET `getPortalGuide(form)` and shows a warning banner (checklist without merged compute values).

## Verification commands

```bash
npm run lint
npm run test
npm run build
```

Grep check (should only hit server module + docs/tests):

```bash
rg 'portal_steps\.json' --glob '!docs/**' --glob '!data/**'
```

Expected code hits: `lib/engine/portalStepsData.server.ts`, `lib/filing/__tests__/portalStepCounts.test.ts`, `scripts/generate_portal_steps.py`.
