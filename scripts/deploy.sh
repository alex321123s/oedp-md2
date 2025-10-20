#!/bin/bash
# ÖDP-MD² Production Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
LOG_FILE="$PROJECT_ROOT/logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env.production exists
    if [ ! -f "$PROJECT_ROOT/backend/.env.production" ]; then
        log_error "backend/.env.production not found. Please create it from .env.production.example"
        exit 1
    fi
    
    log_info "All requirements met ✓"
}

backup_database() {
    log_info "Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    if docker ps | grep -q oedp-md2-db-prod; then
        BACKUP_FILE="$BACKUP_DIR/db-backup-$(date +%Y%m%d-%H%M%S).sql"
        docker exec oedp-md2-db-prod pg_dump -U oedp_prod_user oedp_md2_production > "$BACKUP_FILE"
        
        if [ -f "$BACKUP_FILE" ]; then
            log_info "Database backup created: $BACKUP_FILE ✓"
            
            # Compress backup
            gzip "$BACKUP_FILE"
            log_info "Backup compressed ✓"
        else
            log_warn "Database backup failed (this is OK for first deployment)"
        fi
    else
        log_warn "Database container not running (this is OK for first deployment)"
    fi
}

pull_latest_code() {
    log_info "Pulling latest code from repository..."
    
    cd "$PROJECT_ROOT"
    
    # Stash any local changes
    if [ -d ".git" ]; then
        git stash
        git pull origin main
        log_info "Code updated ✓"
    else
        log_warn "Not a git repository. Skipping git pull."
    fi
}

build_images() {
    log_info "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Build with production compose file
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    log_info "Docker images built ✓"
}

run_migrations() {
    log_info "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    docker-compose -f docker-compose.prod.yml exec -T backend npm run migration:run
    
    log_info "Migrations completed ✓"
}

start_services() {
    log_info "Starting services..."
    
    cd "$PROJECT_ROOT"
    
    # Start services with production compose file
    docker-compose -f docker-compose.prod.yml up -d
    
    log_info "Services started ✓"
}

health_check() {
    log_info "Performing health checks..."
    
    # Wait for services to be ready
    sleep 15
    
    # Check backend health
    BACKEND_HEALTH=$(curl -s http://localhost:3000/health | grep -o "healthy" || echo "unhealthy")
    
    if [ "$BACKEND_HEALTH" = "healthy" ]; then
        log_info "Backend health check: PASSED ✓"
    else
        log_error "Backend health check: FAILED ✗"
        exit 1
    fi
    
    # Check frontend
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80)
    
    if [ "$FRONTEND_STATUS" = "200" ]; then
        log_info "Frontend health check: PASSED ✓"
    else
        log_error "Frontend health check: FAILED ✗"
        exit 1
    fi
}

cleanup_old_images() {
    log_info "Cleaning up old Docker images..."
    
    docker image prune -af --filter "until=24h"
    
    log_info "Cleanup completed ✓"
}

show_status() {
    log_info "Deployment Status:"
    echo ""
    docker-compose -f docker-compose.prod.yml ps
    echo ""
    log_info "Deployment completed successfully! 🎉"
    echo ""
    log_info "Access your application at: https://md2.oedp.de"
    log_info "Monitoring dashboard: https://monitoring.md2.oedp.de"
    echo ""
    log_info "Logs are available at: $LOG_FILE"
}

rollback() {
    log_error "Deployment failed. Rolling back..."
    
    # Stop current containers
    docker-compose -f docker-compose.prod.yml down
    
    # Restore from backup if available
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/db-backup-*.sql.gz 2>/dev/null | head -n 1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        log_info "Restoring database from: $LATEST_BACKUP"
        gunzip -c "$LATEST_BACKUP" | docker exec -i oedp-md2-db-prod psql -U oedp_prod_user oedp_md2_production
    fi
    
    log_error "Rollback completed. Please check logs at: $LOG_FILE"
    exit 1
}

# Main deployment flow
main() {
    echo ""
    log_info "=========================================="
    log_info "ÖDP-MD² Production Deployment"
    log_info "Environment: $ENVIRONMENT"
    log_info "Time: $(date)"
    log_info "=========================================="
    echo ""
    
    # Set trap for errors
    trap rollback ERR
    
    check_requirements
    backup_database
    pull_latest_code
    build_images
    start_services
    run_migrations
    health_check
    cleanup_old_images
    show_status
}

# Run main function
main
