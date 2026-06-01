+++
title = "num-chrunchr README"
description = "README mirror for num-chrunchr"
draft = false
+++

[Repository](https://github.com/sguzman/num-chrunchr) | [DeepWiki](https://deepwiki.com/sguzman/num-chrunchr/)

# num-chrunchr

**num-chrunchr** is a Rust toolkit for **factoring and structurally analyzing extremely large integers**, including numbers that do **not** fit comfortably in RAM.

It is built around a simple idea:

> A "number" is not always a `BigInt`.  
> It is a *representation* that may support only certain operations efficiently (streaming, symbolic, disk-backed, RAM-backed, GPU-assisted, etc.).

This repo currently provides a working MVP for **disk-backed decimal numbers** with:

- streaming `N mod p` (`u32`/`u64`)
- streaming long division `N / d` for small `d`
- quick analysis (decimal length + leading digits)
- structured logging via `tracing`

…and a clear path to expand into a full multi-strategy factoring system.

---

## Goals

1. **Factor when feasible** (small/medium inputs; or large inputs with small factors).
2. **Use heuristics when not feasible**, and still produce a meaningful "structure report":
   - size characteristics (digits/bit-estimates)
   - residue sketches (many `mod p`)
   - special-form detection (near-square, near-power, sparse expansions)
   - best known compressed representations
   - power-of-two base fast paths (see `docs/power-of-2-bases.md`)
3. **Scale beyond RAM**:
   - stream from disk (decimal and later limb files)
   - operate piecewise and persist intermediate states
4. **Optionally accelerate prime scanning with GPU** (planned):
   - batch remainder updates for huge prime sets

---

## Non-goals (important)

- This is not intended as a turnkey “break RSA” tool.
- Factoring arbitrary, cryptographically-sized semiprimes is hard; the project will eventually integrate / wrap mature external implementations (QS/NFS, ECM, etc.) rather than reimplement everything from scratch.
- “Compression” here means *useful mathematical representation*, not general-purpose lossless compression.

---

## Current Features (MVP)

### Disk-backed `DecimalStream`

Input is a text file containing decimal digits. Any non-digit characters are ignored. This makes it easy to:

- store gigantic numbers as text
- include separators/newlines
- stream operations without loading the whole value

### Streaming operations (no full materialization)

- `decimal_len()` — count digits by streaming
- `leading_digits(k)` — read first `k` digits (streaming)
- `mod_u32(p)` / `mod_u64(p)` — Horner-style streaming modulus
- `div_u32_to_path(d, out)` — streaming long division by small `d`

### Logging

Uses `tracing` + `tracing-subscriber` with env filtering.

---

## Why capability-based representations?

Different representations excel at different operations:

- **DecimalStream** (disk-backed text)
  - Great: `mod p`, `div by small p`, quick size/leading-digit analysis
  - Not great: big multiplications, general-purpose big-int algorithms

- **BigIntRam** (implemented)
  - Great: Pollard Rho, p-1/p+1, ECM, etc.
  - Limited: RAM size

- **ExprAst** (planned)

---

## Near-power sequence compression

After running `near-power`, you can optionally compress the exponent sequence:

- `--compress-seqA`: choose a base `B` and store deltas `e_i - B`.
- `--compress-seqB`: store `e_0` and deltas `e_i - e_{i-1}`.

Select the optimization scheme with `--compress-scheme`:

- `min-max-abs`
- `min-total-abs` (default)
- `min-digit-count`
- `min-bit-count`
- `min-varint-size`

Example:

```
num-chrunchr --input big.bin --binary near-power --base-number 2 --n-times 5 \
  --compress-seqA --compress-scheme min-total-abs
```

Prime-rounds mode (use primes as bases, no explicit base allowed):

```
num-chrunchr --input big.bin --binary near-power --prime-rounds --n-times 5
```
  - Great: numbers like `a^b +/- c`, products, factorial-like forms, sparse sums
  - Allows: fast `mod p` without expansion via modular exponentiation
  - Enables: algebraic factor rules

- **LimbFile** (implemented)
  - Disk-backed base 2^32/2^64 limbs
  - Great for GPU kernels and chunked high-throughput arithmetic

  - Cached residues for fast screening + resumability

The factoring strategy engine will choose algorithms based on:

- input size
- which capabilities are available
- what has already been learned (factors found, sketch residues, detected forms)

---

## Project Layout

Current structure (MVP):

src/
main.rs # CLI entrypoint
repr/
mod.rs # DecimalStream implementation (streaming ops)
bigint_ram.rs # RAM-based factoring helpers
limb_file.rs # Disk-backed base 2^32 limbs for GPU/IO-friendly scans

Planned expansions:

src/
repr/
decimal_stream.rs
bigint_ram.rs
expr_ast.rs
limb_file.rs
sketch.rs
ops/
mod.rs # traits + shared arithmetic helpers
stream.rs
bigint.rs
strategy/
mod.rs
peel_small.rs # trial division / small-factor peeling
upgrade.rs # stream -> bigint conversion thresholds
rho.rs # Pollard Rho (RAM mode)
pminus1.rs # Pollard p-1 / p+1
ecm.rs # ECM integration or wrapper
report.rs # structure report / certificates
gpu/
mod.rs
batch_mod.rs # GPU-assisted remainder scanning (planned)

---

## CLI Usage (current)

### Input sources

- Use `--input <path>` to stream decimal digits from a file (non-digit characters are ignored).
- Use `--number "<digits>"` to provide a short decimal string inline (it is written to a temp file, which is then streamed).
- Use global `--binary` to treat `--input` as raw bytes encoding an integer; default byte order is big-endian, and `--little-endian` switches order.

### Commands

- `analyze` — digit length + leading digits
- `digits` — return decimal digit count of input
- `log` — compute `log_base(N)` with optional integer-only output
- `pow` — compute `N^exponent` and emit decimal
- `mod` — compute `N mod p` streaming
- `div` — divide by a small `u32` divisor (streaming), write quotient to a file
- `write-decimal` — convert raw binary input bytes into decimal text output (`--binary`, optional `--little-endian`)
- `estimate-any-factor` — estimate trial-division scan time and likely success for finding any factor (supports `--digits` without an input file)
- `range-factors` — scan an inclusive integer range and return divisors in that range using streaming modulus checks (`--all` includes repeated factors for each divisor power that divides `N`), with optional GPU batch scanning via `--use-gpu`.
  - With `--use-gpu`, divisors up to `u32::MAX` are scanned on the GPU and larger divisors in the same request are scanned on CPU.
  - `--first` returns only the first factor found in ascending scan order; `--last` returns only the largest factor found in range.
  - `--low-latency-first` only affects `--first` with GPU auto-batch and prioritizes first-result latency over peak throughput.
  - `--limit <N>` stops after `N` matching factors are emitted.
  - `--gpu-batch-size <N>` tunes divisors-per-GPU-chunk; `0` means auto-tune from adapter limits.
- `peel` — run the streaming small-factor peeling strategy; progress is stored under `reports/` (see below).

### Examples (fish shell)

1) Create a file with digits or supply inline:

