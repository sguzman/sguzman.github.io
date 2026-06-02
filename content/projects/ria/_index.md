---
title: "ria"
description: "A rust version of python-internetarchive"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`ria` is a Rust command-line interface for Archive.org workflows. The project aims to provide a practical, scriptable, and eventually parity-focused alternative to the Python `internetarchive` CLI while keeping the implementation small, observable, and maintainable.

## Ambition

I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate.

## What’s novel

- Opinionated defaults with room for power-user control.
- Tight scope + strong ergonomics (the “small tool, big leverage” approach).

## Highlights

- Provide a native Rust CLI for common Archive.org operations.
- Preserve important operational behavior from the existing Python tooling where that compatibility matters.
- Keep the implementation organized by domain instead of growing a single monolithic CLI file.
- Expose behavior clearly through logging, explicit configuration, and documented compatibility toggles.
- `account`

## Stats

- Project page: /projects/ria/
- Primary language: Rust
- Commits: 37
- Created: 2026-03-30T02:10:06Z
- Last updated: 2026-05-04T02:34:02Z

## Links

- Repo: https://github.com/sguzman/ria
- README: /projects/readme/ria/
- DeepWiki: https://deepwiki.com/sguzman/ria/
