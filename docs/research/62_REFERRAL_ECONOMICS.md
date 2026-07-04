# 62 — Referral Economics (Phase 6)

> Referral is a **trust transfer** loop, not a coupon farm. Rewards unlock after real filing progress, not signup alone.

**Status:** ✅ EXECUTED (Jul 2026)  
**Implements:** Phase 6 exit item — referral economics  
**Code mirror:** `frontend/lib/seo/referralEconomics.ts` + `frontend/lib/admin/referrals.ts` defaults

---

## 1. Trigger (when a referral becomes "earned")

| Event | Counts as success? | Why |
| --- | --- | --- |
| Signup only | No | Too gameable |
| Form16 upload | Soft credit (optional future) | Intent signal |
| Paid plan unlock (companion / CA path) | **Yes — primary** | Real conversion |
| Self-reported e-verify | Yes — secondary bonus (V2) | Retention loop |

**V1 trigger:** referee completes a **paid plan purchase** with a valid referral code.

---

## 2. Economics (V1 defaults)

Aligned with existing admin config (`referrals.ts`):

| Parameter | Value | Notes |
| --- | --- | --- |
| Referee discount | **10%** off paid plan | Applied at checkout via referral code |
| Referrer reward | **100 coins** | Credited after referee payment verifies |
| Max coins per filing | **25** | Caps coin burn so margins hold |
| Coin value | Internal credit only | Not cash-out; not transferable |

Illustrative unit economics (example plan ₹499):

| Line | Amount |
| --- | --- |
| Plan price | ₹499 |
| Referee pays (10% off) | ₹449 |
| Referrer coins (100) | ≤ ₹25 equivalent at max use rate |
| Net before payment fees | ~₹424+ |

**Rule:** referral discount + coin liability must leave **≥60%** of list price after payment fees. If plan prices change, re-run this check before raising rewards.

---

## 3. Fraud controls

| Control | Implementation |
| --- | --- |
| One redemption per referee session/payment | `referralRedemption` row per payment |
| Code ownership | One active code per owner email |
| No self-referral | Owner email ≠ payer email (enforce in redeem path) |
| Device/payment reuse | Flag duplicate payment methods for manual review (V1.1) |
| Caps | Max coin use per filing already enforced |

---

## 4. Messaging (user-facing)

**Referrer:** "Share your code. When a friend unlocks companion prep, you get coins toward your next filing."

**Referee:** "Use a friend's code for 10% off. You still file on incometax.gov.in — we help you prepare."

Banned: "Earn unlimited cash", "Free ITR forever".

---

## 5. Measurement

| Metric | Target (first season) |
| --- | --- |
| K-factor (invites → paid referees) | ≥0.15 |
| Referral share of paid plans | 5–15% (healthy; >30% = too aggressive discount) |
| Fraud rate (blocked redemptions) | <2% |
| Support tickets about referral | <1 per 100 redemptions |

---

## 6. V2 options (not approved yet)

- Give/get fee credit next AY after e-verify self-report
- CA firm referral codes with seat credits
- HR "filing week" batch codes (B2B)

---

## Phase 6 exit — this doc

- [x] Referral economics approved (10% / 100 coins / 25 max use)
