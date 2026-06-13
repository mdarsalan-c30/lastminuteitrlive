# Compliance, Payment & Copy Honesty Audit

**Agent 5 — Audit Date:** 2026-06-10  
**Scope:** `lastminute-itr` — full codebase  
**Verdict:** **PARTIAL PASS** — Core compliance posture is strong; four actionable issues require fixes before public launch.

---

## §1 — Risky Terms Code Search

Search executed across all `*.ts`, `*.tsx`, and `*.md` files (excluding `node_modules`, `.next`, `.git`).

| Term | Result | Location | Risk |
|---|---|---|---|
| `guaranteed refund` | **NOT in product code** | Mentioned in `docs/TRUST_CONVERSION.md` as an explicit anti-pattern to avoid | ✅ PASS |
| `maximize refund` / `maximum refund` | **NOT in product code** | `docs/COMPETITOR_ANALYSIS.md` lists it as competitor anti-pattern | ✅ PASS |
| `government approved` | **NOT found anywhere** | — | ✅ PASS |
| `official integration` | **NOT found anywhere** | — | ✅ PASS |
| `auto.fil[e]` | **NOT a claim in UI** | `docs/FILING_EXPERIENCE_REDESIGN.md` uses "auto-fill" as an internal feature name; product explicitly says "no auto-submit" in every user-facing surface | ✅ PASS |
| `submit automatically` | **NOT found anywhere** | — | ✅ PASS |
| `CA replacement` | **NOT found anywhere** | — | ✅ PASS |
| `instant refund` | **NOT found anywhere** | — | ✅ PASS |
| `loophole` | **NOT in product code** | `docs/COMPETITOR_ANALYSIS.md` lists it as competitor anti-pattern to avoid | ✅ PASS |
| `100% accurate` | **NOT found anywhere** | — | ✅ PASS |
| `fully automated parser` | **NOT found anywhere** | — | ✅ PASS |
| `direct filing` | **NOT found anywhere** | — | ✅ PASS |
| `Phase 2` | **NOT found in product code** | — | ✅ PASS |
| `submitted` | One UI occurrence | `app/file/import/mismatch/page.tsx:24`: "Submit stays disabled until critical mismatches are resolved" — refers to wizard progression, not ITD submission | ✅ PASS |
| `ACK` | One disclosure occurrence | `app/file/checkout/tracker/page.tsx:16`: explicitly says "We do not receive submission or **ACK** status from ITD" | ✅ PASS |

**Section verdict: PASS** — No prohibited claims found in any user-facing copy.

---

## §2 — Auto-File / No-Submit Claims Audit

All user-facing auto-submit disclaimers verified:

| Location | Copy | Assessment |
|---|---|---|
| `app/page.tsx:44` | "Import Form 16 and AIS…before you reach incometax.gov.in — **no auto-submit**" | ✅ Prominent, on landing hero |
| `app/file/companion/page.tsx:92–96` | Badge: "**Companion mode · Manual filing on ITD portal**" | ✅ In-app, persistent badge |
| `app/file/companion/page.tsx:108–119` | Banner: "**We do not submit your return for you.** Open incometax.gov.in in another tab…" | ✅ Inline banner with live link |
| `app/file/checkout/payment/page.tsx:49–52` | Banner: "**We do not submit to the Income Tax Department in this release.**" | ✅ Pre-payment, prominent |
| `app/file/checkout/payment/page.tsx:69` | Footer line: "No government submission from this app" | ✅ Below CTA |
| `app/file/checkout/everify/page.tsx:21` | Subtitle: "We do not submit or verify returns for you" | ✅ At e-verify step |
| `app/file/checkout/tracker/page.tsx:16` | Subtitle: "We do not receive submission or ACK status from ITD" | ✅ At tracker step |
| `components/marketing/SecurityStrip.tsx:17` | Badge: "**We never file for you**" · tooltip: "No ERI auto-submit in this release" | ✅ Hero + landing |
| `components/marketing/TrustBar.tsx:8` | Pill: "**No auto-submit to ITD**" | ✅ Social proof bar |
| `components/marketing/TrustRow.tsx:8` | Inline: "No auto-submit to ITD" | ✅ Footer-level |
| `components/marketing/SiteFooter.tsx:17` | "…before you submit on incometax.gov.in" — user submits, not us | ✅ Clear agency attribution |

