+++
title = "wxmatch README"
description = "README mirror for wxmatch"
draft = false
+++

[Repository](https://github.com/sguzman/wxmatch) | [DeepWiki](https://deepwiki.com/sguzman/wxmatch/)

# wxmatch

`wxmatch` is a Rust CLI for downloading, caching, normalizing, querying, and comparing station-level weather observations.

The project is aimed at a workflow like:

1. Fetch historical observations for a station.
2. Normalize them into one canonical observation model.
3. Build daily summaries and hourly day profiles.
4. Ask questions such as:
   - What happened on this day?
   - How likely is today to reach a target high?
   - Which historical days looked most like this one?

## Status

### Implemented now

- Async Rust CLI built with `clap`
- Structured console and rolling JSON file logging with `tracing`
- Stable cache layout under `.cache/wxmatch/`
- Station metadata fetch via the NWS API
- Historical adapters for `IEM ASOS 1-minute`, `NOAA/NCEI ASOS 5-minute`, and `GHCNh`
- Current observation fetch for `NWS API` with repeated snapshots preserved by timestamp
- Canonical normalized observations stored in Parquet
- Derived daily summaries and hourly day profiles stored in Parquet
- Source precedence for overlapping timestamps: `NCEI 5-minute` -> `IEM 1-minute` -> `NWS API` -> `GHCNh`
- `query day`
- `query prob`
- `query analogs`
- `cache manifests`
- `query duckdb-paths`
- `cache doctor` warnings for missing or stale manifests
- `--format text|json` for `source list`, `station inspect`, manifest inspection, and query commands

### Planned next

- Additional calibration and validation against larger backfilled station histories
- More provenance detail for overlapping-source reconciliation
- Broader source and station coverage testing outside the current smoke set

## Why These Sources

- `IEM ASOS 1-minute`: fastest path to useful high-frequency U.S. station history with a straightforward download interface.
- `NOAA/NCEI ASOS 5-minute`: authoritative U.S. archive for later validation and fallback.
- `NWS API`: current-station metadata and live observation snapshots for `today` workflows.
- `GHCNh`: lower-frequency but broad-coverage fallback for future non-ASOS expansion.

## Cache Philosophy

`wxmatch` keeps raw downloads and normalized outputs separate.

- Raw files are preserved for reproducibility and debugging.
- Normalized Parquet files are idempotent derived artifacts.
- Daily summaries and day profiles are Parquet datasets built from normalized observations.
- Logs are written under the cache so command runs are inspectable after the fact.

Default cache root:

```text
.cache/wxmatch/
```

Layout:

```text
.cache/wxmatch/
  sources/
    iem-asos-1min/
      raw/
      normalized/
    ncei-asos-5min/
      raw/
      normalized/
    nws-api/
      raw/
      normalized/
    ghcnh/
      raw/
      normalized/
  stations/
  derived/
  manifests/
  logs/
```

DuckDB-friendly dataset paths:

```text
sources/<source>/normalized/station=<id>/year=<yyyy>.parquet
derived/station=<id>/daily/year=<yyyy>.parquet
derived/station=<id>/profiles/year=<yyyy>.parquet
```

## CLI Shape

Top-level commands:

- `cache`
- `source`
- `station`
- `fetch`
- `normalize`
- `build`
- `query`

Examples that work today:

```bash
cargo run -- cache show
cargo run -- source list
cargo run -- source list --format json
cargo run -- station inspect KLAX
cargo run -- station inspect KLAX --format json
cargo run -- cache manifests --station KLAX
cargo run -- cache manifests --station KLAX --format json
cargo run -- fetch station KLAX --source iem-asos-one-minute --start 2026-05-14 --end 2026-05-14
cargo run -- fetch station KLAX --source ncei-asos-five-minute --start 2026-05-14 --end 2026-05-14
cargo run -- fetch station KLAX --source ghcnh --start 2026-05-14 --end 2026-05-14
cargo run -- normalize station KLAX --source iem-asos-one-minute
cargo run -- normalize station KLAX --source ncei-asos-five-minute
cargo run -- build daily KLAX --year 2026
cargo run -- build profiles KLAX --year 2026
cargo run -- query day KLAX 2026-05-14
cargo run -- query day KLAX 2026-05-14 --format json
cargo run -- query prob KLAX --date 2026-05-14 --threshold-high 75
cargo run -- query prob KLAX --today --threshold-high 80 --format json
cargo run -- fetch current KLAX
cargo run -- query analogs KLAX --date 2026-05-14 --top 10
cargo run -- query analogs KDEN --today --top 3 --format json
cargo run -- query duckdb-paths --station KLAX --year 2026
```

## Probability Output

`query prob` reports each available method separately and only emits a combined probability when at least two methods are available.

Implemented methods:

- `seasonal-climatology`
- `temperature-trajectory`
- `partial-profile-analogs`
- `nearest-neighbor-analogs`

Current fixed weights:

- climatology: `0.25`
- trajectory: `0.20`
- partial-profile analogs: `0.30`
- nearest-neighbor analogs: `0.25`

The combined result renormalizes across only the methods that are actually available for the target day. Output also includes unavailable methods, `quality_state`, cadence warnings, low-history notes, and current-day freshness notes when applicable.

## Logging

Console output is human-readable by default, while file logs are written as JSON.

Useful flags:

```bash
cargo run -- -v source list
cargo run -- --log-format json source list
cargo run -- --log-filter 'wxmatch=debug,reqwest=info' source list
```

## Developer Quickstart

Build:

```bash
cargo check
```

Test:

```bash
cargo test
```

Run formatting:

```bash
cargo fmt
```

Acceptance matrix:

```bash
bash scripts/acceptance_matrix.sh
```

Inspect cached Parquet with DuckDB:

```bash
duckdb -c "select cast(local_date as date) as local_date, high_temp_c * 9.0/5.0 + 32.0 as high_f from read_parquet('.cache/wxmatch/derived/station=KLAX/daily/year=2026.parquet') limit 5"
duckdb -c "select cast(observed_at_utc as timestamp) as observed_at_utc, temperature_c * 9.0/5.0 + 32.0 as temp_f from read_parquet('.cache/wxmatch/sources/ncei-asos-5min/normalized/station=KLAX/year=2026.parquet') limit 5"
cargo run -- query duckdb-paths --station KLAX --year 2026
```

## Notes on v1 Behavior

- The IEM path still targets the fields reliably exposed by the 1-minute endpoint: temperature, dew point, wind direction, wind speed, and pressure.
- The IEM adapter now also captures stable precipitation, visibility, and primary cloud-code fields when the export exposes them.
- When the richer IEM optional-field request is rejected for a station, `wxmatch` automatically retries the fetch with the core field set instead of failing the station outright.
- The NCEI 5-minute adapter parses METAR-style tokens from the NOAA archive and currently emphasizes temperature, dew point, wind, gust, visibility, precip tokens, cloud layers, and altimeter-derived pressure.
- The GHCNh adapter normalizes the stable hourly fields exposed by the PSV export and acts as a lower-resolution fallback.
- Relative humidity is derived during normalization when temperature and dew point are present.
- Current NWS observations add cloud cover, visibility, pressure, and gust fields when available, and repeated fetches keep multiple same-day raw snapshots.
- Analog matching is same-station only and prefers same-cadence candidates before mixed-cadence fallback days.
- Any analog or probability result that includes `GHCNh` fallback data is marked as mixed-cadence / lower-confidence in both text and JSON output.
- Current-day queries automatically refresh the latest NWS observation, merge it into the yearly Parquet dataset, and report freshness or stale-data notes.
- Sparse current-day queries now report explicit unavailability reasons when trajectory or analog methods do not yet have enough observed hours to run.

## Validation Bar

The current hardening bar is:

- deterministic unit coverage for query-quality state, sparse-day behavior, manifest warnings, and weighted combination
- acceptance flow on `KLAX` and `KDEN`
- operator checks via `source list --format json`, `station inspect --format json`, and `cache doctor`
- clean `cache doctor` after rebuilding derived datasets following any live `today` query

The checked-in acceptance workflow is:

```bash
bash scripts/acceptance_matrix.sh
```

## Project Plan

The implementation blueprint lives in [docs/plan/bootstrap.md](docs/plan/bootstrap.md).
