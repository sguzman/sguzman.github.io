---
title: "zimrs"
description: "Zim -> sqlite"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`zimrs` converts a Wiktionary `.zim` archive into a queryable dictionary database and includes operational tooling for verification, reindexing, export, benchmarking, and release packaging.

## Ambition

I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate.

## What’s novel

- Opinionated defaults with room for power-user control.
- Tight scope + strong ergonomics (the “small tool, big leverage” approach).

## Highlights

- Postgres-first ingestion with automatic startup checks, database bootstrap, and schema management.
- SQLite compatibility mode for local/offline workflows.
- Configurable ZIM -> DB ingestion with namespace/MIME/prefix filters.
- Resumable checkpointing for long-running archive conversions.
- Optional parallel extraction workers.

## Stats

- Project page: /projects/zimrs/
- Primary language: Rust
- Commits: 20
- Created: 2026-02-26T21:24:23Z
- Last updated: 2026-03-05T16:28:14Z

## Links

- Repo: https://github.com/sguzman/zimrs
- README: /projects/readme/zimrs/
- DeepWiki: https://deepwiki.com/sguzman/zimrs/
