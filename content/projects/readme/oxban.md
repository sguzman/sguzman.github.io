+++
title = "oxban README"
description = "README mirror for oxban"
draft = false
+++

[Repository](https://github.com/sguzman/oxban) | [DeepWiki](https://deepwiki.com/sguzman/oxban/)

# Oxban

Oxban is a local-first Kanban desktop app scaffold for experimenting with:

- Rust backend logic and persistence
- Tauri desktop shell
- Yew (WASM) frontend
- Plain CSS styling
- End-to-end `tracing` instrumentation

## Features in this scaffold

- Multi-board Kanban workflow
- Column and card creation
- Card editing modal (title, description, tags, priority)
- Card drag/drop between columns
- Search/filter by text and tags
- SQLite persistence with migrations
- Config file bootstrap (`oxban.toml`)
- Structured tracing logs in backend and frontend

## Repository layout

- `crates/oxban-core`: shared domain models and command argument types
- `src-tauri`: Tauri backend, command handlers, DB layer, migrations, tracing setup
- `ui`: Yew app and CSS assets
- `oxban.toml`: sample runtime config copied into app config dir on first launch

## Prerequisites

- Rust stable (`rustup`)
- `trunk` for frontend builds
- `tauri-cli` for running desktop dev mode
- Platform dependencies required by Tauri/WebKit (Linux/macOS/Windows specific)

### Install helpers

```bash
cargo install trunk
cargo install tauri-cli
```

## Development

From repo root:

```bash
cargo tauri dev --manifest-path src-tauri/Cargo.toml
```

This runs:

- `trunk serve --config ../ui/Trunk.toml`
- Tauri backend from `src-tauri`

## Build checks

Backend and core check:

```bash
cargo check --workspace
```

UI check for wasm target:

```bash
rustup target add wasm32-unknown-unknown
cargo check -p oxban-ui --target wasm32-unknown-unknown
```

## Logging

### Backend (`src-tauri`)

- Tracing is initialized from config (`logging.level`, file logging toggle)
- Command handlers and DB operations are instrumented with spans
- SQLite setup/migrations and mutation paths emit diagnostic logs

### Frontend (`ui`)

- `console_error_panic_hook` captures panic details
- `tracing-wasm` routes tracing events to browser devtools console
- UI actions and command calls emit debug/info logs

## Runtime configuration

On first launch, Oxban writes `oxban.toml` to the app config directory if missing.

Key sections:

- `[storage]`: sqlite file and pragma options
- `[ordering]`: gapped-position strategy
- `[logging]`: level, file output directory

## Next improvements

- Drag/drop insertion between cards (not only drop-to-end)
- Undo/redo action history
- Board import/export JSON
- Activity log timeline
- Rule engine for automations
