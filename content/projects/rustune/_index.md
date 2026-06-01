---
title: "rustune"
description: "rust port of fortune-mod"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`rustune` is a Rust port of `fortune-mod` focused on behavior parity while modernizing the internals:

## Ambition

Modernize the classic Unix fortune command with a memory-safe Rust implementation while maintaining strict behavior parity with the original fortune-mod.

## What’s novel

- Includes an oracle-driven parity harness that compares output against the system fortune command, achieving 100% weighted parity.
- Deterministic RNG hooks for parity testing and property-based testing (proptest) for dat-file stability.
- Modern structured logging with tracing and support for upstream-style seedable RNG behavior.

## Highlights

- memory-safe STRFILE parsing/writing
- deterministic RNG hooks for parity testing
- structured diagnostics with `tracing`
- an oracle-driven parity harness
- `rustune`: selects and prints fortunes

## Stats

- Project page: /projects/rustune/
- Primary language: Rust
- Commits: 8
- Created: 2026-02-15T03:18:20Z
- Last updated: 2026-02-15T04:02:49Z

## Links

- Repo: https://github.com/sguzman/rustune
- README: /projects/readme/rustune/
- DeepWiki: https://deepwiki.com/sguzman/rustune/
