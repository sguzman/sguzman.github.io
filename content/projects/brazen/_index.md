---
title: "brazen"
description: "An experimental browser with AI, mcp tools, power-horse features, expose tabs and doms, etc."
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

Brazen is a Rust browser-platform skeleton built around an `egui`/`eframe` shell and a future Servo-backed content engine. The current repo is intentionally the first durable platform layer: configuration, runtime paths, tracing, a capability-oriented permission model, a feature-gated engine seam, and tests that keep those pieces stable while the rendering backend evolves.

## Ambition

Build a 'hacker's browser' where the browser chrome and the content engine are decoupled, allowing for extreme customization and capability-based security.

## What’s novel

- Capability-oriented permission model for granular security control.
- Feature-gated engine seam for swapping rendering backends (Servo-ready).
- Desktop shell built with egui for high-performance UI tools.

## Highlights

- one workspace/tab model
- an address bar and basic command routing
- backend status and placeholder content viewport
- permission and log panels
- comprehensive TOML configuration

## Stats

- Project page: /projects/brazen/
- Primary language: Rust
- Commits: 128
- Created: 2026-03-13T06:30:19Z
- Last updated: 2026-04-29T15:21:15Z

## Links

- Repo: https://github.com/sguzman/brazen
- README: /projects/readme/brazen/
- DeepWiki: https://deepwiki.com/sguzman/brazen/
