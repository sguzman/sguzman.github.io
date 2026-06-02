+++
title = "fathrs README"
description = "README mirror for fathrs"
draft = false
+++

[Repository](https://github.com/sguzman/fathrs) | [DeepWiki](https://deepwiki.com/sguzman/fathrs/)

# fathrs

`fathrs` is a small Rust CLI for deploying dotfiles and similar filesystem
artifacts from a declarative `links.toml` file. It reads source-to-target
mappings, resolves them relative to a configurable base directory, and then
creates symlinks or copies files/directories into place.

The project is intentionally narrow in scope: it is a linker, not a full
dotfile management framework. There is no templating layer, no profile engine,
and no repository mutation logic beyond making the requested links or copies.

## What It Does

- Reads link definitions from a TOML config.
- Creates symlinks for files or directories.
- Supports replacing existing destinations with `--force`.
- Supports dry runs before touching the filesystem.
- Can probe configured destinations and report their current state.
- Can mark entries or sections as `copy = true` instead of linking.
- Can mark entries or sections as `sudo = true`, which uses `doas` for
  privileged filesystem operations.

## Current Behavior

The binary is named `fathrs`. The CLI exposes three modes:

- `link`: apply the configuration by creating links or copies.
- `validate`: parse the config and fail early if it is invalid.
- `probe`: inspect destinations and report whether they are present, missing,
  symlinks, copies, or likely to require elevated privileges.

If no subcommand is provided, the program defaults to `link` mode with
`force = false` and `dry_run = false`.

## Requirements

- A Rust toolchain if you are building from source.
- A filesystem/environment that supports symlinks.
- `doas` installed if you want to use `sudo = true` entries.
- A `links.toml` file describing the desired links.

## Toolchain Notes

- The repo includes a [rust-toolchain.toml](./rust-toolchain.toml) pinned to
  `nightly` with `clippy`, `rustfmt`, and `rust-src`.
- The release workflow in
  [.github/workflows/release.yml](./.github/workflows/release.yml) builds and
  packages the binary on Ubuntu.

## Build And Run

Build the project:

```bash
cargo build
```

Show CLI help:

```bash
cargo run -- --help
```

Apply links from the default `links.toml` in the current directory:

```bash
cargo run -- link
```

Apply links from a specific config using the config directory as the default
base directory:

```bash
cargo run -- --config ~/dotfiles/links.toml link
```

Preview changes without writing anything:

```bash
cargo run -- --config ~/dotfiles/links.toml link --dry-run
```

Replace existing targets when needed:

```bash
cargo run -- --config ~/dotfiles/links.toml link --force
```

Validate the config:

```bash
cargo run -- --config ~/dotfiles/links.toml validate
```

Probe current link state:

```bash
cargo run -- --config ~/dotfiles/links.toml probe
```

## Configuration Format

`fathrs` expects a TOML document where each top-level table is a section. Each
section contains source-path keys mapped to target-path values, plus optional
section defaults.

At the section level, these flags are supported:

- `copy = true|false`
- `sudo = true|false`

Each mapping can be either:

- A string target path.
- An object with `target` plus optional per-entry `copy` and `sudo` overrides.

### Minimal Example

```toml
[dotfiles]
".zshrc" = "~/.zshrc"
".gitconfig" = "~/.gitconfig"
```

### Mixed Example

```toml
[user]
"config/nvim" = "~/.config/nvim"
"bin/tool" = { target = "~/.local/bin/tool", copy = true }

[system]
sudo = true
"/repo/services/example.service" = "/etc/systemd/system/example.service"
```

### Path Resolution Rules

- `--config` defaults to `links.toml`.
- `~` and `~/...` are expanded using `$HOME`.
- Relative paths are resolved against `--base-dir` if provided.
- If `--base-dir` is not provided, relative paths are resolved against the
  directory containing the config file.
- Both source and destination paths go through this same resolution logic.

This means a config can be kept inside a dotfiles repository and still use
short relative paths cleanly.

## CLI Reference

### Global Options

- `--config <PATH>`: path to the TOML config file. Default: `links.toml`.
- `--base-dir <PATH>`: base directory used to resolve relative paths in the
  config. Defaults to the directory containing the config file.

### `link`

Creates symlinks or copies according to the config.

- `--force`: remove conflicting existing destinations first.
- `--dry-run`: report actions without changing the filesystem.

Behavior notes:

- If a destination already exists and is the correct symlink, `fathrs` skips it.
- If a destination exists and points elsewhere, `--force` is required.
- Parent directories for destinations are created automatically.
- `copy = true` copies files/directories instead of making symlinks.
- `sudo = true` uses `doas` for directory creation, removal, copy, and link
  creation.

### `validate`

Parses the config and exits successfully if it is syntactically valid for the
current application parser.

The repository also includes a JSON schema at
[schema/links.schema.json](./schema/links.schema.json) that documents the
expected shape of `links.toml`.

### `probe`

Reports the status of configured destinations without changing them.

- `--warn-only`: suppress non-warning informational output and focus on
  problems/missing targets.

Probe mode is useful for checking whether links are already present, whether a
destination is a plain file instead of a symlink, and whether a destination
path may require elevated privileges.

## Logging

The application uses `tracing` and `tracing-subscriber`.

- By default, it initializes an `EnvFilter` that falls back to
  `info,dotlink=trace` if `RUST_LOG` is not set.
- You can increase verbosity in practice with something like:

```bash
RUST_LOG=trace cargo run -- --config ~/dotfiles/links.toml probe
```

## Testing

Run the test suite with:

```bash
cargo test
```

The integration test in [tests/examples_test1.rs](./tests/examples_test1.rs)
executes the compiled binary against the example config under
[examples/test1](./examples/test1) and verifies that the expected symlinks are
created.

## Example Layout

The example config at [examples/test1/links.toml](./examples/test1/links.toml)
demonstrates three mappings:

- A file-to-file symlink.
- Another file-to-file symlink in a separate section.
- A directory symlink.

The fixture source files live under `examples/test1/link-source`, and the test
creates outputs under `examples/test1/link-target`.

## Project Layout

This repository is small, but it has a few distinct layers:

- [src/main.rs](./src/main.rs): program entrypoint, config parsing, command
  dispatch, section iteration, and high-level execution flow.
- [src/cli.rs](./src/cli.rs): `clap` definitions for the CLI and `~` home-path
  expansion helpers.
- [src/link.rs](./src/link.rs): low-level filesystem behavior for path
  resolution, status probing, directory creation, copy operations, removal, and
  symlink creation.
- [tests/examples_test1.rs](./tests/examples_test1.rs): integration test that
  validates the example workflow end to end.
- [examples/test1](./examples/test1): sample config and fixture data used by the
  test suite.
- [schema/links.schema.json](./schema/links.schema.json): JSON schema
  documenting the shape of `links.toml`.
- [docs/reference](./docs/reference): supporting project documentation,
  including release policy, tool guidance, and template/reference material kept
  alongside the crate.
- [justfile](./justfile): common development tasks such as build, test, lint,
  coverage, release helpers, and CI-style local checks.
- [.github/workflows/release.yml](./.github/workflows/release.yml): GitHub
  Actions release workflow that builds, verifies, and packages the binary.
- [tmp](./tmp): scratch/example material used for local config experiments.

## Development Workflow

Common commands:

```bash
just build
just test
just clippy
just fmt
just ci
```

The `just ci` target runs the repo's broader local verification workflow,
including formatting checks, TOML validation, link checking, linting, docs, and
tests. Some of those tools are optional local dependencies outside Cargo itself
such as `taplo`, `biome`, `typos`, and `lychee`.

## Design Constraints

The crate currently favors explicit and inspectable behavior over abstraction:

- Config is plain TOML.
- Source and destination resolution is deterministic.
- Filesystem changes are observable through logs and dry-run mode.
- Existing destinations are never replaced silently unless `--force` is used.
- Privileged operations are opt-in per section or per entry.

That narrow scope is the point of the tool. If you want a dotfile manager with
templating, environment overlays, or secret materialization, this repository is
not trying to be that.

## Limitations And Caveats

- The implementation is Unix-oriented. Symlink creation uses Unix APIs, and the
  `sudo` path relies on `doas`.
- Filesystem permission checks are best-effort and platform-sensitive.
- `validate` confirms parser compatibility but does not currently apply every
  possible semantic filesystem check up front.
- Copy mode and symlink mode intentionally share the same config structure, so
  it is on the operator to use the right behavior for each destination.

## Related Docs

- [docs/reference/RELEASE.md](./docs/reference/RELEASE.md): release and SemVer
  policy.
- [docs/reference/ai/POST-CHANGES.md](./docs/reference/ai/POST-CHANGES.md):
  post-change verification checklist.
- [docs/reference/tools/cliff.md](./docs/reference/tools/cliff.md): changelog
  and `git-cliff` guidance.