```fish
printf "123456789012345678901234567890\n" > n.txt

    Analyze from file:

cargo run -- --input n.txt analyze --leading 20

    Analyze inline digits:

cargo run -- --number "20260228123456" analyze

    Modulus:

cargo run -- --input n.txt mod --p 97

cargo run -- --input n.bin --binary --little-endian mod --p 97

    Binary to decimal file:

cargo run -- --input n.bin --binary --little-endian write-decimal --out n.txt

    Digit count:

cargo run -- --input n.txt digits

    Logarithm:

cargo run -- --input n.txt log --base 10

cargo run -- --input n.txt log --base 2 --integer-part

    Exponentiation:

cargo run -- --number "12" pow --exponent 20

cargo run -- --number "12" pow --exponent 20 --out power.txt

    Divide:

cargo run -- --input n.txt div --d 3 --out q.txt

This writes quotient digits to q.txt and prints remainder=....

`div`, `analyze`, and `peel` currently support decimal input only; `--binary` is supported by `digits`, `log`, `pow`, `mod`, `write-decimal`, `estimate-any-factor`, and `range-factors`.

    Any-factor estimate:

cargo run -- estimate-any-factor --digits 1000000 --factors-per-sec 350000000 --mode unknown

cargo run -- --input n.bin --binary estimate-any-factor --max-divisor 100000000000 --factors-per-sec 350000000 --mode random

This reports estimated scan time and, for random mode, an approximate success probability of hitting a small factor under the scan cutoff.

    Range divisor scan:

cargo run -- --input n.txt range-factors --start 2 --end 1000

This prints a JSON array of all divisors from the inclusive range `[2, 1000]` without loading the whole number into RAM.

cargo run -- --input n.txt range-factors --start 2 --end 1000 --all

This includes repeated entries when `d^k` keeps dividing `N` for the same divisor `d`.

cargo run -- --input n.txt range-factors --start 2 --end 1000 --first

This returns just the first factor in ascending order (or `null` if none are found).

cargo run -- --input n.txt range-factors --start 2 --end 1000 --last

This returns only the largest factor in range (or `null` if none are found).

cargo run -- --input n.txt range-factors --start 2 --end 1000 --limit 3

This stops after returning three matching factors.

cargo run -- --input n.bin --binary range-factors --start 2 --end 1000 --use-gpu

This treats `n.bin` as a raw big-endian integer and uses the GPU batch remainder engine.

cargo run -- --input n.bin --binary --little-endian range-factors --start 2 --end 1000 --use-gpu

This reads the same raw bytes as little-endian.

cargo run -- --input n.txt range-factors --start 2 --end 10000000 --use-gpu --gpu-batch-size 65536

This overrides the GPU divisor chunk size for throughput tuning.

    Peel small factors and persist reports:

cargo run -- --input n.txt peel --primes-limit 500

### Reports

`peel` keeps resumable state inside `config.strategy.report_directory` (default `reports/`). You can inspect:

- `factors.json` — list of peeled primes/exponents along with the input label.
- `cofactor.txt` — the current working decimal digits for the remaining cofactor.
- `sketch.json` — residues of the current cofactor against the primes listed in `config.strategy.sketch_primes`.

The next peel invocation will detect these files and resume from the last known quotient unless you pass `--reset`.

### Configuration

`config/default.toml` exposes the tuning knobs you need:

- `logging` / `stream` / `analysis` segments we already mention.
- `policies` (modulus/divisor limits, division budget).
- `policies.ecm` (enable/disable ECM, adjust stage 1/2 bounds, curve budget, and RNG seed for the Lenstra fallback that runs after the RAM upgrade when Pollard/p±1 stall).
- `strategy` — `primes_limit`, `batch_size`, `report_directory`, `sketch_primes`, and `use_gpu` control how aggressively `peel` sieves, how many primes are grouped for each batch scan, where state is persisted, and whether the GPU-backed batch modulo kernel is engaged.
- `range_factors` — `gpu_batch_size` controls `range-factors --use-gpu` chunking (`0` auto-tunes from adapter limits).

### GPU acceleration

When you set `strategy.use_gpu = true`, the `peel` command streams digit chunks through a `wgpu` compute shader that updates every tracked remainder across the current prime batch in parallel. GPU initialization is treated as required in this mode, so failures abort the run instead of silently falling back.
Logging

Set RUST_LOG to control verbosity.

Examples (fish):

set -x RUST_LOG info
cargo run -- --input n.txt analyze

More detail:

set -x RUST_LOG "num-chrunchr=debug,info"
cargo run -- --input n.txt mod --p 1000003

Design Notes: Streaming Modulus

For DecimalStream, modulus is computed with a streaming Horner method:

    Start r = 0

    For each digit d in the file:

        r = (r * 10 + d) mod p

This is:

    O(number_of_digits) time

    O(1) memory

    Works even when the input is many GBs of decimal text

Division by a small integer

div_u32_to_path(d, out) implements streaming long division:

    reads digits sequentially

    maintains a remainder

    emits quotient digits as it goes

    never holds the whole number in memory

This operation is crucial because it lets the strategy engine:

    detect a small factor p

    divide it out immediately

    continue factoring the smaller quotient (still disk-backed)

Compression and “Structure” (planned)

Factoring becomes infeasible for truly enormous numbers. So num-chrunchr will also produce a structure report with:

    size estimates (digits, approximate bits)

    residue sketches: N mod p_i for many primes

    detected special forms (when possible)

    candidate compressed representations

Your "series of exponents" idea

We will support sparse base-B representations:

    N = Σ d_i * B^{e_i} with 1 <= d_i < B, decreasing e_i, skipping zero runs.

There are two variants:

    Approximate (stream-only, very large N)

    Use (decimal_len, leading_digits) to estimate floor(log_B(N))

    Produce a compressed description candidate for reporting/heuristics

    Exact (requires BigIntRam or later LimbFile subtraction)

    Compute the true sparse expansion and store the (d_i, e_i) pairs

Other planned compression / heuristic tactics

    Near-square detection (Fermat-style): check if N ≈ a^2

    Near-power detection: fit N ≈ a^k, represent as a^k +/- c

    Recognize algebraic forms in ExprAst:

        x^k - y^k, x^k + y^k

        products and partial factorizations

        repunit/Mersenne-like patterns (where applicable)

    Batch-GCD tricks for small prime blocks (when P fits in RAM)

Factoring Strategy Roadmap
Phase 1: Small-factor peeling (works for huge files)

    Sieve primes up to a bound

    Compute N mod p streaming

    If divisible, divide out and repeat

    Persist factors found

This alone will completely factor many large numbers that contain small primes.
Phase 2: Upgrade to RAM BigInt when feasible

When the remaining cofactor is small enough:

    load it into BigIntRam

    run:

        Pollard Rho (Brent variant)

        Pollard p-1 / p+1

        primality tests (probabilistic first)

Phase 3: ECM and heavier tools

    integrate ECM (library or wrapper)

    later: QS/NFS via wrappers

Phase 4: GPU acceleration

Primary GPU target: batch remainder scanning:

    test divisibility by huge batches of primes efficiently

    keep remainders on-device, stream chunks from disk

    CPU fallback always available

The batch remainder engine now ships a `repr::LimbFile` helper so you can persist base-2^32 limbs, and the `gpu::BatchModEngine`/CPU fallback already stream through those chunks via `wgpu` shaders or CPU loops depending on hardware.

GPU work will likely be most practical on systems with NVIDIA hardware, but the design will aim to keep the interface backend-agnostic.
Resumability (planned)

Long runs should be restartable. Planned artifacts:

    factors.json — factors found so far, exponents

    sketch.json — stored residues (p -> N mod p)

    cofactor.txt — current quotient as a new DecimalStream

    report.md — structure report / certificate of attempts

The strategy engine will:

    detect existing sidecars

    resume from last known cofactor and factor list

Correctness and Safety Notes

    Streaming routines treat non-digits as separators. This is convenient, but be mindful when using untrusted inputs.

    Remainder and division are exact for the digits seen.

    For enormous numbers, “structure” output may include approximations unless explicitly marked exact.

    This is research-grade tooling; validate results when used for anything high-stakes.

Contributing

Contributions are welcome, especially in these areas:

    prime peeling strategy module (CPU first)

    sketch persistence format

    RAM BigInt upgrade + Pollard Rho implementation

    expression AST + modular evaluation

    limb-file representation and GPU batch mods

Recommended dev hygiene:

    cargo fmt

    cargo clippy

    cargo test

(Exact CI tooling will be added as the crate grows.)
License

This project is licensed under CC0-1.0 (public domain dedication). See the license = "CC0-1.0" entry in Cargo.toml.

If you add dependencies or code, please ensure the result remains compatible with CC0 distribution.
Status

MVP stage:

    ✅ disk-backed decimal stream

    ✅ streaming mod / div / analyze

    🔜 small-factor peeling strategy

    🔜 resumable factor reports + sketches

    🔜 BigInt upgrade + Pollard Rho/p-1

    🔜 expression/AST compressed representations

    🔜 limb files + GPU batch remainder scanning

Phase 3 now includes Lenstra’s ECM via the `ecm` crate, with `[policies.ecm]` letting you toggle the fallback, adjust the stage 1/2 bounds, curve budget, and RNG seed that the RAM upgrade uses when Pollard/p±1 are stuck.

FAQ
Why not just store everything as a BigInt?

Because once you pass a certain size, even “basic” operations become dominated by memory and bandwidth, and you lose the ability to do useful incremental work. Streaming representations let you:

    find small factors

    compute sketches

    generate structure reports

    reduce the number
    …without ever holding it all in memory.

Will this factor a 1000-digit RSA number?

Not by itself. For that, you’ll rely on advanced algorithms and mature implementations (ECM, QS, NFS), likely via wrappers or integrations.
What’s the most valuable near-term addition?

A small prime peeling strategy that repeatedly:

    scans primes

    finds divisors via streaming mod

    divides via streaming long division

    persists factors and continues on the quotient

That will immediately make the tool useful on very large inputs.


ChatGPT can make mistakes. Check important info. See Cookie Preferences.
```
