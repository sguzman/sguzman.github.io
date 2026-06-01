---
title: "bw-password-dedup"
description: "Clean duplicate passwords from bitwarden's export json"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

Deduplicate Bitwarden JSON exports by hashing each item after removing volatile fields (like IDs and timestamps). Produces a cleaned export you can re-import.

## Ambition

Provide a surgical deduplication tool for Bitwarden password exports, ensuring zero data loss while cleaning up redundant entries.

## What’s novel

- Policy-driven record merging (domain-based, username-based) with customizable collision strategies.
- Detailed JSON reporting system summarizing duplicate groups and differing data paths.
- Recursive object normalization ensuring identical records are matched regardless of key ordering.

## Highlights

- `--input <FILE>`: Bitwarden JSON export (required)
- `--output <FILE>`: Output file (default: `<input>.dedup.json`)
- `--pretty`: Pretty-print output JSON
- `--dry-run`: Show counts without writing output
- `--force`: Overwrite output file if it exists

## Stats

- Project page: /projects/bw-password-dedup/
- Primary language: Rust
- Commits: 5
- Created: 2026-01-28T10:51:47Z
- Last updated: 2026-01-28T11:32:26Z

## Links

- Repo: https://github.com/sguzman/bw-password-dedup
- README: /projects/readme/bw-password-dedup/
- DeepWiki: https://deepwiki.com/sguzman/bw-password-dedup/
