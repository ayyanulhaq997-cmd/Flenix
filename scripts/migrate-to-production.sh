#!/bin/bash

# Production Database Migration Script
# Migrates data from Replit development database to production database

set -e

echo "🚀 Fenix Streaming Platform - Production Migration"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
  echo -e "\n${YELLOW}Checking prerequisites...${NC}"
  
  command -v pg_dump >/dev/null 2>&1 || { echo -e "${RED}pg_dump not found${NC}"; exit 1; }
  command -v psql >/dev/null 2>&1 || { echo -e "${RED}psql not found${NC}"; exit 1; }
  command -v aws >/dev/null 2>&1 || { echo -e "${RED}AWS CLI not found${NC}"; exit 1; }
  
  echo -e "${GREEN}✓ All prerequisites found${NC}"
}

# Export from Replit
export_replit_db() {
  echo -e "\n${YELLOW}Exporting data from Replit database...${NC}"
  
  if [ -z "$REPLIT_DATABASE_URL" ]; then
    echo -e "${RED}REPLIT_DATABASE_URL not set${NC}"
    exit 1
  fi
  
  export PGPASSWORD="${REPLIT_DATABASE_URL##*:}"
  export PGPASSWORD="${PGPASSWORD%%@*}"
  
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_FILE="backups/fenix_dev_${TIMESTAMP}.sql"
  
  mkdir -p backups
  
  pg_dump "$REPLIT_DATABASE_URL" > "$BACKUP_FILE"
  
  echo -e "${GREEN}✓ Database exported to $BACKUP_FILE${NC}"
  echo "  Size: $(du -h $BACKUP_FILE | cut -f1)"
}

# Verify backup integrity
verify_backup() {
  echo -e "\n${YELLOW}Verifying backup integrity...${NC}"
  
  TABLES=$(grep -c "CREATE TABLE" "$BACKUP_FILE" || echo "0")
  
  if [ "$TABLES" -lt 5 ]; then
    echo -e "${RED}Backup appears incomplete (found $TABLES tables)${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✓ Backup verified ($TABLES tables)${NC}"
}

# Import to RDS
import_to_rds() {
  echo -e "\n${YELLOW}Importing to production RDS...${NC}"
  
  if [ -z "$PROD_DATABASE_URL" ]; then
    echo -e "${RED}PROD_DATABASE_URL not set${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}This will take a few minutes...${NC}"
  
  psql "$PROD_DATABASE_URL" < "$BACKUP_FILE"
  
  echo -e "${GREEN}✓ Data imported successfully${NC}"
}

# Verify production database
verify_prod_db() {
  echo -e "\n${YELLOW}Verifying production database...${NC}"
  
  MOVIE_COUNT=$(psql "$PROD_DATABASE_URL" -t -c "SELECT COUNT(*) FROM movies;")
  USER_COUNT=$(psql "$PROD_DATABASE_URL" -t -c "SELECT COUNT(*) FROM app_users;")
  SERIES_COUNT=$(psql "$PROD_DATABASE_URL" -t -c "SELECT COUNT(*) FROM series;")
  
  echo -e "${GREEN}✓ Production database verified:${NC}"
  echo "  Movies: $MOVIE_COUNT"
  echo "  Users: $USER_COUNT"
  echo "  Series: $SERIES_COUNT"
}

# Backup to S3
backup_to_s3() {
  echo -e "\n${YELLOW}Uploading backup to S3...${NC}"
  
  if [ -z "$BACKUP_BUCKET" ]; then
    echo -e "${YELLOW}BACKUP_BUCKET not set, skipping S3 upload${NC}"
    return
  fi
  
  aws s3 cp "$BACKUP_FILE" "s3://${BACKUP_BUCKET}/backups/"
  
  echo -e "${GREEN}✓ Backup uploaded to S3${NC}"
}

# Main execution
main() {
  check_prerequisites
  export_replit_db
  verify_backup
  import_to_rds
  verify_prod_db
  backup_to_s3
  
  echo -e "\n${GREEN}========================================${NC}"
  echo -e "${GREEN}Migration completed successfully! 🎉${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo -e "\n${YELLOW}Next steps:${NC}"
  echo "1. Deploy new API version to production"
  echo "2. Update PROD_DATABASE_URL in environment"
  echo "3. Run database migrations: npm run db:push"
  echo "4. Run smoke tests"
  echo "5. Monitor logs and metrics"
}

main
