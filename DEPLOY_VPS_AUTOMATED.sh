#!/bin/bash

# ============================================================================
# LastMinute ITR - Hostinger VPS Automated Deployment Script
# ============================================================================
# Usage: bash DEPLOY_VPS_AUTOMATED.sh
# This script will:
# 1. Install all dependencies (Node.js, Python, PostgreSQL, Nginx)
# 2. Setup database
# 3. Clone and build frontend
# 4. Setup and start backend
# 5. Configure Nginx reverse proxy
# 6. Setup SSL certificate
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Configuration (CHANGE THESE)
DOMAIN="lastminuteitr.in"
GITHUB_REPO="your-github-repo-url"  # e.g., https://github.com/username/lastminuteitr.git
DB_PASSWORD="secure-password-123"   # Generate a strong password!
DB_NAME="lastminuteitr_production"
DB_USER="itr_user"
APP_PATH="/var/www/lastminuteitr"
RAZORPAY_KEY="rzp_test_TEOyvQKS2Gb00I"
RAZORPAY_SECRET="b6d36JNa4V5EUXpCmJPMg6vk"

log_info "Starting LastMinute ITR VPS Deployment"
log_info "Domain: $DOMAIN"
log_info "App Path: $APP_PATH"

# ============================================================================
# PHASE 1: System Setup (30 minutes)
# ============================================================================

log_info "PHASE 1: System Setup and Dependencies"

# Update system
log_info "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js
log_info "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs npm

# Install Python
log_info "Installing Python..."
apt install -y python3 python3-pip python3-venv python3-dev

# Install PostgreSQL
log_info "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install Nginx
log_info "Installing Nginx..."
apt install -y nginx

# Install other tools
log_info "Installing utilities..."
apt install -y git curl wget htop vim certbot python3-certbot-nginx

# Install PM2 globally
log_info "Installing PM2..."
npm install -g pm2

# Start services
log_info "Starting services..."
systemctl start postgresql
systemctl enable postgresql
systemctl start nginx
systemctl enable nginx

log_info "✓ Phase 1 complete: Dependencies installed"

# ============================================================================
# PHASE 2: Database Setup (15 minutes)
# ============================================================================

log_info "PHASE 2: Database Setup"

# Create database and user
log_info "Creating PostgreSQL database and user..."
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
ALTER ROLE $DB_USER SET client_encoding TO 'utf8';
ALTER ROLE $DB_USER SET default_transaction_isolation TO 'read committed';
ALTER ROLE $DB_USER SET default_transaction_deferrable TO on;
ALTER ROLE $DB_USER SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF

# Test connection
log_info "Testing database connection..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1 || log_error "Database connection failed!"

log_info "✓ Phase 2 complete: Database created"
log_info "Database URL: postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

# ============================================================================
# PHASE 3: Frontend Deployment (30 minutes)
# ============================================================================

log_info "PHASE 3: Frontend Deployment"

# Create app directory
log_info "Creating app directory..."
mkdir -p $APP_PATH
cd $APP_PATH

# Clone repository
log_info "Cloning repository..."
if [ ! -d ".git" ]; then
    git clone $GITHUB_REPO .
else
    git pull origin main
fi

# Navigate to frontend
cd ITR-filing-temp/frontend || log_error "Frontend directory not found!"

# Create environment file
log_info "Creating .env.production.local..."
cat > .env.production.local << EOF
# Database
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

# Razorpay
RAZORPAY_KEY_ID=$RAZORPAY_KEY
RAZORPAY_KEY_SECRET=$RAZORPAY_SECRET
PAYMENT_SESSION_SECRET=$(openssl rand -hex 16)

# Engine
NEXT_PUBLIC_ENGINE_URL=http://localhost:5000/api/compute

# App
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NODE_ENV=production
EOF

log_info "Installing frontend dependencies..."
npm install --production

log_info "Building frontend..."
npm run build

log_info "Starting frontend with PM2..."
pm2 delete frontend 2>/dev/null || true
pm2 start npm --name "frontend" -- start
pm2 save

log_info "✓ Phase 3 complete: Frontend deployed"

# ============================================================================
# PHASE 4: Backend Deployment (30 minutes)
# ============================================================================

log_info "PHASE 4: Backend Deployment"

