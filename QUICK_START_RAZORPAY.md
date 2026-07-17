# Quick Start: Razorpay Setup (5 minutes)

## Three Steps to Payment Live

### 1️⃣ Set Environment Variables (2 min)

**Go to:** https://vercel.com/dashboard → lastminuteitr → Settings → Environment Variables

Add these 3 variables:

```
RAZORPAY_KEY_ID
Value: rzp_test_TEOyvQKS2Gb00I
Environments: Production, Preview, Development

RAZORPAY_KEY_SECRET
Value: b6d36JNa4V5EUXpCmJPMg6vk
Environments: Production (only!)

PAYMENT_SESSION_SECRET
Value: super-secret-32-character-random-key-1234567890ab
Environments: Production (only!)
```

Click **Save** on each. Takes ~10 seconds per variable.

---

### 2️⃣ Redeploy Frontend (2 min)

**Option A (Automatic):**
```bash
git push origin main
# Vercel auto-deploys in ~1-2 minutes
```

**Option B (Manual):**
1. Go to https://vercel.com/dashboard/lastminuteitr
2. Click **Deployments**
3. Find latest commit
4. Click **...** → **Redeploy**

Wait for green checkmark ✓

---

### 3️⃣ Test It Works (1 min)

Go to https://lastminuteitr.in/file/checkout/payment

You should see:
- ✅ No warning message about "Razorpay will be connected later"
- ✅ Normal payment page

**Alternatively, test via API:**
```bash
curl -X POST https://lastminuteitr.in/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"planId":"ai_smart"}'

# Response should have: "mock": false
# NOT: "mock": true
```

---

## Done! 🎉

Razorpay is now live. Your users can:
- Apply discount coupons
- Pay with real cards (in test mode)
- Get instant access to filing guide

---

## Next: Test Payment Flow

1. Create test coupon: **FREELAUNCH** (full discount)
2. Go to https://lastminuteitr.in → Upload Form 16 → Checkout
3. Apply **FREELAUNCH** code
4. Click **Unlock Guide Now**
5. Should redirect to `/file/companion` (payment successful!)

See `DEPLOYMENT_CHECKLIST.md` for full testing guide.

---

## Test Credentials for Razorpay

When testing payments with Razorpay popup:

**Test Card:**
- Number: `4111111111111111`
- Expiry: Any future date (e.g., 12/25)
- CVV: `123`
- OTP: `111111` (if prompted)

This is Razorpay's standard test card. Works unlimited times in test mode.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Still seeing "Razorpay not configured" | Hard refresh browser (Ctrl+Shift+R) or wait 5 min for cache clear |
| Payment doesn't go through | Check Razorpay dashboard if order was created; check browser console for errors |
| Coupon shows wrong discount | Verify coupon amount in admin panel; check calculateFinalPrice() logic |

---

## What's Next After Razorpay?

Once payments work, deploy the tax compute backend:

1. Deploy backend to Railway (see `COMPUTE_500_ERROR_DIAGNOSIS.md`)
2. Set `NEXT_PUBLIC_ENGINE_URL` on Vercel
3. Redeploy frontend
4. Tax calculations should work (no more 500 errors)

See `DEPLOYMENT_CHECKLIST.md` Phase 3 for step-by-step.

