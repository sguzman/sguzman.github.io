---
title: "xpos-js"
description: "Simple extension to act as a sort of server endpoint for live tabs on browser"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

MV3 extension for Edge/Chromium that exposes live tab and window introspection to a local self-hosted server over WebSocket.

## Ambition

I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate.

## What’s novel

- Opinionated defaults with room for power-user control.
- Tight scope + strong ergonomics (the “small tool, big leverage” approach).

## Highlights

- Streams live tab/window events across all browser windows.
- Handles server commands to list windows, list tabs, snapshot a tab's DOM/HTML/text, and manipulate tabs.
- Supports debugger-backed `import-bundle` jobs that reload a tab, capture asset bodies, and expose a reconstructable bundle manifest.
- Uses structured trace logging with timestamps and trace IDs for all lifecycle, socket, and command operations.
- Provides an options page for runtime config.

## Stats

- Project page: /projects/xpos-js/
- Primary language: JavaScript
- Commits: 25
- Created: 2026-03-05T17:04:56Z
- Last updated: 2026-03-10T04:36:25Z

## Links

- Repo: https://github.com/sguzman/xpos-js
- README: /projects/readme/xpos-js/
- DeepWiki: https://deepwiki.com/sguzman/xpos-js/
