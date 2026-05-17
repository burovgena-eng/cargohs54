#!/bin/sh
set -e

echo "=========================================="
echo "[$(date)] CargoHS54 — Starting..."
echo "=========================================="

export DATABASE_URL="${DATABASE_URL:-file:/app/db/custom.db}"

DB_FILE="/app/db/custom.db"
DB_DIR=$(dirname "$DB_FILE")

mkdir -p "$DB_DIR"

if [ ! -f "$DB_FILE" ]; then
  echo "[entrypoint] Creating database: $DB_FILE"
  touch "$DB_FILE"
fi

echo "[entrypoint] Ensuring database schema..."

bun -e "const{PrismaClient}=require('.prisma/client');const db=new PrismaClient();(async()=>{try{await db.user.count();console.log('Schema OK')}catch(e){if(e.code==='P2021'){console.log('Creating tables...');await db.\$executeRawUnsafe('CREATE TABLE IF NOT EXISTS User(id TEXT NOT NULL PRIMARY KEY,email TEXT NOT NULL,name TEXT NOT NULL,passwordHash TEXT NOT NULL,phone TEXT,city TEXT,role TEXT NOT NULL DEFAULT CLIENT,createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,updatedAt DATETIME NOT NULL);CREATE TABLE IF NOT EXISTS Order(id TEXT NOT NULL PRIMARY KEY,orderNumber TEXT NOT NULL,userId TEXT NOT NULL,title TEXT NOT NULL,description TEXT,status TEXT NOT NULL DEFAULT NEW,adminNote TEXT,deliveryCity TEXT,itemPriceCNY REAL,deliveryPriceRUB REAL,totalPriceRUB REAL,imageUrl TEXT,storeUrl TEXT,storeName TEXT,quantity INTEGER NOT NULL DEFAULT 1,createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,updatedAt DATETIME NOT NULL,CONSTRAINT Order_userId_fkey FOREIGN KEY(userId) REFERENCES User(id) ON DELETE RESTRICT ON UPDATE CASCADE);CREATE TABLE IF NOT EXISTS OrderItem(id TEXT NOT NULL PRIMARY KEY,orderId TEXT NOT NULL,title TEXT NOT NULL,description TEXT,storeUrl TEXT,storeName TEXT,quantity INTEGER NOT NULL DEFAULT 1,imageUrl TEXT,itemPriceCNY REAL,deliveryPriceRUB REAL,totalPriceRUB REAL,createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,updatedAt DATETIME NOT NULL,CONSTRAINT OrderItem_orderId_fkey FOREIGN KEY(orderId) REFERENCES Order(id) ON DELETE CASCADE ON UPDATE CASCADE);CREATE TABLE IF NOT EXISTS Message(id TEXT NOT NULL PRIMARY KEY,orderId TEXT NOT NULL,senderId TEXT NOT NULL,text TEXT NOT NULL,createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT Message_orderId_fkey FOREIGN KEY(orderId) REFERENCES Order(id) ON DELETE CASCADE ON UPDATE CASCADE,CONSTRAINT Message_senderId_fkey FOREIGN KEY(senderId) REFERENCES User(id) ON DELETE RESTRICT ON UPDATE CASCADE);');console.log('Tables created')}else{console.log('DB Error:',e.code)}}process.exit(0)})()"

echo "[entrypoint] Checking users..."

USER_COUNT=$(bun -e "const{PrismaClient}=require('.prisma/client');const db=new PrismaClient();(async()=>{try{console.log(await db.user.count())}catch(e){console.log(0)}process.exit(0)})()" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "[entrypoint] Seeding admin user..."
  bun -e "const{PrismaClient}=require('.prisma/client');const bcrypt=require('bcryptjs');const db=new PrismaClient();(async()=>{const h=await bcrypt.hash('admin123',10);await db.user.create({data:{email:'admin@cargohs54.ru',name:'Admin',passwordHash:h,role:'ADMIN'}});const h2=await bcrypt.hash('client123',10);await db.user.create({data:{email:'test@test.ru',name:'Test',passwordHash:h2,role:'CLIENT'}});console.log('Seeded');process.exit(0)})()"
else
  echo "[entrypoint] Found $USER_COUNT user(s), skipping seed."
fi

echo "[entrypoint] Port: ${PORT:-10000}"

echo "=========================================="
echo "[$(date)] Starting Next.js..."
echo "=========================================="

exec bun server.js
