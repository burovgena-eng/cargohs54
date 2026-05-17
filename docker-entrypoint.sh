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

COUNT=$(bunx prisma db execute --stdin <<<"SELECT COUNT(*) FROM User;" 2>/dev/null | tail -1 || echo "0")

if [ "$COUNT" = "0" ] || [ "$COUNT" = "" ]; then
  echo "Seeding admin user..."
  bun -e "const {PrismaClient}=require('.prisma/client');const bcrypt=require('bcryptjs');const db=new PrismaClient();bcrypt.hash('admin123',10).then(h=>db.user.create({data:{email:'admin@cargohs54.ru',name:'Администратор',passwordHash:h,role:'ADMIN'}})).then(()=>db.disconnect()).catch(()=>{})"
  bun -e "const {PrismaClient}=require('.prisma/client');const bcrypt=require('bcryptjs');const db=new PrismaClient();bcrypt.hash('client123',10).then(h=>db.user.create({data:{email:'test@test.ru',name:'Тестовый клиент',passwordHash:h,role:'CLIENT'}})).then(()=>db.disconnect()).catch(()=>{})"
  echo "Done. admin@cargohs54.ru / admin123"
fi

echo "Starting server on port ${PORT:-10000}..."
exec bun run .next/standalone/server.js
