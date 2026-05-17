#!/bin/sh
set -e

echo "=========================================="
echo "[$(date)] CargoHS54 — Starting..."
echo "=========================================="

# Set DATABASE_URL to default if not provided by environment
export DATABASE_URL="${DATABASE_URL:-file:./db/custom.db}"

# Extract file path and ensure directory exists
DB_FILE="${DATABASE_URL#file:}"
DB_DIR=$(dirname "$DB_FILE")

if [ ! -d "$DB_DIR" ]; then
  echo "[entrypoint] Creating database directory: $DB_DIR"
  mkdir -p "$DB_DIR"
fi

# Verify database file exists (bundled during Docker build)
if [ -f "$DB_FILE" ]; then
  echo "[entrypoint] Database found: $DB_FILE"
else
  echo "[entrypoint] WARNING: Database not found at $DB_FILE"
fi

echo "[entrypoint] Port: ${PORT:-10000}"

# Start Next.js production server
echo "=========================================="
echo "[$(date)] Starting Next.js..."
echo "=========================================="

exec bun server.js
