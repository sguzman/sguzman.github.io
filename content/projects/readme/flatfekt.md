+++
title = "flatfekt README"
description = "README mirror for flatfekt"
draft = false
+++

[Repository](https://github.com/sguzman/flatfekt) | [DeepWiki](https://deepwiki.com/sguzman/flatfekt/)

# flatfekt

`flatfekt` is a **2D scene runtime built on Bevy** where scenes are **declared in TOML** and then instantiated, simulated, animated, and rendered by an engine layer.

The intended end state is an umbrella capability set that supports:

- simulations (agents + physics + rule-driven world evolution)
- games and interactive sketches
- motion-graphics style scene choreography (timelines, transitions, text effects)
- reusable “content packs” of scenes and assets

## Core idea

Bevy provides the runtime (ECS, scheduling, rendering, input integration). TOML provides authored state (scene description, parameters, bindings). The engine layer interprets TOML into a running world and manages the lifecycle (load/reset/reload, transitions, patches, timelines).

## Repository organization

This repository is a Cargo workspace organized for reuse and extension:

- `crates/`: engine crates (libraries)
  - `crates/flatfekt-config`: control-pane configuration loading/validation
  - `crates/flatfekt-schema`: TOML scene schema types (format + validation; Bevy-free)
  - `crates/flatfekt-runtime`: runtime orchestration layer (scene lifecycle; Bevy integration will live here)
- `apps/`: runnable binaries (applications) built on top of the engine crates
  - `apps/flatfekt-viewer`: minimal runner app (config + tracing bootstrap)
- `docs/roadmaps/`: capability roadmaps (15 feature axes)
- `docs/tranches/`: tranche logs (what was attempted/done per change-set)

For architectural boundaries and layering, see `docs/architecture.md`.

## Roadmaps and implementation traceability

Development is tracked via:

- Roadmaps: `docs/roadmaps/`
- Tranches (per change-set): `docs/tranches/`

Roadmaps define the work; tranches record each requested set of changes. If you want to understand what exists and why, start with the roadmaps, then read the tranche history.

## Configuration

The project uses a centralized TOML control pane (planned as `flatfekt.toml`) to capture tunables and operational decisions such as:

- scene entrypoints and asset roots
- logging levels/filters
- feature flags (e.g., hot reload, optional subsystems)
- simulation/timeline stepping policy

The exact surface area is tracked in the roadmaps; the intent is to avoid scattering policy and “magic numbers” across code.

## Observability

`flatfekt` uses structured logging via `tracing`. Subsystem boundaries are expected to emit spans/events with enough context to diagnose load failures, schema issues, lifecycle transitions, and simulation/timeline behavior.

## Build

Build everything in the workspace:

```bash
cargo build
```

Format, lint, and test:

```bash
cargo fmt
cargo clippy
cargo test
```

Run the CLI tool:

```bash
cargo run
```

Run the viewer app:

```bash
cargo run -p flatfekt-viewer
```

Environment variables:

- `FLATFEKT_CONFIG`: override the path to the control-pane config file

Default config path:

- `.config/flatfekt/flatfekt.toml`
