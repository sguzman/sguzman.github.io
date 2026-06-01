+++
title = "pollstats README"
description = "README mirror for pollstats"
draft = false
+++

[Repository](https://github.com/sguzman/pollstats) | [DeepWiki](https://deepwiki.com/sguzman/pollstats/)

# pollstats

Config-driven downloader + local data store for US politics datasets, with optional Postgres ingest of manifest metadata.

## Quick start

1) Build:
- `cargo build`

2) List configured datasets:
- `cargo run -- list`

3) Check remote vs local:
- `cargo run -- check`

4) Update local store (download only if remote is newer):
- `cargo run -- update`

5) Force download (replace local regardless):
- `cargo run -- download`

6) Postgres (optional):
- `docker compose -f tmp/docker-compose.yaml up -d`
- `cargo run -- pg-init`
- `cargo run -- pg-load`

## Config (TOML)

- `config/pollstats.toml` (store location, Postgres URL, HTTP settings)
- `config/sources.toml` (sources + datasets)

Override:
- `POLLSTATS_CONFIG` (path to `pollstats.toml`)
- `POLLSTATS_PG_URL` (Postgres URL)

## Data layout

- `.cache/pollstats/raw/<source_id>/<dataset_id>/latest/` latest fetched artifact(s)
- `.cache/pollstats/raw/<source_id>/<dataset_id>/history/<timestamp>/` older versions (when content SHA changes)
- `.cache/pollstats/manifests/<source_id>/<dataset_id>.json` tracks ETag/Last-Modified/SHA256
