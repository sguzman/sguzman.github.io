+++
title = "quack-check README"
description = "README mirror for quack-check"
draft = false
+++

[Repository](https://github.com/sguzman/quack-check) | [DeepWiki](https://deepwiki.com/sguzman/quack-check/)

# quack-check

`quack-check` is a deterministic PDF transcript orchestration tool written in Rust. It sits above the actual extraction backends and makes explicit decisions about:

- how to inspect a PDF before conversion
- which extraction path to use
- when to split a document into chunks
- how to merge chunk output into a stable final transcript
- which metadata and audit artifacts to keep

The project is aimed at repeatable, policy-driven transcript generation rather than ad hoc one-off extraction.

## What The Project Does

At a high level, a `quack-check run` job does this:

1. Validates the input PDF and configuration.
2. Probes the document to estimate page count, text density, garbage characters, and whitespace ratio.
3. Classifies the document into one of three quality tiers:
   - `HighText`
   - `MixedText`
   - `Scan`
4. Chooses an engine for that tier:
   - native text extraction for high-quality text PDFs
   - Docling for mixed or scanned PDFs
5. Builds a chunk plan if the document is large enough to require chunking.
6. Converts each chunk sequentially.
7. Merges chunk markdown, normalizes and cleans it, and emits final artifacts.
8. Writes a report describing the probe results, policy decision, and per-chunk outcomes.

The main design goal is that policy is visible and configurable. The code is intentionally organized so decisions are inspectable instead of hidden inside a backend-specific wrapper.

## Core Design Goals

- Determinism: identical config and identical input should map to the same job identity and the same processing policy.
- Auditability: the pipeline emits structured artifacts that explain what happened.
- Safety on difficult PDFs: large, broken, or mixed-quality files can be chunked and processed in a controlled way.
- Backend separation: Rust owns orchestration and policy; Python scripts own backend-specific extraction tasks.
- Explicit fallback behavior: native extraction can fall back to Docling when the native path is unavailable or clearly failing.

## Processing Model

### 1. Probe

The probe stage inspects the input PDF before conversion. Current probe stats include:

- total file size in bytes
- page count
- sampled page count
- average extracted characters per sampled page
- replacement-character garbage ratio
- whitespace ratio

The probe is implemented through `scripts/pdf_probe.py`, using `pypdf` when available and `pypdfium2` as a fallback.

### 2. Policy Decision

Classification is driven by thresholds in `[classification]` from the TOML config.

- `HighText`: enough extracted text, low garbage ratio, and reasonable whitespace ratio
- `Scan`: very low extracted text density
- `MixedText`: everything in between

The policy result then selects:

- a tier
- an engine name
- whether OCR should be enabled

You can also force a tier with `classification.forced_tier`.

### 3. Chunk Planning

Chunking is page-based. The current chunk planner:

- uses target, min, and max pages per chunk
- can require chunking above configured page or file-size thresholds
- supports two strategies:
  - `physical_split`: create temporary chunk PDFs first
  - `page_range`: reuse the original PDF and ask the converter to process page ranges

The default path is `physical_split`, with a fallback to `page_range` if physical splitting fails.

### 4. Conversion

Two engine paths exist today:

- `native_text`
  - implemented by `scripts/pdf_text.py`
  - intended for high-quality text PDFs
  - can normalize Unicode, collapse whitespace, and fix line-break hyphenation
- `docling`
  - implemented by `scripts/docling_runner.py`
  - intended for mixed-text and scanned PDFs
  - supports Docling backend, OCR, and pipeline option configuration

If `native_text` is selected but the Python dependencies are missing or the conversion clearly fails, the pipeline falls back to Docling for that chunk.

### 5. Postprocessing

Chunk markdown is merged with separators, then cleaned according to `[postprocess]`:

- newline normalization
- Unicode normalization
- control character sanitization
- trailing whitespace trimming
- repeated line removal
- regex-based line removal

Plain text output is then derived from the merged markdown with a lightweight markdown stripping step.

## CLI

The binary exposes four subcommands:

### `doctor`

Checks the configured Python environment and Docling availability.

```bash
cargo run -- doctor
```

### `classify`

Runs probe plus policy selection and prints JSON describing the input, probe result, and decision.

```bash
cargo run -- classify --input path/to/file.pdf
```

### `plan`

Runs probe plus chunk planning and prints the chunk plan JSON.

```bash
cargo run -- plan --input path/to/file.pdf
```

### `run`

Executes the full pipeline and writes outputs to a job directory.

```bash
cargo run -- run --input path/to/file.pdf
```

Optional flags:

- `--config <path>`: use a specific TOML config file
- `--log-level <trace|debug|info|warn|error>`: override logging level
- `run --out-dir <path>`: override the output root for that job

If `--config` is omitted, the binary resolves config in this order:

1. `./quack-check.toml`
2. `./quack-check.example.toml`

## Runtime Requirements

### Rust

- current Rust toolchain with Cargo

### Python

The Rust crate delegates backend work to repo-local Python scripts. Depending on which path you use, you will need some combination of:

- `python3`
- `pypdf`
- `pypdfium2`
- `docling`
- OCR/runtime dependencies expected by your Docling installation

`docling.python_exe = "auto"` resolves Python in this order:

1. `$DOCLING_PYTHON`
2. `~/Code/AI/docling/.venv/bin/python`
3. `python3` from `PATH`

### External Models / Artifacts

If `paths.docling_artifacts_dir` is set, `quack-check` exports it as `DOCLING_ARTIFACTS_PATH` for Docling. If it is empty, Docling falls back to its normal artifact/model resolution behavior.

The Docling runner also disables some advanced features if required artifacts are missing. For example, table structure extraction is downgraded when tableformer artifacts are not present.

## Installation And Quick Start

Build the project:

```bash
cargo build
```

Run the environment diagnostic:

```bash
cargo run -- doctor
```

Inspect classification for a PDF:

```bash
cargo run -- classify --input res/fw9.pdf
```

Generate a full transcript job:

```bash
cargo run -- run --input res/fw9.pdf
```

Run the test suite:

```bash
cargo test
```

## Output Layout

Each `run` produces a job directory under `paths.out_dir` or the `--out-dir` override. The directory name is a deterministic `job_id` derived from:

- a normalized serialization of the config
- a hash of the input PDF

The hash mode is controlled by `[hashing]`. Supported modes are:

- `full_sha256`
- `fast_2x16mb`

Typical job directory structure:

```text
out/<job_id>/
├── chunks/
│   ├── chunk_00000.json
│   ├── chunk_00000_p00001-p00040.pdf
│   └── ...
├── final/
│   ├── report.json
│   ├── transcript.md
│   └── transcript.txt
├── logs/
│   └── quack-check.log
├── effective-config.toml
└── index.json
```

Important outputs:

- `final/transcript.md`: merged markdown transcript
- `final/transcript.txt`: simplified plain-text transcript
- `final/report.json`: structured report with probe stats, policy decision, and chunk results
- `index.json`: stable pointers to the key artifacts plus timestamps
- `effective-config.toml`: the resolved config used for the job when debug dumping is enabled
- `chunks/chunk_*.json`: per-chunk conversion results when chunk JSON output is enabled

## Configuration

The project ships with a fully documented example config in [quack-check.example.toml](/win/linux/Code/rust/quack-check/quack-check.example.toml). That file is the authoritative reference for available knobs.

The top-level sections are:

- `global`: high-level runtime behavior such as resume, summary printing, and parallelism settings
- `paths`: output, cache, work, script, and Docling artifact paths
- `hashing`: how input files are hashed for job identity
- `limits`: file size, page count, and timeout guards
- `classification`: text-density and quality thresholds
- `chunking`: chunk sizing and split strategy
- `engine`: per-tier engine selection
- `native_text`: native extraction cleanup behavior
- `docling`: Docling Python executable, limits, backend, OCR, pipeline, accelerator, and VLM settings
- `postprocess`: cleanup and transcript-merging behavior
- `output`: which artifacts to emit and under what filenames
- `logging`: stdout/file logging controls
- `debug`: extra debugging output
- `security`: input and script path safety checks

### Configuration Notes

- `global.max_parallel_chunks` exists, but the current Rust pipeline still processes chunks sequentially and logs a warning if the value is greater than `1`.
- `security.reject_url_inputs` blocks URL-like inputs.
- `security.pin_scripts_dir` requires the configured scripts directory to live under the current repository path.
- `classification.enable_render_probe` is present but reserved for future use in the current build.
- `docling.vlm` is present as reserved future configuration; it is not part of the main transcript path today.

## Logging And Diagnostics

Logging is done through `tracing`.

- stdout logging is always initialized
- file logging is enabled when a log path is resolved
- logging can be plain text or JSON

The `doctor` command returns a JSON object with:

- resolved Python executable
- Python version
- detected Docling version
- success flag
- error message if Docling could not be imported

This is the fastest way to validate whether the Python side of the stack is wired correctly.

## Current Behavior And Limitations

- The pipeline is currently sequential even though the config exposes a parallel chunk setting.
- The native text path is intentionally simple and based on Python PDF extraction, not a full document understanding pipeline.
- Plain text export is currently a lightweight markdown simplification, not a full markdown renderer.
- Some Docling pipeline flags are applied on a best-effort basis. Unsupported flags are tracked as ignored metadata rather than hard failures.
- Physical splitting depends on `pypdf`.
- Probe and native extraction depend on either `pypdf` or `pypdfium2`.

## Repository Layout

This repository is small, but it has a clear split between orchestration, backend bridges, and test coverage.

### Top Level

- [Cargo.toml](/win/linux/Code/rust/quack-check/Cargo.toml): crate manifest and dependency list
- [README.md](/win/linux/Code/rust/quack-check/README.md): project documentation
- [quack-check.example.toml](/win/linux/Code/rust/quack-check/quack-check.example.toml): exhaustive example configuration
- `LICENSE`: license file
- `res/`: sample PDFs used for development and manual validation
- `scripts/`: Python bridge scripts used by the Rust orchestration layer
- `src/`: Rust source code
- `tests/`: integration-style tests for config parsing and core policy logic
- `tmp/`: local scratch outputs and temporary artifacts used during development

### `src/`

- [src/main.rs](/win/linux/Code/rust/quack-check/src/main.rs): binary entrypoint
- [src/lib.rs](/win/linux/Code/rust/quack-check/src/lib.rs): crate module exports
- [src/cli.rs](/win/linux/Code/rust/quack-check/src/cli.rs): Clap CLI, config resolution, logging setup, and command dispatch
- [src/config.rs](/win/linux/Code/rust/quack-check/src/config.rs): full configuration schema and defaults
- [src/probe.rs](/win/linux/Code/rust/quack-check/src/probe.rs): probe result types and input validation wrapper
- [src/policy.rs](/win/linux/Code/rust/quack-check/src/policy.rs): quality tier classification and engine selection
- [src/chunk_plan.rs](/win/linux/Code/rust/quack-check/src/chunk_plan.rs): page-based chunk planning
- [src/pipeline.rs](/win/linux/Code/rust/quack-check/src/pipeline.rs): end-to-end job orchestration
- [src/postprocess.rs](/win/linux/Code/rust/quack-check/src/postprocess.rs): markdown merge and transcript cleanup
- [src/report.rs](/win/linux/Code/rust/quack-check/src/report.rs): structured report types
- [src/util.rs](/win/linux/Code/rust/quack-check/src/util.rs): hashing, timestamping, and filesystem helpers
- [src/engine/mod.rs](/win/linux/Code/rust/quack-check/src/engine/mod.rs): engine trait wiring
- [src/engine/types.rs](/win/linux/Code/rust/quack-check/src/engine/types.rs): Rust-side request/response types for the Python bridge
- [src/engine/python.rs](/win/linux/Code/rust/quack-check/src/engine/python.rs): Python subprocess engine implementation

### `scripts/`

- [scripts/docling_runner.py](/win/linux/Code/rust/quack-check/scripts/docling_runner.py): Docling doctor and convert entrypoint
- [scripts/pdf_probe.py](/win/linux/Code/rust/quack-check/scripts/pdf_probe.py): cheap PDF probing for page count and text heuristics
- [scripts/pdf_split.py](/win/linux/Code/rust/quack-check/scripts/pdf_split.py): physical PDF chunk splitting
- [scripts/pdf_text.py](/win/linux/Code/rust/quack-check/scripts/pdf_text.py): native text extraction path

### `tests/`

- [tests/config_parse.rs](/win/linux/Code/rust/quack-check/tests/config_parse.rs): verifies the example config parses cleanly
- [tests/chunk_plan.rs](/win/linux/Code/rust/quack-check/tests/chunk_plan.rs): validates basic chunk plan behavior
- [tests/policy_decision.rs](/win/linux/Code/rust/quack-check/tests/policy_decision.rs): covers quality tier classification rules
- [tests/postprocess_merge.rs](/win/linux/Code/rust/quack-check/tests/postprocess_merge.rs): covers repeated-line removal and control-character sanitization

## Development Notes

If you extend the project, the current architecture expects:

- policy changes to remain visible in config or a dedicated policy module
- Python scripts to keep emitting machine-readable JSON
- output artifacts to remain stable enough for auditing and downstream automation
- tests to cover policy thresholds, chunk planning, and postprocessing behavior

When changing thresholds or output semantics, treat the README, example config, and tests as part of the same surface area.
