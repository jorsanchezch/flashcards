#!/usr/bin/env bash
# One-command local run after clone. Same as: npm install && npm start
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ ! -d node_modules ]]; then
  npm install
fi
echo "Flashcards local: http://127.0.0.1:18480/"
echo "If Safari cannot open loopback, use the LAN URL Vite prints."
exec npm start
