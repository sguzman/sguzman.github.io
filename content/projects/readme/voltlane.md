+++
title = "voltlane README"
description = "README mirror for voltlane"
draft = false
+++

[Repository](https://github.com/sguzman/voltlane) | [DeepWiki](https://deepwiki.com/sguzman/voltlane/)

# Voltlane

Voltlane is a Rust-first FL-style and chiptune composition prototype with a Rust core, Tauri desktop shell, and React UI.

## Intent

Prove a music-production workflow where the sequencing engine, export logic, parity tooling, and desktop UI are cleanly separated but still operate on one shared project model.

## Ambition

The current workspace and roadmap clearly aim beyond a toy sequencer toward a fuller desktop composition environment with timeline editing, audio handling, effects, export, and parity-oriented engine validation.

## Current Status

The codebase already covers project lifecycle, transport, clip editing, export paths, parity harnesses, UI lanes, and Tauri integration. It is still a prototype, but a substantial one.

## Core Capabilities Or Focus Areas

- Rust core for project, timeline, clip, effect, and export logic.
- Tauri desktop host and command bridge.
- React UI for playlist, transport, mixer, and editing workflows.
- Parity/golden-baseline tooling for engine behavior.
- Audio import, rendering, and export support with native and external tool paths.

## Project Layout

- `crates/voltlane-core/`: core engine, timeline, export, parity, and tracing logic.
- `src-tauri/`: desktop shell and Tauri command bridge into the Rust core.
- `crates/`: workspace member crates grouped by subsystem.
- `scripts/`: helper scripts for development, validation, or release workflows.
- `Cargo.toml`: crate or workspace manifest and the first place to check for package structure.

## Setup And Requirements

- Rust toolchain.
- Node.js and `pnpm` for the UI/tooling.
- Tauri prerequisites and `ffmpeg` for the MP3 export path.

## Build / Run / Test Commands

```bash
cargo check -p voltlane-core
cargo test -p voltlane-core
pnpm install
pnpm --dir ui run build
pnpm run tauri:dev
```

## Notes, Limitations, Or Known Gaps

- Prototype status matters here: the feature set is broad, but product ergonomics are still evolving.
- Desktop/audio/toolchain setup is part of the real development surface, not a side concern.

## Next Steps Or Roadmap Hints

- Keep the core engine contracts stable as the UI grows richer.
- Use parity and golden-baseline workflows to prevent regressions in audio/export behavior.
