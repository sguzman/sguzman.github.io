---
title: "nflxport"
description: "a Rust toolkit for caching, querying, and exporting nflverse data"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

A high-performance Rust toolkit for working with `nflverse` data.

## Ambition

Build a serious Rust toolkit for working with nflverse data locally, with fast export, caching, and query paths for analysis-heavy workflows.

## What’s novel

- Focuses on local-first caching and export flows for nflverse datasets.
- Combines data acquisition, querying, and transformation in one Rust-native toolchain.
- Targets repeatable analysis workflows instead of one-off notebook pulls.

## Highlights

- **Blazing Fast**: Powered by Polars and Rust.
- **Idempotent Caching**: Efficiently manage large Parquet datasets under `.cache/nflxport`.
- **Analytical Query Engine**: Perform statistical queries directly from the CLI.
- **Wolfram Mathematica Bridge**: Seamlessly export data for advanced symbolic analysis.
- Built-in DuckDB engine for local SQL queries over cached data.

## Stats

- Project page: /projects/nflxport/
- Primary language: Rust
- Commits: 11
- Created: 2026-05-07T02:36:59Z
- Last updated: 2026-05-08T20:19:34Z

## Links

- Repo: https://github.com/sguzman/nflxport
- README: /projects/readme/nflxport/
- DeepWiki: https://deepwiki.com/sguzman/nflxport/
