#!/bin/bash
cd /home/z/my-project

echo "[DEV] Starting Next.js dev server on port 3000..."

# Kill any existing server
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Start the server with auto-restart
while true; do
  echo "[$(date)] Starting Next.js dev server..." >> /home/z/my-project/dev.log
  npx next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 5s..." >> /home/z/my-project/dev.log
  sleep 5
done
