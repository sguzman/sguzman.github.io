+++
title = "slurp README"
description = "README mirror for slurp"
draft = false
+++

[Repository](https://github.com/sguzman/slurp) | [DeepWiki](https://deepwiki.com/sguzman/slurp/)

# slurp

`slurp` is a lightweight Rust CLI tool for batch-inserting JSON data into [SurrealDB](https://surrealdb.com/).
It reads a JSON array from a file, splits it into batches, and inserts each batch into a SurrealDB table over HTTP.
Parallel insertion, colored logs, and flexible verbosity levels make it practical for handling large payloads.

---

## Features

* **Chunked inserts**: split large JSON arrays into batches of configurable size.
* **Parallel execution**: run multiple inserts concurrently with a `--thread` flag.
* **Color-coded logs**: timestamps and verbosity control for easy diagnostics.
* **Dry-run mode**: check how data would be split without touching the database.
* **Zero auth assumption**: connects to SurrealDB without authentication headers.
* **Functional style**: uses immutable dataflow with Rayon for parallel processing.

---

## Installation

With Nix (recommended, using the flake):

```bash
# Build the package
nix build .#slurp

# Run the CLI
nix run .#slurp -- --help
```

Or enter the devshell:

```bash
nix develop
cargo run -- --help
```

Without Nix:

```bash
cargo build --release
./target/release/slurp --help
```

---

## Usage

```bash
slurp [OPTIONS] --ns <NS> --db <DB> --table <TABLE> --data <FILE>
```

### Required flags

* `--ns <NS>`: SurrealDB namespace
* `--db <DB>`: SurrealDB database
* `--table <TABLE>`: destination table
* `--data <FILE>`: path to JSON array file, e.g. `payload.json`

### Optional flags

* `--host <HOST>`: SurrealDB host (default: `localhost`)
* `--port <PORT>`: SurrealDB port (default: `8000`)
* `--batch <N>`: batch size (default: `500`, must be > 0)
* `--thread <N>`: number of parallel worker threads (default: `4`, must be > 0)
* `--verbosity <0|1|2>`: log level

  * `0`: warnings only
  * `1`: info (default)
  * `2`: debug
* `--dry-run`: parse input and log batch splits without sending any requests

### Example

```bash
# Insert a JSON payload into the "book" table, 500 items at a time, using 6 threads
slurp \
  --host localhost \
  --port 10035 \
  --ns books \
  --db library \
  --table book \
  --data payload.json \
  --batch 500 \
  --thread 6 \
  --verbosity 1
```

Dry-run mode:

```bash
slurp --ns books --db library --table book --data payload.json --dry-run
```

---

## Input format

The JSON file must be a **single array** of objects:

```json
[
  { "id": 1, "title": "Foo" },
  { "id": 2, "title": "Bar" }
]
```

---

## Logging

Logs are timestamped and color-coded.
Verbosity is controlled with `--verbosity`:

* **0** → warnings only
* **1** → info (default, shows batch progress)
* **2** → debug (adds insert statements and SurrealDB responses)

---

## Design

* **Immutable batching**: JSON input is split into `Vec<Vec<Value>>` without mutation.
* **Parallel map-reduce**: batches are processed concurrently using Rayon’s parallel iterators.
* **Functional dataflow**: results are folded and reduced into success/failure counts.
* **No shared state**: logging and result collection are thread-safe.

---

## Development

### Devshell (Nix)

```bash
nix develop
```

Includes:

* Rust toolchain (`cargo`, `clippy`, `rustfmt`)
* `cargo-release` and `git-cliff` for semver and changelogs
* `mold` + `clang` for faster linking
* Nix tools (`alejandra`, `statix`, `deadnix`)
* SurrealDB CLI for testing

### Build and test

```bash
cargo fmt
cargo clippy -- -D warnings
cargo test
```

---

## Roadmap

* [ ] Add optional authentication flags
* [ ] Support TLS endpoints
* [ ] Retry failed batches with exponential backoff
* [ ] Export metrics (Prometheus/Grafana)

---

## [License](./LICENSE)

CC0-1.0 © 2025
