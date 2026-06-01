---
title: "slurp"
description: "A surrealdb ingester cli tool"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`slurp` is a lightweight Rust CLI tool for batch-inserting JSON data into [SurrealDB](https://surrealdb.com/). It reads a JSON array from a file, splits it into batches, and inserts each batch into a SurrealDB table over HTTP. Parallel insertion, colored logs, and flexible verbosity levels make it practical for handling large payloads.

## Ambition

A high-throughput data ingestion engine for SurrealDB, capable of saturating network and database capacity through parallel processing.

## What’s novel

- Leverages rayon for work-stealing parallelism during JSON batch processing.
- Optimized batched HTTP insertions using reqwest for maximum network throughput.
- Fail-fast validation and detailed reporting for large-scale database migrations.

## Highlights

- **Chunked inserts**: split large JSON arrays into batches of configurable size.
- **Parallel execution**: run multiple inserts concurrently with a `--thread` flag.
- **Color-coded logs**: timestamps and verbosity control for easy diagnostics.
- **Dry-run mode**: check how data would be split without touching the database.
- **Zero auth assumption**: connects to SurrealDB without authentication headers.

## Stats

- Project page: /projects/slurp/
- Primary language: Nix
- Commits: 28
- Created: 2025-09-25T18:30:33Z
- Last updated: 2025-09-25T19:46:50Z

## Links

- Repo: https://github.com/sguzman/slurp
- README: /projects/readme/slurp/
- DeepWiki: https://deepwiki.com/sguzman/slurp/
