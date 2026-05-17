import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbInitialized: boolean | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// ── Auto-initialize: ensure tables + seed default admin ──
let initPromise: Promise<void> | null = null;

export async function ensureDb(): Promise<void> {
  if (globalForPrisma.dbInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Check if User table exists by trying to count
      let userCount: number;
      try {
        userCount = await db.user.count();
      } catch (e: unknown) {
        const code = (e as { code?: string }).code;
        if (code === 'P2021') {
          // Tables don't exist — create them one by one
          console.log('[db] Tables missing (P2021), creating schema...');

          await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "User" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "email" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "passwordHash" TEXT NOT NULL,
            "phone" TEXT,
            "city" TEXT,
            "role" TEXT NOT NULL DEFAULT 'CLIENT',
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL
          )`);

          await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`);

          await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Order" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "orderNumber" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "status" TEXT NOT NULL DEFAULT 'NEW',
            "adminNote" TEXT,
            "deliveryCity" TEXT,
            "itemPriceCNY" REAL,
            "deliveryPriceRUB" REAL,
            "totalPriceRUB" REAL,
            "imageUrl" TEXT,
            "storeUrl" TEXT,
            "storeName" TEXT,
            "quantity" INTEGER NOT NULL DEFAULT 1,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL,
            CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
          )`);

          await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber")`);

          await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "OrderItem" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "orderId" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "storeUrl" TEXT,
            "storeName" TEXT,
            "quantity" INTEGER NOT NULL DEFAULT 1,
            "imageUrl" TEXT,
            "itemPriceCNY" REAL,
            "deliveryPriceRUB" REAL,
            "totalPriceRUB" REAL,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL,
            CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
          )`);

          await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Message" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "orderId" TEXT NOT NULL,
            "senderId" TEXT NOT NULL,
            "text" TEXT NOT NULL,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Message_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
          )`);

          console.log('[db] Schema created successfully');
          userCount = 0;
        } else {
          console.error('[db] Unexpected error checking users:', e);
          throw e;
        }
      }

      // Seed default admin if no users exist
      if (userCount === 0) {
        console.log('[db] No users found, seeding default accounts...');
        const adminHash = await bcrypt.hash('admin123', 10);
        const clientHash = await bcrypt.hash('client123', 10);

        await db.user.create({
          data: {
            email: 'admin@cargohs54.ru',
            name: 'Admin',
            passwordHash: adminHash,
            role: 'ADMIN',
          },
        });

        await db.user.create({
          data: {
            email: 'test@test.ru',
            name: 'Test Client',
            passwordHash: clientHash,
            role: 'CLIENT',
          },
        });

        console.log('[db] Seeded: admin@cargohs54.ru / admin123 + test@test.ru / client123');
      } else {
        console.log('[db] Database OK, found ' + userCount + ' user(s)');
      }
    } catch (e) {
      console.error('[db] Initialization error:', e);
    } finally {
      globalForPrisma.dbInitialized = true;
    }
  })();

  return initPromise;
}
