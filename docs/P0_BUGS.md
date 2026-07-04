# P0 Bugs — Launch Blockers

**Product:** LastMinute ITR · https://lastminute-itr.vercel.app  
**Audit date:** 2026-07-03  
**Verdict:** **DO NOT LAUNCH** until every item below is fixed and re-verified in production.

---

## P0-1 — Checkout is completely broken for plans sold on the homepage

| Field | Detail |
| --- | --- |
| **Severity** | P0 — Critical |
| **Location** | Landing pricing (`PLAN_LIST` = `normal`, `pro`) vs `POST /api/payments/create-order` (`VALID_PLANS` = `free`, `diy`, `ai_smart`, `ca`) |
| **Runtime evidence** | `POST {"planId":"normal"}` → `{"error":"Invalid plan. Choose free, diy, ai_smart, or ca."}` (same for `pro`) |
| **Why it is bad** | Homepage CTAs sell **Price 1 / Price 2** (`normal` / `pro`). Payment API rejects both. Users cannot buy what they see. |
| **How Stripe would solve** | Single source of truth for product IDs. Checkout cannot render a plan that the order API does not accept. Contract tests on every plan ID. |
| **Recommended fix** | Align plan IDs end-to-end. Either accept `normal`/`pro` in create-order + verify + admin pricing, or change `PLAN_LIST` / landing to `diy`/`ai_smart`/`ca` with real names. Add an integration test: every `PLAN_LIST` id must create an order. |

---

## P0-2 — Razorpay not configured in production; payments cannot complete

| Field | Detail |
| --- | --- |
| **Severity** | P0 — Critical |
| **Location** | `frontend/app/api/payments/create-order/route.ts`, `verify/route.ts` |
| **Runtime evidence** | `POST planId=ai_smart` → `order_mock_*`, `"Razorpay keys not configured"`. `POST /api/payments/verify` with mock order → `{"error":"Payment verification unavailable"}` (503). |
| **Why it is bad** | Create-order falls back to **mock orders even in production** when keys are missing. Verify **blocks** mock in production. Net effect: paywall cannot unlock. Revenue = ₹0. |
| **How Stripe would solve** | Fail closed at create-order if live keys missing. Never issue mock orders when `NODE_ENV=production`. Health check fails deploy if payment provider not configured. |
| **Recommended fix** | Set `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` on Vercel production. Change create-order to return **503** (not mock) when keys missing in production. Re-test full Razorpay checkout end-to-end. |

---

## P0-3 — Pricing copy is unfinished placeholder text

| Field | Detail |
| --- | --- |
| **Severity** | P0 — Critical (trust / conversion) |
| **Location** | `frontend/lib/payments/plans.ts` — live on homepage |
| **Evidence** | Live site shows plan names **"Price 1"**, **"Price 2"**, buttons **"Buy 1"**, **"Buy 2"**, features **"Item 3"**, **"Item 5"**. |
| **Why it is bad** | Looks like an internal staging build. No serious fintech ships placeholder SKUs. Destroys trust instantly. |
| **How Mercury would solve** | Product copy review gate before production promote. Placeholder lint in CI (`Item \d`, `Price \d`, `lorem`, `TODO`). |
| **Recommended fix** | Rename to real products (e.g. DIY / AI Smart / CA Assist). Write real feature bullets. Fix typos ("Your person CA" → "Your personal CA"). |

---

## P0-4 — Price inconsistency across the same page

| Field | Detail |
| --- | --- |
| **Severity** | P0 — Critical (conversion / legal risk) |
| **Location** | Homepage pricing cards vs bottom CTA vs `LAUNCH_OFFER` |
| **Evidence** | Cards: **₹339**. Bottom CTA: **"Start filing for ₹349"**. Offer helper still mentions "AI Smart". Legacy `ai_smart` = ₹349, `normal`/`pro` = ₹339. |
| **Why it is bad** | Users do not know what they will be charged. Consumer protection / unfair trade practice risk in India. |
| **How TurboTax would solve** | One price table, one CTA amount, server-authoritative amount at checkout only. |
| **Recommended fix** | Single published price per plan from admin/pricing config. All CTAs read from that source. Remove hard-coded ₹349/₹339 drift. |

---

## P0-5 — AIS / 26AS / broker uploads return fabricated demo numbers

