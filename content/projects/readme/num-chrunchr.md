+++
title = "num-chrunchr README"
description = "README mirror for num-chrunchr"
draft = false
+++

[Repository](https://github.com/sguzman/num-chrunchr) | [DeepWiki](https://deepwiki.com/sguzman/num-chrunchr/)

# num-chrunchr

`num-chrunchr` is a Rust CLI for working with very large integers when the useful question is not always "can I fully factor this in RAM?" but "what can I learn about this number with the representation and compute budget I actually have?"

The project is built around three ideas:

- use the cheapest representation that still supports the next operation;
- stream from disk when materializing a full big integer is unnecessary or too expensive;
- emit structure reports and compressed descriptions even when full factorization is impractical.

Today the repository contains a working CLI, streaming arithmetic primitives, a resumable small-factor peeling pipeline, near-power decomposition tooling, an optional GPU batch remainder engine, configuration, and design notes for the next optimization steps.

## What The Project Does

`num-chrunchr` currently focuses on large-number analysis and partial factor search rather than promising complete factorization for arbitrarily large inputs.

Core capabilities already present in the codebase:

- streaming decimal operations on numbers stored as text files;
- loading moderately sized values into `BigUint` when an in-memory upgrade is reasonable;
- scanning divisor ranges on CPU or GPU-backed batch remainder kernels;
- resumable "peel" runs that strip small factors and persist reports;
- near-power analysis that approximates a number as powers of a chosen base;
- compression of exponent sequences produced by repeated near-power decomposition;
- binary-input support for numbers supplied as raw bytes instead of decimal text;
- structure reporting for patterns like near-square, near-power, and sparse decimal terms.

The project is best understood as a research-oriented toolkit for "number understanding": factor what is cheap, sketch what is expensive, and preserve enough structure to continue later.

## Representation Strategy

The crate deliberately avoids a single representation model.

### `DecimalStream`

Implemented in [src/repr/mod.rs](/win/linux/Code/rust/num-chrunchr/src/repr/mod.rs:1), `DecimalStream` is the main out-of-core representation for decimal text inputs.

It supports:

- counting decimal digits;
- extracting leading digits;
- computing `N mod p` with streaming Horner-style updates;
- dividing by a small `u32` divisor and writing the quotient back to disk.

This is the representation that keeps the project useful for very large decimal files.

### `BigIntRam`

Implemented in [src/repr/bigint_ram.rs](/win/linux/Code/rust/num-chrunchr/src/repr/bigint_ram.rs:1), `BigIntRam` upgrades a decimal stream into a `num_bigint::BigUint` once the configured size threshold makes that practical.

This path is used for:

- exact arithmetic on smaller cofactors;
- structural detection that benefits from full big-integer access;
- ECM-assisted follow-up inside the peel strategy.

### `LimbFile`

Implemented in [src/repr/limb_file.rs](/win/linux/Code/rust/num-chrunchr/src/repr/limb_file.rs:1), `LimbFile` is a disk-backed base-`2^32` representation.

It is not yet the dominant representation in the CLI, but it exists as an important bridge for:

- chunked binary-style processing;
- future GPU-friendly arithmetic paths;
- avoiding repeated decimal parsing when a limb encoding is better suited to the workload.

## Strategy Layer

The strategy code lives under [src/strategy](/win/linux/Code/rust/num-chrunchr/src/strategy/mod.rs:1).

### Peel

The `peel` command is the main resumable factor workflow in the repository today.

It:

- copies the chosen input into a working cofactor file under the report directory;
- sieves small primes up to a configured bound;
- computes batched remainders for chunks of primes;
- divides out discovered small factors;
- persists factor counts to `factors.json`;
- writes modular sketches to `sketch.json`;
- writes a higher-level structural summary to `structure.json`;
- optionally upgrades the remaining cofactor to `BigUint` and uses ECM when size policy allows.

This makes `peel` a hybrid pipeline: streaming first, exact arithmetic later if the remaining cofactor becomes small enough.

### Structure Reports

Implemented in [src/strategy/report.rs](/win/linux/Code/rust/num-chrunchr/src/strategy/report.rs:1), structure reports summarize properties of the current number or cofactor.

The report currently tracks:

- decimal length;
- approximate bit length;
- leading digits;
- whether the value is close to a square;
- whether the value is close to a small perfect power;
- sparse non-zero decimal terms for smaller values;
- a `special_forms` summary list for quick inspection.

## GPU Support

The GPU path lives under [src/gpu](/win/linux/Code/rust/num-chrunchr/src/gpu/mod.rs:1), primarily in [src/gpu/batch_mod.rs](/win/linux/Code/rust/num-chrunchr/src/gpu/batch_mod.rs:1).

The implemented GPU engine is a batch remainder engine, not a full general-purpose big-integer backend. That is an important distinction.

What it does well:

- update many prime remainders in parallel;
- accelerate divisor-range scans and batched small-factor testing;
- auto-tune or accept configured batch sizes.

What it does not claim to do:

- replace all CPU-side arithmetic;
- fully offload arbitrary factorization algorithms;
- avoid the cost of quotient generation after a factor is found.

If GPU initialization is disabled or unavailable, the code can fall back to the CPU batch engine.

## CLI Overview

Build and inspect the CLI with:

```bash
cargo build
cargo run -- --help
```

The top-level commands currently exposed by [src/main.rs](/win/linux/Code/rust/num-chrunchr/src/main.rs:1) are:

- `mod`: compute `N mod p` from a streamed input;
- `div`: divide by a small divisor and write the quotient;
- `analyze`: print decimal length and leading digits;
- `digits`: print the decimal digit count;
- `log`: estimate `log_base(N)` and optionally its integer part;
- `pow`: raise the supplied number to an exponent and emit decimal output;
- `near-power`: find the nearest `base^k` approximation and optionally iterate on the delta;
- `cache`: inspect or purge cached `near-power` results;
- `write-decimal`: convert raw binary bytes to decimal text;
- `estimate-any-factor`: estimate search time or success probability under a divisor budget;
- `range-factors`: scan an inclusive divisor range and print matching factors;
- `peel`: run the resumable small-factor peeling workflow.

## Input Modes

The CLI accepts numbers in two primary ways:

- `--number <digits>` for inline decimal input;
- `--input <path>` for file-based input.

For file-based inputs, the default interpretation is decimal text with non-digit bytes ignored by the streaming decimal routines.

Binary mode is also supported:

- `--binary` reads `--input` as a raw integer byte string;
- `--little-endian` switches binary interpretation from big-endian to little-endian.

Binary mode applies only to file inputs, not inline `--number`.

## Common Workflows

### 1. Quick inspection of a large decimal file

```bash
cargo run -- --input res/big-num.txt analyze
cargo run -- --input res/big-num.txt digits
cargo run -- --input res/big-num.txt log --base 10 --integer-part
```

### 2. Streaming divisibility checks

```bash
cargo run -- --input res/big-num.txt mod --p 97
cargo run -- --input res/big-num.txt div --d 3 --out quotient.txt
```

### 3. Resumable small-factor peeling

```bash
cargo run -- --input res/big-num.txt peel
```

Useful flags:

- `--config <path>` to select an alternate TOML config;
- `peel --primes-limit <n>` to override the configured sieve bound;
- `peel --reset` to discard prior report state and restart.

### 4. Divisor range scanning

```bash
cargo run -- --input res/big-num.txt range-factors --start 2 --end 100000
```

Notable options:

- `--use-gpu` to prefer the GPU batch remainder engine;
- `--first` or `--last` to constrain output;
- `--all` to emit repeated factors;
- `--limit <n>` to cap matches;
- `--gpu-batch-size <n>` to override automatic GPU batch sizing.

### 5. Near-power decomposition

```bash
cargo run -- --number 123456789 near-power --base-number 10
```

This command can:

- search for the nearest exponent `k` such that `base^k` is closest to the target;
- repeat the process over the remaining delta with `--n-times`;
- optionally disallow overshoot with `--no-overshoot`;
- switch to prime bases by round with `--prime-rounds`;
- cache computed decompositions under `.cache/num-chrunchr` with `--cache`.

For power-of-two bases, the code includes a dedicated fast path described in [docs/power-of-2-bases.md](/win/linux/Code/rust/num-chrunchr/docs/power-of-2-bases.md:1).

### 6. Compressing exponent sequences

When `near-power` is run with multiple iterations, its exponent sequence can be compressed:

```bash
cargo run -- --number 123456789012345 near-power \
  --base-number 10 \
  --n-times 8 \
  --compress-seq-a
```

Available modes:

- `--compress-seq-a`: store a chosen base plus per-entry deltas;
- `--compress-seq-b`: store the first exponent and consecutive deltas.

Available optimization schemes:

- `min-max-abs`;
- `min-total-abs` (default);
- `min-digit-count`;
- `min-bit-count`;
- `min-varint-size`.

See [docs/compress-seq.md](/win/linux/Code/rust/num-chrunchr/docs/compress-seq.md:1) and [docs/roadmaps/compress-seq-roadmap.md](/win/linux/Code/rust/num-chrunchr/docs/roadmaps/compress-seq-roadmap.md:1) for the rationale and roadmap notes.

### 7. Cache management

```bash
cargo run -- cache list
cargo run -- cache purge --confirm
```

The cache currently stores serialized `near-power` entries keyed by target, base, and settings metadata.

## Configuration

The default runtime configuration is checked in at [config/default.toml](/win/linux/Code/rust/num-chrunchr/config/default.toml:1).

Main sections:

- `[logging]`: tracing level and timestamp format;
- `[stream]`: buffer size for streamed file processing;
- `[analysis]`: how many leading digits to record;
- `[policies]`: arithmetic limits such as divisor caps and in-memory upgrade threshold;
- `[policies.ecm]`: whether ECM is enabled and what search bounds it uses;
- `[strategy]`: peel defaults such as sieve bound, batch size, report directory, and GPU preference;
- `[range_factors]`: GPU batch-size override for divisor scans.

Important defaults in the current repo:

- stream buffer size: `65536`;
- leading digits recorded: `32`;
- in-memory upgrade threshold: `128` decimal digits;
- peel prime limit: `1_000_000`;
- default report directory: `reports`;
- strategy GPU preference: enabled by default in the checked-in config;
- range-factor GPU batch size: `0` meaning auto-tune.

If the configured file does not exist, the crate falls back to built-in defaults defined in [src/config.rs](/win/linux/Code/rust/num-chrunchr/src/config.rs:1).

## Generated Artifacts

Some outputs are created at runtime rather than stored in git.

### `reports/`

The peel strategy writes artifacts into the configured report directory, `reports/` by default:

- `cofactor.txt`: the current remaining cofactor;
- `factors.json`: discovered factor multiplicities;
- `sketch.json`: residues modulo a small prime set;
- `structure.json`: structural summary of the remaining number.

These files are intended to make long-running or exploratory work resumable and inspectable.

### `.cache/num-chrunchr`

`near-power --cache` writes serialized cache entries under the user cache tree. The code treats the cache as disposable derived state.

## Project Layout

The repository is small enough that the layout reflects the architecture directly:

```text
num-chrunchr/
├── Cargo.toml
├── README.md
├── LICENSE
├── config/
│   └── default.toml
├── docs/
│   ├── compress-seq.md
│   ├── info.md
│   ├── power-of-2-bases.md
│   └── roadmaps/
│       ├── compress-seq-roadmap.md
│       └── power-of-2-optimizations.md
├── res/
│   └── big-num.txt
├── scripts/
│   ├── bench_power_of_two.fish
│   └── bench_power_of_two.sh
└── src/
    ├── main.rs
    ├── config.rs
    ├── source.rs
    ├── gpu/
    │   ├── mod.rs
    │   └── batch_mod.rs
    ├── repr/
    │   ├── mod.rs
    │   ├── bigint_ram.rs
    │   └── limb_file.rs
    └── strategy/
        ├── mod.rs
        └── report.rs
```

### Layout Notes

- [src/main.rs](/win/linux/Code/rust/num-chrunchr/src/main.rs:1) contains the CLI surface, command dispatch, near-power logic, cache handling, and several utility routines.
- [src/config.rs](/win/linux/Code/rust/num-chrunchr/src/config.rs:1) defines the config schema and defaulting behavior.
- [src/source.rs](/win/linux/Code/rust/num-chrunchr/src/source.rs:1) normalizes file versus inline number sources and creates temporary files for streamed inline input.
- [src/repr](/win/linux/Code/rust/num-chrunchr/src/repr/mod.rs:1) holds number representation backends.
- [src/gpu](/win/linux/Code/rust/num-chrunchr/src/gpu/mod.rs:1) contains the batch modular arithmetic engine.
- [src/strategy](/win/linux/Code/rust/num-chrunchr/src/strategy/mod.rs:1) implements higher-level factor and report workflows.
- [docs/info.md](/win/linux/Code/rust/num-chrunchr/docs/info.md:1) captures the original architectural direction behind the project.
- `scripts/bench_power_of_two.*` exist to benchmark the specialized near-power fast path for bases `2^m`.
- `res/big-num.txt` is a sample resource for local experiments and smoke tests.

## Development

Standard cargo workflows apply:

```bash
cargo fmt
cargo test
cargo run -- --help
```

The codebase already includes unit tests across configuration loading, representations, structure detection, and CLI-related logic embedded in `main.rs`.

## Design Direction

The repository already shows a clear design thesis:

- start with streamed representations;
- upgrade to full big integers only when policy and size permit;
- use GPU acceleration where the operation is embarrassingly parallel;
- preserve intermediate knowledge as reports, sketches, and compressed decompositions.

The roadmap notes in [docs/roadmaps](/win/linux/Code/rust/num-chrunchr/docs/roadmaps/compress-seq-roadmap.md:1) and [docs/roadmaps](/win/linux/Code/rust/num-chrunchr/docs/roadmaps/power-of-2-optimizations.md:1) make it clear that the project is still evolving, but the current implementation is already coherent enough to use as a serious experimentation base.

## Limitations And Expectations

- Full factorization of extremely large inputs is not guaranteed and is not the sole purpose of the crate.
- Several workflows are intentionally heuristic or reporting-oriented.
- `BigIntRam` still requires complete materialization of the value once the upgrade path is taken.
- `LimbFile` is present as infrastructure, but it is not yet the universal execution backend.
- GPU acceleration currently targets batched modular scans, not arbitrary exact arithmetic.

That tradeoff is deliberate: the project prioritizes practical progress on oversized inputs over pretending every number can be handled by one algorithm or one representation.
