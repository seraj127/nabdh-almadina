#!/bin/bash
while true; do
  echo "Starting download service..."
  cd /home/z/my-project/mini-services/download-service
  node index.js
  echo "Download service exited, restarting in 2s..."
  sleep 2
done
