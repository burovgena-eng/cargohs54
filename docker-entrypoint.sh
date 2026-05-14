#!/bin/sh
set -e

DB_FILE="${DATABASE_URL#file:}"
DB_DIR=$(dirname "$DB_FILE")
mkdir -p "$DB_DIR"

if [ ! -f "$DB_FILE" ]; then
  echo "[entrypoint] Creating database..."
  npx prisma db push
else
  echo "[entrypoint] Syncing schema..."
  npx prisma db push --accept-data-loss 2>/dev/null || npx prisma db push
fi

ROW_COUNT=$(bun -e "
const{PrismaClient}=require('.prisma/client');const db=new PrismaClient();db.user.count().then(c=>{console.log(c);db.\$disconnect()}).catch(()=>console.log(0))
" 2>/dev/null || echo "0")

if [ "$ROW_COUNT" = "0" ]; then
  echo "[entrypoint] Seeding admin user..."
  bun -e "
const{PrismaClient}=require('.prisma/client');const bcrypt=require('bcryptjs');const db=new PrismaClient();
(async()=>{const h=await bcrypt.hash('admin123',12);await db.user.create({data:{email:'admin@cargohs54.ru',name:'Администратор',passwordHash:h,role:'ADMIN'}});const c=await bcrypt.hash('client123',12);await db.user.create({data:{email:'test@test.ru',name:'Тестовый клиент',passwordHash:c,role:'CLIENT'}});console.log('Seeded');await db.\$disconnect()})().catch(e=>{console.error(e);process.exit(1)})"
fi

echo "[entrypoint] Starting server..."
exec bun run .next/standalone/server.js
