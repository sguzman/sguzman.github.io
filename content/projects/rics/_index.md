---
title: "rics"
description: "Calendar file (ics) generator from heterogeneous sources"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`rics` is a Rust calendar ETL and ICS generator. It ingests source-specific TOML definitions, extracts event data from web pages, JSON feeds, PDFs, or rough text, normalizes events, updates prior future events, and emits year-bucketed `.ics` files.

## Ambition

A high-fidelity, high-performance iCalendar engine designed to handle non-standard time resolutions found in research and planning data.

## What’s novel

- Support for variable time precision including Quarter, Month, and Year-level events.
- Advanced metadata extensions (X-RICS-*) for tracking event confidence and revision history.
- Robust RFC 5545 compliant folding and escaping logic for high-compatibility exports.

## Highlights

- Loads sources from `configs/sources/**/*.toml`.
- Fetches each source via `http`, `file`, or `inline` mode.
- Parses records with declarative field mapping:
- HTML (`css:` selectors)
- JSON (`json:` paths)

## Stats

- Project page: /projects/rics/
- Primary language: Rust
- Commits: 36
- Created: 2026-02-25T16:39:27Z
- Last updated: 2026-05-22T04:49:00Z

## Links

- Repo: https://github.com/sguzman/rics
- README: /projects/readme/rics/
- DeepWiki: https://deepwiki.com/sguzman/rics/
