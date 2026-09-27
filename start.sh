#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but not found on PATH." >&2
  exit 1
fi

PORT="${PORT:-3000}" exec node server.js
