---
title: "brazen"
description: "An experimental browser with AI, mcp tools, power-horse features, expose tabs and doms, etc."
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

Brazen is a Rust desktop browser/runtime project built around an `egui` / `eframe` shell, a configurable engine abstraction, and an automation-oriented platform layer. It is not just a browser UI prototype: the repository also contains profile persistence, permissions, a cache/asset plane, extraction helpers, automation APIs, MCP integration seams, and an optional Servo-backed integration path.

## Ambition

Build a 'hacker's browser' where the browser chrome and the content engine are decoupled, allowing for extreme customization and capability-based security.

## What’s novel

- Capability-oriented permission model for granular security control.
- Feature-gated engine seam for swapping rendering backends (Servo-ready).
- Desktop shell built with egui for high-performance UI tools.

## Highlights

- A native desktop shell built with `eframe` / `egui`.
- A `BrowserEngine` abstraction that isolates the shell from the underlying rendering/content engine.
- Session, tab, window, history, zoom, and recovery state management.
- A capability-oriented permission model for operations such as terminal execution, DOM reads, cache reads, file access, and screenshots.
- A cache/asset store with metadata indexing, body capture policy, import/export, and replay-oriented storage primitives.

## Stats

- Project page: /projects/brazen/
- Primary language: Rust
- Commits: 130
- Created: 2026-03-13T06:30:19Z
- Last updated: 2026-05-03T22:19:46Z

## Links

- Repo: https://github.com/sguzman/brazen
- README: /projects/readme/brazen/
- DeepWiki: https://deepwiki.com/sguzman/brazen/
