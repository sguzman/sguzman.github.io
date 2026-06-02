+++
title = "mathematica-mcp README"
description = "README mirror for mathematica-mcp"
draft = false
+++

[Repository](https://github.com/sguzman/mathematica-mcp) | [DeepWiki](https://deepwiki.com/sguzman/mathematica-mcp/)

# Mathematica MCP

`mathematica-mcp` is a Rust MCP server that exposes a local Wolfram Language / Mathematica kernel over stdio. It is intended for MCP-compatible clients that need symbolic computation, numerical evaluation, finance lookups, or notebook-style experimentation backed by a real local kernel instead of a remote API.

The repository also includes a local REPL that exercises the same session-management and evaluation path without requiring an MCP host, which makes it useful for development, debugging, and validating kernel setup.

## What The Project Does

The server starts one or more local Wolfram kernel processes and presents them through a small MCP tool surface:

- Create a kernel-backed session.
- Execute arbitrary Wolfram Language code inside a specific session.
- Close a session and release its resources.
- List active sessions and their idle times.
- Return current local and UTC time.
- Provide a convenience helper around `FinancialData[...]`.

Each session is isolated in its own worker thread and is cleaned up automatically after 30 minutes of inactivity.

## Why This Exists

Most MCP clients speak stdio well, but they do not know how to launch and manage a local Mathematica kernel. This project fills that gap:

- `rmcp` handles the MCP server and stdio transport.
- `wstp` handles the Wolfram Symbolic Transfer Protocol bridge into the kernel.
- The crate adds session lifecycle management, kernel discovery, evaluation wrappers, and a local debugging workflow.

## Runtime Modes

The binary supports two modes.

### `serve`

Runs the MCP server over stdio for use by MCP hosts such as desktop assistants, editor integrations, or custom clients.

```bash
cargo run -- serve
```

This is also the default when no subcommand is provided:

```bash
cargo run
```

### `repl`

Runs an interactive local shell that calls the same session manager and evaluation path without MCP in the middle.

```bash
cargo run -- repl
```

The REPL is useful when:

- you want to verify that the Wolfram kernel launches correctly;
- you want to debug evaluation behavior before testing through an MCP client;
- you want to inspect raw output, logs, and graphics handling locally.

## MCP Tool Surface

The server currently exposes these tools from [`src/mcp.rs`](/win/linux/Code/rust/mathematica-mcp/src/mcp.rs):

- `mathematica_create_session`
  Launch a new kernel session and return a session id.
- `mathematica_execute_code`
  Evaluate Wolfram Language code in a specific session.
- `mathematica_close_session`
  Shut down a session.
- `mathematica_list_sessions`
  Return active sessions, creation time, and idle time.
- `mathematica_time`
  Return local and UTC time in RFC3339 format.
- `mathematica_get_finance`
  Build and execute a `FinancialData[...]` expression for a given ticker and optional property/date range/interval.

Recommended usage flow:

1. Call `mathematica_create_session`.
2. Reuse the returned `session_id` for one or more `mathematica_execute_code` or `mathematica_get_finance` calls.
3. Call `mathematica_close_session` when you are done.

## How Evaluation Works

The evaluation pipeline lives primarily in [`src/wolfram.rs`](/win/linux/Code/rust/mathematica-mcp/src/wolfram.rs) and [`src/session.rs`](/win/linux/Code/rust/mathematica-mcp/src/session.rs).

At a high level:

1. The server resolves a Wolfram kernel executable.
2. A new session spawns a dedicated kernel process through WSTP.
3. Each session owns a worker thread and receives requests over a channel.
4. User code is wrapped before evaluation so the server can return structured JSON.
5. The wrapper captures:
   - `output`: the result rendered with `ToString[..., InputForm]`
   - `graphics`: a PNG, Base64-encoded, when the result looks like a graphics object
   - `logs`: text packets such as `Print[...]` output
6. The MCP layer measures elapsed time and returns the structured result.

This design keeps the transport layer thin and concentrates kernel behavior in a small number of files.

## Session Model

Sessions are managed by `SessionManager` in [`src/session.rs`](/win/linux/Code/rust/mathematica-mcp/src/session.rs).

Important behavior:

- Each session gets its own kernel process.
- Each session tracks `created_at` and `last_accessed`.
- Idle sessions are closed automatically after 30 minutes.
- Eval requests are timeout-bound per call.
- Closing a session joins the worker thread and removes it from the internal map.

Session ids are human-readable four-part tokens such as `quick_fox-kind_sloth-bright_auk-calm_mole`. The generator and verifier live in [`src/session_id.rs`](/win/linux/Code/rust/mathematica-mcp/src/session_id.rs).

## Kernel Discovery And Configuration

Kernel resolution is implemented in [`src/wolfram.rs`](/win/linux/Code/rust/mathematica-mcp/src/wolfram.rs) with platform-specific helpers in [`src/platform/`](/win/linux/Code/rust/mathematica-mcp/src/platform).

Resolution order:

1. `WOLFRAM_KERNEL_PATH`
2. platform discovery via `wolfram-app-discovery`
3. executable lookup on `PATH`
4. fallback to a bare `WolframKernel` command name

### `WOLFRAM_KERNEL_PATH`

If your Wolfram installation is not discoverable automatically, set the kernel explicitly:

```bash
export WOLFRAM_KERNEL_PATH=/path/to/WolframKernel
```

On Windows, use the `.exe` path.

The platform layer validates that the configured path exists and looks executable for the current OS.

## Logging And Observability

Tracing is initialized in [`src/main.rs`](/win/linux/Code/rust/mathematica-mcp/src/main.rs).

Important detail: in server mode, logs are written to `stderr`, not `stdout`, because stdio MCP transport uses `stdout` for protocol traffic.

The logger uses `tracing-subscriber` with `RUST_LOG` support:

```bash
RUST_LOG=debug cargo run -- serve
```

## REPL Commands

The REPL implementation lives in [`src/repl.rs`](/win/linux/Code/rust/mathematica-mcp/src/repl.rs).

Supported commands:

- `mathematica_create_session`
- `mathematica_list_sessions`
- `mathematica_time`
- `mathematica_execute_code <code...>`
- `mathematica_get_finance <SYMBOL> [PROPERTY] [START YYYY-MM-DD] [END YYYY-MM-DD] [INTERVAL]`
- `mathematica_close_session [SESSION_ID]`
- `exit`
- `quit`

REPL history is stored at `.cache/mathematica_repl_history.txt`.

## Build, Run, And Test

### Requirements

- Rust toolchain with Cargo
- A local Wolfram / Mathematica installation with a usable kernel
- Native toolchain support needed by the `wstp` dependency on your platform

### Common Commands

```bash
cargo build
cargo run -- --help
cargo run -- serve
cargo run -- repl
cargo test
```

## Repository Layout

Top-level structure:

- [`Cargo.toml`](/win/linux/Code/rust/mathematica-mcp/Cargo.toml)
  Main crate manifest and dependency list.
- [`src/`](/win/linux/Code/rust/mathematica-mcp/src)
  Application source code for the MCP server, REPL, session manager, and Wolfram integration.
- [`docs/`](/win/linux/Code/rust/mathematica-mcp/docs)
  Reference notes, migration material, release process notes, and internal project documentation.
- [`wstp-sys-patched/`](/win/linux/Code/rust/mathematica-mcp/wstp-sys-patched)
  Local patched replacement for the `wstp-sys` crate used through `[patch.crates-io]`.
- [`tmp/`](/win/linux/Code/rust/mathematica-mcp/tmp)
  Scratch/reference area ignored by git for temporary migration inputs or notes.
- [`target/`](/win/linux/Code/rust/mathematica-mcp/target)
  Cargo build output.

### `src/` Layout

- [`src/main.rs`](/win/linux/Code/rust/mathematica-mcp/src/main.rs)
  CLI entrypoint, tracing setup, and subcommand dispatch.
- [`src/mcp.rs`](/win/linux/Code/rust/mathematica-mcp/src/mcp.rs)
  MCP server implementation and tool definitions.
- [`src/repl.rs`](/win/linux/Code/rust/mathematica-mcp/src/repl.rs)
  Interactive local shell for manual testing.
- [`src/session.rs`](/win/linux/Code/rust/mathematica-mcp/src/session.rs)
  Session lifecycle, worker threads, idle cleanup, and eval dispatch.
- [`src/session_id.rs`](/win/linux/Code/rust/mathematica-mcp/src/session_id.rs)
  Human-readable session id generation and format validation.
- [`src/wolfram.rs`](/win/linux/Code/rust/mathematica-mcp/src/wolfram.rs)
  Kernel discovery, WSTP launch, evaluation wrapper, and finance helper code generation.
- [`src/platform/mod.rs`](/win/linux/Code/rust/mathematica-mcp/src/platform/mod.rs)
  Platform abstraction for kernel path discovery and validation.
- [`src/platform/linux.rs`](/win/linux/Code/rust/mathematica-mcp/src/platform/linux.rs)
  Linux-specific kernel path handling.
- [`src/platform/windows.rs`](/win/linux/Code/rust/mathematica-mcp/src/platform/windows.rs)
  Windows-specific kernel path handling.

### `docs/` Layout

The `docs/reference/` tree is supporting project documentation, not runtime code. It currently contains:

- release and semver notes;
- migration structure and roadmap documents;
- tool references used during development;
- AI/reference notes used while shaping the project.

If you are trying to understand runtime behavior, start with `src/` first. If you are trying to understand maintenance workflow, planned structure, or release process, then `docs/reference/` is relevant.

### `wstp-sys-patched/`

This repository patches `wstp-sys` locally:

- `Cargo.toml` redirects the crate with `[patch.crates-io]`.
- the directory provides the low-level WSTP FFI crate used by the upstream `wstp` crate;
- `generated/` contains pre-generated bindings used during builds.

This exists because WSTP integration is the most platform-sensitive part of the stack, and local patching gives the project control over that boundary.

## Dependency Notes

Key runtime dependencies from [`Cargo.toml`](/win/linux/Code/rust/mathematica-mcp/Cargo.toml):

- `rmcp`
  MCP server framework and stdio transport.
- `tokio`
  Async runtime for the server and cleanup tasks.
- `wstp`
  Rust bindings over Wolfram's WSTP.
- `wolfram-expr`
  Expression handling for WSTP interactions.
- `wolfram-app-discovery`
  Kernel path discovery across supported installations.
- `rustyline`
  Interactive REPL support.
- `tracing` and `tracing-subscriber`
  Structured logging.
- `clap`
  CLI parsing.
- `flume`
  Cross-thread request channel for session workers.

## Current Limitations

- This project depends on a locally installed proprietary Wolfram runtime.
- The MCP surface is intentionally small; most Wolfram functionality currently flows through generic code execution rather than many specialized tools.
- Graphics results are detected with a simple wrapper and returned as Base64 PNG, which is practical but not a full notebook rendering model.
- Session ids are human-readable and format-validated, but they are not durable credentials and should be treated as local process identifiers.

## Development Notes

Useful files for maintainers:

- [`docs/reference/RELEASE.md`](/win/linux/Code/rust/mathematica-mcp/docs/reference/RELEASE.md)
  Release and semver policy.
- [`docs/reference/migration/structure.md`](/win/linux/Code/rust/mathematica-mcp/docs/reference/migration/structure.md)
  Notes for migration-oriented project organization.

## Status

The repository is already a functional local MCP bridge:

- MCP server mode works over stdio.
- REPL mode exercises the same kernel/session path locally.
- Session creation, evaluation, listing, finance lookup, and shutdown are implemented.
- Linux and Windows kernel discovery paths are present.

The main area to be careful with is environment setup around WSTP and local kernel discovery, since that is the part most likely to vary by machine.
