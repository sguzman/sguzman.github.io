+++
title = "pulsewire README"
description = "README mirror for pulsewire"
draft = false
+++

[Repository](https://github.com/sguzman/pulsewire) | [DeepWiki](https://deepwiki.com/sguzman/pulsewire/)

# Pulsewire

<a href="#"><img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/palette/macchiato.png" width="600px"/></a>

![Pulsewire banner](branding/pulsewire-banner.png)

<div align="center">
  <a href="https://github.com/sguzman/pulsewire/issues">
    <img src="https://img.shields.io/github/issues/sguzman/pulsewire?color=fab387&labelColor=303446&style=for-the-badge">
  </a>
  <a href="https://github.com/sguzman/pulsewire/stargazers">
    <img src="https://img.shields.io/github/stars/sguzman/pulsewire?color=1f6feb&labelColor=303446&style=for-the-badge">
  </a>
  <a href="https://github.com/sguzman/pulsewire">
    <img src="https://img.shields.io/github/repo-size/sguzman/pulsewire?color=ff4d4d&labelColor=303446&style=for-the-badge">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/static/v1.svg?style=for-the-badge&label=License&message=MIT&logoColor=ffffff&colorA=313244&colorB=2ea043"/>
  </a>
</div>

Pulsewire is a time-aware ingestion engine for the open web: RSS/Atom feeds today, release calendars and structured datasets next. It polls with adaptive backoff, respects per-domain limits, stores payloads + items in SQLite/Postgres, and ships a companion HTTP server for reader clients.

## Overview

- Fetcher loads app/domain/feed config from a TOML bundle, migrates/creates a
  SQL database (SQLite or Postgres) and bulk-ingests feed definitions.
- Scheduler ticks every 5s, finds due feeds, and processes them with bounded
  parallelism. Per-domain semaphores prevent hammering the same host; optional
  global cap controls total concurrency.
- Each feed alternates HEAD/GET based on last state. HEAD decides whether
  content changed; GET parses the body (via `feed-rs`), hashes it, and stores
  payload + items. Errors trigger exponential backoff with jitter and persisted
  state.
- Server provides auth, subscriptions, read/unread state, folders, favorites,
  and search APIs for clients. It reads from the fetcher database schema and
  maintains its own state in a separate schema.

## Code Layout

- `crates/core/src/` – shared runtime logic (config, scheduler, infra, ports,
  domain, feed parsing).
- `crates/fetcher/src/main.rs` – fetcher entrypoint; config loading, repo
  init/migrations, optional ingest benchmark, then scheduler loop.
- `crates/server/src/main.rs` – server entrypoint; config loading, schema apply,
  and HTTP routes.
- `crates/cli/src/main.rs` – ops CLI for validation/cleanup commands.
- `crates/tui/src/main.rs` – interactive terminal UI for the server API.
- `crates/*/README.md` – crate-specific docs (core/fetcher/cli).
- `crates/fetcher/res/` – example config bundle (`config.toml`, `domains.toml`,
  `feeds/*.toml`).
- `crates/server/res/` – server config and OpenAPI docs (`config.toml`,
  `openapi.json`, `openapi.html`).
- `branding/` – logo/banner/icon assets.

## Configuration
Fetcher config resolution order: 1) CLI argument path (if provided), else 2)
`CONFIG_PATH` environment variable (if set), else 3)
`crates/fetcher/res/config.toml` when present. Feed definitions default to
`feeds/` under the config directory, but can be overridden with `FEEDS_DIR`.

`config.toml` (fetcher app sections):

- `[app]` – `mode` (`dev` deletes the DB on boot; `prod` leaves it intact) and
  `timezone`.
- `[database]` – `dialect` (`sqlite` default, or `postgres`).
- `[sqlite]` – `path` to the SQLite file.
- `[postgres]` – connection params: `user`, `password`, `host`, `port`,
  `database`, `ssl_mode`, `schema` (fetcher schema).
