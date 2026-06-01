---
title: "chunkr"
description: "end to end pipeline for taking text -> normalizing -> chunking -> inserting into quickwit or qdrant"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

Chunkr is a CLI for extracting text + metadata from Calibre libraries, cleaning and chunking that text, and inserting the resulting chunks into Qdrant and Quickwit. Configuration is centralized in a single TOML file so that all properties, policies, and paths are controlled in one place.

## Ambition

Build a high-throughput data pipeline for RAG (Retrieval-Augmented Generation) systems that can process and index millions of documents with precision.

## What’s novel

- End-to-end normalization and chunking optimized for LLM contexts.
- Native integration for Quickwit and Qdrant vector databases.
- High-performance Rust implementation for massive document throughput.

## Highlights

- Deterministic, idempotent extraction from Calibre (skip already-processed
- Robust handling for large EPUB/PDF files (chunk during extraction to avoid
- Clean, normalized text and metadata-enriched chunks for downstream search and
- Straightforward insertion into Qdrant + Quickwit with sensible defaults.
- Extensive logging for long-running pipelines.

## Stats

- Project page: /projects/chunkr/
- Primary language: Rust
- Commits: 608
- Created: 2026-01-29T10:17:54Z
- Last updated: 2026-02-09T21:06:24Z

## Links

- Repo: https://github.com/sguzman/chunkr
- README: /projects/readme/chunkr/
- DeepWiki: https://deepwiki.com/sguzman/chunkr/
