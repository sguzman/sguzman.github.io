+++
title = "browsr README"
description = "README mirror for browsr"
draft = false
+++

[Repository](https://github.com/sguzman/browsr) | [DeepWiki](https://deepwiki.com/sguzman/browsr/)

# browsr

`browsr` is a local HTTP + WebSocket bridge for live browser session introspection.

It is designed to work with the `xpose` Edge/Chromium extension:
- The extension connects to `browsr` over WebSocket.
- `browsr` exposes stable HTTP endpoints for multiple local clients.
- Clients can list windows/tabs and request tab snapshots (HTML/text/selection).

## Architecture

- `xpose` extension -> WebSocket -> `browsr` (`/ws`)
- client apps / CLI / GUI -> HTTP -> `browsr` (`/v1/...`)

`browsr` sends command envelopes to the extension:
- `list_windows`
- `list_tabs`
- `snapshot_tab`
- `start_import_bundle`
- `get_import_bundle_status`
- `get_import_bundle_manifest`
- `get_import_bundle_asset`
- `cancel_import_bundle`

The extension responds with structured `response` messages, which `browsr` correlates by request id.

## Features

- Multi-client local HTTP API
- Real-time extension session bridge over WebSocket
- Read and manipulate live tabs in the current browser session
- Support heavy debugger-backed tab bundle capture jobs
- Command/response correlation with timeout handling
- In-memory caching of hello/windows/tabs and recent events
- Structured tracing logs
- File-based config with env overrides
- Container support (minimal runtime image)

## Requirements

- Rust toolchain (for local build/run)
- Edge/Chromium with `xpose` extension loaded and granted site access
- `jq` recommended for readable CLI output

## Configuration

Default config file: `config/server.toml`

```toml
bind_host = "127.0.0.1"
port = 17373
ws_path = "/ws"
request_timeout_ms = 8000
max_incoming_ws_bytes = 20000000
recent_events_limit = 500
```

Env overrides:
- `BROWSR_CONFIG`
- `BROWSR_HOST`
- `BROWSR_PORT`
- `BROWSR_WS_PATH`
- `BROWSR_REQUEST_TIMEOUT_MS`
- `BROWSR_MAX_WS_BYTES`
- `BROWSR_EVENTS_LIMIT`

## Run Locally

```bash
cargo run
```

Release:

```bash
cargo run --release
```

Build only:

```bash
cargo check
cargo build --release
```

## Docker

### Build image

```bash
docker build -t browsr:local .
```

### Run image

```bash
docker run --rm -p 17373:17373 \
  -v "$(pwd)/config/server.toml:/config/server.toml:ro" \
  -e BROWSR_CONFIG=/config/server.toml \
  --name browsr \
  browsr:local
```

### Docker Compose

```bash
docker compose up --build -d
docker compose logs -f browsr
docker compose down
```

## Extension Setup (`xpose`)

1. Load `xpose` unpacked in Edge (`edge://extensions`).
2. Ensure endpoint is:
   - `ws://127.0.0.1:17373/ws`
3. Keep site access enabled (`On all sites` recommended for full coverage).
4. Start `browsr`.
5. Verify connection:

```bash
curl -sS http://127.0.0.1:17373/health | jq
```

Expected: `"extension_connected": true`

## HTTP API

Base URL: `http://127.0.0.1:17373`

### `GET /health`

Server liveness + extension connectivity.

```bash
curl -sS http://127.0.0.1:17373/health | jq
```

### `GET /v1/status`

Detailed runtime state:
- extension connection timestamps
- pending request count
- cached hello/windows/tabs

```bash
curl -sS http://127.0.0.1:17373/v1/status | jq
```

### `GET /v1/windows`

Fetch windows from extension.

```bash
curl -sS http://127.0.0.1:17373/v1/windows | jq
```

### `GET /v1/tabs`

Returns tabs from cache (or refreshes if empty).

Query params:
- `window_id` (optional)
- `q` (optional, case-insensitive title/url search)
- `refresh` (optional boolean, force extension call)

Examples:

```bash
curl -sS http://127.0.0.1:17373/v1/tabs | jq
curl -sS "http://127.0.0.1:17373/v1/tabs?q=tradingview" | jq
curl -sS "http://127.0.0.1:17373/v1/tabs?window_id=1828091131" | jq
curl -sS "http://127.0.0.1:17373/v1/tabs?refresh=true" | jq
```

### `GET /v1/tabs/active`

Returns the active tab from the focused window or a specific window.

```bash
curl -sS http://127.0.0.1:17373/v1/tabs/active | jq
curl -sS "http://127.0.0.1:17373/v1/tabs/active?window_id=1828091131" | jq
```

### `GET /v1/tabs/{tab_id}`

Returns lightweight live state for a single tab without DOM extraction.

```bash
TAB_ID=1828085583
curl -sS "http://127.0.0.1:17373/v1/tabs/$TAB_ID" | jq
```

### `POST /v1/tabs/refresh`

Force refresh tab cache from extension.

```bash
curl -sS -X POST http://127.0.0.1:17373/v1/tabs/refresh | jq
```

### `POST /v1/tabs/open`

Open a new tab in the live browser session.

```bash
curl -sS -X POST http://127.0.0.1:17373/v1/tabs/open \
  -H 'content-type: application/json' \
  -d '{"url":"https://example.com","active":true}' | jq
```

### `POST /v1/tabs/{tab_id}/focus`

Focus a tab and its containing window.

```bash
TAB_ID=1828085583
curl -sS -X POST "http://127.0.0.1:17373/v1/tabs/$TAB_ID/focus" | jq
```

### `POST /v1/tabs/{tab_id}/reload`

Reload a tab.

```bash
TAB_ID=1828085583
curl -sS -X POST "http://127.0.0.1:17373/v1/tabs/$TAB_ID/reload" \
  -H 'content-type: application/json' \
  -d '{"bypass_cache":false,"wait_for_complete":true}' | jq
```

### `POST /v1/tabs/{tab_id}/move`

Move a tab within its current window or to another window.

```bash
TAB_ID=1828085583
curl -sS -X POST "http://127.0.0.1:17373/v1/tabs/$TAB_ID/move" \
  -H 'content-type: application/json' \
  -d '{"index":0}' | jq
```

### `POST /v1/tabs/{tab_id}/close`

Close a tab.

```bash
TAB_ID=1828085583
curl -sS -X POST "http://127.0.0.1:17373/v1/tabs/$TAB_ID/close" | jq
```

### `POST /v1/tab-groups`

Create or update a tab group.

```bash
curl -sS -X POST http://127.0.0.1:17373/v1/tab-groups \
  -H 'content-type: application/json' \
  -d '{
    "tab_ids":[1828085583,1828091599],
    "group_properties":{"title":"Research","color":"blue","collapsed":false}
  }' | jq
```

### `POST /v1/tabs/{tab_id}/snapshot`

Snapshot a tab with selectable payload parts.

Request body:
- `include_html` (bool, default `true`)
- `include_text` (bool, default `true`)
- `include_selection` (bool, default `true`)

Examples:

```bash
TAB_ID=1828085583

curl -sS -X POST "http://127.0.0.1:17373/v1/tabs/$TAB_ID/snapshot" \
  -H 'content-type: application/json' \
  -d '{"include_html":false,"include_text":true,"include_selection":true}' | jq

curl -sS -X POST "http://127.0.0.1:17373/v1/tabs/$TAB_ID/snapshot" \
  -H 'content-type: application/json' \
  -d '{"include_html":true,"include_text":true,"include_selection":true}' \
  | jq '{tabId,title,url,html_len:(.html|length),text_len:(.text|length)}'
```

Snapshot response includes:
- metadata: `tabId`, `title`, `url`, `lang`, `readyState`, timestamps
- payload: `html`, `text`, `selection`
- truncation stats: `truncation.html/text/selection`

### Import Bundles

Use import bundles for heavier archival-style capture where clients need the
document plus loaded assets, not just a DOM snapshot.

Recommended flow:
1. Start a job with `POST /v1/tabs/{tab_id}/import-bundles`
2. Poll `GET /v1/import-bundles/{job_id}`
3. Fetch the manifest from `GET /v1/import-bundles/{job_id}/manifest`
4. Fetch assets from `GET /v1/import-bundles/{job_id}/assets/{asset_id}`

If your client does not want to poll itself, use one of the wait endpoints:
- `POST /v1/tabs/{tab_id}/import-bundles/wait`
- `GET /v1/import-bundles/{job_id}/wait`

### `POST /v1/tabs/{tab_id}/import-bundles`

Start a heavy import-bundle capture job.

```bash
TAB_ID=1828093415
curl -sS -X POST "http://127.0.0.1:17373/v1/tabs/$TAB_ID/import-bundles" \
  -H 'content-type: application/json' \
  -d '{
    "reload": true,
    "capture_html": true,
    "capture_assets": true,
    "capture_text": true,
    "capture_selection": true,
    "capture_screenshot": false,
    "wait_for_network_idle_ms": 1500,
    "settle_timeout_ms": 30000,
    "max_asset_bytes": 5000000,
    "max_total_bytes": 75000000
  }' | jq
```

### `GET /v1/import-bundles/{job_id}`

Get current job status.

```bash
JOB_ID="imp_abc123"
curl -sS "http://127.0.0.1:17373/v1/import-bundles/$JOB_ID" | jq
```

### `GET /v1/import-bundles/{job_id}/wait`

Wait until an existing import-bundle job reaches a terminal state.

Query params:
- `timeout_ms` optional, default `120000`
- `poll_interval_ms` optional, default `500`
- `include_manifest` optional, default `true`

```bash
curl -sS "http://127.0.0.1:17373/v1/import-bundles/$JOB_ID/wait?timeout_ms=120000&include_manifest=true" | jq
```

Returns:
- `{ "job": ... }` for `failed` or `cancelled`
- `{ "job": ..., "manifest": ... }` for `completed` when `include_manifest=true`

### `POST /v1/tabs/{tab_id}/import-bundles/wait`

Start a bundle job and block until it reaches a terminal state.

This is the simplest client path when you want one request to kick off capture and wait for completion.

```bash
TAB_ID=1828093415
curl -sS -X POST "http://127.0.0.1:17373/v1/tabs/$TAB_ID/import-bundles/wait" \
  -H 'content-type: application/json' \
  -d '{
    "reload": true,
    "capture_html": true,
    "capture_assets": true,
    "capture_text": true,
    "capture_selection": true,
    "wait_timeout_ms": 120000,
    "poll_interval_ms": 500,
    "include_manifest": true
  }' | jq
```

### `GET /v1/import-bundles/{job_id}/manifest`

Fetch the completed bundle manifest.

```bash
curl -sS "http://127.0.0.1:17373/v1/import-bundles/$JOB_ID/manifest" | jq
```

Manifest includes:
- `bundle.tab`
- `bundle.document`
- `bundle.capture`
- `bundle.screenshot`
- `bundle.assets`
- `bundle.export`

### `GET /v1/import-bundles/{job_id}/assets/{asset_id}`

Fetch a bundle asset. Supports chunked retrieval with `offset` and `length`.

```bash
ASSET_ID="document"
curl -sS "http://127.0.0.1:17373/v1/import-bundles/$JOB_ID/assets/$ASSET_ID" | jq

curl -sS "http://127.0.0.1:17373/v1/import-bundles/$JOB_ID/assets/$ASSET_ID?offset=0&length=65536" | jq
```

Special asset ids exposed by the extension:
- `document`
- `screenshot` when screenshot capture is enabled

### `POST /v1/import-bundles/{job_id}/cancel`

Cancel a running import-bundle job.

```bash
curl -sS -X POST "http://127.0.0.1:17373/v1/import-bundles/$JOB_ID/cancel" | jq
```

## Error Model

Errors use:

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "details"
  }
}
```

Common codes:
- `EXTENSION_NOT_CONNECTED` (`503`)
- `EXTENSION_DISCONNECTED` (`503`)
- `EXTENSION_TIMEOUT` (`504`)
- `EXTENSION_ERROR` (`502`)
- `COMMAND_SERIALIZATION_FAILED` (`500`)

Import-bundle failures may surface extension-originated codes such as:
- `IMPORT_BUNDLE_ATTACH_FAILED`
- `IMPORT_BUNDLE_TIMEOUT`
- `IMPORT_BUNDLE_CANCELLED`
- `IMPORT_BUNDLE_RELOAD_FAILED`
- `IMPORT_BUNDLE_BODY_UNAVAILABLE`
- `IMPORT_BUNDLE_SIZE_LIMIT_EXCEEDED`
- `HOST_PERMISSION_DENIED`
- `UNSUPPORTED_TAB_URL`

## Logging

`browsr` uses `tracing` with structured logs.

Set log level with `RUST_LOG`, for example:

```bash
RUST_LOG=browsr=debug,tower_http=info cargo run
```

## Troubleshooting

### `EXTENSION_NOT_CONNECTED`

- Confirm `xpose` endpoint is `ws://127.0.0.1:17373/ws`.
- Reload extension from `edge://extensions`.
- Recheck:

```bash
curl -sS http://127.0.0.1:17373/health | jq
```

### Snapshot timeouts on heavy pages

- Increase `request_timeout_ms` in `config/server.toml`.
- Retry with smaller payload first (`include_html=false`).

### `received unknown extension message ... type=keepalive`

- Safe to ignore.
- It means extension is sending heartbeat messages not yet explicitly classified by `browsr`.

## Security Notes

- Bind host defaults to `127.0.0.1` intentionally.
- Do not expose this service publicly without additional auth and transport hardening.
- Extension snapshots may contain sensitive content from open tabs.

## Project Layout

- `src/main.rs` - server bootstrap, router, middleware
- `src/config.rs` - config loading (file + env)
- `src/ws_ext.rs` - extension WebSocket handling
- `src/state.rs` - shared state, pending requests, caches
- `src/protocol.rs` - command envelope + message classification
- `src/api.rs` - HTTP API
- `config/server.toml` - default runtime configuration
- `Dockerfile` - multi-stage static build + scratch runtime
- `docker-compose.yml` - local container orchestration
