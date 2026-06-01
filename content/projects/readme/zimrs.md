+++
title = "zimrs README"
description = "README mirror for zimrs"
draft = false
+++

[Repository](https://github.com/sguzman/zimrs) | [DeepWiki](https://deepwiki.com/sguzman/zimrs/)

# zimrs

`zimrs` converts a Wiktionary `.zim` archive into a queryable dictionary database and includes operational tooling for verification, reindexing, export, benchmarking, and release packaging.

Default backend is PostgreSQL (`data.dictionary`). SQLite remains fully supported as a compatibility backend.

## Features

- Postgres-first ingestion with automatic startup checks, database bootstrap, and schema management.
- SQLite compatibility mode for local/offline workflows.
- Configurable ZIM -> DB ingestion with namespace/MIME/prefix filters.
- Resumable checkpointing for long-running archive conversions.
- Optional parallel extraction workers.
- Nested-list-aware definition extraction and relation extraction (`synonyms`, `antonyms`, `translations`).
- Per-language normalization plugins and confidence scoring.
- Alias normalization table for search (`lemma_aliases`).
- Optional search indexing (`page_fts`) for both backends.
- Incremental reindex command.
- JSON/JSONL export command.
- Release artifact builder with packaged sample database.

## Commands

```bash
# Convert (default command)
cargo run --release -- --config config/wiktionary.toml convert

# Incremental reindex
cargo run --release -- --config config/wiktionary.toml reindex

# Export to JSONL
cargo run --release -- --config config/wiktionary.toml export-json --output out/wiktionary.jsonl

# Build synthetic sample DB (SQLite helper for release tooling)
cargo run --release -- --config config/wiktionary.toml sample-db --output out/sample.sqlite

# Build release artifacts bundle (archive + checksum + sample DB)
cargo run --release -- --config config/wiktionary.toml build-artifacts
```

Default command behavior:

```bash
cargo run --release -- --config config/wiktionary.toml
```

is equivalent to:

```bash
cargo run --release -- --config config/wiktionary.toml convert
```

## Backend Selection

Precedence order:

1. CLI flags (`--sqlite`, `--backend`, `--pg-*`)
2. `config/wiktionary.toml`
3. built-in defaults

Backend flags:

- `--backend postgres`
- `--backend sqlite`
- `--sqlite` (convenience alias for SQLite compatibility mode)

### PostgreSQL CLI overrides

- `--pg-host`
- `--pg-port`
- `--pg-user`
- `--pg-password`
- `--pg-database`
- `--pg-schema`
- `--pg-sslmode`

## Config

Main config file: [config/wiktionary.toml](/win/linux/Code/rust/zimrs/config/wiktionary.toml)

Important sections:

- `backend`: storage backend (`postgres` default, `sqlite` optional).
- `postgres`: server/database/schema connection settings.
- `input`: source ZIM path + SQLite file path (used when backend is SQLite).
- `selection`: entry filtering and extraction window.
- `checkpoint`: resumable ingestion control.
- `workers`: extraction parallelism (`extraction_threads`).
- `extraction`: parser behavior, relation toggles, normalizer mapping, confidence threshold.
- `reindex`: incremental reindex watermark policy.
- `export`: JSON output defaults.
- `release`: artifact directory and sample DB naming.

## PostgreSQL Defaults

Defaults come from your compose-aligned setup (`tmp/docker-compose.yaml`):

- host: `127.0.0.1`
- port: `5432`
- user: `admin`
- password: `admin`
- database: `data`
- schema: `dictionary`
- sslmode: `disable`

Startup behavior in Postgres mode:

- retries with backoff for transient connectivity failures.
- validates and (if missing) creates target database.
- creates target schema if needed.
- creates all managed tables/indexes in target schema.

Overwrite behavior (`convert --overwrite`) in Postgres mode:

- drops only target schema and recreates it.
- recreates all managed objects from scratch.
- keeps other schemas/databases untouched.

## SQLite Compatibility Mode

SQLite mode preserves previous behavior and uses `input.sqlite_path` + `[sqlite]` settings.

Example:

```bash
cargo run --release -- \
  --config config/wiktionary.toml \
  --sqlite \
  convert \
  --overwrite \
  --no-resume
```

## Run & Verify

- Generate dictionary data (Postgres default):
  ```bash
  cargo run --release -- \
    --config config/wiktionary.toml \
    convert \
    --max-entries 500000 \
    --extraction-threads 16 \
    --overwrite \
    --no-resume
  ```

- Verify a downloaded ZIM before conversion:
  ```bash
  cargo run --release -- --config config/wiktionary.toml verify-zim
  ```
  Add `--skip-checksum` for quick checks or tune `--tail-window-bytes` for very large archives.

## Managed Schema

Managed tables (both backends):

- `pages`: canonical entry records (URL, title, namespace, MIME, content hash, timestamps).
- `definitions`: extracted definition senses with language + normalized text + confidence.
- `relations`: extracted relation targets (synonyms/antonyms/translations) with confidence.
- `lemma_aliases`: normalized lookup aliases.
- `ingestion_runs`: run-level metrics.
- `ingestion_checkpoints`: resume metadata.
- `reindex_state`: incremental reindex watermarks.
- `page_fts` (if enabled): search materialization.

Indexing behavior:

- SQLite: FTS5 virtual table for `page_fts`.
- Postgres: `page_fts` with generated `tsvector` + GIN index.

## Language Coverage

Wiktionary is multilingual. Import preserves source language for definitions/relations and stores aliases from extracted language sections. Language allowlists support both language names and ISO-like short codes (for example `English` and `en`).

## Benchmarks

Suite:

```bash
cargo bench --bench extraction_bench -- --sample-size 20
```

Baseline results are tracked in [benchmarks/BASELINE.md](/win/linux/Code/rust/zimrs/benchmarks/BASELINE.md).

## Tests

```bash
cargo test
```

Real-ZIM harness (ignored by default):

```bash
cargo test harness_wiktionary_sample -- --ignored --nocapture
```

Harness behavior:

- Uses `tmp/wiktionary_en_all_nopic_2026-02.zim` by default.
- Override with `ZIMRS_TEST_ZIM=/path/to/file.zim`.
- Auto-skips when the `.zim` tail appears sparse/incomplete.
- Uses SQLite compatibility mode for deterministic local test behavior.

## Release Artifacts

Local artifact script:

```bash
./scripts/build_release_artifacts.sh config/wiktionary.toml
```

Output in `dist/`:

- `zimrs-release.tar.gz`
- `zimrs-release.sha256`
- unpacked staging directory with binary, docs, config, and sample DB

CI workflow:

- [release-artifacts.yml](/win/linux/Code/rust/zimrs/.github/workflows/release-artifacts.yml)

## Notes

- The project uses a local patched `zim` crate under `vendor/zim` to tolerate sentinel pointer values in newer ZIM metadata.
- If your ZIM file is incomplete/sparse, conversion quality will appear degraded regardless of backend.