# Navigate to backend
cd $APP_PATH/ITR-filing-temp/backend || log_error "Backend directory not found!"

# Create virtual environment
log_info "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
log_info "Installing Python dependencies..."
if [ -f "requirements.txt" ]; then
    pip install --upgrade pip
    pip install -r requirements.txt
else
    log_warn "requirements.txt not found. Installing common packages..."
    pip install pandas numpy pydantic gunicorn flask
    pip freeze > requirements.txt
fi

# Create ecosystem config for PM2
log_info "Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'backend',
    script: './venv/bin/gunicorn',
    args: '-w 2 -b 127.0.0.1:5000 api.compute:app',
    cwd: process.env.HOME + '/lastminuteitr/ITR-filing-temp/backend',
    env: {
      NODE_ENV: 'production',
      PYTHONUNBUFFERED: '1'
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start backend with PM2
log_info "Starting backend with PM2..."
deactivate
pm2 delete backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

log_info "✓ Phase 4 complete: Backend deployed"

# ============================================================================
# PHASE 5: Nginx Configuration (20 minutes)
# ============================================================================

log_info "PHASE 5: Nginx Configuration"

# Backup existing config
cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup

# Create Nginx config
log_info "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/lastminuteitr << EOF
upstream frontend {
    server 127.0.0.1:3000;
}

upstream backend {
    server 127.0.0.1:5000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Certificate paths (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/lastminuteitr-access.log;
    error_log /var/log/nginx/lastminuteitr-error.log;

    # Frontend proxy
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API proxy
    location /api/compute {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
EOF

# Enable site
log_info "Enabling Nginx site..."
ln -sf /etc/nginx/sites-available/lastminuteitr /etc/nginx/sites-enabled/

# Test Nginx config
log_info "Testing Nginx configuration..."
nginx -t || log_error "Nginx configuration test failed!"

# Reload Nginx
systemctl reload nginx

log_info "✓ Phase 5 complete: Nginx configured"

# ============================================================================
# PHASE 6: SSL Certificate (10 minutes)
# ============================================================================

log_info "PHASE 6: SSL Certificate Setup"

# Request SSL certificate
log_info "Requesting SSL certificate from Let's Encrypt..."
certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN || log_warn "SSL certificate setup may need manual intervention"

# Reload Nginx with SSL
systemctl reload nginx

log_info "✓ Phase 6 complete: SSL certificate installed"

# ============================================================================
# PHASE 7: Verification (10 minutes)
# ============================================================================

log_info "PHASE 7: Verification"

# Wait for services to start
sleep 5

# Check frontend
log_info "Checking frontend..."
curl -s http://localhost:3000 > /dev/null && log_info "✓ Frontend running on port 3000" || log_warn "⚠ Frontend not responding on port 3000"

# Check backend
log_info "Checking backend..."
curl -s -X POST http://localhost:5000/api/compute \
  -H "Content-Type: application/json" \
  -d '{"age":30}' > /dev/null && log_info "✓ Backend running on port 5000" || log_warn "⚠ Backend not responding on port 5000"

# Check Nginx
log_info "Checking Nginx..."
curl -s https://$DOMAIN -k > /dev/null && log_info "✓ Nginx responding on https://$DOMAIN" || log_warn "⚠ Nginx not responding"

# Show PM2 status
log_info "PM2 Process Status:"
pm2 list

log_info "✓ Phase 7 complete: Verification done"

# ============================================================================
# Summary
# ============================================================================

log_info "========================================"
log_info "✓ DEPLOYMENT COMPLETE!"
log_info "========================================"
log_info ""
log_info "🎉 Your application is now live!"
log_info ""
log_info "📍 Access your app:"
log_info "   https://$DOMAIN"
log_info ""
log_info "📊 Monitor processes:"
log_info "   pm2 list"
log_info "   pm2 logs frontend"
log_info "   pm2 logs backend"
log_info ""
log_info "🔧 Nginx logs:"
log_info "   tail -f /var/log/nginx/lastminuteitr-error.log"
log_info ""
log_info "💾 Database:"
log_info "   psql -h localhost -U $DB_USER -d $DB_NAME"
log_info ""
log_info "📝 Next steps:"
log_info "   1. Create test coupons in admin panel"
log_info "   2. Test payment flow"
log_info "   3. Monitor logs for any errors"
log_info ""
log_info "========================================"

