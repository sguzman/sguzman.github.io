+++
title = "voltlane README"
description = "README mirror for voltlane"
draft = false
+++

[Repository](https://github.com/sguzman/voltlane) | [DeepWiki](https://deepwiki.com/sguzman/voltlane/)

# Voltlane

Voltlane is a Rust-first FL-style/chiptune composition prototype built with:

- `voltlane-core` (Rust): project model, timeline engine, export pipeline, parity tooling, and tracing.
- `src-tauri` (Rust/Tauri): desktop shell and typed command bridge to the core.
- `ui` (React + TypeScript + CSS): lightweight visual playlist/mixer control surface.

The current implementation now spans Milestone A/B plus core audio-clip workflow slices: project lifecycle, transport controls, colored tracks, clip creation/editing, audio import/indexing, exports, parity harness, logging, and docs.

## Features Implemented

- Rust domain model for projects, tracks, clips, effects, transport, and notes.
- Command-style engine API for:
  - project create/load/save/autosave
  - track add/reorder/hide/mute/enable
  - clip add/move
  - audio asset scan/decode/analyze/import
  - audio clip trim/fade/reverse/stretch/gain/pan editing
  - effect attachment
  - playback + loop control
- Export pipeline:
  - MIDI (`.mid`) via `midly`
  - WAV (`.wav`) via deterministic renderer + `hound`
  - MP3 (`.mp3`) via `ffmpeg` sidecar invocation
  - Stem WAV export (`stem_wav`) with per-track files
- Extensive structured logging with `tracing` in core and bridge.
- Tauri commands for all major operations (`project/track/clip/export/parity`).
- React UI for playlist lanes, track controls, transport, and parity panel.
- Clip editor panel for MIDI/pattern note editing (add/remove/update notes, quantize, transpose).
- Interactive piano roll editing for MIDI clips (drag + resize + snap).
- Tracker grid editor for chip pattern clips (row/effect editing with pattern-note regeneration).
- Chip macro editor lanes for pattern clips (`arpeggio`, `env`, `duty`) with loop metadata.
- Source-chip-aware backend rendering pipeline (`gameboy_apu`, `nes/2a03`, `sn76489/psg`, generic fallback).
- Built-in insert FX DSP in the core renderer (`eq`, `compressor`, `reverb`, `delay`, `limiter`, `bitcrusher`).
- Export render-mode selection (`offline` or `realtime`) from UI through Rust core.
- Automation clip editing with parameter-ID targeting and point tables.
- Mixer routing controls: track gain/pan, bus output assignment, and send lanes.
- Audio browser panel for asset indexing, waveform preview metadata, and direct import into audio tracks.
- Deterministic parity harness:
  - golden baseline test
  - CLI parity report generation

## Repository Layout

- `Cargo.toml`: Rust workspace root
- `crates/voltlane-core`: core engine/domain/export/parity modules
- `crates/voltlane-core/tests`: export/parity integration tests + golden baseline
- `src-tauri`: Tauri host and command bridge
- `ui`: React/TypeScript frontend
- `scripts/run_parity_harness.sh`: parity harness runner
- `ROADMAP.md`: progress tracker with checkboxes
- `src-tauri/res/soundfonts`: bundled SoundFonts

## Build and Run

## Runtime Config

The app reads runtime settings from:

- `voltlane.config.toml`

This file contains app parameters (mode, defaults, diagnostics, audio scan/cache behavior, paths, Wayland behavior, export binary path).

Current mode is set to:

- `mode = "dev"`

In `dev` mode, each app launch writes timestamped Rust tracing logs into:

- `logs/`

MIDI SoundFont defaults are configured here too:

- `midi.default_soundfont_path = "src-tauri/res/soundfonts/piano.sf2"`
- `midi.default_soundfont_license_path = "src-tauri/res/soundfonts/piano.sf2.LICENSE"`

Audio workflow defaults are configured here:

- `audio.asset_directories = ["data/audio-library"]`
- `audio.waveform_cache_dir = "data/waveform-cache"`
- `audio.analysis_bucket_size = 1024`

Export defaults are configured here:

- `export.ffmpeg_binary = "ffmpeg"`
- `export.default_render_mode = "offline"`
- `export.stems_output_dir_name = "stems"`

### Install dependencies

```bash
pnpm install
```

### Rust checks/tests

```bash
cargo check -p voltlane-core
cargo check -p voltlane-tauri
cargo test -p voltlane-core
cargo test -p voltlane-core --test project_corruption_prop
```

### Frontend build

```bash
pnpm --dir ui run build
```

### Run desktop app (dev)

```bash
pnpm run tauri:dev
# or
cargo tauri dev
```

### Wayland note (Linux)

Voltlane reads Wayland compatibility toggles from `voltlane.config.toml`.
With the current config it auto-applies:

- `WEBKIT_DISABLE_DMABUF_RENDERER=1`

when `WAYLAND_DISPLAY` is present.

## Logging

- Core tracing is initialized at runtime with session UUID and per-run timestamped JSON log files.
- Tauri plugin log forwards logs to stdout, log dir, and webview stream.
- Log filtering and sink behavior are configured in `voltlane.config.toml`.

## Crash Recovery

- On startup, Voltlane checks for the latest autosave file in the configured autosave directory.
- If an autosave is found, the UI shows a restore prompt with timestamp and supports one-click restore.

## Parity Harness

### Golden parity test

```bash
cargo test -p voltlane-core parity_report_matches_golden_baseline
```

### Generate parity report artifact

```bash
cargo run -p voltlane-core --bin voltlane-cli -- parity-report --output data/parity/report.json
```

### One-shot runner

```bash
./scripts/run_parity_harness.sh
```

### Performance regression suite

```bash
./scripts/run_perf_regression.sh
```

Golden baseline lives at:

- `crates/voltlane-core/tests/fixtures/parity_baseline.json`

To refresh it intentionally:

```bash
UPDATE_PARITY_BASELINE=1 cargo test -p voltlane-core parity_report_matches_golden_baseline
```

## Export Notes

- MP3 export requires `ffmpeg` in `PATH` unless you pass a specific binary path through Tauri command input.
- WAV, MIDI, and per-track stem WAV exports are Rust-native in this implementation.
- Stem output files are named like `01_track_name.wav`.

## CI

- Workflow file: `.github/workflows/ci.yml`
- CI runs `fmt`, `clippy`, workspace tests, UI build, and `cargo audit`.

## SoundFont Asset

- Integrated SoundFont: `src-tauri/res/soundfonts/piano.sf2`
- SoundFont package readme: `src-tauri/res/soundfonts/README.md`
- License record file: `src-tauri/res/soundfonts/piano.sf2.LICENSE`
- License metadata indicates TimGM6mb is GPL-2 (see license file for full details).

## Status

This is still a prototype, but the current roadmap phases are now checked end-to-end in code and tests.
