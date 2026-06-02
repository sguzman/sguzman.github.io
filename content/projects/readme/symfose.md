+++
title = "symfose README"
description = "README mirror for symfose"
draft = false
+++

[Repository](https://github.com/sguzman/symfose) | [DeepWiki](https://deepwiki.com/sguzman/symfose/)

# Symfose

Symfose is a Rust desktop app for playing virtual instruments from the keyboard, starting with piano and practice-oriented scoring.

## Intent

Move beyond a simple virtual piano toward a practice and performance environment with structured input, soundfont handling, and scoring-aware workflows.

## Ambition

The docs, resources, and roadmap shape point toward a fuller music-practice desktop application rather than a toy keyboard visualizer.

## Current Status

Audio, input, config, song-loading, and resource directories are already present, along with reference docs and a detailed README. It looks like an active desktop prototype.

## Core Capabilities Or Focus Areas

- Keyboard-driven virtual instrument playback.
- SoundFont-backed audio resources.
- Configurable runtime behavior.
- Song-loading and scoring-oriented modules.
- Reference docs and bundled resource structure.

## Project Layout

- `config/`: checked-in runtime configuration and configuration examples.
- `docs/`: project documentation, reference material, and roadmap notes.
- `res/`: bundled resources used by the application.
- `src/`: Rust source for the main crate or application entrypoint.
- `Cargo.toml`: crate or workspace manifest and the first place to check for package structure.

## Setup And Requirements

- Rust toolchain.
- A working audio environment on the local machine.
- Bundled or configured SoundFont assets for meaningful playback.

## Build / Run / Test Commands

```bash
cargo build
cargo test
cargo run
```

## Notes, Limitations, Or Known Gaps

- The package name is `symfose`, while the directory is `symposium`; the README should treat Symfose as the product identity.
- Audio/resource setup is a core part of the experience.

## Next Steps Or Roadmap Hints

- Keep scoring, playback, and content formats aligned as the practice workflow expands.
- Document resource/setup expectations clearly for new machines and contributors.
