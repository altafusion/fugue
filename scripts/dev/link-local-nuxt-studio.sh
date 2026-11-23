#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

NUXT_STUDIO_PATH="${NUXT_STUDIO_PATH:-$HOME/nuxt-studio}"
LOCAL_DIR="$ROOT/.local"
MARKER="$LOCAL_DIR/nuxt-studio-linked"
WORKSPACE="$ROOT/pnpm-workspace.yaml"
OVERRIDE_LINE="  nuxt-studio: file:${NUXT_STUDIO_PATH}"

if [[ ! -d "$NUXT_STUDIO_PATH" ]]; then
  echo "error: nuxt-studio clone not found at: ${NUXT_STUDIO_PATH}" >&2
  echo "Clone the repo or set NUXT_STUDIO_PATH to your checkout." >&2
  exit 1
fi

if [[ ! -x "${NUXT_STUDIO_PATH}/prep-studio.sh" ]]; then
  echo "error: ${NUXT_STUDIO_PATH}/prep-studio.sh is missing or not executable" >&2
  exit 1
fi

echo "==> Building nuxt-studio (prep-studio.sh)"
"${NUXT_STUDIO_PATH}/prep-studio.sh" "$@"

mkdir -p "$LOCAL_DIR"

if grep -qE '^  nuxt-studio: file:' "$WORKSPACE"; then
  echo "==> Updating existing nuxt-studio override in pnpm-workspace.yaml"
  # shellcheck disable=SC2016
  sed -i '' "s|^  nuxt-studio: file:.*|${OVERRIDE_LINE}|" "$WORKSPACE"
else
  echo "==> Adding nuxt-studio override to pnpm-workspace.yaml"
  if ! grep -q '^overrides:' "$WORKSPACE"; then
    echo "error: expected overrides: block in pnpm-workspace.yaml" >&2
    exit 1
  fi
  # Insert after the first overrides entry (h3 today).
  # shellcheck disable=SC2016
  sed -i '' "/^  h3: /a\\
${OVERRIDE_LINE}
" "$WORKSPACE"
fi

echo "$NUXT_STUDIO_PATH" > "$MARKER"

echo "==> pnpm install (wire local nuxt-studio into the workspace)"
pnpm install --config.blockExoticSubdeps=false

cat <<EOF

==> Linked nuxt-studio from:
    ${NUXT_STUDIO_PATH}

Test the fugue-content-site template:
  pnpm dev:fugue-content-site    → http://localhost:8001/
  Open Studio: ⌘. / Ctrl+. — nav must show Content, Media (not studio.nav.*)

Important: pnpm-workspace.yaml is modified — run pnpm unlink:nuxt-studio before committing.
EOF
