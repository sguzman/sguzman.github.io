+++
title = "ria README"
description = "README mirror for ria"
draft = false
+++

[Repository](https://github.com/sguzman/ria) | [DeepWiki](https://deepwiki.com/sguzman/ria/)

# ria

`ria` is a Rust command-line interface for Archive.org workflows. The project aims to provide a practical, scriptable, and eventually parity-focused alternative to the Python `internetarchive` CLI while keeping the implementation small, observable, and maintainable.

The current crate already includes real command handling for metadata lookup and updates, search, account-oriented service endpoints, and file transfer operations such as upload, download, copy, move, and delete. It also includes configuration discovery, environment and CLI overrides, structured output modes, HTTP retry and throttling controls, and release/parity documentation.

## Goals

- Provide a native Rust CLI for common Archive.org operations.
- Preserve important operational behavior from the existing Python tooling where that compatibility matters.
- Keep the implementation organized by domain instead of growing a single monolithic CLI file.
- Expose behavior clearly through logging, explicit configuration, and documented compatibility toggles.

## Current Scope

The command surface currently includes:

- `account`
- `configure`
- `copy`
- `delete`
- `download`
- `flag`
- `list`
- `metadata`
- `move`
- `reviews`
- `search`
- `simplelists`
- `tasks`
- `upload`

At a high level:

- `search` queries Archive.org search endpoints and can page across multiple result pages.
- `list` and `metadata` fetch item metadata and file listings.
- `metadata` also supports metadata patching and file-based metadata updates.
- `upload`, `download`, `copy`, `move`, and `delete` implement transfer planning plus execution, with `--dry-run` support on mutating transfer-style commands.
- `reviews`, `flag`, `simplelists`, and `tasks` call Archive.org service endpoints that require the appropriate request shape and, in most cases, configured credentials.
- `configure` writes credentials to the resolved config file location.

## Status

This is an early project, but not a placeholder. The repository already contains:

- A working binary crate with tests.
- Config loading, validation, and persistence.
- HTTP client infrastructure with retry, rate limiting, and concurrency controls.
- Signal handling for `SIGINT`, `SIGTERM`, and default `SIGPIPE` behavior on Unix.
- Output modes for human-readable, JSON, and raw responses.
- Parity notes, roadmaps, release notes, and release process docs.

Parity with the Python CLI is still a work in progress. Some compatibility behavior is implemented explicitly, and some is documented as planned rather than complete.

## Build And Run

Requirements:

- Rust toolchain with the version resolved from `rust-toolchain.toml`
- Network access to Archive.org
- Archive.org credentials for authenticated operations

Common commands:

```bash
cargo build
cargo test
cargo run -- --help
```

Examples:

```bash
cargo run -- search 'collection:opensource_audio' --rows 10
cargo run -- list example_identifier
cargo run -- metadata example_identifier
cargo run -- download example_identifier --dest ./downloads
cargo run -- upload example_identifier ./file1 ./file2 --dry-run
```

## CLI Model

Global flags include:

- `-c, --config-file <FILE>` to point at a specific config file
- `-l, --log` and `-d, --debug` to enable logging
- `-i, --insecure` to relax network security settings
- `-H, --host <HOST>` to override the base host
- `--user-agent-suffix <STRING>` to append to the User-Agent
- `--output <FORMAT>` where format is `human`, `json`, or `raw`
- `--color` / `--no-color`
- `--paging` / `--no-paging`
- `-q, --quiet`
- `-v, --verbose`

The CLI is implemented with `clap` and dispatches command handling into domain modules rather than encoding command behavior directly in the parser layer.

## Configuration

Configuration is TOML-backed and is resolved in this order:

1. `--config-file`
2. `RIA_CONFIG`
3. Platform config directory via `directories`, using `org/archive/ria/ria.toml`

Overrides apply in this order:

1. Config file values
2. Environment variables
3. CLI flags

The sample config lives at [`docs/ria.toml`](/win/linux/Code/rust/ria/docs/ria.toml:1).

Main config sections:

- `logging`
- `general`
- `network`
- `tls`
- `endpoints`
- `output`
- `input`
- `auth`
- `file_transfer`
- `compatibility`

Important environment variables include:

- `RIA_CONFIG`
- `RIA_LOG_LEVEL`, `RIA_LOG_FILTER`, `RIA_LOG_FORMAT`, `RIA_LOG_OUTPUT`
- `RIA_HOST`, `RIA_INSECURE`
- `RIA_OUTPUT`, `RIA_OUTPUT_COLOR`, `RIA_OUTPUT_PAGING`, `RIA_QUIET`, `RIA_VERBOSE`
- `RIA_TLS_VERIFY`, `RIA_CA_BUNDLE`
- `RIA_API_BASE`, `RIA_S3_BASE`, `RIA_METADATA_BASE`
- `RIA_ACCESS_KEY`, `RIA_SECRET_KEY`
- `RIA_INPUT_GLOB`, `RIA_VALIDATE_IDENTIFIERS`, `RIA_READ_STDIN`
- `RIA_TRANSFER_CHUNK_SIZE_BYTES`, `RIA_TRANSFER_CHECKSUM_VERIFY`, `RIA_TRANSFER_RESUME`
- `RIA_COMPAT_PYTHON_USER_AGENT`, `RIA_COMPAT_LEGACY_METADATA_FORMAT`, `RIA_COMPAT_LEGACY_LOGGING`

For full configuration details, see [`docs/config.md`](/win/linux/Code/rust/ria/docs/config.md:1).

## Output And Logging

`ria` separates user-facing output from internal telemetry:

- Output modes are `human`, `json`, and `raw`.
- Quiet mode suppresses normal stdout output.
- Verbose mode enables more transfer progress reporting.
- Logging is built on `tracing` and `tracing-subscriber`.
- Log format can be pretty or JSON.
- Logs can be routed to stdout or stderr.

This split is useful for shell automation: machine-readable command output can be requested independently of debug or operational logs.

## Networking And Transfer Behavior

The HTTP layer is based on blocking `reqwest` with `rustls` and supports:

- Base URL configuration for API, S3, and metadata endpoints
- Retry with backoff
- Optional rate limiting
- Optional concurrency limiting
- TLS verification toggles and custom CA bundle support
- Configurable User-Agent behavior

Transfer-related code currently includes:

- Metadata-driven file selection for downloads, deletes, copies, and moves
- Glob and format filtering
- Checksum verification for downloads and uploads
- Resume-style skipping for already-present files
- Dry-run planning output

One explicit current limitation in the implementation is that configured chunked uploads are recognized but not yet implemented; the code logs a warning and ignores `chunk_size_bytes` during upload execution.

## Compatibility Notes

This project is intentionally informed by the Python `internetarchive` CLI, but it does not claim full behavioral parity yet.

Current documented differences include:

- Default User-Agent behavior identifies `ria/<version>` rather than mirroring Python runtime details.
- Output defaults to `human`.
- Signal handling is implemented with Rust signal hooks.

Current or planned compatibility toggles are documented in [`docs/parity.md`](/win/linux/Code/rust/ria/docs/parity.md:1).

## Project Layout

Top-level layout:

- [`Cargo.toml`](/win/linux/Code/rust/ria/Cargo.toml:1): crate manifest and dependency list
- [`rust-toolchain.toml`](/win/linux/Code/rust/ria/rust-toolchain.toml:1): pinned toolchain configuration
- [`src/`](/win/linux/Code/rust/ria/src): application and library source
- [`docs/`](/win/linux/Code/rust/ria/docs): supporting documentation, sample config, parity notes, release docs, and roadmap material
- [`LICENSE`](/win/linux/Code/rust/ria/LICENSE:1): project license

Source tree:

- [`src/main.rs`](/win/linux/Code/rust/ria/src/main.rs:1): binary entrypoint; installs signal handlers and runs the CLI
- [`src/lib.rs`](/win/linux/Code/rust/ria/src/lib.rs:1): library module exports
- [`src/cli/mod.rs`](/win/linux/Code/rust/ria/src/cli/mod.rs:1): `clap` definitions, global flags, subcommands, app context, and dispatch
- [`src/config/mod.rs`](/win/linux/Code/rust/ria/src/config/mod.rs:1): config schema, discovery, env overrides, validation, load/save helpers
- [`src/http/mod.rs`](/win/linux/Code/rust/ria/src/http/mod.rs:1): shared HTTP client, endpoint config, retry logic, throttling, and request helpers
- [`src/output/mod.rs`](/win/linux/Code/rust/ria/src/output/mod.rs:1): output policy and writers for human, JSON, and raw output
- [`src/telemetry.rs`](/win/linux/Code/rust/ria/src/telemetry.rs:1): `tracing` initialization and formatting/output selection
- [`src/signals.rs`](/win/linux/Code/rust/ria/src/signals.rs:1): signal registration and process-exit behavior
- [`src/errors.rs`](/win/linux/Code/rust/ria/src/errors.rs:1): shared error type and crate-wide `Result`
- [`src/utils/mod.rs`](/win/linux/Code/rust/ria/src/utils/mod.rs:1): identifier validation, glob matching, and stdin helpers

Domain modules:

- [`src/domains/core/mod.rs`](/win/linux/Code/rust/ria/src/domains/core/mod.rs:1): shared session-style core types; currently minimal
- [`src/domains/metadata/mod.rs`](/win/linux/Code/rust/ria/src/domains/metadata/mod.rs:1): search, metadata reads, metadata patch/update logic, and list output
- [`src/domains/transfer/mod.rs`](/win/linux/Code/rust/ria/src/domains/transfer/mod.rs:1): upload/download/copy/move/delete planning and execution
- [`src/domains/account/mod.rs`](/win/linux/Code/rust/ria/src/domains/account/mod.rs:1): account/configure plus reviews, flags, simplelists, and tasks service interactions
- [`src/domains/mod.rs`](/win/linux/Code/rust/ria/src/domains/mod.rs:1): domain module exports

Documentation tree:

- [`docs/config.md`](/win/linux/Code/rust/ria/docs/config.md:1): config lookup and environment override reference
- [`docs/parity.md`](/win/linux/Code/rust/ria/docs/parity.md:1): parity goals and known compatibility differences
- [`docs/ria.toml`](/win/linux/Code/rust/ria/docs/ria.toml:1): sample configuration file
- [`docs/release-notes.md`](/win/linux/Code/rust/ria/docs/release-notes.md:1): versioned release notes
- [`docs/release-checklist.md`](/win/linux/Code/rust/ria/docs/release-checklist.md:1): release process checklist
- [`docs/rules.md`](/win/linux/Code/rust/ria/docs/rules.md:1): repository working rules
- [`docs/roadmaps/`](/win/linux/Code/rust/ria/docs/roadmaps): roadmap documents for feature areas and delivery tranches

## Development Notes

- The crate uses blocking I/O rather than an async runtime.
- Tests are colocated in modules and cover CLI parsing, config behavior, output policy, utility helpers, and HTTP/domain functionality where applicable.
- The repository includes planning artifacts in `docs/roadmaps/` that are useful for understanding intended feature growth and parity milestones.

## Known Gaps And Caveats

- Full parity with the Python CLI is not complete.
- Some commands depend on remote Archive.org behavior that may change independently of this codebase.
- Chunked upload configuration is present, but chunked upload execution is not implemented yet.
- Authenticated service commands require valid configured credentials and appropriate server-side permissions.

## Related Docs

- Archive.org CLI reference is linked from the built-in CLI help text.
- Repository-specific operational docs live under [`docs/`](/win/linux/Code/rust/ria/docs).
