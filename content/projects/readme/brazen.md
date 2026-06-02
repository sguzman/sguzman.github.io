+++
title = "brazen README"
description = "README mirror for brazen"
draft = false
+++

[Repository](https://github.com/sguzman/brazen) | [DeepWiki](https://deepwiki.com/sguzman/brazen/)

# Brazen

Brazen is a Rust desktop browser/runtime project built around an `egui` / `eframe` shell, a configurable engine abstraction, and an automation-oriented platform layer. It is not just a browser UI prototype: the repository also contains profile persistence, permissions, a cache/asset plane, extraction helpers, automation APIs, MCP integration seams, and an optional Servo-backed integration path.

The project is structured so the durable platform concerns come first: bootstrapping, config, runtime paths, policy, persistence, diagnostics, and automation. Rendering and deep engine integration are then plugged into those seams instead of being allowed to dominate the whole codebase.

## What The Repository Contains

At a high level, Brazen currently provides:

- A native desktop shell built with `eframe` / `egui`.
- A `BrowserEngine` abstraction that isolates the shell from the underlying rendering/content engine.
- Session, tab, window, history, zoom, and recovery state management.
- A capability-oriented permission model for operations such as terminal execution, DOM reads, cache reads, file access, and screenshots.
- A cache/asset store with metadata indexing, body capture policy, import/export, and replay-oriented storage primitives.
- A WebSocket automation server plus a CLI client for introspecting and controlling a running instance.
- HTML/entity extraction helpers for links, images, headings, forms, and metadata.
- Virtual resource plumbing for `brazen://` access to mounted filesystems, terminal execution, tabs, and MCP tools.
- Profile-scoped persistence through SQLite and JSON session snapshots.
- An optional Servo upstream integration path via vendored sources in `vendor/servo`.

## Status

Brazen is an active integration project rather than a finished browser product.

- The shell, bootstrap flow, config model, runtime directories, logging, profiles, permissions, automation scaffolding, and cache tooling are all present.
- The engine seam is real and used throughout the application.
- Servo-related code and docs are already in-tree, but deeper upstream rendering and embedding work is still being iterated on.
- The repo contains detailed roadmaps under `docs/roadmaps/` that make the intended direction explicit.

## Architecture Overview

The main startup path is:

1. `src/main.rs` parses CLI arguments.
2. `brazen::bootstrap(...)` loads config, resolves platform/runtime paths, installs TLS crypto, applies profile overrides, and initializes tracing.
3. `app::build_shell_state(...)` restores session/profile state and creates the engine instance through the configured factory.
4. The desktop UI is launched through `eframe::run_native(...)`.
5. If enabled in config and feature flags, the automation server is started alongside the UI runtime.

The library surface in `src/lib.rs` exposes the core building blocks:

- `BrazenConfig` for configuration.
- `PlatformPaths` / `RuntimePaths` for filesystem layout.
- `BrazenApp` / `ShellState` for the desktop shell.
- `BrowserEngine` and `EngineFactory` for backend integration.
- Automation, cache, MCP, permissions, session, extraction, and Servo support modules.

## Major Subsystems

### Desktop Shell

The shell lives under `src/app/` and owns the user-facing desktop state:

- shell/session state
- navigation and input handling
- panels and UI composition
- zoom and workspace behavior
- capture/recovery helpers
- automation command draining and synchronization with the engine

`BrazenApp` is the `eframe` application object that keeps the UI, render surface, engine instance, frame diagnostics, and runtime state in sync.

### Engine Abstraction

`src/engine.rs` defines the engine contract used by the rest of the project. This includes:

- render surface metadata and pixel/frame formats
- navigation/load status
- input, IME, clipboard, dialogs, and popup behavior
- network request observation
- engine status reporting

This separation is important: it allows the shell, automation APIs, permissions, and persistence logic to evolve independently from the rendering backend.

### Configuration And Bootstrap

`src/config.rs` defines a large typed configuration surface covering:

- app/window behavior
- logging
- engine and resource limits
- runtime directory roots
- profiles
- cache policy
- terminal policy
- permissions
- automation server settings
- extraction/media/features/MCP/shortcuts

When a config file does not exist, Brazen writes a default one automatically. The checked-in config file under `config/` is a useful reference for the expected shape and available settings.

### Profiles, Sessions, And Persistence

Brazen keeps both lightweight snapshot state and profile-scoped persistent state:

- `src/session.rs` stores windows, tabs, navigation history, zoom level, lineage, and crash-recovery flags in a JSON session snapshot.
- `src/profile_db.rs` stores longer-lived profile data in SQLite.
- Profile overrides are applied during bootstrap, allowing persisted permission grants and automation settings to augment the static config file.

### Permissions And Security Policy

`src/permissions.rs` defines a capability-based policy model. Capabilities include:

- `terminal-exec`
- `terminal-output-read`
- `dom-read`
- `cache-read`
- `tab-inspect`
- `ai-tool-use`
- `virtual-resource-mount`
- `fs-read`
- `fs-write`
- `dom-write`
- `screenshot-window`

Policies can be expressed globally and per-domain. This is one of the main platform concepts in the project: browser-adjacent capabilities are treated explicitly rather than being hidden inside ad hoc feature logic.

### Cache And Asset Plane

`src/cache.rs` implements a profile-scoped asset store that tracks captured resources and optional response bodies. It supports:

- metadata indexing
- selective or archive-oriented body capture
- host and MIME-based capture policy
- pinning
- deduplicated blob storage
- stats and querying
- export/import workflows

Brazen includes both CLI and automation-level access to this cache layer.

### Automation And Introspection

The automation subsystem lives under `src/automation/` and can start a WebSocket server when enabled by config and feature flags. Through automation, external clients can:

- inspect windows/tabs
- query DOM content
- take screenshots
- evaluate JavaScript
- navigate/reload/stop/go back/go forward
- manage mounts
- read cache metadata and bodies
- enqueue reading/TTS work
- perform profile operations

There is also a CLI client in `src/cli_introspect.rs` for connecting to a running Brazen instance.

Relevant docs and examples already live in the repo:

- `docs/automation-api.md`
- `docs/automation/api.md`
- `docs/automation/schema.json`
- `examples/automation/README.md`
- `examples/automation/python/brazen_client.py`
- `examples/automation/bash/take_screenshot.sh`

### MCP And Virtual Resources

Brazen includes early MCP integration seams:

- `src/mcp.rs` contains a registry/broker abstraction for MCP servers and tools.
- `src/mcp_stdio.rs` can spawn stdio-backed MCP servers and query their tool lists.

Brazen also exposes a virtual protocol layer in `src/virtual_protocol.rs` with mounts managed by `src/mounts.rs`. The `brazen://` scheme is used for internal/resource-like access to:

- mounted filesystem paths
- terminal execution
- tab/session visibility
- MCP tool surfaces

### Extraction

`src/extraction.rs` contains HTML extraction helpers that currently collect structured entities such as:

- links
- images
- headings
- forms
- metadata tags

This is a small module today, but it fits into the broader knowledge/extraction direction documented in the roadmap files.

### Servo Integration

Servo-related code is split across:

- `src/servo_embedder.rs`
- `src/servo_runtime.rs`
- `src/servo_resources.rs`
- `src/servo_upstream.rs`
- `src/rendering.rs`
- `src/navigation.rs`
- `docs/servo/`
- `vendor/servo/`

The workspace also vendors `glslopt` under `vendor/glslopt` and patches crates.io accordingly.

## Building

### Requirements

Brazen expects:

- a recent Rust toolchain
- native libraries required by `eframe` and the selected graphics stack
- X11/Wayland development support on Linux for the current `eframe` feature set
- vendored Servo sources when building Servo-backed paths

### Standard Commands

```bash
cargo build
cargo run
cargo test
```

### Features

The manifest defines:

- default features: none
- `servo`
- `servo-upstream`

`servo` enables `servo-upstream`. The build script also checks `BRAZEN_SERVO_SOURCE` when the Servo feature path is enabled and falls back to `vendor/servo` if present.

Example:

```bash
cargo build --features servo
```

If you need a non-default Servo source tree:

```bash
BRAZEN_SERVO_SOURCE=/path/to/servo cargo build --features servo
```

## Running Brazen

Start the desktop shell:

```bash
cargo run
```

Use a custom config file:

```bash
cargo run -- --config /path/to/brazen.toml
```

The first run will create a default config file if one is missing.

## CLI Surfaces

Brazen exposes multiple command paths:

### Main App CLI

From `src/main.rs`:

```bash
cargo run -- --config ./test_brazen.toml
```

Subcommands:

```bash
cargo run -- cache ...
cargo run -- introspect ...
```

### Cache CLI

The main binary forwards `cache` subcommands to `src/cli_cache.rs`.

Supported workflows include:

- fetch a URL into the cache
- list cached assets with filters
- show a captured entry
- export cache data
- import cache data

Examples:

```bash
cargo run -- cache https://example.com --stats
cargo run -- cache list --mime text/html --limit 20
cargo run -- cache show <asset-id-or-hash>
cargo run -- cache export ./cache-export.jsonl
```

There is also a dedicated auxiliary binary at `src/bin/brazen-cache.rs` for lower-level cache querying/export/import workflows.

### Introspection CLI

`src/cli_introspect.rs` connects to the automation WebSocket endpoint and can:

- list windows
- list tabs
- dump a runtime snapshot
- fetch DOM content
- take a screenshot
- stream logs
- evaluate JavaScript
- shut down the running instance
- create/switch/export/import profiles

Examples:

```bash
cargo run -- introspect list-tabs
cargo run -- introspect snapshot
cargo run -- introspect get-dom --selector main
cargo run -- introspect screenshot --output shot.png
```

## Configuration And Runtime Data

Brazen resolves platform-specific directories through `directories::ProjectDirs` and falls back to a local `.brazen/` structure when necessary.

Runtime paths include:

- config file
- data directory
- logs directory
- profiles directory
- cache directory
- downloads directory
- crash dump directory
- active profile directory
- session snapshot path
- audit log path

In `dev` mode, logs are intentionally written to the repository-local `logs/` directory for easier iteration.

## Repository Layout

### Top Level

- `Cargo.toml`: crate manifest, features, dependencies, and crate patches.
- `build.rs`: feature-time checks for Servo source availability.
- `config/`: checked-in config examples/reference config.
- `docs/`: architecture notes, APIs, and roadmap material.
- `examples/`: automation client examples and usage notes.
- `profiles/`: local profile data used during development.
- `scripts/`: helper scripts.
- `scratch/`: experiments and one-off investigation code.
- `src/`: main library and binary sources.
- `tests/`: integration and behavior tests.
- `vendor/`: vendored dependencies, including Servo and `glslopt`.

### `src/` Module Map

- `app/`: desktop shell state, UI composition, panels, input, navigation, recovery, workspace, zoom, and capture helpers.
- `automation/`: automation types, handlers, runtime, and server plumbing.
- `audit_log.rs`: audit logging for automation and other sensitive operations.
- `cache.rs`: asset capture, metadata indexing, blob storage, query/import/export, and replay-oriented cache logic.
- `cli_cache.rs`: cache subcommand implementation.
- `cli_introspect.rs`: client for talking to a running automation server.
- `commands.rs`: application command dispatch between UI/automation and the engine.
- `config.rs`: typed configuration model, default generation, validation, and parsing.
- `engine.rs`: backend abstraction for browser/content engine integration.
- `extraction.rs`: HTML entity extraction helpers.
- `logging.rs`: tracing/logging initialization.
- `mcp.rs`: MCP registry and broker abstractions.
- `mcp_stdio.rs`: stdio-based MCP server spawning and tool invocation.
- `mounts.rs`: virtual resource mount definitions and resolution.
- `navigation.rs`: navigation helpers and startup URL resolution.
- `permissions.rs`: capability-based permission policy model.
- `platform_paths.rs`: OS/runtime path derivation.
- `profile_db.rs`: SQLite-backed profile persistence.
- `rendering.rs`: frame normalization and rendering diagnostics helpers.
- `servo_embedder.rs`: Servo embedder integration.
- `servo_resources.rs`: Servo resource location/setup helpers.
- `servo_runtime.rs`: Servo runtime coordination.
- `servo_upstream.rs`: optional upstream Servo integration path.
- `session.rs`: persistent session/tab/window snapshot model.
- `terminal.rs`: controlled terminal execution layer.
- `tls.rs`: TLS provider installation and certificate-related setup.
- `ui_theme.rs`: shell theming.
- `virtual_protocol.rs`: `brazen://` protocol handling for internal resources.
- `virtual_router.rs`: request routing for virtual resources.

### `tests/`

The integration test suite covers several project layers, including:

- bootstrap and config bring-up
- cache CLI behavior
- profile database bootstrapping
- permission grant persistence
- automation end-to-end behavior
- observability checks
- roadmap coverage/sanity
- Servo runtime/rendering scenarios

## Documentation Map

Useful documentation entrypoints in this repo:

- `docs/roadmap.md`
- `docs/roadmaps/`
- `docs/servo/architecture.md`
- `docs/servo/build-steps.md`
- `docs/servo/prereqs.md`
- `docs/servo/rendering.md`
- `docs/servo/devtools.md`
- `docs/automation-api.md`
- `docs/automation/api.md`

The roadmap set is especially valuable because it explains the intended system shape, not just the current implementation.

## Development Notes

- The repository vendors substantial upstream code under `vendor/servo`; avoid treating that directory like ordinary app code when making targeted changes.
- `Cargo.toml` patches `glslopt` to the vendored copy in `vendor/glslopt`.
- The repo contains local runtime artifacts such as `logs/`, `profiles/`, and generated test outputs during active development.

## Summary

Brazen is best understood as a browser-platform workspace: a native shell plus a growing set of runtime services around browsing, automation, permissions, persistence, extraction, and engine integration. The code already supports meaningful experimentation with that platform shape even while the Servo-backed rendering path continues to mature.
