#!/bin/sh
set -e

echo "=========================================="
echo "[$(date)] CargoHS54 — Starting..."
echo "=========================================="

# Database init
DB_FILE="${DATABASE_URL#file:}"
DB_DIR=$(dirname "$DB_FILE")

if [ ! -d "$DB_DIR" ]; then
  echo "[entrypoint] Creating database directory: $DB_DIR"
  mkdir -p "$DB_DIR"
fi

if [ ! -f "$DB_FILE" ]; then
  echo "[entrypoint] No database found. Running prisma db push..."
  bunx prisma db push
  echo "[entrypoint] Database created successfully."
else
  echo "[entrypoint] Database exists, syncing schema..."
bunx prisma db push --accept-data-loss 2>/dev/null || \
bunx prisma db push
  echo "[entrypoint] Schema synced."
fi

# Seed admin user if DB is fresh
ROW_COUNT=$(bun -e "
const { PrismaClient } = require('.prisma/client');
const db = new PrismaClient();
db.user.count().then(c => { console.log(c); db.\$disconnect(); }).catch(() => { console.log(0); });
" 2>/dev/null || echo "0")

if [ "$ROW_COUNT" = "0" ]; then
  echo "[entrypoint] Fresh database — seeding admin user..."
  bun -e "
const { PrismaClient } = require('.prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();
async function seed() {
  const hash = await bcrypt.hash('admin123', 12);
  await db.user.create({
    data: { email: 'admin@cargohs54.ru', name: 'Администратор', passwordHash: hash, role: 'ADMIN' }
  });
  const clientHash = await bcrypt.hash('client123', 12);
  await db.user.create({
    data: { email: 'test@test.ru', name: 'Тестовый клиент', passwordHash: clientHash, role: 'CLIENT' }
  });
  console.log('Seeded: admin@cargohs54.ru + test@test.ru');
  await db.\$disconnect();
}
seed().catch(e => { console.error(e); process.exit(1); });
"
else
  echo "[entrypoint] Database has $ROW_COUNT user(s), skipping seed."
fi

# Start Next.js server
echo "=========================================="
echo "[$(date)] Starting Next.js on port ${PORT:-10000}"
echo "=========================================="

exec bun run .next/standalone/server.js
