# Security Review — LastMinute ITR

**Date:** 2026-07-03 · **Live:** https://lastminute-itr.vercel.app  
**Overall security score: 2/10** — **not acceptable for tax PII at scale**

---

## Executive summary

This product handles **PAN, Form 16 PDFs, passwords for PDFs, income, and payment entitlements**. Current controls are closer to an MVP hackathon than Stripe/Mercury.

**Do not onboard 1M users** until P0 security items are closed.

---

## Findings

### S-P0-1 — Hardcoded API key

| Field | Detail |
| --- | --- |
| **Severity** | P0 |
| **Location** | `frontend/app/api/ai/zerogpt/route.ts` |
| **Evidence** | Fallback `ZEROGPT_API_KEY` UUID in source |
| **Why bad** | Key theft, quota abuse, supply-chain exposure via git |
| **Stripe** | Secret scanning; no secrets in repo; rotate on leak |
| **Fix** | Remove fallback; rotate key; env-only |

### S-P0-2 — Password storage uses SHA-256

| Field | Detail |
| --- | --- |
| **Severity** | P0 |
| **Location** | `lib/auth/b2c.ts`, `lib/auth/ca.ts`, `lib/admin/auth.ts` |
| **Why bad** | No salt/KDF; rainbow tables / GPU cracking |
| **Stripe** | Argon2id / bcrypt |
| **Fix** | Migrate to bcrypt/argon2; force reset |

### S-P0-3 — Session secret defaults

| Field | Detail |
| --- | --- |
| **Severity** | P0 |
| **Location** | `dev-b2c-session-secret`, `dev-ca-session-secret` |
| **Why bad** | Forged sessions if env missing |
| **Fix** | Fail boot in production without secrets |

### S-P0-4 — Payment path inconsistent / mock in prod path

| Field | Detail |
| --- | --- |
| **Severity** | P0 |
| **Location** | `create-order` returns mock when keys missing; `verify` 503 in production |
| **Runtime** | Confirmed live |
| **Why bad** | Broken commerce; if misconfigured later, risk of entitlement bugs |
| **Fix** | Fail closed; never mock in production; bind planId to Razorpay order notes and verify amount server-side |

### S-P0-5 — Payment signature does not bind amount/plan to order

| Field | Detail |
| --- | --- |
| **Severity** | P0 (logic) |
| **Location** | `verify/route.ts` |
| **Why bad** | Client sends `planId`. Signature proves payment for an order, but code does not re-fetch Razorpay order amount/notes to confirm plan. Attacker could pay for cheaper plan and claim expensive entitlement if order metadata not checked. |
| **Stripe** | Webhook + server-side price verification |
| **Fix** | Store planId in Razorpay `notes`/`receipt`; on verify, fetch order from Razorpay API and assert amount + plan |

### S-P1-1 — Admin edge middleware only checks cookie presence

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | `middleware.ts` |
| **Why bad** | Any cookie named `ts_admin_session` passes edge gate (Node layout may still verify — defense in depth incomplete at edge) |
| **Fix** | Verify HMAC in middleware or use iron-session |

### S-P1-2 — Public blog upload UI

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | `/blogs/upload` |
| **Why bad** | Attack surface; token in header; phishing for admin token |
| **Fix** | Admin-only |

### S-P1-3 — HTML injection via blog body

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | `MarkdownArticleBody.tsx` `dangerouslySetInnerHTML` |
| **Why bad** | Stored XSS if token leaked |
| **Fix** | Sanitize HTML; CSP |

### S-P1-4 — Weak rate limiting

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | In-memory AI limiter only |
| **Why bad** | Auth/upload/payment/compute abuse; cost attacks on LLM |
| **Fix** | Upstash Redis rate limits per IP+route |

### S-P1-5 — File upload controls incomplete

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | `documents/upload/route.ts` |
| **Why bad** | Form16 has file count cap; other connectors accept any file and return stubs. Need MIME/size limits, malware scanning for scale. |
| **Fix** | Max size (e.g. 10MB), PDF-only where expected, virus scan pipeline later |

### S-P1-6 — PDF passwords in transit

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | Upload form `password` field |
| **Why bad** | Often user's PAN. Must be TLS-only (OK on Vercel), never logged (partially scrubbed — good), never stored. |
| **Fix** | Audit logs; ensure no persistence of password |

### S-P1-7 — PII in client draft store

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| **Location** | Zustand/local draft |
| **Why bad** | Shared device risk; XSS exfil risk |
| **Fix** | Encrypt-at-rest optional; clear on logout; short TTL |

### S-P1-8 — No Razorpay webhook handler found

| Field | Detail |
| --- | --- |
| **Severity** | P1 |
| --- | --- |
| **Why bad** | Client-only verify is fragile (tab close, network). Entitlements can desync. |
| **Fix** | Implement `payment.captured` webhook with signature verification |

### S-P2-1 — CSRF

| Field | Detail |
| --- | --- |
| **Severity** | P2 |
| **Notes** | Cookie sessions without `SameSite` audit in this pass. Prefer `SameSite=Lax/Strict` + CSRF tokens for state-changing POSTs. |

### S-P2-2 — Open redirect

| Field | Detail |
| --- | --- |
| **Severity** | P2 |
| **Location** | Admin login `next` query param |
| **Why bad** | If not validated to same-origin paths, phishing risk |
| **Fix** | Allow only relative paths starting with `/admin` |

### S-P2-3 — Payment bypass flags

| Field | Detail |
| --- | --- |
| **Severity** | P2 (becomes P0 if enabled in prod) |
| **Location** | `lib/payments/bypass.ts` |
| **Why bad** | `NEXT_PUBLIC_BYPASS_PAYMENT=true` would unlock paywall for everyone |
| **Fix** | Guard with explicit allowlist; never set on production |

### S-P2-4 — DPDP / erasure

| Field | Detail |
| --- | --- |
| **Severity** | P2 |
| **Location** | `/api/user/erasure`, privacy delete routes exist |
| **Notes** | Good that routes exist; need end-to-end proof they purge Prisma + drafts + uploads |

---

## Auth matrix

| Surface | Mechanism | Issues |
| --- | --- | --- |
| Admin | Cookie `ts_admin_session` | Presence-only at edge; SHA-256 passwords |
| B2C | Cookie `ts_b2c_session` HMAC | Dev secret fallback |
| CA | Cookie session HMAC | Dev secret fallback |
| Blog admin | Header token | Public UI |
| Payments | Payment session cookie | Plan binding weak |

---

## Secrets checklist (ops)

- [ ] `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` set in production
- [ ] `PAYMENT_SESSION_SECRET` strong, unique
- [ ] `DATABASE_URL` with least privilege
- [ ] `ZEROGPT_API_KEY` rotated; no fallback
- [ ] Admin credentials not default `admin1234`
- [ ] No `.env` committed (verify git history)
- [ ] Bypass flags off

---

## Mercury/Stripe launch bar

1. Threat model for PAN/Form16
2. Password KDF + session hardness
3. Payment webhooks + amount verification
4. Rate limits + WAF
5. CSP, sanitization
6. Security review sign-off

**Current state fails the bar.**
