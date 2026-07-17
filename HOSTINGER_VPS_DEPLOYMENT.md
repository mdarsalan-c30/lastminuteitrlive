# Hostinger VPS पर Deploy करना - Complete Guide

**Status:** Production-ready for VPS deployment

---

## Prerequisites (पहले ये सेटअप करो)

### 1. VPS पर SSH Access
```bash
# अपना terminal खोलो
ssh root@your-vps-ip-address
# Password दो जो Hostinger ने दिया

# या अगर SSH key है:
ssh -i your-key.pem root@your-vps-ip-address
```

### 2. VPS Details जो जानना जरूरी है:
- VPS IP Address: `__.__.__.__ `
- Root Password: ` `
- OS: Ubuntu 22.04 (recommended)
- RAM: minimum 2GB (1GB चल सकता है पर slow होगा)

---

## **Phase 1: VPS Setup (30 minutes)**

### Step 1: System Update करो

```bash
ssh root@your-vps-ip-address
```

अंदर जाने के बाद:

```bash
apt update && apt upgrade -y
```

### Step 2: Node.js Install करो

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs npm

# Verify
node -v
npm -v
```

### Step 3: Python Install करो

```bash
apt install -y python3 python3-pip python3-venv

# Verify
python3 --version
pip3 --version
```

### Step 4: PostgreSQL Install करो

```bash
apt install -y postgresql postgresql-contrib

# Start service
systemctl start postgresql
systemctl enable postgresql

# Verify
sudo -u postgres psql --version
```

### Step 5: Nginx Install करो (Reverse Proxy के लिए)

```bash
apt install -y nginx

# Start service
systemctl start nginx
systemctl enable nginx
```

### Step 6: Git Install करो

```bash
apt install -y git
git --version
```

### Step 7: PM2 Install करो (Process Manager)

```bash
npm install -g pm2
pm2 --version
```

---

## **Phase 2: Database Setup (15 minutes)**

### Step 1: Database Create करो

```bash
sudo -u postgres psql

# अंदर जाने के बाद:
CREATE DATABASE lastminuteitr_production;
CREATE USER itr_user WITH PASSWORD 'your-secure-password-here';
ALTER ROLE itr_user SET client_encoding TO 'utf8';
ALTER ROLE itr_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE itr_user SET default_transaction_deferrable TO on;
ALTER ROLE itr_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE lastminuteitr_production TO itr_user;
\q
```

### Step 2: Connection Test करो

```bash
psql -h localhost -U itr_user -d lastminuteitr_production

# अंदर type करो: \l (database list दिखेगी)
# Exit: \q
```

### Step 3: DATABASE_URL Note करो

```
postgresql://itr_user:your-secure-password-here@localhost:5432/lastminuteitr_production
```

इसे save करो - बाद में चाहिए।

---

## **Phase 3: Frontend Deploy (30 minutes)**

### Step 1: Code Clone करो

```bash
cd /var/www
git clone https://github.com/YOUR-USERNAME/LASTMINUTEITR.git
cd LASTMINUTEITR/ITR-filing-temp/frontend
```

### Step 2: Environment Variables सेटअप करो

```bash
nano .env.production.local
```

ये add करो:

```
# Database
DATABASE_URL="postgresql://itr_user:your-password@localhost:5432/lastminuteitr_production"

# Razorpay
RAZORPAY_KEY_ID=rzp_test_TEOyvQKS2Gb00I
RAZORPAY_KEY_SECRET=b6d36JNa4V5EUXpCmJPMg6vk
PAYMENT_SESSION_SECRET=generate-random-32-char-secret-key-here

# Engine URL
NEXT_PUBLIC_ENGINE_URL=http://localhost:5000/api/compute

# App
NEXT_PUBLIC_APP_URL=https://lastminuteitr.in
NODE_ENV=production
```

Save करो: `Ctrl+X`, फिर `Y`, फिर `Enter`

### Step 3: Dependencies Install करो

```bash
npm install
```

### Step 4: Build करो

```bash
npm run build
```

### Step 5: PM2 से Start करो

```bash
pm2 start npm --name "frontend" -- start
pm2 save
pm2 startup
```

Verify:
```bash
pm2 list
pm2 logs frontend
```

---

## **Phase 4: Backend Deploy (30 minutes)**

### Step 1: Backend Folder में जाओ

```bash
cd /var/www/LASTMINUTEITR/ITR-filing-temp/backend
```

### Step 2: Python Virtual Environment बनाओ

```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Dependencies Install करो

```bash
pip install -r requirements.txt
```

अगर `requirements.txt` नहीं है:

```bash
pip install pandas numpy pydantic gunicorn flask
pip freeze > requirements.txt
```

### Step 4: Backend Start करो

```bash
gunicorn -w 2 -b 0.0.0.0:5000 api.compute:app
```

यह देखना चाहिए:
```
[SUCCESS] Server is running on 0.0.0.0:5000
```

अगर error है तो:
```bash
python3 api/compute.py  # Direct चलाने की कोशिश करो
```

### Step 5: PM2 से Manage करो

