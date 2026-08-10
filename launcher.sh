#!/bin/bash
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=2048"
echo "[$(date)] Starting Next.js dev server (Turbopack)..." >> /home/z/my-project/dev.log
while true; do
  node node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 5s..." >> /home/z/my-project/dev.log
  sleep 5
done
