#!/usr/bin/env bash
set -euo pipefail

# EXPO_PUBLIC_BACKEND_URL and WEB_AUTH_URL need a reachable host
# so Expo and email links work from devices outside Docker.
# - If variables are already set, keep them
# - On Linux, default to the first non-loopback address
# - On macOS/Windows, default to host.docker.internal

OS_NAME=$(uname -s)
if [ "$OS_NAME" = "Linux" ]; then

  HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
  if [ -z "$HOST_IP" ]; then
    echo "Failed to detect host IP. Please set EXPO_PUBLIC_BACKEND_URL and WEB_AUTH_URL manually." >&2
    echo "Example: EXPO_PUBLIC_BACKEND_URL=\"http://192.168.x.x:8080\" WEB_AUTH_URL=\"http://192.168.x.x:5173\" ./scripts/up-dev.sh" >&2
    exit 1
  fi
  DEFAULT_BACKEND_URL="http://$HOST_IP:8080"
  DEFAULT_WEB_AUTH_URL="http://$HOST_IP:${WEB_AUTH_EXTERNAL_PORT:-5173}"
else
  DEFAULT_BACKEND_URL="http://host.docker.internal:8080"
  DEFAULT_WEB_AUTH_URL="http://host.docker.internal:${WEB_AUTH_EXTERNAL_PORT:-5173}"
fi

if [ -z "${EXPO_PUBLIC_BACKEND_URL:-}" ]; then
  EXPO_PUBLIC_BACKEND_URL="$DEFAULT_BACKEND_URL"
  echo "Computed EXPO_PUBLIC_BACKEND_URL=$EXPO_PUBLIC_BACKEND_URL"
else
  echo "Using EXPO_PUBLIC_BACKEND_URL from environment: $EXPO_PUBLIC_BACKEND_URL"
fi

if [ -z "${WEB_AUTH_URL:-}" ]; then
  WEB_AUTH_URL="$DEFAULT_WEB_AUTH_URL"
  echo "Computed WEB_AUTH_URL=$WEB_AUTH_URL"
else
  echo "Using WEB_AUTH_URL from environment: $WEB_AUTH_URL"
fi

export EXPO_PUBLIC_BACKEND_URL
export WEB_AUTH_URL

echo "Starting with EXPO_PUBLIC_BACKEND_URL=$EXPO_PUBLIC_BACKEND_URL"
echo "Starting with WEB_AUTH_URL=$WEB_AUTH_URL"
docker compose up --build
