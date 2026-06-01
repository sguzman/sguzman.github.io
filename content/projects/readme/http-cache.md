+++
title = "http-cache README"
description = "README mirror for http-cache"
draft = false
+++

[Repository](https://github.com/sguzman/http-cache) | [DeepWiki](https://deepwiki.com/sguzman/http-cache/)

# HTTP Forward Proxy (Rust)

Async forward proxy with HTTP/1.1 absolute-form support and HTTPS tunneling via CONNECT. Built with Tokio + Hyper, structured logging via tracing, and SQLite-backed caching.

## Milestones
- M1: HTTP forward proxy (GET/POST) without CONNECT
- M2: CONNECT tunnel support
- M3: Connection pooling (optional)
- M4: Real caching implementation
- M5: Metrics endpoint and exporters

M1, M2, and a meaningful M4 slice are implemented in this workspace, with tests.

## Current State
- Implemented:
  - HTTP/1.1 forward proxying for absolute-form requests
  - CONNECT tunneling for HTTPS pass-through
  - SQLite-backed on-disk cache for cacheable GET and HEAD responses
  - LRU-style eviction by `last_access`
  - Cache replay, expiry handling, and invalidation of missing body files
  - Structured logging with request timing, request ID control, and header redaction
  - Request header and body size enforcement
- Not implemented:
  - Reverse proxy routing
  - HTTPS asset caching through TLS termination or interception
  - Upstream connection pooling
  - Full RFC-grade HTTP cache semantics such as revalidation, `Vary`, or stale directives
  - Metrics/exporters

## Caching Notes
- Cache writes are only attempted for successful GET and HEAD responses.
- Cache expiry currently uses local TTL plus `Cache-Control: no-store`, `no-cache`, `max-age`, and `Expires`.
- Range requests and `206 Partial Content` responses bypass caching.
- HEAD responses are cached as metadata-only entries and replay without a body.
- Request bodies are rejected when they exceed the configured limit.
- HTTPS traffic carried through CONNECT is not decrypted, so HTTPS asset bodies are not cacheable in the current architecture.

## Layout
- `src/main.rs` entrypoint
- `src/config.rs` config parsing
- `src/server.rs` listener + routing
- `src/http_proxy.rs` HTTP forward proxy
- `src/connect_tunnel.rs` CONNECT tunneling
- `src/policy.rs` allow/deny policy engine
- `src/headers.rs` hop-by-hop header stripping
- `src/cache.rs` cache trait + SQLite + NoopCache
- `src/obs.rs` tracing setup
- `src/errors.rs` error mapping
- `tests/integration.rs` integration tests
- `config.toml` example config

## Running
- Start the proxy with the default config: `cargo run`
- Use a custom config path: `cargo run -- ./path/to/config.toml`
- Example configs are available under `configs/dev.toml`, `configs/test.toml`, and `configs/prod.toml`

## Tests
- Run all tests: `cargo test`

## Notes
- CONNECT tunnels create a TCP pipe; no TLS interception.
- Streaming is end-to-end; bodies are not buffered.
- Request headers and request bodies are rejected when they exceed configured limits.
- Hop-by-hop headers and Proxy-Authorization are stripped before forwarding.
- Cache uses SQLite metadata in `.cache/cache.sqlite` with LRU eviction, and stores bodies under `.cache/objects/`.
- In dev mode the process clears `.cache` on startup.
