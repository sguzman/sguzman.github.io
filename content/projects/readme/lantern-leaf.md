+++
title = "lantern-leaf README"
description = "README mirror for lantern-leaf"
draft = false
+++

[Repository](https://github.com/sguzman/lantern-leaf) | [DeepWiki](https://deepwiki.com/sguzman/lantern-leaf/)

# LanternLeaf

Rust desktop reader for EPUB/TXT/Markdown with synchronized TTS playback, sentence highlighting, bookmark persistence, and a starter library flow (recent books + Calibre).

<p align="center">
  <img src="branding/mascot.png" alt="Pipwick mascot" width="220" />
</p>

## Branding

- Product name: `LanternLeaf`
- Mascot: `Pipwick` (chibi candle scholar)
- Brand palette source: `branding/colors.css`
- Mascot source image: `branding/mascot.png`
- Generated favicon set: `branding/favicon/`

## Current Project Status

This project is actively developed and currently supports:

- Reading flow with sentence-aware highlighting and click-to-play from sentence.
- TTS synthesis through Piper (`piper-rs`) with multi-process workers.
- Audio playback through `rodio`, with playback speed applied as post-processing (`sonic-rs-sys`).
- Text normalization and chunking pipeline for TTS quality and stability.
- Starter mode for opening local files, recent books, and Calibre-backed books.
- Per-book persistent config/bookmark/cache with content-hash-based cache directories.
- Ctrl+C safe quit handling with config/bookmark save before exit.

## Supported Source Formats

- `.epub`
- `.txt`
- `.md` / `.markdown`

Loading behavior:

- `.txt` is read directly.
- `.md` and `.epub` attempt a `pandoc` plain-text conversion path first.
- If `pandoc` conversion fails:
- `.md` falls back to raw markdown text.
- `.epub` falls back to native EPUB parsing (`epub` + `html2text`).

Image behavior:

- EPUB images are extracted and rendered in reading view.
- Markdown image links (`![alt](path)`) are resolved and rendered when local files exist.

## High-Level Features

- Starter mode with:
- Local path open input.
- Recent books panel (with cached cover thumbnails).
- Calibre browser panel (sortable/searchable).
- Reader mode with:
- Page navigation.
- Theme toggle (day/night).
- Text-only and pretty-text modes.
- Search panel (regex-based).
- TTS controls with sentence-level navigation.
- Settings panel and stats panel (mutually exclusive).

- TTS behavior:
- Play page from start.
- Play from highlighted sentence.
- Click any sentence to play from there.
- Sentence seek forward/backward.
- Auto-scroll and optional center-tracking.
- Jump to currently spoken sentence.

- Persistence:
- Per-book bookmark (`page`, sentence, scroll offset).
- Per-book UI/TTS config overrides.
- TTS WAV cache.
- Normalization cache.

## Architecture Overview

Top-level modules:

- `src/main.rs`: process startup, config load, path-mode vs starter-mode app launch, Ctrl+C signal flagging.
- `src/app/`: GUI state/update/view, subscriptions, reducers/effects.
- `src/epub_loader.rs`: source loading and image extraction.
- `src/pagination.rs`: pagination from sentence stream into page text.
- `src/text_utils.rs`: sentence splitting with abbreviation handling and oversized-comma-chain splitting.
- `src/normalizer.rs`: TTS normalization, sentence/page caching, display/audio index mapping, long-sentence chunking.
- `src/tts.rs`: TTS engine facade, worker pool orchestration, cache lookups, playback append/time-stretch.
- `src/tts_worker.rs`: `--tts-worker` subprocess protocol and synthesis execution.
- `src/cache.rs`: bookmark/config/cache paths, recent books, thumbnails.
- `src/config/`: typed config models, grouped TOML schema, defaults, parse/serialize.
- `src/calibre.rs`: Calibre catalog loading, caching, thumbnail hydration, export/materialization.

App update split (`src/app/update/`):

- `core/mod.rs`: subscription wiring (`Tick`, runtime events, signal polling).
- `core/reducer.rs`: message reducer and effect dispatch.
- `core/runtime.rs`: effect execution (save/load, quit, async tasks).
- `core/shortcuts.rs`: keybinding parsing/matching.
- `appearance.rs`: config mutations (theme, fonts, spacing, numeric edit input, window geometry).
- `navigation.rs`: page transitions and page-level state migration.
- `scroll.rs`: scroll tracking, bookmark persistence throttling, geometry-aware sentence targeting.
- `tts.rs`: user TTS actions and lifecycle glue.
- `tts/transitions.rs`: explicit TTS state transitions and mapping setup.
- `tts/effects.rs`: action-to-task/effect conversion.

## Runtime Flow

### 1) Startup

- If process receives `--tts-worker`, it runs worker mode and exits after protocol loop.
- Otherwise main app installs Ctrl+C handler, initializes tracing, loads `conf/config.toml`, and parses optional source path arg.

### 2) Starter Mode (no path arg)

- Opens starter UI (`run_app_starter`).
- Recent books list is loaded from cache metadata.
- Calibre list can load immediately if enabled in `conf/calibre.toml`.

### 3) Direct Book Mode (path arg)

- Source path is remembered in cache metadata.
- Per-book cached config override is loaded if present.
- Some fields are intentionally forced from base config to avoid stale per-book values:
- `log_level`
- `tts_threads`
- `tts_progress_log_interval_secs`
- all keybindings

- Bookmark is loaded if present.
- Source text and images are loaded.
- Reader app starts and restores page/sentence/scroll when possible.

### 4) Reading and TTS

- Page text is represented as sentence lists.
- TTS start request goes through transition logic:
- normalize + map display sentences to audio sentences.
- split initial batch vs append batch.
- synthesize/cache missing audio in worker pool.
- start playback with optional pause insertion.

- Highlight index is updated from playback timing ticks and mapping.
- Auto-scroll targets use geometry-aware estimates and guard bands to keep highlighted text visible.

## UI and Layout Behavior

### Top Controls

- Buttons include: `Previous`, `Next`, theme toggle, `Close Book`, settings toggle, stats toggle, plus optional controls (`Text Only`/`Pretty Text`, TTS toggle, search toggle).
- Top bar uses width planning (`src/app/topbar_layout.rs`) to hide lower-priority controls when width is tight.
- Control rows and TTS controls are fixed-height to avoid vertical text/button collapse.

### Text Modes

- `Pretty Text`: page sentence view with clickable spans and sentence highlight.
- `Text Only`: normalized TTS preview with clickable spans mapped back to display sentence indices.

### Settings Panel

- Font family/weight, line spacing, pause-after-sentence, lines-per-page, margins, word/letter spacing.
- Auto-scroll toggle and center-tracking toggle.
- Day/night highlight RGBA controls.
- Numeric setting labels can be clicked to edit directly in a text box.
- Numeric text input validates range/type and shows red border when invalid.
- While numeric input is active, mouse wheel adjusts value by setting-specific step.

### Stats Panel

- Mutually exclusive with settings panel.
- Includes:
- Page index
- TTS progress (3 decimals)
- page/book ETA
- words/sentences on page
- percent at page start/end
- words/sentences read through current page

### Search

- Regex-based sentence search within current page context.
- In text-only mode it searches normalized audio sentences.
- In pretty mode it searches display sentences.

## TTS, Normalization, and Quality Pipeline

### Playback Speed vs Synthesis

- Synthesis is generated by Piper workers.
- Playback speed (`tts_speed`) is applied later at playback append (`time_stretch`), not in synthesis generation.

### Normalization (`conf/normalizer.toml`)

- Cleans markdown/link/citation noise.
- Expands abbreviations/acronyms and supports custom pronunciation maps.
- Supports sentence-level or page-level normalization cache modes.
- Performs long-sentence chunking for TTS (`chunk_long_sentences`, char/word limits).

### Mapping Model

Normalization outputs:

- `audio_sentences`
- `display_to_audio`
- `audio_to_display`

These mappings are used to keep click-to-play, highlight, and auto-scroll aligned when one display sentence maps to multiple audio chunks.

### Oversized Sentence Handling

- TTS chunking limits are configurable (`max_audio_chars_per_chunk`, `max_audio_words_per_chunk`).
- Display sentence splitting also protects UI alignment for long comma/semicolon chains.
- This prevents giant single-span highlights and improves click/jump accuracy.

## Configuration Reference

Primary config file: `conf/config.toml`

### `[appearance]`

- `theme`: `day` or `night`
- `font_family`: enum from `FontFamily`
- `font_weight`: `light` / `normal` / `bold`
- `font_size`: `12..36` clamp
- `line_spacing`: `0.8..2.5` clamp
- `word_spacing`: `0..5`
- `letter_spacing`: `0..3`
- `lines_per_page`: `8..1000` clamp
- `margin_horizontal`: `0..1000`
- `margin_vertical`: `0..100`
- `day_highlight`: RGBA object
- `night_highlight`: RGBA object

Current defaults in code (`src/config/defaults.rs`):

- `font_size = 22`
- `lines_per_page = 700`

### `[window]`

- `width`, `height`
- optional `x`, `y`

Window values are clamped and persisted.

### `[reading_behavior]`

- `pause_after_sentence`: `0.0..2.0`, slider step `0.01`
- `auto_scroll_tts`: bool
- `center_spoken_sentence`: bool

### `[ui]`

- `show_tts`: bool
- `show_settings`: bool

### `[logging]`

- `log_level`: `trace|debug|info|warn|error`

### `[tts]`

- `tts_model_path`: Piper model path (`.onnx`)
- `tts_espeak_path`: root path for eSpeak data
- `tts_speed`: playback speed (`0.1..3.0`)
- `tts_volume`: `0.0..2.0`
- `tts_threads`: worker process count (min `1`)
- `tts_progress_log_interval_secs`: `0.1..60.0`

### `[keybindings]`

Defaults:

- `toggle_play_pause = "space"`
- `safe_quit = "q"`
- `next_sentence = "f"`
- `prev_sentence = "s"`
- `repeat_sentence = "r"`
- `toggle_search = "ctrl+f"`
- `toggle_settings = "ctrl+t"`
- `toggle_stats = "ctrl+g"`
- `toggle_tts = "ctrl+y"`

Notes:

- Shortcuts are normalized to lowercase.
- `spacebar` alias is accepted for `space`.
- Extra unexpected modifiers cause a mismatch.

## Normalizer Config Reference

File: `conf/normalizer.toml`

Important keys:

- `enabled`
- `mode = "sentence" | "page"`
- whitespace cleanup toggles
- markdown/link cleanup toggles
- citation/bracket cleanup toggles
- `chunk_long_sentences`
- `max_audio_chars_per_chunk`
- `max_audio_words_per_chunk`
- `min_sentence_chars`
- `require_alphanumeric`
- replacement maps and token drops
- acronym expansion and letter sounds
- pronunciation controls:
- year mode
- brand map
- custom pronunciations

## Calibre Integration

File: `conf/calibre.toml`

Capabilities:

- load catalog from Calibre targets
- configurable columns and extension filter
- cached catalog with TTL
- thumbnail prefetch/cache
- local materialization/export for selected books

If disabled, starter UI still works for direct path and recent books.

## Cache Layout and Persistence

Root cache: `.cache/`

Per source (content-hash dir): `.cache/<source-content-sha256>/`

- `bookmark.toml`: page/sentence/scroll
- `config.toml`: per-book settings
- `source-path.txt`: canonical source path hint (for recent books)
- `tts/tts-<hash>.wav`: synthesized audio cache
- `normalized/`: normalization caches
- `s-<sentence-hash>-<config-hash>.toml` (sentence mode)
- `p<page>-<source-hash>-<config-hash>.toml` (page mode)
- `thumbs/cover-thumb.jpg`: recent-book cover thumbnail

Cache key notes:

- TTS WAV key includes model path + normalized sentence text.
- Normalization cache keys include normalization config hash.
- Old cache entries are not auto-pruned.

## Build and Run

### Build

```bash
cargo build --release
```

### Run in starter mode

```bash
cargo run --release
```

### Run with a specific book

```bash
cargo run --release -- /path/to/book.epub
```

## Requirements

Required:

- Rust toolchain
- C/C++ build toolchain (`cc`, linker, `clang` for bindgen toolchains)
- `cmake`
- ALSA runtime/dev (`libasound`)
- Piper voice model (`.onnx` + matching `.onnx.json`)
- eSpeak data directory

Recommended:

- `pandoc` for robust non-EPUB/plain conversion pipeline

Project-specific notes:

- `espeak-rs-sys` is patched to vendored path in `Cargo.toml`.
- `.cargo/config.toml` sets `CMAKE_ARGS = "-DUSE_LIBPCAUDIO=OFF"`.

## Signal Handling and Safe Exit

- Ctrl+C sets an atomic flag from signal handler.
- App polls system signals on subscription interval (`120ms`).
- On signal, app dispatches safe quit effect:
- save per-book config
- persist bookmark
- stop playback
- exit

## Troubleshooting

### `espeak-rs-sys` transmute warnings

- Warnings from generated bindgen output are non-fatal.

### Vulkan `Unrecognized present mode ...`

- Usually driver/backend informational (`wgpu-hal`).

### Missing/failed pandoc conversion

- Reader attempts fallback paths for `.md` and `.epub`.
- For non-EPUB formats beyond supported text/markdown, install/fix pandoc or use supported formats.

### Cache confusion after normalization changes

- Normalization changes should generate new normalized cache keys.
- If you want a clean slate, remove relevant per-book cache directories under `.cache/`.

## Dependency Compatibility Status

- Current checked stack is stable with `piper-rs = 0.1.9` and `ort = 2.0.0-rc.9` in lockfile.
- A full blanket `cargo update` currently pulls `ort/ort-sys` newer RCs and breaks `piper-rs` compile due upstream incompatibility.
- Use targeted updates only until upstream versions align.

## Development

Useful commands:

```bash
cargo check
cargo test
cargo fmt --all
cargo clippy --all-targets --all-features
```

When editing config schema:

- update `src/config/models.rs`
- update `src/config/tables.rs`
- update `src/config/defaults.rs`
- update `conf/config.toml` sample
- update README config reference

When editing TTS worker protocol:

- keep `src/tts.rs` request/response structures aligned with `src/tts_worker.rs`

## License

See `LICENSE`.
