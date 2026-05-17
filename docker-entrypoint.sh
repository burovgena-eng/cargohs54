#!/bin/sh

echo "=== CargoHS54 Starting ==="

DATABASE_URL="${DATABASE_URL:-file:./db/custom.db}"
export DATABASE_URL

DB_FILE="${DATABASE_URL#file:}"
DB_DIR=$(dirname "$DB_FILE")

mkdir -p "$DB_DIR"

if [ ! -f "$DB_FILE" ]; then
  echo "Creating database..."
  bunx prisma db push --skip-generate
else
  echo "Syncing schema..."
  bunx prisma db push --skip-generate 2>/dev/null
fi

echo "Starting server on port ${PORT:-10000}..."
exec bun run .next/standalone/server.js
