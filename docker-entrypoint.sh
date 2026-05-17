#!/bin/sh
set -e

echo "=========================================="
echo "[$(date)] CargoHS54 — Starting..."
echo "=========================================="

export DATABASE_URL="${DATABASE_URL:-file:/app/db/custom.db}"

DB_FILE="/app/db/custom.db"
DB_DIR=$(dirname "$DB_FILE")

mkdir -p "$DB_DIR"

if [ -f "$DB_FILE" ]; then
  echo "[entrypoint] Database found: $DB_FILE"
else
  echo "[entrypoint] Database not found, will create on first request"
  touch "$DB_FILE"
  chmod 644 "$DB_FILE"
fi

echo "[entrypoint] DATABASE_URL=$DATABASE_URL"
echo "[entrypoint] Port: ${PORT:-10000}"

echo "=========================================="
echo "[$(date)] Starting Next.js..."
echo "=========================================="

exec bun server.js
