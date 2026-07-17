# API Testing Reference

Use these curl commands to verify each API endpoint is working.

---

## 1. Create Order (Test Razorpay is Connected)

```bash
curl -X POST https://lastminuteitr.in/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "ai_smart"
  }'
```

**Expected Response (Razorpay configured):**
```json
{
  "orderId": "order_LKbfXE6WP3Pwyf",
  "amount": 249900,
  "currency": "INR",
  "planId": "ai_smart",
  "mock": false,
  "keyId": "rzp_test_TEOyvQKS2Gb00I"
}
```

**Expected Response (Razorpay NOT configured):**
```json
{
  "orderId": "order_mock_1626098765432",
  "amount": 249900,
  "currency": "INR",
  "planId": "ai_smart",
  "mock": true,
  "keyId": null,
  "message": "Razorpay keys not configured — using mock order for development"
}
```

If you see `"mock": false` → Razorpay is connected! ✅

---

## 2. Validate Coupon

```bash
curl -X POST https://lastminuteitr.in/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "FREELAUNCH",
    "planId": "ai_smart"
  }'
```

**If coupon exists and is valid:**
```json
{
  "valid": true,
  "discount": "full",
  "amountOff": null
}
```

**If coupon doesn't exist:**
```json
{
  "valid": false,
  "reason": "Invalid coupon code"
}
```

---

## 3. Redeem Full-Discount Coupon

```bash
curl -X POST https://lastminuteitr.in/api/coupons/redeem \
  -H "Content-Type: application/json" \
  -d '{
    "code": "FREELAUNCH",
    "planId": "ai_smart",
    "sessionId": "your-session-id"
  }'
```

**Success (FREE coupon):**
```json
{
  "unlocked": true,
  "planId": "ai_smart"
}
```

**Failure (doesn't cover full price):**
```json
{
  "error": "Code does not cover full price. Please proceed to payment.",
  "status": 400
}
```

---

## 4. Verify Payment (After Razorpay)

```bash
curl -X POST https://lastminuteitr.in/api/payments/verify \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_LKbfXE6WP3Pwyf",
    "razorpay_payment_id": "pay_LKbfXE6WP3Pwyf",
    "razorpay_signature": "abcd1234efgh5678",
    "planId": "ai_smart",
    "familyProfileId": "profile_id"
  }'
```

**Success:**
```json
{
  "verified": true,
  "orderId": "order_LKbfXE6WP3Pwyf",
  "paymentId": "pay_LKbfXE6WP3Pwyf",
  "planId": "ai_smart",
  "mock": false
}
```

**Signature Mismatch:**
```json
{
  "verified": false,
  "error": "Invalid payment signature",
  "status": 400
}
```

---

## 5. Create Test Coupon (Admin)

```bash
curl -X POST https://lastminuteitr.in/api/admin/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "code": "FREELAUNCH",
    "discount": "full",
    "planScope": "any",
    "lane": "b2c",
    "maxUses": 100
  }'
```

**Success:**
```json
{
  "ok": true,
  "coupon": {
    "id": "cpn_abc123",
    "code": "FREELAUNCH",
    "discount": "full",
    "planScope": "any",
    "lane": "b2c",
    "maxUses": 100,
    "usedCount": 0,
    "status": "active",
    "expiresAt": "2026-08-16T12:34:56.000Z",
    "createdAt": "2026-07-17T12:34:56.000Z"
  }
}
```

---

## 6. Test Tax Compute (After Backend Deployed)

```bash
curl -X POST https://lastminuteitr.in/api/compute \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "grossSalary": 1000000,
    "tds": 100000,
    "fdInterest": 50000,
    "regime": "new",
    "deductions": {
      "section80C": 150000,
      "section80D": 25000
    }
  }'
```

**Success (with backend):**
```json
{
  "ok": true,
  "regime_comparison": {
    "new": {
      "taxable_income": 925000,
      "tax": 125000,
      "net_payable": 25000
    },
    "old": {
      "taxable_income": 750000,
      "tax": 105000,
      "net_payable": 5000
    },
    "recommended_regime": "old"
  }
}
```

**Failure (backend not deployed):**
```json
{
  "ok": false,
  "error": "Invalid proxy response from https://lastminuteitr.in/api/compute: 500"
}
```

---

## Testing Checklist

- [ ] Create order → `mock: false` (Razorpay keys loaded)
- [ ] Validate coupon → coupon exists
- [ ] Redeem coupon → unlocked: true
- [ ] Verify payment → verified: true (after Razorpay flow)
- [ ] Create test coupon → ok: true
- [ ] Compute tax → ok: true (after backend deployed)

---

## Environment Variables to Verify

```bash
# On Vercel, these should be set:
echo $RAZORPAY_KEY_ID          # Should output: rzp_test_...
echo $RAZORPAY_KEY_SECRET       # Should output: b6d36JNa...
echo $PAYMENT_SESSION_SECRET    # Should output: your-secret-key
echo $NEXT_PUBLIC_ENGINE_URL    # Should output: https://..../api/compute (after backend)
```

---

## Common Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | All good! |
| 400 | Bad request | Check parameters |
| 401 | Unauthorized | Check auth token (admin APIs) |
| 402 | Payment required | Needs paid companion access |
| 422 | Unprocessable | Validation failed (e.g., blocking risks) |
| 500 | Server error | Check logs, see error message |
| 502 | Bad gateway | Backend unreachable (compute) |
| 503 | Service unavailable | Service not configured |

