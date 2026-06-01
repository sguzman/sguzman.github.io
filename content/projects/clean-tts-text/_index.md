---
title: "clean-tts-text"
description: "A preprocessing project to clean up and normal;ize text to be fed into a tts engine for clean, stable output"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

A tiny Rust CLI that normalizes text before passing it into an XTTS-style TTS engine so narration stays clean, paced, and predictable. The tool unwraps hard line wraps, removes citation noise, flattens list markers, expands troublesome acronyms, and applies other tiny transformations that can be the difference between multi-second gaps and a smooth read.

## Ambition

Eliminate the 'robotic' artifacts and awkward pauses in AI-generated narration by providing a robust, rule-based text normalization pipeline.

## What’s novel

- Pacing Optimization: Specialized logic to flatten lists and normalize punctuation to ensure smooth narration rhythm.
- Context-Aware Expansion: Intelligent acronym and brand expansion tailored for natural speech.
- Configurable Narratives: TOML-driven profiles allow switching between minimalist and expressive normalization styles.

## Highlights

- `[io]` controls newline normalization and whether paragraphs are collapsed to one line per paragraph (recommended for audiobook engines).
- `[structure]` determines how wrapped lines are joined and which blank-line patterns mark paragraph boundaries.
- `[markdown]` and `[citations]` strip code fences, inline backticks, markdown links, and numeric footnotes/brackets.
- `[lists]` replaces bullets with commas to avoid choppy readings of enumerations.
- `[whitespace]`, `[guardrails]`, and `[experimental]` govern spacing collapses, warning thresholds, and optional punctuation-ray trimming.

## Stats

- Project page: /projects/clean-tts-text/
- Primary language: Rust
- Commits: 18
- Created: 2026-02-03T15:53:13Z
- Last updated: 2026-02-11T07:22:34Z

## Links

- Repo: https://github.com/sguzman/clean-tts-text
- README: /projects/readme/clean-tts-text/
- DeepWiki: https://deepwiki.com/sguzman/clean-tts-text/
