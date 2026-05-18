# ============================================================
# CargoHS54 — Production Dockerfile for Render
# Multi-stage: deps → build → runtime (bun)
# Database: PostgreSQL (external — Supabase)
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

# Generate Prisma client (PostgreSQL)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN bunx prisma generate

# Build Next.js
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

# Create uploads directory with write access
RUN mkdir -p /app/public/uploads && \
    chown -R appuser:nodejs /app/public/uploads

# Copy standalone output
COPY --from=builder --chown=appuser:nodejs /app/.next/standalone ./

# Copy static assets & public folder
COPY --from=builder --chown=appuser:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=appuser:nodejs /app/public         ./public

# Copy Prisma schema + generated client (PostgreSQL engine included)
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
