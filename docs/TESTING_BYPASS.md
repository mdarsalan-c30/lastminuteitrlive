# Testing mode: payment bypass, session reset, and draft logs

## Payment bypass (companion / portal guide)

Unlock the incometax.gov.in companion without Razorpay while testing computation and the filing walkthrough.

### Why the client env var matters

`NEXT_PUBLIC_*` variables are **inlined into the JavaScript bundle at build time**. Setting only `BYPASS_COMPANION_PAYWALL` on Vercel unlocks API routes but **does not** change the pre-submit button label or stop the companion page from redirecting to checkout.

For production testing you must set one of:

- `NEXT_PUBLIC_BYPASS_PAYMENT=true` (recommended), or
- `NEXT_PUBLIC_TESTING_MODE=true`

Then **redeploy** so the new bundle is built.

Local dev also bypasses automatically when `NODE_ENV=development` (no env var required).

### Local

Add to `.env.local`:

```bash
NEXT_PUBLIC_BYPASS_PAYMENT=true
```

Restart `npm run dev`.

### Vercel (preview or production testing)

1. Open **Project → Settings → Environment Variables**
2. Add `NEXT_PUBLIC_BYPASS_PAYMENT` = `true` for **Production** (and Preview if needed)
3. Redeploy — env changes alone are not enough; the client bundle must rebuild

Or via CLI:

```bash
echo "true" | npx vercel env add NEXT_PUBLIC_BYPASS_PAYMENT production
npx vercel deploy --prod --yes
```

Remove or set to `false` before real production launch.

### What changes when bypass is on

| Area | Behavior |
|------|----------|
| Pre-submit checklist CTA | **Open filing guide** → `/file/companion` (skips plans) |
| Checklist not fully green | **Warning banner** shown; CTA still enabled in bypass mode |
| `/file/companion` | Loads without redirect to checkout |
| `GET /api/payments/session` | Returns `verified: true`, `companionAccess: true`, `bypass: true` |
| `POST /api/portal-guide/[form]` | Allowed without payment cookie |
| Razorpay flow | Unchanged when bypass is **off** |

### Verify on production

1. Open https://lastminute-itr.vercel.app in an incognito window
2. Complete filing through **Risk & proof review** (`/file/review/risk#final-check`)
3. Pre-submit CTA should read **Open filing guide** (not "Choose plan & unlock guide")
4. Click it — should land on `/file/companion` with the portal walkthrough (no Razorpay)
5. Works for **estimate mode** and **ITR-4** — companion loads the selected form

## Fresh draft on each browser session

Each **new browser tab session** starts with a clean draft:

- Clears `localStorage` keys `lastminute-itr-draft` and `lastminute-itr-profile`
- Resets Zustand stores to empty defaults (no pre-filled ₹12L salary demo)
- Within the same tab/session, draft changes persist until the tab is closed

Implementation: `lib/store/sessionInit.ts` + `components/SessionBootstrap.tsx` (mounted in root layout).

## Session logging (“excel-like” append log)

Every meaningful event is appended as one JSON line per entry.

### Storage

- File: `data/session_logs.jsonl` (gitignored)
- API: `POST /api/sessions/log`

### Events

| Event | When |
|-------|------|
| `session_start` | First load in a browser tab session |
| `draft_snapshot` | Debounced (~5s) after draft field changes |
| `compute_complete` | Tax engine returns a result |
| `presubmit_green` | Pre-submit checklist turns green |
| `companion_open` | Companion page unlocks |
| `page_leave` | Tab close / navigation away (`pagehide`) |

Each row includes: `id`, `sessionId`, `timestamp`, `event`, `path`, `draft` snapshot, optional `computeResult`, optional `meta`.

### Inspect logs locally

```bash
tail -f data/session_logs.jsonl | jq .
```

On Vercel serverless, the file is ephemeral per deployment/instance — use for dev/staging. For durable production logging, point the API at Blob/KV/Supabase later.

## Quick test checklist

1. Set `NEXT_PUBLIC_BYPASS_PAYMENT=true`, restart dev server
2. Open site in a **new incognito window** → income fields should be empty
3. Fill draft partially — pre-submit CTA still says **Open filing guide** and is clickable
4. Companion loads with portal guide for your ITR form (including estimate / ITR-4)
5. Check `data/session_logs.jsonl` for new lines
6. Run `npm run test:e2e` — `companion loads with payment bypass env` and presubmit bypass tests pass
