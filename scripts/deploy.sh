#!/usr/bin/env bash
# Publish public/ to the hermit-my Cloudflare Pages project.
# Needs CLOUDFLARE_API_TOKEN (Pages: Edit) and CLOUDFLARE_ACCOUNT_ID in the environment.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ACCOUNT_ID:?set CLOUDFLARE_ACCOUNT_ID}"

npx --yes wrangler@3 pages deploy public \
  --project-name hermit-my \
  --branch main \
  --commit-message "$(git log -1 --pretty=%s 2>/dev/null || echo manual deploy)"
