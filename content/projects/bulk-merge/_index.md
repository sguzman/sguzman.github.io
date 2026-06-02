---
title: "bulk-merge"
description: "A program to clean and merge book metadata libraries into one cohesive postgresql presentation"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`bulk-merge` is a Rust CLI for loading large bibliographic metadata dumps into PostgreSQL in a reproducible, resumable, and inspectable way.

## Ambition

Build the foundation for a universal open-library index that can handle hundreds of millions of records without breaking a sweat.

## What’s novel

- High-performance ingestion using PostgreSQL's COPY command.
- Resumable import system for multi-gigabyte bibliographic dumps.
- Dedicated schema management for diverse metadata sources.

## Highlights

- a CLI for provisioning schemas, ingesting dumps, and inspecting status
- PostgreSQL migrations for metadata bookkeeping and source schemas
- resumability for long-running imports
- an offline path for converting very large SQL dumps into intermediate TSV files before `COPY` loading
- configuration-driven behavior for naming, typing, logging, indexing, retry, and cache layout

## Stats

- Project page: /projects/bulk-merge/
- Primary language: Rust
- Commits: 58
- Created: 2026-04-13T23:06:29Z
- Last updated: 2026-05-03T22:25:23Z

## Links

- Repo: https://github.com/sguzman/bulk-merge
- README: /projects/readme/bulk-merge/
- DeepWiki: https://deepwiki.com/sguzman/bulk-merge/
