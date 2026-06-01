---
title: "typr"
description: "Type theory experiments"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`typr` is an experimental Rust REPL for a signature-first type theory calculator.

## Ambition

Create an experimental REPL for signature-first type theory, allowing functions to be treated as interface objects that compose before implementation.

## What’s novel

- Implements structural query inference and ad-hoc boolean answers (any, all, is) over list expressions.
- Supports multiple equivalence modes including syntactic, semantic, permutation, set, and canonical.
- Features a fallback evaluator for concrete answers when structural inference is insufficient.

## Highlights

- Functions as interface objects (`In(f)`, `Out(f)`) that compose before implementation.
- Reified arithmetic operator bodies (`add`, `mul`, `pow`, `comp`, `seq`).
- Container lifting via `map` over list expressions.
- Refinement constructors for list structure: `sort`, `unique`, `canon`.
- Structural query inference and ad hoc boolean answers (`any`, `all`, `is`).

## Stats

- Project page: /projects/typr/
- Primary language: Rust
- Commits: 5
- Created: 2026-02-22T08:18:01Z
- Last updated: 2026-02-22T08:18:19Z

## Links

- Repo: https://github.com/sguzman/typr
- README: /projects/readme/typr/
- DeepWiki: https://deepwiki.com/sguzman/typr/
