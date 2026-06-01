+++
title = "fathrs README"
description = "README mirror for fathrs"
draft = false
+++

[Repository](https://github.com/sguzman/fathrs) | [DeepWiki](https://deepwiki.com/sguzman/fathrs/)

# fathrs

A tiny, no-bullshit dotfile linker.

`fathrs` reads a `links.toml` file and creates **symlinks** from your target paths to your source paths. That is all. No templates. No variable expansion. No “rendering.” Just links, with loud logging so you can see exactly what happened.

This is essentially a minimal, single-binary “dotter-rs style” linker.

## Features

- **TOML-driven symlink map** (`links.toml`)
- **File symlinks** and **folder symlinks**
- **Force mode** to replace existing targets
- **Dry run** mode to preview actions
- **Intense logging** via `tracing` (spans + debug/trace details)
- Cross-platform symlink creation (Unix + Windows)

## Non-features (on purpose)

- No templates
- No “config language”
- No magic variable substitution
- No copying files (it links)

## Install / Build

```text
cargo build --release
````

Run the binary:

```text
cargo run --release -- [ARGS]
```

## Usage

### Basic

By default, `fathrs` looks for `links.toml` in the current working directory:

```text
fathrs
```

### Point at a config file

```text
fathrs --config path/to/links.toml
```

### Base directory resolution

Relative paths in `links.toml` are resolved under `--base-dir`.

If you do not pass `--base-dir`, it defaults to the **directory containing** the config file.

```text
fathrs --config examples/test1/links.toml --base-dir examples/test1
```

### Replace existing targets

If the target already exists, `fathrs` refuses to overwrite it unless you pass `--force`:

```text
fathrs --config links.toml --force
```

### Dry run

Print what would happen without modifying the filesystem:

```text
fathrs --config links.toml --dry-run
```

### Status report

Ensure every destination is where you expect it before touching the filesystem:

```text
fathrs --config links.toml --status
```

Each entry logs `info` when the symlink already exists and `warn` when it does not, then logs again with `info` if the parent directory is writable or `warn` if it likely requires sudo to update. This flag does not create or remove anything.

If you only want to see warnings while running the status check, add `--warn-only` together with `--status`; this suppresses the informational messages and only emits the warning lines shown above.

## Logging

`fathrs` uses `tracing` for structured logs. You can control verbosity with `RUST_LOG`.

Examples:

```text
RUST_LOG=info  fathrs --config links.toml
RUST_LOG=debug fathrs --config links.toml
RUST_LOG=trace fathrs --config links.toml
```

If something goes wrong, run with `trace` and you will see every step: path resolution, metadata checks, directory creation, conflict handling, deletions, symlink creation, and post-checks.

## `links.toml` format

`links.toml` contains sections. Each section contains one or more mappings:

* **Key** = source path
* **Value** = target path
* The program creates a symlink at **target** pointing to **source**

Example:

```toml
[test1]
"link-source/test1.txt" = "link-target/test1.txt"

[test2]
"link-source/test2.txt" = "link-target/test2.txt"

[folder]
"link-source/test-dir" = "link-target/local-dir"
```

Notes:

* Sections are only for organization; they do not affect behavior.
* Paths can be relative or absolute. Paths starting with `~` expand to your home directory.
* Relative paths are resolved under `--base-dir` (or the config directory by default).

## Schema

`schema/links.schema.json` describes the same layout (section tables mapping sources to targets). `taplo.toml` has a rule that applies that schema to every `links.toml`, so Taplo-aware editors or `taplo check` will flag deviations automatically.

## Behavior details

### What gets created

For each mapping:

* Ensure the destination parent directory exists.
* If the destination already exists:

  * If it is a symlink pointing to the same place, skip.
  * Otherwise:

    * error unless `--force`
    * if `--force`, remove the existing path and recreate the link
* Create a symlink at the destination pointing to the source.

### `metadata` vs `symlink_metadata`

Internally, `fathrs` uses `symlink_metadata` to avoid accidentally following symlinks while inspecting paths. This prevents “oops I traversed into the link” style bugs when handling directory links.

## Example layout (repo)

`examples/test1` contains a minimal scenario:

```text
examples/test1/
  links.toml
  link-source/
    test1.txt
    test2.txt
    test-dir/
      test3.txt
  link-target/
```

Run it:

```text
RUST_LOG=trace cargo run --release -- \
  --config examples/test1/links.toml \
  --base-dir examples/test1 \
  --force
```

After running, `link-target/` should contain symlinks:

* `test1.txt` -> `link-source/test1.txt`
* `test2.txt` -> `link-source/test2.txt`
* `local-dir` -> `link-source/test-dir` (directory symlink)

## Testing

There is an integration test that executes the binary against `examples/test1` and verifies that the expected symlinks exist and point to the correct sources.

Run:

```text
cargo test
```

To see logs during the test run:

```text
cargo test -- --nocapture
```

(You can also set `RUST_LOG=trace` to go nuclear.)

## License

MIT
