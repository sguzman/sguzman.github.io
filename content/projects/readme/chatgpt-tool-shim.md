+++
title = "chatgpt-tool-shim README"
description = "README mirror for chatgpt-tool-shim"
draft = false
+++

[Repository](https://github.com/sguzman/chatgpt-tool-shim) | [DeepWiki](https://deepwiki.com/sguzman/chatgpt-tool-shim/)

# ChatGPT Tool Shim

ChatGPT Tool Shim is a Chrome/Edge extension that adds client-side pseudo-tool-calling to the ChatGPT website. It watches visible assistant output for structured `<tool_call>` blocks, executes allowlisted browser or local tools through the extension runtime, and injects `<tool_result>` blocks back into the conversation.

This is not a backend integration, not a real OpenAI plugin, and not a true MCP client inside OpenAI's servers. The extension is the tool runtime. ChatGPT web is only the UI surface.

## Why It Exists

ChatGPT web does not expose a native user-controlled bridge for local tools or browser state. This project approximates tool use from the outside by:

1. Watching assistant output in the page DOM.
2. Parsing structured tool requests.
3. Executing a small allowlisted tool set through extension APIs.
4. Writing the result back into the ChatGPT composer.

That gives you a practical pseudo-tool loop without touching OpenAI's backend.

## How It Works

The runtime loop is:

1. ChatGPT emits a visible `<tool_call>` block.
2. The ChatGPT content script watches the latest assistant message with `MutationObserver`.
3. The parser extracts the last complete top-level tool call and ignores fenced code examples.
4. The content script sends the parsed request to the extension service worker.
5. The service worker validates the request, checks the allowlist and policy, and dispatches a tool handler.
6. The tool handler uses browser APIs or an optional localhost bridge.
7. The content script injects a normalized `<tool_result>` block into the ChatGPT composer and optionally submits it.

## Status And Scope

- Initial target: `chatgpt.com` and `chat.openai.com`
- Phase 1: extension-only runtime
- Phase 2: optional localhost bridge
- Non-goals: true backend tools, model-side MCP, arbitrary automation, multi-provider adapter system

The canonical implementation plan is [docs/plans/chatgpt-tool-shim-project-plan.md](docs/plans/chatgpt-tool-shim-project-plan.md).

## Safety Model

This project is intentionally read-only in Phase 1, but read-only still carries privacy risk.

- Tools are explicitly allowlisted.
- Sensitive tools can require user confirmation.
- `browser.tab.read_text` is confirm-only by default.
- Auto-submit is off by default.
- Audit logs are stored in `chrome.storage.local`.
- Sensitive domains are blocked by default for page text reads.
- Page content is marked as untrusted when returned to ChatGPT.

You should assume that any tool result injected into ChatGPT becomes model-visible. Use conservative defaults.

## Initial Tool Protocol

Canonical tool call:

```xml
<tool_call name="browser.tabs.list" id="abc123">
{}
</tool_call>
```

Canonical tool result:

```xml
<tool_result name="browser.tabs.list" id="abc123">
{
  "ok": true,
  "tabs": []
}
</tool_result>
```

Error result:

```xml
<tool_result name="browser.tabs.list" id="abc123">
{
  "ok": false,
  "error": {
    "code": "SOME_CODE",
    "message": "Human-readable message"
  }
}
</tool_result>
```

Recommended ChatGPT priming prompt:

```text
You have access to client-side tools through my browser extension.

When you need a tool, output exactly one tool call and nothing else:

<tool_call name="TOOL_NAME">
JSON_ARGUMENTS
</tool_call>

After I provide a <tool_result>, continue normally.
Do not invent tool results.
```

A ready-to-paste version also lives at [docs/prompts/chatgpt-priming-prompt.md](docs/prompts/chatgpt-priming-prompt.md). The overlay can insert the priming prompt, the tool catalog, and sample `hello` / `clock` tool calls directly into the composer.

Starter smoke-test calls:

```xml
<tool_call name="hello">
{}
</tool_call>
```

```xml
<tool_call name="clock">
{}
</tool_call>
```

## Planned Tool Set

Phase 1 starter pseudo-MCP tools:

- `hello`
- `clock`

Phase 1 extension tools:

- `clock.now`
- `browser.tabs.list`
- `browser.tab.metadata`
- `browser.tab.links`
- `browser.tab.read_text`

Later ideas, not part of the initial build:

- `browser.tab.html`
- `browser.tab.tables`
- `browser.window.snapshot`
- `local.mcp.call`
- adapters for other hosted chat UIs

## Architecture

The runtime is split into a few small modules:

- `src/chatgpt_content_script.ts`
  Watches ChatGPT, deduplicates calls, coordinates confirmation, and injects results.
- `src/service_worker.ts`
  Validates calls, enforces policy, dispatches tools, persists settings, and stores audit entries.
- `src/protocol/`
  Shared types, parser, formatter, and validators.
- `src/tools/`
  Tool registry and browser/local tool handlers.
- `src/injected/`
  Pure read-only page extractors used through `chrome.scripting.executeScript`.
- `src/ui/`
  ChatGPT overlay, selectors, composer helpers, and log rendering.
- `src/storage/`
  Settings and audit log persistence.

The implementation plan is documented in [docs/plans/chatgpt-tool-shim-project-plan.md](docs/plans/chatgpt-tool-shim-project-plan.md).

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Build the extension:

```bash
npm run build
```

3. Load the unpacked extension:
   Open `chrome://extensions` or `edge://extensions`, enable developer mode, click `Load unpacked`, and select the `dist/` directory.

4. Open ChatGPT in a normal browser tab.

The build outputs `dist/manifest.json`, `dist/chatgpt_content_script.js`, and `dist/service_worker.js`.

## Manual Testing Flow

1. Load the unpacked extension from `dist/`.
2. Open `https://chatgpt.com/`.
3. Confirm the `Tool Shim` overlay appears.
4. Paste the priming prompt from this README into ChatGPT, use [docs/prompts/chatgpt-priming-prompt.md](docs/prompts/chatgpt-priming-prompt.md), or click `Insert Prompt` in the overlay.
5. Start with a simple smoke test by steering the model to emit:

```xml
<tool_call name="hello">
{}
</tool_call>
```

6. Ask for the current time and steer the model to emit:

```xml
<tool_call name="clock">
{}
</tool_call>
```

or:

```xml
<tool_call name="clock.now">
{}
</tool_call>
```

7. Verify the extension inserts a `<tool_result>` block into the composer.
8. Toggle `Auto Submit` on and repeat to verify automatic submission.
9. Test `browser.tabs.list`, `browser.tab.metadata`, `browser.tab.links`, and `browser.tab.read_text`.
10. Verify `browser.tab.read_text` prompts for confirmation and respects blocked domains.

For quick manual testing, the overlay also has `Insert Hello` and `Insert Clock` buttons that paste canonical tool calls without submitting them.

## Roadmap

1. Scaffold MV3 extension and build pipeline.
2. Add parser, formatter, validators, and shared types.
3. Add ChatGPT overlay and composer integration.
4. Add `clock.now` and verify the basic loop.
5. Add browser tab tools.
6. Add audit log, persisted settings, and manual debugging affordances.
7. Add the optional localhost bridge as Phase 2.

The project plan also reserves two very simple pseudo-MCP starter tools for the protocol layer:

- `hello`
  Returns a trivial hello-style payload for smoke-testing the end-to-end loop.
- `clock`
  Returns the current local time in the browser timezone.

They are now intended to be real implemented starter tools, not documentation-only placeholders.

## Plan Reference

The canonical implementation plan lives at [docs/plans/chatgpt-tool-shim-project-plan.md](docs/plans/chatgpt-tool-shim-project-plan.md).

## Limitations

- ChatGPT DOM structure can change.
- Streaming output may produce partial tags before a complete tool call is available.
- The model may quote or explain a tool call instead of executing one.
- Content extraction can expose sensitive browser state if policies are too broad.
- This does not give the hosted ChatGPT backend native tools or MCP access.

The extension reduces brittleness with parser rules, selector fallbacks, dedupe, and confirmation flows, but it is still a DOM-driven shim.

## Future Directions

- Optional localhost bridge for real local tools via HTTP.
- Additional read-only browser tools once the DOM loop is stable.
- Provider-specific adapters for other hosted chat UIs such as Claude or Gemini.

Those are follow-on phases, not part of the initial target.
