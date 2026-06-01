---
title: "game-site-scraper"
description: "A scraper for a certain game site"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`game-scraper` parses saved game-release HTML pages into structured JSON metadata.

## Ambition

Build a high-throughput, industrial-grade scraping engine that transforms unstructured gaming release pages into highly searchable, structured datasets.

## What’s novel

- Provenance Tracking: Integrated SHA-256 hashing and byte-level metadata for every extracted document to ensure data integrity.
- Meilisearch Pipeline: Automated, concurrent batch-loading into Meilisearch with intelligent ID strategies and task monitoring.
- Layout Resilience: Rule-based TOML configuration system that handles heterogeneous CSS layouts and spoiler sections.

## Highlights

- Rich CLI (`clap`) with subcommands
- Extensive structured logging (`tracing`)
- TOML config that explicitly controls each scraped property
- Per-document provenance (`path`, `bytes`, `sha256`)
- Batch parsing for files and directories

## Stats

- Project page: /projects/game-site-scraper/
- Primary language: Rust
- Commits: 16
- Created: 2026-02-07T19:29:26Z
- Last updated: 2026-03-30T19:11:44Z

## Links

- Repo: https://github.com/sguzman/game-site-scraper
- README: /projects/readme/game-site-scraper/
- DeepWiki: https://deepwiki.com/sguzman/game-site-scraper/
