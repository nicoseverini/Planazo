#!/usr/bin/env bash
set -euo pipefail

# EXPO_PUBLIC_BACKEND_EXTERNAL_URL needs your host IP so the 
# Expo app can connect to the backend running in Docker.
# - If EXPO_PUBLIC_BACKEND_EXTERNAL_URL is already set, use it
# - On Linux, default to the first non-loopback address
# - On macOS/Windows, use host.docker.internal

if [ -n "${EXPO_PUBLIC_BACKEND_EXTERNAL_URL:-}" ]; then
  echo "Using EXPO_PUBLIC_BACKEND_EXTERNAL_URL from environment: $EXPO_PUBLIC_BACKEND_EXTERNAL_URL"
  docker compose up --build
  exit 0
fi

OS_NAME=$(uname -s)
if [ "$OS_NAME" = "Linux" ]; then
  # pick the first non-loopback address
  HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
  if [ -z "$HOST_IP" ]; then
    echo "Failed to detect host IP. Please set EXPO_PUBLIC_BACKEND_EXTERNAL_URL manually." >&2
    echo "Example: EXPO_PUBLIC_BACKEND_EXTERNAL_URL=\"http://192.168.x.x:8080\" ./scripts/up-dev.sh" >&2
    exit 1
  fi
  EXPO_PUBLIC_BACKEND_EXTERNAL_URL="http://$HOST_IP:8080"
else
  EXPO_PUBLIC_BACKEND_EXTERNAL_URL="http://host.docker.internal:8080"
fi

export EXPO_PUBLIC_BACKEND_EXTERNAL_URL
echo "Starting with EXPO_PUBLIC_BACKEND_EXTERNAL_URL=$EXPO_PUBLIC_BACKEND_EXTERNAL_URL"
docker compose up --build
