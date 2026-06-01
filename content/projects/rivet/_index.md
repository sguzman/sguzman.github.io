---
title: "rivet"
description: "Taskwarrior-like plus extra features like gui, calendar view/sync"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

Rivet is a Rust-first Taskwarrior port with two layers:

## Ambition

I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate.

## What’s novel

- Opinionated defaults with room for power-user control.
- Tight scope + strong ergonomics (the “small tool, big leverage” approach).

## Highlights

- A CLI-compatible core (`task`) focused on Taskwarrior-style workflows.
- A desktop GUI layer built with Rust + TypeScript/React + Tailwind + Material UI + Tauri on top of the same core data model.
- `crates/rivet-core`: task engine, parsing, datastore, filters, renderer, command dispatch.
- `crates/rivet-cli`: `task` binary.
- `crates/rivet-parity`: parity harness that compares Rivet results to Taskwarrior.

## Stats

- Project page: /projects/rivet/
- Primary language: TypeScript
- Commits: 126
- Created: 2026-02-16T04:11:41Z
- Last updated: 2026-04-25T11:05:36Z

## Links

- Repo: https://github.com/sguzman/rivet
- README: /projects/readme/rivet/
- DeepWiki: https://deepwiki.com/sguzman/rivet/
