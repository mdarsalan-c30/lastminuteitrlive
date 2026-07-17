# VPS पर Deploy करना - आपके लिए (Step-by-Step)

**VPS Details:**
- IP: `200.97.160.215`
- User: `root`
- Password: `Rakeshgupta@9795`
- Domain: `lastminuteitr.in` (अपना डोमेन बदलो अगर अलग है)

---

## **Step 1: VPS से Connect करो**

अपना terminal/command prompt खोलो और type करो:

```bash
ssh root@200.97.160.215
```

Password पूछेगा:
```
password: Rakeshgupta@9795
```

Enter करो।

---

## **Step 2: Deployment Script Upload करो**

अपने machine पर (जहाँ code है), ये command चलाओ:

```bash
cd D:\websiteproject\LASTMINUTEITR\ITR-filing-temp

# Script को VPS पर copy करो
scp DEPLOY_VPS_AUTOMATED.sh root@200.97.160.215:/root/
```

Password दो: `Rakeshgupta@9795`

---

## **Step 3: Script को Configure करो**

VPS पर (जहाँ terminal connect है):

```bash
cd /root
nano DEPLOY_VPS_AUTOMATED.sh
```

ये lines को find करो और change करो:

```bash
# Line ~41: अपना GitHub repo URL डालो
GITHUB_REPO="https://github.com/YOUR-USERNAME/lastminuteitr.git"

# Line ~43: Strong password बनाओ (कोई भी जटिल password)
DB_PASSWORD="your-very-secure-password-here-123!@#"

# Line ~48: अगर domain अलग है
DOMAIN="lastminuteitr.in"
```

Save करो: `Ctrl+X` → `Y` → `Enter`

---

## **Step 4: Script को Run करो**

```bash
chmod +x /root/DEPLOY_VPS_AUTOMATED.sh
bash /root/DEPLOY_VPS_AUTOMATED.sh
```

यह script चलेगा (~2-3 घंटे लगेंगे):

```
[INFO] Starting LastMinute ITR VPS Deployment
[INFO] PHASE 1: System Setup and Dependencies
[INFO] Updating system packages...
[INFO] Installing Node.js...
[INFO] Installing Python...
...
```

### यह करेगा automatically:
- ✅ Node.js, Python, PostgreSQL, Nginx install
- ✅ Database create
- ✅ Frontend clone, build, start
- ✅ Backend setup, start
- ✅ Nginx configure
- ✅ SSL certificate
- ✅ PM2 से processes manage

---

## **Step 5: Verify कि सब काम कर रहा है**

Script खत्म होने के बाद, ये commands चलाओ:

```bash
# Processes check करो
pm2 list

# Frontend logs देखो
pm2 logs frontend

# Backend logs देखो
pm2 logs backend

# Database check करो
psql -h localhost -U itr_user -d lastminuteitr_production -c "SELECT 1;"
```

---

## **Step 6: Browser में Test करो**

अपने browser में जाओ:

```
https://lastminuteitr.in
```

या SSH से:

```bash
# Frontend चल रहा है?
curl http://localhost:3000

# Backend चल रहा है?
curl -X POST http://localhost:5000/api/compute \
  -H "Content-Type: application/json" \
  -d '{"age":30}'

# Nginx चल रहा है?
curl https://localhost -k
```

---

## **अगर कुछ Error आए तो:**

### Error: "Permission denied"
```bash
sudo chmod +x /root/DEPLOY_VPS_AUTOMATED.sh
```

### Error: "git clone failed"
अपना GitHub URL सही है?
```bash
# Change करो script में:
nano DEPLOY_VPS_AUTOMATED.sh
# GITHUB_REPO को सही URL से update करो
```

### Error: "npm: command not found"
```bash
# Node.js manually install करो
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs npm
```

### Error: "PostgreSQL failed"
```bash
# Service restart करो
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

### Frontend/Backend not starting
```bash
# PM2 से manually start करो
cd /var/www/lastminuteitr/ITR-filing-temp/frontend
pm2 start npm --name "frontend" -- start

