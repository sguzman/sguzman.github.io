+++
title = "nflxport README"
description = "README mirror for nflxport"
draft = false
+++

[Repository](https://github.com/sguzman/nflxport) | [DeepWiki](https://deepwiki.com/sguzman/nflxport/)

# nflxport

A high-performance Rust toolkit for working with `nflverse` data.

## Features

- **Blazing Fast**: Powered by Polars and Rust.
- **Idempotent Caching**: Efficiently manage large Parquet datasets under `.cache/nflxport`.
- **Analytical Query Engine**: Perform statistical queries directly from the CLI.
- **Wolfram Mathematica Bridge**: Seamlessly export data for advanced symbolic analysis.

## Installation

```bash
cargo build --release
```

The CLI binary is located at `target/release/nflx`.

## Usage

### Fetching Data

```bash
nflx fetch stats
nflx fetch pbp --season 2023
```

### Analytical Queries

#### Statistical Leaders

```bash
nflx stats leaders passing_yards --limit 5
```

#### Team Summary

```bash
nflx stats team-summary KC
```

#### Player Search

```bash
nflx stats player-search Mahomes
```

### Analytical Database (DuckDB)

Nflxport includes a built-in DuckDB engine for high-performance SQL queries.

#### Building the Database

Ingest cached Parquet files into the local DuckDB instance:

```bash
nflx db build
```

#### Running SQL Queries

Execute arbitrary SQL queries against the local database:

```bash
nflx db query "SELECT team_abbr, team_name FROM teams LIMIT 5"
```

Perform complex multi-table joins:

```bash
nflx db query "SELECT p.posteam, t.team_name, count(*) as play_count \
FROM pbp_2023 p JOIN teams t ON p.posteam = t.team_abbr \
GROUP BY ALL ORDER BY play_count DESC LIMIT 5"
```

### Mathematica Export

Nflxport provides a powerful symbolic bridge to Mathematica. By default, it
generates a **standalone** `.wl` manifest with all data embedded, making it
perfectly portable between Linux/WSL and Windows.

1. **Generate the Manifest**:
   By default, this will scan your cache and embed *all* available datasets
   (Teams, Schedules, Players, Stats, and all cached PBP years).

   ```bash
   nflx export wolfram
   ```

   *Use the `--referenced` flag if you prefer the manifest to point to external
   CSVs instead of embedding them.*

2. **Load in Mathematica**:
   You can load the generated file directly or install it to your
   Applications folder.

   ```bash
   nflx install wolfram
   ```

3. **Symbolic Data Exploration**:
   Once loaded, use high-level helpers to explore the data symbolically:

   ```mathematica
   Needs["NFLXport`"]

   (* Get data for a specific team *)
   NFLTeam["KC"]

   (* Search for players by name *)
   NFLPlayerSearch["Mahomes"]

   (* Explore a season summary *)
   NFLSeason[2024]["QBLeaders"] // Take[#, 5] &
   ```

## Project Structure

- `crates/nflxport-core`: Core logic, data fetching, and query engine.
- `crates/nflxport-cli`: CLI interface (`nflx`).
- `crates/nflxport-wolfram`: Mathematica bridge.

## License

CC0-1.0
