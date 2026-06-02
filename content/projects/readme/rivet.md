+++
title = "rivet README"
description = "README mirror for rivet"
draft = false
+++

[Repository](https://github.com/sguzman/rivet) | [DeepWiki](https://deepwiki.com/sguzman/rivet/)

# Rivet

Rivet is a Rust workspace for building a Taskwarrior-style task manager with two
main product surfaces:

- a `task`-compatible CLI implemented in Rust
- a desktop GUI implemented with Tauri on the backend and React on the frontend

The repository is organized so both surfaces share the same core task model and
persisted task data where that makes sense. The CLI is the compatibility-driven
engine; the GUI builds richer workflows on top of adjacent Rust services and
shared DTO contracts.

## What This Repository Contains

At a high level, this repo contains:

- a Rust core crate that parses task-style commands, loads config, filters
  tasks, persists data, and renders output
- a thin CLI binary named `task`
- a parity harness for comparing Rivet behavior against Taskwarrior
- a Tauri desktop backend with task, contacts, dictionary, window, config, and
  external-calendar commands
- a React/TypeScript frontend for task, calendar, kanban, contacts, dictionary,
  and map workspaces
- shared Rust DTOs used by the Tauri backend and frontend contract layer
- reference docs, roadmaps, parity notes, and branding assets

## Workspace Overview

The Cargo workspace members are:

- `crates/rivet-core`
- `crates/rivet-cli`
- `crates/rivet-parity`
- `crates/rivet-gui-shared`
- `crates/rivet-gui/src-tauri`

Default workspace members are the core CLI path and the parity harness:

- `crates/rivet-core`
- `crates/rivet-cli`
- `crates/rivet-parity`

The workspace uses Rust edition `2024`, forbids `unsafe_code`, and denies
`clippy::unwrap_used`.

## Architecture

### CLI path

The CLI path is:

1. `crates/rivet-cli` collects argv and calls `rivet_core::run`.
2. `rivet_core::cli` preprocesses `rc.*` overrides and parses the global CLI.
3. `rivet_core::config` loads Taskwarrior-style config, supports `include`, and
   resolves the data directory.
4. `rivet_core::datastore` opens the JSONL-backed task store.
5. `rivet_core::commands` dispatches the parsed invocation.
6. `rivet_core::render` formats table or report output for the terminal.

This is the compatibility-focused part of the project. If you change task
semantics, command parsing, or output behavior, this is the area most likely to
affect parity.

### GUI path

The GUI path is split into three layers:

1. `crates/rivet-gui/ui` is the React/Vite frontend.
2. `crates/rivet-gui/src-tauri` is the Tauri host and Rust backend.
3. `crates/rivet-gui-shared` contains serializable Rust types shared across the
   backend/frontend boundary.

The Tauri backend exposes commands for:

- task CRUD and task status transitions
- config snapshots and config updates
- dictionary language/search/entry lookups
- contacts CRUD, import, dedupe, merge, and open-action workflows
- external calendar sync and ICS import
- window actions and UI event logging

The frontend currently contains workspaces and feature code for:

- tasks
- calendar
- kanban
- contacts
- dictionary
- map

## Task Model And Persistence

The core task model lives in `crates/rivet-core/src/task.rs`.

Important fields include:

- `uuid`
- optional numeric `id`
- `description`
- `status`
- timestamps such as `entry`, `modified`, `end`, `start`, `due`, `scheduled`,
  and `wait`
- `project`, `priority`, `tags`, `depends`, and `annotations`
- an `extra` map for additional serialized attributes

The CLI datastore lives under the resolved task data directory and uses:

- `pending.data`
- `completed.data`
- `undo.data`
- `context.data`

Tasks are stored as JSON Lines. Writes are performed atomically in the datastore
layer.

The GUI also persists its own adjacent application data for non-core features.
For example, contacts data is stored under `RIVET_GUI_DATA` or, if unset,
`./.rivet_gui_data`.

## Configuration And Runtime Behavior

### CLI configuration

The CLI config loader in `rivet-core`:

- starts with built-in defaults such as `data.location=~/.task`,
  `default.command=next`, and `color=on`
- loads a taskrc path from `--taskrc`, `TASKRC`, or the user home directory
- treats `TASKRC=/dev/null` as "no config"
- supports `include` directives
- applies `rc.*` overrides from both positional args and `--rc KEY=VALUE`

### GUI runtime configuration

The desktop app reads runtime settings from [`rivet.toml`](/win/linux/Code/rust/rivet/rivet.toml)
and related environment variables. That file currently documents:

- app mode and logging behavior
- project timezone and calendar defaults
- notification defaults
- UI feature flags
- map settings
- external calendar policies

The Tauri backend also searches upward for `rivet.toml` if an explicit config
path is not provided through environment variables.

## Command Surface Status

Rivet already implements a substantial portion of the Taskwarrior-style CLI,
including:

- `add`
- `list` / `next`
- `info`
- `modify`
- `append` / `prepend`
- `done`
- soft `delete`
- `export`
- partial `import`
- discovery commands such as `projects`, `tags`, `_commands`, `_show`, and
  `_unique`

Compatibility is tracked in [`PARITY_MATRIX.md`](/win/linux/Code/rust/rivet/PARITY_MATRIX.md)
with machine-readable backing data in
[`tests/parity_map.json`](/win/linux/Code/rust/rivet/tests/parity_map.json).

If you are changing CLI behavior, update parity scenarios and the matrix
alongside the code.

## Building

### Prerequisites

- Rust nightly toolchain with `clippy`, `rustfmt`, and `rust-src`
- Node.js
- `pnpm`
- Tauri system prerequisites if you want to run the desktop app

The pinned Rust toolchain is declared in
[`rust-toolchain.toml`](/win/linux/Code/rust/rivet/rust-toolchain.toml).

### Rust workspace

```bash
cargo build --workspace
```

### CLI binary

```bash
cargo build -p rivet_cli
cargo run -p rivet_cli -- add "Write better README"
```

The CLI binary name is `task`.

### GUI frontend dependencies

```bash
pnpm install
```

### Frontend only

```bash
pnpm ui:dev
pnpm ui:build
pnpm ui:check
pnpm ui:lint
pnpm ui:test
pnpm ui:e2e
```

### Tauri desktop app

```bash
pnpm tauri:dev
pnpm tauri:build
```

Equivalent direct command:

```bash
cargo tauri dev --manifest-path crates/rivet-gui/src-tauri/Cargo.toml
```

## Testing And Validation

### Rust tests

```bash
cargo test --workspace
```

There is at least one focused core integration-style test in
`crates/rivet-core/tests/core_flow.rs` covering datastore roundtrips and filter
behavior.

### Parity harness

The parity harness binary is `rivet-parity`. It runs scenario files against:

- a candidate Rivet binary, defaulting to `target/debug/task`
- a reference `task` binary, if available

Example:

```bash
cargo run -p rivet_parity -- \
  --scenario crates/rivet-parity/scenarios/basic_flow.json
```

Useful flags include:

- `--candidate-bin`
- `--reference-bin`
- `--scenario` repeated multiple times
- `--skip-reference`

Scenario files currently cover flows such as:

- `basic_flow`
- `lifecycle_delete`
- `append_prepend`
- `waiting_and_modify`
- `import_upsert`
- `boolean_filters`
- `hooks_lifecycle`

### Repo-wide checks

The repo also includes a [`justfile`](/win/linux/Code/rust/rivet/justfile) with
common developer commands for:

- formatting
- linting
- docs
- link checking
- spellchecking
- coverage
- release automation

Useful examples:

```bash
just fmt
just clippy
just test
just ci
```

## Project Layout

### Root

- [`Cargo.toml`](/win/linux/Code/rust/rivet/Cargo.toml): workspace manifest
- [`Cargo.lock`](/win/linux/Code/rust/rivet/Cargo.lock): dependency lockfile
- [`README.md`](/win/linux/Code/rust/rivet/README.md): top-level project guide
- [`PARITY_MATRIX.md`](/win/linux/Code/rust/rivet/PARITY_MATRIX.md): current
  Taskwarrior parity status
- [`ROADMAP.md`](/win/linux/Code/rust/rivet/ROADMAP.md): top-level planning
- [`rivet.toml`](/win/linux/Code/rust/rivet/rivet.toml): unified runtime config
- [`package.json`](/win/linux/Code/rust/rivet/package.json): workspace-level
  frontend and Tauri scripts
- [`justfile`](/win/linux/Code/rust/rivet/justfile): common dev automation

### `crates/rivet-core/`

The CLI engine and task model.

- `src/lib.rs`: main orchestration entry point used by the CLI binary
- `src/cli.rs`: argv preprocessing, global flags, invocation parsing, tracing
- `src/config.rs`: taskrc loading, includes, defaults, data-dir resolution
- `src/datastore.rs`: JSONL persistence, atomic writes, undo/context files
- `src/task.rs`: canonical task and annotation types
- `src/filter.rs`: filter parsing and matching
- `src/render.rs`: terminal rendering
- `src/datetime.rs`: date parsing and serialization helpers
- `src/hooks.rs`: hook support
- `src/commands/`: command implementation split by concern
- `tests/`: focused Rust tests for core behavior

Within `src/commands/`, the code is separated into:

- `task_ops.rs`: lifecycle-style task commands
- `io_and_views.rs`: import/export and view-style commands
- `report.rs`: reporting-related commands
- `modifiers.rs`: modifier application logic
- `prelude.rs`: shared command helpers and imports

### `crates/rivet-cli/`

The CLI wrapper crate.

- `src/main.rs`: collects OS args, calls `rivet_core::run`, reports fatal
  errors, exits non-zero on failure

This crate exists mainly to expose the `task` binary cleanly while keeping the
real logic in `rivet-core`.

### `crates/rivet-parity/`

The Taskwarrior parity harness.

- `src/main.rs`: CLI and scenario runner
- `scenarios/`: JSON scenario definitions used for candidate vs reference
  comparisons

Use this crate when validating behavioral changes in the command layer.

### `crates/rivet-gui-shared/`

Shared serializable contract types for the GUI.

This crate defines DTOs and argument types for:

- tasks
- contacts
- dictionary lookups
- config payloads
- other Tauri command boundary types

If a backend command or frontend API payload changes, this crate is usually part
of the edit set.

### `crates/rivet-gui/`

GUI-specific documentation and source trees.

- `README.md`: GUI-focused development notes
- `src-tauri/`: Tauri backend crate
- `ui/`: frontend workspace

### `crates/rivet-gui/src-tauri/`

The desktop backend and application host.

- `src/main.rs`: runtime setup, logging, config loading, Tauri app bootstrap,
  command registration
- `src/state.rs`: application state
- `src/commands/`: backend command implementations by feature
- `tauri.conf.json`: Tauri app configuration
- `capabilities/` and `gen/`: generated capability/schema artifacts
- `icons/`: desktop and mobile icon assets

Command modules are split into:

- `tasks.rs`
- `config.rs`
- `dictionary.rs`
- `contacts.rs`
- `external_calendar.rs`
- `window.rs`
- `common.rs`

This backend goes beyond tasks. It also owns contacts persistence, dictionary
Postgres access, external calendar ingestion, and desktop runtime concerns.

### `crates/rivet-gui/ui/`

The React/Vite frontend.

- `web/App.tsx` and `web/main.tsx`: app bootstrapping
- `web/app/`: shell-level app composition
- `web/features/`: feature workspaces such as tasks, calendar, kanban, map,
  contacts, and dictionary
- `web/components/`: shared UI components
- `web/store/`: Zustand state management
- `web/api/`: Tauri command schemas and typed calls
- `web/lib/`: client-side helpers
- `web/types/`: frontend type definitions
- `assets/`: CSS, icons, and tag assets
- `web/e2e/`: Playwright smoke coverage

### `docs/`

Project documentation beyond the top-level README.

Examples include:

- `docs/gui-architecture.md`
- `docs/tauri-command-contracts.md`
- `docs/frontend-contributing.md`
- `docs/gui-parity-checklist.md`
- `docs/dictionary-data-contract.md`
- `docs/dictionary-postgres-contract.md`
- `docs/reference/`: reference material and project conventions

### `branding/`

Brand assets such as:

- mascot images
- favicon assets
- shared color definitions

### `tests/`

Repo-level test and support artifacts.

- `tests/parity_map.json`: machine-readable parity source used by the matrix

## Where To Start

If you are new to the repo:

1. Read this README and `PARITY_MATRIX.md`.
2. For CLI work, start in `crates/rivet-core`.
3. For desktop backend work, start in `crates/rivet-gui/src-tauri`.
4. For frontend work, start in `crates/rivet-gui/ui`.
5. For behavior-sensitive CLI changes, run the parity harness before and after
   your change.

## Notes And Expectations

- CLI compatibility is a project constraint, not just an implementation detail.
- The GUI is not a separate toy app; it is another product surface in the same
  workspace and shares contracts with the Rust backend.
- This repo contains both stable code paths and actively evolving feature areas,
  especially in the GUI.
- When documenting behavior, prefer the code, parity scenarios, and command
  contracts over assumptions.
