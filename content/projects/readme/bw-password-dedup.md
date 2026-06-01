+++
title = "bw-password-dedup README"
description = "README mirror for bw-password-dedup"
draft = false
+++

[Repository](https://github.com/sguzman/bw-password-dedup) | [DeepWiki](https://deepwiki.com/sguzman/bw-password-dedup/)

# bw-passport-dedup

Deduplicate Bitwarden JSON exports by hashing each item after removing volatile fields
(like IDs and timestamps). Produces a cleaned export you can re-import.

By default it uses `config.toml`, which defines what counts as a duplicate.

## Build

```bash
cargo build --release
```

## Usage

```bash
cargo run -- \
  --input tmp/bitwarden_export_20260128034458.json \
  --output tmp/bitwarden_export_20260128034458.dedup.json \
  --pretty
```

### Config

The tool looks for `config.toml` in the current directory (or use `--config <FILE>`).

Default policy is domain + username + password:

```toml
[dedup]
keep = "first"
policy_keys = ["domain", "username", "password"]
```

If you want full-item hashing instead of policy keys, set `policy_keys = []` and
use the ignore lists to control which fields are excluded.

### Common flags

- `--input <FILE>`: Bitwarden JSON export (required)
- `--output <FILE>`: Output file (default: `<input>.dedup.json`)
- `--pretty`: Pretty-print output JSON
- `--dry-run`: Show counts without writing output
- `--force`: Overwrite output file if it exists
- `--keep <first|last|newest|oldest>`: Choose which duplicate to keep
- `--ignore-key <a,b,c>`: Ignore keys anywhere in the item (default: `id,revisionDate,creationDate,passwordHistory`)
- `--ignore-path <a.b.c>`: Ignore a specific path relative to each item
- `--trim-strings`: Trim whitespace before hashing
- `--lowercase-strings`: Lowercase strings before hashing
- `--sort-uris[=true|false]`: Sort `login.uris` before hashing (default: true)
- `--policy-key <a,b,c>`: Override config policy keys (e.g., `domain,username,password`)
- `--config <FILE>`: Load settings from a TOML file
- `--report <FILE>`: Write a JSON report of duplicate groups

### Examples

Ignore URI order and keep the newest revision:

```bash
cargo run -- \
  --input tmp/bitwarden_export_20260128034458.json \
  --keep newest \
  --sort-uris=true
```

Ignore the notes field when computing duplicates:

```bash
cargo run -- \
  --input tmp/bitwarden_export_20260128034458.json \
  --ignore-key notes
```
