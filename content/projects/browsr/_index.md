---
title: "browsr"
description: "Http server integrating browser tab data from my previous extension project xpose"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`browsr` is a local HTTP + WebSocket bridge for live browser session introspection.

## Ambition

I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate.

## What’s novel

- Opinionated defaults with room for power-user control.
- Tight scope + strong ergonomics (the “small tool, big leverage” approach).

## Highlights

- The extension connects to `browsr` over WebSocket.
- `browsr` exposes stable HTTP endpoints for multiple local clients.
- Clients can list windows/tabs and request tab snapshots (HTML/text/selection).
- `xpose` extension -> WebSocket -> `browsr` (`/ws`)
- client apps / CLI / GUI -> HTTP -> `browsr` (`/v1/...`)

## Stats

- Project page: /projects/browsr/
- Primary language: Rust
- Commits: 10
- Created: 2026-03-05T17:21:50Z
- Last updated: 2026-03-10T00:44:25Z

## Links

- Repo: https://github.com/sguzman/browsr
- README: /projects/readme/browsr/
- DeepWiki: https://deepwiki.com/sguzman/browsr/
