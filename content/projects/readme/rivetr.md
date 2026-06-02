+++
title = "rivetr README"
description = "README mirror for rivetr"
draft = false
+++

[Repository](https://github.com/sguzman/rivetr) | [DeepWiki](https://deepwiki.com/sguzman/rivetr/)

# Rivetr

Rivetr is a native desktop rewrite of the older Rivet Tauri app.

This repo now contains:

- `crates/rivet_core`: vendored Rust task engine and datastore logic
- `crates/rivet_app`: native `eframe`/`egui` application
- `assets/tags.toml`: tag schema used by the app
- `rivet.toml`: runtime defaults read by the app

## Features

- Task list with filtering, details, add/edit, and bulk actions
- Kanban workspace backed by task tags
- Calendar workspace with month/week/day views
- Local ICS import into task-compatible calendar entries
- Native persisted UI state
- Compatibility with existing Rivet/Taskwarrior-style datastore files

## Run

```bash
cargo run
```

The app requires a desktop session. If you launch it in a headless Linux shell,
Rivetr now returns a clearer error instead of only the raw `winit` message.

- Linux: `winit` will fail in a headless shell if `DISPLAY`, `WAYLAND_DISPLAY`,
  and `WAYLAND_SOCKET` are all unset.
- Windows 11 x64: the intended development target is `x86_64-pc-windows-msvc`.

## Data locations

- Task data: `RIVET_GUI_DATA` if set, otherwise the platform local data dir under `rivetr/gui_data`
- UI state: platform local data dir under `rivetr/ui-state.json`

## Verification

```bash
cargo check --workspace
cargo test --workspace
```

## Windows 11 x64 check

Install the target if needed:

```bash
rustup target add x86_64-pc-windows-msvc
```

Then verify the workspace:

```bash
cargo check --target x86_64-pc-windows-msvc
```
