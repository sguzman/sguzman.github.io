+++
title = "browsr README"
description = "README mirror for browsr"
draft = false
+++

[Repository](https://github.com/sguzman/browsr) | [DeepWiki](https://deepwiki.com/sguzman/browsr/)

# browsr

`browsr` is a local HTTP and WebSocket bridge for live browser session introspection, designed to pair with a Chromium/Edge extension.

## Intent

Expose a stable local service that can broker browser state and tab snapshots to multiple clients without each client needing to speak directly to the extension protocol.

## Ambition

Based on the split between API, protocol, state, and WebSocket integration, the project appears to be moving toward a dependable local browser-observation service that can feed downstream tooling, automation, or indexing systems.

## Current Status

The codebase already has an HTTP API, protocol/state modules, Docker assets, config support, and extension-oriented documentation. It looks usable for local workflows now.

## Core Capabilities Or Focus Areas

- Local HTTP endpoints for browser-derived data.
- WebSocket bridge for extension communication.
- Configurable runtime behavior.
- Containerization support via `Dockerfile` and `docker-compose.yml`.
- Separation between protocol definitions and service state.

## Project Layout

- `config/`: checked-in runtime configuration and configuration examples.
- `src/`: Rust source for the main crate or application entrypoint.
- `Cargo.toml`: crate or workspace manifest and the first place to check for package structure.

## Setup And Requirements

- Rust toolchain.
- A compatible browser extension/client setup.
- Optional Docker tooling for containerized runs.

## Build / Run / Test Commands

```bash
cargo build
cargo test
cargo run
docker compose up --build
```

## Notes, Limitations, Or Known Gaps

- The useful behavior depends on a cooperating extension or browser-side client.
- This project is a bridge/service, not a standalone browser automation UI.

## Next Steps Or Roadmap Hints

- Harden API contracts and auth/runtime boundaries if this service will be shared across more tools.
- Document extension/client compatibility guarantees more explicitly as the protocol stabilizes.
