---
title: "pulsewire"
description: "A redo of rss poll/fetcher/storage in rust"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

<a href="#"><img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/palette/macchiato.png" width="600px"/></a>

## Ambition

I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate.

## What’s novel

- Opinionated defaults with room for power-user control.
- Tight scope + strong ergonomics (the “small tool, big leverage” approach).

## Highlights

- Fetcher loads app/domain/feed config from a TOML bundle, migrates/creates a
- Scheduler ticks every 5s, finds due feeds, and processes them with bounded
- Each feed alternates HEAD/GET based on last state. HEAD decides whether
- Server provides auth, subscriptions, read/unread state, folders, favorites,
- `crates/core/src/` – shared runtime logic (config, scheduler, infra, ports,

## Stats

- Project page: /projects/pulsewire/
- Primary language: Rust
- Commits: 319
- Created: 2025-12-16T06:49:36Z
- Last updated: 2026-03-17T12:50:53Z

## Links

- Repo: https://github.com/sguzman/pulsewire
- README: /projects/readme/pulsewire/
- DeepWiki: https://deepwiki.com/sguzman/pulsewire/
