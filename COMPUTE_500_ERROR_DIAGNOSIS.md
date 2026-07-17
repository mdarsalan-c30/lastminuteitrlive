# Tax Compute 500 Error — Root Cause & Solutions

## Root Cause Analysis

### Current Error
```
Tax calculation failed
Invalid proxy response from https://lastminuteitr.in/api/compute: 500
Retry calculation
```

### Why It Happens

**Production (Vercel/lastminuteitr.in):**
1. User visits /file/review, triggers tax calculation
2. Frontend calls `/api/compute` with income/deductions data
3. Vercel Node.js runtime handles the request
4. Code checks:
   - Is `NEXT_PUBLIC_ENGINE_URL` set? → NO (not deployed on Vercel)
   - Is `NODE_ENV === "production"`? → YES
   - If yes, proxy to `NEXT_PUBLIC_ENGINE_URL` or fail
5. Falls back to trying to spawn local Python → fails on Vercel (no Python)
6. Exception thrown → HTTP 500 returned

**The compute route logic (app/api/compute/route.ts, lines 102-103):**
```tsx
if (process.env.NEXT_PUBLIC_ENGINE_URL || process.env.NODE_ENV === "production") {
  return proxyToPythonServerless(request, payload);
}
```

**In production, there's:**
- No `NEXT_PUBLIC_ENGINE_URL` configured
- No backend compute.py running
- No Python on Vercel serverless
- Result: 500 error

---

## Current Deployment Architecture

```
┌─────────────────────────────────┐
│  lastminuteitr.in (Vercel)      │
│  - Next.js frontend running     │
│  - /api routes (Node.js)        │
│  - NO Python runtime            │
│  - NO compute.py endpoint       │
└─────────────────────────────────┘
           ↓ (calls)
    /api/compute tries to:
       1. Check NEXT_PUBLIC_ENGINE_URL
       2. Spawn local python3 (FAILS on Vercel)
       3. Proxy to backend (NONE configured)
       ↓
    500 Internal Server Error
```

---

## Solution Options

### Option A: Deploy Backend Separately (RECOMMENDED for Production)

**Best for:** Live production traffic, scalability, reliability

**Steps:**
1. Deploy the Python tax engine to Railway/Fly/AWS
2. Set `NEXT_PUBLIC_ENGINE_URL=https://<backend-host>/api/compute` on Vercel
3. Frontend always proxies to the backend
4. Backend computes taxes independently

**Backend Deployment Checklist:**
- [ ] Backend folder contains compute.py + orchestrator + all engine modules
- [ ] Python 3.11+ installed
- [ ] Dependencies: pandas, numpy, pydantic (if using)
- [ ] gunicorn/uvicorn server configured
- [ ] Health check endpoint: GET /health → `{"status": "ok"}`
- [ ] Compute endpoint: POST /api/compute with JSON payload
- [ ] Logs sent to central logging (CloudWatch, Datadog, etc.)

**Estimated cost:**
- Railway: ~$5-15/month for basic tier
- Fly.io: ~$2-8/month for pay-as-you-go

---

### Option B: Use Vercel Python Support (Experimental)

**Best for:** Small-scale testing, prototyping

**Requirements:**
- Upgrade to Vercel Pro ($20/month)
- Python runtime available only in selected regions

**Setup:**
- Place compute.py in `/api/compute.py` (Next.js API convention)
- Next.js will use Python runtime instead of Node.js

**Caveats:**
- Limited Python support (not all libraries work)
- Slower cold starts
- May not be reliable for production

---

### Option C: Pre-compute & Cache Results (Pragmatic)

**Best for:** MVP phase, limited income types

**Idea:**
- Pre-compute common tax scenarios (salary only, salary+house property, etc.)
- Cache results in DB
- For uncommon scenarios, show a message: "Custom calculation requires human CA review"

**Pros:**
- No backend deployment needed
- Instant response
- Minimal server cost

**Cons:**
- Limited functionality
- Users expect real-time computation
- Won't scale

---

