#!/usr/bin/env bash
# Netlify build — auth for private altafusion-monorepo git deps, install, build.
# Requires PNPM_FLAGS=--version in netlify.toml (skip Netlify's pre-command pnpm install).
set -euo pipefail

echo "netlify-build: installing dependencies with private monorepo git auth..."

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "ERROR: GITHUB_TOKEN is not set."
  echo "altafusion-monorepo is private. Add a fine-grained GitHub PAT with Contents:read on"
  echo "altafusion/altafusion-monorepo to Netlify → Site configuration → Environment variables"
  echo "→ Builds scope (not Functions). Name the variable GITHUB_TOKEN."
  exit 1
fi

LOCKFILE="pnpm-lock.yaml"
LOCKFILE_BAK="${LOCKFILE}.install-bak"

restore_lockfile() {
  if [[ -f "$LOCKFILE_BAK" ]]; then
    cp "$LOCKFILE_BAK" "$LOCKFILE"
    rm -f "$LOCKFILE_BAK"
  fi
}
trap restore_lockfile EXIT

# Git credential helpers (insteadOf alone is unreliable under pnpm on Netlify).
printf 'machine github.com\nlogin x-access-token\npassword %s\n' "$GITHUB_TOKEN" > "${HOME}/.netrc"
chmod 600 "${HOME}/.netrc"
git config --global credential.helper store
printf 'https://x-access-token:%s@github.com\n' "$GITHUB_TOKEN" > "${HOME}/.git-credentials"
chmod 600 "${HOME}/.git-credentials"
git config --global url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
git config --global url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "git@github.com:"

if [[ -f "$LOCKFILE" ]]; then
  cp "$LOCKFILE" "$LOCKFILE_BAK"
  AUTH_REPO="https://x-access-token:${GITHUB_TOKEN}@github.com/altafusion/altafusion-monorepo.git"
  sed -i.bak \
    -e "s|repo: git@github.com:altafusion/altafusion-monorepo.git|repo: ${AUTH_REPO}|g" \
    -e "s|repo: https://github.com/altafusion/altafusion-monorepo.git|repo: ${AUTH_REPO}|g" \
    "$LOCKFILE"
  rm -f "${LOCKFILE}.bak"
fi

corepack enable
corepack pnpm install --frozen-lockfile

# Restore clean lockfile before build — Netlify secrets scanner reads repo files after build.
restore_lockfile
trap - EXIT

corepack pnpm build
