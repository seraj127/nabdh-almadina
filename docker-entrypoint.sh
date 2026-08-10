#!/bin/bash
# ═══════════════════════════════════════════════════════════
# City Pulse — Docker Entrypoint
# Starts all services in production mode
# ═══════════════════════════════════════════════════════════

set -e

echo "🚀 Starting City Pulse — نبض المدينة"

# ─── 1. Initialize Database ──────────────────────────────
echo "📦 Initializing database..."
cd /app
if [ ! -f /app/db/custom.db ]; then
    echo "  → Creating new database..."
    bunx prisma db push --skip-generate
    echo "  → Seeding database..."
    bun run db:seed 2>/dev/null || echo "  → Seed skipped (already seeded or no seed file)"
else
    echo "  → Database exists, running migrations..."
    bunx prisma db push --skip-generate 2>/dev/null || true
fi

# ─── 2. Start Sync Service (Socket.io) ──────────────────
echo "🔌 Starting Sync Service on port 3004..."
cd /app/mini-services/sync-service
PORT=3004 bun run index.ts &
SYNC_PID=$!
echo "  → Sync Service PID: $SYNC_PID"

# ─── 3. Start Download Service ──────────────────────────
echo "📥 Starting Download Service on port 3031..."
cd /app/mini-services/download-service
bun run index.ts &
DOWNLOAD_PID=$!
echo "  → Download Service PID: $DOWNLOAD_PID"

# ─── 4. Start Main Next.js Server ───────────────────────
echo "🌐 Starting Next.js server on port 3000..."
cd /app
node server.js &
NEXT_PID=$!
echo "  → Next.js PID: $NEXT_PID"

# ─── 5. Health Check ────────────────────────────────────
sleep 5
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ City Pulse is running!"
    echo "   → Main App: http://localhost:3000"
    echo "   → Sync Service: http://localhost:3004"
    echo "   → Download Service: http://localhost:3031"
else
    echo "⚠️  Server may still be starting..."
fi

# ─── 6. Graceful Shutdown ───────────────────────────────
cleanup() {
    echo ""
    echo "🛑 Shutting down City Pulse..."
    kill $NEXT_PID $SYNC_PID $DOWNLOAD_PID 2>/dev/null
    wait $NEXT_PID $SYNC_PID $DOWNLOAD_PID 2>/dev/null
    echo "👋 Goodbye!"
    exit 0
}

trap cleanup SIGINT SIGTERM SIGQUIT

# Keep the container running
wait $NEXT_PID
