# Razorpay Payment Integration Setup

## Current Status
- ✅ Razorpay SDK integrated (lib/payments/razorpay.ts)
- ✅ Order creation API (app/api/payments/create-order/route.ts)
- ✅ Payment verification (app/api/payments/verify/route.ts)
- ✅ Signature verification implemented
- ✅ Mock orders for dev/testing
- ⚠️ **MISSING:** Environment variables on Vercel

---

## Test Credentials (Provided)
```
Razorpay Test Account
Key ID:    rzp_test_TEOyvQKS2Gb00I
Secret:    b6d36JNa4V5EUXpCmJPMg6vk
```

---

## Vercel Production Setup for lastminuteitr.in

### Step 1: Add Environment Variables
Deploy to Vercel and set these in Project Settings → Environment Variables:

```
RAZORPAY_KEY_ID=rzp_test_TEOyvQKS2Gb00I
RAZORPAY_KEY_SECRET=b6d36JNa4V5EUXpCmJPMg6vk
PAYMENT_SESSION_SECRET=<random 32-char secret for signing payment cookies>
```

**Optional:**
```
NEXT_PUBLIC_APP_URL=https://lastminuteitr.in
NEXT_PUBLIC_BYPASS_PAYMENT=false  # DO NOT SET for production
```

### Step 2: Redeploy
After setting env vars, redeploy to make them available to the running app:
```bash
git push  # Vercel auto-deploys
# or manually trigger from Vercel dashboard
```

### Step 3: Test Payment Flow (Step-by-Step)

#### A. Test With Full-Discount Coupon (FREE)
1. Go to https://lastminuteitr.in
2. Log in or create account
3. Upload Form 16 / complete filing
4. Go to checkout → Payment page
5. **Apply a full-discount coupon** (admin must create one first)
6. Verify: "FREE" text shows + "Unlock Guide Now" button appears
7. Click "Unlock Guide Now"
8. Should redirect to /file/companion?unlocked=1 immediately
9. ✅ Coupon redemption successful

#### B. Test With Real Razorpay Payment
1. Go to https://lastminuteitr.in
2. Complete filing + go to Payment page
3. **Do NOT apply coupon** or use amount-off coupon (not FREE)
4. Click "Pay Now" button
5. Razorpay popup should appear with order amount
6. **Use Razorpay test card:**
   - Card Number: 4111111111111111
   - Expiry: any future date (e.g., 12/25)
   - CVV: 123
7. Click "Pay" button
8. Should redirect to /file/companion?unlocked=1
9. ✅ Real payment successful

#### C. Test With Amount-Off Coupon
1. Apply ₹500 off coupon (admin creates with discount="amount", amountOff=500)
2. Verify: Price shows discount (₹2499 → ₹1999)
3. Proceed to Razorpay payment with discounted amount
4. Complete payment with test card
5. ✅ Amount-off coupon + payment successful

---

## Admin Setup: Create Test Coupons

### Via Admin Dashboard
1. Go to https://lastminuteitr.in/admin → Coupons
2. Create coupon:
   - **Full Discount Test:**
     - Code: FREELAUNCH
     - Discount: Full
     - Max Uses: 10
     - Scope: Any plan
   - **Amount-Off Test:**
     - Code: SAVE500
     - Discount: Amount off
     - Amount: ₹500
     - Max Uses: 10

### Via API (Curl)
```bash
curl -X POST https://lastminuteitr.in/api/admin/coupons \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "FREELAUNCH",
    "discount": "full",
    "planScope": "any",
    "lane": "b2c",
    "maxUses": 100
  }'
```

---

## Local Development (Without Real Keys)

The app uses **mock orders** when Razorpay keys are not set:

1. Payment page shows warning: "Razorpay will be connected here later..."
2. "Continue without live payment (dev)" button available
3. Click it → creates mock order → instant redirect
4. No signature verification needed
5. Useful for E2E testing UI flow

---

## Payment Flow Overview

```
User clicks "Pay Now"
        ↓
Frontend requests /api/payments/create-order?planId=ai_smart&couponCode=SAVE500
        ↓
API validates coupon, calculates discount
        ↓
Creates Razorpay order (if keys set) OR mock order
        ↓
Frontend loads Razorpay popup with order amount
        ↓
User enters card details and pays
        ↓
Frontend submits payment response to /api/payments/verify
        ↓
API verifies signature with Razorpay secret
        ↓
API records payment, creates CompanionGrant (7-day access)
        ↓
Sets PAYMENT_SESSION_COOKIE (signed token)
        ↓
Frontend redirects to /file/companion?unlocked=1
        ↓
Companion page checks cookie, unlocks portal guide
```

---

## Database Records After Payment

After a successful payment, the following are created:

1. **payments** table:
   ```
   id: pay_<id>
   amount: ₹1999 (after discount)
   plan: ai_smart
   status: paid
   source: razorpay
   razorpayOrderId: order_abc123
   razorpayPaymentId: pay_xyz789
   sessionId: <user-session>
   couponId: <if coupon used>
   ```

2. **companionGrants** table:
   ```
   id: grant_<id>
   sessionId: <same-session>
   source: payment
   plan: ai_smart
   expiresAt: <now + 7 days>
   passkey: TS-XXXX-XXXX (for email/download)
   ```

3. **invoices** table (if paid > ₹0):
   ```
   seq: auto-increment
   paymentId: pay_<id>
   plan: ai_smart
   grossInr: ₹1999
   taxableInr: ₹1698.29 (with 18% GST)
   gstInr: ₹300.71
   status: issued
   ```

---

## Troubleshooting

### "Razorpay is not configured"
**Cause:** `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` not set on Vercel  
**Fix:** Add both env vars and redeploy

### "Invalid payment signature"
**Cause:** Secret key mismatch or order ID tampered  
**Fix:** Verify `RAZORPAY_KEY_SECRET` value exactly matches Razorpay dashboard

### Payment shows ₹0 (free) but shouldn't
**Cause:** Invalid coupon or discount calculating to full price  
**Fix:** Check `/api/coupons/validate` response for discount amount

### Razorpay popup doesn't open
**Cause:** Razorpay script not loaded or key ID invalid  
**Fix:** Check browser console for errors; verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` available on frontend

---

## Files Involved

**Backend:**
- `lib/payments/razorpay.ts` — order creation + signature verification
- `lib/payments/session.ts` — payment cookie signing
- `app/api/payments/create-order/route.ts` — order creation endpoint
- `app/api/payments/verify/route.ts` — payment verification endpoint
- `lib/admin/payments.ts` — record payment in DB

**Frontend:**
- `components/filing/checkout/RazorpayButton.tsx` — checkout button + Razorpay popup
- `app/(app)/file/checkout/payment/page.tsx` — payment page with coupon logic
- `lib/hooks/usePaymentSession.ts` — check payment status

**Config:**
- `.env.example` — Razorpay key template
- Vercel env vars (set in dashboard)

---

## Next Steps

1. ✅ Set RAZORPAY env vars on Vercel production
2. ✅ Redeploy
3. ✅ Create test coupons via admin panel
4. ✅ Test full payment flow end-to-end
5. ✅ Monitor Razorpay dashboard for test orders
6. ✅ When ready for live: upgrade to live keys (`rzp_live_*` credentials)

