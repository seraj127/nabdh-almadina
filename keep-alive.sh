#!/bin/bash
while true; do
  if ! pgrep -f "next dev -p 3000" > /dev/null 2>&1; then
    echo "[$(date)] Server down, restarting..." >> /home/z/my-project/dev.log
    cd /home/z/my-project && npx next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
    sleep 10
  fi
  sleep 5
done
