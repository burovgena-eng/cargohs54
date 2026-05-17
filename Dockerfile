# ============================================================
# CargoHS54 — Production Dockerfile for Render
# Multi-stage: deps → build → runtime (bun)
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

# Generate Prisma client (v6.11.1 from package.json)
RUN bunx prisma generate

# Create database and tables during build (Prisma CLI v6 is guaranteed here)
ENV DATABASE_URL="file:./db/custom.db"
RUN mkdir -p db && bunx prisma db push

# Seed admin + test client into the pre-built database
RUN bun -e "const{PrismaClient}=require('@prisma/client');const bcrypt=require('bcryptjs');const db=new PrismaClient();(async()=>{const h=await bcrypt.hash('admin123',10);await db.user.create({data:{email:'admin@cargohs54.ru',name:'Admin',passwordHash:h,role:'ADMIN'}});const h2=await bcrypt.hash('client123',10);await db.user.create({data:{email:'test@test.ru',name:'Test',passwordHash:h2,role:'CLIENT'}});console.log('Seeded');process.exit(0)})()"

# Build Next.js with memory limit to prevent OOM on Render
ENV BUN_JAVA_SCRIPT_HEAP_LIMIT=384
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

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 appuser

# Create db directory with write access
RUN mkdir -p /app/db /app/public/uploads && \
    chown -R appuser:nodejs /app/db /app/public/uploads

# Copy standalone output (includes server code + required node_modules)
COPY --from=builder --chown=appuser:nodejs /app/.next/standalone ./

# Copy static assets & public folder
COPY --from=builder --chown=appuser:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=appuser:nodejs /app/public         ./public

# Copy pre-built database file (created during build stage)
COPY --from=builder --chown=appuser:nodejs /app/db/custom.db   ./db/custom.db

# Copy Prisma schema + generated client with engine (NO CLI — prevents v7 download)
COPY --from=builder --chown=appuser:nodejs /app/prisma               ./prisma
COPY --from=builder --chown=appuser:nodejs /app/node_modules/.prisma  ./node_modules/.prisma

# Copy entrypoint script
COPY --chown=appuser:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER appuser

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
