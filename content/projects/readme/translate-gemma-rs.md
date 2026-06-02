+++
title = "translate-gemma-rs README"
description = "README mirror for translate-gemma-rs"
draft = false
+++

[Repository](https://github.com/sguzman/translate-gemma-rs) | [DeepWiki](https://deepwiki.com/sguzman/translate-gemma-rs/)

# translate-gemma

`translate-gemma` is a Rust CLI for translating Markdown files through Ollama/TranslateGemma while preserving code blocks and markup structure.

## Intent

Make local model-based Markdown translation practical by handling caching, chunking, directory traversal, and markup preservation instead of leaving those concerns to one-off scripts.

## Ambition

The CLI modes, cache support, REPL flow, and language-code helpers suggest a durable local translation utility for documentation workflows, not just a single-purpose script.

## Current Status

Even without a README, the code already exposes a rich CLI with translate, REPL, and language-code subcommands, plus caching and concurrency controls.

## Core Capabilities Or Focus Areas

- Translate Markdown files or whole directories.
- Preserve Markdown structure and code fences.
- Support REPL translation mode for line-by-line workflows.
- Cache translated segments for repeatability and speed.
- Integrate with local Ollama-hosted TranslateGemma models.

## Project Layout

- `examples/`: sample inputs, example configs, or demonstration workflows.
- `src/`: Rust source for the main crate or application entrypoint.
- `Cargo.toml`: crate or workspace manifest and the first place to check for package structure.

## Setup And Requirements

- Rust toolchain.
- A running Ollama instance with a translation-capable model such as `translategemma:latest`.
- Markdown inputs to translate.

## Build / Run / Test Commands

```bash
cargo build
cargo test
cargo run -- lang-code English
cargo run -- translate docs/ --target-lang deu --out-dir translated/
```

## Notes, Limitations, Or Known Gaps

- This project depends on a local model-serving environment, so runtime health is part of the user experience.
- Markdown preservation is a primary product concern, not a secondary convenience.

## Next Steps Or Roadmap Hints

- Add fixtures for difficult Markdown structures and front matter combinations.
- Clarify translation-quality and caching guarantees as the tool is used on larger doc sets.
