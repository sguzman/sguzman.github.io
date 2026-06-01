+++
title = "zpars README"
description = "README mirror for zpars"
draft = false
+++

[Repository](https://github.com/sguzman/zpars) | [DeepWiki](https://deepwiki.com/sguzman/zpars/)

# zpars

`zpars` is an in-progress Rust port of core ZPAQ compression/decompression ideas.

Current implementation includes:
- A native Rust block codec (`.zpars`) with LZ77-based compression/decompression.
- A CLI built with `clap`.
- Toggleable structured logging via `tracing`.
- ZPAQ archive inspection and partial extraction tooling.
- Compatibility tests that exercise the bundled reference implementation in `tmp/zpaq`.

## Status

This repository is **not yet a full bit-compatible ZPAQ Level 2 implementation**.

What is implemented now:
- Native `.zpars` compression/decompression.
- Directory compression for `.zpars` (directory is wrapped as a tagged tar payload and auto-restored on decompress).
- ZPAQ block/header inspection (`inspect-zpaq`).
- Native extraction path for unmodeled ZPAQ payloads (`extract-zpaq-m0`).
- Automatic fallback extraction for modeled ZPAQ archives via the reference binary (`extract-zpaq`).

What is not complete yet:
- Full native modeled ZPAQ decoding (predictor components + full PCOMP VM execution).

## Build

```bash
cargo build
```

Run with release optimizations:

```bash
cargo run --release -- --help
```

## CLI

Top-level help:

```bash
zpars --help
```

### 1) Compress (`.zpars`)

```bash
zpars compress --input <file-or-dir> --output <archive.zpars> [options]
```

Options:
- `--level <0..5>`: compression strength preset.
- Advanced overrides: `--block-size`, `--min-match`, `--secondary-match`, `--search-log`, `--table-log`.

Example (file):

```bash
zpars compress -i notes.txt -o notes.zpars --level 2
```

Example (directory):

```bash
zpars compress -i docs -o docs.zpars --level 2
```

### 2) Decompress (`.zpars`)

```bash
zpars decompress --input <archive.zpars> --output <path>
```

Behavior:
- If input was compressed from a file, output is a file.
- If input was compressed from a directory, output is restored as a directory tree.

Use `--raw` to disable auto directory restoration and write raw bytes.

Examples:

```bash
zpars decompress -i notes.zpars -o notes.out
zpars decompress -i docs.zpars -o restored_docs
```

### 3) Roundtrip

```bash
zpars roundtrip --input <file> --output <restored-file> [compress-options]
```

Runs compress+decompress in memory and verifies byte equality.

### 4) Inspect ZPAQ blocks

```bash
zpars inspect-zpaq --input <archive.zpaq>
```

Prints block/header metadata from a ZPAQ archive.

### 5) Extract unmodeled ZPAQ (native path)

```bash
zpars extract-zpaq-m0 --input <archive.zpaq> --output-dir <dir>
```

Use this for archives that follow the unmodeled path (e.g. `-m0`-style data path).

### 6) Extract ZPAQ (auto mode)

```bash
zpars extract-zpaq --input <archive.zpaq> --output-dir <dir>
```

Behavior:
- Prefers bundled reference extractor (`tmp/zpaq/zpaq`) when available.
- Falls back to native unmodeled extraction path.

Options:
- `--reference-bin <path>`: path to reference extractor (default `tmp/zpaq/zpaq`).
- `--allow-reference-fallback` enabled by default.

## Logging

Global logging flags:
- `-v`, `-vv`: increase verbosity (`info` -> `debug` -> `trace`).
- `--log-filter <directive>`: explicit tracing filter.
- `--log-format pretty|json`: output format.

Example:

```bash
zpars -vv --log-format json compress -i docs -o docs.zpars --level 2
```

## Testing

Run all tests:

```bash
cargo test
```

Lint:

```bash
cargo clippy --all-targets --all-features -- -D warnings
```

Notes:
- `tests/compat.rs` builds and uses the bundled reference implementation under `tmp/zpaq`.

## Reference Source

Original ZPAQ source is vendored under:

- `tmp/zpaq/libzpaq.cpp`
- `tmp/zpaq/libzpaq.h`
- `tmp/zpaq/zpaq.cpp`

## License

This project is licensed under the terms in `LICENSE`.
