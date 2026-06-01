+++
title = "xpos-js README"
description = "README mirror for xpos-js"
draft = false
+++

[Repository](https://github.com/sguzman/xpos-js) | [DeepWiki](https://deepwiki.com/sguzman/xpos-js/)

# xpose

MV3 extension for Edge/Chromium that exposes live tab and window introspection to a local self-hosted server over WebSocket.

## What it does

- Streams live tab/window events across all browser windows.
- Handles server commands to list windows, list tabs, snapshot a tab's DOM/HTML/text, and manipulate tabs.
- Supports debugger-backed `import-bundle` jobs that reload a tab, capture asset bodies, and expose a reconstructable bundle manifest.
- Uses structured trace logging with timestamps and trace IDs for all lifecycle, socket, and command operations.
- Provides an options page for runtime config.

## Local protocol

The extension connects to `ws://127.0.0.1:17373/ws` by default and sends:

- `hello`: initial state including windows/tabs.
- `event`: live updates (`tab.created`, `tab.updated`, `window.focus_changed`, etc).
- `response`: command result envelope.
- `log`: structured trace logs from extension internals.

Server commands should be JSON messages:

```json
{
  "type": "command",
  "id": "req-1",
  "traceId": "external-trace-id",
  "command": "list_tabs",
  "args": {}
}
```

Supported commands:

- `ping`
- `get_state`
- `list_windows`
- `list_tabs`
- `get_active_tab`
- `get_tab_state`
- `open_tab`
- `close_tab`
- `focus_tab`
- `move_tab`
- `group_tabs`
- `reload_tab`
- `snapshot_tab`
- `start_import_bundle`
- `get_import_bundle_status`
- `get_import_bundle_manifest`
- `get_import_bundle_asset`
- `cancel_import_bundle`
- `set_config`

## Import Bundle

`import-bundle` is the heavy capture path. It is distinct from `snapshot_tab`.

- `snapshot_tab`: fast DOM-oriented HTML/text capture from the live session
- `start_import_bundle`: debugger-backed capture job that reloads the tab and records loaded assets

Recommended flow:

1. Call `start_import_bundle` with a `tabId`
2. Poll `get_import_bundle_status` until `status` is `completed`, `failed`, or `cancelled`
3. Fetch `get_import_bundle_manifest`
4. Fetch individual assets with `get_import_bundle_asset`

Example `start_import_bundle` args:

```json
{
  "tabId": 1828093415,
  "reload": true,
  "captureHtml": true,
  "captureAssets": true,
  "captureText": true,
  "captureSelection": true,
  "captureScreenshot": false,
  "waitForNetworkIdleMs": 1500,
  "settleTimeoutMs": 30000,
  "maxAssetBytes": 5000000,
  "maxTotalBytes": 75000000
}
```

Manifest highlights:

- `bundle.document`: final captured HTML/text/selection
- `bundle.assets`: stable asset manifest for recorded resources
- `bundle.export`: replay-oriented metadata
- `bundle.capture`: timing metadata for the capture session

Asset retrieval:

- `get_import_bundle_asset` accepts `jobId` and `assetId`
- `assetId: "document"` returns the captured HTML document as an asset
- `assetId: "screenshot"` returns the captured screenshot when enabled
- `offset` and `length` can be provided for chunked retrieval of large assets

Options page import settings:

- network idle wait
- settle timeout
- max asset bytes
- max total bytes
- completed job TTL
- retained completed job count
- screenshot format and quality

## Build

```bash
npm run check
npm run build
```

Build output is copied to `dist/xpose`.

## Load in Edge

1. Open `edge://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked` and select `dist/xpose`.
4. In extension details, set site access to `On all sites`.
5. Start your local WebSocket server on `127.0.0.1`.

## Notes

- Works across all tabs in all normal browser windows within the same profile.
- `edge://*` and other privileged pages are restricted by browser policy.
- Snapshot payload size is capped by `maxHtmlBytes` and `maxTextBytes`.
- `import-bundle` is intentionally heavier than `snapshot`: it attaches `chrome.debugger`, reloads the tab, records network assets, then detaches.
- Debugger-backed capture may show Chromium debugger UX and will momentarily disturb the target tab because reload is part of the capture model.
- Completed import jobs are evicted according to the extension config TTL and retention limits.
