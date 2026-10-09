#!/usr/bin/env bash
# Offline Foundry release gate. Run from a disposable checkout through Codex.
# No GitHub Actions, network access, private repository, or Taria input required.
set -euo pipefail

cd "$(dirname "$0")/.."
command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js is required" >&2; exit 2; }
command -v hugo >/dev/null 2>&1 || { echo "ERROR: Hugo is required to verify the actual template" >&2; exit 2; }

node scripts/check_foundry.mjs
node scripts/test_foundry_contract.mjs
node scripts/test_foundry_ui.mjs

output="$(mktemp -d)"
trap 'rm -rf "$output"' EXIT
hugo --minify --destination "$output"

require_file() {
  local path="$1"
  test -s "$path" || { echo "ERROR: missing generated page: $path" >&2; exit 1; }
}

require_text() {
  local path="$1"
  local expected="$2"
  grep -Fq "$expected" "$path" || {
    echo "ERROR: missing expected text '$expected' in $path" >&2
    exit 1
  }
}

root="$output/projects/index.html"
require_file "$root"
require_text "$root" "foundry-feature-grid"
require_text "$root" "foundry-index-grid"
require_text "$root" "Made to"
require_text "$root" "LanternLeaf"
require_text "$root" "Morphos"
require_text "$root" "NOT A PRODUCT CAPTURE"

# Historical nested project section routes must not be replaced by the catalogue.
for project in flatfekt fathrs cinegraph simurom; do
  path="$output/projects/$project/index.html"
  require_file "$path"
  require_text "$path" "foundry-detail-article"
  require_text "$path" "BACK TO EXHIBITION"
done

if grep -Ei 'source_projectarium_revision|taria/projectarium/|publication_authority|cohort_id|/mnt/data/' "$root" >/dev/null; then
  echo "ERROR: private-only marker leaked into the public project index" >&2
  exit 1
fi

echo "PASS: Foundry offline validation, public index render, nested legacy routes, and privacy scan."
echo "Still required before merge: automated Chromium/Firefox visual + keyboard/accessibility review."
