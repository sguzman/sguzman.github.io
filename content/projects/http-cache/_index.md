---
title: "http-cache"
description: "a forward proxy for heavy caching"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

Async forward proxy with HTTP/1.1 absolute-form support and HTTPS tunneling via CONNECT. Built with Tokio + Hyper, structured logging via tracing, and SQLite-backed caching.

## Ambition

I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate.

## What’s novel

- Opinionated defaults with room for power-user control.
- Tight scope + strong ergonomics (the “small tool, big leverage” approach).

## Highlights

- M1: HTTP forward proxy (GET/POST) without CONNECT
- M2: CONNECT tunnel support
- M3: Connection pooling (optional)
- M4: Real caching implementation
- M5: Metrics endpoint and exporters

## Stats

- Project page: /projects/http-cache/
- Primary language: Rust
- Commits: 24
- Created: 2026-03-08T05:17:36Z
- Last updated: 2026-03-09T21:48:52Z

## Links

- Repo: https://github.com/sguzman/http-cache
- README: /projects/readme/http-cache/
- DeepWiki: https://deepwiki.com/sguzman/http-cache/
