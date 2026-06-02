+++
title = "zimrs README"
description = "README mirror for zimrs"
draft = false
+++

[Repository](https://github.com/sguzman/zimrs) | [DeepWiki](https://deepwiki.com/sguzman/zimrs/)

# zimrs

`zimrs` converts Wiktionary `.zim` archives into a queryable dictionary database and includes tooling for verification, reindexing, export, benchmarking, and release packaging.

## Intent

Turn large offline dictionary archives into a maintainable searchable database with enough operational tooling to verify correctness and ship releases confidently.

## Ambition

The breadth of commands, benchmarks, scripts, and release helpers suggests an ambition to be a dependable ingestion and release pipeline for offline dictionary data rather than a single conversion command.

## Current Status

The project already has a mature command surface, benchmarks, docs, scripts, tests, and backend support. It looks operationally serious.

## Core Capabilities Or Focus Areas

- Convert `.zim` archives into database records.
- Support verification, export, and incremental reindex flows.
- Work with PostgreSQL and SQLite backends.
- Benchmark and benchmark-report related artifacts.
- Package release outputs and synthetic sample data.

## Project Layout

- `benches/`: benchmark code run through Cargo benchmark tooling.
- `benchmarks/`: benchmark assets, reports, or reference results.
- `config/`: checked-in runtime configuration and configuration examples.
- `docs/`: project documentation, reference material, and roadmap notes.
- `scripts/`: helper scripts for development, validation, or release workflows.
- `src/`: Rust source for the main crate or application entrypoint.
- `tests/`: automated tests, fixtures, or parity scenarios.
- `Cargo.toml`: crate or workspace manifest and the first place to check for package structure.

## Setup And Requirements

- Rust toolchain.
- A Wiktionary `.zim` archive to ingest.
- Configured database backend for the chosen workflow.

## Build / Run / Test Commands

```bash
cargo build
cargo test
cargo run -- --help
```

## Notes, Limitations, Or Known Gaps

- Backend choice is a meaningful operational decision in this repo.
- This is as much an operational pipeline as it is a parser/importer.

## Next Steps Or Roadmap Hints

- Keep verification and release packaging tied to the ingest pipeline as new data quirks are discovered.
- Document any backend-specific tradeoffs more explicitly if both backends remain first-class.
