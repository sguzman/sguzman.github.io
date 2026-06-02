---
title: "fathrs"
description: "Dead simple sym linking"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`fathrs` is a small Rust CLI for deploying dotfiles and similar filesystem artifacts from a declarative `links.toml` file. It reads source-to-target mappings, resolves them relative to a configurable base directory, and then creates symlinks or copies files/directories into place.

## Ambition

A lightweight, zero-dependency alternative to complex dotfile managers for managing system symlinks.

## What’s novel

- Minimalist design focused on speed and operational simplicity.
- Clear TOML-based mapping for system-wide symlink management.
- Written in Rust for guaranteed performance and reliability.

## Highlights

- Reads link definitions from a TOML config.
- Creates symlinks for files or directories.
- Supports replacing existing destinations with `--force`.
- Supports dry runs before touching the filesystem.
- Can probe configured destinations and report their current state.

## Stats

- Project page: /projects/fathrs/
- Primary language: Rust
- Commits: 49
- Created: 2026-01-16T19:23:07Z
- Last updated: 2026-05-03T22:47:19Z

## Links

- Repo: https://github.com/sguzman/fathrs
- README: /projects/readme/fathrs/
- DeepWiki: https://deepwiki.com/sguzman/fathrs/
