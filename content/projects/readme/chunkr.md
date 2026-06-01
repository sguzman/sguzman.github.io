+++
title = "chunkr README"
description = "README mirror for chunkr"
draft = false
+++

[Repository](https://github.com/sguzman/chunkr) | [DeepWiki](https://deepwiki.com/sguzman/chunkr/)

# Chunkr

Chunkr is a CLI for extracting text + metadata from Calibre libraries, cleaning
and chunking that text, and inserting the resulting chunks into Qdrant and
Quickwit. Configuration is centralized in a single TOML file so that all
properties, policies, and paths are controlled in one place.

This README formalizes the intended interface and configuration for the project.

## Goals

- Deterministic, idempotent extraction from Calibre (skip already-processed
  files).
- Robust handling for large EPUB/PDF files (chunk during extraction to avoid
  memory spikes).
- Clean, normalized text and metadata-enriched chunks for downstream search and
  embeddings.
- Straightforward insertion into Qdrant + Quickwit with sensible defaults.
- Extensive logging for long-running pipelines.

## Commands

### `extract`

Extracts plaintext and metadata from a Calibre library into a target folder.

Key behaviors:

- Points at a Calibre library root (e.g. `/drive/calibre/en_nonfiction`).
- Supports EPUB and PDF (for now).
- Idempotent: skips items already extracted unless configured otherwise.
- EPUB extraction should follow the approach in `tmp/epub.fish`.
- PDF extraction should attempt text-first, and fall back to OCR via Docling
  (see `tmp/pdf.fish`).
- Large files are segmented during extraction using chapter boundaries when
  available.
- All extraction and segmentation policy is configured in TOML.

### `chunk`

Cleans, normalizes, and chunks a large corpus of text files into chunked JSONL
(or similar) with metadata.

Key behaviors:

- Uses the chunking strategies and policies defined in config.
- Mirrors the “oxbed” ingestion/chunking approach (see `tmp/oxbed`).
- Paragraph-aware segmentation: pack small paragraphs together, split oversized
  paragraphs.
- Emits normalized text + metadata for downstream insertion.

### `insert`

Inserts chunked text into Qdrant and Quickwit.

Key behaviors:

- Qdrant: vector store for embeddings, uses Ollama for embeddings.
- Quickwit: text search index for fast keyword queries.
- Connection details and collection/index policies are configured in TOML.
- Defaults are aligned with `tmp/docker-compose-quickwit.yaml` and
  `tmp/docker-compose-ollama.yaml`.

### `dups`

Runs a duplicate detection scan against a Calibre library.

Key behaviors:

- Hashes files inside the Calibre root (configurable via `paths.calibre_root` or
  CLI overrides).
- Supports filtering by extension, minimum size, and optional Calibre sidecars.
- Writes a JSON or plain-text report, either to stdout or a file path.
- Threading and file selection policies are configured through `[dups]`.
- Hash algorithm is driven by the `hash_algorithm` config key (`blake3` or
  `xxhash64`).

### `dup-stats`

Consumes a `chunkr dups` JSON report (for example `dups.json`) and sums the
redundant bytes so you can see how much space duplicates occupy.

Key behaviors:

- Keeps one canonical copy per group and treats the rest as extra bytes.
- Prints a pretty human report by default or JSON when `--mode machine`.
- Observes the `[dup_stats]` config section for default mode and verbosity.

### `dedup`

Consumes a `chunkr dups` JSON report and deletes redundant copies bucket-wise.

Key behaviors:

- Keeps a single canonical file per group (alphabetically first) and removes the
  rest.
- Scores metadata via `[calibre.scoring]` so the richest entry survives.
- Skips groups whose byte size is below `[dedup].min_size`.
- Honors `[dedup].dry_run` by default but can be overridden with `--dry-run`.

## Configuration

All properties, policies, and paths are set in a single TOML config file.
Example:

```toml
[logging]
level = "info"

[paths]
calibre_root = "/drive/calibre/en_nonfiction"
extract_root = "/drive/books/plaintext/books"
chunk_root = "/drive/books/plaintext/chunked"
state_dir = "/drive/books/.chunkr-state"

[extract]
extensions = ["epub", "pdf"]
skip_existing = true
write_metadata = true
output_layout = "{format}/{title_slug}.txt"
metadata_layout = "{format}/{title_slug}.json"

[extract.epub]
backend = "pandoc"
pandoc_bin = "pandoc"
toc_depth = 3
chapter_split = true
max_chapter_bytes = 2_000_000
max_file_bytes = 20_000_000
join_parts = true
keep_parts = false

[extract.pdf]
backend = "docling"
pdffonts_bin = "pdffonts"
pdftotext_bin = "pdftotext"
pdfinfo_bin = "pdfinfo"
docling_bin = "/home/admin/Code/AI/docling/.venv/bin/python"
docling_script = "/home/admin/Code/AI/docling/docling/cli/main.py"
text_first = true
text_good_min_chars = 120
text_low_min_chars = 40
text_alpha_ratio_min = 0.65
text_sample_pages = 3
ocr_fallback = true
ocr_lang = "eng"
ocr_engine = "tesseract"
docling_device = "cuda"
docling_pipeline = "standard"
docling_pdf_backend = "dlparse_v4"
docling_threads = 16
docling_tables = true
docling_table_mode = "accurate"
low_quality_use_ocr = false
low_quality_force_ocr = false
low_quality_tables = false
low_quality_table_mode = "fast"
scan_force_ocr = true
scan_tables = false
scan_table_mode = "fast"
page_batch_size = 1
document_timeout_seconds = 600
max_pages_per_pass = 50
split_text_extraction = true
max_file_bytes = 20_000_000
skip_oversize = false

[chunk]
normalize_unicode = true
collapse_whitespace = true
strip_headers = true
min_paragraph_chars = 120
max_paragraph_chars = 2_400
target_chunk_chars = 1_800
max_chunk_chars = 2_600
chunk_overlap_chars = 200
emit_jsonl = true

[chunk.metadata]
include_source_path = true
include_calibre_id = true
include_title = true
include_authors = true
include_published = true
include_language = true

[insert]
batch_size = 128
retry_max = 5
retry_backoff_ms = 500
max_parallel_files = 2

[insert.qdrant]
url = "http://127.0.0.1:6333"
collection = "books"
distance = "Cosine"
vector_size = 384
create_collection = true
api_key = ""
wait = false

[insert.quickwit]
url = "http://127.0.0.1:7280"
index_id = "books"
commit_timeout_seconds = 30
commit_mode = "auto"
commit_at_end = true

[insert.embeddings]
provider = "ollama"
base_url = "http://127.0.0.1:11434"
model = "qllama/bge-small-en-v1.5:latest"
request_timeout_seconds = 120
max_concurrency = 4
max_input_chars = 512
global_max_concurrency = 16
request_batch_size = 8
cache_max_entries = 50000

[calibre]
library_path = "/drive/calibre/en_nonfiction"
library_url = "http://127.0.0.1:8081/#en_nonfiction"
state_path = ""

[calibre.content_server]
username = "admin"
password = "admin"

[calibre.scoring]
title_weight = 1
authors_weight = 1
publisher_weight = 1
pubdate_weight = 1
isbn_weight = 2
identifiers_weight = 2
tags_weight = 1
comments_weight = 1
cover_weight = 1

[dup_stats]
mode = "human"

[dedup]
min_size = 1024
dry_run = true

[dups]
output = "json"
threads = 8
min_size = 1024
include_sidecars = false
follow_symlinks = false
ext = ["epub", "mobi", "azw3", "pdf", "djvu"]
hash_algorithm = "xxhash64"
```

Notes:

- The example values align with `tmp/docker-compose-quickwit.yaml` and
  `tmp/docker-compose-ollama.yaml`.
- All extraction and chunking policy must be driven from this file (no
  hard-coded defaults).
- Use the config file to set max sizes/limits to prevent large EPUB/PDF files
  from exhausting memory or GPU.

## Example Usage

```bash
# Extract from Calibre into /drive/books/plaintext/books
chunkr extract --config /path/to/config.toml

# Chunk all extracted files into chunked JSONL
chunkr chunk --config /path/to/config.toml

# Insert into Qdrant + Quickwit
chunkr insert --config /path/to/config.toml

# Scan for duplicates (writes JSON report)
chunkr dups --config /path/to/config.toml

# Delete redundant copies (dry-run first)
chunkr dedup --input dups.json

# Estimate duplicate waste from a report
chunkr dup-stats --input dups.json
```

## Dependencies and External Tools

- EPUB extraction uses Pandoc.
- PDF extraction uses Docling; OCR falls back to Tesseract via Docling.
- Qdrant and Quickwit are expected to be running (Docker Compose configs in
  `tmp/`).
- Ollama serves embeddings at the configured host/port.

## Logging

All commands should emit extensive structured logs (start/end, counts, skips,
timing, errors). Configure log level via `[logging]`.

## Testing

- The pipeline test (`cargo test --test pipeline -- --ignored --nocapture`)
  loads `test.toml` if present, otherwise `config.toml`.
- It overrides only the `paths.*` values to use a temp directory, and uses the
  collection/index from the config file. Set those to test-safe values.

## Development Formatting Pipeline

- `just fmt` runs all write-mode formatters: `cargo fmt`, `taplo fmt`,
  `stylua .`, `biome check --write .`, and `rumdl fmt .`.
- `just fmt-check` runs all check-mode formatters: `cargo fmt --check`,
  `taplo fmt --check`, `stylua --check .`, `biome check .`, and `rumdl check .`.
- StyLua behavior is configured in `stylua.toml`.
