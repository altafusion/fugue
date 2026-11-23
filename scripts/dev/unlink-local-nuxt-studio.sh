#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

WORKSPACE="$ROOT/pnpm-workspace.yaml"
MARKER="$ROOT/.local/nuxt-studio-linked"

if ! grep -qE '^  nuxt-studio: file:' "$WORKSPACE"; then
  echo "No local nuxt-studio override in pnpm-workspace.yaml — nothing to do."
  rm -f "$MARKER"
  exit 0
fi

echo "==> Removing nuxt-studio file: override from pnpm-workspace.yaml"
sed -i '' '/^  nuxt-studio: file:/d' "$WORKSPACE"
rm -f "$MARKER"

echo "==> pnpm install (restore catalog nuxt-studio)"
pnpm install --config.blockExoticSubdeps=false

echo "==> Restored nuxt-studio from pnpm catalog (catalog:content)."
