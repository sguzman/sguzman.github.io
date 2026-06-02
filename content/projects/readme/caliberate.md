+++
title = "caliberate README"
description = "README mirror for caliberate"
draft = false
+++

[Repository](https://github.com/sguzman/caliberate) | [DeepWiki](https://deepwiki.com/sguzman/caliberate/)

# Caliberate

Caliberate is a Rust workspace for building a Calibre-like ebook platform as a set of focused crates instead of a single monolith. The repository combines runnable binaries, shared domain crates, and a large documentation tree that tracks parity goals against Calibre's CLI, server, GUI, ingest, metadata, and plugin surfaces.

The project is not a finished drop-in Calibre replacement. It is an actively structured platform build with real implementations in configuration, storage, ingest, database, server, GUI shell, and utility layers, alongside roadmap and tranche docs for areas that are still partial or stubbed.

## What The Repo Contains

- A Cargo workspace split into application, core, database, library, asset, conversion, server, device, plugin, GUI, job, metadata, format, and archive crates.
- Multiple binaries that mirror familiar Calibre entry points:
  - `caliberate`
  - `calibredb`
  - `calibre-server`
  - `ebook-convert`
  - `caliberate-gui`
- A checked-in control-plane config at `config/control-plane.toml`.
- A documentation tree under `docs/` with inventory docs, subsystem roadmaps, and tranche-by-tranche implementation notes.

## Current Status

The workspace is beyond pure scaffolding, but still early relative to its long-term scope.

Implemented or meaningfully wired today:

- Control-plane configuration loading, validation, persistence, logging, metrics bootstrap, and runtime path creation.
- SQLite-backed metadata database with schema migration support, Calibre-oriented helper SQL functions, and tests covering books, metadata relations, preferences, FTS behavior, notes, and custom columns.
- Library ingest with copy/reference modes, duplicate policy handling, archive preview support, and optional background ingest workers.
- Local asset storage with zstd compression, SHA-256 hashing, duplicate detection, storage verification, and compaction planning.
- Basic OPDS/content server endpoints with optional API-key auth middleware.
- Device detection and file sync helpers.
- Metadata extraction for supported formats plus archive introspection and extraction for ZIP, RAR, 7Z, and ZPAQ.
- A native GUI shell built with `eframe/egui`, including library and preferences views.

Still partial, stubbed, or intentionally limited:

- Format-specific conversion is mostly unimplemented beyond passthrough copy behavior when input and output formats match.
- `crates/formats` contains parser placeholders rather than full readers.
- `crates/jobs` is present as structure, but its IPC/scheduler modules are still placeholders.
- Some GUI parity features are represented as shell/state work rather than a complete desktop app.
- The docs describe broader parity targets than the current runtime delivers.

## Workspace Architecture

The root `Cargo.toml` defines a workspace with these crates:

- `crates/app`
  - Top-level application wiring and binary entry points.
  - Owns bootstrap, CLI parsing, and the executable surfaces that tie the workspace together.
- `crates/core`
  - Shared control-plane configuration, validation, logging, metrics, path policy, and common error types.
- `crates/db`
  - SQLite database layer, schema migration logic, metadata queries, FTS wiring, and metadata cache helpers.
- `crates/library`
  - Library-domain ingest pipeline and storage-facing library logic.
- `crates/assets`
  - Asset copy/reference storage, compression, hashing, integrity checks, and compaction planning.
- `crates/conversion`
  - Conversion request settings, pipeline orchestration, and conversion job tracking.
- `crates/server`
  - Axum-based HTTP server, auth middleware, and OPDS endpoints.
- `crates/device`
  - Device mount detection, sync/copy workflows, and orphan cleanup helpers.
- `crates/plugins`
  - Plugin manifest discovery, registration, and permission modeling.
- `crates/gui`
  - `eframe/egui` desktop shell, library view, and preferences UI.
- `crates/jobs`
  - Reserved workspace for background job IPC and scheduling infrastructure.
- `crates/metadata`
  - Metadata extraction, archive handling, and online metadata/cover provider integration.
- `crates/formats`
  - Format-specific parser namespace for EPUB, MOBI, AZW, and PDF handling.
- `crates/zpaq`
  - Custom ZPAQ inspection and extraction support used by metadata/archive flows.

## Binary Entry Points

The main user-facing binaries live in `crates/app/src/bin/`.

### `caliberate`

The generic application bootstrap binary.

- Loads `config/control-plane.toml` by default.
- Initializes logging, metrics, runtime directories, and Tokio runtime settings.
- Currently supports `check-config`.
- Otherwise starts the runtime and waits for shutdown.

### `calibredb`

The largest CLI surface in the repo, modeled after Calibre's database CLI.

Implemented command families include:

- Database setup and inspection:
  - `check-config`
  - `init`
  - `info`
  - `show`
  - `show-metadata`
  - `list`
  - `search`
- Library ingest and removal:
  - `add`
  - `remove`
  - `extract-archive`
- Asset management:
  - `assets list`
  - `assets stats`
  - `assets verify`
  - `assets compact`
- Search/index operations:
  - `fts status`
  - `fts rebuild`
  - `fts search`
  - `fts enable`
  - `fts disable`
- Metadata/category operations:
  - `list-categories`
  - `saved-searches`
  - `custom-columns`
  - `set-custom`
  - `set-metadata`
  - `notes`
  - `formats`
  - `set`
- Library maintenance/export:
  - `restore-database`
  - `clone`
  - `embed-metadata`
  - `check-library`
  - `export`
  - `backup-metadata`
  - `catalog`
- Device integration:
  - `device ...`

This is the CLI most directly exercising the database, ingest, assets, metadata, and device crates.

### `calibre-server`

Server runner and server management CLI.

- Can launch the local HTTP server.
- Can probe `health`, `opds-root`, `opds-books`, and `opds-search`.
- Can download a book payload through the OPDS acquisition endpoint.
- Can list/add/remove configured API keys in the control-plane config.
- Supports CLI overrides for host, port, scheme, URL prefix, auth, download policy, and runtime thread counts.

### `ebook-convert`

Conversion CLI with a Calibre-inspired shape.

- Lists configured supported formats and archive formats.
- Prints conversion config info.
- Accepts input/output paths, format overrides, passthrough flags, and dry-run mode.
- Uses the conversion job runner and conversion settings derived from config.
- Today, practical conversion support is limited: passthrough copy works when input and output formats match, but cross-format converters are not implemented yet.

### `caliberate-gui`

Desktop GUI entry point.

- Bootstraps the control-plane config.
- Launches the `eframe/egui` application shell.
- Uses GUI preferences from the checked-in control-plane config.

## Configuration

The primary runtime config is `config/control-plane.toml`.

It currently covers:

- `app`
- `paths`
- `logging`
- `db`
- `runtime`
- `server`
- `metrics`
- `formats`
- `ingest`
- `assets`
- `library`
- `conversion`
- `fts`
- `device`
- `plugins`
- `network`
- `metadata_download`
- `news`
- `gui`

Notable defaults in the checked-in config:

- SQLite database path under `./.cache/caliberate/data/caliberate.db`
- Local library storage under `./.cache/caliberate/library`
- Asset compression enabled with zstd
- SHA-256 hashing and checksum verification enabled
- Server bound to `127.0.0.1:8080`
- Conversion enabled, but still implementation-limited
- Plugins enabled from `./.cache/caliberate/plugins`
- GUI state and preferences configured in the same control-plane file

The bootstrap path in `crates/app/src/bootstrap.rs` will:

- Load and validate the TOML config
- Initialize tracing/logging
- Create required runtime directories
- Initialize the metrics handle

## Runtime Layout

The repo already uses a predictable local runtime layout during development:

- `config/`
  - Checked-in config files.
- `.cache/caliberate/`
  - Local dev/runtime state created from the control-plane config.
  - Includes `cache/`, `data/`, `library/`, `logs/`, `news/`, `output/`, and `tmp/`.
- `data/`, `library/`, `logs/`, `output/`, `tmp/`
  - Additional project-local working directories.

The exact directories used at runtime come from `config/control-plane.toml`, not from hardcoded assumptions in every crate.

## Documentation Layout

The docs tree is a major part of the project and should be read as first-class design material.

- `docs/inventory/`
  - Reference inventory that maps Calibre source/docs to parity targets.
  - Includes `cli.md`, `gui.md`, `server.md`, `conversion.md`, `ingest.md`, `plugins.md`, `db.md`, `device.md`, `storage.md`, and related subsystem notes.
- `docs/roadmaps/`
  - Higher-level implementation roadmaps by subsystem.
  - Includes both top-level roadmap files and GUI-specific sub-roadmaps under `docs/roadmaps/gui/`.
- `docs/tranches/`
  - Incremental implementation slices and planning records.

If you are trying to understand why a crate exists or what parity target it is aiming at, start with the matching inventory doc and then the corresponding roadmap.

## Project Layout

Top-level layout:

- `Cargo.toml`
  - Workspace manifest.
- `Cargo.lock`
  - Locked dependency graph.
- `README.md`
  - This overview.
- `config/`
  - Runtime config.
- `crates/`
  - All workspace member crates.
- `docs/`
  - Inventory, roadmap, and tranche documentation.
- `data/`
  - Project-local data area.
- `library/`
  - Project-local library area.
- `logs/`
  - Project-local logs area.
- `output/`
  - Generated output area.
- `tmp/`
  - Scratch space, including imported reference material used during development.

More detailed crate-level layout:

- `crates/app/src/`
  - `main.rs`: generic bootstrap executable.
  - `bootstrap.rs`: config/logging/metrics/runtime path initialization.
  - `cli.rs`: base CLI definition for `caliberate`.
  - `bin/`: dedicated binaries for `calibredb`, `calibre-server`, `ebook-convert`, and `caliberate-gui`.
- `crates/core/src/`
  - `config.rs`: central control-plane schema and validation.
  - `logging.rs`: tracing subscriber setup.
  - `metrics.rs`: metrics handle and initialization.
  - `paths.rs`: runtime directory creation and path policy.
- `crates/db/src/`
  - `database.rs`: primary SQLite API and schema logic.
  - `backend/sqlite.rs`: connection setup and custom SQL functions.
  - `cache/`: cached metadata view helpers.
  - `query/`: query builder types.
  - `schema/`: schema namespace.
- `crates/library/src/`
  - `ingest/`: ingest flow, duplicate handling, archive-reference support, and background ingest jobs.
  - `storage/`: library storage namespace.
- `crates/assets/src/`
  - `storage.rs`: copy/reference asset storage.
  - `compression.rs`: zstd helpers.
  - `hashing.rs`: SHA-256 hashing helpers.
  - `stats.rs`: stats, integrity verification, and compaction planning.
- `crates/conversion/src/`
  - `pipeline.rs`: conversion execution.
  - `settings.rs`: conversion settings derived from config.
  - `jobs.rs`: conversion job bookkeeping.
  - `formats.rs`: format conversion dispatch.
- `crates/server/src/`
  - `http.rs`: Axum router and server binding.
  - `auth.rs`: API-key authorization middleware.
  - `opds.rs`: OPDS feed and acquisition endpoints.
- `crates/device/src/`
  - `detection.rs`: device mount scanning.
  - `sync.rs`: send/list/cleanup helpers.
- `crates/plugins/src/`
  - `discovery.rs`: plugin manifest discovery.
  - `registry.rs`: registry and manifest types.
  - `sandbox.rs`: permission model.
- `crates/gui/src/`
  - `app.rs`: shell state and main GUI wiring.
  - `views.rs`: library-facing view logic.
  - `preferences.rs`: preferences UI and persistence.
- `crates/metadata/src/`
  - `extract.rs`: basic metadata extraction and archive extraction.
  - `online.rs`: Open Library and Google Books metadata fetch support.
  - `normalize.rs`: normalization namespace.
- `crates/formats/src/`
  - Format-specific parser namespaces, currently mostly placeholders.
- `crates/jobs/src/`
  - Placeholder namespace for shared job infrastructure.
- `crates/zpaq/src/`
  - ZPAQ parsing/extraction logic for unmodeled-file archives.

## Build, Test, And Run

Build everything:

```bash
cargo build --workspace
```

Run the base app:

```bash
cargo run -p caliberate-app --bin caliberate -- --config config/control-plane.toml
```

Check config only:

```bash
cargo run -p caliberate-app --bin caliberate -- --config config/control-plane.toml check-config
```

Run the database CLI:

```bash
cargo run -p caliberate-app --bin calibredb -- --config config/control-plane.toml info
```

Run the server:

```bash
cargo run -p caliberate-app --bin calibre-server -- --config config/control-plane.toml
```

Run the GUI:

```bash
cargo run -p caliberate-app --bin caliberate-gui -- --config config/control-plane.toml
```

Run the conversion CLI:

```bash
cargo run -p caliberate-app --bin ebook-convert -- --config config/control-plane.toml --info
```

Test the workspace:

```bash
cargo test --workspace
```

Check without building full artifacts:

```bash
cargo check --workspace
```

## How The Pieces Fit Together

A typical local flow looks like this:

1. `crates/app` loads `config/control-plane.toml` and bootstraps logging, metrics, and runtime directories.
2. `crates/library` and `crates/assets` ingest ebook files into either copied or referenced library storage.
3. `crates/metadata` extracts basic metadata and archive previews from supported inputs.
4. `crates/db` persists books, related metadata, notes, categories, and optional FTS structures in SQLite.
5. `crates/server` exposes the catalog through HTTP/OPDS.
6. `crates/gui` provides a desktop shell over the same control-plane and database state.
7. `crates/device` copies library files onto detected devices.

## Limits And Expectations

- The repo aims at broad Calibre parity, but only part of that surface is implemented.
- The codebase mixes working functionality with roadmap-driven scaffolding by design.
- Some directories under `tmp/` appear to hold imported upstream/reference material for parity work; they are not the product itself.
- The most reliable way to judge a subsystem is to read its crate, its tests, and the matching inventory/roadmap docs together.

## Where To Start

If you are new to the repo:

- Read `config/control-plane.toml` first.
- Read `docs/inventory/` for parity intent.
- Inspect `crates/app/src/bin/calibredb.rs` for the richest current CLI surface.
- Inspect `crates/db`, `crates/library`, and `crates/assets` for the most concrete backend implementation work.
- Inspect `crates/server` and `crates/gui` if you want to understand the current user-facing surfaces.
