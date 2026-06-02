+++
title = "simurom README"
description = "README mirror for simurom"
draft = false
+++

[Repository](https://github.com/sguzman/simurom) | [DeepWiki](https://deepwiki.com/sguzman/simurom/)

# simurom

`simurom` is a Rust workspace for a TOML-driven 2D Bevy scene runner and dedicated video game environment. Scenes, playback, simulation, and inputs are declared in TOML; engine behavior, feature flags, limits, paths, and operational policy are centralized in a control-pane config.

The repository is organized as a reusable engine workspace rather than a single app crate. The runtime is intended to support interactive playback and deterministic-ish timeline stepping from the same scene model.

## Project constraints

- Scene content is TOML-first.
- Project policy and tunables live in `.config/simurom/simurom.toml`.
- Wayland is the default Unix graphics environment.
- Vulkan is required; GUI apps fail fast if no Vulkan adapter is available.
- Structured logging uses `tracing` across config load, scene load/validation, asset resolution, runtime setup, and simulation/timeline.
- Cache and derived artifacts are stored under `.cache/simurom/`.

## Current workspace shape

### Apps

- `apps/simurom`: main application binary and the workspace default run target. Provides scene validation, GUI playback, and headless timeline tracing.
- `apps/simurom-viewer`: focused GUI viewer binary for opening a configured or explicit scene with egui controls and optional world inspection.
- `apps/simurom-cli`: CLI-oriented utility surface for validate/run/fmt/resolve/new/demo/diff/migrate flows.

### Engine crates

- `crates/simurom-config`: loads and validates the control-pane TOML. This crate is Bevy-free.
- `crates/simurom-schema`: typed scene schema and scene validation. This crate is Bevy-free.
- `crates/simurom-assets`: asset pack, asset resolution, and shader/asset handling support.
- `crates/simurom-runtime`: Bevy runtime orchestration, scene instantiation, timeline, simulation, interaction, and aggregate scene playback.
- `crates/simurom-workspace-checks`: workspace-level dependency and organization checks.

### Docs and content

- `docs/architecture.md`: subsystem map, layering, dependency direction, config policy, and runtime conventions.
- `docs/platform.md`: platform defaults, especially Wayland and Vulkan.
- `docs/dependencies.md`: allowed dependency graph and Bevy boundary rules.
- `docs/roadmaps/`: roadmap axes for core, schema, runtime, rendering, simulation, UI, tooling, and related workstreams.
- `docs/tranches/`: tranche files linking implemented work back to roadmap checkboxes.
- `scenes/`: example and testable scene entrypoints such as `demo.toml`, simulation scenes, shader scenes, and stitched scenes.
- `assets/`: source assets and shader effects used by scenes.
- `tests/fixtures/`: fixture scenes, config files, and patch files for automated tests.

## Top-level layout

```text
.
├── apps/                     # binaries
├── crates/                   # reusable engine crates
├── scenes/                   # scene TOML entrypoints
├── assets/                   # images, shaders, and runtime-loaded assets
├── .config/simurom/         # control-pane config
├── .cache/simurom/          # logs, and other derived artifacts
├── docs/roadmaps/            # roadmap checklists
├── docs/tranches/            # tranche records for implemented roadmap work
├── tests/fixtures/           # test fixtures for configs, patches, and scenes
├── rust-toolchain.toml       # pinned toolchain
└── rustfmt.toml              # formatting policy
```

## Scene model

Simurom currently uses a single TOML file as the scene entrypoint. The schema crate validates the file before the runtime instantiates anything.

The scene format already has support for:

- top-level `scene` metadata and `schema_version`
- camera and background setup
- explicit render resolution overrides
- entities with transforms, sprites, text, and other visual primitives
- scene defaults and templates
- timeline events
- simulation regions and runtime playback policy
- interaction/action bindings
- generator-driven entity creation
- post-processing/effect selection
- stitched playback via `scene.sequence[]`

The default sample scene is [`scenes/demo.toml`](scenes/demo.toml), which is intentionally small and shows the basic TOML shape.

## Control-pane configuration

The control pane lives at `.config/simurom/simurom.toml`. The main binaries also honor `SIMUROM_CONFIG`, and some app surfaces support explicit `--config` overrides.

Current config areas include:

- `app`: app name, run mode, default `scene_path`, and `assets_dir`
- `platform`: Unix backend selection (`wayland` by default, `x11` opt-in)
- `render`: backend policy (`vulkan`), target fps, window size, and effect policy
- `logging`: level or full tracing filter
- `features`: egui, inspector, and hot-reload toggles
- `runtime.timeline`: fixed-dt timeline stepping policy
- `runtime.hot_reload`: debounce and failure handling
- `assets.hot_reload`: asset watcher behavior
- `simulation`: backend, determinism, stepping, seed, and play state
- `ui.timeline`: scrubber wheel tuning

The sample control pane is [.config/simurom/simurom.toml](.config/simurom/simurom.toml).

## Operational directories

- Config root: `.config/simurom/`
- Preferred config file: `.config/simurom/simurom.toml`
- Cache root: `.cache/simurom/`
- Dev log files: `.cache/simurom/logs/`
- Per-scene derived artifacts: `.cache/simurom/scene/<scene>/`

In `app.mode = "dev"`, runs emit terminal logs and run-scoped file logs. In `prod`, logging is more conservative.

## Build and verification

The workspace pins its toolchain in [`rust-toolchain.toml`](rust-toolchain.toml). At the moment that file selects `nightly` plus `clippy`, `rustfmt`, and `rust-src`.

Primary verification commands:

```bash
cargo fmt
cargo clippy --workspace --all-targets
cargo test --workspace
```

The workspace default run target is `apps/simurom`, so `cargo run` launches the main app crate.

## Common commands

Run the demo scene with the default control pane:

```bash
cargo run -- run scenes/demo.toml
```

Validate a scene:

```bash
cargo run -- validate scenes/demo.toml
```

Run the GUI viewer:

```bash
cargo run -p simurom-viewer -- --scene scenes/demo.toml
```

Use X11 instead of Wayland for a GUI app:

```bash
cargo run -- --x11 run scenes/demo.toml
```

Trace a scene timeline headlessly:

```bash
cargo run -- trace-timeline scenes/demo.toml --max-steps 600
```

Use the utility CLI surface:

```bash
cargo run -p simurom-cli -- resolve scenes/demo.toml
```

## Runtime workflows

### Interactive scene run

`simurom run <scene>` loads config, enforces the selected Unix backend policy, requires Vulkan, validates the scene, builds the Bevy app, and optionally enables egui or world inspection based on config and scene playback policy.

### Aggregate scene stitching

The runtime supports stitched playback through `scene.sequence[]`, allowing multiple scene clips to play back-to-back with strict playback validation. The viewer UI includes playlist-aware controls when this mode is active.

## Logging and observability

The repo uses structured `tracing` rather than ad hoc console prints. Important subsystem boundaries are instrumented, including:

- config load and validation
- scene load and schema validation
- asset root resolution and asset loading
- runtime construction and scene instantiation
- timeline and simulation stepping
- hot-reload and patch application

The intent is to keep logs useful for diagnosis without per-frame spam.

## Platform notes

- Wayland is the default Unix graphics environment.
- X11 is opt-in through `--x11` on GUI binaries.
- Vulkan is mandatory for GUI runtime surfaces.

## Repository process notes

- Roadmaps live in `docs/roadmaps/`, and actionable items are checkbox-based.
- Implemented work is tracked in tranche files under `docs/tranches/`.
- The repo avoids mixing Bevy types into schema/config crates when possible.
- New policy knobs belong in the control pane rather than being scattered through engine code.

## Good entrypoints for reading the code

- [`apps/simurom/src/main.rs`](apps/simurom/src/main.rs): main binary surface and subcommands
- [`apps/simurom-viewer/src/main.rs`](apps/simurom-viewer/src/main.rs): viewer-specific GUI setup
- [`crates/simurom-runtime/src/lib.rs`](crates/simurom-runtime/src/lib.rs): runtime orchestration and app construction
- [`crates/simurom-schema/src/lib.rs`](crates/simurom-schema/src/lib.rs): scene schema and validation model
- [`crates/simurom-config/src/lib.rs`](crates/simurom-config/src/lib.rs): control-pane schema and defaults
