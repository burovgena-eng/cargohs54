#!/bin/sh
set -e

echo "=========================================="
echo "[$(date)] CargoHS54 — Starting..."
echo "=========================================="

# IMPORTANT: ABSOLUTE path /app/db/custom.db
export DATABASE_URL="${DATABASE_URL:-file:/app/db/custom.db}"

DB_FILE="/app/db/custom.db"
if [ -f "$DB_FILE" ]; then
  echo "[entrypoint] Database found: $DB_FILE"
else
  echo "[entrypoint] WARNING: Database not found at $DB_FILE"
fi

echo "[entrypoint] Port: ${PORT:-10000}"

echo "=========================================="
echo "[$(date)] Starting Next.js..."
echo "=========================================="

exec bun server.js
