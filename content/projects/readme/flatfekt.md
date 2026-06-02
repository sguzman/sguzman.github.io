+++
title = "flatfekt README"
description = "README mirror for flatfekt"
draft = false
+++

[Repository](https://github.com/sguzman/flatfekt) | [DeepWiki](https://deepwiki.com/sguzman/flatfekt/)

# flatfekt

`flatfekt` is a Rust workspace for a TOML-driven 2D Bevy scene runner and simulation environment. Scenes, playback, simulation, and export inputs are declared in TOML; engine behavior, feature flags, limits, paths, and operational policy are centralized in a control-pane config.

The repository is organized as a reusable engine workspace rather than a single app crate. The runtime is intended to support interactive playback, deterministic-ish timeline stepping, baked simulation playback, scene stitching, and export workflows from the same scene model.

## Project constraints

- Scene content is TOML-first.
- Project policy and tunables live in `.config/flatfekt/flatfekt.toml`.
- Wayland is the default Unix graphics environment.
- Vulkan is required; GUI apps fail fast if no Vulkan adapter is available.
- Structured logging uses `tracing` across config load, scene load/validation, asset resolution, runtime setup, simulation/timeline, and export boundaries.
- Cache and derived artifacts are stored under `.cache/flatfekt/`.

## Current workspace shape

### Apps

- `apps/flatfekt`: main application binary and the workspace default run target. Provides scene validation, GUI playback, bake, baked playback, frame export, MP4 export, and headless timeline tracing.
- `apps/flatfekt-viewer`: focused GUI viewer binary for opening a configured or explicit scene with egui controls and optional world inspection.
- `apps/flatfekt-cli`: CLI-oriented utility surface for validate/run/fmt/resolve/new/demo/diff/migrate and basic bake/play-bake flows.

### Engine crates

- `crates/flatfekt-config`: loads and validates the control-pane TOML. This crate is Bevy-free.
- `crates/flatfekt-schema`: typed scene schema and scene validation. This crate is Bevy-free.
- `crates/flatfekt-assets`: asset pack, asset resolution, and shader/asset handling support.
- `crates/flatfekt-runtime`: Bevy runtime orchestration, scene instantiation, timeline, simulation, interaction, aggregate scene playback, bake, and export.
- `crates/flatfekt-workspace-checks`: workspace-level dependency and organization checks.

### Docs and content

- `docs/architecture.md`: subsystem map, layering, dependency direction, config policy, and runtime conventions.
- `docs/platform.md`: platform defaults, especially Wayland and Vulkan.
- `docs/dependencies.md`: allowed dependency graph and Bevy boundary rules.
- `docs/roadmaps/`: roadmap axes for core, schema, runtime, rendering, simulation, export, UI, tooling, and related workstreams.
- `docs/tranches/`: tranche files linking implemented work back to roadmap checkboxes.
- `scenes/`: example and testable scene entrypoints such as `demo.toml`, simulation scenes, shader scenes, and stitched scenes.
- `assets/`: source assets and shader effects used by scenes and exports.
- `tests/fixtures/`: fixture scenes, config files, and patch files for automated tests.

## Top-level layout

```text
.
├── apps/                     # binaries
├── crates/                   # reusable engine crates
├── scenes/                   # scene TOML entrypoints
├── assets/                   # images, shaders, and runtime-loaded assets
├── .config/flatfekt/         # control-pane config
├── .cache/flatfekt/          # logs, bake outputs, exports, and other derived artifacts
├── docs/roadmaps/            # roadmap checklists
├── docs/tranches/            # tranche records for implemented roadmap work
├── tests/fixtures/           # test fixtures for configs, patches, and scenes
├── rust-toolchain.toml       # pinned toolchain
└── rustfmt.toml              # formatting policy
```

## Scene model

Flatfekt currently uses a single TOML file as the scene entrypoint. The schema crate validates the file before the runtime instantiates anything.

The scene format already has support for:

- top-level `scene` metadata and `schema_version`
- camera and background setup
- explicit render resolution overrides
- entities with transforms, sprites, text, and other visual primitives
- scene defaults and templates
- timeline events
- simulation regions and runtime playback policy
- interaction/action bindings
- export-related scene hints
- generator-driven entity creation
- post-processing/effect selection
- stitched playback via `scene.sequence[]`
- baked playback via `scene.baked`

The default sample scene is [`scenes/demo.toml`](scenes/demo.toml), which is intentionally small and shows the basic TOML shape.

## Control-pane configuration

The control pane lives at `.config/flatfekt/flatfekt.toml`. The main binaries also honor `FLATFEKT_CONFIG`, and some app surfaces support explicit `--config` overrides.

Current config areas include:

- `app`: app name, run mode, default `scene_path`, and `assets_dir`
- `platform`: Unix backend selection (`wayland` by default, `x11` opt-in)
- `render`: backend policy (`vulkan`), target fps, window size, and effect policy
- `logging`: level or full tracing filter
- `features`: egui, inspector, and hot-reload toggles
- `runtime.timeline`: fixed-dt timeline stepping policy
- `runtime.hot_reload`: debounce and failure handling
- `runtime.playback`: baked-vs-simulation policy
- `assets.hot_reload`: asset watcher behavior
- `simulation`: backend, determinism, stepping, seed, and play state
- `export.bake`, `export.frames`, `export.video`: bake/export defaults and output policy
- `ui.timeline`: scrubber wheel tuning

The sample control pane is [.config/flatfekt/flatfekt.toml](.config/flatfekt/flatfekt.toml).

## Operational directories

- Config root: `.config/flatfekt/`
- Preferred config file: `.config/flatfekt/flatfekt.toml`
- Cache root: `.cache/flatfekt/`
- Dev log files: `.cache/flatfekt/logs/`
- Per-scene derived artifacts: `.cache/flatfekt/scene/<scene>/`
- Bake artifacts: `.cache/flatfekt/scene/<scene>/bakes/<scene_xxhash>/run-<timestamp>-<pid>/`
- Frame/video export artifacts: `.cache/flatfekt/scene/<scene>/exports/<scene_xxhash>/run-<timestamp>-<pid>/`

In `app.mode = "dev"`, runs emit terminal logs and run-scoped file logs. In `prod`, logging is more conservative.

## Build and verification

The workspace pins its toolchain in [`rust-toolchain.toml`](rust-toolchain.toml). At the moment that file selects `nightly` plus `clippy`, `rustfmt`, and `rust-src`.

Primary verification commands:

```bash
cargo fmt
cargo clippy --workspace --all-targets
cargo test --workspace
```

The workspace default run target is `apps/flatfekt`, so `cargo run` launches the main app crate.

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
cargo run -p flatfekt-viewer -- --scene scenes/demo.toml
```

Use X11 instead of Wayland for a GUI app:

```bash
cargo run -- --x11 run scenes/demo.toml
```

Bake a scene into a first-class artifact directory:

```bash
cargo run -- bake scenes/physics_test.toml
```

Play a baked artifact:

```bash
cargo run -- play-bake .cache/flatfekt/scene/physics_test/bakes/<hash>/run-<timestamp>-<pid>/
```

Export PNG frames from a scene or bake artifact:

```bash
cargo run -- export-frames scenes/shader_test.toml
```

Export MP4 video from a scene or bake artifact:

```bash
cargo run -- export-mp4 scenes/shader_test.toml --out output/shader_test.mp4
```

Trace a scene timeline headlessly:

```bash
cargo run -- trace-timeline scenes/demo.toml --max-steps 600
```

Use the utility CLI surface:

```bash
cargo run -p flatfekt-cli -- resolve scenes/demo.toml
```

## Runtime workflows

### Interactive scene run

`flatfekt run <scene>` loads config, enforces the selected Unix backend policy, requires Vulkan, validates the scene, builds the Bevy app, and optionally enables egui or world inspection based on config and scene playback policy.

### Bake and baked playback

`bake` records deterministic playback into a bake artifact containing:

- `bake.json`
- `scene_playback.toml`
- packaged assets when enabled

`play-bake` replays the baked artifact with live simulation disabled. This is the preferred path for deterministic export and playback reuse.

### Export

The main app supports:

- `export-frames`: deterministic PNG frame sequence export
- `export-mp4`: frame export followed by `ffmpeg` encoding

If the input is a scene TOML, Flatfekt bakes first and then exports from baked playback. If the input is already a bake artifact, it exports directly from that artifact.

### Aggregate scene stitching

The runtime supports stitched playback through `scene.sequence[]`, allowing multiple scene clips to play back-to-back with strict playback validation. The viewer UI includes playlist-aware controls when this mode is active.

## Logging and observability

The repo uses structured `tracing` rather than ad hoc console prints. Important subsystem boundaries are instrumented, including:

- config load and validation
- scene load and schema validation
- asset root resolution and asset loading
- runtime construction and scene instantiation
- timeline and simulation stepping
- bake and export orchestration
- hot-reload and patch application

The intent is to keep logs useful for diagnosis without per-frame spam.

## Platform notes

- Wayland is the default Unix graphics environment.
- X11 is opt-in through `--x11` on GUI binaries.
- Vulkan is mandatory for GUI runtime surfaces.
- MP4 export requires `ffmpeg` on `PATH` unless `export.video.ffmpeg_path` points elsewhere.

## Repository process notes

- Roadmaps live in `docs/roadmaps/`, and actionable items are checkbox-based.
- Implemented work is tracked in tranche files under `docs/tranches/`.
- The repo avoids mixing Bevy types into schema/config crates when possible.
- New policy knobs belong in the control pane rather than being scattered through engine code.

## Good entrypoints for reading the code

- [`apps/flatfekt/src/main.rs`](apps/flatfekt/src/main.rs): main binary surface and subcommands
- [`apps/flatfekt-viewer/src/main.rs`](apps/flatfekt-viewer/src/main.rs): viewer-specific GUI setup
- [`crates/flatfekt-runtime/src/lib.rs`](crates/flatfekt-runtime/src/lib.rs): runtime orchestration and app construction
- [`crates/flatfekt-runtime/src/bake.rs`](crates/flatfekt-runtime/src/bake.rs): bake artifact creation and playback support
- [`crates/flatfekt-runtime/src/export.rs`](crates/flatfekt-runtime/src/export.rs): frame/video export pipeline
- [`crates/flatfekt-schema/src/lib.rs`](crates/flatfekt-schema/src/lib.rs): scene schema and validation model
- [`crates/flatfekt-config/src/lib.rs`](crates/flatfekt-config/src/lib.rs): control-pane schema and defaults
