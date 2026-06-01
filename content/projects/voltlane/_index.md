---
title: "voltlane"
description: "a chiptune/midi composer app (based off of furnace and fl-studio)"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

Voltlane is a Rust-first FL-style/chiptune composition prototype built with:

## Ambition

I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate.

## What’s novel

- Opinionated defaults with room for power-user control.
- Tight scope + strong ergonomics (the “small tool, big leverage” approach).

## Highlights

- `voltlane-core` (Rust): project model, timeline engine, export pipeline, parity tooling, and tracing.
- `src-tauri` (Rust/Tauri): desktop shell and typed command bridge to the core.
- `ui` (React + TypeScript + CSS): lightweight visual playlist/mixer control surface.
- Rust domain model for projects, tracks, clips, effects, transport, and notes.
- Command-style engine API for:

## Stats

- Project page: /projects/voltlane/
- Primary language: Rust
- Commits: 16
- Created: 2026-02-23T10:33:41Z
- Last updated: 2026-02-23T13:51:07Z

## Links

- Repo: https://github.com/sguzman/voltlane
- README: /projects/readme/voltlane/
- DeepWiki: https://deepwiki.com/sguzman/voltlane/