**Section verdict: PASS** — Disclaimer coverage is comprehensive and consistent across all 10 surfaces.

---

## §3 — Refund Copy Qualification

| Location | Copy | Assessment |
|---|---|---|
| `app/file/checkout/payment/page.tsx:30` | "**Estimated refund (if ITD accepts your return):** ₹17,000" | ✅ Properly qualified |
| `app/file/checkout/tracker/page.tsx:33–38` | "Estimated refund (if ITD accepts your return): ₹17,000" + "**Final amount confirmed only after ITD processes your return.**" | ✅ Double qualification |
| `components/marketing/QuickStart.tsx:35–36` | `DashboardMock` shows "Estimated refund" label with `₹18,420` | ⚠️ **ISSUE #1** — no "(if ITD accepts)" qualifier in the marketing landing mock. The filing flow correctly qualifies this; the hero dashboard illustration does not. Low risk since it's labelled "Estimated refund", but inconsistent with the filing flow wording. |
| `lib/constants.ts:13–16` | `DEMO_REGIME_TAX: { old: 82429, new: 65913 }` — used for comparison, not presented as a refund | ✅ Not a refund claim |

**Section verdict: PARTIAL** — See Issue #1 (QuickStart dashboard mock).

---

## §4 — Demo Parser Disclosure

| Location | Disclosure | Assessment |
|---|---|---|
| `components/filing/connectors/ConnectorGrid.tsx:218–223` | Amber role="status" banner: "**Demo parsing.** Uploaded files use sample numbers for preview only — verify every figure against your documents before filing. Real Form 16 and AIS parsing is coming soon." | ✅ Prominent, first visible element |
| `app/api/documents/upload/route.ts:53–55` | API response includes `demo: true` and message: "Demo parsing — sample numbers only. Verify against your documents before filing." | ✅ Machine-readable flag + human message |
| `components/filing/connectors/ConnectorGrid.tsx:298–314` | After upload: "**Sample parse — {filename}** · Demo data only. Confirm amounts match your actual documents." | ✅ Post-upload confirmation |
| `app/file/import/parsing/page.tsx:20–21` | Subtitle: "We imported 18 fields with high confidence. Please review 3 fields marked for confirmation." | ⚠️ **ISSUE #2** — This page does NOT repeat the demo disclaimer. A user arriving here from ConnectorGrid sees "18 fields imported with high confidence" — which could be read as real parsing results, not demo data. The ConnectorGrid disclosure is upstream but the parsing result screen should reinforce it. |

**Section verdict: PARTIAL** — See Issue #2 (parsing page missing demo caveat).

---

## §5 — Razorpay Payment Integration Audit

