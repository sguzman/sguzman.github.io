+++
title = "woven README"
description = "README mirror for woven"
draft = false
+++

[Repository](https://github.com/sguzman/woven) | [DeepWiki](https://deepwiki.com/sguzman/woven/)

# Woven

Woven is a Rust + `egui` notebook-style frontend for the Wolfram Language (Mathematica), with an explicit goal of replacing/modernizing plotting using `egui_plot`.

## Requirements

- A Wolfram installation that provides `WolframKernel` and WSTP (e.g., Wolfram Engine / Mathematica).
- `wolframscript` on `PATH` is strongly recommended (used by WSTP discovery/linking).

## Running

Config is required at `config/woven.toml` and defaults to `mode = "dev"` (which writes logs under `logs/`).

```bash
cargo run
```

## Testing

```bash
cargo test
```

Kernel integration tests (if/when added) should be gated behind an env var like `WOVEN_TEST_KERNEL=1`.