## Recommended Path: Option A (Railway Backend)

### Step 1: Verify Backend Structure

Check if backend folder exists in ITR-filing-temp:
```bash
ls -la backend/
# Should show: api/, engine/, scripts/, etc.
```

**If missing:**
- Copy from `NikhilAdmin/backend/` folder
- OR request backend code from team

### Step 2: Deploy to Railway

```bash
# From project root
cd backend

# Create requirements.txt if missing
pip freeze > requirements.txt

# Create Procfile for Railway
echo "web: gunicorn -w 4 -b 0.0.0.0:\$PORT api.compute:app" > Procfile

# Push to Railway
railway up
```

### Step 3: Get Railway URL

```
https://<railway-project-name>.up.railway.app/api/compute
```

### Step 4: Set Vercel Env Var

Go to Vercel Dashboard → Settings → Environment Variables

Add:
```
NEXT_PUBLIC_ENGINE_URL=https://<railway-project-name>.up.railway.app/api/compute
```

Redeploy:
```bash
git push  # Auto-deploys to Vercel
```

### Step 5: Test

1. Go to https://lastminuteitr.in/file/review
2. Add income → "Calculating..." should show
3. After 2-5 seconds → tax breakdown appears
4. Check console for logs (should show request to Railway backend)

---

## Quick Status Check

**To diagnose which option you're in:**

```bash
# Check current frontend config
env | grep -i engine
# If NEXT_PUBLIC_ENGINE_URL is set → backend exists

# Check if backend is running
curl -X POST https://lastminuteitr.in/api/compute \
  -H "Content-Type: application/json" \
  -d '{"age": 30}'
# 200 OK = working
# 500 = backend missing or errored
# 502 = wrong backend URL
```

---

## Console Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `Engine unavailable` | No Python + no backend URL | Deploy backend or set NEXT_PUBLIC_ENGINE_URL |
| `Invalid proxy response` | Backend URL wrong or unreachable | Check NEXT_PUBLIC_ENGINE_URL, test backend health |
| `connect ECONNREFUSED` | Backend down or incorrect port | Restart backend, verify port |
| `ENOTFOUND` | DNS can't resolve backend URL | Check URL spelling, test `nslookup` |
| `Timeout` | Backend slow to respond | Add logging, check database queries in backend |

---

## Files Needing Updates Once Backend Deployed

1. **.env.example**
   ```
   # Uncomment and set for production:
   NEXT_PUBLIC_ENGINE_URL=https://your-backend.railway.app/api/compute
   ```

2. **vercel.json** (if using)
   ```json
   {
     "env": {
       "NEXT_PUBLIC_ENGINE_URL": "@engine-url"
     }
   }
   ```

3. **README.md**
   ```markdown
   ## Deployment
   
   1. Deploy backend to Railway (see backend/README.md)
   2. Set NEXT_PUBLIC_ENGINE_URL on Vercel
   3. Deploy frontend
   ```

---

## Estimated Timeline

| Task | Effort | Duration |
|------|--------|----------|
| Copy backend code | 10 min | 10 min |
| Fix Python imports/dependencies | 30 min | 30 min |
| Deploy to Railway | 15 min | 15 min |
| Set Vercel env var | 5 min | 5 min |
| Test end-to-end | 20 min | 20 min |
| **Total** | ~80 min | **~90 minutes** |

---

## Rollback Plan

If backend deployment breaks production:

1. Remove `NEXT_PUBLIC_ENGINE_URL` from Vercel env
2. Redeploy frontend
3. Tax calculations will fail gracefully (show error, not crash)
4. Debug backend separately on Railway dashboard

---

## Next Steps

1. [ ] Verify backend folder exists (copy if needed)
2. [ ] Test backend locally with `python -m backend.scripts.layer2_cli`
3. [ ] Create Railway account + link GitHub
4. [ ] Deploy backend to Railway
5. [ ] Set `NEXT_PUBLIC_ENGINE_URL` on Vercel
6. [ ] Redeploy frontend
7. [ ] Test tax calculation on production

