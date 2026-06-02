---
title: "chunkr"
description: "end to end pipeline for taking text -> normalizing -> chunking -> inserting into quickwit or qdrant"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`chunkr` is a Rust CLI for turning an ebook library into search- and retrieval-ready text artifacts. It extracts text and metadata from Calibre-managed books, normalizes and chunks that text, generates embeddings through an HTTP provider, and inserts the resulting records into downstream systems such as Qdrant and Quickwit.

## Ambition

Build a high-throughput data pipeline for RAG (Retrieval-Augmented Generation) systems that can process and index millions of documents with precision.

## What’s novel

- End-to-end normalization and chunking optimized for LLM contexts.
- Native integration for Quickwit and Qdrant vector databases.
- High-performance Rust implementation for massive document throughput.

## Highlights

- Extract `.epub` and `.pdf` content from a Calibre library tree.
- Preserve book-level metadata in JSON sidecars during extraction.
- Normalize text before chunking, including Unicode cleanup and whitespace collapsing.
- Produce JSONL chunk records with stable metadata fields and per-chunk offsets.
- Generate embeddings through a configurable HTTP embedding provider.

## Stats

- Project page: /projects/chunkr/
- Primary language: Rust
- Commits: 610
- Created: 2026-01-29T10:17:54Z
- Last updated: 2026-05-03T21:44:58Z

## Links

- Repo: https://github.com/sguzman/chunkr
- README: /projects/readme/chunkr/
- DeepWiki: https://deepwiki.com/sguzman/chunkr/
