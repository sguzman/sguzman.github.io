---
title: "bulk-merge"
description: "A program to clean and merge book metadata libraries into one cohesive postgresql presentation"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`bulk-merge` is a Rust CLI that ingests large bibliographic metadata dumps into PostgreSQL as usable, queryable tables.

## Ambition

Build the foundation for a universal open-library index that can handle hundreds of millions of records without breaking a sweat.

## What’s novel

- High-performance ingestion using PostgreSQL's COPY command.
- Resumable import system for multi-gigabyte bibliographic dumps.
- Dedicated schema management for diverse metadata sources.

## Highlights

- LibGen-only ingestion
- Dedicated tables per dump kind (`fiction` vs `compact`)
- Resumable imports and incremental updates tracked in `bm_meta`
- Ingest speed first: bulk load via `COPY`, create indexes after load
- 1-to-1 field mapping from the MySQL dump to PostgreSQL columns (no semantic normalization yet)

## Stats

- Project page: /projects/bulk-merge/
- Primary language: Rust
- Commits: 56
- Created: 2026-04-13T23:06:29Z
- Last updated: 2026-04-22T23:53:12Z

## Links

- Repo: https://github.com/sguzman/bulk-merge
- README: /projects/readme/bulk-merge/
- DeepWiki: https://deepwiki.com/sguzman/bulk-merge/
