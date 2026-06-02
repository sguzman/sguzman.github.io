---
title: "chatgpt-tool-shim"
description: "A Chrome/Edge extension that augments the ChatGPT website with client-side pseudo-tool-calling"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

ChatGPT Tool Shim is a Chrome/Edge extension that adds client-side pseudo-tool-calling to the ChatGPT website. It watches visible assistant output for structured `<tool_call>` blocks, executes allowlisted browser or local tools through the extension runtime, and injects `<tool_result>` blocks back into the conversation.

## Ambition

Add practical, client-side pseudo-tool-calling to the ChatGPT web app so advanced workflows can happen directly in the browser without waiting on first-party product changes.

## What’s novel

- Injects tool-style workflows into the existing ChatGPT web interface from a browser extension.
- Keeps the logic client-side instead of relying on a separate hosted backend.
- Explores a lightweight bridge between conversational UI and structured action execution.

## Highlights

- Initial target: `chatgpt.com` and `chat.openai.com`
- Phase 1: extension-only runtime
- Phase 2: optional localhost bridge
- Non-goals: true backend tools, model-side MCP, arbitrary automation, multi-provider adapter system
- Tools are explicitly allowlisted.

## Stats

- Project page: /projects/chatgpt-tool-shim/
- Primary language: TypeScript
- Commits: 10
- Created: 2026-05-08T20:30:28Z
- Last updated: 2026-05-29T16:12:21Z

## Links

- Repo: https://github.com/sguzman/chatgpt-tool-shim
- README: /projects/readme/chatgpt-tool-shim/
- DeepWiki: https://deepwiki.com/sguzman/chatgpt-tool-shim/
