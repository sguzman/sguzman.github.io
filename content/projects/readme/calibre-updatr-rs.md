+++
title = "calibre-updatr-rs README"
description = "README mirror for calibre-updatr-rs"
draft = false
+++

[Repository](https://github.com/sguzman/calibre-updatr-rs) | [DeepWiki](https://deepwiki.com/sguzman/calibre-updatr-rs/)

Calibre Metadata Updatr (Rust)
==============================

Bulk metadata updater for Calibre EPUB books with idempotent processing.

Intent
------
- Iterate through a Calibre library and update metadata for EPUB books.
- Prefer books that are English or missing language.
- Fetch richer metadata when current data is incomplete.
- Embed metadata directly into EPUB files after updating the Calibre DB.
- Avoid reprocessing the same book on subsequent runs by default.

Behavior
--------
- **Idempotent by default**: each book is processed only once (per book id).
  This is controlled by `REPROCESS_ON_METADATA_CHANGE` in `src/main.rs`.
  - `false` (default): skip any book already processed successfully.
  - `true`: reprocess a book when its metadata snapshot hash changes.
- **Failure handling**: if a step fails, the error is recorded and the script continues.
- **Embedding**: successful runs embed metadata into EPUB files via `calibredb embed_metadata`.

Configuration
-------------
All settings live in `config.toml` under categorized tables (`[logging]`, `[library]`, `[state]`, `[formats]`, `[calibredb]`, `[content_server]`, `[fetch]`, `[policy]`, `[scoring]`).
Note: `config.toml` can include credentials; consider excluding it from version control.

Usage
-----
Requires `calibredb` and `fetch-ebook-metadata` on your PATH.

Logging
-------
Uses `tracing` + `tracing-subscriber`. Control verbosity via `config.toml` or `RUST_LOG`:
```bash
RUST_LOG=debug cargo run -- --config config.toml
RUST_LOG=info cargo run -- --config config.toml
```

Run with config:
```bash
cargo run -- --config config.toml
```

Override config values from CLI (optional):
```bash
cargo run -- --config config.toml --library-url "http://localhost:8081/#en_nonfiction"
```

Duplicate Finder
----------------
Find duplicates by full-file BLAKE3 hash (fast + parallel):
```bash
cargo run -- dups --library "/path/to/Calibre Library"
```
Options:
- `--ext` repeatable extension filter (e.g. `--ext epub --ext pdf`)
- `--min-size` skip tiny files
- `--threads` to control hashing parallelism
- `--include-sidecars` to include `metadata.opf` / cover files
- `--out` to write output to a file
Defaults can also be set in `[dups]` in `config.toml`.

State file
----------
The state is stored under `./.cache/state.json` by default,
or `state.path` in config if provided.
