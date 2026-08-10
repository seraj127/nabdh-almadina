# ═══════════════════════════════════════════════════════════
# City Pulse — نبض المدينة | Production Dockerfile
# Multi-stage build for optimized production image
# ═══════════════════════════════════════════════════════════

# ─── Stage 1: Dependencies ───────────────────────────────
FROM oven/bun:1.2 AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile --production=false

# Generate Prisma client
RUN bun run db:generate

# ─── Stage 2: Build ──────────────────────────────────────
FROM oven/bun:1.2 AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy source code
COPY . .

# Build Next.js standalone output
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN bun run build

# ─── Stage 3: Production ────────────────────────────────
FROM oven/bun:1.2-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy database and prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/db ./db

# Copy mini-services
COPY --from=builder /app/mini-services ./mini-services
COPY --from=builder --chown=nextjs:nodejs /app/mini-services/sync-service/node_modules ./mini-services/sync-service/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/mini-services/download-service/node_modules ./mini-services/download-service/node_modules

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Create data directories
RUN mkdir -p /app/db /app/upload && \
    chown -R nextjs:nodejs /app/db /app/upload

USER nextjs

EXPOSE 3000 3004 3031

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