- `[polling]` – `default_seconds`, `max_seconds`, `jitter_fraction`.
- `[backoff]` – `error_base_seconds`, `max_error_seconds`.
- `[requests]` – `global_max_concurrent_requests` and `user_agent`.
- `[state_history]` – `sample_rate` between 0–1 for historical state rows.
- `[logging]` – `level`; `file_enabled`, `file_level`, `file_directory`,
  `file_rotation`.
- `[metrics]` – `enabled` toggles the Prometheus endpoint; `bind` sets the
  listen address.

`domains.toml`: list of `{ name, max_concurrent_requests }` entries limiting concurrent requests per host.

`feeds/*.toml`: one or more files shaped as
`[[feeds]] { id, url, base_poll_seconds?, category?, provenance?, tags?, language?, content_type?, id_prefix? }`.
File-level defaults can be set at top-level (`base_poll_seconds`, `id_prefix`,
`category`, `provenance`, `tags`, `language`, `content_type`) and are inherited
by feeds that omit them.

Server config (`crates/server/res/config.toml`):

- `[app]` – `mode` and `timezone`.
- `[http]` – `host`, `port`.
- `[database]` – `dialect`.
- `[sqlite]` – `path`.
- `[postgres]` – connection params plus `schema` (server schema) and
  `fetcher_schema`.
- `[logging]` – `level`.
- `[auth]` – `token_ttl_seconds`.
- `[dev]` – `reset_on_start` (clears server-only tables).
  - In dev mode, the server seeds the user from `[seed]` if it does not exist
    (defaults to `admin/admin`).

## HTTP Server API (high Level)

- Auth: login/logout, rotate token, list/revoke tokens.
- Users: create user, change password, delete account, password reset flow.
- Feeds: list feeds, feed detail, list feed entries.
- Entries: list, detail, read/unread, batch read/unread, unread counts, search.
- Subscriptions: list/create/delete.
- Folders: CRUD, assign/remove feeds, list folder entries, unread counts (folder
  - per-feed).
- Favorites: list/add/remove feeds, unread counts.

OpenAPI docs:

- Spec: `GET /openapi.json`
- UI: `GET /docs`

## CLI Usage

- Run fetcher scheduler (default config resolution):
  `cargo run -p pulsewire-fetcher --release`
- Run fetcher with explicit config:
  `cargo run -p pulsewire-fetcher --release -- /path/to/config.toml`
- Ingest benchmark only (no scheduler):
  `cargo run -p pulsewire-fetcher --release -- --ingest-benchmark 50000`
- Validate config + semantic checks:
  `cargo run -p pulsewire-cli -- validate /path/to/config.toml`
- Clean local SQLite + logs (requires flag):
  `cargo run -p pulsewire-cli -- clean /path/to/config.toml --confirm`
- Run server (default config): `cargo run -p pulsewire-server --release`
- Run server with explicit config:
  `SERVER_CONFIG_PATH=/path/to/config.toml cargo run -p pulsewire-server --release`
- Run TUI (uses the TUI config for server URL):
  `PULSEWIRE_TUI_CONFIG=crates/tui/res/config.toml cargo run -p pulsewire-tui`

## Data & Schema Notes

- Fetcher DDL lives in `crates/core/res/sql/{sqlite,postgres}/schema.sql`.
- Server DDL lives in `crates/server/res/sql/{sqlite,postgres}/schema.sql`.
- Postgres uses separate schemas: `fetcher` for fetcher tables, `server` for
  server state.

## Development

- Tooling guidance: `docs/ai/tools/ADDING.md`
- Tooling: cargo-release, git-cliff, just, biome, taplo, rustfmt, lychee, typos
- Justfile: `just build`, `just fmt`, `just validate`, `just test`,
  `just post-change`, `just all`
- Release policy: `docs/RELEASE.md`
- Roadmap: `docs/ROADMAP.md`
- Changelog config: `cliff.toml`
- Release config: `release.toml`
- License inventory:
  `cargo about generate about.hbs > docs/THIRD_PARTY_LICENSES.md`
- Build: `cargo build`
- Tests: `cargo test`
- TOML validation: `taplo validate`
- Link validation: `lychee --config lychee.toml .`
- JSON formatting: `biome format --write .`

## License
MIT.
