+++
title = "weathergraph-rs README"
description = "README mirror for weathergraph-rs"
draft = false
+++

[Repository](https://github.com/sguzman/weathergraph-rs) | [DeepWiki](https://deepwiki.com/sguzman/weathergraph-rs/)

# weathergraph-rs

Rust-native inference port of the Keisler 2022 graph neural weather forecasting model.

`weathergraph-rs` ports the Python/JAX/Haiku inference path from [`rkeisler/keisler-2022`](https://github.com/rkeisler/keisler-2022) into a Rust workspace built around typed artifact loading, explicit model modules, `tracing`-based logging, strict checkpoint validation, one-step parity fixtures, autoregressive rollout, and NetCDF forecast output.

## Status

| Milestone | Status | Notes |
| --- | --- | --- |
| Artifact inspector | Implemented | Loads `.npz.gz` graph, feature, normalizer, and surface artifacts. |
| Geometry parity | Implemented | Reconstructs ERA5/H3 geometry with exact `65160 / 5882 / 71042` node counts. |
| Graph aggregation kernel | Implemented | CPU-first gather/scatter tensor helpers with deterministic tests. |
| MLP and LayerNorm parity | Implemented | Explicit Rust/Candle modules with strict weight inspection. |
| One-step runner/model path | Implemented | Graph-aware one-step execution with solar, day-of-year, and surface features. |
| CLI and logging | Implemented | `inspect-artifacts`, `inspect-geometry`, `inspect-weights`, and `forecast`. |
| Python/Rust parity workflow | Implemented | Weight export, strict inspection, and one-step parity validation against real upstream tensors. |
| Autoregressive rollout / NetCDF output | Implemented | `forecast` performs local ERA5-style initialization, rollout, and `.nc` writing. |

The supported V1 path is now fixed:

- exported `safetensors` checkpoint
- local ERA5-style `era5_input.nc`
- one-step parity fixture
- autoregressive rollout to NetCDF

Performance work should preserve the current parity fixture tolerance rather than widening it.

## Scope

In scope:

- inference-only Rust port
- local artifact loading
- exported `safetensors` checkpoints
- one-step parity harness
- autoregressive rollout
- NetCDF forecast output

Out of scope:

- Rust-native training
- direct loading of Python pickle checkpoints from Rust
- network-dependent realtime ingestion in the default path

`opendata` remains intentionally unsupported in the runner. V1 uses prepared local ERA5-style NetCDF initialization files.

## Workspace Layout

```text
weathergraph-rs/
├── artifacts/
│   └── README.md
├── crates/
│   ├── weathergraph-cli/
│   └── weathergraph-core/
├── tests/
│   └── fixtures/
└── tools/
    ├── fetch_arco_era5.py
    ├── export_parity_fixture.py
    ├── export_weights.py
    └── weight_mapping.example.json
```

Core modules:

- `config.rs`: config structs, runtime defaults, artifact filenames, model settings
- `error.rs`: shared error types
- `features.rs`: typed `.npz.gz` loading and summaries
- `geometry.rs`: ERA5/H3 geometry reconstruction
- `graph.rs`: graph artifacts, sender/receiver indices, static node/edge tensors
- `normalizer.rs`: temporal normalizer and surface feature loading
- `solar.rs`: deterministic solar and seasonal features
- `tensor.rs`: gather/scatter tensor helpers
- `model.rs`: explicit MLP, LayerNorm, checkpoint inspection, and graph-aware GNN path
- `runner.rs`: ERA5 initialization loading, one-step execution, rollout, and NetCDF writing

## Upstream Relationship

The reference model lives in [`rkeisler/keisler-2022`](https://github.com/rkeisler/keisler-2022). The Rust port preserves the same high-level structure:

1. Encode ERA5 lat/lon nodes onto the H3 mesh.
2. Run processor message-passing updates on H3 nodes.
3. Decode change predictions back onto the lat/lon grid.
4. Apply autoregressive rollout in 6-hour steps.

The Rust side does not read the upstream pickle directly. The stable interchange boundary is an exported `safetensors` checkpoint plus optional parity fixtures.

## Artifact Expectations

The repo does not vendor large upstream data. Put the upstream artifacts in a local data directory and point the CLI at it.

Expected files:

- `senders_receivers_encoder.npz.gz`
- `senders_receivers_processor.npz.gz`
- `senders_receivers_decoder.npz.gz`
- `node_features_*.npz.gz`
- `edge_features_*.npz.gz`
- `temporal_normalizer*.npz.gz`
- `orography_landsea.npz.gz`
- `era5_input.nc`
- exported `weights.safetensors`

`era5_input.nc` is expected to contain these variables on dimensions `(time=1, level=13, latitude=181, longitude=360)`:

- `specific_humidity`
- `temperature`
- `u_component_of_wind`
- `v_component_of_wind`
- `vertical_velocity`
- `geopotential`

See [artifacts/README.md](artifacts/README.md) for the finalized export contract.

You can generate a compliant local ERA5 initialization file directly from the public ARCO dataset with:

```bash
source /tmp/weathergraph-venv/bin/activate
python tools/fetch_arco_era5.py \
  --init 2020-01-01T00:00:00Z \
  --out /path/to/data/era5_input.nc
```

## CLI

Inspect artifact shapes:

```bash
cargo run -p weathergraph-cli -- inspect-artifacts --data-dir /path/to/data
```

Inspect geometry parity:

```bash
cargo run -p weathergraph-cli -- inspect-geometry
```

Inspect an exported checkpoint:

```bash
cargo run -p weathergraph-cli -- inspect-weights \
  --weights /path/to/weights.safetensors \
  --json \
  --strict \
  --input-channels 78 \
  --output-channels 78 \
  --hidden-dim 256
```

Run a forecast from a prepared local ERA5-style NetCDF file:

```bash
cargo run -p weathergraph-cli -- forecast \
  --data-dir /path/to/data \
  --weights /path/to/weights.safetensors \
  --init 2020-01-01T00:00:00Z \
  --steps 4 \
  --input era5 \
  --out ./forecast.nc
```

The `forecast` command now performs real rollout and writes NetCDF output. Model-shape override flags also exist on `forecast` for small synthetic fixtures and debugging, but the real upstream path should use the default `78 / 78 / 256` configuration unless the exported checkpoint says otherwise.

Supported production boundary:

- input mode: `era5`
- output format: `.nc`
- checkpoint format: exported `safetensors`
- logging: `tracing`

## End-to-End Workflow

1. Dry-run checkpoint export and inspect raw keys:

```bash
python3 tools/export_weights.py \
  --source /path/to/upstream.pkl \
  --out /tmp/weights.safetensors \
  --dump-keys \
  --emit-unmapped /tmp/unmapped.json \
  --emit-mapping-template /tmp/mapping-template.json \
  --dry-run
```

2. Fill in any unresolved mappings, then export the final checkpoint:

For the public upstream checkpoint in `rkeisler/keisler-2022`, the repo already includes a completed mapping file:

- `tools/weight_mapping.keisler_2022.json`

```bash
python3 tools/export_weights.py \
  --source /path/to/upstream.pkl \
  --out /path/to/data/weights.safetensors \
  --mapping-file tools/weight_mapping.keisler_2022.json
```

3. Validate the exported checkpoint strictly:

```bash
cargo run -p weathergraph-cli -- inspect-weights \
  --weights /path/to/data/weights.safetensors \
  --json \
  --strict
```

4. Export a one-step parity fixture from the upstream Python environment:

```bash
python3 tools/export_parity_fixture.py \
  --data-dir /path/to/data \
  --weights /path/to/data/weights.safetensors \
  --dataset /path/to/data/era5_input.nc \
  --init 2020-01-01T00:00:00Z \
  --out-dir tests/fixtures/parity/one_step
```

5. Run the Rust test suite. If `tests/fixtures/parity/one_step/manifest.json` and `tensors.safetensors` are present, the parity test runs automatically:

```bash
cargo test --workspace
```

6. Run the forecast CLI to produce NetCDF output:

```bash
cargo run -p weathergraph-cli -- forecast \
  --data-dir /path/to/data \
  --weights /path/to/data/weights.safetensors \
  --init 2020-01-01T00:00:00Z \
  --steps 4 \
  --input era5 \
  --out ./forecast.nc
```

7. Inspect the output contract:

- dimensions: `time`, `level`, `latitude`, `longitude`
- time values: 6-hour increments starting at `0`
- time units: `hours since <init>`
- time calendar: `standard`
- forecast variables:
  - `specific_humidity`
  - `temperature`
  - `u_component_of_wind`
  - `v_component_of_wind`
  - `vertical_velocity`
  - `geopotential`

## Logging

All user-visible logging goes through `tracing`. The default CLI level is `info`. The runner emits timing logs for artifact/model load, ERA5 input load, one-step execution, rollout completion, and NetCDF write. Override with `RUST_LOG`, for example:

```bash
RUST_LOG=debug cargo run -p weathergraph-cli -- inspect-artifacts --data-dir /path/to/data
```

## Performance Workflow

Use the real parity fixture as the optimization gate:

```bash
cargo test -p weathergraph-core --test parity_fixture -- --nocapture
```

Use the real forecast path as the end-to-end runtime check:

```bash
RUST_LOG=info cargo run -p weathergraph-cli -- forecast \
  --data-dir /path/to/data \
  --weights /path/to/data/weights.safetensors \
  --init 2020-01-01T00:00:00Z \
  --steps 1 \
  --input era5 \
  --out ./forecast.nc
```

The current CPU baseline for the committed one-step parity fixture is about 59 seconds. Any optimization that improves runtime but breaks the fixture tolerance should be rejected.

## Development

Format, lint, and test:

```bash
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace
python3 -m unittest discover -s tools/tests
```

## Testing

The repo includes:

- unit tests for `.npz.gz` loading
- unit tests for geometry counts
- unit tests for gather/scatter tensor helpers
- unit tests for model loading and checkpoint inspection
- CLI integration tests for artifact inspection, geometry inspection, weight inspection, and NetCDF forecast output
- a gated one-step parity fixture test

The parity test in `crates/weathergraph-core/tests/parity_fixture.rs` executes automatically when the real exported fixture is present at `tests/fixtures/parity/one_step/`.

## Current Limitations

- `opendata` is still rejected with a clear runtime error.
- The Rust checkpoint contract is strict by design; missing required tensors, dtype mismatches, or shape mismatches fail inspection and loading.
- CPU performance is still dominated by the parity-safe model path, especially manual layer normalization.
