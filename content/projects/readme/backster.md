+++
title = "backster README"
description = "README mirror for backster"
draft = false
+++

[Repository](https://github.com/sguzman/backster) | [DeepWiki](https://deepwiki.com/sguzman/backster/)

# Backster

Backster is a Rust command-line research bench for experimenting with trading ideas against time-series market data. It focuses on repeatable, config-driven runs rather than notebook-centric workflows: you point the binary at a TOML file, Backster loads a price series, runs a strategy or optimizer, and reports return statistics.

Today the repo is primarily oriented around:

- backtesting long/short strategies over daily close data
- fitting rolling return distributions and turning them into trade signals
- running repeatable multi-run experiments for stochastic strategies
- fetching and caching market data through Wolfram / WSTP
- prototyping pipeline-style signal generation in TOML instead of hard-coding every idea in Rust

## What The Project Does

Backster has two top-level execution modes:

- `backtest`: load a price series, instantiate a strategy, step bar-by-bar through the data, and report final return
- `optimize`: run a hindsight optimizer over a close-price series to compute the best achievable result under a trade-count limit

The current implementation is strongest in `backtest` mode. `optimize` mode exists, but only the perfect-foresight path (`know_future = true`) is implemented right now.

## Current Data Model

The main CLI currently consumes data through the `[data]` section of a TOML config. Supported sources are:

- `wolfram_financial`: fetches a close-price series from Wolfram `FinancialData`
- `wolfram_expr`: evaluates a Wolfram Language expression that returns a `TimeSeries` or a list of `{DateObject, value}` pairs

Backster converts those series into internal `Bar` values and, where needed, also requests rolling distribution-fit metadata from Wolfram.

There is also a Polars-based loader under `src/data/loader.rs` for CSV/dataframe utilities, but that is supporting infrastructure rather than the primary CLI path at the moment.

## Requirements

### Rust

The crate uses Rust edition `2024`. Standard commands:

```bash
cargo build
cargo test
cargo run -- --config strats/config.example.toml
```

### Wolfram / WSTP

This repository currently depends on a local Wolfram installation because the build script links against WSTP and the runtime uses a Wolfram kernel for data retrieval and feature generation.

You will typically need one of:

```bash
export WSTP_DIR=/path/to/.../SystemFiles/Links/WSTP/DeveloperKit/Linux-x86-64/CompilerAdditions
```

or:

```bash
export WOLFRAM_DIR=/path/to/Wolfram
```

Optional runtime override:

```bash
export WOLFRAMKERNEL=/path/to/WolframKernel
```

The build script (`build.rs`) searches common Linux Wolfram install locations if those variables are not set, but if WSTP is missing the crate will not build.

## CLI Usage

Backster accepts a config path plus a small number of flags:

```bash
cargo run -- --config path/to/config.toml
cargo run -- path/to/config.toml
cargo run -- config path/to/config.toml
```

Optional flags:

- `--quiet` / `-q`: suppress tracing output and print only the final return percentage for each run
- `--n-times N`: execute the same config `N` times and print aggregate statistics afterward

Example:

```bash
cargo run -- --config strats/config.smoke.toml --n-times 20
```

`--n-times` is especially useful for strategies that use random sampling internally, such as `normal_noise_investor`, `rolling_pvalue_predictor`, and the flexible pipeline distribution-sampling flow.

## Configuration Overview

The root config shape is:

```toml
mode = "backtest" # or "optimize"

[data]
# data source config

[backtest]
# required when mode = "backtest"

[optimizer]
# required when mode = "optimize"
```

### Data Section

`wolfram_financial`:

```toml
[data]
source = "wolfram_financial"
symbol = "AAPL"
start = "2022-01-01"
end = "2023-01-01"
field = "Close"
resolution = "day"
kernel = "/optional/path/to/WolframKernel"
```

Fields:

- `symbol`: asset identifier passed to Wolfram `FinancialData`
- `start`, `end`: ISO date strings
- `field`: defaults to `"Close"`
- `resolution`: defaults to `"day"`; daily resolution is the only supported `wolfram_financial` resolution today
- `kernel`: optional per-config kernel override

`wolfram_expr`:

```toml
[data]
source = "wolfram_expr"
expr = "TimeSeries[...]"
kernel = "/optional/path/to/WolframKernel"
```

This is the easiest way to run self-contained smoke tests because the data can be generated inline without external files.

### Backtest Section

```toml
[backtest]
starting_cash = 100000.0
allow_margin = false
window = 30
trade_resolution = "bar"
holding_period_bars = 1
log_bars = true
log_trades = true
```

Key fields:

- `starting_cash`: initial account equity
- `allow_margin`: whether long entries and short collateral checks may exceed cash
- `window`: lookback window used by strategies that require rolling history/fits
- `trade_resolution`: descriptive label written into logs
- `holding_period_bars`: used by strategies that hold positions across multiple bars
- `log_bars`: emit per-bar tracing output
- `log_trades`: emit trade entry/exit tracing output

### Optimizer Section

```toml
[optimizer]
starting_cash = 100000.0
max_trades = 10
allow_long = true
allow_short = true
know_future = true
```

Notes:

- `know_future = true` is required today
- the optimizer consumes only close prices
- `max_trades` counts completed round trips in the dynamic-programming optimizer

There is no checked-in optimize sample config at the moment.

## Strategy Types

Backtest mode selects a strategy under `[backtest.strategy]` via `kind`.

### 1. `rolling_pvalue_predictor`

This strategy relies on Wolfram-provided rolling fits. For each bar, it reads p-values and fitted distribution parameters for:

- Normal
- Student's t
- Laplace
- Logistic
- Cauchy

It samples from each fitted distribution, weights each sample by its goodness-of-fit p-value, and converts the weighted result into a predicted next-step log return.

Main parameters:

- `enter_threshold`
- `exit_threshold`
- `normalize_weights`
- `min_total_weight`
- `force_trade_each_bar`

This is the most tightly coupled strategy to the Wolfram feature pipeline.

### 2. `adhoc_distribution_predictor`

This strategy fits distributions on the Rust side from a rolling window of observed log returns. It tests the fit of several candidate families and uses sampled values weighted by p-values to produce a trading signal.

Options include:

- `use_ad_test = true|false` to switch between Anderson-Darling and KS testing
- `normalize_weights`
- `min_total_weight`
- `force_trade_each_bar`

### 3. `adhoc_normal_predictor`

A simplified version of the ad-hoc approach that fits only a normal distribution to the rolling return window and derives a signal from that fit.

### 4. `normal_noise_investor`

A baseline stochastic strategy. Each bar it draws `z ~ Normal(0, 1)`, clamps the absolute allocation fraction, and goes long or short based on the sign of `z`.

Parameters:

- `max_abs_fraction`
- `min_trade_cash`

This is mainly useful as a randomness/control benchmark and for exercising the multi-run reporting path.

### 5. `flexible_pipeline_predictor`

This is the most configurable strategy family in the repo. Instead of hard-coding one signal model, you define a sequence of pipeline steps in TOML and Backster evaluates them bar-by-bar.

Important conventions:

- the final signal is expected to be a scalar step named `prediction`
- `execution_mode` can be `threshold` or `linear`
- `force_trade_each_bar` can enforce one close-and-reopen cycle per bar

## Pipeline DSL

Supported pipeline operations come from the `PipelineStep` enum in `src/config.rs`.

### `log_returns`

```toml
[[backtest.strategy.pipeline]]
name = "returns"
op = "log_returns"
window = 60
```

Maintains a rolling vector of log returns.

### `fit_distributions`

```toml
[[backtest.strategy.pipeline]]
name = "fits"
op = "fit_distributions"
input = "returns"
families = ["Normal", "StudentsT", "Laplace", "Logistic", "Cauchy"]
test = "KS"
```

Fits one or more distributions to a return series and stores p-values plus one sampled value per family. `test` may be `KS` or `AD`.

### `sample`

```toml
[[backtest.strategy.pipeline]]
name = "samples"
op = "sample"
input = "fits"
```

Extracts sampled values from a fit result.

### `aggregate`

```toml
[[backtest.strategy.pipeline]]
name = "prediction"
op = "aggregate"
method = "weighted_sum"
values = "fits"
weights = "fits"
```

Supported aggregation methods:

- `mean`
- `weighted_mean`
- `median`
- `sum`
- `weighted_sum`

### `scale`

```toml
[[backtest.strategy.pipeline]]
name = "scaled"
op = "scale"
input = "prediction"
factor = 0.5
```

Scales a scalar output.

### `lookahead`

```toml
[[backtest.strategy.pipeline]]
name = "next_day_return"
op = "lookahead"
input = "market_return"
shift = 1
```

Currently only the special input `market_return` is supported. This is used for oracle-style experiments.

### `sign`

```toml
[[backtest.strategy.pipeline]]
name = "prediction"
op = "sign"
input = "next_day_return"
```

Converts a scalar to `-1.0`, `0.0`, or `1.0`.

### `wolfram_eval`

The enum supports a `wolfram_eval` step, but the strategy implementation currently warns that it is not implemented.

## Example Configs In `strats/`

The repository includes several useful starting points:

- `strats/config.example.toml`: annotated example of the flexible pipeline predictor
- `strats/config.smoke.toml`: self-contained smoke-test config using inline Wolfram expression data
- `strats/config.fast.toml`: smaller SP500 backtest config
- `strats/config.sp500_pipeline.toml`: pipeline-based SP500 example
- `strats/config.sp500_adhoc.toml`: ad-hoc distribution strategy example
- `strats/config.sp500_normal.toml`: ad-hoc normal strategy example
- `strats/config.normal_noise.toml`: random baseline strategy example
- `strats/config.oracle.toml`: perfect-information pipeline example using `lookahead`
- `strats/config.linear_cash.toml` and `strats/config.linear_leveraged.toml`: linear execution-mode variants

If you are onboarding to the repo, `strats/config.smoke.toml` is the safest first run because it does not depend on external market symbols.

## Runtime Flow

A typical backtest run looks like this:

1. `src/main.rs` parses CLI arguments and loads the TOML config.
2. `src/modes/backtest.rs` loads price data and any needed rolling-fit features.
3. A strategy is constructed from `[backtest.strategy]`.
4. `src/backtest/engine.rs` iterates through bars and delegates trading decisions to the strategy.
5. The engine tracks cash, position, realized PnL, and trade count.
6. The final equity is converted to a percentage return.
7. If `--n-times` is greater than `1`, `src/report/multi_run.rs` prints aggregate stats.

The optimize path is simpler:

1. load close prices
2. run `optimizer::optimize_trades`
3. compute final return
4. optionally repeat and aggregate

## Caching

Wolfram results are cached under `.cache/backster/` using a BLAKE3-derived key. The cache key includes both request parameters and the contents of the Wolfram script file used to compute the result.

That means:

- repeated runs avoid recomputing the same Wolfram payload
- changing `wls/math1.wls` invalidates prior cache entries naturally

## Logging And Output

Backster uses `tracing` for console diagnostics.

When `--quiet` is not set, runs can emit:

- per-bar state logs
- trade entry/exit logs
- strategy-specific diagnostic logs
- final run summaries

When `--quiet` is set, the program prints only the final percentage return for each run. If multiple runs are requested, a summary table is printed afterward with:

- min / max
- mean / median
- standard deviation
- skewness / kurtosis
- geometric mean when defined

## Project Layout

```text
.
├── Cargo.toml              # Crate manifest and dependencies
├── Cargo.lock              # Locked dependency graph
├── README.md               # Project documentation
├── build.rs                # WSTP discovery and linker setup
├── strats/                 # Example TOML configs for backtests and experiments
├── wls/                    # Wolfram Language scripts used by runtime/tests
├── src/
│   ├── main.rs             # CLI entrypoint and mode dispatch
│   ├── config.rs           # Full TOML config schema
│   ├── cache.rs            # On-disk JSON caching for Wolfram payloads
│   ├── backtest/
│   │   ├── mod.rs
│   │   └── engine.rs       # Account, position, and bar-by-bar execution engine
│   ├── modes/
│   │   ├── mod.rs
│   │   ├── backtest.rs     # Backtest-mode orchestration
│   │   └── optimize.rs     # Optimize-mode orchestration
│   ├── strategy/
│   │   ├── mod.rs          # Strategy trait
│   │   ├── rolling_pvalue.rs
│   │   ├── adhoc_dist.rs
│   │   ├── adhoc_normal.rs
│   │   ├── normal_noise.rs
│   │   └── pipeline.rs     # Flexible TOML-defined signal pipeline
│   ├── optimizer/
│   │   └── mod.rs          # Hindsight trade-count optimizer
│   ├── wolfram/
│   │   ├── mod.rs
│   │   ├── wstp.rs         # WSTP session integration
│   │   └── data.rs         # Wolfram data retrieval and fit decoding
│   ├── stats/
│   │   ├── mod.rs
│   │   ├── ks.rs           # KS goodness-of-fit helper
│   │   ├── ad.rs           # Anderson-Darling helper
│   │   └── rolling_fit.rs  # Rust-side rolling fit utilities
│   ├── report/
│   │   ├── mod.rs
│   │   ├── ascii.rs        # Small terminal visualization helpers
│   │   └── multi_run.rs    # Aggregate statistics for repeated runs
│   ├── data/
│   │   ├── mod.rs
│   │   └── loader.rs       # Polars dataframe loading helpers
│   └── features/
│       ├── mod.rs
│       └── types.rs        # Serializable feature/result structures
├── logs/                   # Local log/output artifacts if used manually
├── tmp/                    # Scratch space used during development
└── target/                 # Cargo build output
```

### Notes On Less-Active Modules

Some modules look like infrastructure for future expansion or alternative research flows rather than the core CLI path today:

- `src/data/loader.rs` provides Polars dataframe helpers
- `src/features/` defines serializable feature containers
- `src/stats/rolling_fit.rs` contains Rust-side rolling-fit utilities that are adjacent to, but distinct from, the Wolfram-backed path
- `src/report/ascii.rs` contains a sparkline helper that is not central to the current CLI output

## Known Limitations

- the repo currently requires Wolfram / WSTP to build and run the main CLI path
- `optimize` mode only works with `know_future = true`
- `wolfram_financial` currently supports daily resolution only
- the `wolfram_eval` pipeline step is declared but not implemented in the strategy runtime
- there is no checked-in canonical optimize config
- some strategy behavior is still research-oriented and intentionally experimental rather than polished for production trading use

## Good First Commands

Build the project:

```bash
cargo build
```

Run a self-contained smoke test:

```bash
cargo run -- --config strats/config.smoke.toml
```

Run repeated stochastic experiments quietly:

```bash
cargo run -- --config strats/config.normal_noise.toml --quiet --n-times 50
```

Inspect a pipeline config:

```bash
sed -n '1,200p' strats/config.example.toml
```

## Development Notes

If you need to extend the repo, the most important files to read first are:

- `src/main.rs`
- `src/config.rs`
- `src/modes/backtest.rs`
- `src/backtest/engine.rs`
- `src/strategy/pipeline.rs`
- `src/wolfram/data.rs`

Those files capture most of the current control flow, configuration surface area, and project-specific behavior.
