# Compliance Placement Guide

**Product:** LastMinute ITR — an independent **software companion** that helps Indian taxpayers
prepare their return and **file it themselves** on `incometax.gov.in`.

**Not:** a government entity, not the Income Tax Department (ITD), not a chartered accountancy (CA)
firm by default, not an auto-filing service.

This guide defines **where** each compliance message belongs and **how minimal** it should be. The
goal is honest, legally-safe positioning **without** plastering disclaimers on every screen. Say it
once, in the right place, with the right weight.

---

## Core claims we must never overstate

| # | Claim to control | Correct framing |
|---|------------------|-----------------|
| 1 | Government affiliation | "Independently operated — not affiliated with the Income Tax Department." |
| 2 | CA services | "Not a CA firm unless you purchase a CA review plan and a named professional confirms." |
| 3 | Who files | "You file and e-verify on incometax.gov.in yourself. We never auto-submit." |
| 4 | Refund / tax figures | "Estimates are illustrative. Final amounts are determined by ITD. No guaranteed refund." |
| 5 | Data / privacy | "Handled per our Privacy Policy with reasonable safeguards; DPDP-aligned." |
| 6 | Optimization | "Lawful optimization only — no concealment or false deductions." |

---

## Placement map (say it once, where it matters)

### 1. Global footer — `components/marketing/SiteFooter.tsx`
The **single source of the full compliance notice**. Every page that renders the footer inherits it.

- One paragraph "Compliance notice" covering: independently operated, not a CA firm unless CA plan,
  you file/e-verify on `incometax.gov.in`, estimates illustrative, no guaranteed refund, data per
  Privacy Policy.
- **Legal link cluster:** Privacy Policy · Terms & Conditions · Refund Policy · Disclaimer.
- **Do not** repeat this full block elsewhere — link to it instead.

### 2. Hero — `app/page.tsx` + `components/marketing/HeroNameForm.tsx`
Keep it light. The hero sells; it should not read like a legal page.

- **Hero subtext** (`COMPANION_HERO_SUBTITLE` in `lib/copy/companion.ts`): one sentence —
  "We prepare your return and guide you screen-by-screen … you file and submit yourself. We never
  auto-submit to the Income Tax Department." This carries claims **3** inline, naturally.
- **Hero form microcopy** (`HeroNameForm`): "Free estimate · No card required · Takes under 15
  minutes" — conversion microcopy, not compliance. Leave as-is.
- **Do not** add separate ITD/CA disclaimers in the hero copy; they live in the trust strip + footer.

### 3. Trust strip — ONE consolidated strip only
Use a **single** `SocialProofBar` (`components/marketing/SocialProofBar.tsx`) rendered once in the
hero. It wraps `TrustBar` (claims **6, 5, 3**: "Lawful optimization only · DPDP compliant · No
auto-submit to ITD") plus a short Razorpay security line.

- **Remove duplicate strips.** Do not render security/trust badges twice on the same page. The
  now-removed `SecurityStrip` and `TrustRow` components were duplicates and were deleted.
- If a security claim (encryption, Razorpay) is needed, add it to the one strip — never a parallel one.

### 4. Companion explainer — `components/marketing/CompanionModeCallout.tsx`
This is where claim **3** is explained in depth (it's the product's core honesty point).

- 3-step "How LastMinute works" (Prep → Pay to unlock → You file).
- `COMPANION_ITD_DISCLAIMER`: "Independently operated — not affiliated with the Income Tax
  Department." (claim **1**)
- FAQ accordion answering "Do you file for me?", "Refund guarantee?", "Why not auto-submit?"
  (claims **3, 4**).

### 5. Checkout / paywall — `app/file/checkout/payment/page.tsx` + `components/filing/PaywallValueStack.tsx`
Point-of-sale is where acceptance and "what you're buying" must be unambiguous.

- **One-liner before the pay button** (required): "By paying you agree to our **Terms** and
  **Refund Policy**. This unlocks your portal filing guide — you file and e-verify on
  incometax.gov.in yourself." (links claims **3** + terms acceptance).
- Paywall value stack: state plainly that payment unlocks the **guide**, **not** government
  submission (`COMPANION_PAYWALL_SUBTITLE`, `COMPANION_ITD_DISCLAIMER`).
- Tax/refund numbers on this page must be labelled **estimate** with "final amount confirmed only
  after ITD processes your return" (claim **4**).

### 6. Estimate entry — `components/filing/import/QuickEstimateForm.tsx`
Whenever we show a number derived from rough inputs, label it.

- **Estimate-mode disclaimer** (required, at the bottom of the form): "Estimate mode: figures shown
  are illustrative … final tax or refund is determined by the Income Tax Department … we do not
  guarantee any refund." (claim **4**).

### 7. Dedicated legal pages — `app/{terms,privacy,refund-policy,disclaimer}/page.tsx`
The full, authoritative text. All shorter microcopy above should be consistent with these and link
to them rather than restating.

- **Terms & Conditions** (`/terms`): the master agreement — claims **1–6**, payments/taxes, refund
  cross-reference, third parties (Razorpay, portal), DPDP cross-reference, limitation of liability,
  indemnity, governing law (India).
- **Privacy Policy** (`/privacy`): what we collect, DPDP rights, no card storage (claim **5**).
- **Refund Policy** (`/refund-policy`): plan refunds vs ITD refunds, eligible/non-refundable.
- **Disclaimer** (`/disclaimer`): government affiliation, CA scope, filing responsibility, no
  guaranteed refund, lawful optimization, illustrative reviews.

---

## Anti-patterns (what NOT to do)

- ❌ Repeating the full footer compliance paragraph inside the hero or every filing step.
- ❌ Two trust/security strips on one page (the duplication this guide exists to prevent).
- ❌ Showing a refund/tax number anywhere without an "estimate / determined by ITD" label.
- ❌ Wording like "we file your ITR", "guaranteed refund", "approved by ITD", or implying CA service
  on non-CA plans.
- ❌ A pay button with no Terms/Refund acceptance line next to it.

## Single-source-of-truth copy
Reusable strings live in `lib/copy/companion.ts` (e.g. `COMPANION_HERO_SUBTITLE`,
`COMPANION_ITD_DISCLAIMER`, `COMPANION_PAYWALL_SUBTITLE`). Edit copy there so every placement stays
consistent.

---

## Checklist for any new screen

1. Does it show a tax/refund number? → add the **estimate** label (claim 4).
2. Does it take payment? → add the **Terms + Refund** acceptance one-liner (and link).
3. Does it imply we file or are a CA/government? → reword to companion / independent framing.
4. Does it render the footer? → don't duplicate the compliance paragraph.
5. Adding a trust badge? → put it in the one existing strip, not a new one.
