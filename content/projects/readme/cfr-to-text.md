+++
title = "cfr-to-text README"
description = "README mirror for cfr-to-text"
draft = false
+++

[Repository](https://github.com/sguzman/cfr-to-text) | [DeepWiki](https://deepwiki.com/sguzman/cfr-to-text/)

# cfr-to-text

Extract text from CFR XML files (Code of Federal Regulations) into plain text or JSONL.

## Quick start

```bash
# Build
cargo build

# Use the default config (cfr-to-text.toml)
cargo run -- extract

# Override inputs and output dir
cargo run -- extract tmp/cfr/title-3 --output-dir out --format plain

# Emit JSONL with element and file metadata
cargo run -- extract tmp/cfr/title-3 --format jsonl --emit-element --emit-source
```

## CLI overview

```
cfr-to-text [OPTIONS] <COMMAND>

Commands:
  extract       Extract text from CFR XML inputs
  init-config   Write a default config file
  print-config  Print the effective config as TOML
```

Key extract flags:

- `--config <FILE>`: Config file path (default `cfr-to-text.toml`)
- `--input-dir <DIR>` / positional inputs
- `--recursive` / `--no-recursive`
- `--glob <GLOB>` (repeatable)
- `--output-dir <DIR>` or `--output <FILE>`
- `--format <plain|jsonl>`
- `--split-max-bytes <BYTES>` / `--no-split`
- `--include-element <NAME>` / `--exclude-element <NAME>`
- `--heading-element <NAME>` / `--paragraph-element <NAME>`
- `--emit-element` / `--emit-path` / `--emit-source`

## Configuration

The tool reads `cfr-to-text.toml` by default. You can generate a fresh config with:

```bash
cargo run -- init-config --path cfr-to-text.toml --overwrite
```

Sample config (trimmed):

```toml
[input]
paths = ["tmp/cfr"]
recursive = true
follow_symlinks = false
globs = ["**/*.xml"]
xml_only = true

[parse]
include_elements = []
exclude_elements = []
heading_elements = ["HD", "HED"]
paragraph_elements = ["P", "FP"]
min_text_len = 1
strip_whitespace = true
collapse_whitespace = true
preserve_line_breaks = false

[emit]
include_element_name = true
include_element_path = false
include_source_file = true
record_delimiter = "\n"
heading_prefix = "# "
paragraph_prefix = ""
heading_blank_line = true

[output]
output_dir = "out"
format = "Plain"
overwrite = false
split_max_bytes = 1048576
# Set to 0 to disable splitting
```

## Output formats

- **Plain**: text lines with configurable heading/paragraph prefixes and delimiter.
- **JSONL**: one JSON object per text segment with optional metadata fields.

Example JSONL record:

```json
{"text":"Title 3","kind":"heading","element":"HD","path":null,"source":"tmp/cfr/title-3/CFR-2025-title3-vol1.xml"}
```

## Logging

Logging is powered by `tracing` with configurable level and output format:

```bash
cargo run -- --log-level debug --log-format json extract tmp/cfr/title-3
```

Set `--log-file` to append logs to a file.

## Notes

- The parser is streaming and memory-efficient, suitable for large XML files.
- Use `--include-element` / `--exclude-element` to control which tags emit text.
