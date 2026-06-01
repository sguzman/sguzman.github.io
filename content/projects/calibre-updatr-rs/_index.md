---
title: "calibre-updatr-rs"
description: "Calibre update but in rust (python version made me pull my hair out)"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

Calibre Metadata Updatr (Rust) ==============================

## Ambition

A blazing fast, CLI-native alternative to the Calibre GUI for managing massive ebook libraries with a focus on metadata consistency.

## What’s novel

- Native SQLite-level interaction for rapid database updates without GUI overhead.
- Sophisticated deduplication engine designed to identify overlaps across tens of thousands of records.
- High-performance metadata extraction and normalization pipeline.

## Highlights

- Iterate through a Calibre library and update metadata for EPUB books.
- Prefer books that are English or missing language.
- Fetch richer metadata when current data is incomplete.
- Embed metadata directly into EPUB files after updating the Calibre DB.
- Avoid reprocessing the same book on subsequent runs by default.

## Stats

- Project page: /projects/calibre-updatr-rs/
- Primary language: Rust
- Commits: 25
- Created: 2026-01-28T04:29:59Z
- Last updated: 2026-01-28T08:05:31Z

## Links

- Repo: https://github.com/sguzman/calibre-updatr-rs
- README: /projects/readme/calibre-updatr-rs/
- DeepWiki: https://deepwiki.com/sguzman/calibre-updatr-rs/
