---
title: "quack-check"
description: "A wrapper around docling for detecting quality of text and producing high quality output transcript"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

quack-check is a deterministic PDF transcript orchestrator built around Docling. It classifies PDF quality, chooses a policy, chunks large files safely, runs Docling (or native extraction), and merges a stable transcript with optional post-processing.

## Ambition

I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate.

## What’s novel

- Opinionated defaults with room for power-user control.
- Tight scope + strong ergonomics (the “small tool, big leverage” approach).

## Highlights

- PDFs are not uniform. Some have clean embedded text, some have partial/broken layers, and some are image-only scans.
- Docling can do a lot, but deterministic orchestration, chunking, and policy decisions are on you.
- quack-check makes those decisions explicit and configurable.
- Preflight probe for text quality (chars/page, garbage ratio, whitespace ratio).
- Policy-driven extraction tiers: high-text, mixed-text, scan.

## Stats

- Project page: /projects/quack-check/
- Primary language: Rust
- Commits: 15
- Created: 2026-02-13T20:05:07Z
- Last updated: 2026-02-14T04:48:05Z

## Links

- Repo: https://github.com/sguzman/quack-check
- README: /projects/readme/quack-check/
- DeepWiki: https://deepwiki.com/sguzman/quack-check/
