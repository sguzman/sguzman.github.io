+++
title = "quack-check README"
description = "README mirror for quack-check"
draft = false
+++

[Repository](https://github.com/sguzman/quack-check) | [DeepWiki](https://deepwiki.com/sguzman/quack-check/)

# quack-check

quack-check is a deterministic PDF transcript orchestrator built around Docling. It classifies PDF quality, chooses a policy, chunks large files safely, runs Docling (or native extraction), and merges a stable transcript with optional post-processing.

**Why**
- PDFs are not uniform. Some have clean embedded text, some have partial/broken layers, and some are image-only scans.
- Docling can do a lot, but deterministic orchestration, chunking, and policy decisions are on you.
- quack-check makes those decisions explicit and configurable.

**Key Features**
- Preflight probe for text quality (chars/page, garbage ratio, whitespace ratio).
- Policy-driven extraction tiers: high-text, mixed-text, scan.
- Chunk planning and physical splitting for large PDFs to avoid memory blowups.
- Docling options and OCR behavior are explicitly configured.
- Per-chunk isolation and timeouts for stability.
- Structured job outputs: final transcript + JSON report + chunk metadata.
- Extensive logging via `tracing` (stdout + optional file).

**Requirements**
- Rust toolchain (edition 2024) for building quack-check.
- Python environment with `docling` and `pypdf` installed.
- OCR engines supported by Docling if you enable OCR (easyocr/tesseract).

**Install**
1. Build the binary:

```bash
cargo build --release
```

2. Use your existing Docling environment (recommended). quack-check looks for:
   1) `$DOCLING_PYTHON`
   2) `~/Code/AI/docling/.venv/bin/python`
   3) `python3` on PATH

If you want to point to a specific environment, set `docling.python_exe` in `quack-check.toml`.

If you need to install dependencies in a separate venv, do it there (not globally):

```bash
/path/to/venv/bin/python -m pip install docling pypdf
```

**Quick Start**
1. Copy the example config:

```bash
cp quack-check.example.toml quack-check.toml
```

2. Run:

```bash
./target/release/quack-check run --config quack-check.toml --input /path/to/file.pdf --out-dir out
```

3. Inspect outputs:
- `out/<job-id>/final/transcript.md`
- `out/<job-id>/final/transcript.txt`
- `out/<job-id>/final/report.json`
- `out/<job-id>/chunks/chunk_00000.json`

**CLI**
- `quack-check doctor`: checks Python executable, imports, and prints detected docling version.
- `quack-check classify --input X.pdf`: runs the probe stage and prints a classification summary and chosen policy.
- `quack-check plan --input X.pdf`: prints the chunk plan that would be used.
- `quack-check run --input X.pdf --out-dir out/`: full pipeline.

**Configuration**
The config is intentionally comprehensive. See `quack-check.example.toml` for every knob.

Highlights:
- `classification.*` controls tier thresholds.
- `chunking.*` controls page chunk size and strategy (`physical_split` vs `page_range`).
- `docling.pipeline.*` sets docling flags (OCR, force_backend_text, images_scale, thread/batch sizes).
- `docling.ocr.*` selects engine and OCR behavior.
  - For `tesseract`/`tesseract_cli`, use Tesseract language codes such as `eng`.
- `postprocess.control_chars_to_sanitize` controls which byte-valued Unicode control codes are removed from transcript output (defaults include C0/C1 controls).
- `paths.docling_artifacts_dir` controls where Docling looks for model artifacts. If empty, `DOCLING_ARTIFACTS_PATH` is not set and Docling resolves models through `HF_HOME`/its Hugging Face cache behavior.
- `postprocess.*` cleans repeated headers/footers and regex-matched lines.
- `output.*` controls what artifacts are written.
- `logging.*` controls log level and file logging.

**Policy Behavior**
- High-text PDFs: default engine `native_text` (fast, no OCR, minimal processing).
- Mixed-text PDFs: Docling with optional OCR and structure recovery.
- Scan PDFs: OCR forced on.

You can override tier selection with `classification.forced_tier`.

**Docling Flag Detection**
Docling evolves quickly. The runner introspects available options and only sets flags your installed docling version supports. Unsupported flags are recorded in each chunk’s `meta.ignored_flags` so you can see what was skipped.

**Output Layout**
```
out/<job-id>/
  chunks/
    chunk_00000.json
    chunk_00001.json
  final/
    transcript.md
    transcript.txt
    report.json
  logs/
    quack-check.log
  index.json
```

**Determinism**
A job id is computed from:
- the input file hash
- the normalized config

The job directory stores all inputs/outputs required to reproduce a run.

**Troubleshooting**
- If Docling hangs, lower `docling.chunk_timeout_seconds` and keep chunk sizes small.
- If memory spikes, reduce `chunking.target_pages_per_chunk` and disable image outputs.
- If OCR produces garbage, force full-page OCR and tune `bitmap_area_threshold`.

**Developing**
Run tests:

```bash
cargo test
```
