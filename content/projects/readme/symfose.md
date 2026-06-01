+++
title = "symfose README"
description = "README mirror for symfose"
draft = false
+++

[Repository](https://github.com/sguzman/symfose) | [DeepWiki](https://deepwiki.com/sguzman/symfose/)

# Symfose

Symfose is a Rust desktop app for playing virtual instruments from your keyboard, starting with piano.

It is inspired by browser virtual pianos, but aimed at structured practice and performance scoring.

## Project Ambition

Symfose is being built to support:

- real-time instrument play from configurable keyboard mappings
- playable song charts with tempo-aware timing
- score mode (accuracy + streak + grading)
- timed/challenge modes
- ergonomic mapping optimization per song:
  - avoids same-finger conflicts
  - minimizes awkward reaches
  - supports multi-key chords without relying on shift-heavy combos
- instrument profiles so multiple instruments can be added later without changing core gameplay

## What Works Today

- desktop GUI app (`iced`)
- playable keyboard piano in a native window
- horizontal white/black piano key layout with horizontal scrolling when needed
- reactive key visuals for physical keypresses, mouse clicks, and autoplay touches
- realistic piano synthesis through SoundFont (`SF2`) rendering via `rustysynth`
- song library loaded from `res/songs/*.toml`
- MIDI song ingestion from `res/assets/midi/*.mid|*.midi`
- source processing cache in `.cache/songs/v2/` for fast warm startups
- song key/timing lane rendered above the keyboard (virtual-piano style)
- three song modes:
  - `Timer`: metronome + note/timing scoring
  - `Tutorial`: step-by-step progression with configurable strictness
  - `Auto Play`: automatic playback with key reactivity
- live volume slider in GUI (runtime gain adjustment)
- live instrument profile switching in GUI (e.g., piano and acoustic guitar)
- rich tracing logs to console and rolling files

## Quick Start

```bash
cargo run --release
```

To use a custom config:

```bash
SYMFOSE_CONFIG=path/to/symfose.toml cargo run --release
```

## SoundFont Setup

Bundled by default:

- `res/soundfonts/piano.sf2`
- license/attribution: `res/soundfonts/piano.sf2.LICENSE`

If this file is missing, Symfose tries common Linux paths:

- `/usr/share/sounds/sf2/FluidR3_GM.sf2`
- `/usr/share/sounds/sf2/TimGM6mb.sf2`
- `/usr/share/sounds/sf2/default-GM.sf2`
- `/usr/share/soundfonts/FluidR3_GM.sf2`
- `/usr/share/sf2/FluidR3_GM.sf2`

You can replace the bundled file with any compatible SF2 and adjust bank/preset in config.

## Controls (Default)

- Piano notes: generated from keyboard profile (home-row-first on ANSI 104-key), then overridden by explicit `keybindings`
- Piano mouse input: click white/black keys directly
- Quit: `esc` or `ctrl+c`
- Next song: `f1`
- Binding summary hint: `f2`
- Start selected song mode: `f5`
- Song search: filter by title, artist, id, and tags

## Configuration

Main runtime config:

- `config/symfose.toml`

Key audio settings:

- `audio.instrument`: active profile key
- `audio.master_volume`: global output gain
- `audio.note_duration_ms`: default keypress hold length
- `audio.release_duration_ms`: release tail rendered after note-off
- `audio.instrument_profiles.<name>`: per-instrument profile

Key song-library settings:

- `song_library.directory`: TOML songs directory
- `song_library.midi_directory`: MIDI drop folder (loader input)
- `song_library.schema_path`: TOML schema file path
- `song_library.cache_directory`: normalized song cache output

Key keyboard/gameplay settings:

- `keyboard.layout`: keyboard profile used for generated bindings (`ansi104`)
- `keyboard.use_layout_default_bindings`: generate broad non-shift bindings from the profile
- `gameplay.transpose_song_to_fit_bindings`: auto-octave-shift selected songs to maximize playable coverage
- `gameplay.warn_on_missing_song_notes`: show missing-note diagnostics in selected song pane/activity log
- `gameplay.optimize_bindings_for_song`: remap high-usage notes of current song to ergonomic keys

Example profile:

```toml
[audio]
instrument = "piano"
master_volume = 0.68
note_duration_ms = 680
release_duration_ms = 720
sample_rate_hz = 48000

[audio.instrument_profiles.piano]
engine = "soundfont"
soundfont_path = "res/soundfonts/piano.sf2"
bank = 0
preset = 0
channel = 0
maximum_polyphony = 128
enable_reverb_and_chorus = true
instrument_gain_multiplier = 1.35

[audio.instrument_profiles.acoustic_guitar]
engine = "soundfont"
soundfont_path = "res/soundfonts/piano.sf2"
bank = 0
preset = 24
channel = 0
maximum_polyphony = 96
enable_reverb_and_chorus = true
instrument_gain_multiplier = 1.1
```

## Song Format

Songs are TOML files in `res/songs/` with schema validation from:

- `res/songs/schema/song.schema.json`

Song files include:

- metadata (`id`, `title`, `artist`, `tempo_bpm`, difficulty, tags, etc.)
- sections (`start_beats`, `end_beats`, loop flags)
- timed events with:
  - `at_beats`
  - `duration_beats`
  - `notes` (MIDI note list/chords)
  - optional `velocity`
  - optional hand metadata/lyrics/accent flags

## Loader Cache

Symfose treats resource folders as loader inputs and normalizes source files into a cache:

- TOML source songs: `res/songs`
- MIDI source songs: `res/assets/midi`
- Cache root: `.cache/songs`
- Cache layout:
  - `.cache/songs/v2/toml/*.toml`
  - `.cache/songs/v2/midi/*.toml`

On startup, source files are fingerprinted (mtime + size). If unchanged, Symfose loads the cached normalized song instead of reparsing source.

MIDI imports also add directory-name tags from under `res/assets/midi/` (e.g. `game-midis`, `chrono_trigger`) to make search/filtering easier when filenames repeat across folders.

## Repository Layout

- `src/main.rs`: GUI state/update/view and keyboard routing
- `src/audio.rs`: SoundFont rendering + playback scheduling
- `src/input.rs`: key chord parsing and normalized bindings
- `src/config.rs`: config model, defaults, validation, load/create
- `src/songs.rs`: song model + loader/validator
- `config/symfose.toml`: runtime configuration
- `res/songs/`: song data + schema
- `res/soundfonts/`: local SoundFont assets

## Logging

Tracing is enabled throughout startup, input handling, audio rendering, and song playback.

- console logs: live run diagnostics
- file logs: `logs/` (rolling appender)
- config filter: `logging.filter` (default: `info`)

## Development

```bash
cargo fmt
cargo check
cargo test
```

## Roadmap

1. Score engine with timing windows and per-note grading
2. Timed challenge mode and fail/pass logic
3. Song playback overlays (guide notes / visual timeline)
4. Per-song instrument + binding presets
5. Ergonomic optimizer that auto-generates chord-friendly mappings
6. Additional instruments (strings, pads, synths) through profile expansion
