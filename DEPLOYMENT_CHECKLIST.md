# Production Deployment Checklist

**Current Status:** Code committed, ready for deployment  
**Commit Hash:** 7fba280 (Fix critical coupon logic bugs)

---

## Phase 1: Razorpay Payment Integration (5-10 minutes)

### Step 1: Add Environment Variables to Vercel

**Go to:** https://vercel.com/dashboard

1. Select project: **lastminuteitr**
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```
Name: RAZORPAY_KEY_ID
Value: rzp_test_TEOyvQKS2Gb00I
Environments: Production, Preview, Development
```

```
Name: RAZORPAY_KEY_SECRET
Value: b6d36JNa4V5EUXpCmJPMg6vk
Environments: Production (only!)
```

```
Name: PAYMENT_SESSION_SECRET
Value: your-random-32-char-secret-key-here
Environments: Production (only!)
```

4. Click **Save** on each one

### Step 2: Redeploy Frontend

**Option A: Automatic Deploy**
```bash
git push origin main  # Auto-deploys to Vercel
```

**Option B: Manual Trigger**
1. Go to https://vercel.com/dashboard → lastminuteitr
2. Click **Deployments** tab
3. Find latest deployment → click the three-dot menu
4. Select **Redeploy**
5. Choose **Use existing Build Cache** → **Redeploy**

**Wait for deploy to complete** (2-3 minutes) — check status badge

### Step 3: Verify Razorpay Keys Are Loaded

Open browser console and run:
```javascript
// This will fail silently but confirms keys are available server-side
fetch('/api/payments/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId: 'ai_smart' })
})
.then(r => r.json())
.then(d => console.log(d))
```

Expected response: `{ orderId: "order_xyz...", amount: 249900, mock: false }` (NOT mock: true)

---

## Phase 2: Test Payment Flow (30 minutes)

### Test A: Full-Discount Coupon (FREE)

1. **Create coupon via admin panel:**
   - Go to https://lastminuteitr.in/admin
   - Login with admin credentials
   - Navigate to **Coupons**
   - Click **Create Coupon**
   - Fill:
     ```
     Code: FREELAUNCH
     Discount: Full
     Plan Scope: Any plan
     Max Uses: 100
     Validity: 30 days
     ```
   - Click **Create**

2. **Test checkout flow:**
   - Go to https://lastminuteitr.in
   - Login (or create account)
   - Upload Form 16 + complete filing
   - Click **Plans & Pay**
   - Enter code: **FREELAUNCH**
   - Click **Apply Code**
   - ✅ Should see: "FREE" text + "Unlock Guide Now" button
   - Click **Unlock Guide Now**
   - ✅ Should redirect to `/file/companion?unlocked=1`

3. **Verify in database:**
   ```bash
   # Check payments table for status="granted"
   # Check companionGrants table for new entry
   ```

### Test B: Amount-Off Coupon (Partial Discount)

1. **Create coupon:**
   - Code: SAVE500
   - Discount: Amount off
   - Amount: ₹500
   - Max Uses: 100

2. **Test checkout flow:**
   - Apply code **SAVE500**
   - ✅ Should see: Base price with strikethrough + discounted price
   - Click **Pay Now**
   - ✅ Razorpay popup should appear

3. **Complete payment:**
   - Use test card: **4111111111111111**
   - Expiry: Any future date (e.g., 12/25)
   - CVV: **123**
   - Click **Pay**
   - ✅ Should redirect to `/file/companion?unlocked=1`

4. **Verify Razorpay dashboard:**
   - Go to https://dashboard.razorpay.com (test mode)
   - Check **Payments** → should see payment for ₹1999 (₹2499 - ₹500)
   - Status should be **Captured**

### Test C: Regime Calculation Blur

1. **Go to:** https://lastminuteitr.in/file/review?tab=taxes
2. **Without payment:**
   - ✅ Content should be blurred + greyed out
   - ✅ "Unlock tax breakdown" overlay visible
3. **After payment:**
   - ✅ Content fully visible
   - ✅ No overlay

---

## Phase 3: Backend Compute Deployment (90 minutes)

### Prerequisites

