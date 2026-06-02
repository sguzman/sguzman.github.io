---
title: "num-chrunchr"
description: "Factorize and compress numbers"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`num-chrunchr` is a Rust CLI for working with very large integers when the useful question is not always "can I fully factor this in RAM?" but "what can I learn about this number with the representation and compute budget I actually have?"

## Ambition

I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate.

## What’s novel

- Opinionated defaults with room for power-user control.
- Tight scope + strong ergonomics (the “small tool, big leverage” approach).

## Highlights

- use the cheapest representation that still supports the next operation;
- stream from disk when materializing a full big integer is unnecessary or too expensive;
- emit structure reports and compressed descriptions even when full factorization is impractical.
- streaming decimal operations on numbers stored as text files;
- loading moderately sized values into `BigUint` when an in-memory upgrade is reasonable;

## Stats

- Project page: /projects/num-chrunchr/
- Primary language: Rust
- Commits: 73
- Created: 2026-01-31T09:29:16Z
- Last updated: 2026-05-03T23:54:15Z

## Links

- Repo: https://github.com/sguzman/num-chrunchr
- README: /projects/readme/num-chrunchr/
- DeepWiki: https://deepwiki.com/sguzman/num-chrunchr/