### Order Creation (`app/api/payments/create-order/route.ts`)
- ✅ Validates `planId` against `VALID_PLANS: ["free", "diy", "ai_smart", "ca"]` — rejects invalid plans with 400
- ✅ Free plan returns mock order without hitting Razorpay API
- ✅ Calls `createRazorpayOrder(amountPaise, receipt)` when keys are present
- ✅ Falls back to mock order (not error) when `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are unset — appropriate for dev
- ✅ Returns `mock: true` flag so client can distinguish real vs mock
- ✅ Never exposes `RAZORPAY_KEY_SECRET` in response — only returns `keyId` (public key)

### Signature Verification (`lib/payments/razorpay.ts`)
- ✅ Uses `crypto.createHmac("sha256", secret).update("orderId|paymentId").digest("hex")` — correct Razorpay signature algorithm
- ✅ Secret compared via `expected === signature` (timing attack risk is low for HMAC comparison; crypto-level concern, not a copy/compliance concern)

### Verify Route (`app/api/payments/verify/route.ts`)
- ✅ Validates `razorpay_order_id` presence before proceeding
- ✅ Calls `verifyPaymentSignature()` with server-side `RAZORPAY_KEY_SECRET`
- ✅ Returns `{ verified: false }` on invalid signature with 400
- ⚠️ **ISSUE #3 — Mock bypass is client-controllable**: Line 27: `if (mock || razorpay_order_id.startsWith("order_mock_") || razorpay_order_id.startsWith("order_free_"))` — the `mock` flag comes from the client POST body. A malicious user can POST `{ mock: true, razorpay_order_id: "order_mock_x", planId: "ca" }` directly to `/api/payments/verify` and receive `{ verified: true }`, then set their localStorage accordingly to bypass access gating. The bypass is not guarded by a server-side `NODE_ENV` or `RAZORPAY_KEY_ID` check. **In production this must be removed or restricted to `!hasRazorpayKeys()` only.**

### Client Button (`components/filing/checkout/RazorpayButton.tsx`)
- ✅ `handlePay`: creates order → loads Razorpay JS → opens checkout → calls `verifyPayment` in `handler` callback
- ✅ `verifyPayment`: calls `/api/payments/verify` and checks `data.verified`
- ✅ Mock path used only when `plan.price === 0 || order.mock` (free plan or dev without keys)
- ✅ Loading state managed correctly, button disabled during processing
- ✅ Payment label: "Pay ₹{price} & **unlock filing guide**" — accurate, no filing/submission claim

**Section verdict: PARTIAL** — See Issue #3 (mock bypass in verify route).

---

## §6 — Companion Export Gating

| Check | Implementation | Assessment |
|---|---|---|
| Access function | `lib/payments/access.ts:15–19`: `hasCompanionExportAccess()` requires `paymentVerifiedAt != null` AND plan is `diy`, `ai_smart`, or `ca` | ✅ Correct logic |
| Export check in companion | `app/file/companion/page.tsx:42–46`: calls `hasCompanionExportAccess({ plan, paidPlanId, paymentVerifiedAt })` — derived from `useDraftStore` | ✅ Used correctly |
| UI gate in PortalGuideTable | `components/filing/companion/PortalGuideTable.tsx:66`: `paymentLocked = !exportUnlocked` | ✅ Gate applies |
| Values blurred | Line 276: `{paymentLocked ? "••••••" : displayValue(step.ourValue)}` | ✅ Blurred when locked |
| Copy button locked | Line 291–293: `disabled={exportBlocked || …}` | ✅ Disabled when locked |
| Print gated | Line 119–126: `disabled={exportBlocked}` on Print/Export button | ✅ Disabled when locked |
| Mismatch gate | Line 67: `exportBlocked = paymentLocked || blockExport || mismatches.length > 0` | ✅ Mismatch blocks export even when paid |
| Pre-submit gate | `app/file/checkout/plans/page.tsx:48–50,104–108`: checkout locked if `!filingReady` | ✅ Cannot pay unless filing confidence ready |
| ⚠️ Client-side-only | `useDraftStore` persists to `localStorage` (draft.ts:179). `paymentVerifiedAt` and `paidPlanId` are client-side state. A user who modifies localStorage can unlock copy/print without a real server-validated payment token. | ⚠️ **ISSUE #4 — No server-side session token** — Access control is entirely client-enforced. Production should validate payment server-side (e.g., session or JWT after verify success) rather than trusting localStorage state. |

**Section verdict: PARTIAL** — See Issue #4 (client-side-only access gating).

---

## §7 — `.env.example` Review

```
# Razorpay — required for live payments (mock orders used when unset)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here

# Public app URL for callbacks (optional in dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- ✅ No real credentials in example file — only placeholder values
- ✅ Comments accurately describe dev fallback behaviour
- ✅ `rzp_test_` prefix makes test key visually clear
- ✅ Only two env vars — minimal surface

**Section verdict: PASS**

---

## §8 — CA Plan Claims & CaBrain Disclaimer

| Location | Copy | Assessment |
|---|---|---|
| `lib/payments/plans.ts:57–67` | CA plan: "Chartered Accountant review before you file on the portal" · feature "Expert sign-off", "Notice-risk review", "48-hour turnaround" | ⚠️ These are sold on the checkout page but the feature is not yet live (see below). |
| `app/file/cabrain/page.tsx:24–29` | Banner: "**Coming soon — CA Review plan.** We are not showing automated tax answers yet. When live, a Chartered Accountant will review profession-specific savings…before you file on the government portal." | ✅ Clear coming-soon disclosure inside the cabrain flow |
| `app/file/cabrain/page.tsx:20` | Subtitle: "Profession-specific lawful deduction checks with CA sign-off — **launching soon** on the CA Review plan." | ✅ "Launching soon" qualifier present |

**Gap:** The CA plan card on `app/file/checkout/plans/page.tsx` and `components/marketing/PricingSection` shows "Expert sign-off" and "48-hour turnaround" as active features. Users can select the CA plan and proceed to payment. The CA-specific feature (CaBrain) is gated with a "coming soon" disclaimer only after checkout, not on the plan card itself. This could constitute a misleading feature claim if a user pays expecting CA review and doesn't proceed to the cabrain page.

