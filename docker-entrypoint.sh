#!/bin/sh
set -e

echo "=========================================="
echo "[$(date)] CargoHS54 — Starting..."
echo "=========================================="

# DATABASE_URL must be set in Render env vars (PostgreSQL connection string)
if [ -z "$DATABASE_URL" ]; then
  echo "[entrypoint] WARNING: DATABASE_URL not set! Database operations will fail."
else
  echo "[entrypoint] DATABASE_URL is set (${#DATABASE_URL} chars)"
fi

echo "[entrypoint] Port: ${PORT:-10000}"

echo "=========================================="
echo "[$(date)] Starting Next.js..."
echo "=========================================="

exec bun server.js
