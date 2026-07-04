# 61 — Marketing Voice & Disclaimers (Phase 6)

> Marketing inherits product voice (doc 42). This doc adds **channel-specific** rules and **legal disclaimers** so ads, social, and SEO never over-promise.

**Status:** ✅ EXECUTED (Jul 2026)  
**Implements:** Phase 6 exit item — brand voice + disclaimer rules  
**Code mirror:** `frontend/lib/seo/marketingDisclaimers.ts`  
**Parent voice:** [42_CONTENT_VOICE_GUIDE.md](./42_CONTENT_VOICE_GUIDE.md)

---

## 1. Brand narrative (locked)

> Your calm, evidence-linked tax companion for filing on the government portal — built for ordinary Indians, honest about what we don't support.

| We are | We are not |
| --- | --- |
| Prep + reconcile + explain | An e-filing substitute for incometax.gov.in |
| A personal CA *feeling* (questions, proof, calm) | A chatbot that invents tax law |
| Honest about ITR-2/3/4 scope | "Fully automatic for everyone" |
| Estimate-labeled until documents confirm | Guaranteed maximum refund |

---

## 2. Channel voice matrix

| Channel | Tone | Length | Must include |
| --- | --- | --- | --- |
| Learn / SEO | Neighbourhood CA; money first | 800–1,500 words | AY label; CTA to product; disclaimer footer |
| Help center | Procedural, short steps | 200–500 words | Link to learn for depth |
| YouTube / Reels | Calm demo; screen recording | 30s–8 min | "You file on the portal" spoken once |
| LinkedIn (CA) | Professional co-pilot thesis | 100–200 words | No lead-spam claims |
| Paid search | High-intent only | Ad limits | No "guaranteed refund" |
| App UI | Doc 42 microcopy | — | Estimate chip when applicable |

---

## 3. Banned claims (marketing + SEO)

Inherited from doc 42, plus growth-specific bans:

| Banned | Why | Say instead |
| --- | --- | --- |
| Guaranteed refund / maximum refund guaranteed | False | "See your estimate — refund depends on TDS and your facts" |
| We file / auto-submit your ITR | Positioning lie | "Prepare here, file on incometax.gov.in" |
| 100% accurate / ITD approved | Unverifiable | "Engine uses AY 2026-27 rules; always verify on the portal" |
| Instant refund | ITD controls timing | "Track refund status on the portal after e-verify" |
| No CA needed (absolute) | Some cases need CA | "Many salaried cases are DIY; we escalate when scope needs a CA" |
| Beat ClearTax / #1 app | Unprovable / legal risk | Speak to our gaps (AIS reconcile, companion) without naming wars |

CI: `marketingDisclaimers.ts` exports `MARKETING_BANNED_PHRASES` for content tests (same list as product strings where overlapping).

---

## 4. Required disclaimers

### 4.1 Site-wide (footer / TrustFooter)

> LastMinute ITR helps you prepare and understand your return. You submit and e-verify on the Income Tax Department portal. Tax estimates are not a filing. Not financial advice.

### 4.2 Money pages (learn articles with ₹ amounts)

> Figures are for **AY 2026-27** unless noted. Examples are illustrative. Your tax depends on your documents and the portal's computation.

### 4.3 Regime / calculator pages

> Regime comparison is an **estimate** from the facts you entered. Confirm on incometax.gov.in before you submit.

### 4.4 Capital gains / business pages

> ITR-2/3/4 topics can be complex. If you have foreign assets, audit requirements, or unusual losses, consult a Chartered Accountant.

### 4.5 Paid ads

Every ad group must use a sitelink or description line: **"You file on the government portal."**

---

## 5. Honesty invariants (growth)

1. **Companion, not e-file** — every acquisition surface states portal filing.
2. **Estimate chip** — any projected refund/tax uses Estimate language.
3. **Scope honesty** — if persona is out of scope, marketing must not imply we handle it end-to-end.
4. **No fear-mongering** — notices explained, not weaponized ("file or go to jail").
5. **AY labeled** — seasonal pages update or noindex when obsolete.

---

## Phase 6 exit — this doc

- [x] Brand voice + disclaimer rules approved (locked for channels)
- [x] Banned claims list shared with product CI