**Recommendation:** Add "(launching soon)" to the CA plan feature list or disable CA plan selection until the feature is live.

**Section verdict: PARTIAL** (minor — disclosure exists but is post-payment)

---

## §9 — Social Proof & Verified Filer Count

| Finding | Location | Assessment |
|---|---|---|
| `VERIFIED_FILER_COUNT = 6` shown as "6 verified filers this season" | `lib/constants.ts:24–26` · `components/marketing/TrustBar.tsx:42–43` | ⚠️ Code comment: "Verified filers from seeded testimonials — update when real analytics exist." This is **seeded/illustrative data displayed as a real metric**. Six testimonials from `lib/content/testimonials.ts` are all clearly illustrative personas (e.g., "Priya Sharma, Product manager, Bengaluru"). |
| `AGGREGATE_RATING = 4.8` shown as "4.8/5 average rating" | `lib/constants.ts:26` · `components/marketing/TrustBar.tsx:51–53` | ⚠️ Hardcoded, not from real analytics. Displayed in the TrustBar as a factual claim. |
| Testimonial personas | `lib/content/testimonials.ts` | Illustrative testimonials (no real user attribution). Testimonials like "Regime compare matched my spreadsheet within ₹200" and "CA review caught a Schedule CG error from Zerodha trades" are product scenarios without disclosure they are illustrative. |
| `docs/TRUST_CONVERSION.md` | "Avoid: Anonymous 5-star walls; 'Guaranteed refund'; unverifiable '10,000+ users' until backed by analytics" | ✅ Internal guidance is correct — the implementation does not yet follow it for filer count and rating. |

**Recommendation:** Either (a) suppress `VERIFIED_FILER_COUNT` and `AGGREGATE_RATING` until backed by real data, or (b) label them as "beta testers" or add a disclosure. Add a disclosure to testimonials: "Illustrative examples based on typical use cases."

**Section verdict: FAIL** (for marketing claims not backed by real data)

---

## §10 — Payment After Value / Pre-Submit Gate

| Gate | Implementation | Assessment |
|---|---|---|
| Filing confidence required before checkout | `app/file/checkout/plans/page.tsx:30–32,48–50,104–108`: Banner shown + checkout locked if `!filingReady` | ✅ Cannot pay without reaching filing readiness |
| Mismatches must be resolved | `filingReady = confidence.filing_ready && mismatchResolved` | ✅ Both conditions checked |
| PaywallValueStack shows earned value | Shown before plan cards — regime savings, mismatches resolved, companion steps, filing confidence | ✅ Value demonstrated before ask |
| Pre-submit checklist before plans | `app/file/review/presubmit/page.tsx`: checklist must be green → "Choose plan & unlock guide" button | ✅ Hard gate in flow |
| Free plan still requires verify | `app/api/payments/create-order/route.ts:25–33`: free plan returns mock order → goes through verify → sets `paymentVerifiedAt` | ✅ Consistent payment flow regardless of price |

**Section verdict: PASS** — Value-before-pay architecture is sound.

---

## §11 — Miscellaneous Compliance Findings

### A — ERI / ITD Integration Accuracy
- `app/file/import/documents/page.tsx:73`: ModeCard "Import from ITD · ~3 min · **ERI connect coming soon**" — ✅ Clearly labelled as coming soon, not live
- `components/filing/connectors/ConnectorGrid.tsx:55–72`: COMING_SOON_CONNECTORS (MFCentral, Groww, Zerodha) correctly labelled "Coming soon" with badge
- No claim of active ERI integration found

### B — "AI CA" Hero Headline
- `app/page.tsx:39–40`: "Your AI personal CA." (gradient headline)
- `lib/constants.ts:3`: tagline "File your ITR before the deadline — your **AI CA** checks everything first"
- This is a marketing metaphor. Given the disclosures throughout the product ("we do not file for you", "companion mode", "no auto-submit"), this is unlikely to mislead a typical user, but "AI CA" could be construed as implying CA professional services. The footer at `SiteFooter.tsx:69` correctly adds "Not affiliated with the Income Tax Department."
- **Recommendation:** Consider adding a micro-disclosure near the headline: "AI-assisted guidance — not a replacement for a licensed CA" — especially given the CA plan implies human expert review.

