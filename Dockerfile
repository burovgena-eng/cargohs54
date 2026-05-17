# ============================================================
# CargoHS54 — Production Dockerfile for Render
# ============================================================

# ── Stage 1: Dependencies ──────────────────────────────────
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install

# ── Stage 2: Build ─────────────────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Create database and tables (here Prisma CLI v6 is guaranteed)
ENV DATABASE_URL="file:./db/custom.db"
RUN mkdir -p db
RUN bunx prisma db push

# Seed admin user into the pre-built database
RUN bun -e "const{PrismaClient}=require('@prisma/client');const bcrypt=require('bcryptjs');const db=new PrismaClient();(async()=>{const h=await bcrypt.hash('admin123',10);await db.user.create({data:{email:'admin@cargohs54.ru',name:'Администратор',passwordHash:h,role:'ADMIN'}});const h2=await bcrypt.hash('client123',10);await db.user.create({data:{email:'test@test.ru',name:'Тестовый клиент',passwordHash:h2,role:'CLIENT'}});console.log('Seeded: admin@cargohs54.ru / admin123');await db.disconnect()})()"

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN bun run build

# ── Stage 3: Production runtime ────────────────────────────
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=10000
ENV HOSTNAME="0.0.0.0"

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 appuser

# Directories for database and uploads
RUN mkdir -p /app/db /app/public/uploads && \
    chown -R appuser:nodejs /app/db /app/public/uploads

# Copy standalone Next.js output
COPY --from=builder --chown=appuser:nodejs /app/.next/standalone ./

# Copy static assets & public folder
COPY --from=builder --chown=appuser:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=appuser:nodejs /app/public         ./public

# Copy pre-built database (created during build stage)
COPY --from=builder --chown=appuser:nodejs /app/db/custom.db   ./db/custom.db

# Copy Prisma schema + generated client + engines (NO CLI needed at runtime)
COPY --from=builder --chown=appuser:nodejs /app/prisma               ./prisma
COPY --from=builder --chown=appuser:nodejs /app/node_modules/.prisma  ./node_modules/.prisma
COPY --from=builder --chown=appuser:nodejs /app/node_modules/@prisma  ./node_modules/@prisma

# Copy entrypoint script
COPY --chown=appuser:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER appuser
EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
