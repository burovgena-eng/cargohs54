#!/bin/sh
set -e

echo "=========================================="
echo "[$(date)] CargoHS54 — Starting..."
echo "=========================================="

# Set DATABASE_URL to default if not provided
export DATABASE_URL="${DATABASE_URL:-file:./db/custom.db}"

# Extract file path from DATABASE_URL
DB_FILE="${DATABASE_URL#file:}"
DB_DIR=$(dirname "$DB_FILE")

# Ensure database directory exists
if [ ! -d "$DB_DIR" ]; then
  echo "[entrypoint] Creating database directory: $DB_DIR"
  mkdir -p "$DB_DIR"
fi

# Verify database file exists (it should — created during Docker build)
if [ ! -f "$DB_FILE" ]; then
  echo "[entrypoint] WARNING: Database file not found at $DB_FILE"
  echo "[entrypoint] Creating empty database file..."
  touch "$DB_FILE"
fi

echo "[entrypoint] Database: $DB_FILE"
echo "[entrypoint] Port: ${PORT:-10000}"

# Start Next.js production server
echo "=========================================="
echo "[$(date)] Starting Next.js..."
echo "=========================================="

exec bun server.js
