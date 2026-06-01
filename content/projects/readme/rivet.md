+++
title = "rivet README"
description = "README mirror for rivet"
draft = false
+++

[Repository](https://github.com/sguzman/rivet) | [DeepWiki](https://deepwiki.com/sguzman/rivet/)

# Rivet

Rivet is a Rust-first Taskwarrior port with two layers:

- A CLI-compatible core (`task`) focused on Taskwarrior-style workflows.
- A desktop GUI layer built with Rust + TypeScript/React + Tailwind + Material UI + Tauri on top of the same core data model.

## Mascot

![Rivet Mascot](branding/mascot.png)

Branding assets live under `branding/`. The app, taskbar, and platform icons are generated from
`branding/mascot-square.png` into `crates/rivet-gui/src-tauri/icons/`, and web favicons are in
`crates/rivet-gui/ui/assets/icons/`.

See `ROADMAP.md` for the full milestone plan toward comprehensive parity.
See `PARITY_MATRIX.md` for the current command/feature parity status against Taskwarrior `3.4.2`.
Machine-readable parity data is tracked in `tests/parity_map.json` for CI/reporting tooling.

## Workspace Layout

- `crates/rivet-core`: task engine, parsing, datastore, filters, renderer, command dispatch.
- `crates/rivet-cli`: `task` binary.
- `crates/rivet-parity`: parity harness that compares Rivet results to Taskwarrior.
- `crates/rivet-gui-shared`: shared DTOs for GUI frontend/backend.
- `crates/rivet-gui/src-tauri`: Tauri backend wired to `rivet-core`.
- `crates/rivet-gui/ui`: React frontend shell (Vite + TypeScript + Tailwind + MUI).

## Implemented CLI Commands

- `add`
- `append`
- `prepend`
- `list`
- `next`
- `info`
- `modify`
- `start`
- `stop`
- `annotate`
- `denotate`
- `duplicate`
- `log`
- `done`
- `delete`
- `undo`
- `export`
- `import`
- `projects`
- `tags`
- `context`
- `contexts`
- custom report commands via `report.<name>.*`
- `_commands`
- `_show`
- `_unique`

## Core Behavior

- Taskwarrior-style argument parsing (`task <filter> <command> <args>`).
- `taskrc` loading with `include` support.
- Runtime `rc.*` overrides (`--rc` and positional `rc.foo=bar`).
- `TASKRC=/dev/null` behavior.
- Data storage in JSONL files:
  - `pending.data`
  - `completed.data`
- Field support for:
  - `project`, `tags`, `priority`, `due`, `scheduled`, `wait`, `depends`.
- Date expression support:
  - `now`, `today`, `tomorrow`, `yesterday`, `+Nd`, `+Nh`, `+Nm`, RFC3339, `YYYY-MM-DD`, `YYYY-MM-DDTHH:MM`, Taskwarrior export format.
- Boolean filter grammar support:
  - `and` / `or` / implicit `and` with parentheses grouping.
- Virtual tag support:
  - `+PENDING`, `+WAITING`, `+COMPLETED`, `+DELETED`, `+ACTIVE`, `+READY`, `+BLOCKED`, `+UNBLOCKED`, `+DUE`, `+OVERDUE`, `+TODAY`, `+TOMORROW`.
- Configurable report engine support:
  - `report.<name>.columns`, `report.<name>.labels`, `report.<name>.sort`, `report.<name>.filter`, `report.<name>.limit`.
  - dynamic report command resolution with abbreviations.
- Colorized tabular rendering in terminal output.

## Logging (Tracing)

Tracing is wired across CLI parsing, config resolution, datastore operations, filtering, command dispatch, parity execution, and GUI backend.

Examples:

```bash
RUST_LOG=rivet_core=debug task add "debug me" project:rivet +trace due:tomorrow
RUST_LOG=trace task +urgent list
```

## Build and Test

### Core / CLI / Parity

```bash
cargo build
cargo test
```

### GUI Shared + Frontend + Backend checks

```bash
cargo check -p rivet_gui_shared
cargo check -p rivet_gui_tauri
pnpm ui:check
pnpm ui:lint
pnpm ui:test
pnpm ui:build
```

## Parity Harness

A scenario-based parity harness is included at `crates/rivet-parity`.

Default scenario:

- `crates/rivet-parity/scenarios/basic_flow.json`
- `crates/rivet-parity/scenarios/lifecycle_delete.json`
- `crates/rivet-parity/scenarios/waiting_and_modify.json`
- `crates/rivet-parity/scenarios/append_prepend.json`
- `crates/rivet-parity/scenarios/start_stop.json`
- `crates/rivet-parity/scenarios/annotate_denotate.json`
- `crates/rivet-parity/scenarios/duplicate_undo.json`
- `crates/rivet-parity/scenarios/log_command.json`
- `crates/rivet-parity/scenarios/context_activation.json`
- `crates/rivet-parity/scenarios/boolean_filters.json`
- `crates/rivet-parity/scenarios/cross_status_modify.json`
- `crates/rivet-parity/scenarios/virtual_tags.json`
- `crates/rivet-parity/scenarios/report_focus.json`

Run candidate-only:

```bash
cargo run -p rivet_parity -- --skip-reference
```

Run against Taskwarrior if installed:

```bash
cargo run -p rivet_parity -- \
  --candidate-bin target/debug/task \
  --reference-bin /usr/bin/task
```

Run all included scenarios explicitly:

```bash
cargo run -p rivet_parity -- \
  --candidate-bin target/debug/task \
  --reference-bin task \
  --scenario crates/rivet-parity/scenarios/basic_flow.json \
  --scenario crates/rivet-parity/scenarios/lifecycle_delete.json \
  --scenario crates/rivet-parity/scenarios/waiting_and_modify.json \
  --scenario crates/rivet-parity/scenarios/append_prepend.json \
  --scenario crates/rivet-parity/scenarios/start_stop.json \
  --scenario crates/rivet-parity/scenarios/annotate_denotate.json \
  --scenario crates/rivet-parity/scenarios/duplicate_undo.json \
  --scenario crates/rivet-parity/scenarios/log_command.json \
  --scenario crates/rivet-parity/scenarios/context_activation.json \
  --scenario crates/rivet-parity/scenarios/boolean_filters.json \
  --scenario crates/rivet-parity/scenarios/cross_status_modify.json \
  --scenario crates/rivet-parity/scenarios/virtual_tags.json \
  --scenario crates/rivet-parity/scenarios/report_focus.json
```

The harness reports per-scenario bucket parity (`pending`, `completed`, `deleted`) and an overall score using Jaccard similarity over canonicalized exported tasks.

## GUI Development

Prerequisites:

```bash
cargo install tauri-cli
pnpm install
```

Run desktop app:

```bash
cd crates/rivet-gui/src-tauri
cargo tauri dev
```

Frontend styling lives at:

- `crates/rivet-gui/ui/assets/app.css`

Current GUI capabilities:

- Tasks workspace with search/facet filtering, add/edit/done/delete, and bulk filtered actions.
- Kanban workspace with board CRUD, drag/drop lane movement, and density toggle.
- Calendar workspace with year/quarter/month/week/day views, markers, and period task list.
- External calendar sources with add/edit/delete, sync, and ICS import.
- Settings + diagnostics panels for due notifications and command-failure visibility.

## Notes

This is a comprehensive port foundation with extensive instrumentation and a parity measurement workflow. Full Taskwarrior parity (all reports, all grammar/operators, recurrence engine, sync/hooks, undo model) can be layered onto the existing architecture incrementally.
