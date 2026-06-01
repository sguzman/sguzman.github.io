---
title: "atmos"
description: "Experiment using toml to configure bevy game stuff"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

Atmos is a Bevy-powered playground where every scene and interaction is driven by TOML. It pairs lightweight configuration with mesh caching, physics, and a handful of action systems so you can prototype novel ideas (like the slicing workflow outlined in `tmp/cut.md`) without rebuilding the engine every time.

## Ambition

Streamline Bevy game development by moving game state and entity configuration into readable, hot-reloadable TOML files.

## What’s novel

- Declarative entity configuration that decouples design from code.
- Advanced TOML schema supporting complex component parameters.
- Experimental hot-reloading for rapid gameplay iteration.

## Highlights

- `Cargo.toml`, `Cargo.lock` – the Bevy/Rapier/serde manifest that bundles the runtime and feature flags.
- `assets/` – runtime content:
- `config.toml` – global settings for the window, camera, debug flags, and mesh cache paths.
- `scenes/` – one folder per scene. Each scene houses:
- `world.toml` – entry point that wires up camera, bounds, gravity, render tweaks, lights, and scene transitions.

## Stats

- Project page: /projects/atmos/
- Primary language: Rust
- Commits: 214
- Created: 2025-12-16T14:31:08Z
- Last updated: 2026-01-20T00:50:12Z

## Links

- Repo: https://github.com/sguzman/atmos
- README: /projects/readme/atmos/
- DeepWiki: https://deepwiki.com/sguzman/atmos/
