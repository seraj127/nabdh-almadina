#!/bin/bash
# Auto-restart dev server script for نبض المدينة
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=4096"

echo "[$(date)] Starting Next.js dev server..."

while true; do
  node node_modules/.bin/next dev -p 3000 --webpack 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 2s..."
  sleep 2
done
