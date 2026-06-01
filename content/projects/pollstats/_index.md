---
title: "pollstats"
description: "Download us political data "
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

Config-driven downloader + local data store for US politics datasets, with optional Postgres ingest of manifest metadata.

## Ambition

Provide a reliable, automated pipeline for tracking political data changes with full historical versioning.

## What’s novel

- Automatic tracking of ETag, Last-Modified, and SHA256 for remote artifacts.
- Config-driven downloader with local data store and optional Postgres ingest.
- Full historical preservation of datasets whenever content changes.

## Highlights

- `cargo build`
- `cargo run -- list`
- `cargo run -- check`
- `cargo run -- update`
- `cargo run -- download`

## Stats

- Project page: /projects/pollstats/
- Primary language: Rust
- Commits: 25
- Created: 2026-04-21T23:53:11Z
- Last updated: 2026-04-23T19:00:45Z

## Links

- Repo: https://github.com/sguzman/pollstats
- README: /projects/readme/pollstats/
- DeepWiki: https://deepwiki.com/sguzman/pollstats/
