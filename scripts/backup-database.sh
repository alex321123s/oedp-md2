#!/bin/bash
# ÖDP-MD² Database Backup Script
# Usage: ./scripts/backup-database.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/oedp-md2"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="oedp-md2-backup-$DATE.sql"
DB_CONTAINER="oedp-md2-db-prod"
DB_NAME="oedp_md2_production"
DB_USER="oedp_prod_user"

# S3 Configuration (optional)
S3_ENABLED=${S3_ENABLED:-false}
S3_BUCKET=${S3_BUCKET:-""}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log_info "Starting database backup..."

# Check if container is running
if ! docker ps | grep -q $DB_CONTAINER; then
    log_error "Database container is not running!"
    exit 1
fi

# Create backup
log_info "Creating backup: $BACKUP_FILE"
docker exec $DB_CONTAINER pg_dump -U $DB_USER -Fc $DB_NAME > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    log_info "Backup created successfully ✓"
    
    # Compress backup
    log_info "Compressing backup..."
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    
    COMPRESSED_FILE="$BACKUP_FILE.gz"
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_FILE" | cut -f1)
    log_info "Backup compressed: $COMPRESSED_FILE ($BACKUP_SIZE) ✓"
    
    # Upload to S3 if enabled
    if [ "$S3_ENABLED" = "true" ] && [ -n "$S3_BUCKET" ]; then
        log_info "Uploading backup to S3..."
        aws s3 cp "$BACKUP_DIR/$COMPRESSED_FILE" "s3://$S3_BUCKET/backups/$COMPRESSED_FILE"
        
        if [ $? -eq 0 ]; then
            log_info "Backup uploaded to S3 ✓"
        else
            log_error "Failed to upload backup to S3"
        fi
    fi
    
    # Clean up old backups
    log_info "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
    find "$BACKUP_DIR" -name "oedp-md2-backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "oedp-md2-backup-*.sql.gz" | wc -l)
    log_info "Cleanup completed. Remaining backups: $REMAINING_BACKUPS ✓"
    
    # Create latest symlink
    ln -sf "$BACKUP_DIR/$COMPRESSED_FILE" "$BACKUP_DIR/latest.sql.gz"
    
    log_info "=========================================="
    log_info "Backup completed successfully! 🎉"
    log_info "File: $BACKUP_DIR/$COMPRESSED_FILE"
    log_info "Size: $BACKUP_SIZE"
    log_info "=========================================="
else
    log_error "Backup failed!"
    exit 1
fi
