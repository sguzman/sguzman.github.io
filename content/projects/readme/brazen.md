+++
title = "brazen README"
description = "README mirror for brazen"
draft = false
+++

[Repository](https://github.com/sguzman/brazen) | [DeepWiki](https://deepwiki.com/sguzman/brazen/)

# Brazen

Brazen is a Rust browser-platform skeleton built around an `egui`/`eframe` shell and a future Servo-backed content engine. The current repo is intentionally the first durable platform layer: configuration, runtime paths, tracing, a capability-oriented permission model, a feature-gated engine seam, and tests that keep those pieces stable while the rendering backend evolves.

## Current Status

The app currently launches a desktop shell with:

- one workspace/tab model
- an address bar and basic command routing
- backend status and placeholder content viewport
- permission and log panels
- comprehensive TOML configuration
- structured tracing to console and rolling log files

Live webpage rendering is not implemented yet. The `servo` Cargo feature currently enables a scaffold backend that preserves the integration boundary without pulling in a fake crates.io `servo` package.

## Architecture

- `src/app.rs`: `eframe` shell and app state
- `src/engine.rs`: `BrowserEngine` trait, null backend, and Servo scaffold
- `src/config.rs`: root `BrazenConfig`, defaults, validation, TOML merge loading
- `src/logging.rs`: tracing bootstrap and derived logging plan
- `src/platform_paths.rs`: platform-specific config/data/cache/log path resolution
- `src/permissions.rs`: capability-oriented permission policy
- `src/commands.rs`: app command dispatch

The split is deliberate:

- `egui`/`eframe` owns browser chrome, tooling surfaces, and future inspectors.
- Servo will own real page/content rendering once embedder work is added.
- Capability routing, automation, cache access, and knowledge features sit above the engine boundary instead of leaking into the renderer.

## Development

### Run

```bash
cargo run
```

Brazen creates a default config on first launch if one is missing in the platform config directory.

### Cache CLI

Fetch and cache a URL directly from the command line:

```bash
cargo run -- cache https://example.com --stats --insecure
```

`--insecure` disables TLS verification for local testing only.

### Configuration

The canonical sample config is at [`config/brazen.toml`](/win/linux/Code/rust/brazen/config/brazen.toml).

The runtime loader:

- merges user TOML over built-in defaults
- validates the active fields used by the current skeleton
- resolves `default` directory entries through platform app-data locations
- exposes engine embedding knobs under `[engine]`

### Logging

Tracing is enabled at startup and writes to:

- console using `logging.console_filter`
- daily rolling files in the resolved logs directory using `logging.file_filter`

This is intended to stay broad and structured enough to debug startup, config resolution, command dispatch, and engine behavior without attaching a debugger.

### Tests And Checks

```bash
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test
cargo build
```

## Servo Note

The repo does not depend on the crates.io `servo` package because that package is not the browser engine integration path. When live embedding work starts, the backend should pin the official Servo source revision explicitly and keep that dependency isolated behind the `servo` feature.

When building with `--features servo`, the build script expects `BRAZEN_SERVO_SOURCE` to point at a local Servo checkout.
The helper script `scripts/fetch_servo.sh` can populate `vendor/servo` from the pinned tag listed in `docs/servo/version.md`.

## Rendering Debug Checklist

- Enable `engine.debug_pixel_probe` and confirm the detected pixel format matches expectation.
- Toggle `engine.debug_bypass_swizzle` to A/B the color channel order.
- Set `engine.debug_capture_next_frame = true` and inspect the saved PNG in `engine.debug_capture_dir`.
- Enable `engine.debug_pointer_overlay` to verify pointer coordinates align with visual targets.

## Roadmaps

The roadmap set lives at [`docs/roadmap.md`](/win/linux/Code/rust/brazen/docs/roadmap.md). It now fans out into separate files for each major dimension: shell/workspace UX, Servo integration, session model, capability permissions, security/audit, local connectors, automation APIs, cache/asset capture, extraction, knowledge workflows, media/reading/TTS, persistence/profiles, and observability/quality.
