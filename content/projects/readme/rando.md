+++
title = "rando README"
description = "README mirror for rando"
draft = false
+++

[Repository](https://github.com/sguzman/rando) | [DeepWiki](https://deepwiki.com/sguzman/rando/)

# Rando

`rando` is a Rust statistics, distribution-fitting, and experimentation crate. It combines descriptive statistics, hypothesis tests, fitted probability distributions, rolling-window analysis, basic plotting, simple predictive models, and a small demo binary in one repository.

The codebase is currently structured more like a research toolkit than a polished end-user application: most of the value is in the reusable library modules under `src/`, while `src/main.rs` demonstrates one complete workflow on synthetic data.

## What The Project Does

The crate is built around a few recurring quantitative-analysis tasks:

- fit probability distributions to observed samples
- compare candidate distribution families
- run goodness-of-fit and classical hypothesis tests
- transform price-like time series into return series
- compute rolling p-values over sliding windows
- generate PNG plots of rolling test output
- fit simple linear, logistic, and nonlinear models
- experiment with small utility helpers such as unit conversion and 1D clustering

In practice, this makes the repository useful for simulation work, statistical verification, exploratory research, and prototyping time-series analysis pipelines in Rust.

## Current Shape Of The Repo

This is a single Cargo package with:

- a library crate exported from `src/lib.rs`
- a demo binary in `src/main.rs`
- a verification-oriented test module in `src/tests_verification.rs`

The binary is not a full CLI. Running `cargo run` executes a hard-coded example workflow:

1. generates a synthetic random-walk price series
2. converts prices into log returns
3. fits a Cauchy distribution over rolling windows
4. computes Kolmogorov-Smirnov p-values for each window
5. writes a PNG plot to `cauchy_p_values.png`
6. runs an Anderson-Darling test on the full return series using a fitted normal distribution

## Feature Areas

### Distribution Fitting

The `distrs` module defines the core distribution abstraction:

- `FittedDistribution`: common interface for fitted distributions
- `DistributionFit`: trait for fitting a family to raw data
- `FittedDistributionBox`: enum wrapper for heterogeneous fitted results

Implemented distribution families include:

- normal
- Student's t
- Cauchy
- Laplace
- logistic
- Poisson
- gamma
- negative binomial
- exponential
- Weibull
- log-normal
- chi-square
- empirical distribution
- Gaussian mixture
- kernel density estimate

The shared interface exposes methods such as:

- `pdf`
- `cdf`
- `inv_cdf`
- `sample` / `sample_many`
- `log_likelihood`
- `aic`
- `bic`
- `hazard_function`

The helper `find_distribution` attempts to choose a best fit by AIC. For non-negative integer data it first tries discrete families; otherwise it compares several continuous families.

### Hypothesis Testing

The `hypo_tests` module contains both classical tests and goodness-of-fit tests. Public coverage includes:

- one-sample t-test
- two-sample t-test
- one-sample z-test
- Shapiro-Wilk normality test
- Jarque-Bera normality test
- Pearson chi-square test
- variance test
- Levene / Brown-Forsythe style variance-homogeneity test
- correlation test
- Kolmogorov-Smirnov test against a fitted distribution
- Anderson-Darling test against a fitted distribution

Most tests return lightweight result structs containing at least a test statistic and p-value.

### Statistics Helpers

The `stats` module provides descriptive and robust statistics utilities, including:

- mean, median, variance, standard deviation
- quantiles and quartiles
- skewness and kurtosis
- trimmed and winsorized mean / variance
- median absolute deviation
- moving average and moving median
- harmonic, geometric, and contraharmonic means
- interquartile range and quartile skewness
- entropy
- mean deviation
- robust dispersion estimators such as `qn_dispersion` and `sn_dispersion`
- multivariate `spatial_median`

This module is the general-purpose toolbox used by the fitting and testing layers.

### Rolling Analysis Pipeline

The `pipeline` module contains the time-series style workflow helpers:

- `get_return_series`: converts dated levels into dated log returns
- `make_rolling_windows`: builds sliding windows over a numeric slice
- `rolling_distribution_p_values`: fits a distribution per window and records rolling KS p-values
- `RollingResult`: serializable container for grouped rolling scores

This is the clearest expression of the repo's intended workflow: transform a series, fit repeatedly over windows, and inspect how the goodness-of-fit evolves over time.

### Plotting

The `plotting` module currently focuses on one concrete visualization:

- `plot_rolling_p_values`

It writes a PNG chart using `plotters`, includes a significance threshold line at `0.05`, and is used directly by the demo binary.

### Models

The `models` module extends beyond pure distributions into predictive fitting:

- `LinearModelFit` and `linear_model_fit`
- `LogitModelFit` and `logit_model_fit`
- `NonlinearModelFit` and `nonlinear_model_fit`
- `FittedModel` trait for shared prediction / information-criterion access

These implementations use `argmin`'s Nelder-Mead solver rather than closed-form regression routines, which keeps the API shape consistent with the rest of the experimentation-oriented codebase.

### Miscellaneous Utilities

Additional modules include:

- `units`: a small `Quantity` type with basic unit conversion and arithmetic
- `clusters`: a simple 1D k-means-like clustering helper via `find_clusters`

## Example Library Usage

```rust
use rando::*;

fn demo(data: &[f64]) -> anyhow::Result<()> {
    let fit = NormalFit::fit(data)?;
    let ad = anderson_darling_test(data, &fit)?;

    println!("family = {}", fit.name());
    println!("params = {:?}", fit.params());
    println!("aic = {}", fit.aic(data));
    println!("ad p-value = {}", ad.p_value);

    Ok(())
}
```

A rolling workflow looks like this:

```rust
use anyhow::Result;
use chrono::NaiveDate;
use rando::*;

fn run(dates: &[NaiveDate], prices: &[f64]) -> Result<Vec<(NaiveDate, f64)>> {
    let (ret_dates, returns) = get_return_series(dates, prices);

    rolling_distribution_p_values(&ret_dates, &returns, 60, |window| {
        let fit = CauchyFit::fit(window)?;
        Ok(Box::new(fit) as Box<dyn FittedDistribution>)
    })
}
```

## Build, Run, And Test

Requirements:

- Rust toolchain with Cargo
- a local environment that can write generated output files

Useful commands:

```bash
cargo build
cargo run
cargo test
```

What to expect from `cargo run`:

- console output describing each analysis step
- a generated plot file, typically `cauchy_p_values.png`, in the repository root

## Project Layout

```text
.
|-- Cargo.toml                 # crate manifest and dependency list
|-- Cargo.lock                 # locked dependency graph
|-- README.md                  # project documentation
|-- src/
|   |-- lib.rs                 # library entrypoint; re-exports public modules
|   |-- main.rs                # demo binary showing an end-to-end workflow
|   |-- distrs/                # fitted distribution families and selection helpers
|   |   |-- mod.rs
|   |   |-- normal.rs
|   |   |-- student_t.rs
|   |   |-- cauchy.rs
|   |   |-- laplace.rs
|   |   |-- logistic.rs
|   |   |-- poisson.rs
|   |   |-- gamma.rs
|   |   |-- negative_binomial.rs
|   |   |-- exponential.rs
|   |   |-- weibull.rs
|   |   |-- log_normal.rs
|   |   |-- chi_square.rs
|   |   |-- empirical.rs
|   |   |-- mixture.rs
|   |   |-- smooth_kernel.rs
|   |-- hypo_tests/            # hypothesis tests and goodness-of-fit tests
|   |   |-- mod.rs
|   |   |-- t_test.rs
|   |   |-- z_test.rs
|   |   |-- normality.rs
|   |   |-- correlation.rs
|   |-- pipeline.rs            # return-series and rolling-window workflow helpers
|   |-- stats.rs               # descriptive and robust statistics utilities
|   |-- plotting.rs            # plotters-based PNG output
|   |-- models.rs              # linear, logistic, and nonlinear model fitting
|   |-- units.rs               # quantity / unit conversion helpers
|   |-- clusters/
|   |   |-- mod.rs             # simple 1D clustering helper
|   |-- tests_verification.rs  # parity/verification tests for fitted distributions
|-- logs/                      # local run artifacts
|-- tmp/                       # scratch directory used during experimentation
|-- target/                    # Cargo build output
|-- cauchy_p_values.png        # example generated plot artifact
|-- test_output*.txt           # captured output from prior test or analysis runs
```

## Dependency Notes

Key dependencies and what they are used for:

- `statrs`: probability distributions and statistical functions
- `rand` and `rand_distr`: sampling and synthetic data generation
- `argmin` and `argmin-math`: numerical optimization for model fitting
- `chrono`: date handling for rolling series
- `plotters`: chart generation
- `serde`: serialization support for rolling results
- `anyhow`: error propagation for fallible APIs
- `ndarray`: numerical support used by optimization-related code
- `rayon`: available for parallel work, though the current visible pipeline is mostly sequential

## Testing And Verification

The repository includes a substantial verification module in `src/tests_verification.rs`. Its role is to validate fitted parameter estimates and selected test statistics against known sample datasets and expected values for multiple families.

That test file is important context for the project: it suggests the crate is aiming for numerical reliability and parity-style validation, not just convenience wrappers.

## Limitations And Maturity

The repo is useful now, but it is still closer to a toolkit than a finished product:

- `src/main.rs` is a fixed demo, not a configurable CLI
- output paths are mostly hard-coded
- some modules are broad utility collections rather than tightly scoped components
- automatic best-fit selection is not wired across every implemented family
- repository-root artifacts indicate an experimentation workflow rather than a cleaned packaging story

## When This Repo Is A Good Fit

This project is a good match if you want:

- a Rust-native sandbox for statistical experiments
- reusable code for fitting and testing distributions
- rolling goodness-of-fit analysis over dated series
- lightweight plotting for inspection of results
- a base to evolve into a larger quant or research toolkit

It is a weaker fit if you need:

- a mature command-line interface
- production data ingestion pipelines
- a fully documented stable API surface
- a narrowly focused crate that does only one thing
