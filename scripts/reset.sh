#!/usr/bin/env bash
# Full reset for the Fugue workspace: drop build caches, reinstall deps, regenerate Nuxt types.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Must mirror pnpm-workspace.yaml globs; omitting a dir leaves node_modules/.nuxt and skips Nuxt type regen.
PKG_DIRS=(packages-platform packages-product packages-fugue packages-consumer templates)

echo "==> Removing Nuxt / Vite / build artifacts under ${PKG_DIRS[*]}..."
while IFS= read -r -d '' dir; do
  rm -rf "$dir"
done < <(find "${PKG_DIRS[@]}" -type d \( \
  -name .nuxt -o -name .output -o -name .nitro -o -name .data \
  -o -name dist -o -name .vite -o -name .turbo -o -name .cache \
  -o -name .histoire \
  \) -print0 2>/dev/null)

find "${PKG_DIRS[@]}" -name '*.tsbuildinfo' -delete 2>/dev/null || true

echo "==> Removing test and tooling caches at repo root..."
rm -rf \
  node_modules \
  playwright-report \
  test-results \
  blob-report \
  coverage \
  .eslintcache \
  .vite \
  .turbo \
  .cache

while IFS= read -r -d '' dir; do
  rm -rf "$dir"
done < <(find "${PKG_DIRS[@]}" -maxdepth 2 -type d -name node_modules -print0 2>/dev/null)

echo "==> Reinstalling dependencies..."
pnpm install

echo "==> Regenerating Nuxt types..."
while IFS= read -r -d '' config; do
  pkg_dir="$(dirname "$config")"
  # In-app layers (apps/*/layers/*) have a nuxt.config.ts but no package.json, so they are not pnpm filter targets.
  [ -f "${pkg_dir}/package.json" ] || continue
  pkg_name="$(node -p "require('./${pkg_dir}/package.json').name")"
  echo "    ${pkg_name}"
  pnpm --filter "${pkg_name}" exec node "${ROOT}/packages-platform/nuxt-base/dev/nuxt-prepare.mjs"
done < <(find "${PKG_DIRS[@]}" -maxdepth 2 -name nuxt.config.ts -print0 2>/dev/null)

echo "==> Fugue workspace reset complete."
