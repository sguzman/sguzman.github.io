+++
title = "rics README"
description = "README mirror for rics"
draft = false
+++

[Repository](https://github.com/sguzman/rics) | [DeepWiki](https://deepwiki.com/sguzman/rics/)

# rics

`rics` is a Rust calendar ETL and ICS generator. It ingests source-specific TOML definitions, extracts event data from web pages, JSON feeds, PDFs, or rough text, normalizes events, updates prior future events, and emits year-bucketed `.ics` files.

## What It Does

- Loads sources from `configs/sources/**/*.toml`.
- Fetches each source via `http`, `file`, or `inline` mode.
- Parses records with declarative field mapping:
  - HTML (`css:` selectors)
  - JSON (`json:` paths)
  - PDF text / rough text (`regex:` and text splitting)
- Supports custom Rust parsers by key (`[custom] parser = "..."`).
- Persists canonical events in `data/state/events.json`.
- Maintains stable UID identity and revision `SEQUENCE` updates.
- Buckets output calendars by event year:
  - `data/out/sources/<source-key>/<source-key>-<year>.ics`
- Optional mirror publish target per source:
  - `[publish] mirror_dir = "/home/admin/Code/calendars/rics"`
  - Mirrors rebuilt files to `<mirror_dir>/<source-key>/<source-key>-<year>.ics` when enabled.
- Marks missing future events as `cancelled` on subsequent syncs.

## Architecture

- `src/config.rs`: Source TOML schema + config loading/validation.
- `src/fetch.rs`: HTTP/file/inline document fetching + pagination.
- `src/parser.rs`: Declarative parser engine + custom parser registry.
- `src/pipeline.rs`: Sync/build orchestration, merge/update logic.
- `src/store.rs`: Persistent event state.
- `src/ics.rs`: RFC-style ICS output with escaping/folding and rich `X-RICS-*` metadata.
- `src/harness.rs`: Repeatable harness for success metrics.

## Quick Start

1. Validate source configs:

```bash
cargo run -- validate --source-file configs/sources/publishing/oecd_publications.toml
```

2. Sync all configured sources and generate/update ICS output:

```bash
cargo run -- sync
```

3. Rebuild ICS files from stored state only:

```bash
cargo run -- build
cargo run -- build --year 2026
cargo run -- build --source oecd.publications.en --year 2026
```

4. Publish already-generated ICS files to mirror directories (no rebuild):

```bash
cargo run -- publish
cargo run -- publish --source oecd.publications.en --year 2026
```

4. Run the harness (double-sync stability measurement):

```bash
cargo run -- --config-dir tests/fixtures/sources --state-path /tmp/rics-state.json --out-dir /tmp/rics-out harness
```

## Source Configuration

Each source is defined in its own TOML file.

### Example: OECD publishing source

See `configs/sources/publishing/oecd_publications.toml`.

Highlights:

- Pagination enabled via `page` query parameter.
- Year filtered dynamically by URL template placeholders:
  - `minPublicationYear={{current_year}}`
  - `maxPublicationYear={{current_year}}`
- Custom parser enabled: `oecd_publications_v1`.

### Example: rough text source

See `configs/sources/ad_hoc/rough_text.toml` and `data/sources/rough_events.txt`.

Input format (one event per line):

```text
YYYY-MM-DD | Event Title | https://event-url
```

### Declarative mapping examples

- `from = "css:a.title@href"`
- `from = "json:$.items[*].title"`
- `from = "regex:(?m)^Date:\s*(.+)$"`
- `const = "Some static value"`

## Update and Identity Semantics

- UID is stable and deterministic:
  - prefers `source_event_id`
  - falls back to source URL
  - otherwise uses source key + title + year bucket hash
- Revision changes bump `SEQUENCE`.
- Events that disappear from a source and are still in the future are updated to `STATUS:CANCELLED`.

## Logging

`tracing` is enabled across fetch/parse/merge/export. Configure with:

```bash
RUST_LOG=debug cargo run -- sync
```

## Test Harness

- Integration tests: `tests/harness.rs`
- Fixture source/data: `tests/fixtures/`

Run:

```bash
cargo test
```

The harness verifies:

- year-bucketed ICS output generation
- update behavior with sequence increments
- second sync stability (no unexpected insert/update drift)

## Notes

- This project stores canonical event state first, then exports ICS.
- ICS output includes rich metadata fields: `X-RICS-*`.
- PDF support currently focuses on text extraction; complex table layouts may require custom parsers.
