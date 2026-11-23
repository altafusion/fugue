#!/usr/bin/env bash
# Build an app and serve its production output for Playwright E2E.
# Usage: playwright-static-server.sh [fugue-content-site]   (default: fugue-content-site)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

APP="${1:-fugue-content-site}"

case "${APP}" in
  fugue-content-site)
    PACKAGE="@altafusion/fugue-content-site-template"
    DEFAULT_PORT=8001
    ;;
  *)
    echo "playwright-static-server: unknown app '${APP}' (expected fugue-content-site)" >&2
    exit 1
    ;;
esac

# PORT overrides only the default app; the explicit 2nd server always uses its own port.
export PORT="${PORT:-${DEFAULT_PORT}}"

echo "playwright-static-server: building ${APP}…" >&2
pnpm run "build:${APP}"

echo "playwright-static-server: preview http://127.0.0.1:${PORT}/ (${APP})" >&2
exec pnpm --filter "${PACKAGE}" run preview --port "${PORT}"
