+++
title = "chunkr README"
description = "README mirror for chunkr"
draft = false
+++

[Repository](https://github.com/sguzman/chunkr) | [DeepWiki](https://deepwiki.com/sguzman/chunkr/)

# Chunkr

`chunkr` is a Rust CLI for turning an ebook library into search- and retrieval-ready text artifacts. It extracts text and metadata from Calibre-managed books, normalizes and chunks that text, generates embeddings through an HTTP provider, and inserts the resulting records into downstream systems such as Qdrant and Quickwit.

The repository is organized around a practical ingestion pipeline:

1. `extract`: walk a Calibre library and emit plain text plus sidecar metadata.
2. `chunk`: clean extracted text and convert it into JSONL chunk records.
3. `insert`: embed chunk text and write the results to vector and search indexes.
4. `dups`, `dup-stats`, `dedup`: inspect and manage duplicate books in a Calibre library.

## What The Project Does

Chunkr is not just a text splitter. The crate is structured as an end-to-end ingestion tool for personal or research-scale libraries where Calibre is the source of truth and Qdrant/Quickwit are downstream consumers.

Core capabilities:

- Extract `.epub` and `.pdf` content from a Calibre library tree.
- Preserve book-level metadata in JSON sidecars during extraction.
- Normalize text before chunking, including Unicode cleanup and whitespace collapsing.
- Produce JSONL chunk records with stable metadata fields and per-chunk offsets.
- Generate embeddings through a configurable HTTP embedding provider.
- Insert the same chunk corpus into both a vector store and a search index.
- Scan a library for duplicate files and summarize duplicate storage overhead.
- Score duplicate Calibre records by metadata completeness before removing lower-quality copies.

## Command Surface

The binary exposes the following subcommands:

```bash
chunkr extract
chunkr chunk
chunkr insert
chunkr dups
chunkr dup-stats --input dups.json
chunkr dedup --input dups.json --dry-run
```

Global flags:

- `-c, --config <PATH>`: load a TOML config file. Defaults to `config.toml`.
- `-h, --help`: print help.
- `-V, --version`: print the version.

## Pipeline Overview

### 1. Extract

`chunkr extract` walks `paths.calibre_root`, filters by `extract.extensions`, and writes extracted text under `paths.extract_root`.

Current format support:

- EPUB extraction uses `pandoc`.
- PDF extraction uses a `docling`-based pipeline, with optional text-first classification and OCR fallback logic.

Extraction behavior includes:

- Layout templating for output and metadata paths through `extract.output_layout` and `extract.metadata_layout`.
- Optional skipping of already extracted books with `extract.skip_existing`.
- Optional metadata sidecar generation with `extract.write_metadata`.
- EPUB chapter splitting for large books.
- PDF quality classification to distinguish text PDFs, low-quality text PDFs, and scan-like PDFs.
- Oversize PDF skipping when configured.

Typical output under `extract_root` looks like:

```text
extract_root/
  epub/
    some_book.txt
    some_book.json
  pdf/
    another_book.txt
    another_book.json
```

The extraction metadata sidecars include fields such as source path, format, title, authors, language, publication date, identifiers, Calibre id, and extraction timestamp.

### 2. Chunk

`chunkr chunk` reads `.txt` files from `paths.extract_root`, normalizes them, splits them into paragraphs, merges or breaks paragraphs according to configured size thresholds, and writes JSONL chunk files under `paths.chunk_root`.

Chunking behavior includes:

- Unicode normalization.
- Whitespace collapsing.
- Optional header/table-of-contents stripping.
- Minimum and maximum paragraph sizing.
- Target and hard maximum chunk lengths.
- Overlap between adjacent chunks.
- Metadata projection from file-level extraction metadata into each chunk record.

Each emitted JSONL line contains:

- `id`: a generated UUID.
- `text`: chunk text.
- `metadata`: source and book metadata plus chunk-local fields such as `chunk_index`, `char_start`, and `char_end`.

Typical output under `chunk_root` looks like:

```text
chunk_root/
  epub/
    some_book.jsonl
  pdf/
    another_book.jsonl
```

### 3. Insert

`chunkr insert` reads JSONL chunks from `paths.chunk_root`, batches them, requests embeddings from the configured provider, then writes results to:

- Qdrant for vector search.
- Quickwit for text search / indexing.

Insertion behavior includes:

- Parallel file ingestion.
- Batched embedding requests.
- Retry and backoff controls.
- Optional in-memory embedding cache.
- Optional Qdrant collection creation.
- Optional Quickwit final commit after all files are processed.

The current config shape suggests the intended deployment model is local services, for example:

- Qdrant at `http://127.0.0.1:6333`
- Quickwit at `http://127.0.0.1:7280`
- Ollama-compatible embeddings at `http://127.0.0.1:11434`

### 4. Duplicate Analysis And Cleanup

Chunkr also contains a separate duplicate-management workflow for Calibre libraries.

`chunkr dups`:

- Walks a library tree.
- Filters by extension and minimum size.
- Hashes candidate files in parallel.
- Emits duplicate groups in text or JSON format.

`chunkr dup-stats`:

- Reads the JSON report from `chunkr dups`.
- Summarizes group counts, file counts, and extra bytes consumed by duplicates.

`chunkr dedup`:

- Reads duplicate groups from `chunkr dups`.
- Extracts Calibre book ids from duplicate paths.
- Fetches Calibre metadata from a local library or content server target.
- Scores candidates by metadata completeness.
- Keeps the best-scoring record and removes lower-scoring duplicates.
- Supports `--dry-run` and should generally be run that way first.

## Requirements

Rust requirements:

- Rust edition `2024`
- Cargo

External tools and services depend on which commands you use.

For extraction:

- `pandoc` for EPUB extraction.
- `pdffonts`, `pdftotext`, and `pdfinfo` for PDF inspection/text-first heuristics.
- A `docling` Python environment and entrypoint script for PDF conversion.
- OCR tooling if your `docling` setup depends on it.

For insertion:

- A running embeddings endpoint compatible with the configured provider.
- A reachable Qdrant instance.
- A reachable Quickwit instance.

For deduplication:

- Access to a Calibre library path and/or Calibre content server.
- A working Calibre CLI environment if book removal is performed live.

## Quick Start

Build the project:

```bash
cargo build
```

Inspect commands:

```bash
cargo run -- --help
cargo run -- dups --help
cargo run -- dup-stats --help
cargo run -- dedup --help
```

Run the main pipeline:

```bash
cargo run -- extract
cargo run -- chunk
cargo run -- insert
```

Run duplicate analysis:

```bash
cargo run -- dups --out dups.json
cargo run -- dup-stats --input dups.json
cargo run -- dedup --input dups.json --dry-run
```

## Configuration

Configuration is TOML-based and loaded from `config.toml` by default. The shipped root config is a real working example and is the best starting point when adapting the project to a new machine.

Top-level sections:

- `[logging]`
- `[paths]`
- `[extract]`
- `[extract.epub]`
- `[extract.pdf]`
- `[chunk]`
- `[chunk.metadata]`
- `[insert]`
- `[insert.qdrant]`
- `[insert.quickwit]`
- `[insert.embeddings]`
- `[calibre]`
- `[calibre.content_server]`
- `[calibre.scoring]`
- `[dups]`
- `[dup_stats]`
- `[dedup]`

### Paths

`[paths]` defines where the pipeline reads from and writes to:

- `calibre_root`: source library tree to scan for books.
- `extract_root`: destination for extracted plain text and extraction metadata.
- `chunk_root`: destination for chunk JSONL files.
- `state_dir`: state/work directory for supporting workflows.
- `examples_cfr_dir`: example text corpus used by the ignored pipeline test.

### Extract Section

`[extract]` controls which formats are processed and how outputs are named.

Important fields:

- `extensions`: file extensions to include.
- `skip_existing`: avoid re-extracting existing outputs.
- `write_metadata`: emit `.json` sidecars next to extracted text.
- `output_layout`: path template for extracted text.
- `metadata_layout`: path template for metadata sidecars.

Layout placeholders currently used by the code:

- `{format}`
- `{title_slug}`

### EPUB Extraction

`[extract.epub]` configures the `pandoc` path and large-book splitting behavior.

Important fields:

- `backend`
- `pandoc_bin`
- `toc_depth`
- `chapter_split`
- `max_chapter_bytes`
- `max_file_bytes`
- `join_parts`
- `keep_parts`

### PDF Extraction

`[extract.pdf]` is the most operationally dense part of the config. It controls:

- the `docling` executable and script paths,
- PDF text-quality probing,
- OCR fallback decisions,
- table extraction modes,
- batching and timeout behavior,
- size limits and split-pass extraction for large PDFs.

If README readers are onboarding to the project, this section is where environment drift is most likely to break the pipeline.

### Chunk Section

`[chunk]` controls text cleanup and chunk sizing.

Important fields:

- `normalize_unicode`
- `collapse_whitespace`
- `strip_headers`
- `min_paragraph_chars`
- `max_paragraph_chars`
- `target_chunk_chars`
- `max_chunk_chars`
- `chunk_overlap_chars`
- `emit_jsonl`

`[chunk.metadata]` decides which file-level metadata fields get copied into each chunk record:

- source path
- Calibre id
- title
- authors
- published date
- language

### Insert Section

`[insert]` controls ingestion throughput and retry behavior:

- `batch_size`
- `retry_max`
- `retry_backoff_ms`
- `max_parallel_files`

`[insert.qdrant]` defines the vector collection target, including `url`, `collection`, `distance`, `vector_size`, and optional `api_key`.

`[insert.quickwit]` defines the text index target, including `url`, `index_id`, and commit behavior.

`[insert.embeddings]` defines the embedding provider contract:

- provider type
- base URL
- model name
- request timeout
- concurrency limits
- input truncation limits
- request batch sizing
- cache size

### Duplicate Workflow Sections

`[dups]` controls duplicate scanning defaults:

- output format
- allowed extensions
- symlink handling
- thread count
- minimum file size
- sidecar inclusion
- hash algorithm

`[dup_stats]` controls the default output mode for duplicate summaries.

`[dedup]` controls destructive dedup defaults:

- `min_size`
- `dry_run`

`[calibre]` and related sections define how duplicate cleanup talks to Calibre and how it scores record quality.

## Repository Layout

Top-level layout:

```text
.
├── Cargo.toml
├── Cargo.lock
├── README.md
├── LICENSE
├── config.toml
├── test.toml
├── justfile
├── docs/
├── examples/
├── src/
├── tests/
└── tmp/
```

### `src/`

Rust crate source:

- `main.rs`: CLI entrypoint, argument parsing, config loading, and subcommand dispatch.
- `lib.rs`: public module declarations for the crate.
- `config.rs`: TOML config model and defaults for duplicate-related sections.
- `extract.rs`: Calibre library walk, EPUB/PDF extraction, metadata sidecars, PDF quality handling, and output path layout logic.
- `chunk.rs`: text normalization, paragraph splitting, overlap handling, and JSONL chunk emission.
- `insert.rs`: embedding requests, batching, retries, cache, Qdrant insertion, and Quickwit insertion/commit flow.
- `dups.rs`: duplicate file scan, hashing, grouping, and report emission.
- `dup_stats.rs`: duplicate-report summarization and human/machine output.
- `dedup.rs`: duplicate-removal workflow driven by Calibre metadata quality scoring.
- `calibre_metadata.rs`: metadata normalization and scoring helpers used by dedup.
- `logging.rs`: tracing subscriber setup and colored log prefixes for concurrent insert operations.
- `util.rs`: small shared helpers such as slugification, layout rendering, and extension replacement.

### `tests/`

- `pipeline.rs`: ignored integration-style test for chunking and insertion. It stages example text files, resets Qdrant/Quickwit targets, runs chunk and insert in process, then verifies the indexed results.

This test is useful, but it is not a unit-test-only environment: it assumes live external services.

### `examples/`

Example corpora used for testing and experimentation:

- `examples/cfr/`: a large set of plain text CFR samples used by the ignored pipeline test.
- `examples/pdf/`: representative PDF fixtures covering clean text, low-quality text, and scan-like cases.

### `docs/`

Project notes and reference material:

- `docs/chunkr/`: implementation summaries and planning notes for this project.
- `docs/reference/`: broader project references, release notes, tooling notes, migration notes, and AI workflow documentation.

These docs are helpful for maintainers, but the crate does not appear to generate end-user docs from them directly.

### `tmp/`

Scratch material and local operational notes such as Docker Compose snippets and experimental extraction scripts. This directory looks like local working support rather than stable product surface.

## Development Workflow

The repository includes a `justfile` for common tasks.

Useful targets:

- `just build`
- `just fmt`
- `just fmt-check`
- `just validate`
- `just clippy`
- `just test`
- `just doc`
- `just ci`

Examples:

```bash
just build
just fmt
just ci
```

## Testing

Basic test command:

```bash
cargo test
```

Important caveat:

- `tests/pipeline.rs` is marked `#[ignore]`.
- It expects external services such as Qdrant, Quickwit, and an embeddings endpoint.
- It uses `test.toml` plus runtime overrides for temporary directories and target names.

So the automated test story is currently split between local crate tests and a service-backed integration test.

## Operational Notes

- `config.toml` contains machine-specific absolute paths. Treat it as an example to adapt, not a portable default.
- The PDF extraction stack has the highest environment complexity.
- `insert` assumes downstream schemas and endpoints are already compatible with the emitted chunk records.
- `dedup` can remove books from Calibre. Dry-run first and verify the scoring behavior against your library before running live.

## Current Shape Of The Project

As the code stands today, Chunkr is best understood as a focused ingestion utility for Calibre-centered libraries rather than a general document ETL framework. It already has a useful split between extraction, chunk preparation, indexing, duplicate inspection, and duplicate cleanup, and the repository layout reflects that separation clearly.
