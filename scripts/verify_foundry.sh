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

# Every previously committed nested section route must retain its page and content.
legacy_count=0
while IFS= read -r -d '' source; do
  project="${source#content/projects/}"
  project="${project%/_index.md}"
  path="$output/projects/$project/index.html"
  require_file "$path"
  require_text "$path" "foundry-detail-article"
  require_text "$path" "BACK TO EXHIBITION"
  legacy_count=$((legacy_count + 1))
done < <(find content/projects -mindepth 2 -maxdepth 2 -type f -name '_index.md' -print0)

if ((legacy_count == 0)); then
  echo "ERROR: no existing project detail sections were verified" >&2
  exit 1
fi

# The theme must have emitted the actual Foundry CSS, not merely HTML class names.
css_found=0
while IFS= read -r -d '' stylesheet; do
  if grep -Fq '.foundry-index' "$stylesheet" && grep -Fq '.foundry-feature' "$stylesheet"; then
    css_found=1
    break
  fi
done < <(find "$output" -type f -name '*.css' -print0)
if ((css_found == 0)); then
  echo "ERROR: generated website is missing the Foundry CSS asset" >&2
  exit 1
fi

require_text "$root" 'id="foundry-index-toolbar"'
require_text "$root" 'js/foundry.js'

if grep -Ei 'source_projectarium_revision|taria/projectarium/|publication_authority|cohort_id|/mnt/data/' "$root" >/dev/null; then
  echo "ERROR: private-only marker leaked into the public project index" >&2
  exit 1
fi

# Run real Chromium/Playwright QA on generated public-only output.
# This is a required local release gate, not a hosted GitHub Actions job.
node scripts/test_foundry_browser.mjs "$output"

echo "PASS: Foundry offline checks, index render, $legacy_count existing project detail routes, built CSS asset, and privacy scan."
echo "Still required before deployment: artifact/design acceptance and any additional manual editorial rights approvals."
