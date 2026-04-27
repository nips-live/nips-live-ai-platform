#!/usr/bin/env bash
set -euo pipefail
cd /root/nips-live/backend
if [ ! -f .env ]; then cp .env.example .env; echo "Edit /root/nips-live/backend/.env before deploying"; exit 1; fi
docker compose up -d --build
curl -f http://127.0.0.1:4000/health
