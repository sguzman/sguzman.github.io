---
title: "cfr-to-text"
description: "Extract text from cfr xml files"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

Extract text from CFR XML files (Code of Federal Regulations) into plain text or JSONL.

## Ambition

A robust, industrial-grade extraction tool for the Code of Federal Regulations, stripping complex XML schemas into semantic text.

## What’s novel

- Sophisticated CLI with TOML configuration for fine-grained control over element exclusion and whitespace normalization.
- High-speed XML event processing capable of handling the entire US Federal database.
- Automated output splitting and file management for massive, multi-part datasets.

## Highlights

- `--config <FILE>`: Config file path (default `cfr-to-text.toml`)
- `--input-dir <DIR>` / positional inputs
- `--recursive` / `--no-recursive`
- `--glob <GLOB>` (repeatable)
- `--output-dir <DIR>` or `--output <FILE>`

## Stats

- Project page: /projects/cfr-to-text/
- Primary language: Rust
- Commits: 6
- Created: 2026-01-29T11:54:35Z
- Last updated: 2026-05-03T01:12:12Z

## Links

- Repo: https://github.com/sguzman/cfr-to-text
- README: /projects/readme/cfr-to-text/
- DeepWiki: https://deepwiki.com/sguzman/cfr-to-text/