- [ ] Railway account created (https://railway.app)
- [ ] GitHub repo connected to Railway
- [ ] Backend code exists in `ITR-filing-temp/backend/` folder

### Step 1: Check Backend Exists

```bash
ls -la ../backend/
# Should show: api/, engine/, scripts/, main.py, etc.
```

If missing, copy from NikhilAdmin:
```bash
cp -r ../NikhilAdmin/backend ../backend
```

### Step 2: Create Railway Deployment

1. Go to https://railway.app/dashboard
2. Click **New Project** → **Deploy from GitHub**
3. Select repo: **lastminuteitr**
4. Select: **Deploy from a subdirectory**
5. Path: `ITR-filing-temp/backend`
6. Click **Deploy**

### Step 3: Configure Railway Environment

1. Click **Variables**
2. Add:
   ```
   PYTHON_VERSION=3.11
   PORT=8000
   ```

3. **Start Command:**
   ```
   pip install -r requirements.txt && \
   gunicorn -w 2 -b 0.0.0.0:$PORT api.compute:app
   ```

### Step 4: Get Railway URL

Once deployed:
1. Click **Settings**
2. Copy domain: `https://<project-name>.railway.app`
3. Note: Final endpoint will be `https://<project-name>.railway.app/api/compute`

### Step 5: Update Vercel Environment

1. Go to https://vercel.com → Settings → Environment Variables
2. Add:
   ```
   Name: NEXT_PUBLIC_ENGINE_URL
   Value: https://<project-name>.railway.app/api/compute
   Environments: Production
   ```
3. **Save** and **Redeploy** frontend

### Step 6: Test Tax Calculations

1. Go to https://lastminuteitr.in/file/review
2. Add income (Form 16)
3. ✅ Should see tax calculation (not "Tax calculation failed")
4. Check browser console for requests to Railway backend

---

## Verification Checklist

### Razorpay Integration
- [ ] Keys set on Vercel (RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET)
- [ ] Frontend redeployed
- [ ] Full coupon works (shows FREE, redirects successfully)
- [ ] Amount-off coupon works (shows discount, payment completes)
- [ ] Razorpay dashboard shows payments captured
- [ ] CompanionGrants created in database
- [ ] Payments recorded with status "paid" or "granted"

### Blur Logic
- [ ] TaxBreakdownTab blurred when unpaid
- [ ] SummaryTab blurred when unpaid
- [ ] PaywallOverlay visible with lock icon
- [ ] Content visible after payment
- [ ] "Unlock to see exact details" CTA works

### Backend Compute
- [ ] Backend deployed to Railway
- [ ] NEXT_PUBLIC_ENGINE_URL set on Vercel
- [ ] Frontend redeployed
- [ ] Tax calculations work (no 500 error)
- [ ] Results display correctly
- [ ] Multiple income types tested (salary + house property, etc.)

---

## Troubleshooting

### Razorpay Payment Shows ₹0

**Cause:** Discount amount equals full price  
**Fix:** Make sure coupon discount < plan price

```
Plan: ₹2499
Coupon: ₹500 off → Final: ₹1999 ✓
Coupon: ₹2500 off → Final: ₹0 (FREE) ✓
Coupon: ₹2499 off → Final: ₹0 (FREE) ✓
```

### "Razorpay is not configured" Message Still Shows

**Cause:** 
1. Env vars not set in production
2. Vercel cached old build
3. Deployment not complete

**Fix:**
```bash
# Verify env vars are set
curl -X POST https://lastminuteitr.in/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"planId":"ai_smart"}'
# If response has "mock": false → keys are loaded
# If "mock": true → keys not set yet
```

### Razorpay Popup Doesn't Open

**Cause:** Razorpay script failed to load  
**Fix:**
1. Check browser console for errors
2. Verify frontend deployment completed
3. Hard refresh: Ctrl+Shift+R (clear cache)

### Tax Calculation Still Shows 500 Error

**Cause:** Backend not deployed or NEXT_PUBLIC_ENGINE_URL not set  
**Fix:**
```bash
# Test backend is running
curl https://<railway-project>.railway.app/api/compute \
  -H "Content-Type: application/json" \
  -d '{"age":30}'
# If it responds: backend is working
# If timeout/error: backend not running
```

---

## Rollback Plan

If anything breaks in production:

### Rollback Razorpay
1. Remove RAZORPAY_KEY_ID from Vercel
2. Redeploy
3. Payment will show "Razorpay will be connected here later" message
4. Users can still use free coupons

### Rollback Compute Backend
1. Remove NEXT_PUBLIC_ENGINE_URL from Vercel
2. Redeploy
3. Tax calculations will show "Engine unavailable" error
4. Users can still complete filing without tax preview

---

## Timeline

| Phase | Tasks | Time |
|-------|-------|------|
| 1 | Set Razorpay keys + redeploy | 5 min |
| 2 | Test payment flow with 2 coupon types | 30 min |
| 3 | Deploy backend to Railway | 45 min |
| 4 | Set NEXT_PUBLIC_ENGINE_URL + redeploy | 10 min |
| 5 | Test tax calculations | 15 min |
| **Total** | | **~2 hours** |

---

## Sign-Off

Once all checks pass:

```
Date: _________________
Tested by: _________________
Approved by: _________________
Status: READY FOR PUBLIC LAUNCH
```

