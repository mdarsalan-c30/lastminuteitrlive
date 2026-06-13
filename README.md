# LastMinute ITR

India ITR filing super-app — import-first reconciliation, lawful optimization, and CA-level pre-submit checks.

Built on **Next.js App Router** with shadcn/ui, Razorpay payments, and the Python tax engine in `../itr-filing-wireframes/sources/engine`.

## Quick start

```bash
cd lastminute-itr
cp .env.example .env.local   # optional — mock payments work without keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RAZORPAY_KEY_ID` | No | Razorpay API key — mock orders used if missing |
| `RAZORPAY_KEY_SECRET` | No | Razorpay secret for order creation & signature verify |
| `NEXT_PUBLIC_APP_URL` | No | Public URL for SEO/sitemap (defaults to localhost in dev) |

See `.env.example` for placeholders.

## Marketing routes (indexed)

| Path | Purpose |
|------|---------|
| `/` | Landing — hero, regime compare, quick start, reviews, pricing |
| `/learn` | ITR guides (4+ articles) |
| `/glossary` | Plain-English tax terms from engine |
| `/reviews` | Testimonials + feedback form |

Filing flow under `/file/*` is **noindex** via `vercel.json` and `robots.ts`.

## Filing routes (Agent 2+)

| Path | Purpose |
|------|---------|
| `/file` | Filing entry |
| `/file/import/documents` | Connector grid |
| `/file/checkout/plans` | Plan selection |
| `/file/checkout/payment` | Razorpay checkout (wired from plans) |
| `/file/checkout/tracker` | Post-submit lifecycle |

## API endpoints

- `POST /api/compute` — tax engine (Python bridge)
- `POST /api/payments/create-order` — Razorpay order (`planId`: free | diy | ai_smart | ca)
- `POST /api/payments/verify` — signature verify (mock for dev orders)
- `POST /api/documents/upload` — multipart upload, mock parsed fields
- `POST /api/feedback` — user feedback from `/reviews`

Paywall helpers in `lib/payments/access.ts`: `canExportCompanion(plan)`, `canUseMismatchEngine(plan)`.

## Plans (`lib/constants.ts`)

| Plan | Price |
|------|-------|
| Free | ₹0 |
| DIY | ₹499 |
| AI Smart | ₹899 |
| CA | ₹2,499 |

## Deploy on Vercel

```bash
npm i -g vercel
cd lastminute-itr
vercel link
vercel env pull .env.local
vercel --yes          # preview
vercel --prod --yes   # production
```

Marketing pages are indexable; `/file/*` gets `X-Robots-Tag: noindex` from `vercel.json`.

## Agent ownership

| Agent | Scope |
|-------|-------|
| 1 | Foundation, marketing site, shared layout/constants |
| 2 | Filing pages, stepper, `components/filing/*` |
| 3–4 | APIs, reconcile, payments, connectors |

## Engine tests

```bash
cd ../itr-filing-wireframes/sources/engine
pip install pytest
pytest
```