cd /var/www/lastminuteitr/ITR-filing-temp/backend
pm2 start ecosystem.config.js
```

---

## **अगला काम: Coupons Test करो**

Script पूरा हो जाने के बाद:

1. **https://lastminuteitr.in** पर जाओ
2. **Admin panel** में login करो
3. **Coupons** section में जाओ
4. Test coupon बनाओ:
   ```
   Code: TESTFREE
   Discount: Full
   Max Uses: 100
   ```
5. **Form 16 upload करो** और **Checkout** जाओ
6. Code apply करो
7. "Unlock Guide Now" click करो

---

## **Monitoring & Maintenance**

### Daily Check करो:
```bash
# Processes alive हैं?
pm2 list

# Errors तो नहीं?
pm2 logs

# Disk space बची है?
df -h

# RAM usage?
free -h
```

### Logs देखो:
```bash
# Frontend errors
tail -f /var/www/lastminuteitr/ITR-filing-temp/frontend/.log

# Backend errors
tail -f /var/www/lastminuteitr/ITR-filing-temp/backend/logs/backend-error.log

# Nginx errors
tail -f /var/log/nginx/lastminuteitr-error.log

# Database logs
tail -f /var/log/postgresql/postgresql.log
```

### Restart करो अगर कुछ गलत हो:
```bash
# सब processes restart करो
pm2 restart all

# Nginx restart करो
sudo systemctl restart nginx

# Database restart करो
sudo systemctl restart postgresql
```

---

## **Updates Deploy करो (Future में)**

नया code push करने के बाद:

```bash
cd /var/www/lastminuteitr/ITR-filing-temp/frontend

# Latest code pull करो
git pull origin main

# Install new dependencies
npm install

# Re-build करो
npm run build

# Restart करो
pm2 restart frontend
```

---

## **Backup लगवाओ (Important!)**

```bash
# Database backup manually
pg_dump -U itr_user lastminuteitr_production > /root/backup-$(date +%Y%m%d).sql

# Auto backup (Daily 2 AM)
crontab -e

# Add ये line:
0 2 * * * pg_dump -U itr_user lastminuteitr_production > /root/backups/db-$(date +\%Y\%m\%d).sql
```

---

## **Troubleshooting URLs**

| Issue | Command |
|-------|---------|
| Check all processes | `pm2 list` |
| See all logs | `pm2 logs` |
| Frontend logs | `pm2 logs frontend` |
| Backend logs | `pm2 logs backend` |
| Nginx errors | `tail -f /var/log/nginx/error.log` |
| Database test | `psql -U itr_user -d lastminuteitr_production` |
| Port 3000 check | `lsof -i :3000` |
| Port 5000 check | `lsof -i :5000` |
| Kill process | `kill -9 <PID>` |

---

## **Important: GitHub Repository**

Script को run करने से पहले, अपना GitHub repository code को push करो:

```bash
# अपने local machine पर
git remote add origin https://github.com/YOUR-USERNAME/lastminuteitr.git
git push -u origin main
```

फिर script में ये URL use करो:
```
GITHUB_REPO="https://github.com/YOUR-USERNAME/lastminuteitr.git"
```

---

## **Questions के Answers**

**Q: Script run करने में कितना time लगेगा?**
A: ~2-3 घंटे। Internet speed पर depend करता है।

**Q: Domain setup कैसे होगी?**
A: DNS record को VPS IP (200.97.160.215) पर point करो।

**Q: SSL certificate automatic update होगा?**
A: हाँ, Let's Encrypt automatic renew होता है।

**Q: Database password कहाँ safe करूँ?**
A: कहीं password manager में save करो, publicly share मत करो।

**Q: Scale करना पड़े तो?**
A: RAM/CPU upgrade करो या load balancer add करो।

---

## **Summary**

```
1. SSH से connect करो
2. Script upload करो
3. GitHub URL configure करो
4. Script run करो (sit back, enjoy coffee ☕)
5. Browser में test करो
6. Coupons बनाओ
7. Payment flow test करो
8. Go live! 🚀
```

**Ready? Let's do this!** 💪

