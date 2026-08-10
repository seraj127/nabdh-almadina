#!/bin/bash
# ═══════════════════════════════════════════════════════════
# City Pulse — نبض المدينة | Deploy Script
# Production deployment automation
# ═══════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  City Pulse — نبض المدينة  |  Deployment Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# ─── Configuration ───────────────────────────────────────
DEPLOY_METHOD="${1:-docker}"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ─── Functions ───────────────────────────────────────────
log_info()    { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }
log_step()    { echo -e "${BLUE}[▶]${NC} $1"; }

check_requirements() {
    log_step "Checking requirements..."
    
    local missing=()
    
    if [ "$DEPLOY_METHOD" = "docker" ]; then
        command -v docker >/dev/null 2>&1 || missing+=("docker")
        command -v docker-compose >/dev/null 2>&1 || command -v docker compose >/dev/null 2>&1 || missing+=("docker-compose")
    elif [ "$DEPLOY_METHOD" = "vps" ]; then
        command -v bun >/dev/null 2>&1 || missing+=("bun")
        command -v node >/dev/null 2>&1 || missing+=("node")
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing required tools: ${missing[*]}"
        echo "Please install them before continuing."
        exit 1
    fi
    
    log_info "All requirements met!"
}

setup_env() {
    log_step "Setting up environment variables..."
    
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        if [ -f "$PROJECT_DIR/.env.example" ]; then
            cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
            log_warn "Created .env from .env.example"
            log_warn "⚠️  IMPORTANT: Edit .env and set a secure JWT_SECRET!"
        else
            log_error "No .env.example found!"
            exit 1
        fi
    else
        log_info ".env file already exists"
    fi
    
    # Check if JWT_SECRET is still default
    if grep -q "change-me-to-a-secure-random-string" "$PROJECT_DIR/.env" 2>/dev/null; then
        log_warn "⚠️  JWT_SECRET is still set to default! Generate a new one:"
        echo "    openssl rand -base64 32"
        echo ""
        read -p "Do you want to auto-generate a secure JWT_SECRET? [Y/n]: " auto_gen
        if [[ "$auto_gen" != "n" && "$auto_gen" != "N" ]]; then
            NEW_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
            sed -i "s/change-me-to-a-secure-random-string/$NEW_SECRET/" "$PROJECT_DIR/.env"
            log_info "JWT_SECRET generated and saved!"
        fi
    fi
}

deploy_docker() {
    log_step "Deploying with Docker..."
    
    cd "$PROJECT_DIR"
    
    # Build image
    log_step "Building Docker image..."
    docker compose build --no-cache
    
    # Stop existing containers
    log_step "Stopping existing containers..."
    docker compose down 2>/dev/null || true
    
    # Start containers
    log_step "Starting containers..."
    docker compose up -d
    
    # Wait for health check
    log_step "Waiting for application to start..."
    sleep 10
    
    # Check status
    if docker compose ps | grep -q "healthy\|running"; then
        log_info "Application is running!"
        echo ""
        echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}  ✅ City Pulse is LIVE!${NC}"
        echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
        echo ""
        echo "  🌐 Main App:  http://localhost:3000"
        echo "  🔌 Sync:      http://localhost:3004"
        echo "  📥 Downloads: http://localhost:3031"
        echo ""
        echo "  📋 View logs:  docker compose logs -f"
        echo "  🛑 Stop:       docker compose down"
        echo "  🔄 Restart:    docker compose restart"
        echo ""
    else
        log_error "Application may not have started correctly"
        echo "Check logs: docker compose logs"
        exit 1
    fi
}

deploy_vps() {
    log_step "Deploying on VPS (bare metal)..."
    
    cd "$PROJECT_DIR"
    
    # Install dependencies
    log_step "Installing dependencies..."
    bun install --frozen-lockfile
    
    # Setup database
    log_step "Setting up database..."
    bun run db:push
    bun run db:generate
    
    # Seed if empty
    if [ ! -f "$PROJECT_DIR/db/custom.db" ] || [ ! -s "$PROJECT_DIR/db/custom.db" ]; then
        log_step "Seeding database..."
        bun run db:seed
    fi
    
    # Build
    log_step "Building application..."
    bun run build
    
    log_info "Build complete!"
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  To start the application:${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo "  # Start main server:"
    echo "  bun run start"
    echo ""
    echo "  # Start sync service (in another terminal):"
    echo "  cd mini-services/sync-service && bun run dev"
    echo ""
    echo "  # Start download service (in another terminal):"
    echo "  cd mini-services/download-service && bun run dev"
    echo ""
    echo "  # Or use PM2 for process management:"
    echo "  npm install -g pm2"
    echo "  pm2 start ecosystem.config.js"
    echo ""
}

deploy_vercel() {
    log_step "Preparing for Vercel deployment..."
    
    cd "$PROJECT_DIR"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log_warn "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    log_info "Vercel deployment requires:"
    echo "  1. SQLite won't work on Vercel — you need to migrate to PostgreSQL"
    echo "  2. Update DATABASE_URL in Vercel dashboard"
    echo "  3. Mini-services need external hosting (Railway, Fly.io, etc.)"
    echo ""
    log_warn "⚠️  This project uses SQLite which is NOT compatible with Vercel's serverless environment."
    log_warn "For Vercel deployment, you need to:"
    echo "  1. Switch Prisma provider from sqlite to postgresql"
    echo "  2. Set up a PostgreSQL database (Supabase, Neon, etc.)"
    echo "  3. Host mini-services separately"
    echo ""
    read -p "Do you still want to proceed with Vercel? [y/N]: " proceed
    if [[ "$proceed" == "y" || "$proceed" == "Y" ]]; then
        vercel --prod
    else
        log_info "Vercel deployment cancelled."
    fi
}

# ─── Main ────────────────────────────────────────────────
echo "Available deployment methods:"
echo "  1. docker  — Docker Compose (recommended for VPS)"
echo "  2. vps     — Bare metal VPS deployment"
echo "  3. vercel  — Vercel (requires DB migration)"
echo ""

case "$DEPLOY_METHOD" in
    docker|1)
        check_requirements
        setup_env
        deploy_docker
        ;;
    vps|2)
        check_requirements
        setup_env
        deploy_vps
        ;;
    vercel|3)
        deploy_vercel
        ;;
    *)
        echo "Usage: ./deploy.sh [docker|vps|vercel]"
        echo "Default: docker"
        exit 1
        ;;
esac
