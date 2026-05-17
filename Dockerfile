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

# Generate Prisma client (v6.11.1 from package.json)
RUN bunx prisma generate

# IMPORTANT: ABSOLUTE path /app/db/custom.db
# Prisma resolves file:./db/custom.db relative to schema dir (prisma/),
# not working directory. Absolute path avoids this.
ENV DATABASE_URL="file:/app/db/custom.db"
ENV BUN_JAVA_SCRIPT_HEAP_LIMIT=384
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN mkdir -p db && \
    bunx prisma db push && \
    bun -e "const{PrismaClient}=require('@prisma/client');const bcrypt=require('bcryptjs');const db=new PrismaClient();(async()=>{const h=await bcrypt.hash('admin123',10);await db.user.create({data:{email:'admin@cargohs54.ru',name:'Admin',passwordHash:h,role:'ADMIN'}});const h2=await bcrypt.hash('client123',10);await db.user.create({data:{email:'test@test.ru',name:'Test',passwordHash:h2,role:'CLIENT'}});console.log('Seeded');process.exit(0)})()" && \
    bun run build && \
    mkdir -p .next/standalone/db && \
    cp db/custom.db .next/standalone/db/custom.db

# ── Stage 3: Production runtime ────────────────────────────
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=10000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 appuser

RUN mkdir -p /app/db /app/public/uploads && \
    chown -R appuser:nodejs /app/db /app/public/uploads

COPY --from=builder --chown=appuser:nodejs /app/.next/standalone ./
COPY --from=builder --chown=appuser:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=appuser:nodejs /app/public         ./public

COPY --from=builder --chown=appuser:nodejs /app/prisma               ./prisma
COPY --from=builder --chown=appuser:nodejs /app/node_modules/.prisma  ./node_modules/.prisma

COPY --chown=appuser:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER appuser
EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
