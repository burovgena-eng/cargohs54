#!/bin/sh

echo "=== CargoHS54 Starting ==="

DATABASE_URL="${DATABASE_URL:-file:./db/custom.db}"
export DATABASE_URL

DB_FILE="${DATABASE_URL#file:}"
DB_DIR=$(dirname "$DB_FILE")

mkdir -p "$DB_DIR"

if [ ! -f "$DB_FILE" ]; then
  echo "Creating database..."
  bunx prisma db push
else
  echo "Syncing schema..."
  bunx prisma db push 2>/dev/null
fi

bun -e "const {PrismaClient}=require('.prisma/client');const bcrypt=require('bcryptjs');const db=new PrismaClient();(async()=>{const c=await db.user.count();if(c===0){const h=await bcrypt.hash('admin123',10);await db.user.create({data:{email:'admin@cargohs54.ru',name:'Admin',passwordHash:h,role:'ADMIN'}});const h2=await bcrypt.hash('client123',10);await db.user.create({data:{email:'test@test.ru',name:'Test',passwordHash:h2,role:'CLIENT'}});console.log('Seeded')}await db.disconnect()})().catch(()=>{})"

echo "Starting server on port ${PORT:-10000}..."
exec bun run .next/standalone/server.js
