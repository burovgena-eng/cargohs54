#!/bin/sh
set -e

echo "=========================================="
echo "[$(date)] CargoHS54 — Starting..."
echo "=========================================="

DB_FILE="${DATABASE_URL#file:}"
DB_DIR=$(dirname "$DB_FILE")

if [ ! -d "$DB_DIR" ]; then
  echo "[entrypoint] Creating database directory: $DB_DIR"
  mkdir -p "$DB_DIR"
fi

PRISMA="./node_modules/prisma/build/index.js"

if [ ! -f "$DB_FILE" ]; then
  echo "[entrypoint] No database found. Running prisma db push..."
  bun $PRISMA db push --skip-generate 2>&1 || bun $PRISMA db push 2>&1
  echo "[entrypoint] Database created successfully."
else
  echo "[entrypoint] Database exists, syncing schema..."
  bun $PRISMA db push --skip-generate --accept-data-loss 2>/dev/null || \
  bun $PRISMA db push --skip-generate 2>&1
  echo "[entrypoint] Schema synced."
fi

ROW_COUNT=$(bun -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.user.count().then(c => { console.log(c); db.\$disconnect(); }).catch(() => { console.log(0); });
" 2>/dev/null || echo "0")

if [ "$ROW_COUNT" = "0" ]; then
  echo "[entrypoint] Fresh database — seeding admin user..."
  bun -e "
const { PrismaClient } = require('@prisma/client');
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

echo "=========================================="
echo "[$(date)] Starting Next.js on port ${PORT:-10000}"
echo "=========================================="

exec bun server.js
