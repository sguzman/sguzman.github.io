---
title: "mathematica-mcp"
description: "Rust based mcp integration for mathemathica"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

`mathematica-mcp` is a Rust MCP server that exposes a local Wolfram Language / Mathematica kernel over stdio. It is intended for MCP-compatible clients that need symbolic computation, numerical evaluation, finance lookups, or notebook-style experimentation backed by a real local kernel instead of a remote API.

## Ambition

Enable LLMs and agentic systems to access the deep computational power of Mathematica through a standardized, tool-oriented interface.

## What’s novel

- Session-based Wolfram Language execution via WSTP.
- High-level financial data APIs for real-time market lookups.
- Automatic serialization of complex symbolic results for LLM consumption.

## Highlights

- Create a kernel-backed session.
- Execute arbitrary Wolfram Language code inside a specific session.
- Close a session and release its resources.
- List active sessions and their idle times.
- Return current local and UTC time.

## Stats

- Project page: /projects/mathematica-mcp/
- Primary language: Rust
- Commits: 28
- Created: 2026-02-01T06:28:37Z
- Last updated: 2026-05-03T23:51:11Z

## Links

- Repo: https://github.com/sguzman/mathematica-mcp
- README: /projects/readme/mathematica-mcp/
- DeepWiki: https://deepwiki.com/sguzman/mathematica-mcp/
