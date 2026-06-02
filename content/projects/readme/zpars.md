+++
title = "zpars README"
description = "README mirror for zpars"
draft = false
+++

[Repository](https://github.com/sguzman/zpars) | [DeepWiki](https://deepwiki.com/sguzman/zpars/)

# zpars

`zpars` is an in-progress Rust port of core ZPAQ compression and decompression ideas.

## Intent

Explore a native Rust implementation of key archive/codec behaviors while keeping CLI access, structured logging, and compatibility work visible.

## Ambition

The current CLI, docs, tests, and reference-implementation linkage suggest an ambition to become a serious Rust-native archive/inspection tool rather than a pure experiment.

## Current Status

The repo already includes codec logic, CLI entrypoints, tests, docs, and interoperability-oriented notes. It is clearly in progress but structurally substantial.

## Core Capabilities Or Focus Areas

- Native Rust block codec for `.zpars` workflows.
- Compression and decompression commands.
- ZPAQ inspection and extraction support.
- Logging/diagnostic tooling.
- Tests and docs around compatibility-oriented behavior.

## Project Layout

- `docs/`: project documentation, reference material, and roadmap notes.
- `src/`: Rust source for the main crate or application entrypoint.
- `tests/`: automated tests, fixtures, or parity scenarios.
- `Cargo.toml`: crate or workspace manifest and the first place to check for package structure.

## Setup And Requirements

- Rust toolchain.
- Sample archives or input files for compression/extraction workflows.
- Optional reference implementation assets when doing compatibility work.

## Build / Run / Test Commands

```bash
cargo build
cargo test
cargo run -- --help
```

## Notes, Limitations, Or Known Gaps

- The project is still explicitly in progress, so compatibility and feature completeness are evolving.
- Archive formats are edge-case heavy, so tests and fixtures matter a lot here.

## Next Steps Or Roadmap Hints

- Keep the reference/compatibility story explicit as more codec features land.
- Add more roundtrip and extraction fixtures to catch subtle format regressions.
