+++
title = "bulk-merge README"
description = "README mirror for bulk-merge"
draft = false
+++

[Repository](https://github.com/sguzman/bulk-merge) | [DeepWiki](https://deepwiki.com/sguzman/bulk-merge/)

# bulk-merge

`bulk-merge` is a Rust CLI that ingests large bibliographic metadata dumps into
PostgreSQL as usable, queryable tables.

## Phase 1 scope (current)

- LibGen-only ingestion
- Dedicated tables per dump kind (`fiction` vs `compact`)
- Resumable imports and incremental updates tracked in `bm_meta`
- Ingest speed first: bulk load via `COPY`, create indexes after load
- 1-to-1 field mapping from the MySQL dump to PostgreSQL columns (no semantic normalization yet)

## Non-goals (Phase 1)

- Cross-source merging / identity resolution
- Fuzzy matching / deduplication graphs
- Universal canonical “work/author” schema

## Quick start

1) Ensure Postgres is running (see `tmp/docker-compose.yaml`).

2) Initialize schemas and bookkeeping tables:

```bash
cargo run -- init-db --config config/bulk-merge.toml
```

## Configuration

The project is configured via a single TOML control pane. See:

- `config/bulk-merge.toml`
- `docs/config.md`
