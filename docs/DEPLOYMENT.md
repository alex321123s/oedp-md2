# ÖDP-MD² Production Deployment Guide

Complete guide for deploying ÖDP-MD² to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [SSL Configuration](#ssl-configuration)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Deployment](#deployment)
7. [Monitoring Setup](#monitoring-setup)
8. [Backup Configuration](#backup-configuration)
9. [Security Hardening](#security-hardening)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Hardware Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4 GB
- Storage: 50 GB SSD
- Bandwidth: 100 Mbps

**Recommended:**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 100 GB SSD
- Bandwidth: 1 Gbps

### Software Requirements

- Ubuntu 22.04 LTS (or similar)
- Docker 24.0+
- Docker Compose 2.0+
- Git
- OpenSSL

---

## Server Setup

### 1. Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
    curl \
    git \
    ufw \
    fail2ban \
    unattended-upgrades \
    certbot \
    postgresql-client

# Set timezone
sudo timedatectl set-timezone Europe/Berlin
```

### 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3. Configure Firewall

```bash
# Enable UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow monitoring (if needed)
sudo ufw allow 9090/tcp  # Prometheus
sudo ufw allow 3001/tcp  # Grafana

# Enable firewall
sudo ufw enable
```

---

## SSL Configuration

### Option 1: Let's Encrypt (Recommended)

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/oedp/md2-portal.git oedp-md2
cd oedp-md2

# Run SSL setup script
sudo ./scripts/setup-ssl.sh
```

**Manual steps:**
```bash
# Stop any running web servers
sudo systemctl stop nginx apache2

# Obtain certificate
sudo certbot certonly --standalone \
    -d md2.oedp.de \
    -d www.md2.oedp.de \
    -d api.md2.oedp.de \
    --email it-support@oedp.de \
    --agree-tos \
    --no-eff-email

# Certificates will be at:
# /etc/letsencrypt/live/md2.oedp.de/
```

### Option 2: Custom SSL Certificate

```bash
# Place your certificates at:
sudo mkdir -p /etc/ssl/oedp-md2
sudo cp your-cert.crt /etc/ssl/oedp-md2/cert.crt
sudo cp your-key.key /etc/ssl/oedp-md2/key.key
sudo cp ca-bundle.crt /etc/ssl/oedp-md2/ca-bundle.crt

# Update nginx configuration to use these paths
```

---

## Environment Configuration

### 1. Generate Secrets

```bash
# Generate JWT secret (64 characters)
openssl rand -base64 64

# Generate cookie secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

### 2. Configure Backend Environment

```bash
cd /opt/oedp-md2/backend

# Copy example file
cp .env.production.example .env.production

# Edit configuration
nano .env.production
```

**Critical settings to update:**

```env
# Database
DATABASE_URL=postgresql://oedp_prod_user:YOUR_STRONG_PASSWORD@localhost:5432/oedp_md2_production

# Security
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
COOKIE_SECRET=YOUR_GENERATED_COOKIE_SECRET_HERE

# Email
SMTP_HOST=smtp.your-provider.com
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Frontend URL
FRONTEND_URL=https://md2.oedp.de
```

### 3. Configure Frontend Environment

```bash
cd /opt/oedp-md2/frontend

# Create production environment
echo "VITE_API_URL=https://md2.oedp.de" > .env.production
```

### 4. Set Secure Permissions

```bash
# Protect sensitive files
chmod 600 /opt/oedp-md2/backend/.env.production
chown root:root /opt/oedp-md2/backend/.env.production
```

---

## Database Setup

### 1. Create Database User

```bash
# Start database container
cd /opt/oedp-md2
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for database to be ready
sleep 10

# Create production user (if not auto-created)
docker exec -it oedp-md2-db-prod psql -U postgres -c \
    "CREATE USER oedp_prod_user WITH PASSWORD 'YOUR_STRONG_PASSWORD';"

docker exec -it oedp-md2-db-prod psql -U postgres -c \
    "CREATE DATABASE oedp_md2_production OWNER oedp_prod_user;"

docker exec -it oedp-md2-db-prod psql -U postgres -c \
    "GRANT ALL PRIVILEGES ON DATABASE oedp_md2_production TO oedp_prod_user;"
```

### 2. Run Migrations

```bash
# Start backend temporarily
docker-compose -f docker-compose.prod.yml up -d backend

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run

# Create admin user
docker-compose -f docker-compose.prod.yml exec backend npm run seed:admin
```

---

## Deployment

### Automated Deployment

```bash
cd /opt/oedp-md2

# Run deployment script
sudo ./scripts/deploy.sh production
```

### Manual Deployment

```bash
cd /opt/oedp-md2

# Pull latest code
git pull origin main

# Build images
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Verify Deployment

```bash
# Check health endpoints
curl http://localhost:3000/health
curl http://localhost:80

# Check via HTTPS
curl https://md2.oedp.de
curl https://api.md2.oedp.de/health

# Test login
# Visit https://md2.oedp.de/login
```

---

## Monitoring Setup

### 1. Access Monitoring Dashboards

**Prometheus:** http://your-server-ip:9090  
**Grafana:** http://your-server-ip:3001

### 2. Configure Grafana

```bash
# Default credentials
Username: admin
Password: (set in .env or check GRAFANA_ADMIN_PASSWORD)

# After login:
1. Change admin password
2. Add Prometheus data source
3. Import dashboards from /monitoring/grafana/dashboards/
```

### 3. Set Up Alerts

**Email alerts:**
```bash
# Edit Grafana configuration
docker exec -it oedp-md2-grafana vi /etc/grafana/grafana.ini

# Add SMTP settings in [smtp] section
[smtp]
enabled = true
host = smtp.your-provider.com:587
user = your-email@oedp.de
password = your-password
from_address = monitoring@oedp.de
```

### 4. Install Additional Exporters

```bash
# Add to docker-compose.prod.yml:
# - Node Exporter (system metrics)
# - PostgreSQL Exporter (database metrics)
# - Nginx Exporter (web server metrics)
# - Redis Exporter (cache metrics)
```

---

## Backup Configuration

### 1. Automated Backups

```bash
# Test backup script
sudo /opt/oedp-md2/scripts/backup-database.sh

# Schedule daily backups
sudo crontab -e

# Add this line (runs at 2 AM daily):
0 2 * * * /opt/oedp-md2/scripts/backup-database.sh >> /var/log/oedp-md2/backup.log 2>&1
```

### 2. S3 Backup Configuration (Optional)

```bash
# Install AWS CLI
sudo apt install awscli -y

# Configure AWS credentials
aws configure

# Test S3 upload
aws s3 ls s3://your-backup-bucket/

# Enable S3 in backup script
export S3_ENABLED=true
export S3_BUCKET=your-backup-bucket
```

### 3. Backup Retention

```bash
# Edit backup script to change retention
nano /opt/oedp-md2/scripts/backup-database.sh

# Change RETENTION_DAYS variable
RETENTION_DAYS=30  # Keep 30 days of backups
```

### 4. Test Restore

```bash
# List available backups
ls -lh /var/backups/oedp-md2/

# Restore from backup
sudo /opt/oedp-md2/scripts/restore-database.sh /var/backups/oedp-md2/latest.sql.gz
```

---

## Security Hardening

### 1. Enable Fail2Ban

```bash
# Install fail2ban
sudo apt install fail2ban -y

# Create custom jail for ÖDP-MD²
sudo nano /etc/fail2ban/jail.local
```

Add:
```ini
[oedp-md2]
enabled = true
port = 443
filter = oedp-md2
logpath = /var/log/nginx/access.log
maxretry = 5
bantime = 3600
```

### 2. Security Headers

Already configured in `nginx/nginx.prod.conf`:
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy

### 3. Rate Limiting

Configure in `.env.production`:
```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100   # 100 requests per window
AUTH_RATE_LIMIT_MAX=5         # 5 auth attempts per window
```

### 4. Database Security

```bash
# Restrict PostgreSQL network access
# Edit /var/lib/docker/volumes/.../postgresql.conf
listen_addresses = 'localhost'

# Use SSL for database connections
# Add to DATABASE_URL:
?sslmode=require
```

### 5. Regular Updates

```bash
# Enable automatic security updates
sudo dpkg-reconfigure --priority=low unattended-upgrades

# Manual updates
sudo apt update && sudo apt upgrade -y

# Update Docker images
cd /opt/oedp-md2
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Application Not Starting

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Check resource usage
docker stats
```

### Database Connection Issues

```bash
# Test database connection
docker exec -it oedp-md2-db-prod psql -U oedp_prod_user -d oedp_md2_production

# Check database logs
docker logs oedp-md2-db-prod

# Verify environment variables
docker exec oedp-md2-backend-prod env | grep DATABASE_URL
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test HTTPS
curl -v https://md2.oedp.de
```

### High Memory Usage

```bash
# Check memory usage
free -h
docker stats

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Optimize PostgreSQL
# Edit postgresql.conf:
shared_buffers = 256MB
effective_cache_size = 1GB
```

### Performance Issues

```bash
# Check slow queries
docker exec oedp-md2-db-prod psql -U oedp_prod_user -d oedp_md2_production -c \
    "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Enable query logging
# Edit backend/.env.production:
LOG_LEVEL=debug

# Check Nginx access logs
tail -f /var/log/nginx/access.log
```

---

## Maintenance Tasks

### Daily
- Monitor application logs
- Check backup completion
- Review error rates in Grafana

### Weekly
- Review audit logs
- Check disk space
- Update dependencies (if needed)
- Test backup restore

### Monthly
- Security updates
- Certificate renewal check
- Database optimization (VACUUM, REINDEX)
- Review user activity

### Quarterly
- Full security audit
- Disaster recovery drill
- Performance review
- Documentation update

---

## Rollback Procedure

If deployment fails:

```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Restore from backup
sudo /opt/oedp-md2/scripts/restore-database.sh /var/backups/oedp-md2/latest.sql.gz

# Checkout previous version
git log --oneline -10  # Find previous commit
git checkout <previous-commit-hash>

# Redeploy
docker-compose -f docker-compose.prod.yml up -d

# Verify
curl http://localhost:3000/health
```

---

## Support Contacts

**Technical Support:** it-support@oedp.de  
**Security Issues:** security@oedp.de  
**Emergency Hotline:** +49 (0) 9391 504 61

---

## Checklist

### Pre-Deployment
- [ ] Server meets hardware requirements
- [ ] Docker and Docker Compose installed
- [ ] Firewall configured
- [ ] SSL certificates obtained
- [ ] Environment variables configured
- [ ] Strong passwords generated
- [ ] Backup strategy configured

### Deployment
- [ ] Database created and migrated
- [ ] Application containers running
- [ ] Health checks passing
- [ ] SSL working correctly
- [ ] Email notifications working
- [ ] Monitoring configured

### Post-Deployment
- [ ] Admin account created
- [ ] Test user registration
- [ ] Test motion creation
- [ ] Test signature collection
- [ ] Verify backups running
- [ ] Set up monitoring alerts
- [ ] Document credentials securely

---

**Last Updated:** October 2025  
**Version:** 1.0
