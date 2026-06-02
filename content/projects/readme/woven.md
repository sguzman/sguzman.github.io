+++
title = "woven README"
description = "README mirror for woven"
draft = false
+++

[Repository](https://github.com/sguzman/woven) | [DeepWiki](https://deepwiki.com/sguzman/woven/)

# Woven

Woven is a Rust and `egui` notebook-style frontend for the Wolfram Language, with a specific interest in modernizing plotting through `egui_plot`.

## Intent

Build a local notebook environment where Wolfram evaluation, plotting, and notebook-style interaction can be driven through a native Rust UI rather than the traditional frontend stack.

## Ambition

The project seems aimed at a Rust-native Mathematica notebook experience, potentially growing into a serious alternative shell for evaluation, plotting, and interactive workflows.

## Current Status

The app, kernel/config/logging modules, tests, notebook assets, and minimal docs are already in place. It looks early but meaningfully implemented.

## Core Capabilities Or Focus Areas

- Native Rust app shell over Wolfram kernel workflows.
- Config-driven runtime behavior.
- Notebook-style UX foundations in `egui`.
- Kernel integration modules and supporting tests.
- Documentation/config assets for local development.

## Project Layout

- `config/`: checked-in runtime configuration and configuration examples.
- `docs/`: project documentation, reference material, and roadmap notes.
- `notebooks/`: notebook-style documents or notebook support assets.
- `src/`: Rust source for the main crate or application entrypoint.
- `tests/`: automated tests, fixtures, or parity scenarios.
- `Cargo.toml`: crate or workspace manifest and the first place to check for package structure.

## Setup And Requirements

- Rust toolchain.
- A Wolfram installation that exposes `WolframKernel` and WSTP support.
- `wolframscript` on `PATH` is recommended.

## Build / Run / Test Commands

```bash
cargo build
cargo test
cargo run
```

## Notes, Limitations, Or Known Gaps

- This project depends on a local Wolfram environment, so machine setup is a real part of the dev story.
- Plotting and notebook UX are explicit product goals, not just implementation details.

## Next Steps Or Roadmap Hints

- Deepen kernel-backed notebook workflows while preserving a responsive native UI.
- Clarify the plot model and notebook document format as the product matures.
