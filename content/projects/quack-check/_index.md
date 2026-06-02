---
title: "quack-check"
description: "A wrapper around docling for detecting quality of text and producing high quality output transcript"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`quack-check` is a deterministic PDF transcript orchestration tool written in Rust. It sits above the actual extraction backends and makes explicit decisions about:

## Ambition

I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate.

## What’s novel

- Opinionated defaults with room for power-user control.
- Tight scope + strong ergonomics (the “small tool, big leverage” approach).

## Highlights

- how to inspect a PDF before conversion
- which extraction path to use
- when to split a document into chunks
- how to merge chunk output into a stable final transcript
- which metadata and audit artifacts to keep

## Stats

- Project page: /projects/quack-check/
- Primary language: Rust
- Commits: 17
- Created: 2026-02-13T20:05:07Z
- Last updated: 2026-05-04T02:11:24Z

## Links

- Repo: https://github.com/sguzman/quack-check
- README: /projects/readme/quack-check/
- DeepWiki: https://deepwiki.com/sguzman/quack-check/
