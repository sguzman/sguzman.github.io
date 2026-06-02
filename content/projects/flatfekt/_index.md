---
title: "flatfekt"
description: "A bevy based 2D custom environment that lets you configure scenes with toml to exquisite detail"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`flatfekt` is a Rust workspace for a TOML-driven 2D Bevy scene runner and simulation environment. Scenes, playback, simulation, and export inputs are declared in TOML; engine behavior, feature flags, limits, paths, and operational policy are centralized in a control-pane config.

## Ambition

Create a flexible platform for simulations, motion graphics, and interactive sketches that separates content (TOML) from runtime (Bevy/Rust).

## What’s novel

- Schema-first approach with a Bevy-free core library for scene validation.
- Declarative TOML-based scene definitions.
- High-level engine layer for complex choreography and transitions.

## Highlights

- Scene content is TOML-first.
- Project policy and tunables live in `.config/flatfekt/flatfekt.toml`.
- Wayland is the default Unix graphics environment.
- Vulkan is required; GUI apps fail fast if no Vulkan adapter is available.
- Cache and derived artifacts are stored under `.cache/flatfekt/`.

## Stats

- Project page: /projects/flatfekt/
- Primary language: Rust
- Commits: 87
- Created: 2026-04-17T00:38:34Z
- Last updated: 2026-05-03T23:05:06Z

## Links

- Repo: https://github.com/sguzman/flatfekt
- README: /projects/readme/flatfekt/
- DeepWiki: https://deepwiki.com/sguzman/flatfekt/