```bash
# वापस सामान्य terminal पर जाओ (Ctrl+C से backend बंद करो)
deactivate

cd /var/www/LASTMINUTEITR/ITR-filing-temp/backend

# PM2 ecosystem file बनाओ
nano ecosystem.config.js
```

Copy करो:

```javascript
module.exports = {
  apps: [{
    name: 'backend',
    script: './venv/bin/gunicorn',
    args: '-w 2 -b 0.0.0.0:5000 api.compute:app',
    cwd: '/var/www/LASTMINUTEITR/ITR-filing-temp/backend',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

फिर:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 logs backend
```

---

## **Phase 5: Nginx Configuration (20 minutes)**

### Step 1: Nginx Config File बनाओ

```bash
sudo nano /etc/nginx/sites-available/lastminuteitr
```

Copy करो:

```nginx
upstream frontend {
    server 127.0.0.1:3000;
}

upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name lastminuteitr.in www.lastminuteitr.in;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name lastminuteitr.in www.lastminuteitr.in;
    
    # SSL Certificates (लेटर में, अभी self-signed use करो)
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/compute {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save करो: `Ctrl+X` → `Y` → `Enter`

### Step 2: Enable करो

```bash
sudo ln -s /etc/nginx/sites-available/lastminuteitr /etc/nginx/sites-enabled/

# Test करो
sudo nginx -t

# Reload करो
sudo systemctl reload nginx
```

---

## **Phase 6: SSL Certificate (Let's Encrypt)**

### Step 1: Certbot Install करो

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Certificate प्राप्त करो

```bash
sudo certbot certonly --nginx -d lastminuteitr.in -d www.lastminuteitr.in
```

Email दो और accept करो।

### Step 3: Nginx Config Update करो

```bash
sudo nano /etc/nginx/sites-available/lastminuteitr
```

Certificate paths update करो:

```nginx
ssl_certificate /etc/letsencrypt/live/lastminuteitr.in/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/lastminuteitr.in/privkey.pem;
```

Reload करो:
```bash
sudo systemctl reload nginx
```

---

## **Phase 7: Verification**

### Test करो

```bash
# Frontend running?
curl http://localhost:3000

# Backend running?
curl -X POST http://localhost:5000/api/compute \
  -H "Content-Type: application/json" \
  -d '{"age":30}'

# Nginx?
curl https://lastminuteitr.in
```

### Logs देखो

```bash
# Frontend
pm2 logs frontend

# Backend
pm2 logs backend

# Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## **Maintenance**

### Backup Database

```bash
# Daily backup script बनाओ
nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
pg_dump -U itr_user lastminuteitr_production > /backups/db_$TIMESTAMP.sql
```

```bash
chmod +x /usr/local/bin/backup-db.sh

# Cron job (रोज रात 2 बजे)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

### Process Restart करो अगर Crash हो

```bash
pm2 restart all
pm2 logs
```

### Updates लगाओ

```bash
cd /var/www/LASTMINUTEITR/ITR-filing-temp/frontend
git pull origin main
npm install
npm run build
pm2 restart frontend
```

---

## **Troubleshooting**

### Frontend Port 3000 पर नहीं चल रहा?

```bash
# Check करो कौन use कर रहा है
lsof -i :3000

# Kill करो
kill -9 <PID>

# Restart करो
pm2 restart frontend
```

### Backend 5000 पर नहीं चल रहा?

```bash
# Check करो
lsof -i :5000

# Kill करो
kill -9 <PID>

# Restart करो
pm2 restart backend
```

### Database connection fail?

```bash
# Test करो
psql -h localhost -U itr_user -d lastminuteitr_production

# अगर fail है तो:
sudo systemctl restart postgresql
```

### Nginx 443 error?

```bash
sudo nginx -t  # Syntax check करो
sudo systemctl reload nginx
```

---

## **Checklist**

- [ ] VPS पर SSH access है
- [ ] Node.js, Python, PostgreSQL, Nginx installed
- [ ] Database बनाया है
- [ ] Frontend code clone किया है
- [ ] .env.production.local में variables add किए
- [ ] npm install + npm run build किया
- [ ] Backend code clone किया है
- [ ] pip install dependencies किए
- [ ] PM2 से दोनों running हैं
- [ ] Nginx configured है
- [ ] SSL certificate है
- [ ] https://lastminuteitr.in accessible है

---

## **Timeline**

| Phase | Time |
|-------|------|
| VPS Setup | 30 min |
| Database | 15 min |
| Frontend | 30 min |
| Backend | 30 min |
| Nginx | 20 min |
| SSL | 10 min |
| **Total** | ~2.5 hours |

---

## **Cost on Hostinger**

- **VPS**: ₹500-800/month (2GB RAM)
- **Domain**: ₹500/year
- **SSL**: FREE (Let's Encrypt)
- **Total**: ~₹50-70/day

Vercel से सस्ता है!

---

## **Important Notes**

1. **Backup लगवाओ database का regularly**
2. **Monitor करो RAM/CPU usage** (हो सकता है scale करना पड़े)
3. **Update करो security patches regularly**
4. **SSL certificate auto-renews** (90 days)
5. **PM2 monitoring setup करो** (`pm2 web` → port 9615 पर dashboard)

---

## Questions?

कहीं stuck हो तो बताना।

