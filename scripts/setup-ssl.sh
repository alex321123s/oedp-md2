#!/bin/bash
# ÖDP-MD² SSL Certificate Setup with Let's Encrypt
# Usage: ./scripts/setup-ssl.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DOMAIN="md2.oedp.de"
EMAIL="it-support@oedp.de"
STAGING=0  # Set to 1 for testing

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root (use sudo)"
    exit 1
fi

log_info "=========================================="
log_info "SSL Certificate Setup for ÖDP-MD²"
log_info "Domain: $DOMAIN"
log_info "Email: $EMAIL"
log_info "=========================================="
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    log_info "Installing certbot..."
    
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    elif [ -f /etc/redhat-release ]; then
        # RHEL/CentOS
        yum install -y certbot python3-certbot-nginx
    else
        log_error "Unsupported OS. Please install certbot manually."
        exit 1
    fi
    
    log_info "Certbot installed ✓"
fi

# Stop nginx if running
if systemctl is-active --quiet nginx; then
    log_info "Stopping nginx..."
    systemctl stop nginx
fi

# Obtain certificate
log_info "Obtaining SSL certificate..."

if [ $STAGING -eq 1 ]; then
    log_warn "Running in STAGING mode (test certificate)"
    certbot certonly --standalone \
        --preferred-challenges http \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --staging \
        -d $DOMAIN \
        -d www.$DOMAIN \
        -d api.$DOMAIN \
        -d monitoring.$DOMAIN
else
    certbot certonly --standalone \
        --preferred-challenges http \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN \
        -d api.$DOMAIN \
        -d monitoring.$DOMAIN
fi

if [ $? -eq 0 ]; then
    log_info "SSL certificate obtained successfully ✓"
else
    log_error "Failed to obtain SSL certificate"
    exit 1
fi

# Set up auto-renewal
log_info "Setting up automatic certificate renewal..."

# Create renewal hook script
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh << 'EOF'
#!/bin/bash
docker-compose -f /opt/oedp-md2/docker-compose.prod.yml restart nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

# Test renewal
log_info "Testing certificate renewal..."
certbot renew --dry-run

if [ $? -eq 0 ]; then
    log_info "Certificate renewal test passed ✓"
else
    log_warn "Certificate renewal test failed. Please check configuration."
fi

# Create cron job for renewal (runs twice daily)
CRON_CMD="0 0,12 * * * certbot renew --quiet --deploy-hook 'docker-compose -f /opt/oedp-md2/docker-compose.prod.yml restart nginx'"

if ! crontab -l | grep -q "certbot renew"; then
    (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
    log_info "Cron job for certificate renewal created ✓"
fi

# Display certificate info
log_info "Certificate information:"
certbot certificates

echo ""
log_info "=========================================="
log_info "SSL Setup Completed Successfully! 🎉"
log_info "=========================================="
echo ""
log_info "Certificates are located at:"
log_info "  /etc/letsencrypt/live/$DOMAIN/"
echo ""
log_info "Auto-renewal is configured to run twice daily"
echo ""
log_info "Next steps:"
log_info "  1. Update nginx configuration to use these certificates"
log_info "  2. Restart nginx: docker-compose -f docker-compose.prod.yml restart nginx"
log_info "  3. Test HTTPS: https://$DOMAIN"
echo ""
