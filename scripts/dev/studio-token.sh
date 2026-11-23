#!/usr/bin/env bash
# Helper for the Studio publish token (STUDIO_GITHUB_TOKEN): check it, probe it, write it into local .env files.
#
#   pnpm studio-token clip                 what the clipboard holds (prefix and length only)
#   pnpm studio-token check                what GitHub says the token can do on the repo
#   pnpm studio-token probe                prove Contents write: throwaway branch, one file, branch deleted
#   pnpm studio-token write [--env FILE]   put the token into each apps/*/.env that has STUDIO_GITHUB_TOKEN=
#
# Options: --repo owner/name (default: from `git remote origin`), --env FILE (repeatable).
# The token comes from $STUDIO_TOKEN, else the clipboard (pbpaste, wl-paste or xclip). It is never printed and never
# put on a command line. Copy the token with the copy button on the GitHub page, then type this command by hand:
# copying the command from somewhere else replaces the clipboard.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

cmd="${1:-}"; shift || true
repo=""; envs=()
while (( $# )); do
  case "$1" in
    --repo) repo="${2:?--repo needs owner/name}"; shift 2 ;;
    --env) envs+=("${2:?--env needs a file}"); shift 2 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$repo" ]]; then
  url="$(git remote get-url origin 2>/dev/null || true)"
  repo="$(printf '%s' "$url" | sed -E 's#^(git@github\.com:|https://([^@/]*@)?github\.com/)##; s#\.git$##')"
  [[ "$repo" == */* ]] || { echo "cannot work out the repo from origin; pass --repo owner/name" >&2; exit 2; }
fi

read_token() {
  local t="${STUDIO_TOKEN:-}"
  if [[ -z "$t" ]]; then
    if command -v pbpaste >/dev/null 2>&1; then t="$(pbpaste)"
    elif command -v wl-paste >/dev/null 2>&1; then t="$(wl-paste)"
    elif command -v xclip >/dev/null 2>&1; then t="$(xclip -o -selection clipboard)"
    else echo "no clipboard tool found; set STUDIO_TOKEN instead" >&2; exit 1; fi
  fi
  printf '%s' "$t" | tr -d '[:space:]'
}

tok="$(read_token)"

# Calls the GitHub API with the token passed through curl's config on stdin, so it never shows in `ps`.
# api METHOD PATH [JSON] -> prints the HTTP status code, body in $BODY_FILE
BODY_FILE="$(mktemp)"
trap 'rm -f "$BODY_FILE"' EXIT
api() {
  local method="$1" path="$2" data="${3:-}"
  local args=(-s -o "$BODY_FILE" -w '%{http_code}' -X "$method" -K - -H "Accept: application/vnd.github+json")
  [[ -n "$data" ]] && args+=(-d "$data")
  printf 'header = "Authorization: Bearer %s"\n' "$tok" | curl "${args[@]}" "https://api.github.com/repos/$repo$path"
}

need_token() {
  [[ -n "$tok" ]] || { echo "no token: copy it first, or set STUDIO_TOKEN" >&2; exit 1; }
}

case "$cmd" in
  clip)
    echo "token starts with: ${tok:0:11}"
    echo "token length:      ${#tok}   (a fine-grained token is about 93 characters)"
    [[ "$tok" == github_pat_* ]] && echo "looks like a fine-grained token" \
      || echo "NOT a fine-grained token (github_pat_...): copy it again from the GitHub page"
    ;;
  check)
    need_token
    code="$(api GET "")"
    python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(d.get('full_name') or d.get('message'), d.get('permissions') or '', '[HTTP ' + sys.argv[2] + ']')" "$BODY_FILE" "$code"
    echo "note: permissions also reflect your own role; run 'probe' to prove the token can write"
    ;;
  probe)
    need_token
    code="$(api GET "/git/ref/heads/main")"
    [[ "$code" == 200 ]] || { echo "cannot read main: HTTP $code"; exit 1; }
    sha="$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['object']['sha'])" "$BODY_FILE")"
    br="token-probe-$(date +%s)"
    created=0
    cleanup() { [[ "$created" == 1 ]] && api DELETE "/git/refs/heads/$br" >/dev/null || true; }
    trap 'cleanup; rm -f "$BODY_FILE"' EXIT
    code="$(api POST "/git/refs" "{\"ref\":\"refs/heads/$br\",\"sha\":\"$sha\"}")"
    echo "create branch $br: HTTP $code (201 = ok)"; [[ "$code" == 201 ]] || exit 1; created=1
    code="$(api PUT "/contents/.token-probe" "{\"message\":\"chore: token probe\",\"content\":\"cHJvYmU=\",\"branch\":\"$br\"}")"
    echo "write a file on it:   HTTP $code (201 = ok)"; [[ "$code" == 201 ]] || exit 1
    code="$(api DELETE "/git/refs/heads/$br")"; created=0
    echo "delete the branch:    HTTP $code (204 = ok)"; [[ "$code" == 204 ]] || exit 1
    ;;
  write)
    need_token
    [[ "$tok" == github_pat_* ]] || { echo "the token does not start with github_pat_; refusing to write it" >&2; exit 1; }
    if (( ${#envs[@]} == 0 )); then
      for f in apps/*/.env; do [[ -f "$f" ]] && envs+=("$f"); done
    fi
    for f in "${envs[@]}"; do
      if [[ ! -f "$f" ]]; then echo "missing   $f"
      elif ! git check-ignore -q "$f"; then echo "skipped   $f (not gitignored: refusing to write a secret into it)"
      elif grep -q '^STUDIO_GITHUB_TOKEN=' "$f"; then
        T="$tok" perl -pi -e 's/^STUDIO_GITHUB_TOKEN=.*/STUDIO_GITHUB_TOKEN=$ENV{T}/' "$f"; echo "updated   $f"
      else echo "no STUDIO_GITHUB_TOKEN= line in $f (add it by hand)"; fi
    done
    ;;
  *)
    echo "usage: studio-token.sh clip|check|probe|write [--repo owner/name] [--env FILE]..." >&2
    exit 2
    ;;
esac
