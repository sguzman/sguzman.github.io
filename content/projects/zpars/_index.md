---
title: "zpars"
description: "A rust zpaq port"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`zpars` is an in-progress Rust port of core ZPAQ compression/decompression ideas.

## Ambition

I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate.

## What’s novel

- Opinionated defaults with room for power-user control.
- Tight scope + strong ergonomics (the “small tool, big leverage” approach).

## Highlights

- A native Rust block codec (`.zpars`) with LZ77-based compression/decompression.
- A CLI built with `clap`.
- Toggleable structured logging via `tracing`.
- ZPAQ archive inspection and partial extraction tooling.
- Compatibility tests that exercise the bundled reference implementation in `tmp/zpaq`.

## Stats

- Project page: /projects/zpars/
- Primary language: Rust
- Commits: 10
- Created: 2026-01-31T10:24:42Z
- Last updated: 2026-02-08T01:40:39Z

## Links

- Repo: https://github.com/sguzman/zpars
- README: /projects/readme/zpars/
- DeepWiki: https://deepwiki.com/sguzman/zpars/
