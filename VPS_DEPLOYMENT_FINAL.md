# 🚀 LastMinute ITR - VPS Deployment - FINAL CHECKLIST

**Status:** Everything ready to deploy!  
**Target:** Hostinger VPS (200.97.160.215)  
**Domain:** lastminuteitr.in  
**Estimated Time:** 2-3 hours  

---

## ✅ What's Ready

| Component | Status | Files |
|-----------|--------|-------|
| **Code Fixes** | ✅ Complete | 3 critical coupon bugs fixed |
| **Frontend** | ✅ Ready | app/(app)/file/checkout/payment/page.tsx |
| **Backend** | ✅ Ready | app/api/coupons/*, app/api/payments/* |
| **Razorpay** | ✅ Integrated | Ready for env setup |
| **Database** | ✅ Schema | Prisma models (Filing, FilingAuditEvent) |
| **Deployment** | ✅ Automated | DEPLOY_VPS_AUTOMATED.sh |
| **Documentation** | ✅ Complete | 6 comprehensive guides |

---

## 📋 Pre-Deployment Checklist

### Before You Start:

- [ ] GitHub repository is public/accessible
- [ ] Your GitHub repo URL: `https://github.com/YOUR-USERNAME/lastminuteitr.git`
- [ ] VPS SSH access verified (200.97.160.215, root, Rakeshgupta@9795)
- [ ] Domain DNS pointing to VPS (or will point after setup)
- [ ] Strong database password ready
- [ ] Screenshots of env vars ready for backup

---

## 🎯 Deployment Steps (Just 4 Steps!)

### **STEP 1: Prepare Script (5 minutes)**

On your local machine:

```bash
cd D:\websiteproject\LASTMINUTEITR\ITR-filing-temp

# Copy script to VPS
scp DEPLOY_VPS_AUTOMATED.sh root@200.97.160.215:/root/
```

Password: `Rakeshgupta@9795`

---

### **STEP 2: Connect to VPS (2 minutes)**

```bash
ssh root@200.97.160.215
```

Password: `Rakeshgupta@9795`

Inside VPS terminal:

```bash
cd /root
```

---

### **STEP 3: Configure Script (5 minutes)**

In VPS terminal:

```bash
nano DEPLOY_VPS_AUTOMATED.sh
```

Find and edit these lines (around line 41-48):

```bash
DOMAIN="lastminuteitr.in"
GITHUB_REPO="https://github.com/YOUR-USERNAME/lastminuteitr.git"
DB_PASSWORD="your-super-secure-password-123!@#"
```

Save: `Ctrl+X` → `Y` → `Enter`

---

### **STEP 4: Run Deployment (2-3 hours)**

In VPS terminal:

```bash
chmod +x /root/DEPLOY_VPS_AUTOMATED.sh
bash /root/DEPLOY_VPS_AUTOMATED.sh
```

Script will:
```
✓ Update system packages
✓ Install Node.js, Python, PostgreSQL, Nginx
✓ Setup database
✓ Clone code from GitHub
✓ Install & build frontend
✓ Setup & start backend
✓ Configure Nginx reverse proxy
✓ Setup SSL certificate
✓ Start PM2 process manager
✓ Verify everything works
```

---

## ✨ After Deployment (5 minutes)

Once script completes (you'll see "✓ DEPLOYMENT COMPLETE!"):

### 1. Verify Everything Works

```bash
# Check processes
pm2 list

# See logs
pm2 logs

# Test frontend
curl http://localhost:3000

# Test backend
curl -X POST http://localhost:5000/api/compute \
  -H "Content-Type: application/json" \
  -d '{"age":30}'
```

### 2. Test in Browser

Open: `https://lastminuteitr.in`

You should see: ✅ Home page loads

### 3. Create Test Coupon

1. Go to admin panel: `https://lastminuteitr.in/admin`
2. Create coupon:
   ```
   Code: TESTFREE
   Discount: Full
   Max Uses: 100
   ```

### 4. Test Payment Flow

1. Upload Form 16
2. Go to checkout
3. Apply coupon: TESTFREE
4. Click "Unlock Guide Now"
5. Should redirect to companion ✅

---

## 📊 What Gets Deployed

```
/var/www/lastminuteitr/
├── ITR-filing-temp/
│   ├── frontend/              (Next.js app on port 3000)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   │
│   └── backend/               (Python app on port 5000)
│       ├── api/
│       ├── engine/
│       ├── venv/              (Python virtual env)
│       └── requirements.txt

Database:
├── lastminuteitr_production   (PostgreSQL)
│   ├── users
│   ├── coupons
│   ├── payments
│   ├── familyProfiles
│   └── other tables

Nginx:
├── /etc/nginx/sites-available/lastminuteitr
└── Reverse proxy: 200.97.160.215 → https://lastminuteitr.in

SSL:
├── /etc/letsencrypt/live/lastminuteitr.in/
└── Auto-renewing certificates

Process Manager (PM2):
├── frontend (npm start on port 3000)
├── backend (gunicorn on port 5000)
└── Auto-restart if crash
```

---

## 🔧 If Something Goes Wrong

### Frontend not starting?
```bash
cd /var/www/lastminuteitr/ITR-filing-temp/frontend
npm run build
pm2 restart frontend
pm2 logs frontend
```

### Backend not starting?
```bash
cd /var/www/lastminuteitr/ITR-filing-temp/backend
source venv/bin/activate
python3 api/compute.py  # Test manually
pm2 restart backend
pm2 logs backend
```

### Database connection error?
```bash
sudo systemctl restart postgresql
psql -h localhost -U itr_user -d lastminuteitr_production -c "SELECT 1;"
```

### Nginx not working?
```bash
sudo nginx -t  # Test config
sudo systemctl reload nginx
sudo systemctl status nginx
tail -f /var/log/nginx/error.log
```

### Port already in use?
```bash
lsof -i :3000   # Check port 3000
lsof -i :5000   # Check port 5000
kill -9 <PID>   # Kill process
pm2 restart all
```

---

## 📞 After Deployment - Maintenance

### Daily (5 minutes)
```bash
# Check processes alive
pm2 list

# See errors
pm2 logs
```

### Weekly (15 minutes)
```bash
# Check disk space
df -h

# Check RAM usage
free -h

# Check logs
tail -f /var/log/nginx/lastminuteitr-error.log
```

### Monthly (30 minutes)
```bash
# Backup database
pg_dump -U itr_user lastminuteitr_production > /root/backup-$(date +%Y%m%d).sql

# Update packages
apt update && apt upgrade -y

# Restart everything
pm2 restart all
sudo systemctl restart nginx
```

---

## 📱 Monitoring Dashboard

After deployment, you can monitor processes:

```bash
# Web dashboard (port 9615)
pm2 web

# Then open in browser:
# http://200.97.160.215:9615
```

Or via command line:

```bash
# See all processes
pm2 list

# See live logs
pm2 logs

# See specific process
pm2 logs frontend
pm2 logs backend

# Monitor
pm2 monit
```

---

## 💾 Important Files & Passwords

**SAVE THESE SECURELY (in password manager):**

```
VPS Details:
- IP: 200.97.160.215
- User: root
- SSH Password: Rakeshgupta@9795

Database:
- User: itr_user
- Password: (the one you set in script)
- Host: localhost
- Port: 5432
- Database: lastminuteitr_production

Connection String:
postgresql://itr_user:PASSWORD@localhost:5432/lastminuteitr_production

Razorpay Keys (Test):
- Key ID: rzp_test_TEOyvQKS2Gb00I
- Secret: b6d36JNa4V5EUXpCmJPMg6vk

Domain:
- lastminuteitr.in
- SSL: Auto-renewed by Let's Encrypt
```

---

## 🎓 Learning Resources (If You Want to Understand More)

- VPS Manual Setup: `HOSTINGER_VPS_DEPLOYMENT.md`
- Full Nginx Guide: Search "nginx reverse proxy"
- PM2 Tutorial: `pm2 show frontend` or `pm2 help`
- PostgreSQL Basics: `psql -U postgres`
- Let's Encrypt SSL: Auto-handles, no action needed

---

## ✅ Final Verification Checklist

After deployment, verify:

- [ ] `https://lastminuteitr.in` loads in browser
- [ ] Home page displays correctly
- [ ] Admin panel accessible
- [ ] Can create coupons
- [ ] Can apply coupons
- [ ] Payment flow works
- [ ] Regime calculation shows
- [ ] Blur logic works
- [ ] No 500 errors in console
- [ ] PM2 shows all processes "online"

---

## 🚀 You're Ready!

**Next 10 minutes:**
1. ✅ Prepare script
2. ✅ Connect to VPS
3. ✅ Run deployment
4. ✅ Wait for completion
5. ✅ Test in browser

**Total Time: 2-3 hours** ⏱️

**Then go live with coupons & payments!** 🎉

---

## Questions?

Refer to:
- `VPS_QUICK_START.md` - Simple Hindi guide
- `HOSTINGER_VPS_DEPLOYMENT.md` - Detailed manual
- `DEPLOY_VPS_AUTOMATED.sh` - What the script does

---

## Success Indicators

When deployment is complete, you should see:

```
[INFO] ========================================
[INFO] ✓ DEPLOYMENT COMPLETE!
[INFO] ========================================
[INFO]
[INFO] 🎉 Your application is now live!
[INFO]
[INFO] 📍 Access your app:
[INFO]    https://lastminuteitr.in
[INFO]
[INFO] 📊 Monitor processes:
[INFO]    pm2 list
[INFO]
[INFO] ========================================
```

And in browser:
- Homepage loads ✅
- No errors in console ✅
- Payments page accessible ✅
- Can complete full filing flow ✅

---

## 🎯 Summary

| What | Status |
|------|--------|
| Code ready | ✅ All fixes done |
| VPS ready | ✅ Hostinger 200.97.160.215 |
| Script ready | ✅ DEPLOY_VPS_AUTOMATED.sh |
| Documentation | ✅ 3 detailed guides |
| Razorpay keys | ✅ Test credentials ready |
| Database schema | ✅ Prisma models ready |

**You're all set! Let's deploy!** 🚀

