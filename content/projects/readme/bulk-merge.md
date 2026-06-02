+++
title = "bulk-merge README"
description = "README mirror for bulk-merge"
draft = false
+++

[Repository](https://github.com/sguzman/bulk-merge) | [DeepWiki](https://deepwiki.com/sguzman/bulk-merge/)

# bulk-merge

`bulk-merge` is a Rust CLI for loading large bibliographic metadata dumps into PostgreSQL in a reproducible, resumable, and inspectable way.

The repository is centered on bulk ingestion workflows for datasets such as LibGen and OpenLibrary. It provides:

- a CLI for provisioning schemas, ingesting dumps, and inspecting status
- PostgreSQL migrations for metadata bookkeeping and source schemas
- resumability for long-running imports
- an offline path for converting very large SQL dumps into intermediate TSV files before `COPY` loading
- configuration-driven behavior for naming, typing, logging, indexing, retry, and cache layout

## What The Project Does

At a high level, `bulk-merge` turns source dump files into queryable PostgreSQL tables while keeping enough metadata to answer:

- what dataset was loaded
- which import run created it
- whether a run completed or failed
- where resumable work should continue
- which tables were staged, swapped, or updated

The codebase currently has two source-specific ingestion domains:

- `libgen`: the most developed path, including direct ingest/update and offline convert/load flows
- `openlibrary`: a narrower ingest path for line-oriented OpenLibrary dumps

## Current Capabilities

### LibGen

The LibGen path is the main focus of the repository today.

Supported operations:

- `init-db`: create metadata schemas/tables and optionally provision LibGen tables from configured dumps
- `libgen ingest`: parse a MySQL dump and load rows into PostgreSQL
- `libgen update`: incrementally apply a newer dump using configured primary keys or row-hash de-duplication
- `libgen convert`: transform a dump into resumable intermediate TSV artifacts
- `libgen load`: load those TSV artifacts into PostgreSQL using `COPY FROM STDIN`
- `libgen load-status`: inspect resumable offline load progress
- `libgen stats`, `sample`, `validate`, `reset`: operational inspection and maintenance helpers

Important implementation details:

- table provisioning is driven from `CREATE TABLE` statements discovered in the source dump
- row loading supports typed columns via `libgen.typing.mode = "best_effort"` or legacy all-`text` mode
- resumability is tracked in `bm_meta.import_run`, `bm_meta.import_checkpoint`, and `bm_meta.offline_swap_progress`
- offline load uses a staging-and-swap strategy under `bm_staging` before publishing tables into the live LibGen schema
- incremental update can optionally delete rows not present in the newer dump when configured with a single-column primary key

### OpenLibrary

The OpenLibrary path is simpler than LibGen but already integrated into the same run metadata model.

Supported operation:

- `openlibrary ingest`: ingest configured `authors`, `editions`, and `works` dumps into `src_openlibrary`

## End-To-End Flow

The normal lifecycle for a source dataset looks like this:

1. Load configuration from `config/bulk-merge.toml` plus sibling `*.toml` files in the same directory.
2. Connect to PostgreSQL and run embedded migrations.
3. Create an `import_run` entry in `bm_meta`.
4. Provision or resolve target tables for the selected source.
5. Ingest rows directly, or convert to offline TSV artifacts and then load them.
6. Record checkpoints and progress metadata while work is running.
7. Mark the run as succeeded or failed and update dataset-level state.

For very large LibGen imports, the intended operational path is often:

1. `bulk-merge libgen convert`
2. `bulk-merge libgen load`
3. `bulk-merge libgen load-status` if recovery or inspection is needed

## Repository Layout

The repo is small enough to navigate directly, but it is opinionated in how responsibilities are split:

```text
.
├── Cargo.toml                  # crate manifest
├── README.md                   # top-level project documentation
├── rust-toolchain.toml         # pinned Rust toolchain
├── config/
│   ├── bulk-merge.toml         # main application config
│   ├── libgen.toml             # LibGen-specific config merged into the main config
│   └── openlibrary.toml        # OpenLibrary-specific config merged into the main config
├── docs/
│   ├── cli.md                  # command reference
│   ├── config.md               # configuration reference
│   ├── cache.md                # cache/offline artifact layout
│   ├── roadmaps/               # higher-level feature roadmaps
│   └── tranches/               # implementation notes and design slices
├── migrations/                 # SQL migrations applied by sqlx at runtime
├── src/
│   ├── main.rs                 # CLI entrypoint
│   ├── lib.rs                  # crate module exports
│   ├── cli/                    # argument parsing and command dispatch
│   ├── config/                 # merged TOML model, normalization, validation, env overrides
│   ├── db/                     # PostgreSQL access and schema/table helpers
│   ├── libgen/                 # LibGen parsing, provisioning, ingest, offline load, typing
│   ├── openlibrary/            # OpenLibrary parsing and ingest
│   ├── observability/          # tracing/logging setup
│   ├── output.rs               # optional machine-readable report output
│   └── progress.rs             # long-running progress ticker/reporting
├── tests/
│   ├── libgen_incremental.rs   # incremental upsert/delete behavior
│   └── libgen_offline_load_resumable.rs
└── tmp/
    ├── docker-compose.yaml     # local Postgres helper for development
    └── project.md              # local notes / scratch material
```

### `src/` module map

- `src/main.rs`: parses CLI args, loads config, initializes tracing, dispatches commands
- `src/cli/args.rs`: the full CLI contract
- `src/cli/commands/`: command implementations for `init-db`, `libgen`, and `openlibrary`
- `src/config/model.rs`: the main typed configuration model, normalization, defaults, and validation
- `src/db/meta.rs`: connection setup, migrations, bookkeeping tables, and schema/table DDL helpers
- `src/libgen/mysql_dump.rs`: MySQL dump parsing primitives
- `src/libgen/provision.rs`: derive PostgreSQL table definitions from dump schema
- `src/libgen/ingest.rs`: direct ingest/update logic
- `src/libgen/offline.rs`: dump-to-TSV conversion and resumable staging/swap load
- `src/libgen/typing.rs`: best-effort MySQL-to-Postgres value coercion
- `src/openlibrary/parser.rs` and `src/openlibrary/ingest.rs`: line parsing and row loading for OpenLibrary dumps

## Database Layout

The project manages both source data schemas and bookkeeping schemas.

### Metadata schema

By default, operational metadata lives under `bm_meta`:

- `import_run`: one row per ingest/load/update run
- `import_file`: per-file tracking metadata
- `import_checkpoint`: resumability checkpoints
- `dataset_state`: last successful run per source/dataset/kind
- `offline_swap_progress`: staging/swap progress for resumable offline loads
- `raw_statement`: optional raw LibGen statement capture for provenance/debugging
- `seen_pk`: optional tracking used by incremental delete handling

### Source schemas

Default live schemas:

- `src_libgen`
- `src_openlibrary`

Default staging schema:

- `bm_staging`

These schema names are configurable in TOML.

## Configuration Model

The default entry config is:

```bash
config/bulk-merge.toml
```

`AppConfig::load` does more than load a single file:

- it reads the main file you pass with `--config`
- it also reads sibling `*.toml` files in the same directory
- files like `config/libgen.toml` and `config/openlibrary.toml` are merged into top-level `libgen` and `openlibrary` sections
- environment variables can override PostgreSQL and logging settings

Key config areas:

- `paths.*`: cache directory and cache policy
- `postgres.*`: target connection, pool, schema names, indexing, and optional statement timeout
- `logging.*`: human or JSON logs
- `execution.*`: dry-run default, concurrency, batching, retry, memory guards
- `progress.*`: periodic progress logging interval
- `output.*`: optional JSONL reporting
- `libgen.*`: dump parsing, offline conversion/load, resumability, incremental strategy, typing, indexing
- `openlibrary.*`: source dump paths and dataset id

Detailed references:

- [docs/config.md](docs/config.md)
- [docs/cache.md](docs/cache.md)

## CLI Overview

Global flags:

- `--config <path>`
- `--dry-run`
- `--log-level <trace|debug|info|warn|error>`
- `--log-format <human|json>`

Top-level commands:

- `bulk-merge init-db`
- `bulk-merge libgen ...`
- `bulk-merge openlibrary ...`

LibGen subcommands:

- `ingest`
- `update`
- `stats`
- `sample`
- `validate`
- `convert`
- `load`
- `load-status`
- `reset`

OpenLibrary subcommands:

- `ingest`

For the precise CLI contract, see [docs/cli.md](docs/cli.md) or run:

```bash
cargo run -- --help
cargo run -- libgen --help
```

## Getting Started

### Prerequisites

- Rust toolchain matching `rust-toolchain.toml`
- a reachable PostgreSQL instance
- source dump files for the dataset you want to ingest

### Development setup

Build the crate:

```bash
cargo build
```

Run tests:

```bash
cargo test
```

Initialize database metadata and schemas:

```bash
cargo run -- init-db
```

Inspect the CLI:

```bash
cargo run -- --help
```

### Typical LibGen workflows

Direct ingest:

```bash
cargo run -- libgen ingest --kind fiction --dump /path/to/fiction.sql
```

Incremental update:

```bash
cargo run -- libgen update --kind fiction --dump /path/to/newer-fiction.sql
```

Offline convert/load:

```bash
cargo run -- libgen convert --kind fiction --dump /path/to/fiction.sql
cargo run -- libgen load --in-dir .cache/bulk-merge/libgen-offline/fiction
```

OpenLibrary ingest:

```bash
cargo run -- openlibrary ingest
```

## Testing Strategy

The repository includes integration-style tests for the riskiest current behaviors:

- incremental LibGen updates, including upsert plus delete handling
- resumable LibGen offline staging/swap load after interruption

Those tests live in `tests/` and exercise real database behavior through the crate’s public modules.

## Documentation Guide

If you are new to the repo, read in this order:

1. `README.md`
2. [docs/cli.md](docs/cli.md)
3. [docs/config.md](docs/config.md)
4. [docs/cache.md](docs/cache.md)
5. `docs/roadmaps/` for planned direction

The `docs/tranches/` directory is useful when you want implementation context, tradeoff notes, or the reasoning behind specific slices of the current design.

## Status

This is not a generic ETL framework. It is a source-aware ingestion tool with concrete operational support for large bibliographic dumps, especially LibGen.

The codebase already supports production-style concerns such as:

- migration-managed schema setup
- resumable long-running imports
- configurable typing and indexing
- dry-run behavior
- progress logging
- offline staging/swap publication

The roadmap documents in `docs/roadmaps/` show where the project is still evolving.
