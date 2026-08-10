#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev -p 3000 2>&1 | tee -a dev.log
  echo "[$(date)] Server crashed, restarting in 3s..." >> dev.log
  sleep 3
done
