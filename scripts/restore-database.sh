#!/bin/bash
# ÖDP-MD² Database Restore Script
# Usage: ./scripts/restore-database.sh [backup-file]

set -e

# Configuration
BACKUP_DIR="/var/backups/oedp-md2"
DB_CONTAINER="oedp-md2-db-prod"
DB_NAME="oedp_md2_production"
DB_USER="oedp_prod_user"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if backup file is provided
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    log_info "Available backups:"
    ls -lh "$BACKUP_DIR"/oedp-md2-backup-*.sql.gz 2>/dev/null || log_warn "No backups found"
    echo ""
    log_error "Usage: $0 <backup-file>"
    log_info "Example: $0 $BACKUP_DIR/oedp-md2-backup-20251019_120000.sql.gz"
    exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

log_warn "=========================================="
log_warn "DATABASE RESTORE WARNING"
log_warn "=========================================="
log_warn "This will REPLACE the current database!"
log_warn "Backup file: $BACKUP_FILE"
log_warn "Database: $DB_NAME"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log_info "Restore cancelled."
    exit 0
fi

# Check if container is running
if ! docker ps | grep -q $DB_CONTAINER; then
    log_error "Database container is not running!"
    exit 1
fi

log_info "Starting database restore..."

# Create backup of current database before restore
CURRENT_BACKUP="$BACKUP_DIR/pre-restore-$(date +%Y%m%d_%H%M%S).sql"
log_info "Creating backup of current database..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER -Fc $DB_NAME > "$CURRENT_BACKUP"
gzip "$CURRENT_BACKUP"
log_info "Current database backed up to: ${CURRENT_BACKUP}.gz ✓"

# Stop application to prevent new connections
log_info "Stopping backend application..."
docker-compose -f /opt/oedp-md2/docker-compose.prod.yml stop backend

# Terminate existing connections
log_info "Terminating existing database connections..."
docker exec $DB_CONTAINER psql -U $DB_USER -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"

# Drop and recreate database
log_info "Dropping database..."
docker exec $DB_CONTAINER psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

log_info "Creating database..."
docker exec $DB_CONTAINER psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"

# Restore from backup
log_info "Restoring database from: $BACKUP_FILE"

if [[ $BACKUP_FILE == *.gz ]]; then
    # Decompress and restore
    gunzip -c "$BACKUP_FILE" | docker exec -i $DB_CONTAINER pg_restore -U $DB_USER -d $DB_NAME --no-owner --no-privileges
else
    # Restore directly
    cat "$BACKUP_FILE" | docker exec -i $DB_CONTAINER pg_restore -U $DB_USER -d $DB_NAME --no-owner --no-privileges
fi

if [ $? -eq 0 ]; then
    log_info "Database restored successfully ✓"
    
    # Restart application
    log_info "Starting backend application..."
    docker-compose -f /opt/oedp-md2/docker-compose.prod.yml start backend
    
    # Wait for application to be ready
    sleep 10
    
    # Health check
    HEALTH=$(curl -s http://localhost:3000/health | grep -o "healthy" || echo "unhealthy")
    
    if [ "$HEALTH" = "healthy" ]; then
        log_info "Application health check: PASSED ✓"
    else
        log_error "Application health check: FAILED ✗"
        log_warn "You may need to check application logs"
    fi
    
    log_info "=========================================="
    log_info "Restore completed successfully! 🎉"
    log_info "=========================================="
else
    log_error "Restore failed!"
    log_warn "Attempting to restore from pre-restore backup..."
    
    gunzip -c "${CURRENT_BACKUP}.gz" | docker exec -i $DB_CONTAINER pg_restore -U $DB_USER -d $DB_NAME --no-owner --no-privileges
    
    docker-compose -f /opt/oedp-md2/docker-compose.prod.yml start backend
    
    log_error "Original database has been restored"
    exit 1
fi