| Field | Detail |
| --- | --- |
| **Severity** | P0 — Critical (tax accuracy / legal) |
| **Location** | `frontend/app/api/documents/upload/route.ts` — `MOCK_FIELDS` for `ais`, `form26as`, `cams` |
| **Evidence** | Non-Form16 connectors return hardcoded salary ₹12,15,000, FD interest ₹18,400, TDS ₹85,000 with `demo: true`. |
| **Why it is bad** | Landing claims "AIS · Live", "Form 26AS · Live". Users may file wrong numbers if UI does not force a hard stop. Notice risk. |
| **How TurboTax would solve** | Never invent income. Unparsed docs stay empty with explicit "could not read — enter manually". |
| **Recommended fix** | Remove mock field injection for production. Wire real AIS/26AS parsers or mark connectors **Coming soon** and block progression. Surface a blocking banner when `demo: true`. |

---

## P0-6 — Hardcoded third-party API key in source

| Field | Detail |
| --- | --- |
| **Severity** | P0 — Security |
| **Location** | `frontend/app/api/ai/zerogpt/route.ts` line 12 |
| **Evidence** | `process.env.ZEROGPT_API_KEY \|\| "fa17bc2a-df97-437c-8cd3-76ee59a0cc25"` |
| **Why it is bad** | Secret in git history. Anyone can abuse the key. |
| **How Stripe would solve** | Secrets only in vault/env. CI secret scanning. Fail if fallback secret present. |
| **Recommended fix** | Remove hardcoded key. Rotate the exposed key. Require env var; return 503 if missing. |

---

## P0-7 — Password hashing is SHA-256 (not a password KDF)

| Field | Detail |
| --- | --- |
| **Severity** | P0 — Security |
| **Location** | `frontend/lib/auth/b2c.ts`, `frontend/lib/auth/ca.ts`, `frontend/lib/admin/auth.ts` |
| **Evidence** | `crypto.createHash("sha256").update(password).digest("hex")` |
| **Why it is bad** | Fast hashes are GPU-crackable. Tax PII accounts must use bcrypt/argon2/scrypt with salt. |
| **How Stripe would solve** | Argon2id / bcrypt cost ≥12, per-user salt, migration on login. |
| **Recommended fix** | Switch to `bcrypt` or `argon2`. Re-hash on next login. Force password reset for existing users if hashes already leaked. |

---

## P0-8 — Session secrets fall back to known dev strings

| Field | Detail |
| --- | --- |
| **Severity** | P0 — Security |
| **Location** | `frontend/lib/auth/b2c.ts` (`dev-b2c-session-secret`), `ca.ts` (`dev-ca-session-secret`) |
| **Why it is bad** | If `PAYMENT_SESSION_SECRET` is unset in production, anyone can forge session cookies. |
| **How Stripe would solve** | Boot fails without secrets. No default secrets in production builds. |
| **Recommended fix** | Throw at startup if secret missing when `NODE_ENV=production`. Rotate secret. Audit all signed cookies. |

---

## P0-9 — Public blog upload surface

| Field | Detail |
| --- | --- |
| **Severity** | P0 — Security / content integrity |
| **Location** | `/blogs/upload` returns **200** publicly; client-side token gate only |
| **Why it is bad** | Auth is "enter any token and form unlocks" on client; real protection depends on `x-blog-admin-token` server check. Attack surface for content injection / XSS via `dangerouslySetInnerHTML` in article body. |
| **How Mercury would solve** | Admin-only CMS behind SSO. No public upload URL. Sanitize HTML. |
| **Recommended fix** | Remove public route or require admin session. Sanitize blog HTML. Rate-limit `POST /api/blogs`. |

---

## P0-10 — NRI / RNOR explicitly unsupported but tools quiz offers NRI path

| Field | Detail |
| --- | --- |
| **Severity** | P0 — Tax / product honesty |
| **Location** | `backend/engine/profiler.py` rejects NRI/RNOR; `/tools` quiz includes "NRI / RNOR" |
| **Why it is bad** | Users may believe product supports NRI filing. Wrong ITR / wrong residential status = notices. |
| **How TurboTax would solve** | Eligibility gate at entry; unsupported personas blocked with clear message. |
| **Recommended fix** | Block NRI at onboarding with explicit "not supported this year". Remove or disable NRI option in tools quiz until engine supports it. |

---

## Launch gate checklist

- [ ] `normal` and `pro` create-order succeeds (or plans removed from UI)
- [ ] Live Razorpay order + signature verify unlocks companion
- [ ] No "Price 1 / Item 3" copy in production
- [ ] One consistent price on all CTAs
- [ ] No demo/mock income numbers for AIS/26AS
- [ ] ZeroGPT key rotated and removed from repo
- [ ] Password KDF upgraded
- [ ] Production secrets required (no dev fallbacks)
- [ ] Blog upload not public
- [ ] NRI path blocked honestly