### C — DPDP Act Compliance Badge
- `components/marketing/SecurityStrip.tsx:6–9`: "DPDP Act compliant" badge with tooltip "Data processed in India; consent-based collection; delete on request."
- `lib/store/draft.ts`: Draft state persisted to localStorage (client-side only, no server storage confirmed in code)
- No server-side data store is visible in the audited code (no DB calls, no user record creation). Form 16 and AIS uploads go to `app/api/documents/upload/route.ts` which is a stateless mock.
- ✅ At the current (demo) stage, DPDP claim is consistent with implementation. Reassess when real document storage is added.

### D — Refund Shown in Checkout Is Hardcoded
- `app/file/checkout/payment/page.tsx:31`: `₹17,000` (hardcoded)
- `app/file/checkout/tracker/page.tsx:34`: `₹17,000` (hardcoded)
- The real engine compute result is available via `useDraftTaxCompute` in other pages but not wired to the payment/tracker pages. The hardcoded value is properly qualified ("Estimated refund **if ITD accepts your return**") so the risk is disclosure-level, not compliance-level. But a user with ₹0 refund will still see ₹17,000 on the payment page.
- **Recommendation:** Wire the actual computed refund from draft store to these pages, or remove the figure from the payment page.

---

## Summary of Issues

| # | Severity | File | Line | Issue | Action |
|---|---|---|---|---|---|
| 1 | Low | `components/marketing/QuickStart.tsx` | 35–36 | "Estimated refund ₹18,420" in hero mock has no "(if ITD accepts)" qualifier | Add qualifier or use a generic label |
| 2 | Medium | `app/file/import/parsing/page.tsx` | 20–21 | "We imported 18 fields with high confidence" does not repeat demo-parsing caveat | Add demo disclosure banner |
| 3 | **High** | `app/api/payments/verify/route.ts` | 27 | `mock: true` accepted from client body without server env guard — payment bypass possible in production | Guard behind `!hasRazorpayKeys()` or remove from production build |
| 4 | Medium | `lib/store/draft.ts` + `lib/payments/access.ts` | 179 / all | Payment access gate is entirely client-side (localStorage); no server-side token | Introduce server-side payment session or JWT after verify |
| 5 | Medium | `lib/constants.ts` | 24–26 | `VERIFIED_FILER_COUNT = 6` and `AGGREGATE_RATING = 4.8` are seeded, not real analytics | Remove or disclose as illustrative until real data exists |
| 6 | Low | `lib/payments/plans.ts` + `components/pricing/PlanCard.tsx` | 57–67 | CA plan features ("Expert sign-off", "48-hour turnaround") shown as active on checkout; feature is "coming soon" | Add "(launching soon)" badge to CA plan card or disable until live |
| 7 | Low | `app/file/checkout/payment/page.tsx` + `tracker/page.tsx` | 31 / 34 | Hardcoded `₹17,000` refund shown regardless of user's actual computed refund | Wire actual engine result |

---

## Overall Compliance Verdict

```
┌─────────────────────────────────────────────────────────────────┐
│  OVERALL: PARTIAL PASS                                          │
│                                                                 │
│  PASS    §1  Risky terms — none found in product code          │
│  PASS    §2  No auto-file/submit claims — comprehensive        │
│  PARTIAL §3  Refund copy — qualified in filing; unqualified    │
│              in hero mock                                       │
│  PARTIAL §4  Demo parser disclosure — missing on parsing page  │
│  PARTIAL §5  Razorpay — correct HMAC; HIGH RISK mock bypass    │
│  PARTIAL §6  Companion gating — UI gated; client-side-only     │
│  PASS    §7  .env.example — clean, no real credentials         │
│  PARTIAL §8  CA plan — "coming soon" but sold on checkout      │
│  FAIL    §9  Social proof — seeded filer count & rating        │
│              presented as real metrics                          │
│  PASS    §10 Payment after value — strong pre-submit gate      │
│  INFO    §11 Misc — "AI CA" headline, DPDP badge, hardcoded    │
│              refund figure                                      │
│                                                                 │
│  Blocking before public launch: Issues #3, #5                  │
│  Fix before paid traffic: Issues #2, #4, #6, #7               │
│  Fix before scale: Issue #1                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

*Audit performed by static code inspection only. No runtime or network tests were executed. Payment bypass (Issue #3) should be verified with a live test against the production API endpoint before launch.*
